// Batch 14 FINAL — P4 side effects: z-menu rows that carry an `image` (vertical menubar rows, top-level horizontal rows),
// popups containing only image rows, and the colorbox popup (does it reuse menu classes / images?).
const L = require('./lib.js');
const M = require('./m14.js');

const R = `(e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; })`;

// every li.z-menu / li.z-menuitem anywhere in the document that has an <img>: where it lives, computed img box
const inventorySrc = `(function () {
  const R = ${R};
  const out = [];
  for (const li of document.querySelectorAll('li.z-menu, li.z-menuitem')) {
    const img = li.querySelector(':scope > a img, :scope > a > img');
    if (!img) continue;
    const bar = li.closest('.z-menubar'); const pop = li.closest('.z-menupopup');
    const vis = getComputedStyle(li).display !== 'none' && li.getBoundingClientRect().width > 0;
    out.push({ kind: li.classList.contains('z-menu') ? 'menu' : 'menuitem', label: (li.querySelector('.z-menu-text, .z-menuitem-text') || {}).textContent?.trim() || '', imgCls: img.className, imgBox: R(img), natural: [img.naturalWidth, img.naturalHeight],
      where: pop ? 'popup' : bar ? ('menubar ' + [...document.querySelectorAll('.z-menubar')].indexOf(bar) + (bar.classList.contains('z-menubar-vertical') ? ' vertical' : ' horizontal')) : 'other', visible: vis,
      imgCss: (() => { const c = getComputedStyle(img); return { w: c.width, h: c.height, ml: c.marginLeft, mr: c.marginRight, display: c.display, va: c.verticalAlign }; })() });
  }
  return out;
})`;

// rows of a menubar's own list (vertical menubar: rows stack like a popup)
const barRowsSrc = `(function (idx) {
  const R = ${R};
  const bar = document.querySelectorAll('.z-menubar')[idx]; const ul = bar.querySelector(':scope > ul');
  const rows = [...ul.children].map(li => {
    const cnt = li.querySelector(':scope > a'); if (!cnt) return { kind: 'separator', li: R(li) };
    const img = cnt.querySelector('img'); const icons = [...cnt.querySelectorAll('i')].filter(i => !i.classList.contains('z-menu-icon'));
    const icon = img && getComputedStyle(img).display !== 'none' ? img : (icons[0] || null);
    const text = cnt.querySelector('.z-menu-text, .z-menuitem-text'); const rng = document.createRange(); const tn = text && [...text.childNodes].find(n => n.nodeType === 3); if (tn) rng.selectNodeContents(tn); else if (text) rng.selectNodeContents(text);
    const arrow = cnt.querySelector('.z-menu-icon');
    return { kind: li.classList.contains('z-menu') ? 'menu' : 'menuitem', disabled: /disabled/.test(li.className), label: text ? text.textContent.trim() : '', li: R(li), cnt: R(cnt), icon: icon ? { tag: icon.tagName, cls: icon.className, rect: R(icon) } : null, iconKind: icon ? (icon.tagName === 'IMG' ? 'image' : 'iconSclass') : 'none', text: text ? R(text) : null, textRange: text ? R(rng) : null, arrow: arrow ? R(arrow) : null, paddingLeft: getComputedStyle(cnt).paddingLeft };
  });
  return { bar: R(bar), cls: bar.className, ul: R(ul), rows };
})`;

