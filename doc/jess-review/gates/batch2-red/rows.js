const { chromium, open, settle, helpers } = require('./lib');

async function measure(page, sel, fgSel) {
  return page.evaluate(([sel, fgSel]) => {
    const el = document.querySelector(sel);
    if (!el) return { error: 'not found: ' + sel };
    const p = __painter(el);
    const fgEl = fgSel ? (el.querySelector(fgSel) || el) : el;
    const exp = __probe('var(--zk-color-secondary-container)', 'var(--zk-color-on-secondary-container)');
    const old = __probe('var(--zk-color-primary-container)', 'var(--zk-color-on-primary-container)');
    const bg = p ? getComputedStyle(p).backgroundColor : 'transparent(all)';
    const fg = getComputedStyle(fgEl).color;
    return {
      target: __desc(el), painter: __desc(p), fgEl: __desc(fgEl),
      bg, fg, expBg: exp.bg, expFg: exp.fg, oldBg: old.bg, oldFg: old.fg,
      bgPass: bg === exp.bg, fgPass: fg === exp.fg,
      bgIsOld: bg === old.bg, fgIsOld: fg === old.fg,
    };
  }, [sel, fgSel]);
}

(async () => {
  const browser = await chromium.launch();
  const out = {};
  const log = (k, v) => { out[k] = v; console.log(k, JSON.stringify(v)); };

  // Row 1 listbox
  { const { ctx, page } = await open(browser, 'listbox.zul'); await helpers(page);
    log('r1', await measure(page, '.z-listbox:first-of-type .z-listitem-selected', '.z-listcell-content'));
    log('r1-first-listbox-check', await page.evaluate(() => { const lb = document.querySelector('.z-listbox'); const s = lb.querySelector('.z-listitem-selected'); return s && s.textContent; }));
    // Row 3 select mold
    log('r3-info', await page.evaluate(() => { const s = document.querySelector('select.z-select'); return s ? { cls: s.className, size: s.size, appearance: getComputedStyle(s).appearance, opts: [...s.options].map(o => o.textContent + (o.selected ? '*' : '') + (o.defaultSelected ? '(dflt)' : '')), supportsBase: CSS.supports('appearance: base-select') } : null; }));
    log('r3', await measure(page, 'select.z-select option:checked'));
    await ctx.close(); }

  // Row 2 listgroup
  { const { ctx, page } = await open(browser, 'listbox-grouping.zul'); await helpers(page);
    log('r2-before', await page.evaluate(() => [...document.querySelectorAll('.z-listgroup')].map(e => e.className)));
    await page.locator('.z-listgroup').first().locator('.z-listgroup-content, .z-listcell-content').first().click({ position: { x: 60, y: 8 } }).catch(async e => { console.log('click fallback', e.message); await page.locator('.z-listgroup').first().click(); });
    await settle(page);
    log('r2-after', await page.evaluate(() => [...document.querySelectorAll('.z-listgroup')].map(e => e.className)));
    log('r2', await measure(page, '.z-listgroup-selected', '.z-listgroup-content'));
    log('r2-inner', await page.evaluate(() => { const g = document.querySelector('.z-listgroup-selected'); if (!g) return null; return [...g.querySelectorAll('*')].slice(0, 6).map(c => [__desc(c), getComputedStyle(c).backgroundColor, getComputedStyle(c).color]); }));
    await ctx.close(); }

  // Row 4 tree
  { const { ctx, page } = await open(browser, 'tree.zul'); await helpers(page);
    log('r4', await page.evaluate(() => { const t = document.querySelector('.z-tree'); const r = t.querySelector('.z-treerow-selected'); return r ? r.id : null; }));
    log('r4m', await measure(page, '.z-tree .z-treerow-selected', '.z-treecell-content'));
    await ctx.close(); }

  // Row 5 combobox
  { const { ctx, page } = await open(browser, 'combobox.zul'); await helpers(page);
    const cb = page.locator('.z-combobox').first();
    await cb.locator('.z-combobox-button').click(); await settle(page);
    const pp = page.locator('.z-combobox-popup:visible').first();
    await pp.locator('.z-comboitem').first().click(); await settle(page);
    log('r5-value', await cb.locator('input').inputValue());
    await cb.locator('.z-combobox-button').click(); await settle(page);
    log('r5', await measure(page, '.z-combobox-popup.z-combobox-open .z-comboitem-selected, .z-comboitem-selected', '.z-comboitem-text'));
    await ctx.close(); }

  // Row 7 searchbox — approach A: pre-selected single searchbox
  { const { ctx, page } = await open(browser, 'searchbox.zul'); await helpers(page);
    log('r7-count', await page.locator('.z-searchbox').count());
    // approach B (method): first searchbox, open, ArrowDown, Enter
    const sb = page.locator('.z-searchbox').first();
    await sb.click(); await settle(page);
    log('r7B-open', await page.evaluate(() => [...document.querySelectorAll('.z-searchbox-popup')].map(p => ({ vis: p.offsetParent !== null, items: p.querySelectorAll('.z-searchbox-item').length }))));
    await page.keyboard.press('ArrowDown'); await settle(page);
    await page.keyboard.press('ArrowDown'); await settle(page);
    log('r7B-classes-after-arrows', await page.evaluate(() => [...document.querySelectorAll('.z-searchbox-item')].filter(e => e.offsetParent).map(e => e.className)));
    log('r7B-active', await measure(page, '.z-searchbox-active'));
    await page.keyboard.press('Enter'); await settle(page);
    log('r7B-classes-after-enter', await page.evaluate(() => [...document.querySelectorAll('.z-searchbox-item')].filter(e => e.offsetParent).map(e => e.className)));
    log('r7B-selected', await measure(page, '.z-searchbox-selected'));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'searchbox.zul'); await helpers(page);
    const sb = page.locator('.z-searchbox').nth(2); // single pre-selected (0 default,1 disabled,2 single)
    log('r7A-text', await sb.textContent());
    await sb.click(); await settle(page);
    log('r7A-classes', await page.evaluate(() => [...document.querySelectorAll('.z-searchbox-item')].filter(e => e.offsetParent).map(e => e.className + ' ' + e.textContent.trim())));
    log('r7A', await measure(page, '.z-searchbox-popup .z-searchbox-selected'));
    await ctx.close(); }

  // Row 8 chosenbox
  { const { ctx, page } = await open(browser, 'chosenbox.zul'); await helpers(page);
    const ch = page.locator('.z-chosenbox').first();
    log('r8-chips', await ch.locator('.z-chosenbox-item').allTextContents());
    await ch.locator('input').click(); await settle(page);
    await page.keyboard.press('Escape').catch(() => {});
    await page.keyboard.press('Backspace'); await settle(page);
    log('r8-cls', await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox')][0].querySelectorAll('.z-chosenbox-item').length + ' ' + [...document.querySelectorAll('.z-chosenbox-item')].map(e => e.className).join(' | ')));
    log('r8', await measure(page, '.z-chosenbox-item-focus', '.z-chosenbox-item-content'));
    await ctx.close(); }

  // Row 9 selectbox
  { const { ctx, page } = await open(browser, 'selectbox.zul'); await helpers(page);
    log('r9-info', await page.evaluate(() => { const s = document.querySelector('select.z-selectbox'); return { cls: s.className, opts: [...s.options].map(o => o.textContent + (o.selected ? '*' : '')), app: getComputedStyle(s).appearance }; }));
    log('r9', await measure(page, 'select.z-selectbox option:checked'));
    await ctx.close(); }

  require('fs').writeFileSync(__dirname + '/rows.json', JSON.stringify(out, null, 2));
  await browser.close();
})();
