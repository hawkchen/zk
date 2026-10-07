// #37 D32/D33 extra layouts on the TEMPORARY page tmp-b3final-frozen.zul (+ grid.zul / listbox.zul / tree.zul frozen examples).
// For every layout: rule ON (as served) vs rule OFF (every served CSS rule whose selector has ':has(' and 'frozen' deleted via CSSOM).
// Per row: (1) method-of-record band check at x0 (6px band, rows shrunk 3px top/bottom, ΔE>=2), (2) full-width vertical-line scan,
// (3) geometry of headers / rows / cells. States: rest, scrolled to end (.z-frozen-inner scrollLeft = max).
const { chromium, open, pixels, dE } = require('./lib');
const fs = require('fs');
const TARGETS = [
  ['tmp-b3final-frozen.zul', '.L-f1', 'frozen'], ['tmp-b3final-frozen.zul', '.L-f2', 'frozen'], ['tmp-b3final-frozen.zul', '.L-f3', 'frozen'],
  ['tmp-b3final-frozen.zul', '.L-f4', 'frozen'], ['tmp-b3final-frozen.zul', '.L-f5', 'record'], ['tmp-b3final-frozen.zul', '.L-grp', 'frozen'],
  ['tmp-b3final-frozen.zul', '.L-aux', 'frozen'], ['tmp-b3final-frozen.zul', '.L-start1', 'frozen'], ['tmp-b3final-frozen.zul', '.L-lbcm', 'frozen'],
  ['tmp-b3final-frozen.zul', '.L-lb', 'frozen'], ['tmp-b3final-frozen.zul', '.L-tree', 'frozen'], ['tmp-b3final-frozen.zul', '.L-nest', 'frozen'],
  ['tmp-b3final-frozen.zul', '.L-inner', 'none'], ['tmp-b3final-frozen.zul', '.L-inner2', 'none'], ['tmp-b3final-frozen.zul', '.L-innerlb', 'none'], ['tmp-b3final-frozen.zul', '.L-f5n', 'record'], ['tmp-b3final-frozen.zul', '.L-colspan', 'record'],
  ['tmp-b3final-frozen.zul', '.L-nfg', 'none'], ['tmp-b3final-frozen.zul', '.L-nfl', 'none'], ['tmp-b3final-frozen.zul', '.L-nft', 'none'],
  ['grid.zul', '.z-grid:nth-of-type(1)@4', 'frozen'], ['listbox.zul', '.z-listbox@5', 'frozen'], ['tree.zul', '.z-tree@7', 'frozen'],
];
const ROOTSEL = '.z-grid,.z-listbox,.z-tree';
async function disableRule(page) {
  return page.evaluate(() => { const hit = [];
    const walk = (list, owner) => { for (let i = list.length - 1; i >= 0; i--) { const r = list[i];
      if (r.cssRules && !r.selectorText) { walk(r.cssRules, r); continue; }
      if (r.selectorText && r.selectorText.includes(':has(') && /frozen/.test(r.selectorText) && /inset/.test(r.style.boxShadow)) { hit.push(r.selectorText + ' {' + r.style.cssText + '}'); owner.deleteRule(i); } } };
    for (const s of document.styleSheets) { try { walk(s.cssRules, s); } catch (e) {} } return hit; });
}
async function rootHandle(page, sel) {
  if (sel.includes('@')) { const [s, i] = sel.split('@'); return page.evaluateHandle(([s, i]) => document.querySelectorAll(s.replace(':nth-of-type(1)', ''))[+i], [s, +i]); }
  return page.evaluateHandle(s => document.querySelector(s), sel);
}
const GEOM = (root) => {
  const own = e => e.closest('.z-grid,.z-listbox,.z-tree') === root;
  const R = e => { const b = e.getBoundingClientRect(); return [+b.x.toFixed(2), +b.y.toFixed(2), +b.width.toFixed(2), +b.height.toFixed(2)]; };
  const heads = [...root.querySelectorAll('.z-column,.z-listheader,.z-treecol')].filter(own);
  const rows = [...root.querySelectorAll('.z-row,.z-group,.z-groupfoot,.z-listitem,.z-treerow')].filter(own).filter(r => r.getBoundingClientRect().height > 0);
  return { heads: heads.map(h => ({ cls: h.className, r: R(h) })), rows: rows.map(r => ({ cls: r.className, r: R(r), cells: [...r.cells].map(td => ({ span: td.colSpan, r: R(td) })) })) };
};
async function vlines(page, strip) {
  const clip = { x: Math.max(0, Math.floor(strip.x)), y: Math.floor(strip.y) + 3, width: Math.min(1280, Math.floor(strip.x + strip.w)) - Math.max(0, Math.floor(strip.x)), height: Math.max(1, Math.floor(strip.h) - 6) };
  const im = await pixels(page, await page.screenshot({ clip }));
  const cnt = new Map(); for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  const xs = [];
  for (let x = 0; x < im.w; x++) { let n = 0; for (let y = 0; y < im.h; y++) { const i = (y * im.w + x) * 4; if (dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg) >= 2) n++; } if (n >= 0.9 * im.h) xs.push(clip.x + x); }
  return xs;
}
async function band(page, x0, b) {
  const clip = { x: Math.floor(x0 - 3), y: Math.floor(b[1]) + 3, width: 6, height: Math.max(1, Math.floor(b[3]) - 6) };
  const im = await pixels(page, await page.screenshot({ clip }));
  const cnt = new Map(); for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  let m = 0; for (let i = 0; i < im.d.length; i += 4) m = Math.max(m, dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg));
  return +m.toFixed(2);
}
async function state(page, rh) {
  const g = await rh.evaluate(GEOM);
  const frozenK = g.heads.filter(h => /z-frozen-col/.test(h.cls)).length;
  const x0 = frozenK ? g.heads[frozenK - 1].r[0] + g.heads[frozenK - 1].r[2] : (g.heads[1] ? g.heads[1].r[0] + g.heads[1].r[2] : null);
  const body = await rh.evaluate(root => { const b = [...root.querySelectorAll('.z-grid-body,.z-listbox-body,.z-tree-body')].find(e => e.closest('.z-grid,.z-listbox,.z-tree') === root); const r = b.getBoundingClientRect(); return { x: r.x, w: b.clientWidth }; });
  const rows = [];
  for (const row of g.rows) {
    const type = /z-groupfoot/.test(row.cls) ? 'groupfoot' : /z-group/.test(row.cls) ? 'group' : row.cells.some(c => c.span > 1) ? 'colspan' : 'data';
    const inView = row.r[1] >= 0 && row.r[1] + row.r[3] <= 900;
    rows.push({ type, cls: row.cls, bandDE: inView && x0 && x0 > 4 && x0 < 1276 ? await band(page, x0, row.r) : null, lines: inView ? await vlines(page, { x: body.x, w: body.w, y: row.r[1], h: row.r[3] }) : null });
  }
  return { frozenK, x0, geom: g, rows };
}
async function scrollEnd(page, rh) {
  return rh.evaluate(root => { const f = [...root.querySelectorAll('.z-frozen-inner')].find(e => e.closest('.z-grid,.z-listbox,.z-tree') === root); if (!f) return null; f.scrollLeft = f.scrollWidth; return { scrollLeft: f.scrollLeft, max: f.scrollWidth - f.clientWidth }; });
}
async function run(browser, off) {
  const res = {}; const pages = {};
  for (const [path, sel] of TARGETS) {
    if (!pages[path]) { pages[path] = await open(browser, path); pages[path].removed = off ? await disableRule(pages[path].page) : []; }
    const { page } = pages[path];
    const rh = await rootHandle(page, sel);
    await rh.evaluate(r => r.scrollIntoView({ block: 'start' })); await page.mouse.move(1279, 1); await page.waitForTimeout(250);
    const rest = await state(page, rh);
    const sc = await scrollEnd(page, rh); await page.waitForTimeout(500);
    const end = sc ? await state(page, rh) : null;
    await rh.evaluate(root => { const f = [...root.querySelectorAll('.z-frozen-inner')].find(e => e.closest('.z-grid,.z-listbox,.z-tree') === root); if (f) f.scrollLeft = 0; }); await page.waitForTimeout(300);
    res[path + ' ' + sel] = { rest, end, scroll: sc };
  }
  const removed = Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, v.removed]));
  for (const v of Object.values(pages)) await v.ctx.close();
  return { res, removed };
}
(async () => {
  const browser = await chromium.launch();
  const on = await run(browser, false), off = await run(browser, true);
  const out = { removedRules: off.removed, layouts: {} };
  for (const [path, sel, kind] of TARGETS) {
    const key = path + ' ' + sel; const A = on.res[key], B = off.res[key]; const L = { kind, scroll: A.scroll };
    for (const st of ['rest', 'end']) {
      const a = A[st], b = B[st]; if (!a) { L[st] = null; continue; }
      const geomEqual = JSON.stringify(a.geom) === JSON.stringify(b.geom);
      L[st] = { frozenK: a.frozenK, x0: a.x0, x0Off: b.x0, geomEqual, rows: a.rows.map((r, i) => {
        const offLines = (b.rows[i] && b.rows[i].lines) || [];
        const added = r.lines ? r.lines.filter(x => !offLines.some(y => Math.abs(y - x) <= 0.5)) : null;
        const removedL = r.lines ? offLines.filter(y => !r.lines.some(x => Math.abs(y - x) <= 0.5)) : null;
        return { type: r.type, bandDE: r.bandDE, bandDEoff: b.rows[i] && b.rows[i].bandDE, has: r.bandDE !== null ? r.bandDE >= 2 : null, added, removed: removedL };
      }) };
      if (!geomEqual) L[st].geomOn = a.geom, L[st].geomOff = b.geom;
    }
    out.layouts[key] = L;
  }
  fs.writeFileSync(__dirname + '/i37-layouts.json', JSON.stringify(out, null, 1));
  console.log('removed rules:', JSON.stringify(out.removedRules, null, 1));
  for (const [k, L] of Object.entries(out.layouts)) for (const st of ['rest', 'end']) { const s = L[st]; if (!s) { console.log(k, st, 'n/a'); continue; }
    console.log(k, '[' + L.kind + ']', st, 'K', s.frozenK, 'x0', s.x0, 'geomEqual', s.geomEqual, 'rows:', s.rows.map(r => `${r.type}:${r.has ? 'L' : '-'}(${r.bandDE}/${r.bandDEoff})+${JSON.stringify(r.added)}${r.removed && r.removed.length ? '-' + JSON.stringify(r.removed) : ''}`).join(' ')); }
  await browser.close();
})();
