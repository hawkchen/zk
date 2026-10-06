const { launch, open, idle } = require('./common');
const SPECS = {
  listbox: { path: '/listbox.zul', root: '.z-listbox', row: '.z-listitem', focusCls: 'z-listitem-focus' },
  tree: { path: '/tree.zul', root: '.z-tree', row: '.z-treerow', focusCls: 'z-treerow-focus' },
};
function state(page, s) {
  return page.evaluate((s) => {
    const root = document.querySelectorAll(s.root)[0];
    const rows = [...root.querySelectorAll(s.row)];
    const vals = (e) => { const c = getComputedStyle(e); return { outlineStyle: c.outlineStyle, outlineWidth: c.outlineWidth, outlineOffset: c.outlineOffset, boxShadow: c.boxShadow }; };
    const isMark = (e) => { const c = getComputedStyle(e); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2) || c.boxShadow !== 'none'; };
    const out = rows.map((r, i) => {
      const els = [r, ...r.querySelectorAll(':scope > td')];
      const markedEls = els.filter(isMark).map((e) => e === r ? 'row' : 'cell' + [...r.children].indexOf(e));
      return { i, text: r.textContent.trim().slice(0, 30), focusCls: r.classList.contains(s.focusCls), marked: markedEls.length > 0, markedEls, rowVals: vals(r), firstCellVals: r.querySelector(':scope > td') ? vals(r.querySelector(':scope > td')) : null };
    });
    const ae = document.activeElement;
    return { count: out.filter((o) => o.marked).length, rows: out, active: ae ? ae.tagName + '.' + ae.className + ' inRoot=' + root.contains(ae) : null };
  }, s);
}
async function clickRow(page, s, idx) {
  const el = page.locator(s.root).first().locator(s.row).nth(idx);
  await el.click();
  await idle(page);
}
(async () => {
  const browser = await launch();
  const res = {};
  for (const [name, s] of Object.entries(SPECS)) {
    const r = res[name] = {};
    let page = await open(browser, s.path);
    await clickRow(page, s, 1);
    r.step1 = await state(page, s);
    await page.keyboard.press('ArrowDown'); await idle(page);
    r.step2 = await state(page, s);
    await clickRow(page, s, 0);
    r.step3 = await state(page, s);
    await page.context().close();
    // also: Tab in from previous element, ArrowDown, then Tab out
    page = await open(browser, s.path);
    // click the page heading (non-focusable, precedes the component) to set the sequential focus start point
    const head = page.locator('.z-text-2xl').first();
    await head.click(); await idle(page);
    r.tabIn = { beforeActive: await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className) };
    await page.keyboard.press('Tab'); await idle(page);
    r.tabIn.afterTab = await state(page, s);
    await page.keyboard.press('ArrowDown'); await idle(page);
    r.tabIn.afterArrow = await state(page, s);
    await page.keyboard.press('Tab'); await idle(page);
    r.tabOut = await state(page, s);
    await page.context().close();
    // forced colors: redo step 2
    page = await open(browser, s.path, { forcedColors: true });
    r.forcedMedia = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    await clickRow(page, s, 1);
    await page.keyboard.press('ArrowDown'); await idle(page);
    r.forcedStep2 = await state(page, s);
    await page.context().close();
  }
  await browser.close();
  console.log(JSON.stringify(res, null, 1));
})();
