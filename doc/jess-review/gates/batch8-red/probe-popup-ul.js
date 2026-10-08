// Batch 8 RED, #51 root-cause evidence for the popup's third level: the nested <ul> inside .z-nav-popup
// (computed list-style / padding / margin, bullet ink left of the row content), compared with the expanded navbar's nested <ul>.
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
async function navPoint(page, nbIdx, label, inPopup) { return page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; const li = [...root.querySelectorAll('li')].find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === label; }); if (!li) return { err: 'no ' + label }; const a = li.querySelector(':scope > a'); const b = a.getBoundingClientRect(); const rr = root.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, cnt: { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }, root: { l: rr.left, t: rr.top, r: rr.right, b: rr.bottom, w: rr.width, h: rr.height } }; }, { nbIdx, label, inPopup }); }
const ulInfo = (ul) => { const cs = getComputedStyle(ul); const r = ul.getBoundingClientRect(); const li = ul.querySelector(':scope > li'); const lcs = li ? getComputedStyle(li) : null; return { cls: ul.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), listStyle: cs.listStyleType + ' ' + cs.listStylePosition, padding: cs.padding, margin: cs.margin, display: cs.display, liListStyle: lcs && lcs.listStyleType, liDisplay: lcs && lcs.display, parent: ul.parentElement.tagName + '.' + ul.parentElement.className }; };
(async () => {
  const browser = await launch(); const out = {};
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 1, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    const reply = await navPoint(page, 1, 'Reply', true); await page.mouse.move(c.x + 20, c.y); await page.waitForTimeout(50); await page.mouse.move(reply.cnt.l + 30, reply.y); await page.waitForTimeout(300);
    const s = await navPoint(page, 1, 'Settings', true); await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(500);
    out.popup_uls = await page.evaluate(src => { const p = [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none'); const f = eval(src); return { popup: f(p), nested: [...p.querySelectorAll('ul')].map(f) }; }, ulInfo.toString());
    const ep = await navPoint(page, 1, 'Edit profile', true); const P = ep.root;
    const S = await L.shot(page, 'probe-popup-ul-l3.png', { x: P.l - 4, y: ep.cnt.t - 4, width: P.w + 8, height: ep.cnt.h + 8 });
    const base = L.median(S.rect(P.l + 2, P.l + 5, ep.cnt.t + 4, ep.cnt.b - 5).map(p => p.c));
    out.l3_leftOfContent_ink = M.inkBox(S, P.l + 1, ep.cnt.l - 1, ep.cnt.t + 2, ep.cnt.b - 3, base, 8);
    out.l3_base = base; out.l3_cnt = ep.cnt; out.l3_root = P;
    // hover layer vertical extent at cnt left + 2 while the pointer is on Edit profile
    await page.mouse.move(ep.cnt.l + 30, ep.y); await page.waitForTimeout(300);
    const S2 = await L.shot(page, 'probe-popup-ul-l3-hover.png', { x: P.l - 4, y: ep.cnt.t - 8, width: P.w + 8, height: ep.cnt.h + 16 });
    out.l3_hover = { h: M.hExtent(S2, Math.ceil(P.l) + 1, Math.floor(P.r) - 2, ep.cnt.t + 4, ep.cnt.b - 5, base, 2), v: M.vExtent(S2, ep.cnt.l + 2, ep.cnt.l + 5, ep.cnt.t - 6, ep.cnt.b + 5, base, 2) };
    delete out.l3_hover.h.cols;
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 0, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(400);
    const s = await navPoint(page, 0, 'Settings', false); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(400);
    out.expanded_uls = await page.evaluate(src => { const nb = document.querySelectorAll('.z-navbar')[0]; const f = eval(src); return [...nb.querySelectorAll('ul')].filter(u => getComputedStyle(u).display !== 'none').map(f); }, ulInfo.toString());
    await ctx.close(); }
  await browser.close(); L.save('probe-popup-ul.json', out);
  console.log(JSON.stringify(out, null, 1));
})();
