// SUPPLEMENTARY feasibility probe (page-local injected <style>, no repo file touched):
// can sibling-structure :has() + :nth-child reach body frozen cells without a body marker class?
const { chromium, open, pixels, dE } = require('./lib');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const { ctx, page } = await open(browser, 'grid.zul');
  await page.addStyleTag({ content: '.z-grid:has(.z-column.z-frozen-col:nth-child(2)):not(:has(.z-column.z-frozen-col:nth-child(3))) .z-row > td:nth-child(2){box-shadow:inset -1px 0 0 rgba(0,0,0,.12)!important}' });
  const grid = page.locator('.z-grid').nth(4); await grid.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const res = {};
  async function count(tag) {
    const x0 = await grid.evaluate(g => g.querySelectorAll('.z-column')[1].getBoundingClientRect().right);
    const rows = grid.locator('.z-row'); const n = await rows.count(); let c = 0; const det = [];
    for (let i = 0; i < n; i++) { const b = await rows.nth(i).boundingBox();
      const buf = await page.screenshot({ clip: { x: Math.floor(x0 - 3), y: Math.floor(b.y) + 3, width: 6, height: Math.floor(b.height) - 6 } }); const im = await pixels(page, buf);
      const cnt = new Map(); for (let k = 0; k < im.d.length; k += 4) { const key = im.d[k] + ',' + im.d[k + 1] + ',' + im.d[k + 2]; cnt.set(key, (cnt.get(key) || 0) + 1); }
      const bg = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number); let m = 0;
      for (let k = 0; k < im.d.length; k += 4) m = Math.max(m, dE([im.d[k], im.d[k + 1], im.d[k + 2]], bg)); det.push(+m.toFixed(2)); if (m >= 2) c++; }
    res[tag] = { x0, rowsWithLine: c, of: n, det };
  }
  await count('rest');
  await grid.evaluate(g => { g.querySelector('.z-frozen-inner').scrollLeft = 200; }); await page.waitForTimeout(500);
  await count('scrolled200');
  fs.writeFileSync(__dirname + '/i37-probe.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
  await browser.close();
})();
