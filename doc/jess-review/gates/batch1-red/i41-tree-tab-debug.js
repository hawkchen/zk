const { launch, open, idle } = require('./common');
(async () => {
  const browser = await launch();
  const page = await open(browser, '/tree.zul');
  const snap = (label) => page.evaluate((label) => {
    const t = document.querySelectorAll('.z-tree')[0];
    const ae = document.activeElement;
    return { label, active: ae.tagName + '.' + ae.className + ' inTree0=' + t.contains(ae),
      focusRowsAll: [...document.querySelectorAll('.z-treerow-focus')].map(r => r.textContent.trim() + ' inTree0=' + t.contains(r)),
      selectedTree0: [...t.querySelectorAll('.z-treerow.z-selected, .z-treerow-selected')].map(r => r.textContent.trim()) };
  }, label);
  const out = [];
  await page.locator('.z-text-2xl').first().click(); await idle(page);
  out.push(await snap('after heading click'));
  await page.keyboard.press('Tab'); await idle(page); out.push(await snap('after Tab'));
  await page.waitForTimeout(800); out.push(await snap('after Tab +800ms'));
  await page.keyboard.press('ArrowDown'); await idle(page); await page.waitForTimeout(500); out.push(await snap('after ArrowDown'));
  await page.keyboard.press('ArrowDown'); await idle(page); await page.waitForTimeout(500); out.push(await snap('after 2nd ArrowDown'));
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
