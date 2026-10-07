// Feasibility probes for the Generator brief: CSS injected IN-PAGE only (addStyleTag), nothing written to the repo.
// Question: can D39-A (lane not over the header, nothing drawn on a non-scrollable axis) and D40-A (doc rest-state look)
// be reached in pure CSS while zul.WScroll keeps positioning the thumb?
const L = require('./lib');
const BAND = 14;
const CSS = {
  // A: move the lane below the header (header is 39px here) — JS already offsets the thumb by head.offsetHeight
  A: '.z-biglistbox-wscroll-vertical{top:39px!important;height:calc(100% - 39px)!important}',
  // B: keep the lane where it is, but let hits fall through to the header; the thumb stays interactive
  B: '.z-biglistbox-wscroll-vertical,.z-biglistbox-wscroll-horizontal{pointer-events:none}.z-biglistbox-wscroll-drag{pointer-events:auto}',
  // D: lane paints nothing and is skipped by hit tests (visibility), the thumb re-enables visibility for itself
  D: '.z-biglistbox-wscroll-vertical,.z-biglistbox-wscroll-horizontal{visibility:hidden}.z-biglistbox-wscroll-drag{visibility:visible}',
  // E: documented rest look: outline-variant pill, flush with the inner edge, no groove
  E: '.z-biglistbox-wscroll-vertical::before,.z-biglistbox-wscroll-horizontal::before{content:none!important}'
   + '.z-biglistbox-wscroll-drag{background-color:var(--zk-color-outline-variant)!important}'
   + '.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag,.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-pos{left:6px!important}'
   + '.z-biglistbox-wscroll-horizontal .z-biglistbox-wscroll-drag,.z-biglistbox-wscroll-horizontal .z-biglistbox-wscroll-pos{top:4px!important}',
  // G: a different thumb length for BOTH -drag and -pos (keeps _gap = 0) — does the end clamp follow after a resize?
  G: '.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag,.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-pos{height:32px!important}',
};

