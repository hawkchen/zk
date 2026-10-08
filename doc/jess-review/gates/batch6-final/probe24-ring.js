// #24 FINAL probe: the r10..18 annulus around a thumb contains the track line. Split the hover change into
// (a) annulus minus a ±4px band around the track centre line (= thumb halo only), (b) the track band itself away from thumbs, (c) the full annulus (red24 definition).
const L = require('./lib');
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['multislider', 'rangeslider'];
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };
(async () => {
  const browser = await L.chromium.launch(); const out = {};
  for (const pg of PAGES) {
    const { ctx, page } = await L.open(browser, pg + '.zul');
    const ws = await page.evaluate((pg) => { const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      return [...document.querySelectorAll('.z-' + pg)].map((n, i) => ({ i, cls: n.className, vertical: n.classList.contains('z-' + pg + '-vertical'), disabled: !!zk.$(n)._disabled, root: R(n), track: R(n.querySelector('.z-' + pg + '-track')), thumbs: [...n.querySelectorAll('.z-sliderbuttons-button')].map(b => R(b)), areas: [...n.querySelectorAll('.z-sliderbuttons-area')].map(R) })); }, pg);
    await ctx.close();
    out[pg] = [];
    for (const w of ws.filter(w => !w.disabled).slice(0, 3)) {
      const { ctx, page } = await L.open(browser, pg + '.zul');
      await page.evaluate(y => window.scrollTo(0, y), Math.max(0, w.root.t - 150)); await page.waitForTimeout(120);
      const W = await page.evaluate(([pg, i]) => { const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; const n = document.querySelectorAll('.z-' + pg)[i]; return { root: R(n), track: R(n.querySelector('.z-' + pg + '-track')), thumbs: [...n.querySelectorAll('.z-sliderbuttons-button')].map(b => R(b)) }; }, [pg, w.i]);
      const clip = { x: W.root.l - 24, y: W.root.t - 24, width: W.root.w + 48, height: W.root.h + 48 };
      const T = W.track; const tc = w.vertical ? (T.l + T.r) / 2 : (T.t + T.b) / 2;
      const inTrackBand = p => w.vertical ? Math.abs(p.x + 0.25 - tc) <= 4 : Math.abs(p.y + 0.25 - tc) <= 4;
      const ann = (S, th, excl) => { const c = { x: (th.l + th.r) / 2, y: (th.t + th.b) / 2 }; return mean(S.rect(c.x - 19, c.x + 19, c.y - 19, c.y + 19).filter(p => { const d = Math.hypot(p.x + 0.25 - c.x, p.y + 0.25 - c.y); return d >= 10 && d <= 18 && (!excl || !inTrackBand(p)); })); };
      const farThumb = p => W.thumbs.every(th => Math.hypot(p.x - (th.l + th.r) / 2, p.y - (th.t + th.b) / 2) >= 30);
      const trackBand = S => mean(S.rect(T.l, T.r - 1, T.t, T.b - 1).filter(p => farThumb(p)));
      const measure = async (file) => { const S = await L.shot(page, file, clip); return { halo: W.thumbs.map(th => ann(S, th, true)), full: W.thumbs.map(th => ann(S, th, false)), track: trackBand(S) }; };
      const rest = await measure(`probe24-${pg}-w${w.i}-rest.png`);
      const c0 = { x: (W.thumbs[0].l + W.thumbs[0].r) / 2, y: (W.thumbs[0].t + W.thumbs[0].b) / 2 };
      await page.mouse.move(c0.x, c0.y); await page.waitForTimeout(250);
      const hThumb = await measure(`probe24-${pg}-w${w.i}-hoverThumb0.png`);
      const cand = []; if (!w.vertical) { for (let x = T.l + 4; x < T.r - 4; x += 2) cand.push({ x, y: tc }); } else { for (let y = T.t + 4; y < T.b - 4; y += 2) cand.push({ x: tc, y }); }
      const far = cand.filter(farThumb); const tp = far[Math.floor(far.length * 0.75)] || far[far.length - 1];
      await page.mouse.move(tp.x, tp.y); await page.waitForTimeout(250);
      const hTrack = await measure(`probe24-${pg}-w${w.i}-hoverTrack.png`);
      const hitTrack = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { el: e.tagName + '.' + e.className.split(' ').slice(0, 2).join('.'), cursor: getComputedStyle(e).cursor }; }, [tp.x, tp.y]);
      // hover a padding point inside root but off the track (root top + 3)
      const pp = w.vertical ? { x: W.root.l + 3, y: tp.y } : { x: tp.x, y: W.root.t + 3 };
      await page.mouse.move(pp.x, pp.y); await page.waitForTimeout(250);
      const hPad = await measure(`probe24-${pg}-w${w.i}-hoverPad.png`);
      const hitPad = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { el: e.tagName + '.' + e.className.split(' ').slice(0, 2).join('.'), cursor: getComputedStyle(e).cursor }; }, [pp.x, pp.y]);
      const dE = (a, b) => a.map((v, i) => +L.dE(v, b[i]).toFixed(2));
      out[pg].push({ i: w.i, cls: w.cls, thumbs: W.thumbs.length, trackPoint: tp, hitTrack, padPoint: pp, hitPad, rest,
        hoverThumb0: { haloDE: dE(hThumb.halo, rest.halo), fullDE: dE(hThumb.full, rest.full), trackDE: +L.dE(hThumb.track, rest.track).toFixed(2), track: hThumb.track },
        hoverTrack: { haloDE: dE(hTrack.halo, rest.halo), fullDE: dE(hTrack.full, rest.full), trackDE: +L.dE(hTrack.track, rest.track).toFixed(2), track: hTrack.track },
        hoverPad: { haloDE: dE(hPad.halo, rest.halo), fullDE: dE(hPad.full, rest.full), trackDE: +L.dE(hPad.track, rest.track).toFixed(2), track: hPad.track } });
      await ctx.close();
    }
  }
  await browser.close(); L.save('probe24-ring.json', out);
  for (const [pg, arr] of Object.entries(out)) for (const w of arr) { console.log(pg, 'w' + w.i, w.cls, 'rest track', JSON.stringify(w.rest.track), 'hitTrack', JSON.stringify(w.hitTrack), 'hitPad', JSON.stringify(w.hitPad)); for (const s of ['hoverThumb0', 'hoverTrack', 'hoverPad']) console.log('   ', s, 'halo', JSON.stringify(w[s].haloDE), 'full', JSON.stringify(w[s].fullDE), 'trackDE', w[s].trackDE, 'track', JSON.stringify(w[s].track)); }
})().catch(e => { console.error(e); process.exit(1); });
