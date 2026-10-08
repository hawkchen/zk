// Batch 11 RED, #55 window move ghost (#zk_wndghost): title ink darkness idle vs dragging, ghost opacity tree, outline, geometry, see-through, drop position.
// Also: the same drag on a panel (panel.zul has no draggable panel; one is made floatable at runtime through the widget API, no file change).
const L = require('./lib.js'); const M = require('./m11.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const Rsrc = `(e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })`;
const f2 = v => v == null ? null : +(+v).toFixed(2);
const ib = b => b ? { l: b.l, t: b.t, w: b.w, h: b.h, darkest: b.darkest } : null;
async function wndInfo(page, idx) {
  return page.evaluate(({ idx, Rsrc }) => { const R = eval(Rsrc); const n = document.querySelectorAll('.z-window')[idx]; const w = zk.Widget.$(n); const head = n.querySelector(':scope > .z-window-header'); const title = head && ([...head.childNodes].find(c => c.nodeType === 3 && c.textContent.trim()) || head.querySelector('.z-window-header-title')); let titleRect = null; if (title) { const rng = document.createRange(); if (title.nodeType === 3) rng.selectNodeContents(title); else rng.selectNodeContents(title); titleRect = R(rng); }
    const cs = getComputedStyle(n); return { idx, cls: n.className, uuid: n.id, border: w.getBorder(), mode: w.getMode(), rect: R(n), head: R(head), headCls: head && head.className, titleRect, headKids: head ? [...head.childNodes].map(c => c.nodeType === 3 ? '#text(' + c.textContent.trim() + ')' : c.tagName + '.' + c.className) : [], cs: { visibility: cs.visibility, opacity: cs.opacity, z: cs.zIndex, left: cs.left, top: cs.top, bg: cs.backgroundColor } }; }, { idx, Rsrc });
}
async function ghostInfo(page, sel) {
  return page.evaluate(({ sel, Rsrc }) => { const R = eval(Rsrc); const g = document.querySelector(sel); if (!g) return null; const cs = getComputedStyle(g);
    const tree = []; const walk = (e, d) => { const c = getComputedStyle(e); tree.push({ d, tag: e.tagName, cls: e.className, opacity: c.opacity, visibility: c.visibility, bg: c.backgroundColor, color: c.color, rect: R(e), text: e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) ? [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('|') : '' }); for (const k of e.children) walk(k, d + 1); }; walk(g, 0);
    const title = [...g.querySelectorAll('*')].map(e => [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim())).find(Boolean); let titleRect = null; if (title) { const rng = document.createRange(); rng.selectNodeContents(title); titleRect = R(rng); }
    return { id: g.id, cls: g.className, rect: R(g), style: g.getAttribute('style'), cs: { opacity: cs.opacity, outline: cs.outline, outlineColor: cs.outlineColor, outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle, outlineOffset: cs.outlineOffset, bg: cs.backgroundColor, z: cs.zIndex, position: cs.position, visibility: cs.visibility, boxShadow: cs.boxShadow, border: cs.border }, titleRect, tree, nonOne: tree.filter(t => t.opacity !== '1').map(t => t.tag + '.' + t.cls + '=' + t.opacity) }; }, { sel, Rsrc });
}
// drag the head of a window/panel by (dx,dy) and keep the button down; returns ghost info + screenshots
async function dragHold(page, headRect, grab, dx, dy, tag, ghostSel) {
  const x0 = headRect.l + grab[0], y0 = headRect.t + grab[1];
  await page.mouse.move(x0, y0); await page.waitForTimeout(100); await page.mouse.down(); await page.waitForTimeout(80);
  for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + dx * i / 8, y0 + dy * i / 8); await page.waitForTimeout(40); }
  await page.waitForTimeout(300);
  const ghost = await ghostInfo(page, ghostSel);
  const anyGhost = await page.evaluate(() => [...document.querySelectorAll('[class*="move-ghost"], #zk_wndghost, #zk_ddghost')].map(e => e.id + '.' + e.className));
  await page.screenshot({ path: L.OUT + `/red55-${tag}-dragging-page.png` });
  return { ghost, anyGhost, pointer: [x0 + dx, y0 + dy] };
}
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  // which window is Jess's: no border, overlapped, position right,top
  const { ctx: c0, page: p0 } = await L.open(browser, 'window.zul');
  const all = await p0.evaluate(() => [...document.querySelectorAll('.z-window')].map((n, i) => ({ i, cls: n.className, mode: zk.Widget.$(n).getMode(), border: zk.Widget.$(n).getBorder(), top: n.getBoundingClientRect().top, left: n.getBoundingClientRect().left })));
  out.windows = all; await c0.close();
  const targets = [{ tag: 'jess', idx: all.find(w => w.mode === 'overlapped' && w.border === 'none').i }, { tag: 'normal', idx: all.find(w => w.mode === 'overlapped' && w.border === 'normal').i }];
  for (const T of targets) for (const forced of [false, true]) for (const mode of (forced ? ['blank'] : ['blank', 'content'])) {
    // blank: ghost ends over an empty white area (clean title-ink numbers); content: ghost ends over the embedded "With Title" windows (see-through evidence)
    const tag = T.tag + (forced ? '-forced' : '') + '-' + mode;
    const { ctx, page } = await L.open(browser, 'window.zul', forced ? { forcedColors: 'active' } : {});
    const w = await wndInfo(page, T.idx);
    // idle: title ink darkest, header base colour, interior sample
    const S0 = await L.shot(page, `red55-${tag}-idle.png`, { x: w.rect.l - 16, y: Math.max(0, w.rect.t - 16), width: w.rect.w + 32, height: w.rect.h + 32 });
    const headBase = L.median(S0.rect(w.head.l + 4, w.head.l + 8, w.head.t + 4, w.head.b - 5).map(p => p.c));
    const idleTitle = M.inkBox(S0, w.titleRect.l - 2, w.titleRect.r + 2, w.titleRect.t - 2, w.titleRect.b + 2, headBase, 8);
    const idleTitleTopDE = idleTitle ? +L.dE(idleTitle.darkest, headBase).toFixed(2) : null;
    // drag: grab the title text area (left part of the header, away from the buttons)
    const grab = [Math.min(60, w.head.w / 4), w.head.h / 2]; const dx = mode === 'content' ? -600 : -80, dy = mode === 'content' ? (T.tag === 'jess' ? 440 : -280) : (T.tag === 'jess' ? 120 : -200);
    const Sfull0 = await L.shot(page, `red55-${tag}-idle-page.png`);
    const D = await dragHold(page, w.head, grab, dx, dy, tag, '#zk_wndghost');
    const during = await wndInfo(page, T.idx);
    let ghostPx = null;
    if (D.ghost) { const g = D.ghost.rect; const S1 = await L.shot(page, `red55-${tag}-ghost.png`, { x: g.l - 16, y: g.t - 16, width: g.w + 32, height: g.h + 32 });
      const tr = D.ghost.titleRect; const gHead = D.ghost.tree.find(t => /header/.test(t.cls)) || D.ghost.tree[0];
      const gBase = L.median(S1.rect(gHead.rect.l + 4, gHead.rect.l + 8, gHead.rect.t + 4, gHead.rect.b - 5).map(p => p.c));
      const gTitle = tr ? M.inkBox(S1, tr.l - 2, tr.r + 2, tr.t - 2, tr.b + 2, gBase, 4) : null;
      // outline: the pixel band 2px inside the ghost box (outline-offset -2px) on the left edge, middle height
      const outlineL = L.median(S1.rect(g.l, g.l + 1, g.t + g.h * 0.6, g.t + g.h * 0.6 + 20).map(p => p.c)); const outlineL_idle = L.median(Sfull0.rect(g.l, g.l + 1, g.t + g.h * 0.6, g.t + g.h * 0.6 + 20).map(p => p.c));
      const outlineT = L.median(S1.rect(g.l + g.w * 0.5, g.l + g.w * 0.5 + 20, g.t, g.t + 1).map(p => p.c));
      const pts = []; for (let i = 1; i <= 5; i++) for (let j = 1; j <= 3; j++) { const x = g.l + 10 + (g.w - 20) * (i - 1) / 4, y = gHead.rect.b + 8 + (g.b - gHead.rect.b - 16) * (j - 1) / 2; pts.push({ x: +x.toFixed(1), y: +y.toFixed(1), drag: S1.at(x * 2, y * 2), idle: Sfull0.at(x * 2, y * 2) }); }
      const inter = pts.map(p => ({ ...p, dE: +L.dE(p.drag, p.idle).toFixed(2) }));
      const through = (x0, x1, y0, y1) => { const idle = Sfull0.rect(x0, x1, y0, y1); const dark = idle.filter(q => q.c[0] + q.c[1] + q.c[2] < 600); if (!dark.length) return { n: 0 }; const pairs = dark.map(q => ({ idle: q.c, drag: S1.at(q.dx, q.dy) })); const mean = arr => [0, 1, 2].map(i => Math.round(arr.reduce((a, c) => a + c[i], 0) / arr.length)); const mi = mean(pairs.map(p => p.idle)), md = mean(pairs.map(p => p.drag)); return { n: dark.length, idleMean: mi, dragMean: md, dE: +L.dE(mi, md).toFixed(2), dragDarkest: pairs.reduce((a, p) => (p.drag[0] + p.drag[1] + p.drag[2] < a[0] + a[1] + a[2] ? p.drag : a), [255, 255, 255]), expectedHalf: L.over([255, 255, 255, 0.5], mi) }; };
      const showThrough = { headerBand: through(g.l + 4, g.l + g.w * 0.45, gHead.rect.t + 4, gHead.rect.b - 4), interiorBand: through(g.l + 4, g.r - 4, gHead.rect.b + 4, Math.min(g.b - 4, 899)) }; const headPts = []; for (let i = 1; i <= 5; i++) { const x = g.l + 10 + (g.w - 20) * (i - 1) / 4, y = gHead.rect.t + 6; headPts.push({ x: +x.toFixed(1), y, drag: S1.at(x * 2, y * 2), idle: Sfull0.at(x * 2, y * 2), dE_vs_idle: +L.dE(S1.at(x * 2, y * 2), Sfull0.at(x * 2, y * 2)).toFixed(2), dE_vs_white: +L.dE(S1.at(x * 2, y * 2), [255, 255, 255]).toFixed(2) }); }
      // see-through: compare the ghost's interior (below the header) with the same viewport pixels when idle (S0 covers only the idle window; take a fresh idle shot of the ghost area after mouse up instead) -> done after drop
      ghostPx = { gBase, gTitle: ib(gTitle), gTitleDarkest: gTitle && gTitle.darkest, dE_title_idle_vs_ghost: gTitle && idleTitle ? +L.dE(gTitle.darkest, idleTitle.darkest).toFixed(2) : null, dE_title_ghost_vs_base: gTitle ? +L.dE(gTitle.darkest, gBase).toFixed(2) : null, outlineL, outlineL_idle, outlineT, outlineL_dE_idle: +L.dE(outlineL, outlineL_idle).toFixed(2), outlineExpected: L.over([55, 111, 208, 0.5], outlineL_idle), showThrough, interior: inter, interiorMaxDE: Math.max(...inter.map(p => p.dE)), interiorMeanDE: +(inter.reduce((a, p) => a + p.dE, 0) / inter.length).toFixed(2), header: headPts, interiorSample: L.median(S1.rect(g.l + 20, g.l + 60, gHead.rect.b + 10, g.b - 10).map(p => p.c)) }; }
    // drop
    await page.mouse.up(); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(400);
    const after = await wndInfo(page, T.idx);
    const S2 = await L.shot(page, `red55-${tag}-dropped.png`, { x: after.rect.l - 16, y: Math.max(0, after.rect.t - 16), width: after.rect.w + 32, height: after.rect.h + 32 });
    // see-through evidence: pixels inside the former ghost interior now (window sits there, opaque) vs during drag
    let seeThrough = null; if (D.ghost && ghostPx) { const g = D.ghost.rect; const gHead = D.ghost.tree.find(t => /header/.test(t.cls)) || D.ghost.tree[0]; const nowInterior = L.median(S2.rect(g.l + 20, g.l + 60, gHead.rect.b + 10, g.b - 10).map(p => p.c)); seeThrough = { duringDrag: ghostPx.interiorSample, afterDrop: nowInterior }; }
    out[tag] = { window: w, headBase, idleTitle: ib(idleTitle), idleTitleTopDE, drag: { grab, dx, dy, pointer: D.pointer }, ghost: D.ghost, anyGhost: D.anyGhost, duringWindow: { visibility: during.cs.visibility, rect: during.rect }, ghostPx, after: { rect: after.rect, cs: after.cs }, dropDelta: D.ghost ? { dx: f2(after.rect.l - D.ghost.rect.l), dy: f2(after.rect.t - D.ghost.rect.t), expectedDx: dx, expectedDy: dy, movedDx: f2(after.rect.l - w.rect.l), movedDy: f2(after.rect.t - w.rect.t) } : null, seeThrough };
    await ctx.close();
  }
  // panel: make panel[1] (rounded, full controls) floatable at runtime, then drag its head
  { const { ctx, page } = await L.open(browser, 'panel.zul');
    const pinfo = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const n = document.querySelectorAll('.z-panel')[1]; const w = zk.Widget.$(n); const before = { floatable: w.isFloatable(), movable: w.isMovable(), drag: !!w._drag }; w.setFloatable(true); w.setMovable(true); const n2 = w.$n(); const head = w.$n('head'); return { before, after: { floatable: w.isFloatable(), movable: w.isMovable(), drag: !!w._drag, dragOpts: w._drag ? Object.keys(w._drag.opts).filter(k => typeof w._drag.opts[k] !== 'undefined') : null, hasGhosting: !!(w._drag && w._drag.opts.ghosting) }, rect: R(n2), head: R(head), cls: n2.className, headCls: head && head.className, pos: getComputedStyle(n2).position }; }, Rsrc);
    await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const p2 = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const w = zk.Widget.$(document.querySelectorAll('.z-panel')[1]); return { rect: R(w.$n()), head: R(w.$n('head')), cls: w.$n().className, drag: !!w._drag, hasGhosting: !!(w._drag && w._drag.opts.ghosting), pos: getComputedStyle(w.$n()).position }; }, Rsrc);
    await page.evaluate(() => window.scrollTo(0, 300)); await page.waitForTimeout(200);
    const p3 = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const w = zk.Widget.$(document.querySelectorAll('.z-panel')[1]); return { rect: R(w.$n()), head: R(w.$n('head')) }; }, Rsrc);
    const D = await dragHold(page, p3.head, [60, p3.head.h / 2], 80, 60, 'panel', '.z-panel-move-ghost');
    const duringPanel = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const n = document.querySelectorAll('.z-panel')[1]; const cs = getComputedStyle(n); return { rect: R(n), opacity: cs.opacity, visibility: cs.visibility, cls: n.className, outline: cs.outline }; }, Rsrc);
    await page.mouse.up(); await L.settle(page); await page.waitForTimeout(300);
    const afterPanel = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const n = document.querySelectorAll('.z-panel')[1]; return { rect: R(n), cls: n.className }; }, Rsrc);
    out.panel = { setup: pinfo, afterSettle: p2, beforeDrag: p3, ghost: D.ghost, anyGhost: D.anyGhost, duringPanel, afterPanel, moved: { dx: f2(afterPanel.rect.l - p3.rect.l), dy: f2(afterPanel.rect.t - p3.rect.t) } };
    await ctx.close(); }
  await browser.close(); L.save('red55.json', out);
  for (const k of ['jess-blank', 'jess-content', 'jess-forced-blank', 'normal-blank', 'normal-content', 'normal-forced-blank']) { const o = out[k]; console.log('=== ' + k, 'window', JSON.stringify(o.window.rect), o.window.cls, 'head', JSON.stringify(o.window.head), 'titleRect', JSON.stringify(o.window.titleRect), 'headKids', JSON.stringify(o.window.headKids));
    console.log(' headBase', JSON.stringify(o.headBase), 'idleTitle', JSON.stringify(o.idleTitle), 'idleTitleTopDE', o.idleTitleTopDE);
    console.log(' ghost', o.ghost ? JSON.stringify({ id: o.ghost.id, cls: o.ghost.cls, rect: o.ghost.rect, cs: o.ghost.cs, titleRect: o.ghost.titleRect, nonOne: o.ghost.nonOne, style: o.ghost.style }) : null); if (o.ghost) for (const t of o.ghost.tree) console.log('   tree', t.d, t.tag, t.cls, 'op', t.opacity, 'vis', t.visibility, 'bg', t.bg, 'color', t.color, JSON.stringify(t.rect), t.text);
    console.log(' anyGhost', JSON.stringify(o.anyGhost), 'duringWindow', JSON.stringify(o.duringWindow)); console.log(' ghostPx', JSON.stringify(o.ghostPx)); console.log(' after', JSON.stringify(o.after), 'dropDelta', JSON.stringify(o.dropDelta), 'seeThrough', JSON.stringify(o.seeThrough)); }
  console.log('=== panel', JSON.stringify(out.panel));
})();
