// Batch 7 FINAL probe: #29 protection (f) under forced-colors. final29.js found NO arrow ink (n=0) in the
// forced-colors context. This probe records what is painted in the control's right 40px under forced colors
// (per-pixel distinct colours, ink at a lower threshold), the ::picker-icon computed values that explain it
// (forced-color-adjust, background, mask, color) and a 4x zoom shot. Explanation only; the judgment stays pixel-based.
const L = require('./lib.js');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  for (const mode of ['forced', 'forced-emulateMedia', 'normal']) {
    const { ctx, page } = await L.open(browser, 'selectbox.zul', mode === 'forced' ? { forcedColors: 'active' } : {});
    if (mode === 'forced-emulateMedia') { await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(300); }
    const info = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const e = document.querySelector('.z-selectbox'); const cs = getComputedStyle(e);
      let pi = null; try { const p = getComputedStyle(e, '::picker-icon'); pi = { display: p.display, width: p.width, height: p.height, color: p.color, bg: p.backgroundColor, bgImage: p.backgroundImage.slice(0, 120), mask: (p.maskImage || p.webkitMaskImage || '').slice(0, 120), maskSize: p.maskSize, fca: p.forcedColorAdjust, content: p.content, fontSize: p.fontSize, transform: p.transform }; } catch (x) { pi = 'n/a ' + x.message; }
      return { matchesForced: matchMedia('(forced-colors: active)').matches, rect: R(e), cs: { fca: cs.forcedColorAdjust, color: cs.color, bg: cs.backgroundColor, border: cs.borderTopColor }, pickerIcon: pi }; }, R.toString());
    const b = info.rect;
    const S = await L.shot(page, `probe29-forced-${mode}.png`, { x: b.r - 44, y: b.t - 4, width: 48, height: b.h + 8 });
    const px = S.rect(b.r - 40, b.r - 4, b.t + 3, b.b - 4); const base = L.median(px.map(p => p.c));
    const colours = {}; for (const p of px) { const k = p.c.join(','); colours[k] = (colours[k] || 0) + 1; }
    const inkAt = thr => { const h = px.filter(p => L.dE(p.c, base) >= thr); if (!h.length) return { n: 0 }; const d = S.dpr; return { n: h.length, w: (Math.max(...h.map(p => p.dx)) - Math.min(...h.map(p => p.dx)) + 1) / d, h: (Math.max(...h.map(p => p.dy)) - Math.min(...h.map(p => p.dy)) + 1) / d, cy: (Math.min(...h.map(p => p.dy)) + Math.max(...h.map(p => p.dy)) + 1) / 2 / d, darkest: h.reduce((m, p) => (p.c[0] + p.c[1] + p.c[2] < m.c[0] + m.c[1] + m.c[2] ? p : m), h[0]).c }; };
    out[mode] = { info, base, distinctColours: Object.entries(colours).sort((a, b) => b[1] - a[1]).slice(0, 12), ink8: inkAt(8), ink3: inkAt(3), ink1: inkAt(1) };
    await ctx.close();
  }
  await browser.close();
  L.save('probe29-forced.json', out);
  for (const k of Object.keys(out)) console.log(k, JSON.stringify(out[k]));
})();
