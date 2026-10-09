// Batch 14 RED — P4: menubar.zul popups mixing `image` (16px) and iconSclass (18px) rows: text ink left edge and icon ink centre per row.
// Also re-measures the #48 mix (iconSclass rows + nested z-menu, "Horizontal with Icons" File popup) and the standalone menupopup.
const L = require('./lib.js');
const M = require('./m14.js');

function table(g) {
  for (const r of g.rows) {
    if (r.kind === 'separator') { console.log(`  ---- separator ${JSON.stringify(r.li)}`); continue; }
    const p = r.px; const ic = p.icon;
    console.log(`  ${r.kind.padEnd(8)} ${r.label.padEnd(14)} ${r.iconKind.padEnd(10)} ${r.disabled ? 'disabled' : '        '} cnt.l ${r.cnt.l} h ${r.cnt.h} iconBox ${r.icon ? `${r.icon.rect.l}-${r.icon.rect.r} ${r.icon.rect.w}x${r.icon.rect.h}` : '-'} text.l ${r.text.l} | textInk.l ${p.textInkLeft} (popup+${p.textFromPopup}) iconInk ${ic ? `${ic.l}-${ic.r} w${ic.w} h${ic.h} cx ${((ic.l + ic.r) / 2).toFixed(2)} cy ${((ic.t + ic.b) / 2).toFixed(2)} darkest ${ic.darkest}` : '-'} rowCentreY ${((r.cnt.t + r.cnt.b) / 2).toFixed(2)} arrow ${p.arrow ? `${p.arrow.l}-${p.arrow.r}` : '-'}`);
  }
}
function spread(rows, f) { const v = rows.filter(r => r.kind !== 'separator' && f(r) != null).map(f); return v.length ? +(Math.max(...v) - Math.min(...v)).toFixed(2) : null; }
function summarize(name, g) {
  const withIcon = g.rows.filter(r => r.kind !== 'separator' && r.px.icon);
  const s = { textInkSpread_iconRows: spread(withIcon, r => r.px.textInkLeft), iconCentreSpread: spread(withIcon, r => (r.px.icon.l + r.px.icon.r) / 2), iconCentreYSpread: spread(withIcon, r => (r.px.icon.t + r.px.icon.b) / 2 - (r.cnt.t + r.cnt.b) / 2),
    textInkSpread_allRows: spread(g.rows, r => r.px.textInkLeft), rowHeights: [...new Set(g.rows.filter(r => r.kind !== 'separator').map(r => r.cnt.h))], popup: g.popup };
  console.log(`${name}: text ink left spread (icon rows) ${s.textInkSpread_iconRows}px; icon centre x spread ${s.iconCentreSpread}px; icon centre y offset spread ${s.iconCentreYSpread}px; text spread all rows ${s.textInkSpread_allRows}px; row heights ${s.rowHeights}`);
  return s;
}
async function hoverRow(page, g, label) { const r = g.rows.find(r => r.label === label); await page.mouse.move(r.cnt.l + r.cnt.w / 2, r.cnt.t + r.cnt.h / 2); await L.settle(page); await page.waitForTimeout(500); }

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, chromium: browser.version(), date: new Date().toISOString() } };
  // ── menubar1 "Project" popup: image 16px rows + iconSclass 18px rows ──
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const c = await M.clickTop(page, 0, 0); console.log('clicked', c.text, c.cls);
    const vis = await M.visibleMenupopups(page); console.log('visible popups', JSON.stringify(vis));
    const { g } = await M.measurePopup(page, vis[0].i, 'p4-project-popup.png');
    out.project = g; console.log('Project popup', JSON.stringify({ popup: g.popup, content: g.content, paddingLeft: g.paddingLeft, bg: g.bg })); table(g); out.projectSummary = summarize('Project', g);
    // image rows: natural size of the img + rendered box
    out.projectImages = await page.evaluate((idx) => [...document.querySelectorAll('.z-menupopup')[idx].querySelectorAll('img')].map(i => ({ src: i.getAttribute('src').replace(/.*\//, ''), natural: [i.naturalWidth, i.naturalHeight], box: [i.getBoundingClientRect().width, i.getBoundingClientRect().height], cls: i.className, display: getComputedStyle(i).display })), vis[0].i);
    console.log('images', JSON.stringify(out.projectImages));
    // hover row baseline (state layer) on "Open"
    await hoverRow(page, g, 'Open');
    const { g: gh } = await M.measurePopup(page, vis[0].i, 'p4-project-popup-hover-open.png');
    out.projectHover = gh.rows.find(r => r.label === 'Open'); console.log('hover Open base', out.projectHover.px.base, 'dE vs popup', out.projectHover.px.dE_base_popup);
    await ctx.close();
  }
  // ── menubar (index 1) "File" popup: iconSclass rows + nested z-menu "Open" (#48 mix) ──
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const c = await M.clickTop(page, 1, 0); console.log('clicked', c.text, c.cls);
    const vis = await M.visibleMenupopups(page); console.log('visible popups', JSON.stringify(vis));
    const { g } = await M.measurePopup(page, vis[0].i, 'p4-file-popup.png');
    out.file = g; console.log('File popup', JSON.stringify({ popup: g.popup, content: g.content, paddingLeft: g.paddingLeft })); table(g); out.fileSummary = summarize('File (#48 mix)', g);
    // open nested "Open" submenu by hover
    await hoverRow(page, g, 'Open');
    const vis2 = await M.visibleMenupopups(page); console.log('visible popups after hover Open', JSON.stringify(vis2));
    const sub = vis2.find(v => v.i !== vis[0].i);
    if (sub) { const { g: gs } = await M.measurePopup(page, sub.i, 'p4-file-open-submenu.png'); out.fileSub = gs; console.log('File > Open submenu'); table(gs); out.fileSubSummary = summarize('File>Open submenu', gs); }
    await L.shot(page, 'p4-file-page.png', { x: 0, y: 0, width: 700, height: 500 });
    await ctx.close();
  }
  // ── standalone menupopup (images only) ──
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const b = await page.evaluate(() => { const b = [...document.querySelectorAll('.z-button')].find(b => b.textContent.trim() === 'Open menupopup'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.click(b.x, b.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(400);
    const vis = await M.visibleMenupopups(page); console.log('visible popups', JSON.stringify(vis));
    if (vis.length) { const { g } = await M.measurePopup(page, vis[0].i, 'p4-standalone-popup.png'); out.standalone = g; console.log('standalone menupopup'); table(g); out.standaloneSummary = summarize('standalone (images only)', g); }
    await ctx.close();
  }
  // ── horizontal menubar top rows (protection baseline): text/icon ink of menubar1 items ──
  {
    const { ctx, page } = await L.open(browser, 'web/menubar.zul');
    const top = await page.evaluate(() => { const m = document.querySelectorAll('.z-menubar')[0]; const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
      return { bar: R(m), items: [...m.querySelectorAll(':scope > ul > li')].map(li => ({ cls: li.className, label: li.textContent.trim(), li: R(li), cnt: li.querySelector(':scope > a') ? R(li.querySelector(':scope > a')) : null, img: li.querySelector('img') ? R(li.querySelector('img')) : null, text: li.querySelector('.z-menu-text, .z-menuitem-text') ? R(li.querySelector('.z-menu-text, .z-menuitem-text')) : null })) }; });
    const S = await L.shot(page, 'p4-menubar1-top.png', { x: top.bar.l - 8, y: top.bar.t - 8, width: top.bar.w + 16, height: top.bar.h + 16 });
    const base = L.median(S.rect(top.bar.l + 2, top.bar.l + 6, top.bar.t + 4, top.bar.b - 5).map(p => p.c));
    for (const it of top.items) { if (!it.cnt) continue; it.px = { text: it.text ? M.inkBox(S, it.text.l - 2, it.text.r + 2, it.cnt.t + 2, it.cnt.b - 3, base, 8) : null, img: it.img ? M.inkBox(S, it.img.l - 1, it.img.r + 1, it.cnt.t + 2, it.cnt.b - 3, base, 8) : null }; }
    out.menubarTop = { base, ...top };
    console.log('menubar1 top row:', top.items.map(it => `${it.label}: cnt ${it.cnt ? it.cnt.l + '-' + it.cnt.r + ' h' + it.cnt.h : '-'} textInk.l ${it.px && it.px.text ? it.px.text.l : '-'} imgInk ${it.px && it.px.img ? it.px.img.l + '-' + it.px.img.r : '-'}`).join(' | '));
    await ctx.close();
  }
  L.save('red-p4.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
