const { chromium, open } = require('./lib');
(async () => {
  const b = await chromium.launch();
  const { ctx, page } = await open(b, 'grid-grouping.zul');
  const r = await page.evaluate(() => ({ groupCursor: getComputedStyle(document.querySelector('.z-group')).cursor,
    tdCursor: getComputedStyle(document.querySelector('.z-group td')).cursor,
    sheets: [...document.styleSheets].map(s => s.href).filter(Boolean).filter(h => /zul|grid|frozen/.test(h)).slice(0, 8) }));
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
