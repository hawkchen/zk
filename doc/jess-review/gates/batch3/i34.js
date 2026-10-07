// #34 baseline (no RED per D26): table right edge - body inner right edge, header and body, every grid on grid.zul
const { chromium, open } = require('./lib');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const { ctx, page } = await open(browser, 'grid.zul');
  const names = ['Row States', 'Basic', 'Auxhead above', 'Auxhead below', 'Frozen', 'Empty', 'No-border'];
  const res = await page.evaluate((names) => [...document.querySelectorAll('.z-grid')].map((g, i) => {
    const body = g.querySelector('.z-grid-body'), head = g.querySelector('.z-grid-header');
    const inner = e => { const r = e.getBoundingClientRect(); return r.left + e.clientLeft + e.clientWidth; };
    const bt = body && body.querySelector('table'), ht = head && head.querySelector('table');
    const bodyInner = body ? inner(body) : null;
    return {
      i, name: names[i], gridW: g.getBoundingClientRect().width,
      bodyRectRight: body && body.getBoundingClientRect().right, bodyInnerRight: bodyInner,
      bodyTableRight: bt && bt.getBoundingClientRect().right, headTableRight: ht && ht.getBoundingClientRect().right,
      headInnerRight: head ? inner(head) : null,
      diffBody: bt ? +(bt.getBoundingClientRect().right - bodyInner).toFixed(2) : null,
      diffHead: ht ? +(ht.getBoundingClientRect().right - bodyInner).toFixed(2) : null,
      bodyHasVScroll: body ? body.scrollHeight > body.clientHeight : null,
      bodyHasHScroll: body ? body.scrollWidth > body.clientWidth : null,
    };
  }), names);
  console.log(JSON.stringify(res, null, 1));
  fs.writeFileSync(__dirname + '/i34.json', JSON.stringify(res, null, 1));
  await browser.close();
})();
