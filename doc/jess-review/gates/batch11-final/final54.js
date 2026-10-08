// Batch 11 FINAL (copied from batch11-red/red54.js; output names changed; adds bottom-edge end samples, mid-edge dE and per-edge corner run per method item 5), #54 panel border="rounded": outer edge lines, corner pixels, shadow band, head separator for every panel on panel.zul.
// Judgments use pixels (CIE76 dE vs page background); root classes and computed border/radius are recorded for traceability.
const L = require('./lib.js'); const M = require('./m11.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const Rsrc = `(e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })`;
const f2 = v => v == null ? null : +(+v).toFixed(2);
async function panelsOf(page) {
  return page.evaluate((Rsrc) => { const R = eval(Rsrc); return [...document.querySelectorAll('.z-panel')].map((p, i) => { const w = zk.Widget.$(p); const cs = getComputedStyle(p); const head = p.querySelector(':scope > .z-panel-head'); const body = p.querySelector(':scope > .z-panel-body'); const title = p.querySelector('.z-panel-header'); let titleRng = null; if (title) { const tn = [...title.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (tn) { titleRng = document.createRange(); titleRng.selectNodeContents(tn); } } const icons = [...p.querySelectorAll('.z-panel-icon')]; const tbs = [...p.querySelectorAll('.z-toolbar')]; const ch = p.querySelector('.z-panelchildren'); const txt = ch && ch.firstChild;
    const rng = document.createRange(); if (txt) rng.selectNodeContents(txt);
    return { i, border: w.getBorder(), title: w.getTitle() || '', open: w.isOpen(), cls: p.className, rect: R(p), head: R(head), body: R(body), title_: R(titleRng), icons: icons.map(ic => ({ cls: ic.className, rect: R(ic) })), toolbars: tbs.map(t => R(t)), children: R(ch), childText: txt ? R(rng) : null,
      cs: { border: cs.border, borderRadius: cs.borderRadius, boxShadow: cs.boxShadow, bg: cs.backgroundColor, boxSizing: cs.boxSizing }, headBorderBottom: head ? getComputedStyle(head).borderBottom : null }; }); }, Rsrc);
}
// pixel scan of one panel: 4 outer edge lines (0.5px inside the box), 4 corner pixels, shadow band below, head separator
function scanPanel(S, p, bg) {
  const r = p.rect; const med = (x0, x1, y0, y1) => L.median(S.rect(x0, x1, y0, y1).map(q => q.c));
  const edges = { left: med(r.l, r.l, r.t + 10, r.b - 11), right: med(r.r - 1, r.r - 1, r.t + 10, r.b - 11), top: med(r.l + 10, r.r - 11, r.t, r.t), bottom: med(r.l + 10, r.r - 11, r.b - 1, r.b - 1) };
  const edgeDE = Object.fromEntries(Object.entries(edges).map(([k, c]) => [k, +L.dE(c, bg).toFixed(2)]));
  const corners = { tl: S.at(r.l * S.dpr, r.t * S.dpr), tr: S.at((r.r - 0.5) * S.dpr, r.t * S.dpr), bl: S.at(r.l * S.dpr, (r.b - 0.5) * S.dpr), br: S.at((r.r - 0.5) * S.dpr, (r.b - 0.5) * S.dpr) };
  const cornerDE = Object.fromEntries(Object.entries(corners).map(([k, c]) => [k, +L.dE(c, bg).toFixed(2)]));
  // how far in from the corner the edge line starts (radius evidence): walk the top row from the left until the pixel differs from bg
  let radiusRun = null; { const row = S.rect(r.l, r.l + 12, r.t, r.t); const first = row.find(q => L.dE(q.c, bg) >= 2); radiusRun = first ? f2(first.x - r.l) : null; }
  // FINAL additions (method item 5): where each edge line starts, walking in from every corner along the outer row/column (dE >= 2 vs bg)
  const runFrom = (pxs, key, origin, sign) => { const first = pxs.find(q => L.dE(q.c, bg) >= 2); return first ? f2(Math.abs(first[key] - origin)) : null; };
  const cornerRuns = {
    topFromLeft: runFrom(S.rect(r.l, r.l + 12, r.t, r.t), 'x', r.l), topFromRight: runFrom(S.rect(r.r - 12, r.r - 0.5, r.t, r.t).reverse(), 'x', r.r - 0.5),
    bottomFromLeft: runFrom(S.rect(r.l, r.l + 12, r.b - 1, r.b - 1), 'x', r.l), bottomFromRight: runFrom(S.rect(r.r - 12, r.r - 0.5, r.b - 1, r.b - 1).reverse(), 'x', r.r - 0.5),
    leftFromTop: runFrom(S.rect(r.l, r.l, r.t, r.t + 12), 'y', r.t), rightFromTop: runFrom(S.rect(r.r - 1, r.r - 1, r.t, r.t + 12), 'y', r.t) };
  // mid-segment of each edge (20px around the middle) and bottom edge sampled only at both ends (8px, starting 4px in from the corner so the radius does not bias it) — panel 1 has a footer toolbar line across the middle of its bottom edge
  const midY = Math.round((r.t + r.b) / 2), midX = Math.round((r.l + r.r) / 2);
  const mid = { left: med(r.l, r.l, midY - 10, midY + 10), right: med(r.r - 1, r.r - 1, midY - 10, midY + 10), top: med(midX - 10, midX + 10, r.t, r.t), bottom: med(midX - 10, midX + 10, r.b - 1, r.b - 1) };
  const midDE = Object.fromEntries(Object.entries(mid).map(([k, c]) => [k, +L.dE(c, bg).toFixed(2)]));
  const bottomEnds = { left: med(r.l + 4, r.l + 11, r.b - 1, r.b - 1), right: med(r.r - 12, r.r - 5, r.b - 1, r.b - 1) };
  const bottomEndsDE = { left: +L.dE(bottomEnds.left, bg).toFixed(2), right: +L.dE(bottomEnds.right, bg).toFixed(2) };
  const shadow = []; for (let d = 1; d <= 6; d++) { const c = med(r.l + 10, r.r - 11, r.b + d - 1, r.b + d - 1); shadow.push({ d, c, dE: +L.dE(c, bg).toFixed(2) }); }
  let headSep = null; if (p.head && p.head.h) { const rows = []; for (let y = p.head.b - 2; y <= p.head.b + 1; y++) { const c = med(r.l + 10, r.r - 11, y, y); rows.push({ y, c, dE: +L.dE(c, bg).toFixed(2) }); } headSep = rows; }
  return { edges, edgeDE, corners, cornerDE, radiusRun, cornerRuns, mid, midDE, bottomEnds, bottomEndsDE, shadow, headSep };
}
async function run(ctxOpts, tag) {
  const { ctx, page } = await L.open(ctxOpts.browser, 'panel.zul', ctxOpts.opts || {});
  const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const ps = await panelsOf(page); const res = [];
  for (const p of ps) {
    await page.evaluate((i) => { const n = document.querySelectorAll('.z-panel')[i]; window.scrollTo(0, n.getBoundingClientRect().top + window.scrollY - 40); }, p.i); await page.mouse.move(2, 2); await page.waitForTimeout(250);
    const q = (await panelsOf(page))[p.i];
    const S = await L.shot(page, `final54-${tag}-p${p.i}.png`, { x: q.rect.l - 12, y: q.rect.t - 12, width: q.rect.w + 24, height: q.rect.h + 24 });
    const bg = L.median(S.rect(q.rect.l - 10, q.rect.l - 4, q.rect.t + 10, q.rect.b - 10).map(x => x.c));
    const px = scanPanel(S, q, bg);
    // title / child text ink (protection c)
    const inkOf = (b) => b && b.w ? M.inkBox(S, b.l - 2, b.r + 2, b.t - 2, b.b + 2, bg, 8) : null;
    const titleInk = inkOf(q.title_); const childInk = inkOf(q.childText); const iconInks = q.icons.map(ic => ({ cls: ic.cls, ink: inkOf(ic.rect) }));
    res.push({ ...q, bgSample: bg, px, titleInk: titleInk && { l: titleInk.l, t: titleInk.t, w: titleInk.w, h: titleInk.h }, childInk: childInk && { l: childInk.l, t: childInk.t, w: childInk.w, h: childInk.h }, iconInks: iconInks.map(x => ({ cls: x.cls.replace(/z-panel-icon|z-icon-/g, '').trim(), ink: x.ink && { l: x.ink.l, t: x.ink.t, w: x.ink.w, h: x.ink.h } })) });
  }
  // Jess's view: the "Rounded Border - Full Controls" pair (panels 1 and 2)
  await page.evaluate(() => { const n = document.querySelectorAll('.z-panel')[1]; window.scrollTo(0, n.getBoundingClientRect().top + window.scrollY - 80); }); await page.mouse.move(2, 2); await page.waitForTimeout(250);
  const pair = await panelsOf(page); await L.shot(page, `final54-${tag}-jess-pair.png`, { x: pair[1].rect.l - 24, y: pair[1].rect.t - 60, width: pair[2].rect.r - pair[1].rect.l + 48, height: pair[1].rect.h + 90 });
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: L.OUT + `/final54-${tag}-page.png`, fullPage: true });
  await ctx.close(); return { pageBg, panels: res };
}
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  out.normal = await run({ browser }, 'normal');
  out.forced = await run({ browser, opts: { forcedColors: 'active' } }, 'forced');
  // window border modes on window.zul (record only): does Window have a rounded border mode?
  { const { ctx, page } = await L.open(browser, 'window.zul'); out.windowBorders = await page.evaluate(() => [...document.querySelectorAll('.z-window')].map(n => { const w = zk.Widget.$(n); const cs = getComputedStyle(n); return { cls: n.className, border: w.getBorder(), mode: w.getMode(), cssBorder: cs.border, radius: cs.borderRadius }; })); await ctx.close(); }
  await browser.close(); L.save('final54.json', out);
  for (const k of ['normal', 'forced']) { console.log('=== ' + k, 'pageBg', out[k].pageBg); for (const p of out[k].panels) console.log(p.i, p.border, JSON.stringify(p.title), 'open', p.open, '|', p.cls, '| rect', JSON.stringify(p.rect), 'head', JSON.stringify(p.head), 'body', JSON.stringify(p.body), '\n   cs', JSON.stringify(p.cs), 'headBB', p.headBorderBottom, '\n   bg', JSON.stringify(p.bgSample), 'edges', JSON.stringify(p.px.edges), 'edgeDE', JSON.stringify(p.px.edgeDE), 'corners', JSON.stringify(p.px.corners), 'cornerDE', JSON.stringify(p.px.cornerDE), 'radiusRun', p.px.radiusRun, '\n   cornerRuns', JSON.stringify(p.px.cornerRuns), 'mid', JSON.stringify(p.px.mid), 'midDE', JSON.stringify(p.px.midDE), 'bottomEnds', JSON.stringify(p.px.bottomEnds), 'bottomEndsDE', JSON.stringify(p.px.bottomEndsDE), '\n   shadow', JSON.stringify(p.px.shadow.map(s => [s.d, s.c.join(','), s.dE])), 'headSep', JSON.stringify(p.px.headSep && p.px.headSep.map(s => [s.y, s.c.join(','), s.dE])), '\n   titleInk', JSON.stringify(p.titleInk), 'childInk', JSON.stringify(p.childInk), 'icons', JSON.stringify(p.iconInks), 'toolbars', JSON.stringify(p.toolbars)); }
  console.log('=== windowBorders', JSON.stringify(out.windowBorders));
})();
