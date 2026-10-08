// #26 slider knob mold: the number input should look inline at rest (no fill, no border) and show the ordinary focus ring when focused.
// Pixel-only for the judgments; computed styles recorded for the protection items. Output: red26.json + red26-*.png.
const L = require('./lib');
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };
const rl = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contrast = (a, b) => { const x = rl(a), y = rl(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };

async function knobInfo(page, idx) {
  return page.evaluate((idx) => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const n = [...document.querySelectorAll('.z-slider')].filter(x => x.querySelector('.z-slider-input'))[idx];
    const i = n.querySelector('.z-slider-input'); const s = getComputedStyle(i);
    const svg = n.querySelector('svg'); const paths = svg ? [...svg.querySelectorAll('path,circle')].map(p => ({ tag: p.tagName, d: p.getAttribute('d'), dash: p.getAttribute('stroke-dasharray') || getComputedStyle(p).strokeDasharray, offset: p.getAttribute('stroke-dashoffset') || getComputedStyle(p).strokeDashoffset, stroke: getComputedStyle(p).stroke })) : [];
    return { root: R(n), input: R(i), value: i.value, curpos: zk.$(n)._curpos, focused: document.activeElement === i,
      cs: { bg: s.backgroundColor, borderWidth: s.borderWidth, borderStyle: s.borderStyle, borderColor: s.borderColor, outline: s.outlineWidth + ' ' + s.outlineStyle + ' ' + s.outlineColor, outlineOffset: s.outlineOffset, boxShadow: s.boxShadow, color: s.color, fontWeight: s.fontWeight, fontSize: s.fontSize, textAlign: s.textAlign, fontFamily: s.fontFamily, radius: s.borderRadius },
      svg: paths, bgBehind: getComputedStyle(n).backgroundColor };
  }, idx);
}
// sample bands around the input rect (CSS px, inclusive):
// interior = inside the rect, 4..10px from the edge (never reaches the big glyphs, which sit in the middle);
// edge = the outermost 1px of the rect; outer = 2..5px outside the rect.
function bands(S, r) {
  const px = S.rect(r.l - 6, r.r + 5, r.t - 6, r.b + 5);
  const inside = p => p.x >= r.l && p.x < r.r && p.y >= r.t && p.y < r.b;
  const dIn = p => Math.min(p.x - r.l, r.r - p.x, p.y - r.t, r.b - p.y); // distance to the nearest edge from inside
  const dOut = p => Math.max(r.l - p.x, p.x - r.r + 0.5, r.t - p.y, p.y - r.b + 0.5);
  return {
    interior: px.filter(p => inside(p) && dIn(p) >= 4 && dIn(p) < 10),
    edge: px.filter(p => inside(p) && dIn(p) < 1 && !((p.x < r.l + 4 || p.x >= r.r - 4) && (p.y < r.t + 4 || p.y >= r.b - 4))), // skip rounded corners
    edge2: px.filter(p => inside(p) && dIn(p) >= 1 && dIn(p) < 3),
    outer: px.filter(p => !inside(p) && dOut(p) >= 2 && dOut(p) < 5),
  };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'ΔE CIE76 on band means. interior = 4..10px inside the edge; edge = outermost 1px (corners skipped); outer = 2..5px outside the rect' };
  // --- knob input at rest and focused (fresh page each)
  for (const state of ['rest', 'focus']) {
    const { ctx, page } = await L.open(browser, 'slider.zul');
    const k0 = await knobInfo(page, 0);
    await page.evaluate(y => window.scrollTo(0, y), Math.max(0, k0.root.t - 100)); await page.waitForTimeout(150);
    let k = await knobInfo(page, 0);
    if (state === 'focus') { await page.mouse.click((k.input.l + k.input.r) / 2, (k.input.t + k.input.b) / 2); await page.waitForTimeout(250); await page.mouse.move(2, 2); await page.waitForTimeout(150); k = await knobInfo(page, 0); }
    const S = await L.shot(page, `final26-knob-${state}.png`, { x: k.root.l - 8, y: k.root.t - 8, width: k.root.w + 16, height: k.root.h + 16 });
    const b = bands(S, k.input);
    const m = { interior: mean(b.interior), edge: mean(b.edge), edge2: mean(b.edge2), outer: mean(b.outer) };
    out['knob_' + state] = { input: k.input, focused: k.focused, value: k.value, curpos: k.curpos, cs: k.cs, bgBehind: k.bgBehind, means: m, n: { interior: b.interior.length, edge: b.edge.length, outer: b.outer.length },
      dE: { interiorVsOuter: +L.dE(m.interior, m.outer).toFixed(2), edgeVsOuter: +L.dE(m.edge, m.outer).toFixed(2), edge2VsOuter: +L.dE(m.edge2, m.outer).toFixed(2) },
      edgeWorstVsOuter: L.worst(b.edge, m.outer), edgeContrastVsOuter: contrast(m.edge, m.outer), edgeMedian: L.median(b.edge.map(p => p.c)) };
    await ctx.close();
  }
  // --- behaviour: type a value + Enter, arc updates
  {
    const { ctx, page } = await L.open(browser, 'slider.zul');
    const k0 = await knobInfo(page, 0);
    await page.evaluate(y => window.scrollTo(0, y), Math.max(0, k0.root.t - 100)); await page.waitForTimeout(150);
    const before = await knobInfo(page, 0);
    await page.mouse.click((before.input.l + before.input.r) / 2, (before.input.t + before.input.b) / 2);
    await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('80'); await page.keyboard.press('Enter'); await L.settle(page);
    const after = await knobInfo(page, 0);
    await L.shot(page, 'final26-knob-after-enter.png', { x: after.root.l - 8, y: after.root.t - 8, width: after.root.w + 16, height: after.root.h + 16 });
    out.behaviour = { before: { value: before.value, curpos: before.curpos, svg: before.svg }, after: { value: after.value, curpos: after.curpos, svg: after.svg }, inputRectSame: JSON.stringify(before.input) === JSON.stringify(after.input) };
    await ctx.close();
  }
  // --- reference: ordinary textbox focus ring (textbox.zul, Default "Hello")
  {
    const { ctx, page } = await L.open(browser, 'textbox.zul');
    const tb = async () => page.evaluate(() => { const i = document.querySelector('input.z-textbox'); const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; const s = getComputedStyle(i); return { rect: R(i), focused: document.activeElement === i, cs: { bg: s.backgroundColor, borderWidth: s.borderWidth, borderColor: s.borderColor, outline: s.outlineWidth + ' ' + s.outlineStyle + ' ' + s.outlineColor, outlineOffset: s.outlineOffset, boxShadow: s.boxShadow }, tokens: { primary: getComputedStyle(document.documentElement).getPropertyValue('--zk-color-primary').trim(), focusRing: getComputedStyle(document.documentElement).getPropertyValue('--zk-focus-ring-color').trim() } }; });
    const r0 = await tb();
    const S0 = await L.shot(page, 'final26-textbox-rest.png', { x: r0.rect.l - 8, y: r0.rect.t - 8, width: r0.rect.w + 16, height: r0.rect.h + 16 });
    await page.mouse.click(r0.rect.l + 10, (r0.rect.t + r0.rect.b) / 2); await page.waitForTimeout(250); await page.mouse.move(2, 2); await page.waitForTimeout(150);
    const r1 = await tb();
    const S1 = await L.shot(page, 'final26-textbox-focus.png', { x: r1.rect.l - 8, y: r1.rect.t - 8, width: r1.rect.w + 16, height: r1.rect.h + 16 });
    const b0 = bands(S0, r0.rect), b1 = bands(S1, r1.rect);
    out.textboxRef = { rect: r1.rect, rest: { cs: r0.cs, edge: mean(b0.edge), edge2: mean(b0.edge2), outer: mean(b0.outer) }, focus: { focused: r1.focused, cs: r1.cs, edge: mean(b1.edge), edge2: mean(b1.edge2), outer: mean(b1.outer), edgeMedian: L.median(b1.edge.map(p => p.c)) }, tokens: r1.tokens };
    await ctx.close();
  }
  // --- forced-colors (record only): is the input still distinguishable?
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, forcedColors: 'active' });
    const page = await ctx.newPage(); await page.goto(L.BASE + '/slider.zul', { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
    const k0 = await knobInfo(page, 0); await page.evaluate(y => window.scrollTo(0, y), Math.max(0, k0.root.t - 100)); await page.waitForTimeout(150);
    const k = await knobInfo(page, 0);
    const S = await L.shot(page, 'final26-knob-forced.png', { x: k.root.l - 8, y: k.root.t - 8, width: k.root.w + 16, height: k.root.h + 16 });
    const b = bands(S, k.input); const m = { edge: mean(b.edge), outer: mean(b.outer), interior: mean(b.interior) };
    out.forcedColors = { means: m, edgeVsOuterDE: +L.dE(m.edge, m.outer).toFixed(2), cs: k.cs };
    await ctx.close();
  }
  await browser.close();
  L.save('final26.json', out);
  for (const k of ['knob_rest', 'knob_focus']) { const o = out[k]; console.log(k, 'focused', o.focused, 'rect', JSON.stringify(o.input), 'means', JSON.stringify(o.means), 'dE', JSON.stringify(o.dE), 'edgeWorst', JSON.stringify(o.edgeWorstVsOuter), 'edgeContrast', o.edgeContrastVsOuter, 'edgeMedian', o.edgeMedian); console.log('   cs', JSON.stringify(o.cs), 'behind', o.bgBehind); }
  console.log('behaviour', JSON.stringify(out.behaviour));
  console.log('textboxRef', JSON.stringify(out.textboxRef));
  console.log('forced', JSON.stringify(out.forcedColors));
})().catch(e => { console.error(e); process.exit(1); });
