const { chromium, open, settle } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const { ctx, page } = await open(browser, 'grid.zul');
  const r = await page.evaluate(() => {
    const gs = [...document.querySelectorAll('.z-grid')];
    return gs.map((g, i) => ({ i, id: g.id, cls: g.className, head: g.querySelector('.z-grid-header') ? g.querySelector('.z-grid-header').outerHTML.slice(0, 1500) : null, row0: g.querySelector('.z-row') ? g.querySelector('.z-row').outerHTML.slice(0, 900) : null, rowsCls: [...g.querySelectorAll('.z-rows > tr')].map(t => t.className) }));
  });
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
