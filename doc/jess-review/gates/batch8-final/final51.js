// Batch 8 FINAL (copy of batch8-red/red51.js, only output names changed), #51 navbar nested indentation. Text/icon ink left per row and per level for the expanded vertical navbar,
// the collapsed navbar's .z-nav-popup (level 3 opened inside it), the horizontal collapsed popup; hover state layers; DOM nesting.
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
// in-page: rows under a root element (navbar or popup ul); level = 1 + number of .z-nav ancestors strictly inside root
const rowsSrc = `(function (root) {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; };
  const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  const chain = e => { const c = []; let p = e; while (p && p !== document.body) { c.unshift(p.tagName.toLowerCase() + (p.className && typeof p.className === 'string' && p.className.trim() ? '.' + p.className.trim().split(/\\s+/).join('.') : '')); p = p.parentElement; } return c.join(' > '); };
  const lis = [...root.querySelectorAll('li')].filter(vis);
  return { root: R(root), rootCls: root.className, rootChain: chain(root), rootParent: root.parentElement.tagName + (root.parentElement.className ? '.' + root.parentElement.className : ''),
    rows: lis.map(li => { let lvl = 1, p = li.parentElement; while (p && p !== root) { if (p.classList.contains('z-nav')) lvl++; p = p.parentElement; }
      const kind = li.classList.contains('z-nav') ? 'nav' : li.classList.contains('z-navitem') ? 'navitem' : li.classList.contains('z-navseparator') ? 'separator' : 'other';
      if (kind === 'separator') return { kind, level: lvl, li: R(li) };
      const cnt = li.querySelector(':scope > a'); const icon = [...cnt.querySelectorAll('i, img')].find(vis); const text = cnt.querySelector('.z-nav-text, .z-navitem-text'); const info = cnt.querySelector('.z-nav-info');
      let rng = null; if (text && vis(text)) { const r = document.createRange(); const tn = [...text.childNodes].find(n => n.nodeType === 3); if (tn) r.selectNodeContents(tn); else r.selectNodeContents(text); rng = R(r); }
      const w = zk.Widget.$(li); const ccs = getComputedStyle(cnt); const after = getComputedStyle(cnt, '::after');
      return { kind, level: lvl, label: w && w.getLabel ? w.getLabel() : (text ? text.textContent.trim() : ''), cls: li.className, open: li.classList.contains('z-nav-open'), disabled: li.classList.contains('z-navitem-disabled') || li.classList.contains('z-nav-disabled'), selected: li.classList.contains('z-navitem-selected') || li.classList.contains('z-nav-selected'),
        li: R(li), cnt: R(cnt), icon: icon ? { cls: icon.className, rect: R(icon) } : null, text: text && vis(text) ? R(text) : null, textRange: rng, badge: info && vis(info) ? R(info) : null, afterContent: after.content, afterRect: null, opacity: ccs.opacity, paddingLeft: ccs.paddingLeft, chain: chain(li) }; }) };
})`;
async function rows(page, rootSel, idx) { return page.evaluate(({ rootSel, idx, src }) => { const roots = [...document.querySelectorAll(rootSel)].filter(e => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0); return eval(src)(roots[idx]); }, { rootSel, idx, src: rowsSrc }); }
async function navPoint(page, nbIdx, label, inPopup) { return page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; const lis = [...root.querySelectorAll('li')]; const li = lis.find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === label; }); if (!li) return { err: 'no ' + label }; const a = li.querySelector(':scope > a'); const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, cls: li.className }; }, { nbIdx, label, inPopup }); }
// pixel measurement of rows against a screenshot that covers them
function pxRows(S, g, bgOverride) {
  for (const r of g.rows) { if (r.kind === 'separator') continue;
    const y0 = r.cnt.t + 3, y1 = r.cnt.b - 4; const base = bgOverride || L.median(S.rect(r.cnt.l + 1, r.cnt.l + 5, y0, y1).map(p => p.c));
    const text = r.text ? M.inkBox(S, r.text.l - 2, Math.min(r.text.r + 2, r.badge ? r.badge.l - 2 : r.cnt.r), y0, y1, base, 8) : null;
    const icon = M.inkBox(S, r.cnt.l + 1, r.text ? r.text.l - 3 : (r.badge ? r.badge.l - 1 : r.cnt.r - 1), y0, y1, base, 8);
    const badge = r.badge ? M.inkBox(S, r.badge.l - 1, r.badge.r + 1, r.badge.t - 1, r.badge.b + 1, base, 8) : null;
    const arrow = r.kind === 'nav' ? M.inkBox(S, (r.badge ? r.badge.r + 1 : r.cnt.r - 30), r.cnt.r - 1, y0, y1, base, 8) : null;
    r.px = { base, textInkL: text ? +text.l.toFixed(2) : null, text, iconInkL: icon ? +icon.l.toFixed(2) : null, icon, badge, arrow }; }
  return g;
}
const sum = g => g.rows.map(r => r.kind === 'separator' ? { kind: 'sep', level: r.level, t: r.li.t, h: r.li.h } : ({ level: r.level, kind: r.kind + (r.open ? '/open' : '') + (r.disabled ? '/disabled' : ''), label: r.label, cntL: r.cnt.l, cntT: r.cnt.t, cntW: r.cnt.w, cntH: r.cnt.h, padL: r.paddingLeft, iconEl: r.icon ? [r.icon.rect.l, r.icon.rect.t, r.icon.rect.w, r.icon.rect.h] : null, iconInkL: r.px.iconInkL, iconInk: r.px.icon ? [+r.px.icon.l.toFixed(2), +r.px.icon.t.toFixed(2), +r.px.icon.w.toFixed(2), +r.px.icon.h.toFixed(2)] : null, textSpanL: r.text ? r.text.l : null, textRangeL: r.textRange ? r.textRange.l : null, textInkL: r.px.textInkL, textFromRoot: r.px.textInkL != null ? +(r.px.textInkL - g.root.l).toFixed(2) : null, badgeEl: r.badge ? [r.badge.l, r.badge.t, r.badge.w, r.badge.h] : null, badgeInk: r.px.badge ? [+r.px.badge.l.toFixed(2), +r.px.badge.t.toFixed(2), +r.px.badge.w.toFixed(2), +r.px.badge.h.toFixed(2)] : null, arrowInk: r.px.arrow ? [+r.px.arrow.l.toFixed(2), +r.px.arrow.t.toFixed(2), +r.px.arrow.w.toFixed(2), +r.px.arrow.h.toFixed(2)] : null, afterContent: r.afterContent, opacity: r.opacity, base: r.px.base, chain: r.chain }));
async function hoverRow(page, g, label, file, restBg) {
  const r = g.rows.find(x => x.label === label); const P = g.root; await page.mouse.move(r.cnt.l + 20, r.cnt.t + r.cnt.h / 2); await page.waitForTimeout(350);
  const S = await L.shot(page, file, { x: P.l - 12, y: r.cnt.t - 12, width: P.w + 24, height: r.cnt.h + 24 });
  const y0 = r.cnt.t + 4, y1 = r.cnt.b - 5; const layer = L.median(S.rect(r.cnt.l + 1, r.cnt.l + 5, y0, y1).map(p => p.c));
  const h = M.hExtent(S, P.l - 6, P.r + 5, y0, y1, restBg, 2); const v = M.vExtent(S, r.cnt.l + 1, r.cnt.l + 5, r.cnt.t - 6, r.cnt.b + 5, restBg, 2);
  return { label, level: r.level, cnt: r.cnt, layer, dE_vs_rest: +L.dE(layer, restBg).toFixed(2), hExtent: h.found ? { l: h.l, r: h.r } : h, vExtent: v.found ? { t: v.t, b: v.b } : v, root: { l: P.l, r: P.r } };
}
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  // ---- expanded vertical navbar[0]
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const g0 = await rows(page, '.z-navbar', 0); const S0 = await L.shot(page, 'final51-expanded-closed.png', { x: g0.root.l - 12, y: g0.root.t - 12, width: g0.root.w + 24, height: g0.root.h + 24 }); out.expanded_closed = sum(pxRows(S0, g0));
    const restBg = L.median(S0.rect(g0.root.l + 2, g0.root.l + 6, g0.root.t + 4, g0.root.b - 5).map(p => p.c)); out.expanded_restBg = restBg; out.expanded_closed_root = g0.root;
    const c = await navPoint(page, 0, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(500);
    const s = await navPoint(page, 0, 'Settings', false); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(500); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const g = await rows(page, '.z-navbar', 0); const S = await L.shot(page, 'final51-expanded-open.png', { x: g.root.l - 12, y: g.root.t - 12, width: g.root.w + 24, height: g.root.h + 24 }); out.expanded_open = sum(pxRows(S, g)); out.expanded_open_root = g.root;
    out.expanded_hover = {}; for (const lb of ['Contact', 'Reply', 'Settings', 'Edit profile', 'Home']) out.expanded_hover[lb] = await hoverRow(page, g, lb, 'final51-expanded-hover-' + lb.replace(/\s/g, '_') + '.png', restBg);
    await page.mouse.move(2, 2); await page.waitForTimeout(300);
    // also the collapsed navbars' first-level icon positions and the horizontal navbars (protection record)
    out.collapsed_closed = [1, 2].map(() => null); for (const i of [1, 2]) { const gc = await rows(page, '.z-navbar', i); out.collapsed_closed[i - 1] = { root: gc.root, rows: gc.rows.map(r => r.kind === 'separator' ? { kind: 'sep', t: r.li.t, h: r.li.h } : { label: r.label, kind: r.kind, cnt: r.cnt, icon: r.icon && r.icon.rect, badge: r.badge }) }; }
    for (const i of [3, 4, 5]) { const gh = await rows(page, '.z-navbar', i); out['horizontal_' + i] = { root: gh.root, cls: gh.rootCls, rows: gh.rows.map(r => r.kind === 'separator' ? { kind: 'sep', l: r.li.l, w: r.li.w } : { label: r.label, kind: r.kind, cnt: r.cnt, icon: r.icon && r.icon.rect, text: r.text, badge: r.badge }) }; }
    await ctx.close(); }
  // ---- collapsed vertical navbar[1]: hover Contact -> popup; move into the popup; click Settings -> level 3 inside the popup
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 1, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    out.popup_elems = await page.evaluate(() => [...document.querySelectorAll('.z-nav-popup, .z-nav-text-popup')].map(p => { const r = p.getBoundingClientRect(); const cs = getComputedStyle(p); return { tag: p.tagName, cls: p.className, parent: p.parentElement.tagName + (p.parentElement.className ? '.' + p.parentElement.className : ''), rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), bg: cs.backgroundColor, padding: cs.padding, text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) }; }));
    let g = await rows(page, '.z-nav-popup', 0); let P = g.root;
    let S = await L.shot(page, 'final51-popup-l2.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 });
    const popBg = L.median(S.rect(P.l + 2, P.l + 6, P.t + 6, P.b - 7).map(p => p.c)); out.popup_bg = popBg;
    out.popup_l2 = sum(pxRows(S, g)); out.popup_l2_root = { root: g.root, chain: g.rootChain, parent: g.rootParent };
    // move into the popup (Reply row), then click Settings inside it
    const reply = g.rows.find(r => r.label === 'Reply'); await page.mouse.move(c.x + 20, c.y); await page.waitForTimeout(50); await page.mouse.move(reply.cnt.l + 30, reply.cnt.t + reply.cnt.h / 2); await page.waitForTimeout(300);
    const s = await navPoint(page, 1, 'Settings', true); if (s.err) { out.popup_settings_err = s; } else {
      await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(600);
      out.popup_after_settings = await page.evaluate(() => [...document.querySelectorAll('.z-nav-popup')].filter(p => getComputedStyle(p).display !== 'none').map(p => { const r = p.getBoundingClientRect(); return { rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) }; }));
      g = await rows(page, '.z-nav-popup', 0); P = g.root;
      S = await L.shot(page, 'final51-popup-l3.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 });
      out.popup_l3 = sum(pxRows(S, g, popBg)); out.popup_l3_root = { root: g.root, chain: g.rootChain, parent: g.rootParent };
      // hover state layer inside the popup: Reply (level 2 item), Edit profile (level 3 item), Settings (level 2 nav)
      out.popup_hover = {}; for (const lb of ['Reply', 'Edit profile', 'Settings']) out.popup_hover[lb] = await hoverRow(page, g, lb, 'final51-popup-hover-' + lb.replace(/\s/g, '_') + '.png', popBg);
      await page.screenshot({ path: L.OUT + '/final51-popup-page.png' }); }
    await ctx.close(); }
  // ---- horizontal collapsed navbar[4]: hover Contact -> popup-horizontal (record)
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 4, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    const vis = await page.evaluate(() => [...document.querySelectorAll('.z-nav-popup')].filter(p => getComputedStyle(p).display !== 'none').length);
    if (vis) { const g = await rows(page, '.z-nav-popup', 0); const P = g.root; const S = await L.shot(page, 'final51-hpopup-l2.png', { x: P.l - 12, y: P.t - 40, width: P.w + 24, height: P.h + 52 }); out.hpopup_l2 = sum(pxRows(S, g)); out.hpopup_root = { root: g.root, cls: g.rootCls, chain: g.rootChain };
      const reply = g.rows.find(r => r.label === 'Reply'); await page.mouse.move(reply.cnt.l + 30, reply.cnt.t + reply.cnt.h / 2); await page.waitForTimeout(300);
      const s = await navPoint(page, 4, 'Settings', true); if (!s.err) { await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(600);
        const g3 = await rows(page, '.z-nav-popup', 0); const P3 = g3.root; const S3 = await L.shot(page, 'final51-hpopup-l3.png', { x: P3.l - 12, y: P3.t - 40, width: P3.w + 24, height: P3.h + 52 }); out.hpopup_l3 = sum(pxRows(S3, g3)); } }
    await ctx.close(); }
  // ---- horizontal expanded navbar[3]: click Contact, record what opens (protection record)
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 3, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(500); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const g = await rows(page, '.z-navbar', 3); const S = await L.shot(page, 'final51-horizontal-open.png', { x: g.root.l - 12, y: g.root.t - 12, width: g.root.w + 24, height: Math.max(g.root.h, ...g.rows.map(r => r.kind === 'separator' ? 0 : r.cnt.b - g.root.t)) + 24 }); out.horizontal_open = sum(pxRows(S, g)); out.horizontal_open_root = g.root;
    await ctx.close(); }
  await browser.close();
  L.save('final51.json', out);
  for (const k of ['expanded_closed', 'expanded_open', 'popup_l2', 'popup_l3', 'hpopup_l2', 'hpopup_l3', 'horizontal_open']) { if (!out[k]) { console.log('=== ' + k + ' (none)'); continue; } console.log('=== ' + k, JSON.stringify(out[k + '_root'] || '')); for (const r of out[k]) console.log(JSON.stringify(r)); }
  console.log('=== expanded_restBg', JSON.stringify(out.expanded_restBg), 'popup_bg', JSON.stringify(out.popup_bg));
  console.log('=== expanded_hover', JSON.stringify(out.expanded_hover)); console.log('=== popup_hover', JSON.stringify(out.popup_hover));
  console.log('=== popup_elems', JSON.stringify(out.popup_elems)); console.log('=== popup_after_settings', JSON.stringify(out.popup_after_settings), JSON.stringify(out.popup_settings_err || ''));
  console.log('=== collapsed_closed', JSON.stringify(out.collapsed_closed)); for (const i of [3, 4, 5]) console.log('=== horizontal_' + i, JSON.stringify(out['horizontal_' + i]));
})();