async function view(page, zid) {
  await page.evaluate(zid => { const n = zk.$('$' + zid).$n(); n.scrollIntoView({ block: 'nearest' }); const b = n.getBoundingClientRect(); if (b.bottom > 890) window.scrollBy(0, b.bottom - 890); window.scrollTo(0, Math.round(window.scrollY)); }, zid);
  await page.mouse.move(2, 2); await page.waitForTimeout(250);
  return L.geom(page, zid);
}
// judgments (#31 J1 + corner/border-safe J2–J4, #78 thumb look) in one shot
async function judge(page, zid, file) {
  const g = await view(page, zid); const R = g.R, H = g.H, bx = g.box;
  const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const w = e && e.closest('[class*="wscroll"]'); return { cls: e && e.className, isWscroll: !!w }; }, [R - 7, (H.t + H.b) / 2]);
  const S = await L.shot(page, file, { x: bx.l - 2, y: bx.t - 2, width: bx.w + 4, height: bx.h + 4 });
  const blankX0 = Math.min(g.colsRight + 6, R - 60);
  const base = L.median(S.rect(blankX0, R - 20, g.B.t + 2, bx.b - 16).map(p => p.c));
  const corner = 10, notCorner = p => !((p.x > bx.r - 1 - corner && (p.y < bx.t + 1 + corner || p.y > bx.b - 1 - corner)) || (p.x < bx.l + 1 + corner && p.y > bx.b - 1 - corner));
  const ref2 = L.median(S.rect(R - 34, R - 21, H.t + 2, H.b - 2).map(p => p.c));
  const j2 = L.worst(S.rect(R - BAND, R - 1, H.t + 2, H.b - 2).filter(notCorner), ref2);
  const j3 = L.worst(S.rect(R - BAND, R - 1, bx.t + 1, bx.b - 2).filter(notCorner), base);
  const j4 = L.worst(S.rect(blankX0, R - BAND - 1, bx.b - 1 - BAND, bx.b - 2).filter(notCorner), base);
  const v = L.scanThumb(S, { x0: R - BAND, x1: R - 1, y0: bx.t + 1, y1: bx.b - 2 }, base, 'v', R, 8);
  const h = L.scanThumb(S, { x0: g.B.l + 1, x1: R - BAND - 1, y0: bx.b - 1 - BAND, y1: bx.b - 2 }, base, 'h', bx.b - 1, 8);
  const groove = v.found ? L.worst(S.rect(R - BAND, R - 1, v.bottom + 2, Math.min(bx.b - 2, v.bottom + 16)), base) : null;
  const strip = t => t.found ? { color: t.color, size: t.size, edgeDistance: t.edgeDistance, rounded: t.rounded.ok, top: t.top, bottom: t.bottom, left: t.left, right: t.right } : { found: false };
  return { g: { boxT: bx.t, Bt: g.B.t, Bb: g.B.b, boxB: bx.b, R }, j1: { pass: !hit.isWscroll, cls: hit.cls }, j2: { pass: j2.dE <= 2, dE: j2.dE }, j3: { pass: j3.dE <= 2, dE: j3.dE }, j4: { pass: j4.dE <= 2, dE: j4.dE }, vThumb: strip(v), hThumb: strip(h), grooveBelow: groove && { pass: groove.dE <= 2, dE: groove.dE } };
}
const curY = (page, zid) => page.evaluate(zid => zk.$('$' + zid)._currentY, zid);
const thumbTop = async (page, zid) => { const j = await judge(page, zid); return j.vThumb.found === false ? null : j.vThumb.top - j.g.boxT; };
// does the vertical bar still work: wheel one step, drag 40px, wheel to the end and check the clamp
async function works(page, zid) {
  const g = await view(page, zid); const y0 = await curY(page, zid); const t0 = await thumbTop(page, zid);
  await page.mouse.move((g.B.l + g.R) / 2 - 100, (g.B.t + g.B.b) / 2); await page.mouse.wheel(0, 120); await L.settle(page);
  const y1 = await curY(page, zid); const t1 = await thumbTop(page, zid);
  let last = null; for (let i = 0; i < 40; i++) { await page.mouse.move((g.B.l + g.R) / 2 - 100, (g.B.t + g.B.b) / 2); for (let j = 0; j < 10; j++) await page.mouse.wheel(0, 120); await L.settle(page); const c = await curY(page, zid); if (c === last) break; last = c; }
  const jb = await judge(page, zid); const yEnd = await curY(page, zid);
  for (let i = 0; i < 40; i++) { await page.mouse.move((jb.g.R + g.B.l) / 2 - 100, (jb.g.Bt + jb.g.Bb) / 2); for (let j = 0; j < 10; j++) await page.mouse.wheel(0, -120); await L.settle(page); if ((await curY(page, zid)) === 0) break; }
  const j0 = await judge(page, zid); let drag = { skipped: true };
  if (j0.vThumb.found !== false) {
    const cx = (j0.vThumb.left + j0.vThumb.right) / 2, cy = (j0.vThumb.top + j0.vThumb.bottom) / 2; const yb = await curY(page, zid);
    const hitEl = await page.evaluate(([x, y]) => document.elementFromPoint(x, y).className, [cx, cy]);
    await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(cx, cy + 5 * i); await page.waitForTimeout(40); } await page.mouse.up(); await L.settle(page);
    drag = { hitEl, yBefore: yb, yAfter: await curY(page, zid) }; drag.pass = drag.yAfter > drag.yBefore;
  }
  return { wheel: { y0, y1, pass: y1 > y0 && t1 !== null && t0 !== null && t1 > t0, thumbTopRel0: t0, thumbTopRel1: t1 }, clamp: { yEnd, thumb: jb.vThumb, Bt: jb.g.Bt, Bb: jb.g.Bb, pass: jb.vThumb.found !== false && jb.vThumb.top >= jb.g.Bt && jb.vThumb.bottom <= jb.g.Bb }, drag };
}
const onSize = async (page) => { await page.setViewportSize({ width: 1279, height: 900 }); await page.waitForTimeout(300); await page.setViewportSize({ width: 1280, height: 900 }); await L.settle(page); };

