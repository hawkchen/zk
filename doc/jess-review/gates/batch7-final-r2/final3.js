// Batch 7 FINAL (copied from batch7-red/red3.js, only output names changed), #3 bandbox listbox blue strip. Launched WITHOUT Playwright's --hide-scrollbars so the body's vertical
// scrollbar takes layout width (see probe-scrollbar.js). Pixel measurements + elementsFromPoint root-cause evidence.
const L = require('./lib.js');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });

// geometry of one listbox element (by index among .z-listbox on the page)
async function lbGeom(page, i) {
  return page.evaluate(({ i, Rs }) => { const R = new Function('return ' + Rs)(); const lb = document.querySelectorAll('.z-listbox')[i]; const body = lb.querySelector('.z-listbox-body'); const head = lb.querySelector('.z-listbox-header');
    const sbw = body.offsetWidth - body.clientWidth; const br = body.getBoundingClientRect();
    return { lb: R(lb), head: R(head), body: R(body), sbw, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight, sbCol: { x0: br.right - sbw, x1: br.right },
      ths: [...lb.querySelectorAll('.z-listbox-header th')].map(t => ({ cls: t.className, rect: R(t) })), tds: [...lb.querySelectorAll('.z-listbox-body tr')].slice(0, 1).flatMap(tr => [...tr.children].map(t => ({ cls: t.className, rect: R(t) }))),
      rows: [...lb.querySelectorAll('.z-listbox-body tr.z-listitem')].map(tr => ({ cls: tr.className, rect: R(tr) })) }; }, { i, Rs: R.toString() });
}
// root cause evidence: what is under the header-end cell, and which element paints its background
async function under(page, x, y) {
  return page.evaluate(({ x, y }) => document.elementsFromPoint(x, y).slice(0, 8).map(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { tag: e.tagName, cls: e.className && e.className.baseVal === undefined ? e.className : '', bg: cs.backgroundColor, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)) }; }), { x, y });
}
// strip measurements: strip cell colour, header blank colour, dE; vertical strip scan over the listbox for other bluish bars
function stripMeasure(S, g) {
  const hy0 = g.head.t + 2, hy1 = g.head.b - 3; // header row, inset
  const strip = g.sbw > 0 ? L.median(S.rect(g.sbCol.x0 + 1, g.sbCol.x1 - 2, hy0, hy1).map(p => p.c)) : null;
  // header blank: around the boundary between the two header cells (x = th[1].l +- 6), full header height inset
  const bx = g.ths[1].rect.l; const blank = L.median(S.rect(bx - 6, bx + 6, hy0, hy1).map(p => p.c));
  const blankFar = L.median(S.rect(g.ths[0].rect.l + 2, g.ths[0].rect.l + 8, hy0, hy1).map(p => p.c)); // left edge of the first header cell (no text)
  // scrollbar track / thumb in the body column
  let sb = null; if (g.sbw > 0) { const col = S.rect(g.sbCol.x0, g.sbCol.x1 - 1, g.body.t + 1, g.body.b - 2); const d = S.dpr; const rowsMap = new Map(); for (const p of col) { if (!rowsMap.has(p.dy)) rowsMap.set(p.dy, []); rowsMap.get(p.dy).push(p.c); }
    const rows = [...rowsMap.entries()].sort((a, b) => a[0] - b[0]).map(([dy, cs]) => ({ y: dy / d, c: L.median(cs) }));
    const white = [255, 255, 255]; const dark = rows.filter(r => L.dE(r.c, white) >= 8); const light = rows.filter(r => L.dE(r.c, white) < 8);
    sb = { widthCss: g.sbw, thumb: dark.length ? { color: L.median(dark.map(r => r.c)), top: dark[0].y, bottom: dark[dark.length - 1].y + 1 / d } : null, track: light.length ? { color: L.median(light.map(r => r.c)), rows: light.length } : null }; }
  // vertical bar scan: per CSS-px column over the body area, median colour; runs of bluish/non-white columns
  const bars = []; { const y0 = g.body.t + 1, y1 = g.body.b - 2; let run = null; for (let x = Math.ceil(g.lb.l) + 1; x < Math.floor(g.lb.r) - 1; x++) { const c = L.median(S.rect(x, x, y0, y1).map(p => p.c)); const d = L.dE(c, [255, 255, 255]); const bluish = c[2] > c[0] + 2;
      if (d >= 4) { if (run && L.dE(run.c, c) < 3) { run.x1 = x + 1; } else { run = { x0: x, x1: x + 1, c, dE: +d.toFixed(2), bluish }; bars.push(run); } } else run = null; } }
  return { strip, blank, blankFar, dE_strip_blank: strip ? +L.dE(strip, blank).toFixed(2) : null, dE_strip_blankFar: strip ? +L.dE(strip, blankFar).toFixed(2) : null, dE_blank_blankFar: +L.dE(blank, blankFar).toFixed(2), scrollbar: sb, bars };
}
function colAlign(g) { return g.ths.filter(t => t.cls.indexOf('z-listhead-bar') < 0).map((t, i) => ({ col: i, thL: t.rect.l, thR: t.rect.r, tdL: g.tds[i] && g.tds[i].rect.l, tdR: g.tds[i] && g.tds[i].rect.r, dL: g.tds[i] ? +(t.rect.l - g.tds[i].rect.l).toFixed(3) : null, dR: g.tds[i] ? +(t.rect.r - g.tds[i].rect.r).toFixed(3) : null })); }

