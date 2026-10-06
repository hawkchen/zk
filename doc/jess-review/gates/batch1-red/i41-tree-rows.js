const { launch, open, idle } = require('./common');
(async () => {
  const browser = await launch();
  const page = await open(browser, '/tree.zul');
  const rows = () => page.evaluate(() => [...document.querySelectorAll('.z-tree')[0].querySelectorAll('.z-treerow')].map(r => r.textContent.trim() + ' [' + r.className + ']'));
  console.log(JSON.stringify(await rows(), null, 1));
  await page.locator('.z-text-2xl').first().click(); await idle(page);
  await page.keyboard.press('Tab'); await idle(page);
  const w = await page.evaluate(() => { const t = zk.Widget.$(document.querySelectorAll('.z-tree')[0]); return { focusItem: t._focusItem ? t._focusItem.uuid : null, sel: t._selItems ? t._selItems.map(s => s.uuid) : null, tabindex: t.$n().getAttribute('tabindex') }; });
  console.log('after Tab widget', JSON.stringify(w));
  await page.keyboard.press('ArrowDown'); await idle(page);
  console.log(JSON.stringify(await rows(), null, 1));
  await browser.close();
})();
