// #61 FINAL round 2 (copied from batch10-final/final61.js). Changes vs round 1, all listed in report.md section 4:
//   (a) output names final61-* -> final61r2-*, final61.json -> final61r2.json
//   (b) svg computed `opacity` read next to fill/color (rest + hover/active); J61-3 pairwise CIE76 dE of the 20 darkest pixels computed and logged
//   (c) states(): `darkest` pixel added to each state's pixel summary (hover must stay near solid primary, not a ~40% tint)
//   (d) new disabledState(): View HTML toggles trumbowyg's disabled state on the other 19 buttons; opacity / fill / darkest / ink median measured, then toggled back
//   (e) new dropdown(): Formatting dropdown opened, `.z-tbeditor-dropdown button svg` rect + computed read (18x18 protection)
// Everything else (tbeditor(), lucide(), inkMetrics(), hover/active loop) is unchanged from round 1.
const L = require('./lib');
const BG_THR = 18;
const P = 'final61r2';

function inkMetrics(S, r, bg) {
  const px = S.rect(r.l, r.r - 1, r.t, r.b - 1); const inkPx = px.filter(p => L.dE(p.c, bg) >= BG_THR);
  if (!inkPx.length) return { n: 0 };
  const xs = inkPx.map(p => p.dx), ys = inkPx.map(p => p.dy);
  const bbox = { l: Math.min(...xs) / S.dpr, r: (Math.max(...xs) + 1) / S.dpr, t: Math.min(...ys) / S.dpr, b: (Math.max(...ys) + 1) / S.dpr };
  bbox.w = +(bbox.r - bbox.l).toFixed(2); bbox.h = +(bbox.b - bbox.t).toFixed(2);
  const runs = (horiz) => { const out = []; const keys = horiz ? [...new Set(ys)] : [...new Set(xs)]; for (const k of keys) { const line = inkPx.filter(p => (horiz ? p.dy : p.dx) === k).map(p => horiz ? p.dx : p.dy).sort((a, b) => a - b); let run = 1; for (let i = 1; i <= line.length; i++) { if (i < line.length && line[i] === line[i - 1] + 1) run++; else { out.push(run); run = 1; } } } return out.sort((a, b) => a - b); };
  const hr = runs(true), vr = runs(false); const med = a => a.length ? a[Math.floor(a.length / 2)] : 0; const p25 = a => a.length ? a[Math.floor(a.length / 4)] : 0;
  let dark = inkPx[0], lum = 1e9; for (const p of inkPx) { const l = p.c[0] + p.c[1] + p.c[2]; if (l < lum) { lum = l; dark = p; } }
  const core = inkPx.filter(p => L.dE(p.c, dark.c) <= 12);
  const coreRuns = (horiz) => { const out = []; const keys = horiz ? [...new Set(core.map(p => p.dy))] : [...new Set(core.map(p => p.dx))]; for (const k of keys) { const line = core.filter(p => (horiz ? p.dy : p.dx) === k).map(p => horiz ? p.dx : p.dy).sort((a, b) => a - b); let run = 1; for (let i = 1; i <= line.length; i++) { if (i < line.length && line[i] === line[i - 1] + 1) run++; else { out.push(run); run = 1; } } } return out.sort((a, b) => a - b); };
  const chr = coreRuns(true), cvr = coreRuns(false);
  return { n: inkPx.length, bbox, inkMedian: L.median(inkPx.map(p => p.c)), darkest: dark.c, coreN: core.length, runMedianCss: { h: +(med(hr) / S.dpr).toFixed(2), v: +(med(vr) / S.dpr).toFixed(2) }, runP25Css: { h: +(p25(hr) / S.dpr).toFixed(2), v: +(p25(vr) / S.dpr).toFixed(2) }, coreRunMedianCss: { h: +(med(chr) / S.dpr).toFixed(2), v: +(med(cvr) / S.dpr).toFixed(2) }, thicknessCss: +(Math.min(med(hr), med(vr)) / S.dpr).toFixed(2), coreThicknessCss: +(Math.min(med(chr), med(cvr)) / S.dpr).toFixed(2), inkCoverage: +(inkPx.length / px.length).toFixed(3) };
}

