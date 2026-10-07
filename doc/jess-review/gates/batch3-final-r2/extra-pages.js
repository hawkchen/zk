// Every preview page with <frozen>: for EVERY grid/listbox/tree root, full-width vertical-line scan per body row,
// rule ON vs rule OFF (only the inset body-divider rule deleted). Frozen roots may gain lines only at x0-1; others none.
const { chromium, open, pixels, dE } = require('./lib');
const fs = require('fs');
const PAGES = ['grid.zul', 'listbox.zul', 'tree.zul', 'grid-header.zul', 'listbox-header.zul', 'tree-header.zul'];
async function disableRule(page) {
  return page.evaluate(() => { let n = 0; const walk = (list, owner) => { for (let i = list.length - 1; i >= 0; i--) { const r = list[i];
    if (r.cssRules && !r.selectorText) { walk(r.cssRules, r); continue; }
    if (r.selectorText && r.selectorText.includes(':has(') && /frozen/.test(r.selectorText) && /inset/.test(r.style.boxShadow)) { owner.deleteRule(i); n++; } } };
    for (const s of document.styleSheets) { try { walk(s.cssRules, s); } catch (e) {} } return n; });
}
async function vlines(page, strip) {
  const x = Math.max(0, Math.floor(strip.x)), w = Math.min(1280, Math.floor(strip.x + strip.w)) - x;
  if (w < 2 || strip.h < 8) return [];
  const clip = { x, y: Math.floor(strip.y) + 3, width: w, height: Math.max(1, Math.floor(strip.h) - 6) };
  const im = await pixels(page, await page.screenshot({ clip }));
  const cnt = new Map(); for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); }
  const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number); const xs = [];
  for (let xx = 0; xx < im.w; xx++) { let n = 0; for (let y = 0; y < im.h; y++) { const i = (y * im.w + xx) * 4; if (dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg) >= 2) n++; } if (n >= 0.9 * im.h) xs.push(clip.x + xx); }
  return xs;
}
async function measure(page) {
  const n = await page.evaluate(() => document.querySelectorAll('.z-grid,.z-listbox,.z-tree').length); const res = [];
  for (let k = 0; k < n; k++) {
    const info = await page.evaluate(k => { const root = document.querySelectorAll('.z-grid,.z-listbox,.z-tree')[k]; root.scrollIntoView({ block: 'start' });
      const own = e => e.closest('.z-grid,.z-listbox,.z-tree') === root;
      const heads = [...root.querySelectorAll('.z-column,.z-listheader,.z-treecol')].filter(own); const fk = heads.filter(h => /z-frozen-col/.test(h.className)).length;
      const body = [...root.querySelectorAll('.z-grid-body,.z-listbox-body,.z-tree-body')].find(own); if (!body) return null; const bb = body.getBoundingClientRect();
      const rows = [...root.querySelectorAll('.z-row,.z-listitem,.z-treerow')].filter(own).map(r => r.getBoundingClientRect()).filter(b => b.height > 0 && b.top >= 0 && b.bottom <= 900).slice(0, 6).map(b => [b.y, b.height]);
      return { cls: root.className.split(' ').slice(0, 2).join(' '), nested: !!root.parentElement.closest('.z-grid,.z-listbox,.z-tree'), fk, x0: fk ? heads[fk - 1].getBoundingClientRect().right : null, body: [bb.x, body.clientWidth], rows }; }, k);
    await page.mouse.move(1279, 1); await page.waitForTimeout(150);
    if (!info) { res.push(null); continue; }
    info.lines = []; for (const [y, h] of info.rows) info.lines.push(await vlines(page, { x: info.body[0], w: info.body[1], y, h }));
    res.push(info);
  }
  return res;
}
(async () => { const b = await chromium.launch(); const out = {};
  for (const p of PAGES) { const A = await open(b, p); const on = await measure(A.page); await A.page.screenshot({ path: `page-${p.replace('.zul', '')}.png`, fullPage: true }); await A.ctx.close();
    const B = await open(b, p); const removed = await disableRule(B.page); const off = await measure(B.page); await B.ctx.close();
    out[p] = { removed, roots: on.map((r, i) => { if (!r) return null; const o = off[i];
      const added = r.lines.map((ls, j) => ls.filter(x => !(o && o.lines[j] || []).some(y => Math.abs(y - x) <= 0.5)));
      const okAt = r.fk ? Math.round(r.x0 - 1) : null; const stray = added.flat().filter(x => okAt === null || Math.abs(x - okAt) > 1);
      return { i, cls: r.cls, nested: r.nested, fk: r.fk, x0: r.x0, rows: r.rows.length, added, stray, rowsWithLine: r.fk ? added.filter(a => a.some(x => Math.abs(x - okAt) <= 1)).length : null }; }) };
    for (const r of out[p].roots) if (r) console.log(p, '#' + r.i, r.cls, r.nested ? 'nested' : '', 'fk', r.fk, 'rows', r.rows, r.fk ? 'withLine ' + r.rowsWithLine : '', 'stray', JSON.stringify(r.stray));
  }
  fs.writeFileSync(__dirname + '/extra-pages.json', JSON.stringify(out, null, 1)); await b.close(); })();
