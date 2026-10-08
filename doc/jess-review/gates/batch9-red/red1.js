// #1 errorbox: the pointer triangle must sit flush against the box, for every direction class.
// Directions come from real errorboxes (zul.inp.Errorbox widgets, never the static h:div example):
//   left  = errorbox.zul, 200px 'no empty' textbox, box opens to the right of the field
//   right = usecase/index.zul -> Item Detail -> SKU field (the designer's route, i1-1.png), box flips to the left of the field
//   up    = errorbox.zul, full-width 'no empty' textbox, box opens below the field
//   down  = the 'left' errorbox dragged above its field (Errorbox._fixarrow runs again on drop)
//   corner (observation only) = the 'left' errorbox dragged above-right of its field (ld)
// Measurements: rects (pointer, content, box, input, icon, close) + a device-pixel scan along the pointer's centre line.
// Output: red1.json + red1-*.png
const L = require('./lib');
// DPR=1 ONLY=right: re-run just the designer route at device scale 1 (output suffix -dpr1) to check whether the gap depends on the device pixel ratio
const DPR = +process.env.DPR || 2, ONLY = process.env.ONLY, SUF = DPR === 2 ? '' : '-dpr' + DPR;

async function trigger(page, input, how) {
  await input.click(); await page.waitForTimeout(200); await page.keyboard.type('x'); await page.waitForTimeout(300); await page.keyboard.press('Backspace'); await page.waitForTimeout(300);
  if (how === 'tab') await page.keyboard.press('Tab'); else await page.mouse.click(5, 5);
  await page.waitForFunction(() => [...document.querySelectorAll('.z-errorbox')].some(n => zk.$(n) && zk.$(n).className === 'zul.inp.Errorbox' && n.getBoundingClientRect().width > 0), null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
}
// the idx-th textbox that carries a client-side constraint (DOM ids are uuids, so locate through the widget)
async function constrained(page, idx) {
  await page.waitForFunction((idx) => [...document.querySelectorAll('input.z-textbox')].filter(n => zk.$(n) && zk.$(n)._cst).length > idx, idx, { timeout: 15000 });
  const id = await page.evaluate((idx) => [...document.querySelectorAll('input.z-textbox')].filter(n => zk.$(n) && zk.$(n)._cst)[idx].id, idx);
  return page.locator('#' + id);
}
async function realBox(page) {
  return page.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const n = [...document.querySelectorAll('.z-errorbox')].find(n => zk.$(n) && zk.$(n).className === 'zul.inp.Errorbox'); if (!n) return null;
    const w = zk.$(n), p = n.querySelector('.z-errorbox-pointer'), c = n.querySelector('.z-errorbox-content'), ic = n.querySelector('.z-errorbox-icon:not(.z-icon-x)'), cl = n.querySelector('.z-errorbox-close');
    const inp = w.parent.getInputNode(); const bs = getComputedStyle(n), cs = getComputedStyle(c), ps = getComputedStyle(p);
    const dir = ['left', 'right', 'up', 'down'].find(d => p.classList.contains('z-errorbox-' + d));
    return { id: n.id, dir, ptrCls: p.className, ptrInline: p.getAttribute('style'), boxInline: n.getAttribute('style'), box: R(n), ptr: R(p), content: R(c), icon: R(ic), close: R(cl), input: R(inp), text: c.textContent.trim(),
      boxStyle: { width: bs.width, padding: bs.padding, boxShadow: bs.boxShadow, border: bs.border, borderRadius: bs.borderRadius, backgroundColor: bs.backgroundColor, cursor: bs.cursor },
      contentStyle: { width: cs.width, padding: cs.padding, margin: cs.margin, boxShadow: cs.boxShadow, border: cs.border, borderRadius: cs.borderRadius, backgroundColor: cs.backgroundColor, cursor: cs.cursor },
      ptrStyle: { w: ps.width, h: ps.height, border: ps.border, transform: ps.transform, backgroundColor: ps.backgroundColor }, vp: [innerWidth, innerHeight], scroll: [scrollX, scrollY] };
  });
}
async function staticBox(page) {
  return page.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const n = [...document.querySelectorAll('.z-errorbox')].find(n => !(zk.$(n) && zk.$(n).className === 'zul.inp.Errorbox'));
    const c = n.querySelector('.z-errorbox-content'), p = n.querySelector('.z-errorbox-pointer');
    return { box: R(n), ptr: R(p), content: R(c), icon: R(n.querySelector('.z-errorbox-icon:not(.z-icon-x)')), close: R(n.querySelector('.z-errorbox-close')), contentCursor: getComputedStyle(c).cursor, boxCursor: getComputedStyle(n).cursor };
  });
}
// scan the pointer's centre line from 3px inside the content edge to 2px beyond the pointer bbox's far edge.
// axis 'x' for left/right pointers, 'y' for up/down. Returns per-device-pixel colours and derived numbers (CSS px).
function scanLine(S, g) {
  const P = g.ptr, C = g.content, d = g.dir;
  const horiz = d === 'left' || d === 'right';
  const mid = horiz ? (P.t + P.b) / 2 : (P.l + P.r) / 2;        // centre line position (cross axis)
  const edge = d === 'left' ? C.l : d === 'right' ? C.r : d === 'up' ? C.t : C.b; // content edge next to the pointer
  const sign = (d === 'left' || d === 'up') ? -1 : 1;              // direction from content edge towards the tip
  const far = d === 'left' ? P.l : d === 'right' ? P.r : d === 'up' ? P.t : P.b;
  const from = edge - sign * 3, to = far + sign * 2;
  const lo = Math.min(from, to), hi = Math.max(from, to);
  const px = horiz ? S.rect(lo, hi - 1 / S.dpr, mid, mid) : S.rect(mid, mid, lo, hi - 1 / S.dpr);
  // order from inside the content outward
  const line = px.map(p => ({ pos: horiz ? p.x : p.y, c: p.c })).sort((a, b) => sign * (a.pos - b.pos));
  const off = p => +(sign * (p.pos + 0.5 / S.dpr - edge)).toFixed(2); // signed offset from the content edge (CSS px, pixel centre); <0 inside content
  const inside = line.filter(p => off(p) < 0), outside = line.filter(p => off(p) > 0);
  if (!inside.length || !outside.length) return { axis: horiz ? 'x' : 'y', centreLine: mid, contentEdge: edge, bboxFar: far, pixels: line.map(p => ({ off: off(p), c: p.c })), note: 'pointer bbox is not outside the content edge on its side: no base/border pixel pair', dE_border_base: null, triangleRunCssPx: null, tipPos: null, baseIsBackground: null };
  const border = inside[inside.length - 1];          // last device pixel inside the content edge
  const base = outside[0];                            // first device pixel outside the content edge
  const tri = base.c;
  let run = 0; for (const p of outside) { if (L.dE(p.c, tri) <= 10) run++; else break; }
  const tipOff = run / S.dpr;                           // CSS px from the content edge to the end of the contiguous triangle-coloured run
  // gap: pixels outside the edge, before the first triangle-coloured run, that differ from the base colour (base is by definition the first pixel; so gap = base colour far from the border colour AND close to the background)
  const bgRef = outside[outside.length - 1].c;
  return { axis: horiz ? 'x' : 'y', centreLine: mid, contentEdge: edge, bboxFar: far,
    pixels: line.map(p => ({ off: off(p), c: p.c })),
    borderPx: { off: off(border), c: border.c }, basePx: { off: off(base), c: base.c }, dE_border_base: +L.dE(border.c, base.c).toFixed(2),
    triangleRunCssPx: tipOff, tipPos: edge + sign * tipOff, bgRef, dE_base_bg: +L.dE(base.c, bgRef).toFixed(2),
    baseIsBackground: L.dE(base.c, bgRef) <= 10 };
}
function judge(g, scan) {
  const P = g.ptr, C = g.content, d = g.dir, I = g.input;
  const baseDist = d === 'left' ? C.l - P.r : d === 'right' ? P.l - C.r : d === 'up' ? C.t - P.b : P.t - C.b;
  const horiz = d === 'left' || d === 'right';
  const centre = horiz ? (P.t + P.b) / 2 : (P.l + P.r) / 2;
  const lo = horiz ? C.t + 8 : C.l + 8, hi = horiz ? C.b - 8 : C.r - 8;
  const fieldEdge = d === 'left' ? I.r : d === 'right' ? I.l : d === 'up' ? I.b : I.t;
  const tipToField = scan.tipPos == null ? null : +Math.abs(scan.tipPos - fieldEdge).toFixed(2);
  return {
    J1_1: { baseDistance: +baseDist.toFixed(2), centre, centreRange: [lo, hi], centreInRange: centre >= lo && centre <= hi, pass: Math.abs(baseDist) <= 1 && centre >= lo && centre <= hi },
    J1_2: { dE_border_base: scan.dE_border_base, baseIsBackground: scan.baseIsBackground, triangleRunCssPx: scan.triangleRunCssPx, note: scan.note, pass: scan.dE_border_base != null && scan.dE_border_base <= 3 && !scan.baseIsBackground },
    P1_a: { iconFromContentLeft: +(g.icon.l - C.l).toFixed(2), closeFromContentRight: +(C.r - g.close.r).toFixed(2), pass: Math.abs(g.icon.l - C.l - 12) <= 0.5 && Math.abs(C.r - g.close.r - 4) <= 0.5 },
    P1_b: { contentCursor: g.contentStyle.cursor, boxWidth: g.box.w, contentWidth: C.w, boxStyle: g.boxStyle, contentStyle: g.contentStyle, pass: g.contentStyle.cursor === 'move' && g.box.w === 260 },
    P1_d: { tipPos: scan.tipPos, fieldEdge, tipToField, pass: tipToField != null && tipToField <= 8 },
    P1_e: { realContentCursor: g.contentStyle.cursor },
  };
}
async function capture(page, name, g) {
  const I = g.input, B = g.box;
  const l = Math.min(I.l, B.l) - 12, t = Math.min(I.t, B.t) - 12, r = Math.max(I.r, B.r) + 12, b = Math.max(I.b, B.b) + 12;
  await page.mouse.move(2, 2); await page.waitForTimeout(150);
  const S = await L.shot(page, `red1-${name}${SUF}.png`, { x: l, y: t, width: r - l, height: b - t });
  const scan = scanLine(S, g);
  // 3x zoom of the pointer area for the report
  const z = { x: g.ptr.l - 14, y: g.ptr.t - 14, width: g.ptr.w + 28, height: g.ptr.h + 28 };
  await L.shot(page, `red1-${name}-pointer${SUF}.png`, z);
  return { name, geom: g, scan, ...judge(g, scan) };
}
async function drag(page, g, dx, dy) { // drag the box by its content (left part, away from icon/close)
  const x = g.content.l + 120, y = g.content.t + g.content.h / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 5, y + 5, { steps: 3 }); await page.mouse.move(x + dx, y + dy, { steps: 12 }); await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(500);
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'rects CSS px; scan = device pixels along the pointer centre line from 3px inside the content edge to 2px past the pointer bbox; off<0 inside content; tri colour = first pixel outside the edge; triangle run = contiguous pixels within dE 10 of it', cases: [] };
  // left (+ static example P1-c) then down + corner by dragging the same box
  if (!ONLY || ONLY === 'left') {
    const { ctx, page } = await L.open(browser, 'errorbox.zul');
    out.static = await staticBox(page);
    const sb = out.static.box; await L.shot(page, 'red1-static.png', { x: sb.l - 12, y: sb.t - 12, width: sb.w + 24, height: sb.h + 24 });
    await trigger(page, await constrained(page, 0), 'tab');
    let g = await realBox(page);
    out.cases.push(await capture(page, 'left', g));
    // drag above the field -> 'down' pointer (box left=60, top=field.top-112)
    const I = g.input; await drag(page, g, 60 - g.box.l, (I.t - 112) - g.box.t);
    g = await realBox(page); const dd = await capture(page, 'down-by-drag-observation', g); dd.observationOnly = true; out.cases.push(dd);
    // drag to above-right -> corner case ('ld': box left = field.left + 268, top = field.top - 112)
    await drag(page, g, (I.l + 268) - g.box.l, (I.t - 112) - g.box.t);
    g = await realBox(page); const corner = await capture(page, 'corner-observation', g); corner.observationOnly = true; out.cases.push(corner);
    await ctx.close();
  }
  // right: designer's route
  if (!ONLY || ONLY === 'right') {
    const { ctx, page } = await L.open(browser, 'usecase/index.zul', { deviceScaleFactor: DPR });
    await page.getByText('Item Detail', { exact: true }).click(); await L.settle(page); await page.waitForTimeout(800);
    await trigger(page, await constrained(page, 0), 'tab');
    const g = await realBox(page);
    await L.shot(page, `red1-designer-repro${SUF}.png`, { x: 0, y: 0, width: 1280, height: 420 });
    out.cases.push(await capture(page, 'right', g));
    await ctx.close();
  }
  // down (pristine): the same 200px field, constraint position set client-side to before_start so the box opens above the field
  if (!ONLY || ONLY === 'down') {
    const { ctx, page } = await L.open(browser, 'errorbox.zul');
    const inp = await constrained(page, 0);
    await inp.evaluate(n => { zk.$(n).setConstraint('no empty,before_start'); return 0; });
    await trigger(page, inp, 'tab');
    const g = await realBox(page);
    out.cases.push(await capture(page, 'down', g));
    await ctx.close();
  }
  // up: full-width field
  if (!ONLY || ONLY === 'up') {
    const { ctx, page } = await L.open(browser, 'errorbox.zul');
    await trigger(page, await constrained(page, 2), 'click');
    const g = await realBox(page);
    out.cases.push(await capture(page, 'up', g));
    await ctx.close();
  }
  L.save(`red1${SUF}.json`, out);
  await browser.close();
  for (const c of out.cases) console.log(c.name, c.geom.dir, JSON.stringify({ ptr: c.geom.ptr, content: c.geom.content, box: c.geom.box, input: c.geom.input, ptrInline: c.geom.ptrInline, J1_1: c.J1_1, J1_2: c.J1_2, P1_a: c.P1_a, P1_b: { cursor: c.P1_b.contentCursor, boxW: c.P1_b.boxWidth, cW: c.P1_b.contentWidth }, P1_d: c.P1_d, scan: { border: c.scan.borderPx, base: c.scan.basePx, run: c.scan.triangleRunCssPx, bg: c.scan.bgRef, px: c.scan.pixels.map(p => p.off + ':' + p.c.join(',')).join(' ') } }));
  console.log('static', JSON.stringify(out.static));
})().catch(e => { console.error(e); process.exit(1); });
