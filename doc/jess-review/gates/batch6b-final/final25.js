// #25 slider slidetip alignment: mousedown on the thumb, drag, do NOT release; measure #zul_slidetip vs thumb, and the text ink inside the tip.
// Also measures whether the offset depends on the tip width (value 5 vs 100). Output: red25.json + final25-*.png.
const L = require('./lib');

async function sliders(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    return [...document.querySelectorAll('.z-slider')].filter(n => n.querySelector('.z-slider-button')).map((n, i) => { const w = zk.$(n); return { i, cls: n.className, mold: w._mold, vertical: n.classList.contains('z-slider-vertical'), root: R(n), btn: R(n.querySelector('.z-slider-button')), max: w._maxpos, min: w._minpos, curpos: w._curpos }; });
  });
}
async function tip(page, idx) {
  return page.evaluate((idx) => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const n = document.querySelectorAll('.z-slider')[idx]; const btn = n.querySelector('.z-slider-button');
    const t = document.getElementById('zul_slidetip'); if (!t) return { tip: null, btn: R(btn), curpos: zk.$(n)._curpos };
    const rg = document.createRange(); rg.selectNodeContents(t); const ink = R(rg);
    const s = getComputedStyle(t);
    return { tip: R(t), cls: t.className, text: t.textContent, ink, btn: R(btn), curpos: zk.$(n)._curpos, style: { color: s.color, fontSize: s.fontSize, fontFamily: s.fontFamily, padding: s.padding, lineHeight: s.lineHeight, position: s.position, transform: s.transform, left: t.style.left, top: t.style.top }, inViewport: R(t).l >= 0 && R(t).t >= 0 && R(t).r <= innerWidth && R(t).b <= innerHeight };
  }, idx);
}
const cx = r => (r.l + r.r) / 2, cy = r => (r.t + r.b) / 2;
// pixel ink of the tip text: pixels inside the tip rect (inset 1px) whose ΔE from the tip background (median of the inset rect) ≥ 20
function pixelInk(S, tiprect) {
  const px = S.rect(tiprect.l + 4, tiprect.r - 5, tiprect.t + 4, tiprect.b - 5); // inset past the 4px rounded corners
  const bg = L.median(px.map(p => p.c));
  const ink = px.filter(p => L.dE(p.c, bg) >= 20);
  if (!ink.length) return { bg, n: 0 };
  const xs = ink.map(p => p.x), ys = ink.map(p => p.y);
  return { bg, n: ink.length, l: Math.min(...xs), r: Math.max(...xs) + 0.5, t: Math.min(...ys), b: Math.max(...ys) + 0.5 };
}
function overlap(a, b) { return !(a.r <= b.l || b.r <= a.l || a.b <= b.t || b.b <= a.t); }

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'centres from getBoundingClientRect; ink = Range rect of the tip text node and pixel ink (ΔE ≥ 20 from tip background, rect inset 4px past the rounded corners); drag held at each sample, released at the end', sliders: [] };
  const { ctx, page } = await L.open(browser, 'slider.zul');
  const list = await sliders(page);
  await ctx.close();
  for (const s of list) {
    const rec = { idx: s.i, cls: s.cls, vertical: s.vertical, root: s.root, btn0: s.btn, samples: [] };
    const { ctx, page } = await L.open(browser, 'slider.zul');
    const bx = cx(s.btn), by = cy(s.btn);
    // travel per unit: (root length - btn size) / (max - min)
    const travel = (s.vertical ? s.root.h - s.btn.h : s.root.w - s.btn.w) / (s.max - s.min);
    await page.mouse.move(bx, by); await page.mouse.down();
    const targets = [{ name: 'drag10px', px: 10 }, { name: 'value5', px: 5 * travel }, { name: 'value50', px: 50 * travel }, { name: 'value100', px: (s.max - s.min) * travel }];
    for (const tg of targets) {
      const x = s.vertical ? bx : bx + tg.px, y = s.vertical ? by + tg.px : by;
      await page.mouse.move(x, y, { steps: 4 }); await page.waitForTimeout(150);
      const t = await tip(page, s.i);
      const clipR = t.tip ? { l: Math.min(t.tip.l, t.btn.l) - 8, t: Math.min(t.tip.t, t.btn.t) - 8, r: Math.max(t.tip.r, t.btn.r) + 8, b: Math.max(t.tip.b, t.btn.b) + 8 } : { l: t.btn.l - 30, t: t.btn.t - 40, r: t.btn.r + 30, b: t.btn.b + 10 };
      const S = await L.shot(page, `final25-s${s.i}-${tg.name}.png`, { x: clipR.l, y: clipR.t, width: clipR.r - clipR.l, height: clipR.b - clipR.t });
      const sm = { name: tg.name, mouse: { x, y }, curpos: t.curpos, tipExists: !!t.tip, tip: t.tip, text: t.text, btn: t.btn, ink: t.ink, style: t.style, inViewport: t.inViewport };
      if (t.tip) {
        sm.dxCenter = +(cx(t.tip) - cx(t.btn)).toFixed(2); sm.dyCenter = +(cy(t.tip) - cy(t.btn)).toFixed(2);
        sm.inkDx = +(cx(t.ink) - cx(t.tip)).toFixed(2); sm.inkDy = +(cy(t.ink) - cy(t.tip)).toFixed(2);
        const pi = pixelInk(S, t.tip); sm.pixelInk = pi; if (pi.n) { sm.pixInkDx = +((pi.l + pi.r) / 2 - cx(t.tip)).toFixed(2); sm.pixInkDy = +((pi.t + pi.b) / 2 - cy(t.tip)).toFixed(2); }
        sm.overlapsThumb = overlap(t.tip, t.btn);
        sm.gapToThumb = s.vertical ? +(t.btn.l - t.tip.r).toFixed(2) : +(t.btn.t - t.tip.b).toFixed(2);
      }
      rec.samples.push(sm);
    }
    await page.mouse.up(); await page.waitForTimeout(200);
    rec.afterRelease = await page.evaluate(() => ({ tipExists: !!document.getElementById('zul_slidetip') }));
    rec.afterRelease.curpos = (await sliders(page))[s.i].curpos;
    await ctx.close();
    out.sliders.push(rec);
  }
  await browser.close();
  L.save('final25.json', out);
  for (const r of out.sliders) { console.log('S' + r.idx, r.cls, 'root', JSON.stringify(r.root), 'btn0', JSON.stringify(r.btn0)); for (const m of r.samples) console.log('   ', m.name, 'curpos', m.curpos, 'text', JSON.stringify(m.text), 'tip', JSON.stringify(m.tip), 'btn', JSON.stringify(m.btn), 'dx', m.dxCenter, 'dy', m.dyCenter, 'inkDx', m.inkDx, 'inkDy', m.inkDy, 'pixInk', m.pixInkDx, m.pixInkDy, 'overlap', m.overlapsThumb, 'gap', m.gapToThumb, 'inVp', m.inViewport, m.style && (m.style.color + ' ' + m.style.fontSize + ' pad ' + m.style.padding + ' lh ' + m.style.lineHeight + ' ' + m.style.left + '/' + m.style.top)); console.log('    afterRelease', JSON.stringify(r.afterRelease)); }
})().catch(e => { console.error(e); process.exit(1); });
