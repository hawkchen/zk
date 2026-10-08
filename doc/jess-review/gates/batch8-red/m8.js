// Batch 8 RED helpers on top of lib.js: popup row geometry (DOM rects + text Range rects) and pixel ink boxes.
// Judgments use ink positions from pixels; DOM rects are recorded next to them for traceability.
const L = require('./lib.js');

// ink bounding box (CSS px) of pixels with dE(base) >= thr inside the CSS-px box [x0,x1]x[y0,y1] (inclusive)
function inkBox(S, x0, x1, y0, y1, base, thr = 8) {
  const px = S.rect(x0, x1, y0, y1).filter(p => L.dE(p.c, base) >= thr);
  if (!px.length) return null;
  const minx = Math.min(...px.map(p => p.dx)), maxx = Math.max(...px.map(p => p.dx)), miny = Math.min(...px.map(p => p.dy)), maxy = Math.max(...px.map(p => p.dy));
  let darkest = px[0]; for (const p of px) if (p.c[0] + p.c[1] + p.c[2] < darkest.c[0] + darkest.c[1] + darkest.c[2]) darkest = p;
  return { l: minx / S.dpr, r: (maxx + 1) / S.dpr, t: miny / S.dpr, b: (maxy + 1) / S.dpr, w: (maxx + 1 - minx) / S.dpr, h: (maxy + 1 - miny) / S.dpr, n: px.length, darkest: darkest.c };
}
// horizontal extent (CSS px) of the run of columns whose median colour differs from `base` by >= thr, scanning the band y0..y1 across x0..x1
function hExtent(S, x0, x1, y0, y1, base, thr = 2) {
  const cols = []; for (let x = x0; x <= x1; x++) { const c = L.median(S.rect(x, x, y0, y1).map(p => p.c)); cols.push({ x, c, d: +L.dE(c, base).toFixed(2) }); }
  const hit = cols.filter(c => c.d >= thr); if (!hit.length) return { found: false };
  return { found: true, l: hit[0].x, r: hit[hit.length - 1].x + 1, color: L.median(hit.map(c => c.c)), cols: cols.map(c => c.d) };
}
function vExtent(S, x0, x1, y0, y1, base, thr = 2) {
  const rows = []; for (let y = y0; y <= y1; y++) { const c = L.median(S.rect(x0, x1, y, y).map(p => p.c)); rows.push({ y, c, d: +L.dE(c, base).toFixed(2) }); }
  const hit = rows.filter(c => c.d >= thr); if (!hit.length) return { found: false };
  return { found: true, t: hit[0].y, b: hit[hit.length - 1].y + 1, color: L.median(hit.map(c => c.c)) };
}

