// Batch 8 FINAL: after-fix screenshots for the Jess comments (#48 File popup, #51 expanded 3 levels + collapsed popup, #49 View popup before/after check). DPR 2, real scrollbars.
const L = require('./lib.js'); const M = require('./m8.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
async function navPoint(page, nbIdx, label, inPopup) { return page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; const li = [...root.querySelectorAll('li')].find(l => { const w = zk.Widget.$(l); return w && w.getLabel && w.getLabel() === label; }); if (!li) return { err: 'no ' + label }; const a = li.querySelector(':scope > a'); const b = a.getBoundingClientRect(); const rr = root.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, cnt: { l: b.left, t: b.top, w: b.width, h: b.height }, root: { l: rr.left, t: rr.top, r: rr.right, b: rr.bottom, w: rr.width, h: rr.height } }; }, { nbIdx, label, inPopup }); }
const clipOf = (r, pad) => ({ x: r.l - pad, y: r.t - pad, width: r.w + 2 * pad, height: r.h + 2 * pad });
(async () => {
  const browser = await launch();
  // #48: File popup (menubar[1]) with Open aligned; include the menubar row above it
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 1, 0);
    const vis = await M.visibleMenupopups(page); const g = await M.menuRows(page, vis[0].i); const P = g.popup;
    await page.screenshot({ path: L.OUT + '/jess-48-file-popup-after.png', clip: { x: P.l - 16, y: P.t - 64, width: 320, height: P.h + 80 } });
    await page.screenshot({ path: L.OUT + '/jess-48-file-popup-after-zoom.png', clip: clipOf(P, 6) });
    await ctx.close(); }
  // #48 (record): Project popup, image + iconSclass mix (unchanged 2px, follow-up)
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 0, 0);
    const vis = await M.visibleMenupopups(page); const g = await M.menuRows(page, vis[0].i); const P = g.popup;
    await page.screenshot({ path: L.OUT + '/jess-48-project-popup-after.png', clip: clipOf(P, 6) });
    await ctx.close(); }
  // #49: View popup before (none checked) and after checking Sort by Name
  { const { ctx, page } = await L.open(browser, 'menubar.zul'); await M.clickTop(page, 1, 1);
    let vis = await M.visibleMenupopups(page); let g = await M.menuRows(page, vis[0].i); let P = g.popup;
    await page.screenshot({ path: L.OUT + '/jess-49-view-unchecked.png', clip: { x: P.l - 16, y: P.t - 64, width: 300, height: P.h + 80 } });
    const r0 = g.rows[0]; await page.mouse.click(r0.cnt.l + r0.cnt.w / 2, r0.cnt.t + r0.cnt.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    await M.clickTop(page, 1, 1); vis = await M.visibleMenupopups(page); g = await M.menuRows(page, vis[0].i); P = g.popup;
    await page.screenshot({ path: L.OUT + '/jess-49-view-checked.png', clip: { x: P.l - 16, y: P.t - 64, width: 300, height: P.h + 80 } });
    await ctx.close(); }
  // #51: expanded vertical navbar with Contact and Settings open (3 levels)
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 0, 'Contact', false); await page.mouse.click(c.x, c.y); await L.settle(page); await page.waitForTimeout(400);
    const s = await navPoint(page, 0, 'Settings', false); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(400); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const h = await navPoint(page, 0, 'Home', false); const R = h.root;
    await page.screenshot({ path: L.OUT + '/jess-51-navbar-expanded-after.png', clip: { x: R.l - 16, y: R.t - 16, width: R.w + 32, height: R.h + 32 } });
    await ctx.close(); }
  // #51: collapsed navbar popup with Settings opened inside it (3 levels in the popup)
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    const c = await navPoint(page, 1, 'Contact', false); await page.mouse.move(c.x, c.y); await page.waitForTimeout(700); await L.settle(page);
    const reply = await navPoint(page, 1, 'Reply', true); await page.mouse.move(c.x + 20, c.y); await page.waitForTimeout(50); await page.mouse.move(reply.cnt.l + 30, reply.y); await page.waitForTimeout(300);
    const s = await navPoint(page, 1, 'Settings', true); await page.mouse.move(s.x, s.y); await page.waitForTimeout(150); await page.mouse.click(s.x, s.y); await L.settle(page); await page.waitForTimeout(500);
    const inbox = await navPoint(page, 1, 'Inbox', true); await page.mouse.move(inbox.cnt.l + 30, inbox.y); await page.waitForTimeout(300);
    const P = inbox.root; const N = c.root;
    await page.screenshot({ path: L.OUT + '/jess-51-collapsed-popup-after.png', clip: { x: N.l - 16, y: Math.min(N.t, P.t - 24) - 16, width: (P.r - N.l) + 32, height: Math.max(N.b, P.b) - Math.min(N.t, P.t - 24) + 32 } });
    await ctx.close(); }
  await browser.close();
})();
