// #35 (D27-A): sort icon vs column-menu icon vs group icon, binary ink-mask IoU at 16x16
const { chromium, open, settle, dE } = require('./lib');
const fs = require('fs');
const DIR = __dirname;

// screenshot bbox+2px, return {mask16 (0/1 x256), inkFull, bg, box, ratio}
async function iconMask(page, locator, name) {
  const b = await locator.boundingBox();
  if (!b || b.width < 0.5 || b.height < 0.5) return { box: b, empty: true };
  const clip = { x: Math.floor(b.x - 2), y: Math.floor(b.y - 2), width: Math.ceil(b.width + 4), height: Math.ceil(b.height + 4) };
  const buf = await page.screenshot({ clip });
  fs.writeFileSync(`${DIR}/i35-${name}.png`, buf);
  const r = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const full = Array.from(x.getImageData(0, 0, c.width, c.height).data);
    const s = document.createElement('canvas'); s.width = 16; s.height = 16;
    const y = s.getContext('2d'); y.imageSmoothingEnabled = true; y.imageSmoothingQuality = 'high';
    y.drawImage(img, 0, 0, 16, 16);
    return { w: img.width, h: img.height, full, small: Array.from(y.getImageData(0, 0, 16, 16).data) };
  }, buf.toString('base64'));
  const counts = new Map();
  for (let i = 0; i < r.full.length; i += 4) { const k = r.full[i] + ',' + r.full[i + 1] + ',' + r.full[i + 2]; counts.set(k, (counts.get(k) || 0) + 1); }
  const bg = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number);
  const mask = []; let ink = 0;
  for (let i = 0; i < r.small.length; i += 4) { const m = dE([r.small[i], r.small[i + 1], r.small[i + 2]], bg) > 10 ? 1 : 0; mask.push(m); ink += m; }
  let inkFull = 0;
  for (let i = 0; i < r.full.length; i += 4) if (dE([r.full[i], r.full[i + 1], r.full[i + 2]], bg) > 10) inkFull++;
  // contrast: max-contrast pixel vs modal bg
  const lum = ([R, G, B]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(R) + 0.7152 * f(G) + 0.0722 * f(B); };
  const cr = (a, c) => { const la = lum(a), lb = lum(c); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  let best = 1, bestPx = bg;
  for (let i = 0; i < r.full.length; i += 4) { const p = [r.full[i], r.full[i + 1], r.full[i + 2]]; const v = cr(p, bg); if (v > best) { best = v; bestPx = p; } }
  return { box: b, clip, bg, inkPx16: ink, inkPxFull: inkFull, contrast: +best.toFixed(2), inkColor: bestPx, mask };
}
const iou = (a, b) => { if (!a.mask || !b.mask) return null; let i = 0, u = 0; for (let k = 0; k < 256; k++) { if (a.mask[k] && b.mask[k]) i++; if (a.mask[k] || b.mask[k]) u++; } return u ? +(i / u).toFixed(3) : null; };
const strip = m => { const { mask, ...rest } = m; return { ...rest, maskRows: mask ? Array.from({ length: 16 }, (_, r) => mask.slice(r * 16, r * 16 + 16).join('')) : null }; };

async function run(browser, opts, tag) {
  const out = {};
  // group icon
  let group;
  { const { ctx, page } = await open(browser, 'grid-grouping.zul', opts);
    await page.mouse.move(1270, 890);
    group = await iconMask(page, page.locator('.z-group-icon').first().locator('i'), tag + 'group');
    group.cls = await page.locator('.z-group-icon').first().locator('i').getAttribute('class');
    await ctx.close(); }
  out.group = strip(group);
  const { ctx, page } = await open(browser, 'grid.zul', opts);
  const grid = page.locator('.z-grid').nth(1);
  const th = grid.locator('th.z-column').nth(1); // Title
  const sortI = th.locator('.z-column-sorticon i');
  const btnI = th.locator('.z-column-button i');
  const firstTitle = () => grid.locator('.z-row').first().locator('td').nth(1).innerText();
  out.initialFirstTitle = await firstTitle();
  // unsorted columns: Author (sortable) and Publisher (not sortable)
  await page.mouse.move(1270, 890); await page.waitForTimeout(150);
  out.unsorted = {};
  for (const [n, idx] of [['Author', 0], ['Title', 1], ['Publisher', 2]]) {
    const i = grid.locator('th.z-column').nth(idx).locator('.z-column-sorticon i');
    const m = await iconMask(page, i, tag + 'unsorted-' + n);
    const glyph = await i.evaluate(e => ({ cls: e.className, before: getComputedStyle(e, '::before').content, w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }));
    out.unsorted[n] = { ...strip(m), glyph };
  }
  const states = {};
  for (const st of ['asc', 'desc']) {
    await th.locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page);
    const s = { ariaSort: await th.getAttribute('aria-sort'), sortCls: await sortI.getAttribute('class'), sortTitle: await sortI.getAttribute('title'), firstTitle: await firstTitle() };
    // hover the column so the menu button is visible
    await th.hover({ position: { x: 60, y: 10 } }); await page.waitForTimeout(150);
    s.btnVisible = await btnI.isVisible();
    const sortM = await iconMask(page, sortI, tag + st + '-sort-hover');
    const btnM = await iconMask(page, btnI, tag + st + '-menu-hover');
    // contrast at rest
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    const sortRest = await iconMask(page, sortI, tag + st + '-sort-rest');
    s.sort = strip(sortM); s.menu = strip(btnM); s.sortRest = strip(sortRest);
    s.iou_sort_menu = iou(sortM, btnM); s.iou_sort_group = iou(sortM, group);
    s.iou_sortRest_group = iou(sortRest, group);
    s._mask = sortM.mask;
    states[st] = s;
  }
  out.iou_asc_desc = iou({ mask: states.asc._mask }, { mask: states.desc._mask });
  delete states.asc._mask; delete states.desc._mask;
  out.states = states;
  await ctx.close();
  return out;
}

(async () => {
  const browser = await chromium.launch();
  const res = { normal: await run(browser, {}, ''), forced: await run(browser, { forcedColors: 'active' }, 'fc-') };
  fs.writeFileSync(DIR + '/i35.json', JSON.stringify(res, null, 1));
  const n = res.normal;
  console.log('group', n.group.cls, 'ink', n.group.inkPx16);
  for (const st of ['asc', 'desc']) { const s = n.states[st]; console.log(st, s.sortCls, s.sortTitle, s.firstTitle, 'IoU sort/menu', s.iou_sort_menu, 'sort/group', s.iou_sort_group, 'contrast', s.sortRest.contrast, 'ink', s.sort.inkPx16, s.menu.inkPx16, 'btnVis', s.btnVisible); }
  console.log('asc/desc IoU', n.iou_asc_desc, 'initialFirst', n.initialFirstTitle);
  console.log('unsorted', JSON.stringify(Object.fromEntries(Object.entries(n.unsorted).map(([k, v]) => [k, { empty: v.empty, ink: v.inkPx16, glyph: v.glyph }]))));
  for (const st of ['asc', 'desc']) console.log('forced', st, res.forced.states[st].sortCls, 'ink', res.forced.states[st].sortRest.inkPx16, res.forced.states[st].sortRest.inkPxFull, 'contrast', res.forced.states[st].sortRest.contrast);
  await browser.close();
})();