async function measureBar(page, idx, file) {
  const g = await page.evaluate(({ idx, src }) => eval(src)(idx), { idx, src: barRowsSrc });
  const B = g.bar;
  const S = await L.shot(page, file, { x: B.l - 12, y: B.t - 12, width: B.w + 24, height: B.h + 24 });
  for (const row of g.rows) {
    if (row.kind === 'separator') continue;
    const y0 = row.cnt.t + 2, y1 = row.cnt.b - 3;
    const base = L.median(S.rect(row.cnt.l + 2, row.cnt.l + 6, y0, y1).map(p => p.c));
    const text = row.text ? M.inkBox(S, row.text.l - 2, row.text.r + 2, y0, y1, base, 8) : null;
    const iconR = row.icon ? row.icon.rect : null;
    const icon = iconR ? M.inkBox(S, iconR.l - 1, iconR.r + 1, y0, y1, base, 8) : null;
    const arrow = row.arrow ? M.inkBox(S, row.arrow.l - 4, row.cnt.r - 1, y0, y1, base, 8) : null;
    row.px = { base, text, icon, arrow, textFromBar: text ? +(text.l - B.l).toFixed(2) : null, iconCx: icon ? +((icon.l + icon.r) / 2 - B.l).toFixed(2) : null, iconCy: icon ? +((icon.t + icon.b) / 2 - (row.cnt.t + row.cnt.b) / 2).toFixed(2) : null };
  }
  return g;
}
function table(g, key) {
  for (const r of g.rows) { if (r.kind === 'separator') { console.log('  ---- separator'); continue; } const p = r.px; console.log(`  ${r.kind.padEnd(8)} ${(r.label || '(no label)').padEnd(14)} ${r.iconKind.padEnd(10)} ${r.disabled ? 'disabled' : '        '} padL ${r.paddingLeft} h ${r.cnt.h} iconBox ${r.icon ? `${r.icon.rect.l}-${r.icon.rect.r} ${r.icon.rect.w}x${r.icon.rect.h}` : '-'} | textInk ${key}+${p.textFromBar} iconInk ${p.icon ? `${p.icon.l}-${p.icon.r} w${p.icon.w} h${p.icon.h} cx ${key}+${p.iconCx} cyOff ${p.iconCy}` : '-'} arrow ${p.arrow ? `${p.arrow.l}-${p.arrow.r}` : '-'}`); }
}

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, chromium: browser.version(), date: new Date().toISOString() } };
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    out.inventory = await page.evaluate(({ src }) => eval(src)(), { src: inventorySrc });
    console.log('menubar.zul rows with <img>:'); for (const i of out.inventory) console.log(`  ${i.kind.padEnd(8)} ${(i.label || '(no label)').padEnd(22)} ${i.where.padEnd(22)} visible ${i.visible} img ${i.imgBox ? i.imgBox.w + 'x' + i.imgBox.h : '-'} natural ${i.natural} css ${JSON.stringify(i.imgCss)}`);
    // vertical menubar (orient=vertical, 200px): z-menu rows carrying images, stacked like a popup
    const vIdx = await page.evaluate(() => [...document.querySelectorAll('.z-menubar')].findIndex(b => b.classList.contains('z-menubar-vertical')));
    await page.evaluate((i) => document.querySelectorAll('.z-menubar')[i].scrollIntoView({ block: 'center' }), vIdx); await page.waitForTimeout(300);
    const gv = await measureBar(page, vIdx, 'p4n-vertical-menubar.png');
    out.verticalBar = gv; console.log(`vertical menubar [${vIdx}] ${JSON.stringify(gv.bar)}`); table(gv, 'bar');
    // open the vertical bar's Help popup (z-menu with image, nested About z-menu inside)
    const help = gv.rows.find(r => r.label === 'Help' && !r.disabled);
    if (help) {
      await page.mouse.click(help.cnt.l + help.cnt.w / 2, help.cnt.t + help.cnt.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
      const vis = await M.visibleMenupopups(page); console.log('visible popups after vertical Help click', JSON.stringify(vis));
      if (vis.length) { const { g } = await M.measurePopup(page, vis[0].i, 'p4n-vertical-help-popup.png'); out.verticalHelp = g; console.log('vertical Help popup rows:'); for (const r of g.rows) if (r.kind !== 'separator') console.log(`  ${r.kind.padEnd(8)} ${r.label.padEnd(16)} ${r.iconKind.padEnd(10)} textInk popup+${r.px.textFromPopup} icon ${r.px.icon ? `cx ${((r.px.icon.l + r.px.icon.r) / 2 - g.popup.l).toFixed(2)}` : '-'} arrow ${r.px.arrow ? `${r.px.arrow.l}-${r.px.arrow.r}` : '-'} h ${r.cnt.h}`); }
    }
    await ctx.close();
  }
  // menubar2 (horizontal, image menus: Project / Help; the Help popup holds About (nested z-menu, no image)) + the Project popup there (image-only rows)
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const idx = await page.evaluate(() => [...document.querySelectorAll('.z-menubar')].findIndex(b => b.id && zk.Widget.$(b) && zk.Widget.$(b).id === 'menubar2'));
    console.log('menubar2 index', idx);
    if (idx >= 0) {
      const c = await M.clickTop(page, idx, 1); console.log('clicked', c.text);
      const vis = await M.visibleMenupopups(page); console.log('visible popups', JSON.stringify(vis));
      if (vis.length) { const { g } = await M.measurePopup(page, vis[0].i, 'p4n-menubar2-project-popup.png'); out.menubar2Project = g; console.log('menubar2 Project popup (image-only rows):'); for (const r of g.rows) if (r.kind !== 'separator') console.log(`  ${r.kind.padEnd(8)} ${r.label.padEnd(16)} ${r.iconKind.padEnd(10)} textInk popup+${r.px.textFromPopup} icon ${r.px.icon ? `cx ${((r.px.icon.l + r.px.icon.r) / 2 - g.popup.l).toFixed(2)} ${r.px.icon.w}x${r.px.icon.h}` : '-'} h ${r.cnt.h}`); }
    }
    await ctx.close();
  }
  // colorbox: open the popup, look for menu classes and images
  {
    const { ctx, page } = await L.open(browser, 'web/colorbox.zul');
    const cb = await page.evaluate(() => { const e = document.querySelector('.z-colorbox'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: e.className }; });
    await page.mouse.click(cb.x, cb.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(500);
    out.colorbox = await page.evaluate(() => {
      const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)); };
      const pop = [...document.querySelectorAll('.z-colorbox-popup, .z-colorpalette, .z-colorbox-palette, [class*="z-colorbox-"]')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0);
      const menuish = [...document.querySelectorAll('[class*="z-menu"]')].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0).map(e => ({ cls: e.className, rect: R(e), tag: e.tagName }));
      const imgs = [...document.querySelectorAll('img')].filter(e => e.getBoundingClientRect().width > 0).map(e => ({ cls: e.className, rect: R(e), closest: e.closest('[class*="z-"]')?.className }));
      const swatches = [...document.querySelectorAll('[class*="z-colorpalette"], [class*="z-colorbox-"]')].filter(e => getComputedStyle(e).display !== 'none').slice(0, 12).map(e => ({ cls: e.className, rect: R(e) }));
      return { visiblePopupLike: pop.slice(0, 6).map(e => ({ cls: e.className, rect: R(e) })), menuish, imgs: imgs.slice(0, 10), swatches };
    });
    console.log('colorbox after click: menu-class elements', out.colorbox.menuish.length, JSON.stringify(out.colorbox.menuish.slice(0, 5)), '\n  imgs', JSON.stringify(out.colorbox.imgs), '\n  popup-like', JSON.stringify(out.colorbox.visiblePopupLike));
    await L.shot(page, 'p4n-colorbox-open.png', { x: 0, y: 0, width: 1280, height: 900 });
    await ctx.close();
  }
  L.save('final-p4-nested.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
