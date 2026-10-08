// #24 multislider / rangeslider (+ plain slider for the record): cursor must follow affordance ("does a click move a thumb?"),
// hover ring only on the thumb under the pointer. Every click test runs on a freshly loaded page. Output: red24.json + red24-*.png.
// Usage: node red24.js [pages...]   (default: multislider rangeslider slider)
const L = require('./lib');
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['multislider', 'rangeslider', 'slider'];
const WORKERS = 6;
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };

// widgets on a page: root rect, union region (root ∪ inner/track ∪ marks), thumbs (rect + id)
async function widgets(page, pg) {
  return page.evaluate((pg) => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const roots = [...document.querySelectorAll('.z-' + pg)].filter(n => pg !== 'slider' || n.querySelector('.z-slider-button'));
    return roots.map((n, i) => {
      const w = zk.$(n); const parts = [n, n.querySelector('.z-' + pg + '-inner'), n.querySelector('.z-' + pg + '-track'), n.querySelector('.z-' + pg + '-marks'), n.querySelector('.z-slider-center')].filter(Boolean).map(R);
      const u = { l: Math.min(...parts.map(p => p.l)), t: Math.min(...parts.map(p => p.t)), r: Math.max(...parts.map(p => p.r)), b: Math.max(...parts.map(p => p.b)) };
      const thumbs = [...n.querySelectorAll('.z-sliderbuttons-button, .z-slider-button')].map(b => ({ id: b.id, rect: R(b), pos: b.style.left || b.style.top }));
      const track = n.querySelector('.z-' + pg + '-track') || n.querySelector('.z-slider-center');
      return { i, cls: n.className, vertical: n.classList.contains('z-' + pg + '-vertical'), disabled: !!w._disabled, root: R(n), region: u, track: track ? R(track) : null, thumbs, pageY: window.scrollY };
    });
  }, pg);
}
const thumbPos = (page, pg, wi) => page.evaluate(([pg, wi]) => { const n = [...document.querySelectorAll('.z-' + pg)].filter(n => pg !== 'slider' || n.querySelector('.z-slider-button'))[wi]; return [...n.querySelectorAll('.z-sliderbuttons-button, .z-slider-button')].map(b => (b.style.left || b.style.top) + '|' + b.getBoundingClientRect().left.toFixed(1) + ',' + b.getBoundingClientRect().top.toFixed(1)); }, [pg, wi]);
const cursorAt = (page, x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { cursor: e ? getComputedStyle(e).cursor : null, el: e ? e.tagName + '.' + e.className.split(' ').slice(0, 2).join('.') : null, id: e && e.id }; }, [x, y]);
const inRect = (p, r) => p.x >= r.l && p.x < r.r && p.y >= r.t && p.y < r.b;

function gridPoints(w) {
  const pts = []; const g = w.region; const key = new Set();
  const add = (x, y, kind) => { x = +x.toFixed(1); y = +y.toFixed(1); const k = x + ',' + y; if (key.has(k)) return; key.add(k); pts.push({ x, y, kind }); };
  for (let y = g.t + 2; y <= g.b - 2; y += 8) for (let x = g.l + 2; x <= g.r - 2; x += 8) add(x, y, 'grid');
  if (w.track) { const t = w.track; if (!w.vertical) { const yc = (t.t + t.b) / 2; for (let x = t.l + 1; x <= t.r - 1; x += 8) { add(x, yc, 'track'); add(x, w.root.t + 2, 'padTop'); add(x, w.root.b - 2, 'padBottom'); } } else { const xc = (t.l + t.r) / 2; for (let y = t.t + 1; y <= t.b - 1; y += 8) { add(xc, y, 'track'); add(w.root.l + 2, y, 'padLeft'); add(w.root.r - 2, y, 'padRight'); } } }
  return pts;
}

