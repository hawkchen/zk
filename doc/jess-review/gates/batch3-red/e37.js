const { chromium, open, settle } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  for (const pg of ['grid.zul','listbox.zul','tree.zul']) {
    const { ctx, page } = await open(browser, pg);
    const r = await page.evaluate(() => [...document.querySelectorAll('.z-grid,.z-listbox,.z-tree')].map((g,i)=>({i,cls:g.className,hasFrozen:!!g.querySelector('.z-frozen'),
      frozenCols: g.querySelector('.z-frozen') ? g.querySelector('.z-frozen').getAttribute('class') : null })).filter(x=>x.hasFrozen));
    console.log(pg, JSON.stringify(r));
    await ctx.close();
  }
  await browser.close();
})();
