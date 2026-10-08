// #40 RED: checkbox text vs radio text font on label.zul (block row + flex row), plus radiogroup.zul states.
// J40-1: computed font-size / font-weight / line-height of .z-checkbox-content vs .z-radio-content on the same page.
// Protection: checkbox 13px; radio control min-height / rect, circle (outer / inner dot) ink size, text-centre vs circle-centre
// (rect centre and glyph-ink centre), states on radiogroup.zul (default / checked / disabled / disabled+checked / focus).
// Output: red40.json + red40-*.png
const L = require('./lib');

async function rows(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const F = e => { const s = getComputedStyle(e); return { fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, fontFamily: s.fontFamily.split(',')[0], letterSpacing: s.letterSpacing, color: s.color }; };
    const textRect = e => { const tn = [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!tn) return null; const rg = document.createRange(); rg.selectNodeContents(tn); return R(rg); };
    const ctl = (host, sel, contentSel) => { const c = host.querySelector(contentSel); const inp = host.querySelector('input'); const mold = host.querySelector('.z-checkbox-mold, .z-radio-mold'); const hs = getComputedStyle(host); return { cls: host.className, rect: R(host), minHeight: hs.minHeight, display: hs.display, alignItems: hs.alignItems, font: F(host), content: c ? { txt: c.textContent.trim(), rect: R(c), textRect: textRect(c), font: F(c) } : null, input: inp ? { rect: R(inp), w: getComputedStyle(inp).width, h: getComputedStyle(inp).height, appearance: getComputedStyle(inp).appearance } : null, mold: mold ? { cls: mold.className, rect: R(mold) } : null }; };
    const vs = [...document.querySelectorAll('.z-vstack')];
    const out = [];
    vs.forEach((v, vi) => { for (const cb of v.querySelectorAll('.z-checkbox')) out.push({ row: vi === 0 ? 'block' : 'flex', kind: 'checkbox', ...ctl(cb, '.z-checkbox', '.z-checkbox-content') }); for (const rd of v.querySelectorAll('.z-radio')) out.push({ row: vi === 0 ? 'block' : 'flex', kind: 'radio', ...ctl(rd, '.z-radio', '.z-radio-content') }); });
    return out;
  });
}
// ink bbox inside a rect: pixels with dE >= thr from white
function ink(S, r, thr = 12) { const px = S.rect(r.l, r.r - 1, r.t, r.b - 1).filter(p => L.dE(p.c, [255, 255, 255]) >= thr); if (!px.length) return null; const xs = px.map(p => p.x), ys = px.map(p => p.y); const l = Math.min(...xs), rr = Math.max(...xs) + 1 / S.dpr, t = Math.min(...ys), b = Math.max(...ys) + 1 / S.dpr; return { l, r: rr, t, b, w: +(rr - l).toFixed(2), h: +(b - t).toFixed(2), cx: +((l + rr) / 2).toFixed(2), cy: +((t + b) / 2).toFixed(2), n: px.length, median: L.median(px.map(p => p.c)) }; }
// darkest ink colour (text colour estimate)
function darkest(S, r) { const px = S.rect(r.l, r.r - 1, r.t, r.b - 1); let d = null, lum = 1e9; for (const p of px) { const l = p.c[0] + p.c[1] + p.c[2]; if (l < lum) { lum = l; d = p.c; } } return d; }

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'label.zul rows: block (baseline) and flex (centred); computed fonts + pixel ink boxes at DPR 2' };
  { const { ctx, page } = await L.open(browser, 'label.zul');
    const rs = await rows(page);
    const all = rs.map(r => r.rect); const clip = { x: 20, y: Math.min(...all.map(r => r.t)) - 20, w: 300, h: Math.max(...all.map(r => r.b)) - Math.min(...all.map(r => r.t)) + 40 };
    const S = await L.shot(page, 'red40-label-rows.png', { x: clip.x, y: clip.y, width: clip.w, height: clip.h });
    out.label = rs.map(r => { const tr = r.content && r.content.textRect; const textInk = tr && ink(S, { l: tr.l - 1, r: tr.r + 1, t: tr.t - 1, b: tr.b + 1 }); const ctlRect = r.input ? r.input.rect : null; const ctlInk = ctlRect && ink(S, { l: ctlRect.l - 2, r: ctlRect.r + 2, t: ctlRect.t - 2, b: ctlRect.b + 2 });
      return { row: r.row, kind: r.kind, cls: r.cls, hostRect: r.rect, minHeight: r.minHeight, display: r.display, alignItems: r.alignItems, hostFont: r.font, contentTxt: r.content && r.content.txt, contentFont: r.content && r.content.font, contentRect: r.content && r.content.rect, textRect: tr, textInk, textDarkest: tr && darkest(S, tr), inputRect: ctlRect, inputCss: r.input && [r.input.w, r.input.h, r.input.appearance], ctlInk, mold: r.mold,
        centres: ctlRect && tr ? { textRectCy: +((tr.t + tr.b) / 2).toFixed(2), contentRectCy: +((r.content.rect.t + r.content.rect.b) / 2).toFixed(2), inputCy: +((ctlRect.t + ctlRect.b) / 2).toFixed(2), ctlInkCy: ctlInk && ctlInk.cy, textInkCy: textInk && textInk.cy, hostCy: +((r.rect.t + r.rect.b) / 2).toFixed(2), diff_textRect_minus_input: +(((tr.t + tr.b) / 2) - ((ctlRect.t + ctlRect.b) / 2)).toFixed(2), diff_textInk_minus_ctlInk: textInk && ctlInk ? +(textInk.cy - ctlInk.cy).toFixed(2) : null, diff_textRect_minus_host: +(((tr.t + tr.b) / 2) - ((r.rect.t + r.rect.b) / 2)).toFixed(2) } : null }; });
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'radiogroup.zul');
    const st = await page.evaluate(() => {
      const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      const rds = [...document.querySelectorAll('.z-radio')].slice(0, 8);
      return rds.map(rd => { const s = getComputedStyle(rd); const c = rd.querySelector('.z-radio-content'); const cs = c && getComputedStyle(c); const inp = rd.querySelector('input'); const is = getComputedStyle(inp); const ib = getComputedStyle(inp, '::before'); const ia = getComputedStyle(inp, '::after'); return { cls: rd.className, rect: R(rd), minHeight: s.minHeight, opacity: s.opacity, checked: inp.checked, disabled: inp.disabled, content: c ? { txt: c.textContent.trim(), fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, color: cs.color, opacity: cs.opacity } : null, input: { rect: R(inp), border: is.borderWidth + ' ' + is.borderColor, bg: is.backgroundColor, opacity: is.opacity, before: { content: ib.content, w: ib.width, h: ib.height, bg: ib.backgroundColor, transform: ib.transform, opacity: ib.opacity }, after: { content: ia.content, w: ia.width, h: ia.height, bg: ia.backgroundColor, boxShadow: ia.boxShadow.slice(0, 80), opacity: ia.opacity } } }; });
    });
    const t = Math.min(...st.map(s => s.rect.t)), b = Math.max(...st.map(s => s.rect.b));
    const S = await L.shot(page, 'red40-radiogroup-states.png', { x: 20, y: t - 12, width: 900, height: b - t + 24 });
    out.radioStates = st.map(s => { const ir = s.input.rect; const outer = ink(S, { l: ir.l - 2, r: ir.r + 2, t: ir.t - 2, b: ir.b + 2 }, 12); // inner dot: pixels in the centre 60% that are far from white and from the ring colour -> approximate by thresholding stronger
      const cx = (ir.l + ir.r) / 2, cy = (ir.t + ir.b) / 2; const core = S.rect(cx - 6, cx + 6, cy - 6, cy + 6).filter(p => L.dE(p.c, [255, 255, 255]) >= 30); const dot = core.length ? { n: core.length, median: L.median(core.map(p => p.c)), w: +((Math.max(...core.map(p => p.x)) - Math.min(...core.map(p => p.x))) + 1 / S.dpr).toFixed(2), h: +((Math.max(...core.map(p => p.y)) - Math.min(...core.map(p => p.y))) + 1 / S.dpr).toFixed(2) } : null;
      const tx = s.content ? null : null;
      return { cls: s.cls, checked: s.checked, disabled: s.disabled, hostRect: s.rect, minHeight: s.minHeight, opacity: s.opacity, content: s.content, inputRect: ir, inputCss: s.input, outerInk: outer, centreDot: dot }; });
    // keyboard focus on the first enabled labelled radio
    await page.evaluate(() => { const r = [...document.querySelectorAll('.z-radio')].find(x => x.querySelector('.z-radio-content') && !x.querySelector('input').disabled); const inp = r.querySelector('input'); const foc = [...document.querySelectorAll('input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(e => e.offsetParent !== null); const i = foc.indexOf(inp); (i > 0 ? foc[i - 1] : inp).focus(); window.__needTab = i > 0; });
    if (await page.evaluate(() => window.__needTab)) await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    const f = await page.evaluate(() => { const inp = document.activeElement; const r = inp.closest('.z-radio'); const R = e => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height }; }; const is = getComputedStyle(inp); const ia = getComputedStyle(inp, '::after'); const ib = getComputedStyle(inp, '::before'); return { active: inp.tagName + ' ' + inp.type, cls: r && r.className, focusVisible: inp.matches(':focus-visible'), rect: R(r), inputRect: R(inp), outline: is.outlineStyle + ' ' + is.outlineWidth + ' ' + is.outlineColor, boxShadow: is.boxShadow.slice(0, 120), after: { bg: ia.backgroundColor, opacity: ia.opacity, w: ia.width, boxShadow: ia.boxShadow.slice(0, 80) }, before: { bg: ib.backgroundColor, opacity: ib.opacity, w: ib.width, boxShadow: ib.boxShadow.slice(0, 80) } }; });
    const S2 = await L.shot(page, 'red40-radio-focus.png', { x: f.rect.l - 16, y: f.rect.t - 8, width: f.rect.w + 32, height: f.rect.h + 16 });
    const ir = f.inputRect; const ringPx = S2.rect(ir.l - 12, ir.r + 12, ir.t - 12, ir.b + 12).filter(p => L.dE(p.c, [255, 255, 255]) >= 6 && (p.x < ir.l - 1 || p.x > ir.r + 1 || p.y < ir.t - 1 || p.y > ir.b + 1));
    out.radioFocus = { ...f, haloPixelsOutsideInput: ringPx.length, haloMedian: ringPx.length ? L.median(ringPx.map(p => p.c)) : null, haloExtent: ringPx.length ? { l: Math.min(...ringPx.map(p => p.x)), r: Math.max(...ringPx.map(p => p.x)), t: Math.min(...ringPx.map(p => p.y)), b: Math.max(...ringPx.map(p => p.y)) } : null };
    await ctx.close(); }
  L.save('red40.json', out);
  await browser.close();
  for (const r of out.label) console.log(r.row, r.kind, '|', r.contentTxt, '| content font', JSON.stringify(r.contentFont), '| host minH', r.minHeight, 'h', r.hostRect.h, '| input', r.inputRect && [r.inputRect.w, r.inputRect.h], '| ctlInk', r.ctlInk && [r.ctlInk.w, r.ctlInk.h, r.ctlInk.cy], '| textInk', r.textInk && [r.textInk.w, r.textInk.h, r.textInk.cy], '| centres', JSON.stringify(r.centres));
  for (const s of out.radioStates) console.log('state', s.cls, 'chk', s.checked, 'dis', s.disabled, '| content', JSON.stringify(s.content), '| outer', s.outerInk && [s.outerInk.w, s.outerInk.h, s.outerInk.median], '| dot', JSON.stringify(s.centreDot), '| host', s.hostRect.h, s.minHeight, 'op', s.opacity);
  console.log('focus', JSON.stringify(out.radioFocus));
})().catch(e => { console.error(e); process.exit(1); });