async function tbeditor(page, prefix) {
  const d = await page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const ed = document.querySelector('.z-tbeditor'); const pane = ed.querySelector('.z-tbeditor-button-pane'); const ps = getComputedStyle(pane);
    const groups = [...pane.querySelectorAll('.z-tbeditor-button-group')].map(g => { const s = getComputedStyle(g); const b = getComputedStyle(g, '::before'); return { rect: R(g), borderLeft: s.borderLeftWidth + ' ' + s.borderLeftStyle + ' ' + s.borderLeftColor, borderRight: s.borderRightWidth + ' ' + s.borderRightStyle + ' ' + s.borderRightColor, margin: s.margin, padding: s.padding, gap: s.gap, display: s.display, before: b.content, beforeBox: { w: b.width, h: b.height, bg: b.backgroundColor, margin: b.margin }, after: getComputedStyle(g, '::after').content }; });
    const gaps = groups.slice(1).map((g, i) => +(g.rect.l - groups[i].rect.r).toFixed(2));
    const buttons = [...pane.querySelectorAll('button')].map(b => { const s = getComputedStyle(b); const svg = b.querySelector('svg'); const ss = svg && getComputedStyle(svg); const use = svg && svg.querySelector('use'); const href = use && (use.getAttribute('xlink:href') || use.getAttribute('href')); const sym = href && document.querySelector(href); const paths = sym ? [...sym.querySelectorAll('path, rect, circle, line, polyline, polygon')] : []; const bf = getComputedStyle(b, '::before');
      return { title: b.title, cls: b.className.trim(), rect: R(b), padding: s.padding, width: s.width, height: s.height, minWidth: s.minWidth, bg: s.backgroundColor, color: s.color, border: s.borderWidth + ' ' + s.borderStyle, borderRadius: s.borderRadius, display: s.display, fontSize: s.fontSize, before: bf.content, render: svg ? 'svg<use>' : (b.querySelector('img') ? 'img' : (bf.content !== 'none' ? 'pseudo' : 'text:' + b.textContent.trim())), svg: svg ? { rect: R(svg), width: ss.width, height: ss.height, fill: ss.fill, color: ss.color, opacity: ss.opacity, stroke: ss.stroke, strokeWidth: ss.strokeWidth, display: ss.display, viewBoxAttr: svg.getAttribute('viewBox'), href, symbolViewBox: sym && sym.getAttribute('viewBox'), symbolShapes: paths.length, shapeStroke: paths.slice(0, 3).map(p => (p.getAttribute('stroke') || '') + '/' + (p.getAttribute('stroke-width') || '') + '/' + (p.getAttribute('fill') || '')) } : null }; });
    return { edRect: R(ed), pane: { rect: R(pane), padding: ps.padding, gap: ps.gap, display: ps.display, flexWrap: ps.flexWrap, bg: ps.backgroundColor, borderBottom: ps.borderBottomWidth + ' ' + ps.borderBottomColor }, groups, gaps, buttons, rows: [...new Set(buttons.map(b => b.rect.t))] };
  });
  const d2 = await page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; const pane = document.querySelector('.z-tbeditor-button-pane'); return { pane: R(pane), buttons: [...pane.querySelectorAll('button')].map(b => ({ rect: R(b), svg: b.querySelector('svg') && R(b.querySelector('svg')) })) }; });
  const S = await L.shot(page, `${prefix}-toolbar.png`, { x: d2.pane.l - 8, y: d2.pane.t - 8, width: d2.pane.w + 16, height: d2.pane.h + 16 });
  const bg = L.median(S.rect(d2.pane.l + 2, d2.pane.l + 5, d2.pane.t + 2, d2.pane.t + 5).map(p => p.c));
  d.paneBgPixel = bg;
  d.buttons.forEach((b, i) => { const r = d2.buttons[i].rect; const bbg = L.median([...S.rect(r.l + 1, r.l + 2, r.t + 1, r.t + 2), ...S.rect(r.r - 3, r.r - 2, r.b - 3, r.b - 2)].map(p => p.c)); b.pixel = inkMetrics(S, { l: r.l + 1, r: r.r - 1, t: r.t + 1, b: r.b - 1 }, bbg); b.pixel.buttonBg = bbg; });
  // separator pixels: a 1px column just left of each group (from the 2nd on), sampled at the pane's vertical middle
  d.sepPixels = d.groups.map(g => { const px = S.rect(g.rect.l - 1, g.rect.l + 1, g.rect.t + 8, g.rect.b - 8); const cols = {}; for (const p of px) { const k = p.x.toFixed(1); (cols[k] = cols[k] || []).push(p.c); } return Object.fromEntries(Object.entries(cols).map(([k, v]) => [k, L.median(v)])); });
  // J61-3 (round-2 wording): pairwise CIE76 dE of the darkest pixel of all icons
  const darks = d.buttons.map(b => ({ title: b.title, c: b.pixel.darkest }));
  let worst = { dE: -1 }; const pairs = [];
  for (let i = 0; i < darks.length; i++) for (let j = i + 1; j < darks.length; j++) { const e = +L.dE(darks[i].c, darks[j].c).toFixed(2); pairs.push([darks[i].title, darks[j].title, e]); if (e > worst.dE) worst = { dE: e, a: darks[i].title, b: darks[j].title, ca: darks[i].c, cb: darks[j].c }; }
  d.j613 = { worst, over3: pairs.filter(p => p[2] > 3), nPairs: pairs.length };
  return d;
}
// hover + active per button on tbeditor.zul (event reachability: :hover / :active must match)
async function states(page, prefix) {
  const n = await page.evaluate(() => document.querySelectorAll('.z-tbeditor-button-pane button').length);
  const res = [];
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate((i) => { const b = document.querySelectorAll('.z-tbeditor-button-pane button')[i]; const x = b.getBoundingClientRect(); return { title: b.title, l: x.left, t: x.top, w: x.width, h: x.height }; }, i);
    const read = (st) => page.evaluate(({ i, st }) => { const b = document.querySelectorAll('.z-tbeditor-button-pane button')[i]; const s = getComputedStyle(b); const bf = getComputedStyle(b, '::before'); const svg = b.querySelector('svg'); const ss = getComputedStyle(svg); return { st, hover: b.matches(':hover'), active: b.matches(':active'), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, before: { content: bf.content, bg: bf.backgroundColor, opacity: bf.opacity }, svgFill: ss.fill, svgColor: ss.color, svgOpacity: ss.opacity, svgRect: (x => [x.width, x.height])(svg.getBoundingClientRect()) }; }, { i, st });
    const px = async (file) => { const S = await L.shot(page, file, { x: r.l - 6, y: r.t - 6, width: r.w + 12, height: r.h + 12 }); const bbg = L.median([...S.rect(r.l + 1, r.l + 2, r.t + 1, r.t + 2), ...S.rect(r.l + r.w - 3, r.l + r.w - 2, r.t + r.h - 3, r.t + r.h - 2)].map(p => p.c)); const m = inkMetrics(S, { l: r.l + 1, r: r.l + r.w - 1, t: r.t + 1, b: r.t + r.h - 1 }, bbg); return { buttonBg: bbg, inkMedian: m.inkMedian, darkest: m.darkest, bbox: m.bbox && [m.bbox.w, m.bbox.h], n: m.n }; };
    await page.mouse.move(2, 2); await page.waitForTimeout(150);
    const rest = { ...(await read('rest')), pixel: await px(null) };
    await page.mouse.move(r.l + r.w / 2, r.t + r.h / 2); await page.waitForTimeout(250);
    const hover = { ...(await read('hover')), pixel: await px(i < 3 ? `${prefix}-hover-${i}.png` : null) };
    await page.mouse.down(); await page.waitForTimeout(250);
    const active = { ...(await read('active')), pixel: await px(i < 3 ? `${prefix}-active-${i}.png` : null) };
    await page.mouse.up(); await page.waitForTimeout(150);
    // some buttons toggle editor state on click (e.g. View HTML / Fullscreen): press Escape-free reset by reloading only if the pane changed size
    res.push({ title: r.title, rest, hover, active });
    const changed = await page.evaluate(() => { const b = document.querySelector('.z-tbeditor-button-pane button'); return !b; });
    if (changed) break;
  }
  await page.mouse.move(2, 2);
  return res;
}
// disabled state: trumbowyg disables every other toolbar button while "View HTML" is on (class trumbowyg-disable). Measured, then toggled back.
async function disabledState(page, prefix) {
  const vh = await page.evaluate(() => { const b = [...document.querySelectorAll('.z-tbeditor-button-pane button')].find(b => /viewHTML/.test(b.className)); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(vh.x, vh.y); await page.waitForTimeout(400); await page.mouse.move(2, 2); await page.waitForTimeout(250);
  const d = await page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const pane = document.querySelector('.z-tbeditor-button-pane');
    return { pane: R(pane), buttons: [...pane.querySelectorAll('button')].map(b => { const s = getComputedStyle(b); const svg = b.querySelector('svg'); const ss = getComputedStyle(svg); return { title: b.title, cls: b.className.trim(), disabledAttr: b.disabled, disabledClass: /disable/.test(b.className) && !/not-disable/.test(b.className), rect: R(b), btnOpacity: s.opacity, btnColor: s.color, cursor: s.cursor, pointerEvents: s.pointerEvents, svgFill: ss.fill, svgColor: ss.color, svgOpacity: ss.opacity, svgRect: R(svg) }; }) };
  });
  const S = await L.shot(page, `${prefix}-disabled-toolbar.png`, { x: d.pane.l - 8, y: d.pane.t - 8, width: d.pane.w + 16, height: d.pane.h + 16 });
  d.buttons.forEach(b => { const r = b.rect; const bbg = L.median([...S.rect(r.l + 1, r.l + 2, r.t + 1, r.t + 2), ...S.rect(r.r - 3, r.r - 2, r.b - 3, r.b - 2)].map(p => p.c)); const m = inkMetrics(S, { l: r.l + 1, r: r.r - 1, t: r.t + 1, b: r.b - 1 }, bbg); b.pixel = { buttonBg: bbg, n: m.n, inkMedian: m.inkMedian, darkest: m.darkest, bbox: m.bbox && [m.bbox.w, m.bbox.h] }; });
  await page.mouse.click(vh.x, vh.y); await page.waitForTimeout(400); await page.mouse.move(2, 2); await page.waitForTimeout(250);
  d.restoredDisabledCount = await page.evaluate(() => [...document.querySelectorAll('.z-tbeditor-button-pane button')].filter(b => b.disabled || (/disable/.test(b.className) && !/not-disable/.test(b.className))).length);
  return d;
}
// dropdown svg (18x18 protection): open the Formatting dropdown, read every `.z-tbeditor-dropdown button svg`
async function dropdown(page, prefix) {
  const fmt = await page.evaluate(() => { const b = [...document.querySelectorAll('.z-tbeditor-button-pane button')].find(b => b.title === 'Formatting'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(fmt.x, fmt.y); await page.waitForTimeout(400); await page.mouse.move(2, 2); await page.waitForTimeout(250);
  const d = await page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const dd = [...document.querySelectorAll('.z-tbeditor-dropdown')].find(e => getComputedStyle(e).display !== 'none');
    if (!dd) return null;
    return { cls: dd.className.trim(), rect: R(dd), svgs: [...dd.querySelectorAll('button svg')].map(s => { const cs = getComputedStyle(s); const b = s.closest('button'); return { btn: b.textContent.trim(), rect: R(s), width: cs.width, height: cs.height, fill: cs.fill, color: cs.color, opacity: cs.opacity }; }) };
  });
  if (d) { const S = await L.shot(page, `${prefix}-dropdown.png`, { x: d.rect.l - 8, y: d.rect.t - 8, width: d.rect.w + 16, height: d.rect.h + 16 }); const bg = L.median(S.rect(d.rect.l + 2, d.rect.l + 5, d.rect.t + 2, d.rect.t + 5).map(p => p.c)); d.bgPixel = bg; d.svgs.forEach(s => { const r = s.rect; const m = inkMetrics(S, { l: r.l, r: r.r, t: r.t, b: r.b }, bg); s.pixel = { n: m.n, inkMedian: m.inkMedian, darkest: m.darkest, bbox: m.bbox && [m.bbox.w, m.bbox.h] }; }); }
  await page.keyboard.press('Escape'); await page.mouse.click(2, 2); await page.waitForTimeout(300);
  return d;
}
async function lucide(page, sel, prefix, limit = 12) {
  const d = await page.evaluate(({ sel, limit }) => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    return [...document.querySelectorAll(sel)].slice(0, limit).map(e => { const s = getComputedStyle(e); const b = getComputedStyle(e, '::before'); const host = e.closest('.z-toolbarbutton, .z-button') || e.parentElement; const hs = getComputedStyle(host); return { cls: e.className, rect: R(e), fontSize: s.fontSize, width: s.width, height: s.height, display: s.display, color: s.color, bg: s.backgroundColor, before: { content: b.content, w: b.width, h: b.height, bg: b.backgroundColor, color: b.color, display: b.display }, host: { cls: host.className.slice(0, 50), rect: R(host), padding: hs.padding, bg: hs.backgroundColor, color: hs.color } }; });
  }, { sel, limit });
  if (!d.length) return d;
  for (const e of d) { await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); el.scrollIntoView({ block: 'center' }); }, e.cls); await page.waitForTimeout(150);
    const r = await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); const x = el.getBoundingClientRect(); const h = (el.closest('.z-toolbarbutton, .z-button') || el.parentElement).getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height, host: { l: h.left, t: h.top, r: h.right, b: h.bottom, w: h.width, h: h.height } }; }, e.cls);
    const S = await L.shot(page, null, { x: r.host.l - 6, y: r.host.t - 6, width: r.host.w + 12, height: r.host.h + 12 });
    const bg = L.median(S.rect(r.host.l + 3, r.host.l + 5, r.host.t + 3, r.host.t + 5).map(p => p.c));
    e.pixel = inkMetrics(S, { l: r.l - 1, r: r.r + 1, t: r.t - 1, b: r.b + 1 }, bg); e.pixel.bg = bg; e.viewportRect = r; }
  await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); el.scrollIntoView({ block: 'center' }); }, d[0].cls); await page.waitForTimeout(150);
  const rr = await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); const h = (el.closest('.z-toolbar') || el.closest('.z-toolbarbutton, .z-button') || el.parentElement.parentElement).getBoundingClientRect(); return { l: h.left, t: h.top, w: h.width, h: h.height }; }, d[0].cls);
  await L.shot(page, `${prefix}.png`, { x: rr.l - 8, y: rr.t - 8, width: Math.min(rr.w + 16, 1000), height: rr.h + 16 });
  return d;
}
(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'ink = pixels with CIE76 dE >= ' + BG_THR + ' from the local background (DPR 2); thickness = median run length of ink pixels (rows/cols), core = pixels within dE 12 of the darkest ink pixel' };
  { const { ctx, page } = await L.open(browser, 'portallayout.zul'); out.tbeditorPortal = await tbeditor(page, `${P}-portallayout`);
    out.tokens = await page.evaluate(() => { const s = getComputedStyle(document.documentElement); const el = document.createElement('div'); el.style.color = 'var(--zk-color-on-surface-variant)'; document.body.appendChild(el); const c = getComputedStyle(el).color; el.style.color = 'var(--zk-color-primary)'; const p = getComputedStyle(el).color; el.remove(); return { onSurfaceVariantRaw: s.getPropertyValue('--zk-color-on-surface-variant').trim(), onSurfaceVariantComputed: c, primaryComputed: p }; });
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'tbeditor.zul'); out.tbeditorPage = await tbeditor(page, `${P}-tbeditor`); out.tbeditorStates = await states(page, `${P}-tbeditor`); await ctx.close(); }
  // fresh contexts: states() leaves the editor in View HTML + fullscreen mode (it clicks every button once)
  { const { ctx, page } = await L.open(browser, 'tbeditor.zul'); out.tbeditorDisabled = await disabledState(page, `${P}-tbeditor`); await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'tbeditor.zul'); out.tbeditorDropdown = await dropdown(page, `${P}-tbeditor`); await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'toolbar.zul'); out.lucideToolbar = await lucide(page, '.z-toolbarbutton [class*=z-icon-]', `${P}-toolbar-lucide`, 10); await ctx.close(); }
  L.save(`${P}.json`, out);
  await browser.close();
  console.log('tokens', JSON.stringify(out.tokens));
  for (const [k, T] of [['PORTAL', out.tbeditorPortal], ['TBPAGE', out.tbeditorPage]]) {
    console.log(k, 'pane', JSON.stringify(T.pane.rect), 'rows', JSON.stringify(T.rows), 'gaps', JSON.stringify(T.gaps));
    console.log(k, 'groups', JSON.stringify(T.groups.map(g => [g.rect.l, g.rect.w, g.rect.h, g.before, g.beforeBox.w, g.beforeBox.h, g.beforeBox.bg])));
    for (const b of T.buttons) console.log(k, 'TB', b.title.padEnd(24), '| btn', b.rect.w + 'x' + b.rect.h, '| svg', b.svg && (b.svg.rect.w + 'x' + b.svg.rect.h), 'at', b.svg && [b.svg.rect.l, b.svg.rect.t], 'in btn', b.svg && (b.svg.rect.l >= b.rect.l && b.svg.rect.t >= b.rect.t && b.svg.rect.r <= b.rect.r && b.svg.rect.b <= b.rect.b), '| fill', b.svg && b.svg.fill, 'color', b.svg && b.svg.color, 'opacity', b.svg && b.svg.opacity, '| bbox', b.pixel.bbox && (b.pixel.bbox.w + 'x' + b.pixel.bbox.h), 'thick', b.pixel.thicknessCss, 'core', b.pixel.coreThicknessCss, 'runMed', JSON.stringify(b.pixel.runMedianCss), 'ink', JSON.stringify(b.pixel.inkMedian), 'dark', JSON.stringify(b.pixel.darkest));
    console.log(k, 'J61-3 darkest pairwise: worst', JSON.stringify(T.j613.worst), 'pairs>3:', T.j613.over3.length, '/', T.j613.nPairs, JSON.stringify(T.j613.over3.slice(0, 10)));
  }
  for (const s of out.tbeditorStates) console.log('ST', s.title.padEnd(24), '| rest', s.rest.bg, s.rest.svgFill, s.rest.svgOpacity, JSON.stringify(s.rest.pixel.inkMedian), JSON.stringify(s.rest.pixel.darkest), '| hover', s.hover.hover, s.hover.bg, s.hover.svgFill, s.hover.svgOpacity, 'ink', JSON.stringify(s.hover.pixel.inkMedian), 'dark', JSON.stringify(s.hover.pixel.darkest), 'bg', JSON.stringify(s.hover.pixel.buttonBg), '| active', s.active.active, s.active.bg, s.active.svgFill, s.active.svgOpacity, 'ink', JSON.stringify(s.active.pixel.inkMedian), 'dark', JSON.stringify(s.active.pixel.darkest), 'bg', JSON.stringify(s.active.pixel.buttonBg));
  for (const b of out.tbeditorDisabled.buttons) console.log('DIS', b.title.padEnd(24), '| attr', b.disabledAttr, 'cls', b.disabledClass, '| btnOpacity', b.btnOpacity, 'cursor', b.cursor, 'pe', b.pointerEvents, '| svg', b.svgFill, b.svgColor, 'op', b.svgOpacity, '| ink', JSON.stringify(b.pixel.inkMedian), 'dark', JSON.stringify(b.pixel.darkest), 'bg', JSON.stringify(b.pixel.buttonBg));
  console.log('DIS restored disabled count', out.tbeditorDisabled.restoredDisabledCount);
  if (out.tbeditorDropdown) for (const s of out.tbeditorDropdown.svgs) console.log('DD', s.btn.padEnd(16), '| rect', s.rect.w + 'x' + s.rect.h, 'css', s.width, s.height, '| fill', s.fill, 'color', s.color, 'op', s.opacity, '| ink', JSON.stringify(s.pixel.inkMedian), 'dark', JSON.stringify(s.pixel.darkest));
  for (const e of out.lucideToolbar) console.log('LT', e.cls.padEnd(30), '| rect', e.rect.w + 'x' + e.rect.h, '| before', e.before.w, e.before.h, '| ink bbox', e.pixel.bbox && (e.pixel.bbox.w + 'x' + e.pixel.bbox.h), 'thick', e.pixel.thicknessCss, 'core', e.pixel.coreThicknessCss, 'ink', JSON.stringify(e.pixel.inkMedian));
})().catch(e => { console.error(e); process.exit(1); });