// in-page: rows of a menupopup element (by index in document.querySelectorAll('.z-menupopup'))
const menuRowsSrc = `(function (idx) {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; };
  const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0;
  const p = document.querySelectorAll('.z-menupopup')[idx]; const ul = p.querySelector('.z-menupopup-content'); const cs = getComputedStyle(p);
  const rows = [...ul.children].map(li => {
    const cnt = li.querySelector(':scope > a'); const isMenu = li.classList.contains('z-menu'); const isSep = li.classList.contains('z-menuseparator');
    if (isSep) return { kind: 'separator', li: R(li) };
    const img = cnt.querySelector('img'); const iconI = [...cnt.querySelectorAll('i')].filter(i => !i.classList.contains('z-menu-icon'));
    const icon = vis(img) ? img : (iconI.length && vis(iconI[0]) ? iconI[0] : null);
    const text = cnt.querySelector('.z-menuitem-text, .z-menu-text'); const rng = document.createRange(); const tn = [...text.childNodes].find(n => n.nodeType === 3); if (tn) rng.selectNodeContents(tn); else rng.selectNodeContents(text);
    const arrow = cnt.querySelector('.z-menu-icon'); const sep = cnt.querySelector('.z-menu-separator'); const ccs = getComputedStyle(cnt);
    return { kind: isMenu ? 'menu' : 'menuitem', disabled: li.classList.contains('z-menuitem-disabled') || li.classList.contains('z-menu-disabled'), checkable: li.classList.contains('z-menuitem-checkable'), checked: li.classList.contains('z-menuitem-checked'),
      liCls: li.className, label: text.textContent.trim(), li: R(li), cnt: R(cnt), icon: icon ? { tag: icon.tagName, cls: icon.className, rect: R(icon), vis: getComputedStyle(icon).visibility } : null, hiddenImg: img && !vis(img) ? R(img) : null,
      iconKind: icon ? (icon.tagName === 'IMG' ? 'image' : (icon.classList.contains('z-menuitem-icon') ? 'checkmark' : 'iconSclass')) : 'none',
      text: R(text), textRange: R(rng), arrow: arrow ? R(arrow) : null, menuSep: sep ? R(sep) : null, opacity: ccs.opacity, liOpacity: getComputedStyle(li).opacity, textColor: ccs.color, font: ccs.font };
  });
  return { popup: R(p), cls: p.className, content: R(ul), borderLeft: cs.borderLeftWidth, paddingLeft: getComputedStyle(ul).paddingLeft, bg: cs.backgroundColor, rows };
})`;
async function menuRows(page, idx) { return page.evaluate(({ idx, src }) => eval(src)(idx), { idx, src: menuRowsSrc }); }
async function visibleMenupopups(page) { return page.evaluate(() => [...document.querySelectorAll('.z-menupopup')].map((p, i) => ({ i, p })).filter(({ p }) => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0).map(({ i, p }) => { const r = p.getBoundingClientRect(); return { i, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) }; })); }
// click the top-level item of a menubar (by menubar index and li index)
async function clickTop(page, mbIdx, liIdx) { const r = await page.evaluate(({ mbIdx, liIdx }) => { const m = document.querySelectorAll('.z-menubar')[mbIdx]; const li = m.querySelectorAll(':scope > ul > li')[liIdx]; const a = li.querySelector(':scope > a') || li; const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, text: li.textContent.trim(), cls: li.className }; }, { mbIdx, liIdx }); await page.mouse.click(r.x, r.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300); return r; }

// pixel measurement of every row of a popup: base colour per row (left padding strip), text ink box, icon ink box, arrow ink box
async function measurePopup(page, idx, file) {
  const g = await menuRows(page, idx);
  const P = g.popup;
  const S = await L.shot(page, file, { x: P.l - 12, y: P.t - 12, width: P.w + 24, height: P.h + 24 });
  const popupBg = L.median(S.rect(P.l + 3, P.l + 6, P.t + 6, P.b - 7).map(p => p.c));
  for (const row of g.rows) {
    if (row.kind === 'separator') { row.px = { color: L.median(S.rect(row.li.l + 10, row.li.r - 10, row.li.t, row.li.b - 0.5).map(p => p.c)) }; continue; }
    const y0 = row.cnt.t + 2, y1 = row.cnt.b - 3;
    const base = L.median(S.rect(row.cnt.l + 2, row.cnt.l + 6, y0, y1).map(p => p.c));
    const thr = 8;
    // text ink: within the text span box (+-2px)
    const text = inkBox(S, row.text.l - 2, row.text.r + 2, y0, y1, base, thr);
    // icon ink: between content left and text span left (exclusive of the text's left 2px)
    const icon = inkBox(S, row.cnt.l + 1, row.text.l - 3, y0, y1, base, thr);
    const arrow = row.arrow ? inkBox(S, row.arrow.l - 4, row.cnt.r - 1, y0, y1, base, thr) : null;
    const menuSep = row.menuSep ? inkBox(S, row.menuSep.l - 2, row.menuSep.r + 2, y0, y1, base, 3) : null;
    row.px = { base, dE_base_popup: +L.dE(base, popupBg).toFixed(2), text, icon, arrow, menuSep, textInkLeft: text ? +text.l.toFixed(2) : null, iconInkLeft: icon ? +icon.l.toFixed(2) : null,
      textFromInner: text ? +(text.l - g.content.l).toFixed(2) : null, iconFromInner: icon ? +(icon.l - g.content.l).toFixed(2) : null, textFromPopup: text ? +(text.l - P.l).toFixed(2) : null };
  }
  g.popupBg = popupBg;
  return { g, S };
}
module.exports = { inkBox, hExtent, vExtent, menuRows, visibleMenupopups, clickTop, measurePopup };
