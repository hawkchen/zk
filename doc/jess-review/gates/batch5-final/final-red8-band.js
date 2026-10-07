// #8 FINAL: the former empty band (RED: x = 260 / 277.5 / 295 on the hovered "Japan" row of the single-column popup)
// must now hit the item, not the bare popup, and a click there must expand the sub-column. Output: final-red8-band.json
const L = require('./final-lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'cascader.zul');
  const id = await page.evaluate(() => document.querySelector('.z-cascader').id);
  await page.click('#' + id, { position: { x: 180, y: 20 } }); await L.settle(page);
  const japan = await page.evaluate(id => document.getElementById(id + '-pp').querySelectorAll('.z-cascader-item')[1].getBoundingClientRect().toJSON(), id);
  await page.mouse.move(japan.x + 30, japan.y + japan.height / 2); await page.waitForTimeout(250);
  const out = { japanRect: japan };
  out.bandHits = await page.evaluate(([id, y]) => { const pp = document.getElementById(id + '-pp'); const li = pp.querySelectorAll('.z-cascader-item')[1]; const pr = pp.getBoundingClientRect(); const cs = getComputedStyle(pp); const innerR = pr.right - parseFloat(cs.borderRightWidth);
    return { popupInnerRight: innerR, hits: [260, 277.5, 295, innerR - 0.5].map(x => { const e = document.elementFromPoint(x, y); return { x, hit: e ? e.tagName + '.' + e.className.slice(0, 40) : null, onItem: !!(e && (e === li || li.contains(e))) }; }) }; }, [id, japan.y + japan.height / 2]);
  await page.mouse.click(277, japan.y + japan.height / 2); await L.settle(page);
  out.clickAt277 = await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); return { caves: pp.querySelectorAll('.z-cascader-cave').length, popupOpen: getComputedStyle(pp).display !== 'none', caveWidths: [...pp.querySelectorAll('.z-cascader-cave')].map(c => c.getBoundingClientRect().width), popupWidth: pp.getBoundingClientRect().width }; }, id);
  await page.keyboard.press('Escape'); await L.settle(page);
  out.afterEscape = await page.evaluate(id => getComputedStyle(document.getElementById(id + '-pp')).display, id);
  await ctx.close(); await browser.close();
  L.save('final-red8-band.json', out);
})().catch(e => { console.error(e); process.exit(1); });
