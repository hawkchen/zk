const { chromium, open, settle, helpers } = require('./lib');

const MEASURE = ([sel, fgSel, root]) => {
  let el;
  if (root === 'visible') el = [...document.querySelectorAll(sel)].find(e => e.offsetParent || e.getClientRects().length);
  else el = document.querySelector(sel);
  if (!el) return { error: 'not found: ' + sel };
  const p = __painter(el);
  const fgEl = fgSel ? (el.querySelector(fgSel) || el) : el;
  const exp = __probe('var(--zk-color-secondary-container)', 'var(--zk-color-on-secondary-container)');
  const bg = p ? getComputedStyle(p).backgroundColor : 'transparent(all)';
  const fg = getComputedStyle(fgEl).color;
  return { target: __desc(el), painter: __desc(p), fgEl: __desc(fgEl), bg, fg, expBg: exp.bg, expFg: exp.fg,
    bgPass: bg === exp.bg, fgPass: fg === exp.fg };
};

(async () => {
  const browser = await chromium.launch();
  const out = {};
  const log = (k, v) => { out[k] = v; console.log(k, JSON.stringify(v)); };

  { const { ctx, page } = await open(browser, 'listbox.zul'); await helpers(page);
    await page.mouse.move(1270, 890);
    log('r1', await page.evaluate(MEASURE, ['.z-listbox .z-listitem-selected', '.z-listcell-content']));
    await page.locator('select.z-select').selectOption({ label: 'Received' }); await settle(page);
    log('r3', await page.evaluate(MEASURE, ['select.z-select option:checked']));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'listbox-grouping.zul'); await helpers(page);
    await page.mouse.move(1270, 890);
    log('r2', await page.evaluate((M) => { const g = document.querySelector('tr.z-listgroup'); g.classList.add('z-listgroup-selected'); const r = eval('(' + M + ')')(['tr.z-listgroup.z-listgroup-selected']); g.classList.remove('z-listgroup-selected'); return r; }, MEASURE.toString()));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'tree.zul'); await helpers(page);
    await page.mouse.move(1270, 890);
    log('r4', await page.evaluate(MEASURE, ['.z-tree .z-treerow-selected', '.z-treecell-content']));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'combobox.zul'); await helpers(page);
    const cb = page.locator('.z-combobox').first();
    await cb.locator('.z-combobox-button').click(); await settle(page);
    await page.locator('.z-combobox-popup:visible .z-comboitem').first().click(); await settle(page);
    await cb.locator('.z-combobox-button').click(); await settle(page);
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    log('r5', await page.evaluate(MEASURE, ['.z-comboitem-selected', '.z-comboitem-text', 'visible']));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'menubar.zul'); await helpers(page);
    log('r6', await page.evaluate(() => { const mi = document.querySelector('.z-menuitem'); const k = __probe('var(--zk-menuitem-selected-bg)', 'red', mi); const exp = __probe('var(--zk-color-secondary-container)', 'var(--zk-color-on-secondary-container)', mi); return { bg: k.bg, expBg: exp.bg, bgPass: k.bg === exp.bg }; }));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'searchbox.zul'); await helpers(page);
    const sb = page.locator('.z-searchbox').first();
    await sb.click(); await settle(page);
    await page.keyboard.press('ArrowDown'); await settle(page);
    await page.keyboard.press('ArrowDown'); await settle(page);
    await page.keyboard.press('Enter'); await settle(page);
    await sb.click(); await settle(page);
    await page.mouse.move(1270, 890); await page.waitForTimeout(200);
    log('r7-classes', await page.evaluate(() => [...document.querySelectorAll('.z-searchbox-popup')].filter(p => p.offsetParent || p.getClientRects().length).map(p => [...p.querySelectorAll('.z-searchbox-item')].map(e => e.className))));
    log('r7', await page.evaluate(() => { const p = [...document.querySelectorAll('.z-searchbox-popup')].find(p => p.offsetParent || p.getClientRects().length); const e = p && p.querySelector('.z-searchbox-selected'); if (!e) return { error: 'no visible selected' }; e.setAttribute('data-vsel', '1'); return 1; }));
    log('r7m', await page.evaluate(MEASURE, ['[data-vsel="1"]']));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'chosenbox.zul'); await helpers(page);
    const ch = page.locator('.z-chosenbox').first();
    await ch.locator('input').click(); await settle(page);
    await page.keyboard.press('Escape'); await settle(page);
    await page.keyboard.press('Backspace'); await settle(page);
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    log('r8', await page.evaluate(MEASURE, ['span.z-chosenbox-item.z-chosenbox-item-focus']));
    await ctx.close(); }

  { const { ctx, page } = await open(browser, 'selectbox.zul'); await helpers(page);
    log('r9', await page.evaluate(MEASURE, ['.z-selectbox option:checked']));
    await ctx.close(); }

  require('fs').writeFileSync(__dirname + '/verify.json', JSON.stringify(out, null, 2));
  await browser.close();
})();
