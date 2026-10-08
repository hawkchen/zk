// Batch 11 RED, #57 side probe: do the North/South bodies already overflow (scrollbar) at their current size? (relevant to adding padding there)
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const { ctx, page } = await L.open(browser, 'borderlayout.zul');
  const out = await page.evaluate(() => [...document.querySelectorAll('.z-borderlayout')].map((bl, i) => { const r = {}; for (const k of ['north', 'south', 'west', 'east', 'center']) { const b = bl.querySelector('.z-' + k + '-body'); if (!b) continue; const lb = b.querySelector('.z-label'); const lc = lb && getComputedStyle(lb); r[k] = { clientH: b.clientHeight, scrollH: b.scrollHeight, clientW: b.clientWidth, offsetW: b.offsetWidth, overflowY: b.scrollHeight > b.clientHeight, vScrollbarW: b.offsetWidth - b.clientWidth, labelLH: lc && lc.lineHeight, labelFS: lc && lc.fontSize, labelDisplay: lc && lc.display, bodyLH: getComputedStyle(b).lineHeight, bodyFS: getComputedStyle(b).fontSize }; } return { i, r }; }));
  // pixel: right 20px of BL0 north body
  const g = await page.evaluate(() => { const b = document.querySelector('.z-north-body'); const r = b.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  const S = await L.shot(page, 'probe-ns-overflow-bl0-north.png', { x: g.r - 40, y: g.t - 4, width: 44, height: g.b - g.t + 8 });
  const cols = []; for (let x = g.r - 12; x < g.r; x++) cols.push([x, L.median(S.rect(x, x, g.t + 1, g.b - 2).map(p => p.c))]);
  await ctx.close(); await browser.close(); L.save('probe-ns-overflow.json', { out, cols });
  for (const o of out) console.log('BL' + o.i, JSON.stringify(o.r));
  console.log('BL0 north right columns', JSON.stringify(cols));
})();