(async () => {
  const browser = await launch();
  const out = { chromium: browser.version(), bandbox: {}, plain: {} };
  // ---- bandbox.zul: open the rich bandbox (last .z-bandbox on the page)
  async function openRich(page) {
    const info = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const bbs = [...document.querySelectorAll('.z-bandbox')]; const rich = bbs[bbs.length - 1]; return { idx: bbs.length - 1, rect: R(rich), button: R(rich.querySelector('.z-bandbox-button')) }; }, R.toString());
    await page.mouse.click(info.button.l + info.button.w / 2, info.button.t + info.button.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const pp = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const pp = document.querySelector('.z-bandpopup'); const cs = getComputedStyle(pp); const lbs = [...document.querySelectorAll('.z-listbox')];
      const outer = pp.closest('.z-bandbox-popup'); const ocs = getComputedStyle(outer);
      return { rect: R(pp), cs: { shadow: cs.boxShadow, border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius, minWidth: cs.minWidth, width: cs.width, bg: cs.backgroundColor, padding: cs.padding },
        outer: { cls: outer.className, rect: R(outer), cs: { shadow: ocs.boxShadow, border: ocs.borderTopWidth + ' ' + ocs.borderTopStyle + ' ' + ocs.borderTopColor, radius: ocs.borderTopLeftRadius, minWidth: ocs.minWidth, width: ocs.width, bg: ocs.backgroundColor, padding: ocs.padding } },
        lbIndex: lbs.indexOf(pp.querySelector('.z-listbox')) }; }, R.toString());
    return { info, pp };
  }
  { const { ctx, page } = await L.open(browser, 'bandbox.zul'); const { info, pp } = await openRich(page);
    const g = await lbGeom(page, pp.lbIndex);
    const cx = g.sbCol.x0 + g.sbw / 2, cy = (g.head.t + g.head.b) / 2;
    const stack = g.sbw > 0 ? await under(page, cx, cy) : 'no scrollbar width';
    const O = pp.outer.rect;
    const S = await L.shot(page, 'final3-bandbox-open.png', { x: O.l - 14, y: info.rect.t - 10, width: O.w + 28, height: O.b - info.rect.t + 24 });
    const m = stripMeasure(S, g);
    // popup outer-edge pixel checks (c): per-row median colour below the outer popup frame (shadow), and the frame's top-left corner pixel
    const below = []; for (let dy = 0; dy < 12; dy++) below.push(L.median(S.rect(O.l + 20, O.r - 20, O.b + dy, O.b + dy).map(p => p.c)));
    const rightOf = []; for (let dx = 0; dx < 12; dx++) rightOf.push(L.median(S.rect(O.r + dx, O.r + dx, O.t + 20, O.b - 20).map(p => p.c)));
    const corner = S.at(Math.round(O.l * S.dpr), Math.round(O.t * S.dpr)), cornerIn = S.at(Math.round((O.l + 1) * S.dpr), Math.round((O.t + 1) * S.dpr));
    out.bandbox.frame = { outer: pp.outer, shadowBelowRows: below, shadowRightCols: rightOf, cornerPx: corner, cornerInPx: cornerIn };
    out.bandbox.open = { bandbox: info, popup: pp, geom: g, stack, measure: m, colAlign: colAlign(g), shadowBelowRows: below };
    await L.shot(page, 'final3-bandbox-strip-zoom.png', { x: g.sbCol.x0 - 30, y: g.head.t - 10, width: g.sbw + 40, height: g.head.h + 40 });
    // (d) row hover then selected
    const row0 = g.rows[0].rect; const sampleRow = async (file) => { const S2 = await L.shot(page, file, { x: g.lb.l, y: row0.t, width: g.lb.w, height: row0.h }); return L.median(S2.rect(g.tds[1].rect.r - 30, g.tds[1].rect.r - 4, row0.t + 4, row0.b - 5).map(p => p.c)); };
    const restRow = await sampleRow('final3-row-rest.png');
    await page.mouse.move(row0.l + row0.w / 2, row0.t + row0.h / 2); await page.waitForTimeout(300); const hoverRow = await sampleRow('final3-row-hover.png');
    await page.mouse.click(row0.l + row0.w / 2, row0.t + row0.h / 2); await L.settle(page); const popupStillOpen = await page.evaluate(() => { const pp = document.querySelector('.z-bandpopup'); return !!pp && getComputedStyle(pp).display !== 'none' && pp.getBoundingClientRect().height > 0; });
    let selectedRow = null, selectedHoverRow = null, selectedCls = null;
    if (popupStillOpen) { selectedHoverRow = await sampleRow('final3-row-selected-hover.png'); await page.mouse.move(2, 2); await page.waitForTimeout(300); selectedRow = await sampleRow('final3-row-selected.png'); selectedCls = await page.evaluate(() => document.querySelector('.z-bandpopup .z-listitem').className); }
    out.bandbox.rowStates = { rest: restRow, hover: hoverRow, dE_hover: +L.dE(restRow, hoverRow).toFixed(2), popupStillOpenAfterClick: popupStillOpen, selected: selectedRow, selectedHover: selectedHoverRow, dE_selected: selectedRow ? +L.dE(restRow, selectedRow).toFixed(2) : null, selectedCls };
    await ctx.close(); }
  // (f) plain "Content" bandbox (first on the page): open, record popup rect/cs and the popup's pixel average
  { const { ctx, page } = await L.open(browser, 'bandbox.zul');
    const info = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const bb = document.querySelector('.z-bandbox'); return { rect: R(bb), button: R(bb.querySelector('.z-bandbox-button')) }; }, R.toString());
    await page.mouse.click(info.button.l + info.button.w / 2, info.button.t + info.button.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const pp = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const pp = document.querySelector('.z-bandpopup'); const cs = getComputedStyle(pp); return { rect: R(pp), text: pp.textContent.trim(), cs: { shadow: cs.boxShadow, border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius, minWidth: cs.minWidth, width: cs.width, bg: cs.backgroundColor, padding: cs.padding, font: cs.font } }; }, R.toString());
    const S = await L.shot(page, 'final3-bandbox-content-open.png', { x: pp.rect.l - 10, y: info.rect.t - 10, width: Math.max(pp.rect.w, info.rect.w) + 20, height: pp.rect.b - info.rect.t + 20 });
    const px = S.rect(pp.rect.l, pp.rect.r - 1, pp.rect.t, pp.rect.b - 1); const avg = [0, 1, 2].map(i => +(px.reduce((s, p) => s + p.c[i], 0) / px.length).toFixed(3));
    out.bandbox.content = { bandbox: info, popup: pp, popupAvgColor: avg, nPx: px.length };
    await ctx.close(); }
  // ---- scope check: plain listboxes
  // listbox.zul: find any listbox whose body scrolls vertically (none expected: probe-dom.json); also the frozen one (horizontal scrollbar only)
  { const { ctx, page } = await L.open(browser, 'listbox.zul');
    const scan = await page.evaluate(() => [...document.querySelectorAll('.z-listbox')].map((lb, i) => { const body = lb.querySelector('.z-listbox-body'); const bar = lb.querySelector('.z-listhead-bar'); return { i, sbw: body ? body.offsetWidth - body.clientWidth : null, scrollH: body && body.scrollHeight, clientH: body && body.clientHeight, vScroll: body ? body.scrollHeight > body.clientHeight : null, barW: bar ? bar.getBoundingClientRect().width : null, barBg: bar ? getComputedStyle(bar).backgroundColor : null }; }));
    out.plain['listbox.zul'] = { scan };
    const cand = scan.find(s => s.vScroll && s.sbw > 0);
    if (cand) { const g = await lbGeom(page, cand.i); await page.evaluate(y => window.scrollTo(0, Math.max(0, y - 100)), g.lb.t); await page.waitForTimeout(300); const g2 = await lbGeom(page, cand.i);
      const S = await L.shot(page, 'final3-listbox-natural.png', { x: g2.lb.l - 10, y: g2.lb.t - 10, width: g2.lb.w + 20, height: g2.lb.h + 20 }); out.plain['listbox.zul'].natural = { i: cand.i, geom: g2, stack: await under(page, g2.sbCol.x0 + g2.sbw / 2, (g2.head.t + g2.head.b) / 2), measure: stripMeasure(S, g2), colAlign: colAlign(g2) }; }
    // supplementary: give the first plain listbox (Row States, 280px) a height through the widget API at runtime (no file, no CSS injection) so its body scrolls
    await page.evaluate(() => { const lb = document.querySelectorAll('.z-listbox')[0]; zk.$(lb).setHeight('150px'); });
    await L.settle(page); await page.mouse.move(2, 2);
    const g = await lbGeom(page, 0);
    const S = await L.shot(page, 'final3-listbox-forced-height.png', { x: g.lb.l - 10, y: g.lb.t - 10, width: g.lb.w + 20, height: g.lb.h + 20 });
    out.plain['listbox.zul'].forcedHeight = { note: 'listbox[0] setHeight(150px) via zk widget API at runtime', geom: g, stack: g.sbw > 0 ? await under(page, g.sbCol.x0 + g.sbw / 2, (g.head.t + g.head.b) / 2) : 'no scrollbar width', measure: stripMeasure(S, g), colAlign: colAlign(g) };
    await L.shot(page, 'final3-listbox-forced-height-zoom.png', { x: g.sbCol.x0 - 30, y: g.head.t - 10, width: g.sbw + 40, height: g.head.h + 40 });
    await ctx.close(); }
  // listbox-header.zul #9: a plain <listbox height="200px"> that scrolls vertically out of the box
  { const { ctx, page } = await L.open(browser, 'listbox-header.zul');
    const g0 = await lbGeom(page, 9); await page.evaluate(y => window.scrollTo(0, Math.max(0, y - 100)), g0.lb.t); await page.waitForTimeout(400); await page.mouse.move(2, 2);
    const g = await lbGeom(page, 9);
    const S = await L.shot(page, 'final3-listbox-header9.png', { x: g.lb.l - 10, y: g.lb.t - 10, width: g.lb.w + 20, height: g.lb.h + 20 });
    out.plain['listbox-header.zul#9'] = { geom: g, stack: g.sbw > 0 ? await under(page, g.sbCol.x0 + g.sbw / 2, (g.head.t + g.head.b) / 2) : 'no scrollbar width', measure: stripMeasure(S, g), colAlign: colAlign(g) };
    await L.shot(page, 'final3-listbox-header9-zoom.png', { x: g.sbCol.x0 - 30, y: g.head.t - 10, width: g.sbw + 40, height: g.head.h + 40 });
    await ctx.close(); }
  await browser.close();
  L.save('final3.json', out);
  const b = out.bandbox.open; console.log('bandbox popup', JSON.stringify(b.popup)); console.log('geom sbw', b.geom.sbw, 'sbCol', JSON.stringify(b.geom.sbCol), 'head', JSON.stringify(b.geom.head), 'ths', JSON.stringify(b.geom.ths));
  console.log('stack', JSON.stringify(b.stack)); console.log('measure', JSON.stringify(b.measure)); console.log('colAlign', JSON.stringify(b.colAlign)); console.log('shadowBelow', JSON.stringify(b.shadowBelowRows));
  console.log('rowStates', JSON.stringify(out.bandbox.rowStates)); console.log('content popup', JSON.stringify(out.bandbox.content));
  for (const k of Object.keys(out.plain)) { const p = out.plain[k]; console.log('PLAIN', k, JSON.stringify(p.scan || '')); for (const kk of ['natural', 'forcedHeight']) if (p[kk]) console.log(' ', kk, 'sbw', p[kk].geom.sbw, 'stack', JSON.stringify(p[kk].stack), 'measure', JSON.stringify(p[kk].measure)); if (p.geom) console.log('  sbw', p.geom.sbw, 'stack', JSON.stringify(p.stack), 'measure', JSON.stringify(p.measure), 'colAlign', JSON.stringify(p.colAlign)); }
})();
