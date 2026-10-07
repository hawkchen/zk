const { chromium, open } = require('./lib');
(async () => { const b = await chromium.launch(); const { page } = await open(b, 'tmp-b3final-frozen.zul', { deviceScaleFactor: 2 });
  for (const s of ['.L-nest', '.L-nest2', '.L-colspan', '.L-grp', '.L-f1', '.L-f3', '.L-lbcm', '.L-tree']) {
    const h = await page.evaluateHandle(s => document.querySelector(s), s); await h.evaluate(e => e.scrollIntoView({ block: 'start' })); await page.mouse.move(1279, 1); await page.waitForTimeout(200);
    await h.asElement().screenshot({ path: `i37-${s.slice(3)}-rest.png` });
    if (!['.L-nest2'].includes(s)) { await h.evaluate(r => { const f = [...r.querySelectorAll('.z-frozen-inner')].find(e => e.closest('.z-grid,.z-listbox,.z-tree') === r); if (f) f.scrollLeft = f.scrollWidth; }); await page.waitForTimeout(500);
      await h.asElement().screenshot({ path: `i37-${s.slice(3)}-end.png` });
      await h.evaluate(r => { const f = [...r.querySelectorAll('.z-frozen-inner')].find(e => e.closest('.z-grid,.z-listbox,.z-tree') === r); if (f) f.scrollLeft = 0; }); await page.waitForTimeout(300); }
  }
  await b.close(); })();
