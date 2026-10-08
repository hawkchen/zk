// Batch 8 FINAL (copy of batch8-red/red51-hover.js, only output names changed), #51 protection: hover state-layer rectangles measured INSIDE the navbar / popup box only
// (red51.js's first pass scanned past the box edges and picked up the page background). Per-column dE vs rest bg, thr 2.
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
async function navPoint(page, nbIdx, label, inPopup) { return page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; const li = [...root.querySelectorAll('li')].find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === label; }); if (!li) return { err: 'no ' + label }; const a = li.querySelector(':scope > a'); const b = a.getBoundingClientRect(); const rr = root.getBoundingClientRect(); let lvl = 1, p = li.parentElement; while (p && p !== root) { if (p.classList.contains('z-nav')) lvl++; p = p.parentElement; } return { x: b.left + b.width / 2, y: b.top + b.height / 2, level: lvl, cnt: { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }, root: { l: rr.left, t: rr.top, r: rr.right, b: rr.bottom, w: rr.width, h: rr.height } }; }, { nbIdx, label, inPopup }); }
async function layer(page, pt, file, restBg) {
  const r = pt.cnt, P = pt.root; await page.mouse.move(r.l + Math.min(30, r.w / 2), r.t + r.h / 2); await page.waitForTimeout(350);
  const S = await L.shot(page, file, { x: P.l - 4, y: r.t - 8, width: P.w + 8, height: r.h + 16 });
  const y0 = r.t + 4, y1 = r.b - 5; const inner = M.hExtent(S, Math.ceil(P.l) + 1, Math.floor(P.r) - 2, y0, y1, restBg, 2);
  const v = M.vExtent(S, Math.ceil(P.l) + 2, Math.ceil(P.l) + 5, r.t - 6, r.b + 5, restBg, 2);
  const col = L.median(S.rect(Math.ceil(P.l) + 2, Math.ceil(P.l) + 5, y0, y1).map(p => p.c)); const colRight = L.median(S.rect(Math.floor(P.r) - 6, Math.floor(P.r) - 3, y0, y1).map(p => p.c));
  const colCnt = L.median(S.rect(r.l + 2, r.l + 5, y0, y1).map(p => p.c));
  return { level: pt.level, cnt: [r.l, r.t, r.w, r.h].map(v => +v.toFixed(2)), root: [P.l, P.r].map(v => +v.toFixed(2)), layerAtRootLeft: col, layerAtRootRight: colRight, layerAtCntLeft: colCnt, dE_rootLeft: +L.dE(col, restBg).toFixed(2), dE_rootRight: +L.dE(colRight, restBg).toFixed(2), hExtentInside: inner.found ? { l: inner.l, r: inner.r, reachesLeft: inner.l <= Math.ceil(P.l) + 1, reachesRight: inner.r >= Math.floor(P.r) - 1 } : inner, vExtent: v.found ? { t: v.t, b: v.b } : v };
}
(async () => {
  const browser = await launch(); const out = {};
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 0, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(400);
    const s = await navPoint(page, 0, 'Settings', false); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(400); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const home = await navPoint(page, 0, 'Home', false); const S0 = await L.shot(page, null, { x: home.root.l - 4, y: home.root.t - 4, width: home.root.w + 8, height: 60 });
    const restBg = L.median(S0.rect(home.root.l + 2, home.root.l + 5, home.root.t + 4, home.root.t + 50).map(p => p.c)); out.expanded = { restBg, rows: {} };
    for (const lb of ['Home', 'Contact', 'Reply', 'Settings', 'Edit profile']) { const pt = await navPoint(page, 0, lb, false); out.expanded.rows[lb] = await layer(page, pt, 'final51h-expanded-' + lb.replace(/\s/g, '_') + '.png', restBg); }
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 1, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    const reply = await navPoint(page, 1, 'Reply', true); await page.mouse.move(c.x + 20, c.y); await page.waitForTimeout(50); await page.mouse.move(reply.cnt.l + 30, reply.y); await page.waitForTimeout(300);
    const s = await navPoint(page, 1, 'Settings', true); await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(500);
    // rest bg of the popup: sample the Inbox row's left padding while the pointer is on Settings
    const inbox = await navPoint(page, 1, 'Inbox', true); const S0 = await L.shot(page, null, { x: inbox.root.l - 4, y: inbox.cnt.t - 4, width: inbox.root.w + 8, height: inbox.cnt.h + 8 });
    const popBg = L.median(S0.rect(inbox.root.l + 2, inbox.root.l + 5, inbox.cnt.t + 4, inbox.cnt.b - 5).map(p => p.c)); out.popup = { restBg: popBg, rows: {} };
    for (const lb of ['Reply', 'Settings', 'Edit profile', 'Change password']) { const pt = await navPoint(page, 1, lb, true); out.popup.rows[lb] = await layer(page, pt, 'final51h-popup-' + lb.replace(/\s/g, '_') + '.png', popBg); }
    await ctx.close(); }
  await browser.close(); L.save('final51-hover.json', out);
  for (const k of ['expanded', 'popup']) { console.log('=== ' + k, 'restBg', JSON.stringify(out[k].restBg)); for (const lb in out[k].rows) console.log(' ', lb.padEnd(16), JSON.stringify(out[k].rows[lb])); }
})();
