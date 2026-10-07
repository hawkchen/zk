const { chromium, open } = require('./lib');
(async () => { const b = await chromium.launch(); const { page } = await open(b, 'tmp-b3final-frozen.zul');
 console.log(await page.evaluate(() => [...document.querySelectorAll('[class*="L-"]')].map(e => [...e.classList].find(c => c.startsWith('L-'))).join(' '))); await b.close(); })();