async function openScrolled(browser, pg, w) {
  const { ctx, page } = await L.open(browser, pg + '.zul');
  await page.evaluate(y => window.scrollTo(0, y), w.scrollTo); await page.waitForTimeout(120);
  return { ctx, page };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'cursor = computed cursor of elementFromPoint; "moves" = any thumb style/rect changed after a click on a freshly loaded page; hover ring = annulus r 10..18px around the thumb centre, ΔE CIE76 on means', pages: {} };
  for (const pg of PAGES) {
    const { ctx, page } = await L.open(browser, pg + '.zul');
    const ws = await widgets(page, pg);
    await ctx.close();
    const P = { widgets: [] };
    for (const w0 of ws) {
      // scroll so the widget sits at y≈150 on the fresh page, then re-measure
      const scrollTo = Math.max(0, w0.root.t - 150);
      const { ctx, page } = await L.open(browser, pg + '.zul');
      await page.evaluate(y => window.scrollTo(0, y), scrollTo); await page.waitForTimeout(120);
      const w = (await widgets(page, pg))[w0.i]; w.scrollTo = scrollTo;
      const W = { i: w.i, cls: w.cls, vertical: w.vertical, disabled: w.disabled, root: w.root, region: w.region, track: w.track, thumbs: w.thumbs };
      // ---- hover rings (rest vs hover thumb[0] vs hover track point away from thumbs)
      const clip = { x: w.region.l - 24, y: w.region.t - 24, width: w.region.r - w.region.l + 48, height: w.region.b - w.region.t + 48 };
      const ringOf = (S, th) => { const c = { x: (th.rect.l + th.rect.r) / 2, y: (th.rect.t + th.rect.b) / 2 }; return mean(S.rect(c.x - 19, c.x + 19, c.y - 19, c.y + 19).filter(p => { const d = Math.hypot(p.x + 0.25 - c.x, p.y + 0.25 - c.y); return d >= 10 && d <= 18; })); };
      const S0 = await L.shot(page, `red24-${pg}-w${w.i}-rest.png`, clip);
      const rings0 = w.thumbs.map(th => ringOf(S0, th));
      const t0 = w.thumbs[0]; const c0 = { x: (t0.rect.l + t0.rect.r) / 2, y: (t0.rect.t + t0.rect.b) / 2 };
      await page.mouse.move(c0.x, c0.y); await page.waitForTimeout(250);
      const S1 = await L.shot(page, `red24-${pg}-w${w.i}-hoverThumb0.png`, clip);
      W.hoverThumb0 = { cursor: await cursorAt(page, c0.x, c0.y), ringDE: w.thumbs.map((th, i) => +L.dE(ringOf(S1, th), rings0[i]).toFixed(2)) };
      await page.mouse.down(); await page.waitForTimeout(150);
      W.mouseDownThumb0 = { cursor: await cursorAt(page, c0.x, c0.y), bodyCursor: await page.evaluate(() => getComputedStyle(document.body).cursor), bodyClass: await page.evaluate(() => document.body.className) };
      await page.mouse.up(); await page.waitForTimeout(150);
      // track point away from every thumb (≥ 24px from all thumb centres)
      if (w.track) {
        const cand = []; if (!w.vertical) { for (let x = w.track.l + 4; x < w.track.r - 4; x += 2) cand.push({ x, y: (w.track.t + w.track.b) / 2 }); } else { for (let y = w.track.t + 4; y < w.track.b - 4; y += 2) cand.push({ x: (w.track.l + w.track.r) / 2, y }); }
        const far = cand.filter(p => w.thumbs.every(th => Math.hypot(p.x - (th.rect.l + th.rect.r) / 2, p.y - (th.rect.t + th.rect.b) / 2) >= 30));
        const tp = far[Math.floor(far.length * 0.75)] || far[far.length - 1];
        if (tp) { await page.mouse.move(tp.x, tp.y); await page.waitForTimeout(250); const S2 = await L.shot(page, `red24-${pg}-w${w.i}-hoverTrack.png`, clip); W.hoverTrack = { point: tp, cursor: await cursorAt(page, tp.x, tp.y), ringDE: w.thumbs.map((th, i) => +L.dE(ringOf(S2, th), rings0[i]).toFixed(2)) }; }
      }
      // ---- protection (b): thumb centre hit test
      W.thumbHit = []; for (const th of w.thumbs) { const c = { x: (th.rect.l + th.rect.r) / 2, y: (th.rect.t + th.rect.b) / 2 }; const h = await cursorAt(page, c.x, c.y); W.thumbHit.push({ id: th.id, hit: h.id, ok: h.id === th.id, cursor: h.cursor }); }
      await ctx.close();
      // ---- protection (c): drag thumb[0] by 40px on a fresh page
      if (!w.disabled) {
        const { ctx, page } = await openScrolled(browser, pg, w);
        const before = await page.evaluate(([pg, wi]) => { const n = [...document.querySelectorAll('.z-' + pg)].filter(n => pg !== 'slider' || n.querySelector('.z-slider-button'))[wi]; const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(1)); }; const a = n.querySelector('.z-sliderbuttons-area, .z-slider-area'); const b = n.querySelector('.z-sliderbuttons-button, .z-slider-button'); return { area: a ? R(a) : null, thumb: R(b), pos: b.style.left || b.style.top }; }, [pg, w.i]);
        await page.mouse.move(c0.x, c0.y); await page.mouse.down(); await page.mouse.move(c0.x + (w.vertical ? 0 : 40), c0.y + (w.vertical ? 40 : 0), { steps: 5 }); await page.waitForTimeout(100); await page.mouse.up(); await L.settle(page);
        const after = await page.evaluate(([pg, wi]) => { const n = [...document.querySelectorAll('.z-' + pg)].filter(n => pg !== 'slider' || n.querySelector('.z-slider-button'))[wi]; const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(1)); }; const a = n.querySelector('.z-sliderbuttons-area, .z-slider-area'); const b = n.querySelector('.z-sliderbuttons-button, .z-slider-button'); return { area: a ? R(a) : null, thumb: R(b), pos: b.style.left || b.style.top }; }, [pg, w.i]);
        W.drag40 = { before, after, thumbMoved: before.pos !== after.pos, areaChanged: JSON.stringify(before.area) !== JSON.stringify(after.area) };
        await ctx.close();
      }
      // ---- click grid (disabled widgets: cursor only, no click)
      const pts = gridPoints(w);
      const results = new Array(pts.length);
      const queue = pts.map((p, i) => i);
      const worker = async () => {
        const { ctx, page } = await openScrolled(browser, pg, w);
        while (queue.length) {
          const i = queue.shift(); const p = pts[i];
          const cur = await cursorAt(page, p.x, p.y);
          let moved = null, posBefore = null, posAfter = null;
          if (!w.disabled) {
            posBefore = await thumbPos(page, pg, w.i);
            await page.mouse.click(p.x, p.y); await page.waitForTimeout(250);
            posAfter = await thumbPos(page, pg, w.i);
            moved = posBefore.some((v, k) => v !== posAfter[k]);
            // fresh page for the next point
            await page.goto(L.BASE + '/' + pg + '.zul', { waitUntil: 'load' });
            await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading, null, { timeout: 15000 }).catch(() => {});
            await page.evaluate(y => window.scrollTo(0, y), w.scrollTo); await page.mouse.move(2, 2); await page.waitForTimeout(120);
          }
          const onThumb = w.thumbs.find(th => inRect(p, th.rect));
          results[i] = { ...p, cursor: cur.cursor, el: cur.el, onThumb: onThumb ? onThumb.id : null, moved };
        }
        await ctx.close();
      };
      await Promise.all(Array.from({ length: w.disabled ? 1 : WORKERS }, worker));
      W.points = results;
      const cat = r => r.onThumb ? 'thumb' : r.moved ? 'moves' : (r.moved === false ? 'noMove' : 'disabled');
      W.summary = {}; for (const r of results) { const c = cat(r); W.summary[c] = W.summary[c] || {}; W.summary[c][r.cursor] = (W.summary[c][r.cursor] || 0) + 1; }
      W.noMove = results.filter(r => cat(r) === 'noMove');
      W.noMoveNotDefault = W.noMove.filter(r => !['default', 'auto'].includes(r.cursor));
      W.byKindNoMove = {}; for (const r of W.noMove) { W.byKindNoMove[r.kind] = W.byKindNoMove[r.kind] || { n: 0, cursors: {} }; W.byKindNoMove[r.kind].n++; W.byKindNoMove[r.kind].cursors[r.cursor] = (W.byKindNoMove[r.kind].cursors[r.cursor] || 0) + 1; }
      W.byKindMoves = {}; for (const r of results.filter(r => cat(r) === 'moves')) { W.byKindMoves[r.kind] = (W.byKindMoves[r.kind] || 0) + 1; }
      W.elNoMove = {}; for (const r of W.noMove) W.elNoMove[r.el] = (W.elNoMove[r.el] || 0) + 1;
      W.elMoves = {}; for (const r of results.filter(r => cat(r) === 'moves')) W.elMoves[r.el] = (W.elMoves[r.el] || 0) + 1;
      P.widgets.push(W);
      console.log(pg, 'w' + w.i, w.cls, w.disabled ? 'DISABLED' : '', 'points', pts.length, 'summary', JSON.stringify(W.summary), 'noMove', W.noMove.length, 'noMove∧!default', W.noMoveNotDefault.length, 'kinds', JSON.stringify(W.byKindNoMove), 'moves', JSON.stringify(W.byKindMoves), 'elNoMove', JSON.stringify(W.elNoMove), 'elMoves', JSON.stringify(W.elMoves));
      console.log('   hoverThumb0', JSON.stringify(W.hoverThumb0), 'mouseDown', JSON.stringify(W.mouseDownThumb0), 'hoverTrack', JSON.stringify(W.hoverTrack), 'thumbHit', JSON.stringify(W.thumbHit.map(h => h.ok + ':' + h.cursor)), 'drag40', JSON.stringify(W.drag40));
      L.save(`red24-${pg}.json`, P);
    }
    out.pages[pg] = P;
  }
  await browser.close();
  L.save('red24' + (process.argv.length > 2 ? '-' + PAGES.join('-') : '') + '.json', out);
})().catch(e => { console.error(e); process.exit(1); });
