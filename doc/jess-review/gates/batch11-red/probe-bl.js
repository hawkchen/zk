// Batch 11 RED, borderlayout DOM shape probe (region classes are on nested nodes, not direct children).
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const { ctx, page } = await L.open(browser, 'borderlayout.zul');
  const out = await page.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const bl0 = document.querySelector('.z-borderlayout');
    const tree = (e, d) => d > 4 ? null : ({ tag: e.tagName, cls: e.className, rect: R(e), kids: [...e.children].slice(0, 6).map(c => tree(c, d + 1)) });
    const regions = [...document.querySelectorAll('.z-borderlayout')].map((bl, i) => { const res = { i, rect: R(bl), regions: {} };
      for (const k of ['north', 'south', 'west', 'east', 'center']) { const r = bl.querySelector('.z-' + k); if (!r) continue; const body = r.querySelector('.z-' + k + '-body'); const head = r.querySelector('.z-' + k + '-header'); const bc = getComputedStyle(body); const first = body.firstElementChild;
        res.regions[k] = { cls: r.className, rect: R(r), head: R(head), headCls: head && head.className, body: R(body), bodyCls: body.className, bodyPad: bc.padding, bodyBorder: bc.border, bodyBg: bc.backgroundColor, bodyOverflow: bc.overflow, regionCs: (c => ({ border: c.border, bg: c.backgroundColor }))(getComputedStyle(r)), firstChild: first ? first.tagName + '.' + first.className : null, firstChildRect: R(first), firstChildPad: first && getComputedStyle(first).padding, bodyChildren: [...body.childNodes].map(n => n.nodeType === 3 ? '#text(' + n.textContent.trim().slice(0, 20) + ')' : n.tagName + '.' + n.className + (n.getAttribute('style') ? '[' + n.getAttribute('style').slice(0, 60) + ']' : '')) }; }
      return res; });
    return { tree: tree(bl0, 0), regions };
  });
  await ctx.close(); await browser.close();
  L.save('probe-bl.json', out);
  console.log(JSON.stringify(out.tree, null, 0).slice(0, 3000));
  for (const bl of out.regions) { console.log('BL', bl.i, JSON.stringify(bl.rect)); for (const [k, r] of Object.entries(bl.regions)) console.log('  ', k, r.cls, 'rect', JSON.stringify(r.rect), 'head', JSON.stringify(r.head), 'body', JSON.stringify(r.body), 'pad', r.bodyPad, 'border', r.bodyBorder, 'bg', r.bodyBg, 'ovf', r.bodyOverflow, 'regionCs', JSON.stringify(r.regionCs), '\n      first', r.firstChild, JSON.stringify(r.firstChildRect), 'pad', r.firstChildPad, 'children', JSON.stringify(r.bodyChildren)); }
})();
