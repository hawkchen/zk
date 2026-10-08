// #19 combobutton disabled: arrow segment background must equal the label segment background.
// Pixel-only for the judgment (3x3 corner samples of each rect, away from glyphs, separator and rounded corners);
// computed styles are recorded only to explain WHY the arrow is darker (the plan asks RED to verify the stacking prediction).
const L = require('./lib');
const CB = { filled: 0, filledDisabled: 1, toolbar: 2, toolbarDisabled: 3 };

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'corner samples = 3x3 CSS px blocks inset 5px from each corner of the rect (arrow: left corners inset 5px from the separator); ΔE CIE76 on block means' };
  const { ctx, page } = await L.open(browser, 'combobutton.zul');
  for (const [key, idx] of Object.entries(CB)) {
    const g = await page.evaluate((idx) => {
      const n = document.querySelectorAll('.z-combobutton')[idx];
      const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      const c = n.querySelector('.z-combobutton-content'), b = n.querySelector('.z-combobutton-button'), t = n.querySelector('.z-combobutton-text'), i = n.querySelector('.z-combobutton-icon');
      const cs = e => { const s = getComputedStyle(e); return { bg: s.backgroundColor, bgImage: s.backgroundImage, color: s.color, opacity: s.opacity, position: s.position, border: s.borderLeftWidth + ' ' + s.borderLeftColor, mixBlend: s.mixBlendMode }; };
      const chain = []; let e = b; while (e && e !== document.body) { chain.push(e.className + ' bg=' + getComputedStyle(e).backgroundColor + ' op=' + getComputedStyle(e).opacity); e = e.parentElement; }
      return { cls: n.className, root: R(n), content: R(c), button: R(b), text: R(t), icon: R(i), rootCs: cs(n), contentCs: cs(c), buttonCs: cs(b), iconCs: cs(i), chain,
        tokens: { disabledContainer: getComputedStyle(document.documentElement).getPropertyValue('--zk-color-disabled-container').trim(), onDisabled: getComputedStyle(document.documentElement).getPropertyValue('--zk-color-on-disabled').trim() } };
    }, idx);
    const clip = { x: g.root.l - 6, y: g.root.t - 6, width: g.root.w + 12, height: g.root.h + 12 };
    const S = await L.shot(page, `final19-${key}.png`, clip);
    const block = (x, y) => { const px = S.rect(x, x + 2, y, y + 2); const m = [0, 0, 0]; for (const p of px) { m[0] += p.c[0]; m[1] += p.c[1]; m[2] += p.c[2]; } return m.map(v => +(v / px.length).toFixed(1)); };
    const A = g.button, C = g.content;
    const arrowCorners = { tl: block(A.l + 5, A.t + 5), tr: block(A.r - 8, A.t + 5), bl: block(A.l + 5, A.b - 8), br: block(A.r - 8, A.b - 8) };
    const labelCorners = { tl: block(C.l + 5, C.t + 5), tr: block(A.l - 8, C.t + 5), bl: block(C.l + 5, C.b - 8), br: block(A.l - 8, C.b - 8) };
    const avg = o => { const v = Object.values(o); return [0, 1, 2].map(i => +(v.reduce((s, c) => s + c[i], 0) / v.length).toFixed(1)); };
    const arrowMean = avg(arrowCorners), labelMean = avg(labelCorners);
    // foreground: darkest (for disabled/toolbar) or lightest (filled) pixel inside the text rect and the icon rect
    const txt = S.rect(g.text.l, g.text.r, g.text.t, g.text.b), ico = S.rect(g.icon.l, g.icon.r, g.icon.t, g.icon.b);
    const extreme = (px, bg) => L.worst(px, bg);
    const fgText = extreme(txt, labelMean), fgIcon = extreme(ico, arrowMean);
    // separator column + 1px either side, mid height
    const sep = [-1, 0, 1].map(dx => S.at(Math.round((A.l + 0.5 + dx) * S.dpr), Math.round(((A.t + A.b) / 2) * S.dpr)));
    // WCAG contrast of the text foreground against the label background
    const rl = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const contrast = (a, b) => { const x = rl(a), y = rl(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
    // predicted composite if the arrow paints the same translucent colour over the already-painted label
    const rgba = L.parseRgb(g.buttonCs.bg), crgba = L.parseRgb(g.contentCs.bg);
    const pred = crgba && rgba ? { labelOverWhite: L.over(crgba), arrowOverLabel: L.over(rgba, L.over(crgba)) } : null;
    out[key] = { cls: g.cls, rects: { content: C, button: A, text: g.text, icon: g.icon }, arrowCorners, labelCorners, arrowMean, labelMean, dE: +L.dE(arrowMean, labelMean).toFixed(2),
      fgText, fgIcon, textContrastOnLabel: contrast(fgText.c, labelMean), iconContrastOnArrow: contrast(fgIcon.c, arrowMean), separatorPx: sep,
      computed: { content: g.contentCs, button: g.buttonCs, icon: g.iconCs, chain: g.chain, tokens: g.tokens }, predictedComposite: pred };
  }
  await ctx.close(); await browser.close();
  L.save('final19.json', out);
  for (const k of Object.keys(CB)) { const o = out[k]; console.log(k, 'arrow', o.arrowMean, 'label', o.labelMean, 'dE', o.dE, 'fgText', o.fgText.c, 'contrast', o.textContrastOnLabel, 'fgIcon', o.fgIcon.c, o.iconContrastOnArrow, 'sep', JSON.stringify(o.separatorPx)); console.log('   content bg', o.computed.content.bg, 'button bg', o.computed.button.bg, 'pos', o.computed.button.position, 'pred', JSON.stringify(o.predictedComposite), 'tokens', JSON.stringify(o.computed.tokens)); console.log('   corners arrow', JSON.stringify(o.arrowCorners), 'label', JSON.stringify(o.labelCorners)); }
})().catch(e => { console.error(e); process.exit(1); });
