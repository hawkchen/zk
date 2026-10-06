const { launch, open, idle } = require('./common');
const SPECS = {
  listbox: { path: '/listbox.zul', root: '.z-listbox', row: '.z-listitem', focusCls: 'z-listitem-focus', tabArrow: 'ArrowDown' },
  tree: { path: '/tree.zul', root: '.z-tree', row: '.z-treerow', focusCls: 'z-treerow-focus', tabArrow: 'ArrowUp' },
};
function state(page, s) {
  return page.evaluate((s) => {
    const root = document.querySelectorAll(s.root)[0];
    const rows = [...root.querySelectorAll(s.row)];
    const vals = (e) => { const c = getComputedStyle(e); return { outlineStyle: c.outlineStyle, outlineWidth: c.outlineWidth, outlineOffset: c.outlineOffset, boxShadow: c.boxShadow, bg: c.backgroundColor }; };
    const isMark = (e) => { const c = getComputedStyle(e); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2) || c.boxShadow !== 'none'; };
    const out = rows.map((r, i) => {
      const cells = [...r.querySelectorAll(':scope > td')];
      const els = [r, ...cells];
      const markedEls = els.filter(isMark).map((e) => e === r ? 'row' : 'cell' + cells.indexOf(e));
      const carrier = isMark(r) ? 'row' : (cells[0] && isMark(cells[0]) ? 'cell0' : (markedEls[0] || null));
      const carrierEl = carrier === 'row' ? r : carrier ? cells[parseInt(carrier.slice(4))] : null;
      return { i, text: r.textContent.trim().slice(0, 30), cls: r.className, focusCls: r.classList.contains(s.focusCls), marked: markedEls.length > 0, markedEls, carrier, carrierVals: carrierEl ? vals(carrierEl) : null };
    });
    const ae = document.activeElement;
    return { count: out.filter((o) => o.marked).length, marked: out.filter(o => o.marked), focusRows: out.filter(o => o.focusCls).map(o => o.i), active: ae ? ae.tagName + '.' + ae.className + ' inRoot=' + root.contains(ae) : null };
  }, s);
}
async function clickRow(page, s, idx) {
  await page.locator(s.root).first().locator(s.row).nth(idx).click();
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
    page = await open(browser, s.path);
    await page.locator('.z-text-2xl').first().click(); await idle(page);
    r.tabInBefore = await page.evaluate(() => document.activeElement.tagName + '.' + document.activeElement.className);
    await page.keyboard.press('Tab'); await idle(page);
    r.afterTab = await state(page, s);
    await page.keyboard.press(s.tabArrow); await idle(page);
    r.afterArrow = await state(page, s);
    await page.keyboard.press('Tab'); await idle(page);
    r.tabOut = await state(page, s);
    await page.context().close();
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
