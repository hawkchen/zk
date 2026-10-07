// #78 judgments (D40-A) on the CURRENT code, compared with doc-scrollbar.json measured in the same session.
const L = require('./lib');
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
// measure the striped vertical thumb (axis v) or the biglist horizontal thumb (axis h) + groove around it
async function measure(page, zid, axis, file) {
  const g = await view(page, zid);
  const S = await L.shot(page, file, { x: g.box.l - 2, y: g.box.t - 2, width: g.box.w + 4, height: g.box.h + 4 });
  const blankX0 = Math.min(g.colsRight + 6, g.R - 60);
  const base = L.median(S.rect(blankX0, g.R - 20, g.B.t + 2, g.box.b - 16).map(p => p.c));
  const innerBottom = g.box.b - 1; // border-box bottom minus the 1px border (B.b overflows the border-box by 1px)
  const band = axis === 'v' ? { x0: g.R - BAND, x1: g.R - 1, y0: g.box.t + 1, y1: g.box.b - 2 } : { x0: g.B.l + 1, x1: g.R - BAND - 1, y0: innerBottom - BAND, y1: innerBottom - 1 };
  const t = L.scanThumb(S, band, base, axis, axis === 'v' ? g.R : innerBottom, 10);
  let groove = null;
  if (t.found) {
    const lo = axis === 'v' ? Math.max(g.B.t, t.top - 16) : Math.max(g.B.l, t.left - 16), hi = axis === 'v' ? Math.min(g.box.b - 2, t.bottom + 16) : Math.min(g.R - BAND - 1, t.right + 16);
    const above = axis === 'v' ? S.rect(band.x0, band.x1, lo, t.top - 2) : S.rect(lo, t.left - 2, band.y0, band.y1);
    const below = axis === 'v' ? S.rect(band.x0, band.x1, t.bottom + 2, hi) : S.rect(t.right + 2, hi, band.y0, band.y1);
    groove = { abovePx: above.length / (S.dpr * S.dpr), belowPx: below.length / (S.dpr * S.dpr), above: above.length ? L.worst(above, base) : null, below: below.length ? L.worst(below, base) : null,
      noteAbove: above.length ? '' : 'thumb starts at the body top; the lane above it is the header zone (not measured)' };
    groove.pass = (!groove.above || groove.above.dE <= 2) && (!groove.below || groove.below.dE <= 2);
  }
  return { g, base, thumb: t, groove, S };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { date: new Date().toISOString(), doc: { vertical: DOC.vertical, horizontal: DOC.horizontal, tokens: DOC.geometry.tokens } };
  let { page } = await L.open(browser, 'biglistbox.zul');
  const tok = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zk-color-outline-variant'));
  const v = await measure(page, 'stripedBiglist', 'v', 'red78-striped.png');
  const ov = parseColor(tok, v.base); out.outlineVariant = { raw: tok, overBase: ov };
  const D = DOC.vertical;
  out.striped_vertical = { base: v.base, thumb: { color: v.thumb.color, width: v.thumb.size, distanceToR: v.thumb.edgeDistance, rounded: v.thumb.rounded, top: v.thumb.top, bottom: v.thumb.bottom, left: v.thumb.left, right: v.thumb.right },
    j1: { dE_vs_doc: +L.dE(v.thumb.color, D.thumbColor).toFixed(2), dE_vs_outlineVariant: +L.dE(v.thumb.color, ov).toFixed(2) },
    j2: { diff: +Math.abs(v.thumb.size - D.width).toFixed(2) }, j3: { diff: +Math.abs(v.thumb.edgeDistance - D.distanceToInnerRight).toFixed(2) }, j4: v.thumb.rounded, j5: v.groove };
  out.striped_vertical.j1.pass = out.striped_vertical.j1.dE_vs_doc <= 3 && out.striped_vertical.j1.dE_vs_outlineVariant <= 3;
  out.striped_vertical.j2.pass = out.striped_vertical.j2.diff <= 1; out.striped_vertical.j3.pass = out.striped_vertical.j3.diff <= 1; out.striped_vertical.j4.pass = v.thumb.rounded.ok; out.striped_vertical.j5.pass = v.groove.pass;
  // j6: biglist horizontal
  const h = await measure(page, 'biglist', 'h', 'red78-biglist.png');
  out.biglist_horizontal = { base: h.base, thumb: { color: h.thumb.color, height: h.thumb.size, distanceToInnerBottom: h.thumb.edgeDistance, rounded: h.thumb.rounded, left: h.thumb.left, right: h.thumb.right, top: h.thumb.top, bottom: h.thumb.bottom },
    j1: { dE_vs_doc: +L.dE(h.thumb.color, D.thumbColor).toFixed(2), dE_vs_outlineVariant: +L.dE(h.thumb.color, parseColor(tok, h.base)).toFixed(2) },
    j2: { diff: +Math.abs(h.thumb.size - D.width).toFixed(2) }, j3: { diff: +Math.abs(h.thumb.edgeDistance - D.distanceToInnerRight).toFixed(2) }, j4: h.thumb.rounded, j5: h.groove };
  const bh = out.biglist_horizontal; bh.j1.pass = bh.j1.dE_vs_doc <= 3 && bh.j1.dE_vs_outlineVariant <= 3; bh.j2.pass = bh.j2.diff <= 1; bh.j3.pass = bh.j3.diff <= 1; bh.j4.pass = h.thumb.rounded.ok; bh.j5.pass = h.groove.pass;
  // hover colour (record only) — re-measure after scrolling back so the coordinates are current
  const v2 = await measure(page, 'stripedBiglist', 'v');
  const cx = (v2.thumb.left + v2.thumb.right) / 2, cy = (v2.thumb.top + v2.thumb.bottom) / 2;
  await page.mouse.move(cx, cy); await page.waitForTimeout(300);
  let S = await L.shot(page, null, { x: cx - 10, y: cy - 10, width: 20, height: 20 });
  out.hover_striped = { restColor: v2.thumb.color, hoverColor: S.at(cx * 2, cy * 2), dE_vs_rest: +L.dE(S.at(cx * 2, cy * 2), v2.thumb.color).toFixed(2) };
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  // token recolour (judgment: today expected to FAIL)
  await page.addStyleTag({ content: ':root{--zk-color-outline-variant: rgb(255, 0, 0) !important}' }); await page.waitForTimeout(200);
  const v3 = await measure(page, 'stripedBiglist', 'v', 'red78-token-red.png');
  out.tokenRecolour = { thumbColorAfter: v3.thumb.color, dE_vs_red: +L.dE(v3.thumb.color, [255, 0, 0]).toFixed(2), tokenNow: await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zk-color-outline-variant')) };
  out.tokenRecolour.pass = out.tokenRecolour.dE_vs_red <= 3;
  await page.context().close();
  // brand copper
  ({ page } = await L.open(browser, 'biglistbox.zul'));
  await page.evaluate(() => document.documentElement.setAttribute('data-brand', 'copper')); await page.waitForTimeout(300);
  const tokC = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zk-color-outline-variant'));
  const vc = await measure(page, 'stripedBiglist', 'v', 'red78-brand-copper.png');
  out.brandCopper = { outlineVariant: tokC, changedFromDefault: tokC.trim() !== tok.trim(), thumbColor: vc.thumb.color, expected: parseColor(tokC, vc.base), dE: +L.dE(vc.thumb.color, parseColor(tokC, vc.base)).toFixed(2) };
  out.brandCopper.pass = out.brandCopper.dE <= 3;
  await page.context().close();
  // forced colors (record only)
  ({ page } = await L.open(browser, 'biglistbox.zul', { forcedColors: 'active' }));
  const gf = await view(page, 'stripedBiglist');
  S = await L.shot(page, 'red78-forced-colors.png', { x: gf.box.l - 2, y: gf.box.t - 2, width: gf.box.w + 4, height: gf.box.h + 4 });
  const baseF = L.median(S.rect(gf.colsRight + 6, gf.R - 20, gf.B.t + 2, gf.box.b - 16).map(p => p.c));
  const tf = L.scanThumb(S, { x0: gf.R - BAND, x1: gf.R - 1, y0: gf.box.t + 1, y1: gf.box.b - 2 }, baseF, 'v', gf.R, 10);
  const dragRect = await page.evaluate(() => { const d = zk.$('$stripedBiglist').$n().querySelector('.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag').getBoundingClientRect(); return { l: d.left, t: d.top, r: d.right, b: d.bottom }; });
  const centre = S.at((dragRect.l + dragRect.r) / 2 * 2, (dragRect.t + dragRect.b) / 2 * 2);
  await page.goto(L.BASE + '/scrollbar.zul', { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
  const docFC = await page.evaluate(() => { const g = document.querySelectorAll('.z-grid')[1]; g.scrollIntoView({ block: 'center' }); const e = g.querySelector('.z-scrollbar-vertical-embed'); const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  await page.mouse.move(2, 2); await page.waitForTimeout(300);
  const Sd = await L.shot(page, null, { x: docFC.l - 20, y: docFC.t - 2, width: 30, height: docFC.b - docFC.t + 4 });
  const docCentre = Sd.at((docFC.l + docFC.r) / 2 * 2, (docFC.t + docFC.b) / 2 * 2), docSide = Sd.at((docFC.l - 15) * 2, (docFC.t + docFC.b) / 2 * 2);
  out.forcedColors_docRail = { railRect: docFC, pixelAtRailCentre: docCentre, pixelBeside: docSide, visible: L.dE(docCentre, docSide) >= 10 };
  out.forcedColors = { base: baseF, thumbFoundByPixels: tf.found, thumbPixels: tf.found ? { color: tf.color, top: tf.top, bottom: tf.bottom } : null, dragElementRect: dragRect, pixelAtDragCentre: centre, dE_centre_vs_base: +L.dE(centre, baseF).toFixed(2), visible: L.dE(centre, baseF) >= 10 };
  await browser.close();
  L.save('red78.json', out);
  const P = (n, ok, extra) => console.log(n.padEnd(40), ok ? 'PASS' : 'FAIL', extra || '');
  console.log('doc vertical:', JSON.stringify({ color: D.thumbColor, width: D.width, dist: D.distanceToInnerRight, rounded: D.rounded.ok }), 'outline-variant', tok.trim(), '->', JSON.stringify(ov));
  for (const k of ['striped_vertical', 'biglist_horizontal']) { const r = out[k];
    console.log(k, 'thumb', JSON.stringify(r.thumb));
    P(k + ' J1 colour', r.j1.pass, JSON.stringify(r.j1)); P(k + ' J2 size', r.j2.pass, JSON.stringify(r.j2)); P(k + ' J3 edge distance', r.j3.pass, JSON.stringify(r.j3)); P(k + ' J4 rounded', r.j4.pass, JSON.stringify(r.j4)); P(k + ' J5 no groove', r.j5.pass, JSON.stringify(r.j5)); }
  P('token recolour', out.tokenRecolour.pass, JSON.stringify(out.tokenRecolour)); P('brand copper', out.brandCopper.pass, JSON.stringify(out.brandCopper));
  console.log('hover (record):', JSON.stringify(out.hover_striped)); console.log('forcedColors (record):', JSON.stringify(out.forcedColors)); console.log('forcedColors doc rail (record):', JSON.stringify(out.forcedColors_docRail));
})();
