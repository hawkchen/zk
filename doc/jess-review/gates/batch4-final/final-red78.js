// r2: #78 judgments (D40-A) with the Planner's method corrections 3–5:
//  - no brand-colour item;
//  - judgment 6 (horizontal) "distance to bottom" measured against the visible inner bottom edge (box.bottom-1), ±1px;
//  - judgment 2 (width) and judgment 4 (rounded) are protections (already matching);
//  - judgment 5 groove: thumb-below area (the area above the vertical thumb is the header zone, not measured);
//  - reference = doc-scrollbar.json from the first run (re-measured by final-doc-scrollbar.js and confirmed unchanged).
const L = require('./final-lib');
const fs = require('fs'); const path = require('path');
const DOC = JSON.parse(fs.readFileSync(path.join(__dirname, 'doc-scrollbar.json'), 'utf8'));
const BAND = 14;

function parseColor(s, base) { s = s.trim(); let rgba;
  if (s[0] === '#') { const h = s.slice(1); const n = h.length <= 4 ? h.split('').map(c => c + c).join('') : h; rgba = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16)); rgba.push(n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1); }
  else rgba = L.parseRgb(s);
  return L.over(rgba, base); }

async function view(page, zid) {
  await page.evaluate(zid => { const n = zk.$('$' + zid).$n(); n.scrollIntoView({ block: 'nearest' }); const b = n.getBoundingClientRect(); if (b.bottom > 890) window.scrollBy(0, b.bottom - 890); }, zid);
  await page.mouse.move(2, 2); await page.waitForTimeout(250);
  return L.geom(page, zid);
}
// striped vertical thumb (axis v) or biglist horizontal thumb (axis h) + groove beside it
async function measure(page, zid, axis, file) {
  const g = await view(page, zid);
  const S = await L.shot(page, file, { x: g.box.l - 2, y: g.box.t - 2, width: g.box.w + 4, height: g.box.h + 4 });
  const blankX0 = Math.min(g.colsRight + 6, g.R - 60);
  const base = L.median(S.rect(blankX0, g.R - 20, g.B.t + 2, g.box.b - 16).map(p => p.c));
  const innerBottom = g.box.b - 1; // visible inner bottom edge = border-box bottom minus the 1px border (correction 4)
  const band = axis === 'v' ? { x0: g.R - BAND, x1: g.R - 1, y0: g.box.t + 1, y1: g.box.b - 2 } : { x0: g.B.l + 1, x1: g.R - BAND - 1, y0: innerBottom - BAND, y1: innerBottom - 1 };
  const t = L.scanThumb(S, band, base, axis, axis === 'v' ? g.R : innerBottom, 10);
  let groove = null;
  if (t.found) {
    // judgment 5: the area beyond the thumb along the lane (below for v, right of it for h), >= 8px, 2px gap from the thumb edge
    const hi = axis === 'v' ? Math.min(g.box.b - 2, t.bottom + 16) : Math.min(g.R - BAND - 1, t.right + 16);
    const beyond = axis === 'v' ? S.rect(band.x0, band.x1, t.bottom + 2, hi) : S.rect(t.right + 2, hi, band.y0, band.y1);
    const beforeLen = axis === 'v' ? t.top - g.B.t : t.left - g.B.l; // room before the thumb inside the body (header zone / left edge excluded)
    groove = { beyondPx: beyond.length / (S.dpr * S.dpr), beyond: L.worst(beyond, base), roomBeforeThumbPx: beforeLen,
      note: axis === 'v' ? 'area above the thumb is the header zone (thumb starts at B.top): not measured (correction 5)' : 'area left of the thumb is < 2px (thumb starts at B.left): not measured' };
    groove.pass = groove.beyond.dE <= 2;
  }
  return { g, base, thumb: t, groove, S, innerBottom };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { date: new Date().toISOString(), doc: { vertical: DOC.vertical, horizontal: DOC.horizontal, tokens: DOC.geometry.tokens } };
  let { page } = await L.open(browser, 'biglistbox.zul');
  const tok = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zk-color-outline-variant'));
  const D = DOC.vertical;
  const judge = (m, edgeName) => {
    const r = { base: m.base, thumb: { color: m.thumb.color, size: m.thumb.size, [edgeName]: m.thumb.edgeDistance, rounded: m.thumb.rounded, top: m.thumb.top, bottom: m.thumb.bottom, left: m.thumb.left, right: m.thumb.right },
      j1: { dE_vs_doc: +L.dE(m.thumb.color, D.thumbColor).toFixed(2), dE_vs_outlineVariant: +L.dE(m.thumb.color, parseColor(tok, m.base)).toFixed(2) },
      j2_protection: { diff: +Math.abs(m.thumb.size - D.width).toFixed(2) }, j3: { measured: m.thumb.edgeDistance, doc: D.distanceToInnerRight, diff: +Math.abs(m.thumb.edgeDistance - D.distanceToInnerRight).toFixed(2) },
      j4_protection: m.thumb.rounded, j5: m.groove };
    r.j1.pass = r.j1.dE_vs_doc <= 3 && r.j1.dE_vs_outlineVariant <= 3; r.j2_protection.pass = r.j2_protection.diff <= 1; r.j3.pass = r.j3.diff <= 1; r.j4_protection.pass = m.thumb.rounded.ok; r.j5.pass = m.groove.pass;
    return r; };
  const v = await measure(page, 'stripedBiglist', 'v', 'final-red78-striped.png');
  out.outlineVariant = { raw: tok.trim(), overBase: parseColor(tok, v.base) };
  out.striped_vertical = judge(v, 'distanceToR');
  // j6: biglist horizontal (1–5 with height for width, distance to the visible inner bottom edge for distance to R)
  const h = await measure(page, 'biglist', 'h', 'final-red78-biglist.png');
  out.biglist_horizontal_j6 = judge(h, 'distanceToInnerBottom'); out.biglist_horizontal_j6.innerBottom = h.innerBottom; out.biglist_horizontal_j6.Bb = h.g.B.b; out.biglist_horizontal_j6.boxB = h.g.box.b;
  out.biglist_horizontal_j6.j3.vsBodyOuterBottom_info = +(h.g.B.b - h.thumb.bottom).toFixed(2);
  // hover colour (record only)
  const v2 = await measure(page, 'stripedBiglist', 'v');
  const cx = (v2.thumb.left + v2.thumb.right) / 2, cy = (v2.thumb.top + v2.thumb.bottom) / 2;
  await page.mouse.move(cx, cy); await page.waitForTimeout(300);
  let S = await L.shot(page, null, { x: cx - 10, y: cy - 10, width: 20, height: 20 });
  out.hover_striped_record = { restColor: v2.thumb.color, hoverColor: S.at(cx * 2, cy * 2), dE_vs_rest: +L.dE(S.at(cx * 2, cy * 2), v2.thumb.color).toFixed(2) };
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  // token recolour (judgment: today expected to FAIL)
  await page.addStyleTag({ content: ':root{--zk-color-outline-variant: rgb(255, 0, 0) !important}' }); await page.waitForTimeout(200);
  const v3 = await measure(page, 'stripedBiglist', 'v', 'final-red78-token-red.png');
  out.tokenRecolour = { thumbColorAfter: v3.thumb.color, dE_vs_red: +L.dE(v3.thumb.color, [255, 0, 0]).toFixed(2), tokenNow: (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zk-color-outline-variant'))).trim() };
  out.tokenRecolour.pass = out.tokenRecolour.dE_vs_red <= 3;
  await page.context().close();
  // forced colors (record only)
  ({ page } = await L.open(browser, 'biglistbox.zul', { forcedColors: 'active' }));
  const gf = await view(page, 'stripedBiglist');
  S = await L.shot(page, 'final-red78-forced-colors.png', { x: gf.box.l - 2, y: gf.box.t - 2, width: gf.box.w + 4, height: gf.box.h + 4 });
  const baseF = L.median(S.rect(gf.colsRight + 6, gf.R - 20, gf.B.t + 2, gf.box.b - 16).map(p => p.c));
  const tf = L.scanThumb(S, { x0: gf.R - BAND, x1: gf.R - 1, y0: gf.box.t + 1, y1: gf.box.b - 2 }, baseF, 'v', gf.R, 10);
  const dragRect = await page.evaluate(() => { const d = zk.$('$stripedBiglist').$n().querySelector('.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag').getBoundingClientRect(); return { l: d.left, t: d.top, r: d.right, b: d.bottom }; });
  const centre = S.at((dragRect.l + dragRect.r) / 2 * 2, (dragRect.t + dragRect.b) / 2 * 2);
  await page.goto(L.BASE + '/scrollbar.zul', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  const docFC = await page.evaluate(() => { const g = document.querySelectorAll('.z-grid')[1]; g.scrollIntoView({ block: 'center' }); const e = g.querySelector('.z-scrollbar-vertical-embed'); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  await page.mouse.move(2, 2); await page.waitForTimeout(300);
  const Sd = await L.shot(page, null, { x: docFC.l - 20, y: docFC.t - 2, width: 30, height: docFC.b - docFC.t + 4 });
  const docCentre = Sd.at((docFC.l + docFC.r) / 2 * 2, (docFC.t + docFC.b) / 2 * 2), docSide = Sd.at((docFC.l - 15) * 2, (docFC.t + docFC.b) / 2 * 2);
  out.forcedColors_record = { base: baseF, thumbFoundByPixels: tf.found, dragElementRect: dragRect, pixelAtDragCentre: centre, dE_centre_vs_base: +L.dE(centre, baseF).toFixed(2), visible: L.dE(centre, baseF) >= 10,
    docRail: { railRect: docFC, pixelAtRailCentre: docCentre, pixelBeside: docSide, visible: L.dE(docCentre, docSide) >= 10 } };
  await browser.close();
  L.save('final-red78.json', out);
  const P = (n, ok, extra) => console.log(n.padEnd(44), ok ? 'PASS' : 'FAIL', extra || '');
  console.log('doc vertical:', JSON.stringify({ color: D.thumbColor, width: D.width, dist: D.distanceToInnerRight, rounded: D.rounded.ok }), 'outline-variant', out.outlineVariant.raw, '->', JSON.stringify(out.outlineVariant.overBase));
  for (const k of ['striped_vertical', 'biglist_horizontal_j6']) { const r = out[k];
    console.log(k, 'thumb', JSON.stringify(r.thumb));
    P(k + ' J1 colour', r.j1.pass, JSON.stringify(r.j1)); P(k + ' J2 size (protection)', r.j2_protection.pass, JSON.stringify(r.j2_protection)); P(k + ' J3 edge distance', r.j3.pass, JSON.stringify(r.j3)); P(k + ' J4 rounded (protection)', r.j4_protection.pass, JSON.stringify(r.j4_protection)); P(k + ' J5 no groove', r.j5.pass, JSON.stringify(r.j5)); }
  P('token recolour', out.tokenRecolour.pass, JSON.stringify(out.tokenRecolour));
  console.log('hover (record):', JSON.stringify(out.hover_striped_record)); console.log('forcedColors (record):', JSON.stringify(out.forcedColors_record));
})();
