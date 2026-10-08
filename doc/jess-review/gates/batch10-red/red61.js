// #61 RED exploration: tbeditor toolbar icons vs the framework's standard (Lucide mask) icons.
// Per tbeditor button: render method (svg<use> sprite symbol), svg rect, symbol viewBox, computed fill/color/stroke, button rect/padding,
// group borders (separators) and gaps; pixel metrics from a DPR-2 screenshot: ink bbox (rendered glyph size), ink colour median,
// stroke thickness = median run length of ink pixels along rows / columns. Same pixel metrics for Lucide icons on toolbar.zul
// (toolbarbutton iconSclass, the framework's toolbar context), button.zul (icon-only button) and utility/icons.zul (24px gallery).
// Output: red61.json + red61-*.png
const L = require('./lib');
const BG_THR = 18;

function inkMetrics(S, r, bg) {
  const px = S.rect(r.l, r.r - 1, r.t, r.b - 1); const inkPx = px.filter(p => L.dE(p.c, bg) >= BG_THR);
  if (!inkPx.length) return { n: 0 };
  const xs = inkPx.map(p => p.dx), ys = inkPx.map(p => p.dy);
  const bbox = { l: Math.min(...xs) / S.dpr, r: (Math.max(...xs) + 1) / S.dpr, t: Math.min(...ys) / S.dpr, b: (Math.max(...ys) + 1) / S.dpr };
  bbox.w = +(bbox.r - bbox.l).toFixed(2); bbox.h = +(bbox.b - bbox.t).toFixed(2);
  const set = new Set(inkPx.map(p => p.dx + ',' + p.dy));
  const runs = (horiz) => { const out = []; const keys = horiz ? [...new Set(ys)] : [...new Set(xs)]; for (const k of keys) { const line = inkPx.filter(p => (horiz ? p.dy : p.dx) === k).map(p => horiz ? p.dx : p.dy).sort((a, b) => a - b); let run = 1; for (let i = 1; i <= line.length; i++) { if (i < line.length && line[i] === line[i - 1] + 1) run++; else { out.push(run); run = 1; } } } return out.sort((a, b) => a - b); };
  const hr = runs(true), vr = runs(false); const med = a => a.length ? a[Math.floor(a.length / 2)] : 0; const p25 = a => a.length ? a[Math.floor(a.length / 4)] : 0;
  // solid (dark) ink only: pixels close to the darkest colour -> stroke core thickness without the anti-aliased fringe
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
    const groups = [...pane.querySelectorAll('.z-tbeditor-button-group')].map(g => { const s = getComputedStyle(g); return { rect: R(g), borderLeft: s.borderLeftWidth + ' ' + s.borderLeftStyle + ' ' + s.borderLeftColor, borderRight: s.borderRightWidth + ' ' + s.borderRightStyle + ' ' + s.borderRightColor, margin: s.margin, padding: s.padding, gap: s.gap, display: s.display, before: getComputedStyle(g, '::before').content, after: getComputedStyle(g, '::after').content }; });
    const gaps = groups.slice(1).map((g, i) => +(g.rect.l - groups[i].rect.r).toFixed(2));
    const buttons = [...pane.querySelectorAll('button')].map(b => { const s = getComputedStyle(b); const svg = b.querySelector('svg'); const ss = svg && getComputedStyle(svg); const use = svg && svg.querySelector('use'); const href = use && (use.getAttribute('xlink:href') || use.getAttribute('href')); const sym = href && document.querySelector(href); const paths = sym ? [...sym.querySelectorAll('path, rect, circle, line, polyline, polygon')] : []; const bf = getComputedStyle(b, '::before');
      return { title: b.title, cls: b.className.trim(), rect: R(b), padding: s.padding, width: s.width, height: s.height, minWidth: s.minWidth, bg: s.backgroundColor, color: s.color, border: s.borderWidth + ' ' + s.borderStyle, borderRadius: s.borderRadius, display: s.display, fontSize: s.fontSize, before: bf.content, render: svg ? 'svg<use>' : (b.querySelector('img') ? 'img' : (bf.content !== 'none' ? 'pseudo' : 'text:' + b.textContent.trim())), svg: svg ? { rect: R(svg), width: ss.width, height: ss.height, fill: ss.fill, color: ss.color, stroke: ss.stroke, strokeWidth: ss.strokeWidth, display: ss.display, viewBoxAttr: svg.getAttribute('viewBox'), href, symbolViewBox: sym && sym.getAttribute('viewBox'), symbolShapes: paths.length, shapeStroke: paths.slice(0, 3).map(p => (p.getAttribute('stroke') || '') + '/' + (p.getAttribute('stroke-width') || '') + '/' + (p.getAttribute('fill') || '')), symbolAttrs: sym && [...sym.attributes].map(a => a.name + '=' + a.value.slice(0, 30)).join(' ') } : null }; });
    return { edRect: R(ed), pane: { rect: R(pane), padding: ps.padding, gap: ps.gap, display: ps.display, flexWrap: ps.flexWrap, bg: ps.backgroundColor, borderBottom: ps.borderBottomWidth + ' ' + ps.borderBottomColor }, groups, gaps, buttons, rows: [...new Set(buttons.map(b => b.rect.t))] };
  });
  // no scrolling: the toolbar is inside the initial viewport on both pages (portallayout y=233, tbeditor y=159)
  const d2 = await page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; const pane = document.querySelector('.z-tbeditor-button-pane'); return { pane: R(pane), buttons: [...pane.querySelectorAll('button')].map(b => ({ rect: R(b), svg: b.querySelector('svg') && R(b.querySelector('svg')) })) }; });
  const S = await L.shot(page, `${prefix}-toolbar.png`, { x: d2.pane.l - 8, y: d2.pane.t - 8, width: d2.pane.w + 16, height: d2.pane.h + 16 });
  const bg = L.median(S.rect(d2.pane.l + 2, d2.pane.l + 5, d2.pane.t + 2, d2.pane.t + 5).map(p => p.c));
  d.paneBgPixel = bg;
  d.buttons.forEach((b, i) => { const r = d2.buttons[i].rect; const bbg = L.median([...S.rect(r.l + 1, r.l + 2, r.t + 1, r.t + 2), ...S.rect(r.r - 3, r.r - 2, r.b - 3, r.b - 2)].map(p => p.c)); b.pixel = inkMetrics(S, { l: r.l + 1, r: r.r - 1, t: r.t + 1, b: r.b - 1 }, bbg); b.pixel.buttonBg = bbg; });
  return d;
}
async function lucide(page, sel, prefix, limit = 12) {
  const d = await page.evaluate(({ sel, limit }) => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    return [...document.querySelectorAll(sel)].slice(0, limit).map(e => { const s = getComputedStyle(e); const b = getComputedStyle(e, '::before'); const host = e.closest('.z-toolbarbutton, .z-button') || e.parentElement; const hs = getComputedStyle(host); return { cls: e.className, rect: R(e), fontSize: s.fontSize, width: s.width, height: s.height, display: s.display, color: s.color, bg: s.backgroundColor, mask: (s.webkitMaskImage || s.maskImage || 'none').slice(0, 90), before: { content: b.content, w: b.width, h: b.height, bg: b.backgroundColor, color: b.color, mask: (b.webkitMaskImage || b.maskImage || 'none').slice(0, 90), display: b.display }, host: { cls: host.className.slice(0, 50), rect: R(host), padding: hs.padding, bg: hs.backgroundColor, color: hs.color } }; });
  }, { sel, limit });
  if (!d.length) return d;
  for (const e of d) { await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); el.scrollIntoView({ block: 'center' }); }, e.cls); await page.waitForTimeout(150);
    const r = await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); const x = el.getBoundingClientRect(); const h = (el.closest('.z-toolbarbutton, .z-button') || el.parentElement).getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height, host: { l: h.left, t: h.top, r: h.right, b: h.bottom, w: h.width, h: h.height } }; }, e.cls);
    const S = await L.shot(page, null, { x: r.host.l - 6, y: r.host.t - 6, width: r.host.w + 12, height: r.host.h + 12 });
    // local background = the host's own interior corner (filled buttons are blue; toolbarbuttons / gallery are transparent)
    const bg = L.median(S.rect(r.host.l + 3, r.host.l + 5, r.host.t + 3, r.host.t + 5).map(p => p.c));
    e.pixel = inkMetrics(S, { l: r.l - 1, r: r.r + 1, t: r.t - 1, b: r.b + 1 }, bg); e.pixel.bg = bg; e.viewportRect = r; }
  // one overview screenshot around the first host
  const r0 = d[0].viewportRect.host; await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); el.scrollIntoView({ block: 'center' }); }, d[0].cls); await page.waitForTimeout(150);
  const rr = await page.evaluate((cls) => { const el = [...document.querySelectorAll('[class]')].find(x => x.className === cls); const h = (el.closest('.z-toolbar') || el.closest('.z-toolbarbutton, .z-button') || el.parentElement.parentElement).getBoundingClientRect(); return { l: h.left, t: h.top, w: h.width, h: h.height }; }, d[0].cls);
  await L.shot(page, `${prefix}.png`, { x: rr.l - 8, y: rr.t - 8, width: Math.min(rr.w + 16, 1000), height: rr.h + 16 });
  return d;
}
(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'ink = pixels with CIE76 dE >= ' + BG_THR + ' from the local background (DPR 2); thickness = median run length of ink pixels (rows/cols), core = pixels within dE 12 of the darkest ink pixel' };
  { const { ctx, page } = await L.open(browser, 'portallayout.zul'); out.tbeditorPortal = await tbeditor(page, 'red61-portallayout');
    // cause-finding experiments (in-page addStyleTag only): give the <svg> an explicit box and re-measure glyph size / stroke
    out.tbeditorExperiments = {};
    for (const [name, css] of Object.entries({ X1_svg17: '.z-tbeditor-button-pane button svg{width:17px!important;height:17px!important}', X2_svg14: '.z-tbeditor-button-pane button svg{width:14px!important;height:14px!important}', X3_svg20: '.z-tbeditor-button-pane button svg{width:20px!important;height:20px!important}' })) {
      const h = await page.addStyleTag({ content: css }); await page.waitForTimeout(250);
      const d = await tbeditor(page, 'red61-exp-' + name);
      out.tbeditorExperiments[name] = { css, buttons: d.buttons.map(b => ({ title: b.title, btn: [b.rect.w, b.rect.h], svg: b.svg && [b.svg.rect.w, b.svg.rect.h], bbox: b.pixel.bbox && [b.pixel.bbox.w, b.pixel.bbox.h], thickness: b.pixel.thicknessCss, core: b.pixel.coreThicknessCss, ink: b.pixel.inkMedian })), rows: d.rows, paneRect: d.pane.rect };
      await h.evaluate(e => e.remove()); await page.waitForTimeout(200);
    }
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'tbeditor.zul'); out.tbeditorPage = await tbeditor(page, 'red61-tbeditor'); await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'toolbar.zul'); out.lucideToolbar = await lucide(page, '.z-toolbarbutton [class*=z-icon-]', 'red61-toolbar-lucide', 10); await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'button.zul'); out.lucideButton = await lucide(page, '.z-button [class*=z-icon-]', 'red61-button-lucide', 3); await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'utility/icons.zul'); const names = ['code', 'undo', 'redo', 'pilcrow', 'bold', 'italic', 'strikethrough', 'superscript', 'subscript', 'link', 'image', 'align-left', 'align-center', 'align-right', 'align-justify', 'list', 'list-ordered', 'minus', 'remove-formatting', 'maximize'];
    out.lucideGallery24 = []; for (const n of names) { const r = await lucide(page, `.z-icon-${n}.z-text-3xl`, 'red61-gallery-' + n, 1); if (r.length) out.lucideGallery24.push({ name: n, ...r[0] }); }
    await ctx.close(); }
  L.save('red61.json', out);
  await browser.close();
  const T = out.tbeditorPortal;
  console.log('pane', JSON.stringify(T.pane), 'rows', JSON.stringify(T.rows), 'gaps', JSON.stringify(T.gaps));
  console.log('groups', JSON.stringify(T.groups.slice(0, 3)));
  for (const b of T.buttons) console.log('TB', b.title.padEnd(22), '| btn', b.rect.w + 'x' + b.rect.h, 'pad', b.padding, '| render', b.render, '| svg', b.svg && (b.svg.rect.w + 'x' + b.svg.rect.h), b.svg && b.svg.symbolViewBox, 'shapes', b.svg && b.svg.symbolShapes, JSON.stringify(b.svg && b.svg.shapeStroke), '| fill', b.svg && b.svg.fill, 'color', b.svg && b.svg.color, 'stroke', b.svg && b.svg.stroke, b.svg && b.svg.strokeWidth, '| ink bbox', b.pixel.bbox && (b.pixel.bbox.w + 'x' + b.pixel.bbox.h), 'thick', b.pixel.thicknessCss, 'core', b.pixel.coreThicknessCss, 'runMed', JSON.stringify(b.pixel.runMedianCss), 'ink', JSON.stringify(b.pixel.inkMedian), 'dark', JSON.stringify(b.pixel.darkest), 'cov', b.pixel.inkCoverage);
  for (const [n, e] of Object.entries(out.tbeditorExperiments)) console.log('EXP', n, 'rows', JSON.stringify(e.rows), 'pane', JSON.stringify(e.paneRect), JSON.stringify(e.buttons.map(b => [b.title.slice(0, 12), b.btn, b.svg, b.bbox, b.thickness, b.core])));
  for (const e of out.lucideToolbar) console.log('LT', e.cls.padEnd(30), '| rect', e.rect.w + 'x' + e.rect.h, 'fs', e.fontSize, '| before', e.before.w, e.before.h, e.before.bg, e.before.mask.slice(0, 40), '| host', e.host.rect.w + 'x' + e.host.rect.h, e.host.padding, '| ink bbox', e.pixel.bbox && (e.pixel.bbox.w + 'x' + e.pixel.bbox.h), 'thick', e.pixel.thicknessCss, 'core', e.pixel.coreThicknessCss, 'runMed', JSON.stringify(e.pixel.runMedianCss), 'ink', JSON.stringify(e.pixel.inkMedian), 'dark', JSON.stringify(e.pixel.darkest), 'cov', e.pixel.inkCoverage);
  for (const e of out.lucideButton) console.log('LB', e.cls.padEnd(30), '| rect', e.rect.w + 'x' + e.rect.h, 'fs', e.fontSize, '| before', e.before.w, e.before.h, e.before.bg, '| host', e.host.rect.w + 'x' + e.host.rect.h, '| ink bbox', e.pixel.bbox && (e.pixel.bbox.w + 'x' + e.pixel.bbox.h), 'thick', e.pixel.thicknessCss, 'core', e.pixel.coreThicknessCss, 'ink', JSON.stringify(e.pixel.inkMedian));
  for (const e of out.lucideGallery24) console.log('LG', e.name.padEnd(20), '| rect', e.rect.w + 'x' + e.rect.h, 'fs', e.fontSize, '| before', e.before.w, e.before.h, e.before.bg, '| ink bbox', e.pixel.bbox && (e.pixel.bbox.w + 'x' + e.pixel.bbox.h), 'thick', e.pixel.thicknessCss, 'core', e.pixel.coreThicknessCss, 'runMed', JSON.stringify(e.pixel.runMedianCss), 'ink', JSON.stringify(e.pixel.inkMedian), 'cov', e.pixel.inkCoverage);
})().catch(e => { console.error(e); process.exit(1); });
