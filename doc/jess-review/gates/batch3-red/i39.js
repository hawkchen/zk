// #39 (D31-A): header text left edge vs first-row text left edge, per column; sorted states; align cases; listbox/tree reference
const { chromium, open, settle } = require('./lib');
const fs = require('fs');
const MEASURE = ({ sel, hs, rs }) => {
  const g = document.querySelectorAll(sel)[window.__gi];
  const textRect = el => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return { left: b.left, right: b.right, cx: (b.left + b.right) / 2, top: b.top, bottom: b.bottom }; } } return null; };
  const heads = [...g.querySelectorAll(hs)].filter(h => h.closest('.z-grid,.z-listbox,.z-tree') === g);
  // only the real header row (skip auxhead): those with a content div
  const row = g.querySelector(rs);
  const out = [];
  heads.forEach((h, i) => {
    const c = h.querySelector('.z-column-content,.z-listheader-content,.z-treecol-content') || h;
    const ht = textRect(c); const td = row ? row.cells[i] : null; const bt = td ? textRect(td) : null;
    const icon = h.querySelector('.z-column-sorticon,.z-listheader-sorticon,.z-treecol-sorticon'); const ib = icon ? icon.getBoundingClientRect() : null;
    const hb = h.getBoundingClientRect();
    out.push({ i, label: ht && c.innerText.trim(), align: getComputedStyle(h).textAlign, hText: ht, bText: bt, dLeft: ht && bt ? +(ht.left - bt.left).toFixed(2) : null, dCenter: ht && bt ? +(ht.cx - bt.cx).toFixed(2) : null, dRight: ht && bt ? +(ht.right - bt.right).toFixed(2) : null,
      iconBox: ib && ib.width ? { l: ib.left, r: ib.right, t: ib.top, b: ib.bottom } : null, iconOverlapsText: ib && ib.width && ht ? !(ib.right <= ht.left || ib.left >= ht.right || ib.bottom <= ht.top || ib.top >= ht.bottom) : null, headBox: { w: hb.width, h: hb.height } });
  });
  const rowH = row ? row.getBoundingClientRect().height : null;
  return { cols: out, rowH };
};
async function measure(page, kind, gi) {
  const cfg = { grid: { sel: '.z-grid', hs: '.z-column', rs: '.z-rows .z-row' }, listbox: { sel: '.z-listbox', hs: '.z-listheader', rs: '.z-listitem' }, tree: { sel: '.z-tree', hs: '.z-treecol', rs: '.z-treerow' } }[kind];
  await page.evaluate(i => { window.__gi = i; }, gi);
  return page.evaluate(MEASURE, cfg);
}
(async () => {
  const browser = await chromium.launch();
  const out = {};
  { const { ctx, page } = await open(browser, 'grid.zul');
    const n = await page.locator('.z-grid').count(); out.gridCount = n;
    out.grids = {};
    for (let gi = 0; gi < n; gi++) out.grids[gi] = await measure(page, 'grid', gi);
    // sorted states on Basic (gi=1): click Author once, then again; real clicks
    const th = page.locator('.z-grid').nth(1).locator('th.z-column').nth(0);
    out.sorted = {};
    for (const st of ['asc', 'desc']) {
      await th.locator('.z-column-content').click({ position: { x: 15, y: 10 } }); await settle(page);
      await page.mouse.move(1275, 5); await page.waitForTimeout(150);
      out.sorted[st] = { aria: await th.getAttribute('aria-sort'), m: await measure(page, 'grid', 1) };
      // hover state: menu button position relative to column + text
      await th.hover({ position: { x: 40, y: 10 } }); await page.waitForTimeout(150);
      const mb = await th.locator('.z-column-button').boundingBox(); const tb = await th.boundingBox();
      const hm = await measure(page, 'grid', 1);
      out.sorted[st].hover = { menuBtn: mb, thBox: tb, menuInsideRightHalf: mb && mb.x > tb.x + tb.width / 2, textLeft: hm.cols[0].hText.left, textRight: hm.cols[0].hText.right, menuOverlapsText: mb ? !(mb.x >= hm.cols[0].hText.right || mb.x + mb.width <= hm.cols[0].hText.left) : null, textLeftSameAsNoHover: hm.cols[0].hText.left === out.sorted[st].m.cols[0].hText.left };
    }
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'listbox.zul'); const n = await page.locator('.z-listbox').count(); out.listbox = {};
    for (let gi = 0; gi < n; gi++) out.listbox[gi] = await measure(page, 'listbox', gi).catch(e => String(e)); await ctx.close(); }
  { const { ctx, page } = await open(browser, 'tree.zul'); const n = await page.locator('.z-tree').count(); out.tree = {};
    for (let gi = 0; gi < n; gi++) out.tree[gi] = await measure(page, 'tree', gi).catch(e => String(e)); await ctx.close(); }
  fs.writeFileSync(__dirname + '/i39.json', JSON.stringify(out, null, 1));
  const f = c => `${c.label}[${c.align}] dL=${c.dLeft} dC=${c.dCenter} dR=${c.dRight}${c.iconOverlapsText !== null ? ' iconOverlap=' + c.iconOverlapsText : ''}`;
  for (const gi of Object.keys(out.grids)) console.log('grid', gi, 'rowH', out.grids[gi].rowH, out.grids[gi].cols.map(f).join(' | '));
  for (const st of ['asc', 'desc']) { console.log('sorted', st, out.sorted[st].aria, out.sorted[st].m.cols.map(f).join(' | ')); console.log('  hover', JSON.stringify(out.sorted[st].hover)); }
  for (const k of ['listbox', 'tree']) for (const gi of Object.keys(out[k])) { const m = out[k][gi]; if (typeof m === 'string') console.log(k, gi, m); else console.log(k, gi, m.cols.map(f).join(' | ')); }
  await browser.close();
})();
