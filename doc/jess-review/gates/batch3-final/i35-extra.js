const { chromium, open, settle } = require('./lib'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const { page } = await open(b, 'grid.zul'); const out = {};
  const g = page.locator('.z-grid').nth(1);
  const probe = () => g.evaluate(gr => [...gr.querySelectorAll('th.z-column')].map(th => { const s = th.querySelector('.z-column-sorticon'); const r = s ? s.getBoundingClientRect() : null; const i = s && s.querySelector('i'); const ir = i ? i.getBoundingClientRect() : null; const bs = s ? getComputedStyle(s, '::before') : null;
    return { label: th.innerText.trim(), aria: th.getAttribute('aria-sort'), span: r && [r.width, r.height], display: s && getComputedStyle(s).display, i: ir && [ir.width, ir.height], spanBefore: bs && bs.content }; }));
  out.unsorted = await probe();
  // header screenshot of unsorted Author at the sorticon location vs after sort (ink count in the th right of text)
  await g.locator('th.z-column').nth(1).locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page); await page.mouse.move(1279, 1);
  out.afterSortTitle = await probe();
  fs.writeFileSync('i35-extra.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close(); })();
