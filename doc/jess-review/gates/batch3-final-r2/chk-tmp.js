const { chromium, open } = require('./lib');
(async () => { const b = await chromium.launch(); const { page } = await open(b, 'tmp-b3final-r2-frozen.zul');
  const r = await page.evaluate(() => ({ err: document.querySelector('.z-messagebox-window,.z-error') ? document.body.innerText.slice(0, 300) : null,
    roots: [...document.querySelectorAll('[class*="R-"],[class*="L-"]')].map(e => { const own = x => x.closest('.z-grid,.z-listbox,.z-tree') === e; const hs = [...e.querySelectorAll('.z-column,.z-listheader,.z-treecol')].filter(own);
      const fi = [...e.querySelectorAll('.z-frozen-inner')].filter(own)[0];
      return (e.className.match(/[RL]-\w+/) || [''])[0] + ' w' + Math.round(e.getBoundingClientRect().width) + ' frozenCols=' + hs.filter(h => /z-frozen-col/.test(h.className)).length + '/' + hs.length + ' scroll=' + (fi ? fi.scrollWidth - fi.clientWidth : '-'); }) }));
  console.log(JSON.stringify(r, null, 1)); await b.close(); })();
