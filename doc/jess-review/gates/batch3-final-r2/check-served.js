// Confirms the served CSS carries the NEW body-divider rule (exact child chain) and dumps it.
const { chromium, open } = require('./lib');
(async () => {
  const b = await chromium.launch();
  const { page } = await open(b, 'grid.zul');
  const r = await page.evaluate(() => { const hits = [];
    const walk = (list, href) => { for (const r of list) { if (r.cssRules && !r.selectorText) { walk(r.cssRules, href); continue; }
      if (r.selectorText && /inset/.test(r.style.boxShadow) && /frozen/.test(r.selectorText)) hits.push({ href, sel: r.selectorText.slice(0, 400), n: r.selectorText.split(/,(?![^(]*\))/).length, exactChain: /> table > tbody >/.test(r.selectorText), shadow: r.style.boxShadow }); } };
    for (const s of document.styleSheets) { try { walk(s.cssRules, s.href); } catch (e) {} } return hits; });
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
