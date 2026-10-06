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
    const proj = page.locator('.z-menubar').first().locator('.z-menu').first();
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

  require('fs').writeFileSync(__dirname + '/menu.json', JSON.stringify(out, null, 2));
  await browser.close();
})();
