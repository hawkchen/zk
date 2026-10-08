// Batch 7 RED, #29 selectbox arrow proportion. Pixel-only ink measurement of the ::picker-icon arrow
// (right 40px of the control, borders/corners excluded, ink = dE(base) >= 8), the combobox chevron on combobox.zul as
// the family baseline, and the MD3 reference arrow in ref/jess-29-md3.png. Also records today's values for protections (a)-(g).
const L = require('./lib.js');
const fs = require('fs');
const path = require('path');
const EDGE = 3, CORNER = 6; // CSS px excluded from the control's border side / rounded corners (focus border is 2px)

// ink bbox inside a CSS-px rect of a shot, base = median colour of the region, ink = dE >= thr
function ink(S, x0, x1, y0, y1, thr = 8, base) {
  const px = S.rect(x0, x1, y0, y1);
  base = base || L.median(px.map(p => p.c));
  const hits = px.filter(p => L.dE(p.c, base) >= thr);
  if (!hits.length) return { n: 0, base };
  const minx = Math.min(...hits.map(p => p.dx)), maxx = Math.max(...hits.map(p => p.dx)), miny = Math.min(...hits.map(p => p.dy)), maxy = Math.max(...hits.map(p => p.dy));
  // row profile (ink count per device row, top to bottom) for the mirror check
  const rows = []; for (let dy = miny; dy <= maxy; dy++) rows.push(hits.filter(p => p.dy === dy).length);
  const darkest = hits.reduce((m, p) => (p.c[0] + p.c[1] + p.c[2] < m.c[0] + m.c[1] + m.c[2] ? p : m), hits[0]);
  const d = S.dpr;
  return { n: hits.length, base, left: minx / d, right: (maxx + 1) / d, top: miny / d, bottom: (maxy + 1) / d,
    w: (maxx - minx + 1) / d, h: (maxy - miny + 1) / d, cx: (minx + maxx + 1) / 2 / d, cy: (miny + maxy + 1) / 2 / d, areaCss: hits.length / d / d, rows, darkest: darkest.c };
}
// connected components (4-neighbour) of ink pixels, for the duplicate-arrow check in fallback browsers
function components(S, x0, x1, y0, y1, thr = 8) {
  const px = S.rect(x0, x1, y0, y1); const base = L.median(px.map(p => p.c));
  const hit = new Map(); for (const p of px) if (L.dE(p.c, base) >= thr) hit.set(p.dx + ',' + p.dy, p);
  const seen = new Set(), comps = [];
  for (const [k, p] of hit) { if (seen.has(k)) continue; const q = [p]; seen.add(k); const c = [];
    while (q.length) { const a = q.pop(); c.push(a); for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const kk = (a.dx + ox) + ',' + (a.dy + oy); if (hit.has(kk) && !seen.has(kk)) { seen.add(kk); q.push(hit.get(kk)); } } }
    if (c.length >= 4) { const d = S.dpr; comps.push({ n: c.length, left: Math.min(...c.map(a => a.dx)) / d, right: (Math.max(...c.map(a => a.dx)) + 1) / d, top: Math.min(...c.map(a => a.dy)) / d, bottom: (Math.max(...c.map(a => a.dy)) + 1) / d }); } }
  return { base, comps: comps.sort((a, b) => b.n - a.n) };
}
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };

async function selectInfo(page, i) {
  return page.evaluate(({ i, Rs }) => { const R = new Function('return ' + Rs)(); const e = document.querySelectorAll('.z-selectbox')[i]; const cs = getComputedStyle(e);
    let pi = null; try { const p = getComputedStyle(e, '::picker-icon'); pi = { transform: p.transform, fontSize: p.fontSize, color: p.color, width: p.width, height: p.height }; } catch (x) { pi = 'n/a'; }
    return { rect: R(e), tag: e.tagName, disabled: e.disabled, open: e.matches(':open'), focus: e.matches(':focus'), focusVisible: e.matches(':focus-visible'), hover: e.matches(':hover'),
      cs: { appearance: cs.appearance, opacity: cs.opacity, bg: cs.backgroundColor, borderTop: cs.borderTopWidth + ' ' + cs.borderTopColor, borderRight: cs.borderRightWidth + ' ' + cs.borderRightColor, outline: cs.outlineWidth + ' ' + cs.outlineStyle + ' ' + cs.outlineColor, boxShadow: cs.boxShadow, bgImage: cs.backgroundImage }, pickerIcon: pi,
      picker: (() => { try { const p = getComputedStyle(e, '::picker(select)'); return { display: p.display }; } catch (x) { return null; } })() }; }, { i, Rs: R.toString() });
}
// arrow ink in the right 40px of the control; text ink in the left 60px; border/focus band profiles
async function measureSelect(page, i, tag) {
  const info = await selectInfo(page, i); const b = info.rect;
  const S = await L.shot(page, `red29-${tag}.png`, { x: b.l - 6, y: b.t - 6, width: b.w + 12, height: b.h + 12 });
  const arrow = ink(S, b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE);
  // exclude the two right rounded corners by re-measuring with the corner squares masked: simplest is to require hits to be > CORNER px from the right edge OR > CORNER px from top/bottom
  const arrow2 = (() => { const px = S.rect(b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE).filter(p => !((p.x > b.r - 1 - CORNER) && (p.y < b.t + CORNER || p.y > b.b - 1 - CORNER)));
    const base = arrow.base; const hits = px.filter(p => L.dE(p.c, base) >= 8); if (!hits.length) return { n: 0 };
    const d = S.dpr; const minx = Math.min(...hits.map(p => p.dx)), maxx = Math.max(...hits.map(p => p.dx)), miny = Math.min(...hits.map(p => p.dy)), maxy = Math.max(...hits.map(p => p.dy));
    const rows = []; for (let dy = miny; dy <= maxy; dy++) rows.push(hits.filter(p => p.dy === dy).length);
    return { n: hits.length, base, left: minx / d, right: (maxx + 1) / d, top: miny / d, bottom: (maxy + 1) / d, w: (maxx - minx + 1) / d, h: (maxy - miny + 1) / d, cx: (minx + maxx + 1) / 2 / d, cy: (miny + maxy + 1) / 2 / d, areaCss: hits.length / d / d, rows, darkest: hits.reduce((m, p) => (p.c[0] + p.c[1] + p.c[2] < m.c[0] + m.c[1] + m.c[2] ? p : m), hits[0]).c }; })();
  const text = ink(S, b.l + 1 + EDGE, b.l + 60, b.t + EDGE, b.b - 1 - EDGE, 8, arrow.base);
  const controlCy = (b.t + b.b) / 2;
  // border colour: median of the top border row (device rows of y=t .. t+1) away from corners; right border column likewise
  const topBorder = L.median(S.rect(b.l + 10, b.r - 10, b.t, b.t).map(p => p.c));
  const rightBorder = L.median(S.rect(b.r - 1, b.r - 1, b.t + 10, b.b - 10).map(p => p.c));
  // focus/hover band: per-device-row median colour from y=t-4 .. t+4 at the horizontal middle third
  const band = []; const d = S.dpr; for (let dy = Math.round((b.t - 4) * d); dy < Math.round((b.t + 5) * d); dy++) { const row = S.rect(b.l + b.w / 3, b.l + 2 * b.w / 3, dy / d, dy / d).filter(p => p.dy === dy); band.push({ y: dy / d, c: L.median(row.map(p => p.c)) }); }
  const interior = L.median(S.rect(b.l + b.w / 2 - 10, b.l + b.w / 2 + 10, b.t + 4, b.t + 8).map(p => p.c)); // interior fill between text and arrow, top strip
  return { tag, info, controlCy, arrow: arrow2, arrowRaw: { n: arrow.n, w: arrow.w, h: arrow.h, top: arrow.top, bottom: arrow.bottom },
    arrowDerived: arrow2.n ? { rightInset: +(b.r - arrow2.right).toFixed(3), cyDiff: +(arrow2.cy - controlCy).toFixed(3), aspectWH: +(arrow2.w / arrow2.h).toFixed(3) } : null,
    text: text.n ? { left: text.left, top: text.top, bottom: text.bottom, cy: text.cy, cyDiff: +(text.cy - controlCy).toFixed(3), leftInset: +(text.left - b.l).toFixed(3) } : null,
    topBorder, rightBorder, band, interior };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { chromium: null, states: {}, combobox: null, md3: null, forcedColors: null, fallback: {} };
  out.chromium = browser.version();
  // rest (selectbox 0), pre-selected (2), disabled (1)
  { const { ctx, page } = await L.open(browser, 'selectbox.zul');
    out.states.rest = await measureSelect(page, 0, 'rest');
    out.states.preselected = await measureSelect(page, 2, 'preselected');
    out.states.disabled = await measureSelect(page, 1, 'disabled');
    await ctx.close(); }
  // hover
  { const { ctx, page } = await L.open(browser, 'selectbox.zul'); const b = (await selectInfo(page, 0)).rect;
    await page.mouse.move(b.l + b.w / 2, b.t + b.h / 2); await page.waitForTimeout(300);
    out.states.hover = await measureSelect(page, 0, 'hover');
    await page.mouse.move(b.r - 12, b.t + b.h / 2); await page.waitForTimeout(300);
    out.states.hoverArrow = await measureSelect(page, 0, 'hoverArrow');
    await ctx.close(); }
  // keyboard focus (Tab from the page body)
  { const { ctx, page } = await L.open(browser, 'selectbox.zul');
    await page.mouse.click(2, 2); let n = 0;
    while (n++ < 12 && !(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('z-selectbox')))) await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    out.states.focus = await measureSelect(page, 0, 'focus'); out.states.focus.tabs = n - 1;
    await ctx.close(); }
  // open (:open) - click the control, pointer moved off afterwards
  { const { ctx, page } = await L.open(browser, 'selectbox.zul'); const b = (await selectInfo(page, 0)).rect;
    await page.mouse.click(b.l + b.w / 2, b.t + b.h / 2); await page.waitForTimeout(500); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.states.open = await measureSelect(page, 0, 'open');
    out.states.open.pickerRect = await page.evaluate(() => { const e = document.querySelector('.z-selectbox'); try { const p = e.querySelector('::picker(select)'); return null; } catch (x) { return null; } });
    await L.shot(page, 'red29-open-page.png', { x: 0, y: 150, width: 400, height: 400 });
    // mirror check: rest row profile reversed vs open row profile
    const r = out.states.rest.arrow.rows, o = out.states.open.arrow.rows || [];
    out.states.open.mirror = { restRows: r, openRows: o, restReversedEqualsOpen: JSON.stringify([...r].reverse()) === JSON.stringify(o), sumAbsDiff: r.length === o.length ? r.reduce((s, v, i) => s + Math.abs(v - o[o.length - 1 - i]), 0) : 'len differs' };
    await ctx.close(); }
  // combobox family baseline (combobox.zul, first combobox)
  { const { ctx, page } = await L.open(browser, 'combobox.zul');
    const cb = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const e = document.querySelector('.z-combobox'); return { rect: R(e), button: R(e.querySelector('.z-combobox-button')), icon: R(e.querySelector('.z-combobox-icon')) }; }, R.toString());
    const b = cb.rect; const S = await L.shot(page, 'red29-combobox.png', { x: b.l - 6, y: b.t - 6, width: b.w + 12, height: b.h + 12 });
    const a = ink(S, b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE);
    const comps = components(S, b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE);
    out.combobox = { dom: cb, controlCy: (b.t + b.b) / 2, arrow: a, components: comps.comps, derived: a.n ? { rightInset: +(b.r - a.right).toFixed(3), cyDiff: +(a.cy - (b.t + b.b) / 2).toFixed(3), aspectWH: +(a.w / a.h).toFixed(3) } : null };
    await ctx.close(); }
  // MD3 reference arrow: see red29-md3.js / red29-md3.json
  out.md3 = 'see red29-md3.json';
  // forced-colors: arrow still discernible?
  { const { ctx, page } = await L.open(browser, 'selectbox.zul', { forcedColors: 'active' });
    const m = await measureSelect(page, 0, 'forced'); out.forcedColors = { arrow: m.arrow, arrowDerived: m.arrowDerived, text: m.text, topBorder: m.topBorder, cs: m.info.cs };
    await ctx.close(); }
  await browser.close();
  // fallback path (g): browsers without base-select (webkit / firefox if installed)
  for (const name of ['webkit', 'firefox']) {
    try { const bt = require('@playwright/test')[name]; const br = await bt.launch(); const { ctx, page } = await L.open(br, 'selectbox.zul');
      const info = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const e = document.querySelector('.z-selectbox'); const cs = getComputedStyle(e); return { supportsBaseSelect: CSS.supports('appearance', 'base-select'), appearance: cs.appearance, bgImage: cs.backgroundImage, rect: R(e), ua: navigator.userAgent }; }, R.toString());
      const b = info.rect; const S = await L.shot(page, `red29-fallback-${name}.png`, { x: b.l - 6, y: b.t - 6, width: b.w + 12, height: b.h + 12 });
      const comps = components(S, b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE); const a = ink(S, b.r - 40, b.r - 1 - EDGE, b.t + EDGE, b.b - 1 - EDGE);
      out.fallback[name] = { version: br.version(), info, arrow: { n: a.n, w: a.w, h: a.h, cx: a.cx, cy: a.cy, rightInset: a.n ? +(b.r - a.right).toFixed(3) : null, cyDiff: a.n ? +(a.cy - (b.t + b.b) / 2).toFixed(3) : null }, components: comps.comps, nArrowLikeComponents: comps.comps.length };
      await ctx.close(); await br.close(); } catch (e) { out.fallback[name] = { error: String(e.message).split('\n')[0] }; }
  }
  L.save('red29.json', out);
  const s = out.states; const pr = (k, m) => console.log(k.padEnd(12), m.arrow.n ? `ink ${m.arrow.w}x${m.arrow.h} @cx ${m.arrow.cx} cy ${m.arrow.cy} (ctrl cy ${m.controlCy}) rightInset ${m.arrowDerived.rightInset} cyDiff ${m.arrowDerived.cyDiff} aspect ${m.arrowDerived.aspectWH} area ${m.arrow.areaCss} darkest ${m.arrow.darkest} base ${m.arrow.base}` : 'no ink', '| text', JSON.stringify(m.text), '| border', JSON.stringify(m.topBorder), JSON.stringify(m.rightBorder), '| cs', JSON.stringify(m.info.cs), m.info.pickerIcon && m.info.pickerIcon.transform);
  for (const k of Object.keys(s)) pr(k, s[k]);
  console.log('open mirror', JSON.stringify(s.open.mirror));
  console.log('combobox', JSON.stringify({ arrow: { w: out.combobox.arrow.w, h: out.combobox.arrow.h, cx: out.combobox.arrow.cx, cy: out.combobox.arrow.cy, area: out.combobox.arrow.areaCss, base: out.combobox.arrow.base, darkest: out.combobox.arrow.darkest }, controlCy: out.combobox.controlCy, derived: out.combobox.derived, comps: out.combobox.components.length }));
  console.log('forced', JSON.stringify(out.forcedColors));
  console.log('fallback', JSON.stringify(out.fallback));
})();
