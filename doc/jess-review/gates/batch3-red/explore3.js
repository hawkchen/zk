const { chromium, open } = require('./lib');
(async () => {
  const browser = await chromium.launch();
  const { ctx, page } = await open(browser, 'grid.zul');
  const r = await page.evaluate(() => ['z-icon-caret-down','z-icon-caret-up','z-icon-angle-down','z-icon-angle-up','z-icon-angle-right'].map(c => { const i = document.createElement('i'); i.className = c; document.body.appendChild(i); const cs = getComputedStyle(i, '::before'); const o = { c, content: cs.content, font: getComputedStyle(i).fontFamily, mask: cs.maskImage || cs.webkitMaskImage, bgimg: cs.backgroundImage }; i.remove(); return o; }));
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
