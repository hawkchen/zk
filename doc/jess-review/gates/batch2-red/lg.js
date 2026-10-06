const { chromium, open, helpers } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  { const { ctx, page } = await open(browser, 'listbox-grouping.zul'); await helpers(page);
    console.log(JSON.stringify(await page.evaluate(() => { const g = document.querySelector('.z-listgroup'); g.classList.add('z-listgroup-selected');
      const r = [g, ...g.querySelectorAll('*')].map(c => [__desc(c), getComputedStyle(c).backgroundColor, getComputedStyle(c).color, (c.childNodes[0] && c.childNodes[0].nodeType === 3) ? c.childNodes[0].textContent.trim() : '']); g.classList.remove('z-listgroup-selected'); return r; }), null, 0));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'chosenbox.zul'); await helpers(page);
    console.log(JSON.stringify(await page.evaluate(() => { const i = document.querySelector('.z-chosenbox-item'); return { item: getComputedStyle(i).color, content: getComputedStyle(i.querySelector('.z-chosenbox-item-content')).color, rest: getComputedStyle(i).backgroundColor, varFg: getComputedStyle(i).getPropertyValue('--zk-chosenbox-fg') }; })));
    // alternate interaction: click a chip
    await page.locator('.z-chosenbox').first().locator('.z-chosenbox-item').first().click(); await page.waitForTimeout(400);
    console.log('click-chip', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox-item-focus')].map(e => [__desc(e), getComputedStyle(e).backgroundColor]))));
    await ctx.close(); }
  await browser.close();
})();
