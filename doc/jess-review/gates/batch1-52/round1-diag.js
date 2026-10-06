const { launch, open } = require('./common');
(async () => {
  const b = await launch(); const p = await open(b, '/tabbox.zul');
  const r = await p.evaluate(() => [0,3,5,7].map(i => { const box = document.querySelectorAll('.z-tabbox')[i]; const t = box.querySelector('.z-tab-selected'); const tr = t.getBoundingClientRect(); const o = {};
    for (const ps of ['::before','::after']) { const c = getComputedStyle(t, ps); if (c.content !== 'none' && c.content !== 'normal') o[ps] = { w: c.width, h: c.height, pos: c.position, bottom: c.bottom, top: c.top, left: c.left, right: c.right, z: c.zIndex }; }
    const tx = t.querySelector('.z-tab-text'); for (const ps of ['::before','::after']) { const c = getComputedStyle(tx, ps); if (c.content !== 'none' && c.content !== 'normal') o['text'+ps] = { w: c.width, h: c.height, pos: c.position, bottom: c.bottom, z: c.zIndex }; }
    const tabs = t.parentElement; const tc = getComputedStyle(tabs); const pr = tabs.getBoundingClientRect();
    o.tab = { top: tr.top, bottom: tr.bottom, left: tr.left, right: tr.right, mb: getComputedStyle(t).marginBottom, mr: getComputedStyle(t).marginRight, ml: getComputedStyle(t).marginLeft, mt: getComputedStyle(t).marginTop, z: getComputedStyle(t).zIndex, pos: getComputedStyle(t).position };
    o.tabsParent = { cls: tabs.className, bottom: pr.bottom, bb: tc.borderBottomWidth, after: getComputedStyle(tabs,'::after').content, beforeC: getComputedStyle(tabs,'::before').content };
    const xr = tx.getBoundingClientRect(); o.textBox = { top: xr.top - tr.top, h: xr.height, pt: getComputedStyle(tx).paddingTop, pb: getComputedStyle(tx).paddingBottom, lh: getComputedStyle(tx).lineHeight };
    return { i, o }; }));
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
