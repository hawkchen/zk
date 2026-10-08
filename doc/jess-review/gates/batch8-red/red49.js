// Batch 8 RED, #49 reserved checkmark column in the View popup (checkmark="true", none checked): numbers only.
// Compares with the File popup (iconSclass rows), the Help popup (plain text rows), and a checked item (Sort by Name after autocheck).
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const rowSum = r => r.kind === 'separator' ? null : ({ label: r.label, cls: r.liCls, iconKind: r.iconKind, iconEl: r.icon ? [r.icon.rect.l, r.icon.rect.t, r.icon.rect.w, r.icon.rect.h] : null, iconVisibility: r.icon ? r.icon.vis : null, hiddenImg: r.hiddenImg, iconInk: r.px.icon ? [+r.px.icon.l.toFixed(2), +r.px.icon.t.toFixed(2), +r.px.icon.w.toFixed(2), +r.px.icon.h.toFixed(2), r.px.icon.darkest] : null, textSpanL: r.text.l, textInkL: r.px.textInkLeft, textFromInner: r.px.textFromInner, textFromPopup: r.px.textFromPopup, rowH: r.cnt.h });
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  // View popup, none checked
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 1, 1);
    const vis = await M.visibleMenupopups(page); const V = await M.measurePopup(page, vis[0].i, 'red49-view-unchecked.png'); out.view_unchecked = { popup: V.g.popup, content: V.g.content, borderLeft: V.g.borderLeft, paddingLeft: V.g.paddingLeft, rows: V.g.rows.map(rowSum) };
    // blank column check: any ink between content left and text span left in row 0?
    const r0 = V.g.rows[0]; out.view_unchecked.blankLeftOfText = r0.px.icon;
    // reserved column width = text span left - content left - left padding of the content (16px per DOM: icon element at content+16)
    out.view_unchecked.checkEl = r0.icon ? r0.icon.rect : null;
    // zoomed strip
    await L.shot(page, 'red49-view-unchecked-zoom.png', { x: V.g.popup.l - 4, y: V.g.popup.t - 4, width: 80, height: V.g.popup.h + 8 });
    // autocheck "Sort by Name": click it (popup closes), reopen View
    await page.mouse.click(r0.cnt.l + r0.cnt.w / 2, r0.cnt.t + r0.cnt.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.afterClickPopups = await M.visibleMenupopups(page);
    await M.clickTop(page, 1, 1);
    const vis2 = await M.visibleMenupopups(page); const V2 = await M.measurePopup(page, vis2[0].i, 'red49-view-checked.png'); out.view_checked = { popup: V2.g.popup, content: V2.g.content, rows: V2.g.rows.map(rowSum) };
    await L.shot(page, 'red49-view-checked-zoom.png', { x: V2.g.popup.l - 4, y: V2.g.popup.t - 4, width: 80, height: V2.g.popup.h + 8 });
    await ctx.close(); }
  // File popup (iconSclass rows) and vertical Help popup (plain rows) for comparison
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 1, 0);
    const vis = await M.visibleMenupopups(page); const F = await M.measurePopup(page, vis[0].i, 'red49-file.png'); out.file = { popup: F.g.popup, content: F.g.content, rows: F.g.rows.map(rowSum) };
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 2, 1);
    const vis = await M.visibleMenupopups(page); const H = await M.measurePopup(page, vis[0].i, 'red49-help-plain.png'); out.help_plain = { popup: H.g.popup, content: H.g.content, rows: H.g.rows.map(rowSum) };
    await ctx.close(); }
  // Scrollable menubar: top-level menuitem "item 2" with checkmark="true" (horizontal, for the record only)
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    out.scrollable_top = await page.evaluate(() => { const m = document.querySelectorAll('.z-menubar')[4]; return [...m.querySelectorAll('li')].map(li => { const r = li.getBoundingClientRect(); const ic = li.querySelector('i'); const t = li.querySelector('.z-menuitem-text'); return { cls: li.className, text: li.textContent.trim(), rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), icon: ic ? { cls: ic.className, vis: getComputedStyle(ic).visibility, rect: (q => [q.left, q.top, q.width, q.height].map(v => +v.toFixed(2)))(ic.getBoundingClientRect()) } : null, textL: t ? +t.getBoundingClientRect().left.toFixed(2) : null }; }); });
    await ctx.close(); }
  await browser.close();
  L.save('red49.json', out);
  for (const k of ['view_unchecked', 'view_checked', 'file', 'help_plain']) { console.log('=== ' + k, JSON.stringify(out[k].popup), 'inner', JSON.stringify(out[k].content)); for (const r of out[k].rows) if (r) console.log(JSON.stringify(r)); }
  console.log('=== blankLeftOfText(unchecked row0)', JSON.stringify(out.view_unchecked.blankLeftOfText), 'checkEl', JSON.stringify(out.view_unchecked.checkEl), 'borderLeft', out.view_unchecked.borderLeft, 'paddingLeft', out.view_unchecked.paddingLeft);
  console.log('=== afterClickPopups', JSON.stringify(out.afterClickPopups)); console.log('=== scrollable_top', JSON.stringify(out.scrollable_top));
})();
