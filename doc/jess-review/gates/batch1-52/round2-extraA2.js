const { launch, open, idle } = require('./common');
(async () => {
  const b = await launch(); const p = await open(b, '/tabbox.zul');
  const tab = p.locator('.z-tabbox').first().locator('.z-tab.z-tab-selected').first();
  await tab.evaluate((t) => { t.querySelector('.z-tab-text').textContent = 'A much longer selected tab label'; t.style.width = '60px'; });
  await idle(p);
  const r = await tab.evaluate((t) => { const tx = t.querySelector('.z-tab-text'); const chain = []; let e = tx; while (e && e !== t.parentElement) { const c = getComputedStyle(e); const rr = e.getBoundingClientRect(); chain.push({ tag: e.tagName, cls: e.className, x: rr.x, w: rr.width, ov: c.overflow, to: c.textOverflow, ws: c.whiteSpace, disp: c.display, minW: c.minWidth, maxW: c.maxWidth, pl: c.paddingLeft, pr: c.paddingRight }); e = e.parentElement; } return chain; });
  console.log(JSON.stringify(r, null, 0));
  const bb = await tab.boundingBox(); await p.screenshot({ path: __dirname + '/img/extraA-zoom.png', clip: { x: bb.x - 90, y: bb.y - 6, width: bb.width + 180, height: bb.height + 12 }, scale: 'device' });
  await b.close();
})();
