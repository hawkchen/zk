// (d) sort-icon overlap with label / menu button / column icon; (e) forced-colors frozen divider
const { chromium, open, settle, pixels, dE } = require('./lib');
const fs = require('fs');
const inter = (a, b) => a && b && a.width > 0 && b.width > 0 && !(a.right <= b.left + 0.01 || a.left >= b.right - 0.01 || a.bottom <= b.top + 0.01 || a.top >= b.bottom - 0.01);
async function hdr(page, grid, sel, label) {
  const out = {};
  const ths = grid.locator('th.z-column');
  const n = await ths.count();
  for (let i = 0; i < n; i++) {
    const th = ths.nth(i); const cls0 = await th.getAttribute('class');
    for (const st of ['asc', 'desc']) {
      await th.locator('.z-column-content').click({ position: { x: 8, y: 8 } }); await settle(page);
      await th.hover({ position: { x: 20, y: 10 } }); await page.waitForTimeout(150);
      const m = await th.evaluate(t => {
        const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }; };
        const c = t.querySelector('.z-column-content');
        const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); let n, tr = null; while ((n = w.nextNode())) { if (n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); tr = { left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height }; break; } }
        const ic = t.querySelector('.z-column-sorticon i, .z-column-sorticon'); const btn = t.querySelector('.z-column-button'); const img = c.querySelector('img, i.z-icon-star, [class*=icon]:not(.z-column-sorticon)');
        const cr = R(t);
        return { th: cr, text: tr, sortIcon: R(t.querySelector('.z-column-sorticon i')), btn: R(btn), colIcon: R(c.querySelector('i:not(.z-column-sorticon i)')), contentScroll: c.scrollWidth - c.clientWidth, textOverflowsContent: tr ? tr.right > R(c).right + 0.5 : null, aria: t.getAttribute('aria-sort'), cls: t.className };
      });
      const ov = { sortVsText: inter(m.sortIcon, m.text), sortVsBtn: inter(m.sortIcon, m.btn), textVsBtn: inter(m.text, m.btn), sortVsColIcon: inter(m.sortIcon, m.colIcon), sortInsideTh: m.sortIcon ? (m.sortIcon.left >= m.th.left - 0.5 && m.sortIcon.right <= m.th.right + 0.5) : null };
      (out[i] = out[i] || {})[st] = { m, ov };
    }
    // remove sort effect: click until unsorted? leave
  }
  return out;
}
(async () => {
  const browser = await chromium.launch(); const res = {};
  { const { ctx, page } = await open(browser, 'zz-b3-tmp.zul'); const g = page.locator('.z-grid.t-g-hdr'); await g.scrollIntoViewIfNeeded(); res.tmpHdr = await hdr(page, g); await g.screenshot({ path: __dirname + '/hdr-tmp.png' }); await ctx.close(); }
  { const { ctx, page } = await open(browser, 'grid.zul'); const g = page.locator('.z-grid').nth(1); await g.scrollIntoViewIfNeeded(); res.basic = await hdr(page, g); await g.screenshot({ path: __dirname + '/hdr-basic.png' }); await ctx.close(); }
  for (const [k, v] of Object.entries(res)) for (const [i, o] of Object.entries(v)) for (const [st, r] of Object.entries(o)) console.log(k, 'col', i, st, JSON.stringify(r.ov), 'textW', r.m.text && r.m.text.width.toFixed(1), 'icon', r.m.sortIcon ? [r.m.sortIcon.left.toFixed(1), r.m.sortIcon.right.toFixed(1)] : null, 'btn', r.m.btn ? [r.m.btn.left.toFixed(1), r.m.btn.right.toFixed(1)] : null, 'text', r.m.text ? [r.m.text.left.toFixed(1), r.m.text.right.toFixed(1)] : null, 'th', [r.m.th.left.toFixed(1), r.m.th.right.toFixed(1)], 'colIcon', r.m.colIcon ? [r.m.colIcon.left.toFixed(1), r.m.colIcon.right.toFixed(1)] : null);
  // (e) forced-colors frozen divider
  { const { ctx, page } = await open(browser, 'grid.zul', { forcedColors: 'active' }); const g = page.locator('.z-grid').nth(4); await g.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    const x0 = await g.evaluate(g => g.querySelectorAll('.z-column')[1].getBoundingClientRect().right);
    const rows = g.locator('.z-row'); const r = { x0, rest: [], hdr: null };
    async function band(box) { const im = await pixels(page, await page.screenshot({ clip: { x: Math.floor(x0 - 3), y: Math.floor(box.y) + 3, width: 3, height: Math.floor(box.height) - 6 } })); const cnt = new Map(); for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); } const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number); let m = 0; for (let i = 0; i < im.d.length; i += 4) m = Math.max(m, dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg)); return +m.toFixed(1); }
    const hb = await g.evaluate(g => { const b = g.querySelectorAll('.z-column')[1].getBoundingClientRect(); return { y: b.y, height: b.height }; });
    r.hdr = await band(hb);
    for (let i = 0; i < await rows.count(); i++) r.rest.push(await band(await rows.nth(i).boundingBox()));
    await g.evaluate(g => { const f = g.querySelector('.z-frozen-inner'); f.scrollLeft = 200; }); await page.waitForTimeout(500);
    r.scrolled = []; for (let i = 0; i < await rows.count(); i++) r.scrolled.push(await band(await rows.nth(i).boundingBox()));
    res.forcedFrozen = r; console.log('forced frozen', JSON.stringify(r)); await ctx.close(); }
  fs.writeFileSync(__dirname + '/i-hdr.json', JSON.stringify(res, null, 1));
  await browser.close();
})();
