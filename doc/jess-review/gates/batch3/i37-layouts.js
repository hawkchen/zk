// #37 D32 extra layouts on a temporary page (zz-b3-tmp.zul, deleted after the run)
const { chromium, open, settle, pixels, dE } = require('./lib');
const fs = require('fs');
const LAY = [
 ['t-g-f1','grid'],['t-g-f3','grid'],['t-g-grp','grid'],['t-g-aux','grid'],['t-g-start1','grid'],['t-g-colspan','grid'],['t-g-nested','grid'],['t-g-none','grid'],
 ['t-lb-check','listbox'],['t-lb-f2','listbox'],['t-lb-none','listbox'],['t-tr-f2','tree'],['t-tr-none','tree']];
const K = { grid: { root: '.z-grid', head: 'th.z-column', row: '.z-rows > .z-row' }, listbox: { root: '.z-listbox', head: 'th.z-listheader', row: '.z-listitem' }, tree: { root: '.z-tree', head: 'th.z-treecol', row: '.z-treerow' } };
async function band(page, x, box) {
  const clip = { x: Math.floor(x - 3), y: Math.floor(box.y) + 3, width: 3, height: Math.max(1, Math.floor(box.height) - 6) };
  const im = await pixels(page, await page.screenshot({ clip }));
  const cnt = new Map(); for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  let m = 0; for (let i = 0; i < im.d.length; i += 4) m = Math.max(m, dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg));
  return +m.toFixed(2);
}
async function state(page, grid, kind, tag) {
  const k = K[kind];
  const info = await grid.evaluate((g, k) => {
    const heads = [...g.querySelectorAll(k.head)].filter(h => h.closest(k.root) === g);
    const body = g.querySelector('.z-' + (k.root === '.z-grid' ? 'grid' : k.root === '.z-listbox' ? 'listbox' : 'tree') + '-body');
    const br = body.getBoundingClientRect();
    const fr = heads.filter(h => h.classList.contains('z-frozen-col'));
    const x0 = fr.length ? fr[fr.length - 1].getBoundingClientRect().right : null;
    const rows = [...g.querySelectorAll(k.row)].filter(r => r.closest(k.root) === g && !r.classList.contains('z-group') && !r.classList.contains('z-groupfoot') && r.getBoundingClientRect().height > 0);
    const grows = [...g.querySelectorAll('.z-group')].filter(r => r.closest(k.root) === g).map(r => { const b = r.getBoundingClientRect(); return { y: b.y, h: b.height }; });
    return { grows, x0, nFrozenHead: fr.length, rights: heads.map(h => h.getBoundingClientRect().right), bodyRight: br.right, bodyLeft: br.left, nRows: rows.length,
      rows: rows.map(r => { const b = r.getBoundingClientRect(); const cs = [...r.cells].map(c => { const q = c.getBoundingClientRect(); return { l: q.left, r: q.right, colspan: c.colSpan, cls: c.className, bs: getComputedStyle(c).boxShadow }; }); return { y: b.y, h: b.height, cs }; }) };
  }, k);
  const rowRes = [];
  for (let i = 0; i < info.rows.length; i++) {
    const r = info.rows[i]; const box = { y: r.y, height: r.h };
    const line = info.x0 == null ? null : await band(page, info.x0, box);
    // stray: other header right edges inside body viewport
    const stray = [];
    for (const x of info.rights) { if (info.x0 != null && Math.abs(x - info.x0) < 1.5) continue; if (x < info.bodyLeft + 5 || x > info.bodyRight - 5) continue; const d = await band(page, x, box); if (d >= 2) stray.push([+x.toFixed(1), d]); }
    // tiling: contiguous cells
    let gaps = 0; for (let j = 1; j < r.cs.length; j++) if (Math.abs(r.cs[j].l - r.cs[j - 1].r) > 0.6) gaps++;
    const shadowCells = r.cs.map((c, j) => c.bs !== 'none' ? j : null).filter(v => v != null);
    rowRes.push({ i, h: r.h, line, hasLine: line != null && line >= 2, stray, gaps, shadowCells, colspan: r.cs.map(c => c.colspan) });
  }
  const grp = []; for (const r of info.grows) { const box = { y: r.y, height: r.h }; const line = info.x0 == null ? null : await band(page, info.x0, box); const stray = []; for (const x of info.rights) { if (x < info.bodyLeft + 5 || x > info.bodyRight - 5) continue; const d = await band(page, x, box); if (d >= 2) stray.push([+x.toFixed(1), d]); } grp.push({ line, stray }); }
  return { grp, tag, x0: info.x0, nFrozenHead: info.nFrozenHead, nRows: info.nRows, rows: rowRes };
}
(async () => {
  const browser = await chromium.launch(); const out = {};
  const { ctx, page } = await open(browser, 'zz-b3-tmp.zul');
  for (const [cls, kind] of LAY) {
    const grid = page.locator(K[kind].root + '.' + cls).first();
    await grid.scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
    const r = { kind };
    r.rest = await state(page, grid, kind, 'rest');
    const sc = await grid.evaluate(g => { const f = g.querySelector('.z-frozen-inner'); if (!f) return null; f.scrollLeft = f.scrollWidth; return { sl: f.scrollLeft, sw: f.scrollWidth, cw: f.clientWidth }; });
    await page.waitForTimeout(500); r.scroll = sc;
    r.end = await state(page, grid, kind, 'end');
    // lines on data rows summary
    const sum = s => `${s.rows.filter(x => x.hasLine).length}/${s.rows.length}`;
    r.summary = { rest: sum(r.rest), end: sum(r.end), strayRest: r.rest.rows.filter(x => x.stray.length).length, strayEnd: r.end.rows.filter(x => x.stray.length).length, gaps: r.rest.rows.reduce((a, x) => a + x.gaps, 0) + r.end.rows.reduce((a, x) => a + x.gaps, 0), rowH: [...new Set(r.rest.rows.map(x => x.h))] };
    out[cls] = r;
    console.log(cls, JSON.stringify(r.summary), 'frozenHead', r.rest.nFrozenHead, 'x0', r.rest.x0, '->', r.end.x0, 'scroll', JSON.stringify(sc));
  }
  fs.writeFileSync(__dirname + '/i37-layouts.json', JSON.stringify(out, null, 1));
  await page.screenshot({ path: __dirname + '/i37-layouts-page.png', fullPage: true });
  await browser.close();
})();
