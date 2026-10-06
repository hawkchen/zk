const { chromium, open, settle, helpers } = require('./lib');

const MEASURE = ([sel, fgSel]) => {
  const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
  if (!el) return { error: 'not found: ' + sel };
  const p = __painter(el);
  const fgEl = fgSel ? (el.querySelector(fgSel) || el) : el;
  const exp = __probe('var(--zk-color-secondary-container)', 'var(--zk-color-on-secondary-container)');
  const old = __probe('var(--zk-color-primary-container)', 'var(--zk-color-on-primary-container)');
  const bg = p ? getComputedStyle(p).backgroundColor : 'transparent(all)';
  const fg = getComputedStyle(fgEl).color;
  return { target: __desc(el), painter: __desc(p), fgEl: __desc(fgEl), bg, fg,
    bgPass: bg === exp.bg, fgPass: fg === exp.fg, bgIsOld: bg === old.bg, fgIsOld: fg === old.fg };
};

(async () => {
  const browser = await chromium.launch();
  const out = {};
  const log = (k, v) => { out[k] = v; console.log(k, JSON.stringify(v)); };

  // Row 1 + Row 3
  { const { ctx, page } = await open(browser, 'listbox.zul'); await helpers(page);
    log('probe', await page.evaluate(() => ({ sec: __probe('var(--zk-color-secondary-container)', 'var(--zk-color-on-secondary-container)'), pri: __probe('var(--zk-color-primary-container)', 'var(--zk-color-on-primary-container)') })));
    log('r1', await page.evaluate(MEASURE, ['.z-listbox .z-listitem-selected', '.z-listcell-content']));
    // Row 3: select mold has NO selected option on load -> choose one by user interaction
    log('r3-onload-checked', await page.evaluate(() => document.querySelectorAll('select.z-select option:checked').length));
    await page.locator('select.z-select').selectOption({ label: 'Received' });
    await settle(page);
    log('r3-after-selectOption', await page.evaluate(MEASURE, ['select.z-select option:checked']));
    log('r3-checked-text', await page.evaluate(() => document.querySelector('select.z-select option:checked').textContent));
    await ctx.close(); }
  // Row 3 alt: open the base-select picker with mouse and click an option
  { const { ctx, page } = await open(browser, 'listbox.zul'); await helpers(page);
    const s = page.locator('select.z-select');
    await s.scrollIntoViewIfNeeded();
    await s.click(); await page.waitForTimeout(300);
    await page.locator('select.z-select option', { hasText: 'Draft' }).click().catch(e => console.log('opt click err', e.message.split('\n')[0]));
    await settle(page);
    log('r3-mouse', await page.evaluate(() => { const o = document.querySelector('select.z-select option:checked'); return o ? o.textContent : null; }));
    log('r3-mouse-m', await page.evaluate(MEASURE, ['select.z-select option:checked']));
    await ctx.close(); }

  // Row 2: listgroup — groupSelect is false on this fixture
  { const { ctx, page } = await open(browser, 'listbox-grouping.zul'); await helpers(page);
    log('r2-groupSelect', await page.evaluate(() => zk.Widget.$(document.querySelector('.z-listbox')).groupSelect));
    // click the group label text
    await page.locator('.z-listgroup').first().locator('.z-listcell').first().click({ position: { x: 120, y: 10 } });
    await settle(page);
    log('r2-click-classes', await page.evaluate(() => [...document.querySelectorAll('.z-listgroup')].map(e => e.className)));
    // replacement A (synthetic class): add the class ZK would add when groupSelect=true
    log('r2-synthetic', await page.evaluate((M) => { const g = document.querySelector('.z-listgroup'); g.classList.add('z-listgroup-selected'); const r = eval('(' + M + ')')(['.z-listgroup-selected', '.z-listgroup-content']); g.classList.remove('z-listgroup-selected'); return r; }, MEASURE.toString()));
    // replacement B: client-side groupSelect=true then click
    await page.evaluate(() => { zk.Widget.$(document.querySelector('.z-listbox')).groupSelect = true; });
    await page.locator('.z-listgroup').first().locator('.z-listcell').first().click({ position: { x: 120, y: 10 } });
    await settle(page);
    log('r2-B-classes', await page.evaluate(() => [...document.querySelectorAll('.z-listgroup')].map(e => e.className)));
    log('r2-B', await page.evaluate(MEASURE, ['.z-listgroup-selected', '.z-listgroup-content']));
    log('r2-B-inner', await page.evaluate(() => { const g = document.querySelector('.z-listgroup-selected'); if (!g) return null; return [...g.querySelectorAll('td, div, span')].slice(0, 5).map(c => [__desc(c), getComputedStyle(c).backgroundColor, getComputedStyle(c).color]); }));
    await ctx.close(); }

  // Row 7 replacement: method sequence + Enter + reopen
  { const { ctx, page } = await open(browser, 'searchbox.zul'); await helpers(page);
    const sb = page.locator('.z-searchbox').first();
    await sb.click(); await settle(page);
    await page.keyboard.press('ArrowDown'); await settle(page);
    await page.keyboard.press('ArrowDown'); await settle(page);
    await page.keyboard.press('Enter'); await settle(page);
    log('r7-after-enter-label', (await sb.textContent()).trim());
    await sb.click(); await settle(page);
    await page.mouse.move(1270, 890);
    log('r7-reopen-classes', await page.evaluate(() => [...document.querySelectorAll('.z-searchbox-item')].filter(e => e.offsetParent).map(e => e.className + ' :' + e.textContent.trim())));
    log('r7', await page.evaluate(MEASURE, ['.z-searchbox-popup .z-searchbox-item.z-searchbox-selected']));
    log('r7-visible', await page.evaluate(() => { const e = [...document.querySelectorAll('.z-searchbox-selected')].find(e => e.offsetParent); return e ? __desc(e) : null; }));
    await ctx.close(); }

  // Row 6: menu
  { const { ctx, page } = await open(browser, 'menubar.zul'); await helpers(page);
    await page.evaluate(() => {
      window.__added = [];
      new MutationObserver(ms => ms.forEach(m => { if (m.attributeName === 'class') { const c = m.target.className; if (typeof c === 'string' && /selected/.test(c) && !/selected/.test(m.oldValue || '')) window.__added.push(__desc(m.target)); } }))
        .observe(document.body, { attributes: true, attributeOldValue: true, subtree: true, attributeFilter: ['class'] });
    });
    const knob = await page.evaluate(() => {
      const mi = document.querySelector('.z-menuitem');
      return { rawProp: getComputedStyle(mi).getPropertyValue('--zk-menuitem-selected-bg').trim(),
        probeInMenuitem: __probe('var(--zk-menuitem-selected-bg)', 'var(--zk-color-on-primary-container)', mi),
        probeRoot: __probe('var(--zk-menuitem-selected-bg)', 'var(--zk-color-on-primary-container)') };
    });
    log('r6-knob', knob);
    const proj = page.locator('#menubar1 .z-menu').first();
    await proj.click(); await settle(page);
    log('r6-open-top', await page.evaluate(() => {
      const li = document.querySelector('.z-menubar .z-menu-selected'); if (!li) return null;
      const a = li.querySelector('.z-menu-content'); const b = getComputedStyle(a, '::before');
      return { li: __desc(li), liBg: getComputedStyle(li).backgroundColor, contentBg: getComputedStyle(a).backgroundColor, contentFg: getComputedStyle(a).color, beforeBg: b.backgroundColor, beforeOpacity: b.opacity, beforeContent: b.content };
    }));
    // hover a menuitem in popup
    const item = page.locator('.z-menupopup:visible .z-menuitem').first();
    await item.hover(); await settle(page);
    log('r6-hover-item', await page.evaluate(() => { const li = [...document.querySelectorAll('.z-menupopup .z-menuitem')].find(e => e.offsetParent && /hover|focus/.test(e.className)); if (!li) return null; const a = li.querySelector('.z-menuitem-content'); return { li: __desc(li), contentBg: getComputedStyle(a).backgroundColor, beforeBg: getComputedStyle(a, '::before').backgroundColor, beforeOp: getComputedStyle(a, '::before').opacity }; }));
    await page.keyboard.press('ArrowDown'); await settle(page);
    log('r6-kbd-item', await page.evaluate(() => [...document.querySelectorAll('.z-menupopup .z-menuitem')].filter(e => e.offsetParent).map(e => e.className)));
    // scan for any element painted with the knob value
    log('r6-scan-knob-painted', await page.evaluate(() => { const v = __probe('var(--zk-menuitem-selected-bg)', 'red').bg; return [...document.querySelectorAll('.z-menubar *, .z-menupopup *, .z-menubar, .z-menupopup')].filter(e => getComputedStyle(e).backgroundColor === v).map(__desc); }));
    log('r6-mutations-selected', await page.evaluate(() => window.__added));
    // synthetic class, to show the rule itself
    log('r6-synthetic', await page.evaluate(() => { const li = [...document.querySelectorAll('.z-menupopup .z-menuitem')].find(e => e.offsetParent); li.classList.add('z-menuitem-selected'); const a = li.querySelector('.z-menuitem-content'); const r = { li: __desc(li), bg: getComputedStyle(a).backgroundColor, fg: getComputedStyle(a).color }; li.classList.remove('z-menuitem-selected'); return r; }));
    await ctx.close(); }

  require('fs').writeFileSync(__dirname + '/rows2.json', JSON.stringify(out, null, 2));
  await browser.close();
})();
