// Batch 7 FINAL probe (context for #29 protection (f)): under forced-colors, is the FAMILY chevron (combobox.zul
// combobox[0] .z-combobox-icon, bandbox.zul bandbox[0] button icon) painted at all? Same pixel method as final29.js
// (right 40px of the control, borders excluded, ink = dE(base) >= 8; also at >= 1). Explanation only.
const L = require('./lib.js');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
const EDGE = 3;
(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  for (const [pg, sel, iconSel] of [['combobox.zul', '.z-combobox', '.z-combobox-icon'], ['bandbox.zul', '.z-bandbox', '.z-bandbox-icon'], ['selectbox.zul', '.z-selectbox', null]]) {
    for (const mode of ['forced', 'normal']) {
      const { ctx, page } = await L.open(browser, pg, mode === 'forced' ? { forcedColors: 'active' } : {});
      const info = await page.evaluate(({ sel, iconSel, Rs }) => { const R = new Function('return ' + Rs)(); const e = document.querySelector(sel); const ic = iconSel && e.querySelector(iconSel);
        const cs = ic ? getComputedStyle(ic) : null; return { rect: R(e), icon: ic ? { cls: ic.className, rect: R(ic), bg: cs.backgroundColor, color: cs.color, mask: (cs.maskImage || '').slice(0, 100), bgImage: cs.backgroundImage.slice(0, 100), fca: cs.forcedColorAdjust } : null }; }, { sel, iconSel, Rs: R.toString() });
      const b = info.rect;
      const S = await L.shot(page, `probe29-forced-family-${pg.replace('.zul', '')}-${mode}.png`, { x: b.r - 44, y: b.t - 4, width: 48, height: b.h + 8 });
      const px = S.rect(b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE); const base = L.median(px.map(p => p.c));
      const inkAt = thr => { const h = px.filter(p => L.dE(p.c, base) >= thr); if (!h.length) return { n: 0 }; const d = S.dpr; return { n: h.length, w: (Math.max(...h.map(p => p.dx)) - Math.min(...h.map(p => p.dx)) + 1) / d, h: (Math.max(...h.map(p => p.dy)) - Math.min(...h.map(p => p.dy)) + 1) / d, darkest: h.reduce((m, p) => (p.c[0] + p.c[1] + p.c[2] < m.c[0] + m.c[1] + m.c[2] ? p : m), h[0]).c }; };
      out[pg + ':' + mode] = { info, base, ink8: inkAt(8), ink1: inkAt(1) };
      await ctx.close();
    }
  }
  await browser.close();
  L.save('probe29-forced-family.json', out);
  for (const k of Object.keys(out)) console.log(k, JSON.stringify({ icon: out[k].info.icon, base: out[k].base, ink8: out[k].ink8, ink1: out[k].ink1 }));
})();
