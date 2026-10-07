const { chromium, open, settle } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  { const { ctx, page } = await open(browser, 'grid.zul');
  const th = page.locator('.z-grid').nth(1).locator('th.z-column').nth(1);
  const dump = () => th.evaluate(e => ({ th: e.outerHTML, title: e.title, rows: [...e.closest('.z-grid').querySelectorAll('.z-row')].map(r => r.cells[1].innerText) }));
  console.log(JSON.stringify(await dump()));
  await th.locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page);
  console.log(JSON.stringify(await dump()));
  await th.locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page);
  console.log(JSON.stringify(await dump()));
  await ctx.close(); }
  { const { ctx, page } = await open(browser, 'grid-grouping.zul');
  console.log(await page.locator('.z-group').first().evaluate(e => e.outerHTML));
  await ctx.close(); }
  await browser.close();
})();
