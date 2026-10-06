const { launch, BASE } = require('./common');
(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(BASE + '/organigram.zul', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.z-orgnode');
  const t0 = await page.evaluate(() => { const el = document.querySelector('.z-orgnode'); const c = getComputedStyle(el); el.parentElement.classList.add('z-orgitem-selected'); return { transition: c.transition, bgBefore: c.backgroundColor }; });
  const samples = [];
  for (const ms of [0, 50, 150, 400, 1000]) { await page.waitForTimeout(ms ? ms - (samples.length ? [0,50,150,400,1000][samples.length-1] : 0) : 0); samples.push([ms, await page.evaluate(() => getComputedStyle(document.querySelector('.z-orgnode')).backgroundColor)]); }
  console.log(JSON.stringify({ t0, samples }));
  await browser.close();
})();
