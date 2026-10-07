// #37 (D29-A): frozen-column divider in body + feasibility (any distinguishing marker on body frozen cells?)
const { chromium, open, settle, pixels, dE } = require('./lib');
const fs = require('fs');
const PAGES = { grid: ['grid.zul', '.z-grid', 4], listbox: ['listbox.zul', '.z-listbox', 5], tree: ['tree.zul', '.z-tree', 7] };

async function bandHasLine(page, x0, rowBox) {
  const clip = { x: Math.floor(x0 - 3), y: Math.floor(rowBox.y) + 3, width: 6, height: Math.max(1, Math.floor(rowBox.height) - 6) };
  const buf = await page.screenshot({ clip });
  const im = await pixels(page, buf);
  // row bg = modal colour in the band
  const cnt = new Map();
  for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  let maxDE = 0, cols = [];
  for (let x = 0; x < im.w; x++) { let m = 0; for (let y = 0; y < im.h; y++) { const i = (y * im.w + x) * 4; m = Math.max(m, dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg)); } cols.push(+m.toFixed(2)); maxDE = Math.max(maxDE, m); }
  // also: colours of the left-most and right-most pixel column at mid height (cells may differ in bg)
  const mid = Math.floor(im.h / 2); const px = x => { const i = (mid * im.w + x) * 4; return [im.d[i], im.d[i + 1], im.d[i + 2]]; };
  return { has: maxDE >= 2, bg, perColMaxDE: cols, midLeft: px(0), midRight: px(im.w - 1) };
}

