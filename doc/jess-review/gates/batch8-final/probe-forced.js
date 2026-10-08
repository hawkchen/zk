// Batch 8 FINAL, forced-colors protection: under page.emulateMedia({ forcedColors: 'active' }) the File popup (#48) and the expanded navbar (#51)
// must still show text ink on every row, and the alignment / indentation measured in normal mode must hold (ink positions from pixels).
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
async function navPoint(page, nbIdx, label, inPopup) { return page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; const li = [...root.querySelectorAll('li')].find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === label; }); if (!li) return { err: 'no ' + label }; const a = li.querySelector(':scope > a'); const b = a.getBoundingClientRect(); const rr = root.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, cnt: { l: b.left, t: b.top, w: b.width, h: b.height }, root: { l: rr.left, t: rr.top, r: rr.right, b: rr.bottom, w: rr.width, h: rr.height } }; }, { nbIdx, label, inPopup }); }
const rowsSrc = `(function (root) {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; };
  const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  return { root: R(root), rows: [...root.querySelectorAll('li')].filter(vis).map(li => { let lvl = 1, p = li.parentElement; while (p && p !== root) { if (p.classList.contains('z-nav')) lvl++; p = p.parentElement; }
    const kind = li.classList.contains('z-nav') ? 'nav' : li.classList.contains('z-navitem') ? 'navitem' : 'separator'; if (kind === 'separator') return { kind, level: lvl, li: R(li) };
    const cnt = li.querySelector(':scope > a'); const icon = [...cnt.querySelectorAll('i, img')].find(vis); const text = cnt.querySelector('.z-nav-text, .z-navitem-text'); const w = zk.Widget.$(li);
    return { kind, level: lvl, label: w && w.getLabel ? w.getLabel() : '', li: R(li), cnt: R(cnt), icon: icon ? R(icon) : null, text: text && vis(text) ? R(text) : null }; }) };
})`;
async function rows(page, rootSel, idx) { return page.evaluate(({ rootSel, idx, src }) => { const roots = [...document.querySelectorAll(rootSel)].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0); return eval(src)(roots[idx]); }, { rootSel, idx, src: rowsSrc }); }
function inkRows(S, g) { return g.rows.filter(r => r.kind !== 'separator').map(r => { const y0 = r.cnt.t + 3, y1 = r.cnt.b - 4; const b = L.median(S.rect(r.cnt.l + 1, r.cnt.l + 5, y0, y1).map(p => p.c)); const text = r.text ? M.inkBox(S, r.text.l - 2, r.text.r + 2, y0, y1, b, 8) : null; const icon = r.icon ? M.inkBox(S, r.icon.l, r.icon.r, y0, y1, b, 8) : null; const before = r.icon ? M.inkBox(S, r.cnt.l + 1, r.icon.l - 1, y0, y1, b, 8) : null; return { level: r.level, kind: r.kind, label: r.label, cntL: r.cnt.l, textInkL: text ? +text.l.toFixed(2) : null, textFromRoot: text ? +(text.l - g.root.l).toFixed(2) : null, textDarkest: text ? text.darkest : null, iconInkL: icon ? +icon.l.toFixed(2) : null, inkBeforeIcon: before ? [+before.l.toFixed(2), +before.w.toFixed(2)] : null, base: b }; }); }
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(300);
    out.forcedMatch = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    await M.clickTop(page, 1, 0); const vis = await M.visibleMenupopups(page); const A = await M.measurePopup(page, vis[0].i, 'probe-forced-48-file.png');
    out.file_popup = { popup: A.g.popup, inner: A.g.content.l, popupBg: A.g.popupBg, rows: A.g.rows.map(r => ({ label: r.label, kind: r.kind, iconEl: r.icon ? [r.icon.rect.l, r.icon.rect.w] : null, iconInk: r.px.icon ? [+r.px.icon.l.toFixed(2), +r.px.icon.w.toFixed(2)] : null, iconInkC: r.px.icon ? +(r.px.icon.l + r.px.icon.w / 2).toFixed(2) : null, textInkL: r.px.textInkLeft, textFromInner: r.px.textFromInner, textDarkest: r.px.text ? r.px.text.darkest : null, arrowInk: r.px.arrow ? [+r.px.arrow.l.toFixed(2), +r.px.arrow.w.toFixed(2)] : null, base: r.px.base })) };
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'navbar.zul'); await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(300);
    const c = await navPoint(page, 0, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(400);
    const s = await navPoint(page, 0, 'Settings', false); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(400); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const g = await rows(page, '.z-navbar', 0); const S = await L.shot(page, 'probe-forced-51-expanded.png', { x: g.root.l - 12, y: g.root.t - 12, width: g.root.w + 24, height: g.root.h + 24 }); out.expanded = inkRows(S, g); out.expanded_root = g.root;
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'navbar.zul'); await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(300);
    const c = await navPoint(page, 1, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    const reply = await navPoint(page, 1, 'Reply', true); await page.mouse.move(c.x + 20, c.y); await page.waitForTimeout(50); await page.mouse.move(reply.cnt.l + 30, reply.y); await page.waitForTimeout(300);
    const s = await navPoint(page, 1, 'Settings', true); await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(500);
    const g = await rows(page, '.z-nav-popup', 0); const P = g.root; const S = await L.shot(page, 'probe-forced-51-popup.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 }); out.popup = inkRows(S, g); out.popup_root = P;
    await ctx.close(); }
  await browser.close(); L.save('probe-forced.json', out);
  console.log('forcedMatch', out.forcedMatch); console.log('=== file popup', JSON.stringify(out.file_popup.popup), 'inner', out.file_popup.inner, 'bg', JSON.stringify(out.file_popup.popupBg)); for (const r of out.file_popup.rows) console.log('  ', JSON.stringify(r));
  console.log('=== expanded root', JSON.stringify(out.expanded_root)); for (const r of out.expanded) console.log('  ', JSON.stringify(r));
  console.log('=== popup root', JSON.stringify(out.popup_root)); for (const r of out.popup) console.log('  ', JSON.stringify(r));
})();
