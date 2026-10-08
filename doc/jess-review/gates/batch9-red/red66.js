// #66 runtime-error: close button must be the right-most control. Page runtime-error.zul, 1 error and 2 errors.
// Measures rects of #zk_err-p (minus its padding), .errornumbers, #zk_err-remove-btn, #zk_err-refresh-btn; the
// error icon (#zk_err-p::before) by pixel scan (red pixels left of .errornumbers). Output: red66.json + red66-*.png
const L = require('./lib');

async function waitStable(page) { // zk.error slides the box in with a JS animation: wait until #zk_err stops changing
  let last = null;
  for (let i = 0; i < 40; i++) {
    const r = await page.evaluate(() => { const n = document.getElementById('zk_err'); return n ? n.getBoundingClientRect().toJSON() : null; });
    if (r && last && JSON.stringify(r) === JSON.stringify(last)) return r;
    last = r; await page.waitForTimeout(150);
  }
  return last;
}
async function geom(page) {
  return page.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const vis = e => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0 && r.width > 0 && r.height > 0; };
    const err = document.getElementById('zk_err'), p = document.getElementById('zk_err-p'), rm = document.getElementById('zk_err-remove-btn'), rf = document.getElementById('zk_err-refresh-btn'), num = p.querySelector('.errornumbers');
    const ps = getComputedStyle(p), bs = getComputedStyle(p, '::before');
    const msgs = [...err.querySelectorAll('.messages')].map(m => m.textContent.trim());
    return { err: R(err), errCls: err.className, p: R(p), pPad: { l: parseFloat(ps.paddingLeft), r: parseFloat(ps.paddingRight), t: parseFloat(ps.paddingTop), b: parseFloat(ps.paddingBottom) }, pDisplay: ps.display,
      before: { content: bs.content, w: bs.width, h: bs.height, display: bs.display, position: bs.position },
      num: R(num), numText: num.textContent.trim(), remove: R(rm), refresh: R(rf), removeVisible: vis(rm), refreshVisible: vis(rf),
      removeIcon: R(rm.querySelector('i')), refreshIcon: R(rf.querySelector('i')), msgs, nMsgs: msgs.length };
  });
}
// red icon pixels in the header strip left of .errornumbers (the ::before glyph). Red = R high, G/B low.
function iconPixels(S, g) {
  const px = S.rect(g.p.l, g.num.l - 1, g.p.t, g.p.t + Math.max(g.num.b - g.p.t, 48));
  const hits = px.filter(p => p.c[0] > 150 && p.c[1] < 120 && p.c[2] < 120);
  if (!hits.length) return { n: 0 };
  const xs = hits.map(p => p.x), ys = hits.map(p => p.y);
  return { n: hits.length, l: Math.min(...xs), r: Math.max(...xs) + 1 / S.dpr, t: Math.min(...ys), b: Math.max(...ys) + 1 / S.dpr };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'rects in CSS px; contentRight = #zk_err-p right - its padding-right; icon = pixel bounds of red pixels left of .errornumbers', cases: [] };
  for (const c of [{ name: '1err', btn: 'Trigger Error' }, { name: '2err', btn: 'Trigger Multiple Errors' }]) {
    const { ctx, page } = await L.open(browser, 'runtime-error.zul');
    await page.getByText(c.btn, { exact: true }).click();
    await waitStable(page); await page.mouse.move(2, 2); await page.waitForTimeout(200);
    const g = await geom(page);
    const S = await L.shot(page, `red66-${c.name}.png`, { x: g.err.l - 10, y: 0, width: g.err.w + 20, height: g.err.b + 10 });
    const icon = iconPixels(S, g);
    const contentRight = g.p.r - g.pPad.r, contentLeft = g.p.l + g.pPad.l;
    const rec = { case: c.name, ...g, icon, contentLeft, contentRight,
      J66_1: { removeRight: g.remove.r, refreshRight: g.refresh.r, removeRightOfRefresh: g.remove.r > g.refresh.r, removeToContentRight: +(contentRight - g.remove.r).toFixed(2), pass: g.remove.r > g.refresh.r && Math.abs(contentRight - g.remove.r) <= 1 },
      P66_a: { removeSize: [g.remove.w, g.remove.h], refreshSize: [g.refresh.w, g.refresh.h], bothVisible: g.removeVisible && g.refreshVisible, numRight: g.num.r, leftmostBtnLeft: Math.min(g.remove.l, g.refresh.l), pass: g.removeVisible && g.refreshVisible && g.remove.w === 32 && g.remove.h === 32 && g.refresh.w === 32 && g.refresh.h === 32 && g.num.r <= Math.min(g.remove.l, g.refresh.l) },
      P66_b: { beforeSize: [g.before.w, g.before.h], iconPixelBounds: icon, iconLeftMinusContentLeft: icon.n ? +(icon.l - contentLeft).toFixed(2) : null, iconRightLeqNumLeft: icon.n ? icon.r <= g.num.l : null, pass: g.before.w === '24px' && g.before.h === '24px' && icon.n > 0 && icon.r <= g.num.l && icon.l < g.num.l },
    };
    // P66-c: hover refresh (no click) must not move the close button; then click close -> #zk_err gone
    await page.mouse.move(g.refresh.l + g.refresh.w / 2, g.refresh.t + g.refresh.h / 2); await page.waitForTimeout(250);
    const gh = await geom(page);
    rec.P66_c_hoverRefresh = { removeAfterHover: gh.remove, moved: JSON.stringify(gh.remove) !== JSON.stringify(g.remove) };
    await page.mouse.move(2, 2); await page.waitForTimeout(150);
    await page.mouse.click(g.remove.l + g.remove.w / 2, g.remove.t + g.remove.h / 2); await page.waitForTimeout(800);
    rec.P66_c_clickClose = await page.evaluate(() => { const n = document.getElementById('zk_err'); return { exists: !!n, display: n ? getComputedStyle(n).display : null, rect: n ? n.getBoundingClientRect().toJSON() : null }; });
    rec.P66_c_clickClose.pass = !rec.P66_c_clickClose.exists || rec.P66_c_clickClose.display === 'none' || rec.P66_c_clickClose.rect.height === 0;
    await ctx.close();
    // P66-c second half: click refresh (observe what happens: navigation?)
    {
      const { ctx, page } = await L.open(browser, 'runtime-error.zul');
      await page.getByText(c.btn, { exact: true }).click(); await waitStable(page);
      const g2 = await geom(page);
      let navigated = false; page.once('load', () => { navigated = true; });
      await page.mouse.click(g2.refresh.l + g2.refresh.w / 2, g2.refresh.t + g2.refresh.h / 2); await page.waitForTimeout(1500);
      await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading, null, { timeout: 10000 }).catch(() => {});
      rec.P66_c_clickRefresh = { navigated, errExistsAfter: await page.evaluate(() => !!document.getElementById('zk_err')), removeAfter: await page.evaluate(() => { const n = document.getElementById('zk_err-remove-btn'); return n ? n.getBoundingClientRect().toJSON() : null; }), refreshAfter: await page.evaluate(() => { const n = document.getElementById('zk_err-refresh-btn'); return n ? n.getBoundingClientRect().toJSON() : null; }) };
      await ctx.close();
    }
    out.cases.push(rec);
  }
  const a = out.cases[0], b = out.cases[1];
  out.P66_d = { order1: [a.remove.l, a.refresh.l], order2: [b.remove.l, b.refresh.l], sameOrder: (a.remove.l < a.refresh.l) === (b.remove.l < b.refresh.l), sameX: a.remove.l === b.remove.l && a.refresh.l === b.refresh.l, nMsgs: [a.nMsgs, b.nMsgs] };
  L.save('red66.json', out);
  await browser.close();
  for (const c of out.cases) console.log(c.case, JSON.stringify({ J66_1: c.J66_1, P66_a: c.P66_a, P66_b: c.P66_b, hover: c.P66_c_hoverRefresh.moved, close: c.P66_c_clickClose, refresh: c.P66_c_clickRefresh, err: c.err, p: c.p, pad: c.pPad, num: c.num, icon: c.icon, msgs: c.msgs }));
  console.log('P66_d', JSON.stringify(out.P66_d));
})().catch(e => { console.error(e); process.exit(1); });
