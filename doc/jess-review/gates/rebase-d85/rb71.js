// #71 loading: the indicator must be centred in its box. Page loading.zul: global busy (.z-loading) and component busy (.z-apply-loading).
// Gaps = indicator rect to box rect on each side (actual blank space, padding ignored). The spinner's animation is left running
// (P71-b needs it): the no-animation style excludes .z-loading-icon / .z-apply-loading-icon. Output: red71.json + red71-*.png
const L = require('./lib');
const NOANIM_EXCEPT_ICON = '*:not(.z-loading-icon):not(.z-apply-loading-icon),*:not(.z-loading-icon):not(.z-apply-loading-icon)::before,*:not(.z-loading-icon):not(.z-apply-loading-icon)::after{transition:none!important;animation:none!important}';

async function openNoAnimExceptIcon(browser, pagePath) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(L.BASE + '/' + pagePath, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: NOANIM_EXCEPT_ICON });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading, null, { timeout: 15000 }).catch(() => {});
  await page.mouse.move(2, 2); await page.waitForTimeout(400);
  return { ctx, page };
}
async function geom(page, boxSel, indSel, iconSel, maskSel) {
  return page.evaluate(({ boxSel, indSel, iconSel, maskSel }) => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const box = document.querySelector(boxSel); if (!box) return null;
    const ind = box.querySelector(indSel), icon = box.querySelector(iconSel), mask = document.querySelector(maskSel);
    const bs = getComputedStyle(box), is = getComputedStyle(ind), ics = getComputedStyle(icon), icb = getComputedStyle(icon, '::before'), ms = mask ? getComputedStyle(mask) : null;
    // text ink: Range over the text nodes of the indicator (excluding the icon)
    const rg = document.createRange(); const tn = [...ind.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()); let text = null, lines = 0;
    if (tn.length) { rg.setStartBefore(tn[0]); rg.setEndAfter(tn[tn.length - 1]); text = R(rg); lines = rg.getClientRects().length; }
    return { box: R(box), boxCls: box.className, boxId: box.id, boxInline: { left: box.style.left, top: box.style.top }, ind: R(ind), icon: R(icon), text, textLines: lines, textContent: ind.textContent.trim(),
      boxStyle: { position: bs.position, zIndex: bs.zIndex, cursor: bs.cursor, borderRadius: bs.borderRadius, boxShadow: bs.boxShadow, backgroundColor: bs.backgroundColor, padding: bs.padding, border: bs.border, display: bs.display, whiteSpace: bs.whiteSpace },
      indStyle: { display: is.display, whiteSpace: is.whiteSpace, padding: is.padding, lineHeight: is.lineHeight, alignItems: is.alignItems },
      iconBox: { offsetW: icon.offsetWidth, offsetH: icon.offsetHeight, cssW: ics.width, cssH: ics.height }, iconStyle: { display: ics.display, transform: ics.transform, animationName: ics.animationName, animationPlayState: ics.animationPlayState, before: { content: icb.content, transform: icb.transform, animationName: icb.animationName, w: icb.width, h: icb.height } },
      mask: mask ? { rect: R(mask), zIndex: ms.zIndex, position: ms.position, cls: mask.className } : null, vp: [innerWidth, innerHeight], scroll: [scrollX, scrollY] };
  }, { boxSel, indSel, iconSel, maskSel });
}
function judge(g, S) {
  const gaps = { top: +(g.ind.t - g.box.t).toFixed(2), bottom: +(g.box.b - g.ind.b).toFixed(2), left: +(g.ind.l - g.box.l).toFixed(2), right: +(g.box.r - g.ind.r).toFixed(2) };
  const dv = +Math.abs(gaps.top - gaps.bottom).toFixed(2), dh = +Math.abs(gaps.left - gaps.right).toFixed(2);
  const iconCy = (g.icon.t + g.icon.b) / 2, textCy = g.text ? (g.text.t + g.text.b) / 2 : null;
  return { gaps, dVertical: dv, dHorizontal: dh, J71_pass: dv <= 1 && dh <= 1,
    P71_a: { position: g.boxStyle.position, zIndex: g.boxStyle.zIndex, maskZIndex: g.mask && g.mask.zIndex, cursor: g.boxStyle.cursor, pass: g.boxStyle.position === 'absolute' && g.boxStyle.cursor === 'wait' && (!g.mask || (+g.boxStyle.zIndex > +g.mask.zIndex)) },
    P71_b_static: { iconBBox: [g.icon.w, g.icon.h], iconBox: g.iconBox, is20: g.iconBox.offsetW === 20 && g.iconBox.offsetH === 20, iconCy, textCy, dCenter: textCy == null ? null : +(iconCy - textCy).toFixed(2) },
    P71_c: { textLines: g.textLines, indHeight: g.ind.h, whiteSpace: [g.boxStyle.whiteSpace, g.indStyle.whiteSpace], borderRadius: g.boxStyle.borderRadius, boxShadow: g.boxStyle.boxShadow, backgroundColor: g.boxStyle.backgroundColor, singleLine: g.textLines === 1 },
    P71_d: { box: g.box, inline: g.boxInline, boxCentreVsViewport: g.vp ? [+((g.box.l + g.box.r) / 2 - g.vp[0] / 2).toFixed(2), +((g.box.t + g.box.b) / 2 - g.vp[1] / 2).toFixed(2)] : null } };
}
// rotation evidence: transform matrices at two instants + pixel difference of the icon between two screenshots
async function spin(page, iconSel) {
  const t = async () => page.evaluate((s) => { const e = document.querySelector(s); return { el: getComputedStyle(e).transform, before: getComputedStyle(e, '::before').transform, after: getComputedStyle(e, '::after').transform, t: performance.now() }; }, iconSel);
  const a = await t(); await page.waitForTimeout(260); const b = await t();
  return { a, b, elChanged: a.el !== b.el, beforeChanged: a.before !== b.before, afterChanged: a.after !== b.after };
}
async function pixelDiff(page, rect, ms) {
  const A = await L.shot(page, null, { x: rect.l - 1, y: rect.t - 1, width: rect.w + 2, height: rect.h + 2 });
  await page.waitForTimeout(ms);
  const B = await L.shot(page, null, { x: rect.l - 1, y: rect.t - 1, width: rect.w + 2, height: rect.h + 2 });
  const pa = A.rect(rect.l, rect.r, rect.t, rect.b), pb = B.rect(rect.l, rect.r, rect.t, rect.b);
  let n = 0; for (let i = 0; i < pa.length; i++) if (L.dE(pa[i].c, pb[i].c) > 5) n++;
  return { changedPixels: n, of: pa.length };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'gaps = indicator rect to box rect (CSS px); rotation = computed transform at two instants + icon pixel diff; animations left running for the icon only', cases: {} };
  // global busy
  {
    const { ctx, page } = await openNoAnimExceptIcon(browser, 'loading.zul');
    await page.getByText('Show Busy', { exact: true }).first().click(); await page.waitForTimeout(700);
    const g = await geom(page, '.z-loading', '.z-loading-indicator', '.z-loading-icon', '.z-modal-mask');
    const S = await L.shot(page, 'rb71-global.png', { x: g.box.l - 30, y: g.box.t - 30, width: g.box.w + 60, height: g.box.h + 60 });
    const rec = { geom: g, ...judge(g, S), spin: await spin(page, '.z-loading-icon'), iconPixelDiff: await pixelDiff(page, g.icon, 260) };
    out.cases.global = rec; await ctx.close();
  }
  // component busy
  {
    const { ctx, page } = await openNoAnimExceptIcon(browser, 'loading.zul');
    await page.getByText('Show Busy', { exact: true }).nth(1).click(); await page.waitForTimeout(700);
    const g = await geom(page, '.z-apply-loading', '.z-apply-loading-indicator', '.z-apply-loading-icon', '.z-apply-mask');
    const S = await L.shot(page, 'rb71-component.png', { x: g.box.l - 30, y: g.box.t - 30, width: g.box.w + 60, height: g.box.h + 60 });
    const rec = { geom: g, ...judge(g, S), spin: await spin(page, '.z-apply-loading-icon'), iconPixelDiff: await pixelDiff(page, g.icon, 260) };
    // the component box centres on its target (demoWin): record the target rect too
    rec.target = await page.evaluate(() => { const w = zk.$('$demoWin'); const r = w.$n().getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; });
    rec.P71_d.boxCentreVsTarget = [+((g.box.l + g.box.r) / 2 - (rec.target.l + rec.target.r) / 2).toFixed(2), +((g.box.t + g.box.b) / 2 - (rec.target.t + rec.target.b) / 2).toFixed(2)];
    out.cases.component = rec; await ctx.close();
  }
  L.save('rb71.json', out);
  await browser.close();
  for (const [k, c] of Object.entries(out.cases)) console.log(k, JSON.stringify({ box: c.geom.box, ind: c.geom.ind, icon: c.geom.icon, text: c.geom.text, gaps: c.gaps, dV: c.dVertical, dH: c.dHorizontal, J71: c.J71_pass, P71_a: c.P71_a, P71_b: c.P71_b_static, spin: { el: c.spin.elChanged, before: c.spin.beforeChanged, after: c.spin.afterChanged, a: c.spin.a, b: c.spin.b }, px: c.iconPixelDiff, P71_c: c.P71_c, P71_d: c.P71_d, iconStyle: c.geom.iconStyle }));
})().catch(e => { console.error(e); process.exit(1); });
