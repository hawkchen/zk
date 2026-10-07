const { chromium, open } = require('./lib');
(async () => { const b = await chromium.launch();
  for (const [p, i] of [['grid-header.zul', 12], ['listbox-header.zul', 15], ['tree-header.zul', 10]]) { const { ctx, page } = await open(b, p);
    const h = await page.evaluateHandle(i => document.querySelectorAll('.z-grid,.z-listbox,.z-tree')[i], i); await h.evaluate(e => e.scrollIntoView({ block: 'start' })); await page.mouse.move(1279, 1); await page.waitForTimeout(200);
    await h.asElement().screenshot({ path: `eye-${p.replace('.zul', '')}.png` }); await ctx.close(); }
  await b.close(); })();