async function measure(browser, key) {
  const [path, sel, idx] = PAGES[key];
  const { ctx, page } = await open(browser, path);
  const grid = page.locator(sel).nth(idx);
  await grid.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const out = { page: path };
  const hdrTh = grid.locator('th, .z-treecol, .z-listheader, .z-column').filter({ visible: true });
  const heads = await grid.evaluate(g => { const hs = [...g.querySelectorAll('.z-column,.z-listheader,.z-treecol')]; return hs.map(h => ({ cls: h.className, right: h.getBoundingClientRect().right, cs: (c => ({ boxShadow: c.boxShadow, borderRightWidth: c.borderRightWidth, borderRightColor: c.borderRightColor }))(getComputedStyle(h)) })); });
  out.headers = heads;
  const x0 = heads[1].right; out.x0 = x0;
  // header divider pixel check on header 2 (rows band = header box)
  const hb = await grid.evaluate(g => { const h = g.querySelectorAll('.z-column,.z-listheader,.z-treecol')[1].getBoundingClientRect(); return { y: h.y, height: h.height }; });
  out.headerLine = await bandHasLine(page, x0, hb);
  // body rows
  const rowSel = key === 'grid' ? '.z-row' : key === 'listbox' ? '.z-listitem' : '.z-treerow';
  const rows = grid.locator(rowSel);
  const n = Math.min(4, await rows.count()); out.rowCount = await rows.count();
  const dump = () => grid.evaluate((g, rs) => {
    const rows = [...g.querySelectorAll(rs)].slice(0, 4);
    return rows.map(r => [...r.cells].slice(0, 4).map(td => { const c = getComputedStyle(td); return { cls: td.className, attrs: td.getAttributeNames().sort().join(','), style: td.getAttribute('style'), inner: td.firstElementChild ? td.firstElementChild.className + '|' + (td.firstElementChild.getAttribute('style') || '') : null, cs: { position: c.position, zIndex: c.zIndex, transform: c.transform, boxShadow: c.boxShadow, borderRight: c.borderRightWidth + ' ' + c.borderRightStyle, bg: c.backgroundColor } }; }));
  }, rowSel);
  out.restCells = await dump();
  const distinguish = cells => { // rows -> any class/attr/style present on frozen cells (idx0,1) but not on idx2 (same row)?
    const res = [];
    cells.forEach((row, ri) => { const base = row[2]; for (const ci of [0, 1]) { const c = row[ci]; const diffs = [];
      const sc = new Set(c.cls.split(/\s+/).filter(Boolean)), bc = new Set(base.cls.split(/\s+/).filter(Boolean));
      const extraCls = [...sc].filter(x => !bc.has(x)); if (extraCls.length) diffs.push('class:' + extraCls.join('+'));
      const sa = new Set(c.attrs.split(',').filter(Boolean)), ba = new Set(base.attrs.split(',').filter(Boolean));
      const extraAttr = [...sa].filter(x => !ba.has(x)); if (extraAttr.length) diffs.push('attr:' + extraAttr.join('+'));
      if ((c.style || '') !== (base.style || '')) diffs.push('style:' + c.style + ' vs ' + base.style);
      if (c.inner !== base.inner) diffs.push('inner:' + c.inner + ' vs ' + base.inner);
      res.push({ row: ri, col: ci, diffs }); } });
    return res;
  };
  out.restDistinguishers = distinguish(out.restCells);
  const rowBoxes = []; for (let i = 0; i < n; i++) rowBoxes.push(await rows.nth(i).boundingBox());
  out.rest = [];
  for (const b of rowBoxes) out.rest.push(await bandHasLine(page, x0, b));
  out.restCount = out.rest.filter(r => r.has).length;
  // scroll .z-frozen-inner horizontally by 200
  const si = await grid.evaluate(g => { const f = g.querySelector('.z-frozen-inner') || g.querySelector('.z-frozen'); return f ? { cls: f.className, sw: f.scrollWidth, cw: f.clientWidth } : null; });
  out.frozenInner = si;
  await grid.evaluate(g => { const f = g.querySelector('.z-frozen-inner'); f.scrollLeft = 200; });
  await page.waitForTimeout(500);
  out.scrollLeftAfter = await grid.evaluate(g => g.querySelector('.z-frozen-inner').scrollLeft);
  out.scrolledCells = await dump();
  out.scrolledDistinguishers = distinguish(out.scrolledCells);
  const heads2 = await grid.evaluate(g => [...g.querySelectorAll('.z-column,.z-listheader,.z-treecol')].map(h => h.getBoundingClientRect().right));
  out.headRightsAfter = heads2.slice(0, 4);
  const x0b = heads2[1]; out.x0After = x0b; out.x0Shift = +(x0b - x0).toFixed(2);
  out.scrolledHeaderLine = await bandHasLine(page, x0b, hb);
  const rb2 = []; for (let i = 0; i < n; i++) rb2.push(await rows.nth(i).boundingBox());
  out.scrolled = []; for (const b of rb2) out.scrolled.push(await bandHasLine(page, x0b, b));
  out.scrolledCount = out.scrolled.filter(r => r.has).length;
  // hover opaque check (scrolled back to 0)
  await grid.evaluate(g => { g.querySelector('.z-frozen-inner').scrollLeft = 0; }); await page.waitForTimeout(400);
  const r0 = rows.nth(0); const rb = await r0.boundingBox();
  const cell0 = await r0.locator('td').nth(0).boundingBox();
  await page.mouse.move(cell0.x + cell0.width - 6, cell0.y + cell0.height - 4); await page.waitForTimeout(200);
  out.hover = await r0.evaluate(r => [...r.cells].slice(0, 3).map(td => { const painters = [td, ...td.querySelectorAll('*')].map(e => getComputedStyle(e).backgroundColor).filter(c => !/rgba\(.*,\s*0\)$|^transparent$/.test(c)); return painters; }));
  await ctx.close();
  return out;
}
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const k of Object.keys(PAGES)) res[k] = await measure(browser, k);
  // no-frozen grid: header col2 right edge band (grid.zul second grid)
  { const { ctx, page } = await open(browser, 'grid.zul'); const grid = page.locator('.z-grid').nth(1);
    const heads = await grid.evaluate(g => [...g.querySelectorAll('.z-column')].map(h => { const c = getComputedStyle(h); return { right: h.getBoundingClientRect().right, y: h.getBoundingClientRect().y, h: h.getBoundingClientRect().height, boxShadow: c.boxShadow, borderRight: c.borderRightWidth }; }));
    const rows = grid.locator('.z-row'); const out = { headers: heads, rows: [] };
    out.headerLine = await bandHasLine(page, heads[1].right, { y: heads[1].y, height: heads[1].h });
    const nr = Math.min(4, await rows.count()); for (let i = 0; i < nr; i++) { const b = await rows.nth(i).boundingBox(); if (b) out.rows.push(await bandHasLine(page, heads[1].right, b)); }
    res.noFrozenGrid = out; await ctx.close(); }
  fs.writeFileSync(__dirname + '/i37.json', JSON.stringify(res, null, 1));
  for (const k of ['grid', 'listbox', 'tree']) { const r = res[k]; console.log(k, 'x0', r.x0, 'rows', r.rowCount, 'headerLine', r.headerLine.has, 'rest', r.restCount, 'scrolled', r.scrolledCount, 'x0Shift', r.x0Shift, 'scrollLeft', r.scrollLeftAfter);
    console.log(' restDistinguishers', JSON.stringify(r.restDistinguishers.filter(d => d.diffs.length)).slice(0, 400));
    console.log(' scrolledDistinguishers', JSON.stringify(r.scrolledDistinguishers.filter(d => d.diffs.length)).slice(0, 600)); console.log(' hover painters', JSON.stringify(r.hover)); }
  console.log('noFrozen header', res.noFrozenGrid.headerLine.has, 'rows', res.noFrozenGrid.rows.map(r => r.has));
  await browser.close();
})();
