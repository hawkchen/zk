const { chromium, open, settle, helpers } = require('./lib');
const fs = require('fs');
const DIR = __dirname;

// WCAG contrast from a screenshot clip: bg = modal pixel, text = pixel with max contrast vs bg
async function contrast(page, locator, name) {
  const box = await locator.boundingBox();
  const buf = await page.screenshot({ clip: box });
  fs.writeFileSync(`${DIR}/contrast-${name}.png`, buf);
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    const counts = new Map();
    for (let i = 0; i < d.length; i += 4) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; counts.set(k, (counts.get(k) || 0) + 1); }
    const bg = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
    const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const cr = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
    let best = bg, bestR = 1;
    for (let i = 0; i < d.length; i += 4) { const p = [d[i], d[i + 1], d[i + 2]]; const r = cr(p, bg); if (r > bestR) { bestR = r; best = p; } }
    return { bgPx: 'rgb(' + bg.join(',') + ')', textPx: 'rgb(' + best.join(',') + ')', ratio: Math.round(bestR * 100) / 100 };
  }, buf.toString('base64'));
}

(async () => {
  const browser = await chromium.launch();
  const out = {};
  const log = (k, v) => { out[k] = v; console.log(k, JSON.stringify(v)); };
  const bgOf = (page, sel) => page.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : s; return e ? getComputedStyle(e).backgroundColor : null; }, sel);

  // ---- listbox: hover, contrast, brand, knob, batch-1 focus
  { const { ctx, page } = await open(browser, 'listbox.zul'); await helpers(page);
    const lb = page.locator('.z-listbox').first();
    const sel = lb.locator('.z-listitem-selected');
    const unsel = lb.locator('.z-listitem').first();
    await page.mouse.move(1270, 890);
    const selRest = await sel.evaluate(e => getComputedStyle(e).backgroundColor);
    await sel.hover(); await page.waitForTimeout(150);
    const selHover = await sel.evaluate(e => getComputedStyle(e).backgroundColor);
    await unsel.hover(); await page.waitForTimeout(150);
    const unselHover = await unsel.evaluate(e => getComputedStyle(e).backgroundColor);
    const unselClass = await unsel.evaluate(e => e.className);
    log('lb-hover', { selRest, selHover, unselHover, unselRow: unselClass, distinctFromRest: selHover !== selRest, distinctFromUnselHover: selHover !== unselHover });
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    log('lb-contrast', await contrast(page, sel.locator('.z-listcell').first(), 'r1-listbox'));
    // brand
    for (const b of ['copper', 'blue']) {
      await page.evaluate(b => document.documentElement.setAttribute('data-brand', b), b);
      await page.waitForTimeout(100);
      log('lb-brand-' + b, await page.evaluate(() => ({ row: getComputedStyle(document.querySelector('.z-listbox .z-listitem-selected')).backgroundColor, sec: __probe('var(--zk-color-secondary-container)', 'red').bg, pri: __probe('var(--zk-color-primary-container)', 'red').bg })));
    }
    await page.evaluate(() => document.documentElement.removeAttribute('data-brand'));
    // knob
    await page.addStyleTag({ content: ':root{--zk-listbox-selected-bg: rgb(255, 0, 0)}' });
    log('lb-knob-red', await bgOf(page, '.z-listbox .z-listitem-selected'));
    await ctx.close(); }

  // batch-1 focus ring on keyboard (listbox: Tab in, ArrowDown)
  { const { ctx, page } = await open(browser, 'listbox.zul'); await helpers(page);
    await page.locator('.z-label').first().click();
    let inside = false;
    for (let i = 0; i < 25 && !inside; i++) { await page.keyboard.press('Tab'); inside = await page.evaluate(() => document.querySelector('.z-listbox').contains(document.activeElement)); }
    await page.keyboard.press('ArrowDown'); await settle(page);
    log('lb-batch1', await page.evaluate(() => { const lb = document.querySelector('.z-listbox'); const f = lb.querySelector('.z-listitem-focus'); return f ? { row: __desc(f), selected: f.classList.contains('z-listitem-selected'), outlineStyle: getComputedStyle(f).outlineStyle, outlineWidth: getComputedStyle(f).outlineWidth, active: __desc(document.activeElement) } : 'no focus row'; }));
    await ctx.close(); }

  // ---- tree: hover, contrast, brand, batch-1
  { const { ctx, page } = await open(browser, 'tree.zul'); await helpers(page);
    const tr = page.locator('.z-tree').first();
    const sel = tr.locator('.z-treerow-selected');
    const unsel = tr.locator('.z-treerow:not(.z-treerow-selected)').first();
    await page.mouse.move(1270, 890);
    const selRest = await sel.evaluate(e => getComputedStyle(e).backgroundColor);
    await sel.hover(); await page.waitForTimeout(150);
    const selHover = await sel.evaluate(e => getComputedStyle(e).backgroundColor);
    await unsel.hover(); await page.waitForTimeout(150);
    const unselHover = await unsel.evaluate(e => getComputedStyle(e).backgroundColor);
    log('tree-hover', { selRest, selHover, unselHover, distinctFromRest: selHover !== selRest, distinctFromUnselHover: selHover !== unselHover });
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    log('tree-contrast', await contrast(page, sel.locator('.z-treecell-text, .z-treecell-content').first(), 'r4-tree'));
    for (const b of ['copper', 'blue']) {
      await page.evaluate(b => document.documentElement.setAttribute('data-brand', b), b);
      await page.waitForTimeout(100);
      log('tree-brand-' + b, await page.evaluate(() => ({ row: getComputedStyle(document.querySelector('.z-tree .z-treerow-selected')).backgroundColor, sec: __probe('var(--zk-color-secondary-container)', 'red').bg })));
    }
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'tree.zul'); await helpers(page);
    await page.locator('.z-label').first().click();
    let inside = false;
    for (let i = 0; i < 25 && !inside; i++) { await page.keyboard.press('Tab'); inside = await page.evaluate(() => document.querySelector('.z-tree').contains(document.activeElement)); }
    await page.keyboard.press('ArrowUp'); await settle(page);
    log('tree-batch1', await page.evaluate(() => { const t = document.querySelector('.z-tree'); const f = t.querySelector('.z-treerow-focus'); return f ? { row: __desc(f), selected: f.classList.contains('z-treerow-selected'), outlineStyle: getComputedStyle(f).outlineStyle, outlineWidth: getComputedStyle(f).outlineWidth } : 'no focus row'; }));
    await ctx.close(); }

  // ---- combobox contrast
  { const { ctx, page } = await open(browser, 'combobox.zul'); await helpers(page);
    const cb = page.locator('.z-combobox').first();
    await cb.locator('.z-combobox-button').click(); await settle(page);
    await page.locator('.z-combobox-popup:visible .z-comboitem').first().click(); await settle(page);
    await cb.locator('.z-combobox-button').click(); await settle(page);
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    const it = page.locator('.z-combobox-popup:visible .z-comboitem-selected');
    log('cb-sel-bg', await it.evaluate(e => getComputedStyle(e).backgroundColor));
    log('cb-contrast', await contrast(page, it, 'r5-combobox'));
    await ctx.close(); }

  // ---- searchbox contrast (pre-selected single searchbox, 3rd .z-searchbox)
  { const { ctx, page } = await open(browser, 'searchbox.zul'); await helpers(page);
    await page.locator('.z-searchbox').nth(2).click(); await settle(page);
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    const it = page.locator('.z-searchbox-popup:visible .z-searchbox-selected');
    log('sb-sel', await it.evaluate(e => [e.className, getComputedStyle(e).backgroundColor]));
    log('sb-contrast', await contrast(page, it, 'r7-searchbox'));
    await ctx.close(); }

  // ---- forced colors rows 1, 4
  for (const [pg, s] of [['listbox.zul', '.z-listbox .z-listitem-selected'], ['tree.zul', '.z-tree .z-treerow-selected']]) {
    const { ctx, page } = await open(browser, pg); await helpers(page);
    await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(200);
    log('fc-' + pg, await page.evaluate(s => { const e = document.querySelector(s); const sys = __probe('Highlight', 'HighlightText'); const cell = e.querySelector('.z-listcell-content, .z-treecell-content'); return { bg: getComputedStyle(e).backgroundColor, fg: getComputedStyle(e).color, cellFg: cell && getComputedStyle(cell).color, Highlight: sys.bg, HighlightText: sys.fg }; }, s));
    await ctx.close(); }

  // ---- other families
  { const { ctx, page } = await open(browser, 'paging.zul'); await helpers(page);
    log('fam-paging', await page.evaluate(() => [...document.querySelectorAll('.z-paging-selected')].map(e => ({ el: __desc(e), text: e.textContent.trim(), bg: getComputedStyle(e).backgroundColor, fg: getComputedStyle(e).color, border: getComputedStyle(e).borderColor }))));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'navbar.zul'); await helpers(page);
    log('fam-navitem-onload', await page.evaluate(() => document.querySelectorAll('.z-navitem-selected').length));
    await page.locator('.z-navitem').first().click(); await settle(page);
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    log('fam-navitem', await page.evaluate(() => [...document.querySelectorAll('.z-navitem-selected')].map(e => { const a = e.querySelector('.z-navitem-content'); return { el: __desc(e), text: e.textContent.trim(), contentBg: getComputedStyle(a).backgroundColor, contentFg: getComputedStyle(a).color, fw: getComputedStyle(a).fontWeight }; })));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'organigram.zul'); await helpers(page);
    await page.mouse.move(1270, 890);
    log('fam-organigram', await page.evaluate(() => [...document.querySelectorAll('.z-orgitem-selected > .z-orgnode')].map(e => ({ el: __desc(e.parentElement) + ' > ' + __desc(e), text: e.textContent.trim(), bg: getComputedStyle(e).backgroundColor, fg: getComputedStyle(e).color, border: getComputedStyle(e).borderTopColor }))));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'calendar.zul'); await helpers(page);
    await page.mouse.move(1270, 890);
    log('fam-calendar', await page.evaluate(() => [...document.querySelectorAll('td.z-calendar-selected')].slice(0, 2).map(e => ({ el: __desc(e), text: e.textContent.trim(), tdBg: getComputedStyle(e).backgroundColor, fg: getComputedStyle(e).color, beforeBg: getComputedStyle(e, '::before').backgroundColor }))));
    await ctx.close(); }

  fs.writeFileSync(DIR + '/protect.json', JSON.stringify(out, null, 2));
  await browser.close();
})();
