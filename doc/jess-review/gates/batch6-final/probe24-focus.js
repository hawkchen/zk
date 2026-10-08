// #24 FINAL probe: confirm the 8.48 "hoverTrack" ring in red24.js comes from focus-within (a click on thumb0 precedes the track hover there), not from hover.
const L = require('./lib');
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };
(async () => {
  const browser = await L.chromium.launch(); const out = {};
  for (const pg of ['multislider', 'rangeslider']) {
    const { ctx, page } = await L.open(browser, pg + '.zul');
    const W = await page.evaluate((pg) => { const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; const n = document.querySelectorAll('.z-' + pg)[0]; return { root: R(n), thumbs: [...n.querySelectorAll('.z-sliderbuttons-button')].map(b => R(b)) }; }, pg);
    const clip = { x: W.root.l - 24, y: W.root.t - 24, width: W.root.w + 48, height: W.root.h + 48 };
    const ann = (S, th) => { const c = { x: (th.l + th.r) / 2, y: (th.t + th.b) / 2 }; return mean(S.rect(c.x - 19, c.x + 19, c.y - 19, c.y + 19).filter(p => { const d = Math.hypot(p.x + 0.25 - c.x, p.y + 0.25 - c.y); return d >= 10 && d <= 18; })); };
    const rest = (await L.shot(page, null, clip)); const r0 = W.thumbs.map(th => ann(rest, th));
    const c0 = { x: (W.thumbs[0].l + W.thumbs[0].r) / 2, y: (W.thumbs[0].t + W.thumbs[0].b) / 2 };
    await page.mouse.click(c0.x, c0.y); await page.waitForTimeout(200); await page.mouse.move(2, 2); await page.waitForTimeout(250);
    const S1 = await L.shot(page, `probe24-focus-${pg}.png`, clip);
    const st = await page.evaluate((pg) => { const n = document.querySelectorAll('.z-' + pg)[0]; return { focusWithin: n.matches(':focus-within'), active: document.activeElement && (document.activeElement.tagName + '.' + document.activeElement.className.split(' ').slice(0, 2).join('.')) }; }, pg);
    out[pg] = { afterClickThumb0PointerAway: { ringDE: W.thumbs.map((th, i) => +L.dE(ann(S1, th), r0[i]).toFixed(2)), state: st } };
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(250);
    const S2 = await L.shot(page, null, clip);
    out[pg].afterBlur = { ringDE: W.thumbs.map((th, i) => +L.dE(ann(S2, th), r0[i]).toFixed(2)) };
    await ctx.close();
  }
  await browser.close(); L.save('probe24-focus.json', out); console.log(JSON.stringify(out));
})().catch(e => { console.error(e); process.exit(1); });
