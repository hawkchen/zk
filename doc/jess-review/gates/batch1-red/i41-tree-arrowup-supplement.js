// SUPPLEMENTARY (not part of the approved method): Tab into tree0, then ArrowUp instead of ArrowDown
const { launch, open, idle } = require('./common');
(async () => {
  const browser = await launch();
  const page = await open(browser, '/tree.zul');
  await page.locator('.z-text-2xl').first().click(); await idle(page);
  await page.keyboard.press('Tab'); await idle(page);
  await page.keyboard.press('ArrowUp'); await idle(page);
  console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.z-tree')[0].querySelectorAll('.z-treerow')].map(r => { const c = getComputedStyle(r); return r.textContent.trim() + ' [' + r.className + '] outline=' + c.outlineStyle + ' ' + c.outlineWidth; })), null, 1));
  await browser.close();
})();
