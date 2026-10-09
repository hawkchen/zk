const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const { ctx, page } = await L.open(browser, 'web/navbar.zul');
  const find = (label) => `(() => { const li = [...document.querySelectorAll('.z-navbar')[3].querySelectorAll('li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === '${label}'); return li; })()`;
  await page.evaluate(() => document.querySelectorAll('.z-navbar')[3].scrollIntoView({ block: 'start' }));
  await page.evaluate(() => window.scrollBy(0, -150)); await page.waitForTimeout(200);
  for (const label of ['Contact', 'Settings']) {
    const r = await page.evaluate((f) => { const e = eval(f).querySelector(':scope > .z-nav-content'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, find(label));
    await page.mouse.click(r.x, r.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(600);
  }
  const info = await page.evaluate((f) => {
    const li = eval(f); const ul = li.querySelector(':scope > ul'); const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)); };
    const chain = []; let e = ul; while (e && e !== document.body) { const cs = getComputedStyle(e); chain.push({ tag: e.tagName, cls: e.className, id: e.id, rect: R(e), position: cs.position, overflow: cs.overflow, visibility: cs.visibility, opacity: cs.opacity, display: cs.display, zIndex: cs.zIndex, height: cs.height, clip: cs.clipPath }); e = e.parentElement; }
    const rows = [...ul.querySelectorAll(':scope > li')].map(li => { const c = li.querySelector(':scope > a, :scope > .z-navitem-content'); const b = c.getBoundingClientRect(); const top = document.elementFromPoint(b.left + 60, b.top + b.height / 2); return { label: li.textContent.trim(), rect: R(c), onTop: top ? top.tagName + '.' + top.className.toString().slice(0, 60) : null, insideNested: top ? ul.contains(top) : false }; });
    return { liCls: li.className, ulStyle: ul.getAttribute('style'), chain, rows, scrollY, navbarRect: R(document.querySelectorAll('.z-navbar')[3]) };
  }, find('Settings'));
  console.log(JSON.stringify(info, null, 1));
  await L.shot(page, 'p3-probe-nested-page.png', { x: 0, y: 0, width: 1280, height: 900 });
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
