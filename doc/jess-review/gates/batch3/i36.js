// #36 (D28-A): cursor on group row / icon / blank, via elementFromPoint computed cursor
const { chromium, open, settle } = require('./lib');
const fs = require('fs');
const cur = (page, x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const cs = getComputedStyle(e); return { cursor: cs.cursor, el: e.tagName.toLowerCase() + '.' + [...e.classList].join('.') }; }, [x, y]);
(async () => {
  const browser = await chromium.launch();
  const out = {};
  { const { ctx, page } = await open(browser, 'grid-grouping.zul');
    const g = page.locator('.z-group').first();
    out.groupText = await g.innerText();
    const rb = await g.boundingBox();
    const lab = await g.locator('.z-group-content, .z-label').first().boundingBox();
    // text centre: use Range over the text
    const tc = await page.evaluate(() => { const g = document.querySelector('.z-group'); const w = document.createTreeWalker(g, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.textContent.trim()) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; } } });
    await page.mouse.move(tc.x, tc.y); out.textCenter = { pt: tc, ...(await cur(page, tc.x, tc.y)) };
    const blank = { x: rb.x + rb.width - 30, y: rb.y + rb.height / 2 };
    await page.mouse.move(blank.x, blank.y); out.rightBlank = { pt: blank, rowRect: rb, ...(await cur(page, blank.x, blank.y)) };
    const ib = await g.locator('.z-group-icon').boundingBox();
    const ic = { x: ib.x + ib.width / 2, y: ib.y + ib.height / 2 };
    await page.mouse.move(ic.x, ic.y); out.icon = { pt: ic, ...(await cur(page, ic.x, ic.y)) };
    // toggle behaviour
    const open0 = await g.evaluate(e => e.classList.contains('z-group-open'));
    const rowsVisible = () => page.locator('.z-row:visible').count();
    const v0 = await rowsVisible();
    await page.mouse.click(ic.x, ic.y); await settle(page);
    const open1 = await g.evaluate(e => e.classList.contains('z-group-open')); const v1 = await rowsVisible();
    await page.mouse.click(ic.x, ic.y); await settle(page);
    const open2 = await g.evaluate(e => e.classList.contains('z-group-open')); const v2 = await rowsVisible();
    out.toggleIcon = { open0, open1, open2, v0, v1, v2 };
    await page.mouse.click(blank.x, blank.y); await settle(page);
    out.clickBlank = { open: await g.evaluate(e => e.classList.contains('z-group-open')), v: await rowsVisible() };
    await page.mouse.click(tc.x, tc.y); await settle(page);
    out.clickText = { open: await g.evaluate(e => e.classList.contains('z-group-open')), v: await rowsVisible() };
    // keyboard
    const kb = {};
    for (const key of ['Enter', ' ']) {
      await g.focus().catch(() => {});
      const before = await g.evaluate(e => e.classList.contains('z-group-open'));
      await page.evaluate(() => document.querySelector('.z-group').focus());
      await page.keyboard.press(key === ' ' ? 'Space' : key); await settle(page);
      const after = await g.evaluate(e => e.classList.contains('z-group-open'));
      kb[key === ' ' ? 'Space' : key] = { before, after, focused: await page.evaluate(() => document.activeElement && (document.activeElement.className || document.activeElement.tagName)) };
    }
    out.keyboard = kb;
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'grid.zul');
    const g = page.locator('.z-grid').nth(1);
    const r = await g.locator('.z-row').first().locator('td').nth(2).boundingBox();
    out.rowCell = await cur(page, r.x + 10, r.y + r.height / 2);
    const th = g.locator('th.z-column').nth(0); const tb = await th.boundingBox();
    await page.mouse.move(tb.x + 20, tb.y + tb.height / 2); out.sortableHeader = await cur(page, tb.x + 20, tb.y + tb.height / 2);
    out.sortableHeaderCls = await th.getAttribute('class');
    const th2 = g.locator('th.z-column').nth(1); const t2 = await th2.boundingBox();
    await page.mouse.move(t2.x + 20, t2.y + t2.height / 2);
    const bi = await th2.locator('.z-column-button').boundingBox(); await page.mouse.move(bi.x + bi.width / 2, bi.y + bi.height / 2);
    out.menuButton = await cur(page, bi.x + bi.width / 2, bi.y + bi.height / 2);
    // sizing handle: right edge of a column
    const th3 = g.locator('th.z-column').nth(0); const t3 = await th3.boundingBox();
    const sz = await page.evaluate(() => [...document.querySelectorAll('.z-column-sizing,.z-column-sizer,[class*=sizing]')].map(e => e.className));
    out.sizingClassesPresent = sz.slice(0, 5);
    // hover near the column's right border (sizing handle zone, 3px)
    const px = t3.x + t3.width - 2, py = t3.y + t3.height / 2;
    await page.mouse.move(px, py); out.colEdge = { pt: [px, py], ...(await cur(page, px, py)) };
    // ZK sets class z-column-sizing on the th while the pointer is in the edge zone
    out.colEdgeThCls = await th3.getAttribute('class');
    await ctx.close(); }
  fs.writeFileSync(__dirname + '/i36.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
