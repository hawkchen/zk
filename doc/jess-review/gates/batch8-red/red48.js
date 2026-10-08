// Batch 8 RED, #48 menubar popup alignment. Per-row text ink left / icon ink left (pixels) for several popup mixes,
// plus protections (row heights, hover state layer, submenu arrow, icon sizes, disabled opacity, top-level positions).
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const summary = g => g.rows.map(r => r.kind === 'separator' ? { kind: 'separator', h: r.li.h, t: r.li.t, color: r.px.color } : ({ label: r.label, kind: r.kind + (r.disabled ? '/disabled' : '') + (r.checkable ? '/checkable' : ''), iconKind: r.iconKind, rowT: r.cnt.t, rowH: r.cnt.h, iconEl: r.icon ? [r.icon.rect.l, r.icon.rect.t, r.icon.rect.w, r.icon.rect.h] : null, iconInk: r.px.icon ? [+r.px.icon.l.toFixed(2), +r.px.icon.t.toFixed(2), +r.px.icon.w.toFixed(2), +r.px.icon.h.toFixed(2)] : null, textSpanL: r.text.l, textRangeL: r.textRange.l, textInkL: r.px.textInkLeft, iconInkL: r.px.iconInkLeft, textFromInner: r.px.textFromInner, iconFromInner: r.px.iconFromInner, arrowEl: r.arrow ? [r.arrow.l, r.arrow.t, r.arrow.w, r.arrow.h] : null, arrowInk: r.px.arrow ? [+r.px.arrow.l.toFixed(2), +r.px.arrow.t.toFixed(2), +r.px.arrow.w.toFixed(2), +r.px.arrow.h.toFixed(2)] : null, opacity: r.opacity, base: r.px.base }));
async function hoverRow(page, g, label, file) {
  const row = g.rows.find(r => r.label === label); await page.mouse.move(row.cnt.l + row.cnt.w * 0.75, row.cnt.t + row.cnt.h / 2); await page.waitForTimeout(300);
  const P = g.popup; const S = await L.shot(page, file, { x: P.l - 12, y: P.t - 12, width: P.w + 24, height: P.h + 24 });
  const popupBg = L.median(S.rect(P.l + 3, P.l + 6, P.t + 6, P.b - 7).map(p => p.c));
  const y0 = row.cnt.t + 4, y1 = row.cnt.b - 5; const layer = L.median(S.rect(row.cnt.r - 24, row.cnt.r - 4, y0, y1).map(p => p.c));
  const h = M.hExtent(S, P.l, P.r - 1, y0, y1, popupBg, 2); const v = M.vExtent(S, row.cnt.r - 24, row.cnt.r - 4, P.t + 1, P.b - 2, popupBg, 2);
  return { label, cnt: row.cnt, layer, dE: +L.dE(layer, popupBg).toFixed(2), hExtent: h.found ? { l: h.l, r: h.r } : h, vExtent: v.found ? { t: v.t, b: v.b } : v, popupInner: { l: g.content.l, r: g.content.r }, popup: { l: P.l, r: P.r } };
}
(async () => {
  const browser = await launch(); const out = { chromium: browser.version(), popups: {} };
  // A: menubar[1] File (Jess's mix: iconSclass items + nested z-menu "Open"), then hover Open -> B submenu
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    out.tops = await page.evaluate(() => [...document.querySelectorAll('.z-menubar')].slice(0, 2).map((m, i) => ({ i, items: [...m.querySelectorAll(':scope > ul > li')].map(li => { const r = li.getBoundingClientRect(); const t = li.querySelector('.z-menu-text, .z-menuitem-text'); const tr = t && t.getBoundingClientRect(); return { cls: li.className, text: li.textContent.trim(), rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), textL: tr ? +tr.left.toFixed(2) : null }; }) })));
    await M.clickTop(page, 1, 0);
    const vis = await M.visibleMenupopups(page); const A = await M.measurePopup(page, vis[0].i, 'red48-A-file.png'); out.popups.A_file = A.g;
    out.hover = { A_new: await hoverRow(page, A.g, 'New', 'red48-A-file-hover-new.png') };
    // hover the nested menu row "Open" -> submenu
    const open = A.g.rows.find(r => r.label === 'Open'); await page.mouse.move(open.cnt.l + open.cnt.w / 2, open.cnt.t + open.cnt.h / 2); await page.waitForTimeout(700); await L.settle(page);
    const vis2 = await M.visibleMenupopups(page); const sub = vis2.find(p => p.text.indexOf('Project') >= 0);
    out.hover.A_open = await hoverRow(page, A.g, 'Open', 'red48-A-file-hover-open.png');
    if (sub) { const B = await M.measurePopup(page, sub.i, 'red48-B-open-submenu.png'); out.popups.B_open_submenu = B.g; }
    await page.screenshot({ path: L.OUT + '/red48-A-page.png' });
    await ctx.close(); }
  // C: menubar[0] Project (image rows + iconSclass rows + disabled + separator)
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 0, 0);
    const vis = await M.visibleMenupopups(page); const C = await M.measurePopup(page, vis[0].i, 'red48-C-project.png'); out.popups.C_project = C.g;
    out.hover.C_new = await hoverRow(page, C.g, 'New', 'red48-C-project-hover-new.png');
    out.hover.C_restart = await hoverRow(page, C.g, 'Restart', 'red48-C-project-hover-restart.png');
    await ctx.close(); }
  // D: vertical menubar[2] Help (plain text + nested menu About), hover About -> E submenu (plain)
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 2, 1);
    const vis = await M.visibleMenupopups(page); const D = await M.measurePopup(page, vis[0].i, 'red48-D-help.png'); out.popups.D_help = D.g;
    const about = D.g.rows.find(r => r.label === 'About'); await page.mouse.move(about.cnt.l + about.cnt.w / 2, about.cnt.t + about.cnt.h / 2); await page.waitForTimeout(700); await L.settle(page);
    const vis2 = await M.visibleMenupopups(page); const sub = vis2.find(p => p.text.indexOf('About ZK') >= 0);
    if (sub) { const E = await M.measurePopup(page, sub.i, 'red48-E-about-submenu.png'); out.popups.E_about_submenu = E.g; }
    await ctx.close(); }
  // F: standalone menupopup1 (image rows only) via the button
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    const b = await page.evaluate(() => { const btn = [...document.querySelectorAll('.z-button')].find(b => b.textContent.indexOf('Open menupopup') >= 0); const r = btn.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.click(b.x, b.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const vis = await M.visibleMenupopups(page); if (vis.length) { const F = await M.measurePopup(page, vis[0].i, 'red48-F-standalone.png'); out.popups.F_standalone = F.g; }
    await ctx.close(); }
  // G: Auto Drop menubar[3] Help -> About (nested menu without icons inside an image-mix menubar)
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await page.evaluate(() => window.scrollTo(0, 600)); await page.waitForTimeout(300);
    await M.clickTop(page, 3, 1);
    const vis = await M.visibleMenupopups(page); if (vis.length) { const G = await M.measurePopup(page, vis[0].i, 'red48-G-autodrop-help.png'); out.popups.G_autodrop_help = G.g; }
    await ctx.close(); }
  await browser.close();
  out.summary = {}; for (const k of Object.keys(out.popups)) out.summary[k] = { popup: out.popups[k].popup, content: out.popups[k].content, popupBg: out.popups[k].popupBg, rows: summary(out.popups[k]) };
  L.save('red48.json', out);
  for (const k of Object.keys(out.summary)) { console.log('=== ' + k, JSON.stringify(out.summary[k].popup), 'inner', JSON.stringify(out.summary[k].content), 'bg', JSON.stringify(out.summary[k].popupBg)); for (const r of out.summary[k].rows) console.log(JSON.stringify(r)); }
  console.log('=== hover', JSON.stringify(out.hover)); console.log('=== tops', JSON.stringify(out.tops));
})();