(async () => {
  const browser = await L.chromium.launch();
  const out = { date: new Date().toISOString(), codeReading: {
    laneGeometry: 'pure CSS — WScroll.redraw() only appends the lane div with its class; syncSize()/wheel/drag write inline styles on -drag (display, top/left), -pos (display, top/left, height/width) and -endbar (display, top/left) only. Biglistbox.ts never touches the lane either.',
    thumbPosition: 'JS: edrag.style.top = startPosition + scale*step, startPosition = head.offsetHeight (bind_ and every onSize) → the thumb is already offset below the header, relative to the lane top. Moving the lane down by CSS double-offsets the thumb (probe A).',
    thumbSize: 'CSS height/width of -drag is READ by JS (edrag.offsetHeight − _gap) for the scale and the end-stop; _gap = edrag − epos size measured once in _initDragdrop (both 48px in Marble → 0). The end-stop (-endbar top) is recomputed on each syncSize (load, onSize, scroll).',
    hideWhenFits: 'JS sets display:none on -drag and -endbar when rest <= 0 (syncSize) but leaves the lane div display:block. Wheel listeners are on the body element, not the lane.' } };
  const run = async (name, css, pages) => { const r = {}; for (const [pg, zids, doWorks] of pages) { const { page } = await L.open(browser, pg); await page.addStyleTag({ content: css }); await page.waitForTimeout(200); for (const zid of zids) { r[zid] = { judge: await judge(page, zid, `feas-${name}-${zid}.png`) }; if (doWorks) r[zid].works = await works(page, zid); } r[pages[0][0] + ':afterOnSize'] = {}; await onSize(page); for (const zid of zids) r[zid].afterOnSize = await judge(page, zid); await page.context().close(); } out[name] = r; console.log(name, JSON.stringify(r)); };
  const P1 = [['biglistbox.zul', ['stripedBiglist'], true]];
  const P2 = [['biglistbox.zul', ['stripedBiglist', 'biglist'], true], ['biglistbox-fits.zul', ['fitsBiglist'], false]];
  await run('A_laneBelowHeader', CSS.A, P1);
  await run('B_pointerEvents', CSS.B, P1);
  await run('D_visibility', CSS.D, P2);
  await run('E_docLook', CSS.E, P1);
  await run('F_D_plus_E', CSS.D + CSS.E, P2);
  await run('G_thumb32_D_E', CSS.D + CSS.E + CSS.G, P1);
  // D: a non-scrollable axis becoming scrollable after a resize (striped: 650px of columns, shrink the window to 600px)
  { const { page } = await L.open(browser, 'biglistbox.zul'); await page.addStyleTag({ content: CSS.D + CSS.E });
    const before = await judge(page, 'stripedBiglist');
    await page.setViewportSize({ width: 600, height: 900 }); await L.settle(page); await page.waitForTimeout(300);
    const g = await view(page, 'stripedBiglist');
    const S = await L.shot(page, 'feas-D-resize600.png', { x: g.box.l - 2, y: g.box.t - 2, width: g.box.w + 4, height: g.box.h + 4 });
    const base = [255, 255, 255];
    const h = L.scanThumb(S, { x0: g.B.l + 1, x1: g.R - BAND - 1, y0: g.box.b - 1 - BAND, y1: g.box.b - 2 }, base, 'h', g.box.b - 1, 8);
    const x0 = await page.evaluate(() => zk.$('$stripedBiglist')._currentX);
    await page.mouse.move((g.B.l + g.R) / 2, (g.B.t + g.B.b) / 2); await page.mouse.wheel(120, 0); await L.settle(page);
    const x1 = await page.evaluate(() => zk.$('$stripedBiglist')._currentX);
    await page.setViewportSize({ width: 1280, height: 900 }); await L.settle(page); await page.waitForTimeout(300);
    const after = await judge(page, 'stripedBiglist');
    out.D_resizeShowsHiddenAxis = { before_hThumb: before.hThumb, at600_hThumb: h.found ? { color: h.color, size: h.size, left: h.left, right: h.right, edgeDistance: h.edgeDistance } : { found: false }, wheelX: { x0, x1, pass: x1 > x0 }, back1280_hThumb: after.hThumb, back1280_j4: after.j4 };
    console.log('D_resizeShowsHiddenAxis', JSON.stringify(out.D_resizeShowsHiddenAxis)); await page.context().close(); }
  await browser.close();
  L.save('feas.json', out);
})();
