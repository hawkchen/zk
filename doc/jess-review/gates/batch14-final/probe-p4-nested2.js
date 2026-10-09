// Batch 14 FINAL — P4 side effects, part 2:
//  (a) a nested z-menu WITH an image inside a popup: menubar.zul has none, so one is appended at runtime through the client widget API
//      (zul.menu.Menu{label,image} + child Menupopup) into menubar1's Project popup; nothing on disk is touched.
//  (b) menubar2 (autodrop) Project popup — a second popup made of image rows only.
//  (c) colorbox.zul: what the menubar on that page is, and whether any .z-menu-image / .z-menuitem-image exists there.
const L = require('./lib.js');
const M = require('./m14.js');

function rows(g) { for (const r of g.rows) { if (r.kind === 'separator') { console.log('  ---- separator'); continue; } const p = r.px; console.log(`  ${r.kind.padEnd(8)} ${r.label.padEnd(14)} ${r.iconKind.padEnd(10)} ${r.disabled ? 'disabled' : '        '} h ${r.cnt.h} iconBox ${r.icon ? `${r.icon.rect.l}-${r.icon.rect.r} ${r.icon.rect.w}x${r.icon.rect.h} (${r.icon.cls})` : '-'} | textInk popup+${p.textFromPopup} iconInk ${p.icon ? `${p.icon.l}-${p.icon.r} w${p.icon.w} h${p.icon.h} cx popup+${((p.icon.l + p.icon.r) / 2 - g.popup.l).toFixed(2)} cyOff ${((p.icon.t + p.icon.b) / 2 - (r.cnt.t + r.cnt.b) / 2).toFixed(2)}` : '-'} arrow ${p.arrow ? `${p.arrow.l}-${p.arrow.r}` : '-'}`); } }
function spread(g, f) { const v = g.rows.filter(r => r.kind !== 'separator' && r.px.icon).map(f); return +(Math.max(...v) - Math.min(...v)).toFixed(2); }

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, chromium: browser.version(), date: new Date().toISOString() } };
  // (a) nested z-menu with image, injected at runtime
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const info = await page.evaluate(() => {
      const bar = zk.Widget.$(document.querySelectorAll('.z-menubar')[0]);
      const project = bar.firstChild; // menu "Project"
      const pop = project.menupopup;
      const imgSrc = project.getImage();
      const nested = new zul.menu.Menu({ label: 'Nested img', image: imgSrc });
      const sub = new zul.menu.Menupopup();
      sub.appendChild(new zul.menu.Menuitem({ label: 'Child A' }));
      nested.appendChild(sub);
      pop.appendChild(nested);
      const nested2 = new zul.menu.Menu({ label: 'Nested icon', iconSclass: 'z-icon-folder-open' });
      const sub2 = new zul.menu.Menupopup(); sub2.appendChild(new zul.menu.Menuitem({ label: 'Child B' })); nested2.appendChild(sub2);
      pop.appendChild(nested2);
      return { imgSrc, n: pop.nChildren };
    });
    console.log('injected nested menus into menubar1 Project popup', JSON.stringify(info));
    const c = await M.clickTop(page, 0, 0); console.log('clicked', c.text);
    const vis = await M.visibleMenupopups(page); console.log('visible popups', JSON.stringify(vis));
    const { g } = await M.measurePopup(page, vis[0].i, 'p4n-project-with-nested-menu.png');
    out.projectNested = g; console.log('Project popup + injected nested z-menu rows:'); rows(g);
    console.log(`  spread: text ink (icon rows) ${spread(g, r => r.px.textInkLeft)}px, icon centre x ${spread(g, r => (r.px.icon.l + r.px.icon.r) / 2)}px, row heights ${[...new Set(g.rows.filter(r => r.kind !== 'separator').map(r => r.cnt.h))]}`);
    out.projectNestedImgs = await page.evaluate((idx) => [...document.querySelectorAll('.z-menupopup')[idx].querySelectorAll('img')].map(i => { const c = getComputedStyle(i); return { cls: i.className, box: [i.getBoundingClientRect().width, i.getBoundingClientRect().height], ml: c.marginLeft, mr: c.marginRight, natural: [i.naturalWidth, i.naturalHeight] }; }), vis[0].i);
    console.log('  imgs', JSON.stringify(out.projectNestedImgs));
    await ctx.close();
  }
  // (b) menubar2 autodrop Project popup (image rows only)
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const idx = await page.evaluate(() => [...document.querySelectorAll('.z-menubar')].findIndex(b => zk.Widget.$(b) && zk.Widget.$(b).id === 'menubar2'));
    const r = await page.evaluate((idx) => { const li = document.querySelectorAll('.z-menubar')[idx].querySelector(':scope > ul > li'); li.scrollIntoView({ block: 'center' }); const b = li.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, text: li.textContent.trim() }; }, idx);
    await page.mouse.move(r.x, r.y); await page.waitForTimeout(600); await L.settle(page);
    let vis = await M.visibleMenupopups(page);
    if (!vis.length) { await page.mouse.click(r.x, r.y); await L.settle(page); await page.waitForTimeout(400); vis = await M.visibleMenupopups(page); }
    console.log('menubar2', idx, r.text, 'visible popups', JSON.stringify(vis));
    if (vis.length) { const { g } = await M.measurePopup(page, vis[0].i, 'p4n-menubar2-project-popup.png'); out.menubar2Project = g; console.log('menubar2 Project popup (image rows only):'); rows(g); console.log(`  spread: text ink ${spread(g, r => r.px.textInkLeft)}px, icon centre x ${spread(g, r => (r.px.icon.l + r.px.icon.r) / 2)}px`); }
    await ctx.close();
  }
  // (c) colorbox.zul
  {
    const { ctx, page } = await L.open(browser, 'web/colorbox.zul');
    out.colorbox = await page.evaluate(() => {
      const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top + scrollY, r.width, r.height].map(v => +v.toFixed(2)); };
      const bars = [...document.querySelectorAll('.z-menubar')].map(b => ({ rect: R(b), text: b.textContent.replace(/\s+/g, ' ').trim().slice(0, 120), heading: (b.closest('.z-mb-6') || b.parentElement).querySelector('.z-label')?.textContent }));
      const menuImgs = [...document.querySelectorAll('.z-menu-image, .z-menuitem-image')].map(i => ({ cls: i.className, rect: R(i), display: getComputedStyle(i).display, inPopup: !!i.closest('.z-menupopup'), label: i.closest('li')?.textContent.trim().slice(0, 30) }));
      const cbInMenu = [...document.querySelectorAll('.z-menupopup .z-colorbox, .z-menubar .z-colorbox')].map(e => ({ cls: e.className, rect: R(e), chain: e.parentElement.className }));
      return { bars, menuImgs, cbInMenu };
    });
    console.log('colorbox.zul menubars', JSON.stringify(out.colorbox.bars), '\n  menu images', JSON.stringify(out.colorbox.menuImgs), '\n  colorbox inside menus', JSON.stringify(out.colorbox.cbInMenu));
    await ctx.close();
  }
  L.save('final-p4-nested2.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
