// Batch 8 FINAL, #51 extra probes (read-only, no file edits):
//  (1) fresh page: first-level geometry of the collapsed navbars [1],[2] with navbar[0] CLOSED (same state as RED's screenshot, for the "first level unchanged" protection);
//  (2) collapsed popup (hover Contact of navbar[1]): colour strip of the first row (Reply) at the popup's left edge — explains the iconInkL=284 reading in final51.json;
//      after clicking Settings inside the popup: for every level-3 row, any ink between the row's left edge and its icon element (bullet check, J51-2(b));
//  (3) a 4th level built with the client widget API only (new zkmax.nav.Nav + Navitem appended under Settings of navbar[0]), opened, then text ink left per level.
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
async function navPoint(page, nbIdx, label, inPopup) { return page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; const lis = [...root.querySelectorAll('li')]; const li = lis.find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === label; }); if (!li) return { err: 'no ' + label }; const a = li.querySelector(':scope > a'); const b = a.getBoundingClientRect(); const rr = root.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, cls: li.className, cnt: { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }, root: { l: rr.left, t: rr.top, r: rr.right, b: rr.bottom, w: rr.width, h: rr.height } }; }, { nbIdx, label, inPopup }); }
const rowsSrc = `(function (root) {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; };
  const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  return { root: R(root), rows: [...root.querySelectorAll('li')].filter(vis).map(li => { let lvl = 1, p = li.parentElement; while (p && p !== root) { if (p.classList.contains('z-nav')) lvl++; p = p.parentElement; }
    const kind = li.classList.contains('z-nav') ? 'nav' : li.classList.contains('z-navitem') ? 'navitem' : 'separator'; if (kind === 'separator') return { kind, level: lvl, li: R(li) };
    const cnt = li.querySelector(':scope > a'); const icon = [...cnt.querySelectorAll('i, img')].find(vis); const text = cnt.querySelector('.z-nav-text, .z-navitem-text'); const w = zk.Widget.$(li); const ul = li.querySelector(':scope > ul'); const ucs = ul ? getComputedStyle(ul) : null;
    return { kind, level: lvl, label: w && w.getLabel ? w.getLabel() : '', open: li.classList.contains('z-nav-open'), li: R(li), cnt: R(cnt), icon: icon ? R(icon) : null, text: text && vis(text) ? R(text) : null, paddingLeft: getComputedStyle(cnt).paddingLeft, liDisplay: getComputedStyle(li).display, ul: ul ? { listStyle: ucs.listStyleType, padding: ucs.padding, margin: ucs.margin } : null }; }) };
})`;
async function rows(page, rootSel, idx) { return page.evaluate(({ rootSel, idx, src }) => { const roots = [...document.querySelectorAll(rootSel)].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0); return eval(src)(roots[idx]); }, { rootSel, idx, src: rowsSrc }); }
function inkRows(S, g, base) { return g.rows.filter(r => r.kind !== 'separator').map(r => { const y0 = r.cnt.t + 3, y1 = r.cnt.b - 4; const b = base || L.median(S.rect(r.cnt.l + 1, r.cnt.l + 5, y0, y1).map(p => p.c)); const text = r.text ? M.inkBox(S, r.text.l - 2, r.text.r + 2, y0, y1, b, 8) : null; const beforeIcon = r.icon ? M.inkBox(S, r.cnt.l + 1, r.icon.l - 1, y0, y1, b, 8) : null; const icon = r.icon ? M.inkBox(S, r.icon.l, r.icon.r, y0, y1, b, 8) : null; return { level: r.level, kind: r.kind + (r.open ? '/open' : ''), label: r.label, cntL: r.cnt.l, cntT: r.cnt.t, cntH: r.cnt.h, padL: r.paddingLeft, liDisplay: r.liDisplay, ul: r.ul, iconEl: r.icon ? [r.icon.l, r.icon.t, r.icon.w, r.icon.h] : null, iconInk: icon ? [+icon.l.toFixed(2), +icon.t.toFixed(2), +icon.w.toFixed(2), +icon.h.toFixed(2)] : null, inkBeforeIcon: beforeIcon ? [+beforeIcon.l.toFixed(2), +beforeIcon.t.toFixed(2), +beforeIcon.w.toFixed(2), +beforeIcon.h.toFixed(2), beforeIcon.darkest] : null, textSpanL: r.text ? r.text.l : null, textInkL: text ? +text.l.toFixed(2) : null, textFromRoot: text ? +(text.l - g.root.l).toFixed(2) : null, base: b }; }); }
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  // (1) fresh page, navbar[0] closed: collapsed navbars' first level
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    out.fresh_closed = {}; for (const i of [0, 1, 2]) { const g = await rows(page, '.z-navbar', i); out.fresh_closed[i] = { root: g.root, rows: g.rows.map(r => r.kind === 'separator' ? { kind: 'sep', t: r.li.t, h: r.li.h } : { label: r.label, kind: r.kind, cnt: r.cnt, icon: r.icon, text: r.text }) }; }
    await ctx.close(); }
  // (2) collapsed popup: left-edge colour strip of the Reply row while the pointer is on Contact; bullet check on level-3 rows
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 1, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    let g = await rows(page, '.z-nav-popup', 0); let P = g.root;
    let S = await L.shot(page, 'probe51-popup-l2.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 });
    const popBg = L.median(S.rect(P.l + 2, P.l + 6, P.t + 6, P.b - 7).map(p => p.c)); out.popup_bg = popBg; out.popup_root_l2 = P; out.navbar1_root = c.root; out.pointer = { x: c.x, y: c.y };
    const reply = g.rows.find(r => r.label === 'Reply'); const inbox = g.rows.find(r => r.label === 'Inbox');
    const strip = (r) => { const y = Math.round(r.cnt.t + r.cnt.h / 2); const cols = []; for (let x = P.l - 2; x <= P.l + 24; x++) cols.push({ x, c: S.at(x * S.dpr, y * S.dpr), d: +L.dE(S.at(x * S.dpr, y * S.dpr), popBg).toFixed(1) }); return { y, cols }; };
    out.reply_strip_l2 = strip(reply); out.inbox_strip_l2 = strip(inbox);
    out.l2_rows = inkRows(S, g, popBg);
    // the first row with the pointer moved INTO the popup but on a different row (Inbox): is the Reply row's left edge still different?
    await page.mouse.move(c.x + 20, c.y); await page.waitForTimeout(50); await page.mouse.move(inbox.cnt.l + 30, inbox.cnt.t + inbox.cnt.h / 2); await page.waitForTimeout(300);
    S = await L.shot(page, 'probe51-popup-l2-pointer-inbox.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 });
    out.reply_strip_pointer_inbox = strip(reply);
    // open Settings inside the popup -> level 3
    const s = await navPoint(page, 1, 'Settings', true); await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(600);
    g = await rows(page, '.z-nav-popup', 0); P = g.root;
    S = await L.shot(page, 'probe51-popup-l3.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 });
    out.l3_rows = inkRows(S, g, popBg); out.popup_root_l3 = P;
    await ctx.close(); }
  // (3) 4th level via the widget API in navbar[0]: Settings (L2 nav) gets a new Nav "Advanced" (L3 nav) with a Navitem "Deep item" (L4)
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 0, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(400);
    const s = await navPoint(page, 0, 'Settings', false); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(400);
    out.l4_build = await page.evaluate(() => { const root = document.querySelectorAll('.z-navbar')[0]; const li = [...root.querySelectorAll('li')].find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === 'Settings'; }); const settings = zk.Widget.$(li); const NavC = settings.constructor; const ItemC = zk.Widget.$([...root.querySelectorAll('li.z-navitem')][0]).constructor; const nav = new NavC({ label: 'Advanced', iconSclass: 'z-icon-cog' }); nav.appendChild(new ItemC({ label: 'Deep item', iconSclass: 'z-icon-circle' })); nav.appendChild(new ItemC({ label: 'Deep item 2', iconSclass: 'z-icon-circle' })); settings.appendChild(nav); return { navClass: NavC.prototype.className, itemClass: ItemC.prototype.className, settingsChildren: settings.nChildren }; });
    await L.settle(page); await page.waitForTimeout(400);
    const a = await navPoint(page, 0, 'Advanced', false); if (a.err) out.l4_err = a; else { await page.mouse.click(a.x, a.y); await L.settle(page); await page.waitForTimeout(500); }
    await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const g = await rows(page, '.z-navbar', 0); const S = await L.shot(page, 'probe51-l4-expanded.png', { x: g.root.l - 12, y: g.root.t - 12, width: g.root.w + 24, height: Math.min(g.root.h + 24, 900 - g.root.t + 12) });
    out.l4_rows = inkRows(S, g); out.l4_root = g.root;
    await page.screenshot({ path: L.OUT + '/probe51-l4-page.png' });
    await ctx.close(); }
  await browser.close(); L.save('probe51-extra.json', out);
  console.log('=== fresh_closed'); for (const i in out.fresh_closed) { const f = out.fresh_closed[i]; console.log(' navbar[' + i + '] root', JSON.stringify(f.root)); for (const r of f.rows) console.log('  ', JSON.stringify(r)); }
  console.log('=== popup_bg', JSON.stringify(out.popup_bg), 'popup root l2', JSON.stringify(out.popup_root_l2), 'navbar1 root', JSON.stringify(out.navbar1_root), 'pointer', JSON.stringify(out.pointer));
  console.log('=== reply strip (pointer on Contact) y', out.reply_strip_l2.y, out.reply_strip_l2.cols.map(c => c.x + ':' + c.c.join(',') + '/' + c.d).join(' '));
  console.log('=== inbox strip (pointer on Contact) y', out.inbox_strip_l2.y, out.inbox_strip_l2.cols.map(c => c.x + ':' + c.d).join(' '));
  console.log('=== reply strip (pointer on Inbox)', out.reply_strip_pointer_inbox.cols.map(c => c.x + ':' + c.d).join(' '));
  console.log('=== l2_rows'); for (const r of out.l2_rows) console.log('  ', JSON.stringify(r));
  console.log('=== l3_rows (popup root', JSON.stringify(out.popup_root_l3), ')'); for (const r of out.l3_rows) console.log('  ', JSON.stringify(r));
  console.log('=== l4_build', JSON.stringify(out.l4_build), JSON.stringify(out.l4_err || '')); console.log('=== l4_rows root', JSON.stringify(out.l4_root)); for (const r of out.l4_rows) console.log('  ', JSON.stringify(r));
})();
