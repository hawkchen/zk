// #47 GATE47-FINAL: fisheyebar horizontal / vertical / magnify. Derived from batch10-red/red47.js + red47b.js.
// Changes vs RED: no CSS-injection experiments and no CSSOM walk (measurement only); dump() also records
// .z-fisheye-text, computed cursor and image ratio; magnify() waits 600 ms after the pointer settles and also
// takes an immediate sample (transition lag, in a second context WITHOUT the NOANIM style tag);
// a horizontal -> vertical -> horizontal sequence on one fresh page (toggle-back protection, from red47b.js).
// Orientation is read from the "Vertical orient" checkbox, never from aria-orientation. Output: rb47.json + rb47-*.png
const L = require('./lib');

async function dump(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const bar = document.querySelector('.z-fisheyebar'); const barR = R(bar); const bs = getComputedStyle(bar);
    const vertical = [...document.querySelectorAll('.z-checkbox')].find(c => c.textContent.includes('Vertical orient')).querySelector('input').checked;
    const items = [...bar.querySelectorAll('.z-fisheye')].map(f => {
      const s = getComputedStyle(f); const img = f.querySelector('.z-fisheye-image'); const txt = f.querySelector('.z-fisheye-text');
      const r = R(f); const ir = R(img);
      const inline = { left: f.style.left, top: f.style.top, width: f.style.width, height: f.style.height };
      const expected = { l: +(barR.l + parseFloat(inline.left)).toFixed(2), t: +(barR.t + parseFloat(inline.top)).toFixed(2), w: parseFloat(inline.width), h: parseFloat(inline.height) };
      const delta = { l: +(r.l - expected.l).toFixed(2), t: +(r.t - expected.t).toFixed(2), w: +(r.w - expected.w).toFixed(2), h: +(r.h - expected.h).toFixed(2) };
      const ok = Math.abs(delta.l) <= 1 && Math.abs(delta.t) <= 1 && Math.abs(delta.w) <= 1 && Math.abs(delta.h) <= 1;
      const inside = r.l >= barR.l - 0.5 && r.r <= barR.r + 0.5 && r.t >= barR.t - 0.5 && r.b <= barR.b + 0.5;
      const insideX = r.l >= barR.l - 0.5 && r.r <= barR.r + 0.5;
      const imgRatio = { l: +((ir.l - r.l) / r.w).toFixed(3), t: +((ir.t - r.t) / r.h).toFixed(3), w: +(ir.w / r.w).toFixed(3), h: +(ir.h / r.h).toFixed(3) };
      let text = null;
      if (txt) { const ts = getComputedStyle(txt); const tr = R(txt); text = { content: txt.textContent, display: ts.display, visibility: ts.visibility, opacity: ts.opacity, rect: tr, rel: { l: +(tr.l - r.l).toFixed(2), t: +(tr.t - r.t).toFixed(2), b: +(tr.b - r.b).toFixed(2) }, centreDx: +((tr.l + tr.w / 2) - (r.l + r.w / 2)).toFixed(2), visible: ts.display !== 'none' && ts.visibility !== 'hidden' && tr.w > 0 && tr.h > 0 }; }
      return { rect: r, inline, expected, delta, ok, inside, insideX, cursor: s.cursor, position: s.position,
        img: { rect: ir, inline: { left: img.style.left, top: img.style.top, width: img.style.width, height: img.style.height }, ratio: imgRatio }, text };
    });
    return { vertical, ariaOrientation: bar.getAttribute('aria-orientation'), bar: { rect: barR, inline: { width: bar.style.width, height: bar.style.height }, position: bs.position },
      items, summary: { n: items.length, allOk: items.every(i => i.ok), allInside: items.every(i => i.inside), allInsideX: items.every(i => i.insideX), maxAbsDelta: +Math.max(...items.flatMap(i => [Math.abs(i.delta.l), Math.abs(i.delta.t), Math.abs(i.delta.w), Math.abs(i.delta.h)])).toFixed(2), widths: items.map(i => i.rect.w), heights: items.map(i => i.rect.h), itemsL: items.map(i => i.rect.l), itemsT: items.map(i => i.rect.t), textsVisible: items.map(i => i.text ? i.text.visible : null) } };
  });
}
// orientation state from the checkbox itself (aria-orientation stays "horizontal" after the toggle; known widget issue)
async function setVertical(page, on) {
  const cur = await page.evaluate(() => [...document.querySelectorAll('.z-checkbox')].find(c => c.textContent.includes('Vertical orient')).querySelector('input').checked);
  if (cur !== on) { await page.getByText('Vertical orient').click(); await L.settle(page); }
  await page.mouse.move(2, 2); await page.waitForTimeout(400);
}
// pointer at the nominal centre of item 3 (bar origin + inline left/top + 40); settle 600 ms (transition end) before the dump
async function magnify(page, d, file, settleMs = 600) {
  const it = d.items[2]; const bx = d.bar.rect.l + parseFloat(it.inline.left) + 40, by = d.bar.rect.t + parseFloat(it.inline.top) + 40;
  await page.mouse.move(bx - 20, by - 20); await page.waitForTimeout(200); await page.mouse.move(bx, by); await page.waitForTimeout(settleMs);
  const m = await dump(page);
  if (file) await L.shot(page, file, { x: d.bar.rect.l - 120, y: d.bar.rect.t - 120, width: d.bar.rect.w + 240, height: d.bar.rect.h + 240 });
  await page.mouse.move(2, 2); await page.waitForTimeout(settleMs);
  return { pointer: [bx, by], ...m };
}
// transition-lag probe: with transitions ENABLED, sample immediately after each pointer move and again 600 ms later
async function lagProbe(page, d) {
  const centre = k => { const it = d.items[k]; return [d.bar.rect.l + parseFloat(it.inline.left) + 40, d.bar.rect.t + parseFloat(it.inline.top) + 40]; };
  const out = {};
  const [x2, y2] = centre(2); await page.mouse.move(x2 - 20, y2 - 20); await page.waitForTimeout(200);
  await page.mouse.move(x2, y2); out.item3_immediate = await dump(page);
  await page.waitForTimeout(600); out.item3_settled = await dump(page);
  const [x3, y3] = centre(3); await page.mouse.move(x3, y3); out.item4_immediate = await dump(page);
  await page.waitForTimeout(600); out.item4_settled = await dump(page);
  await page.mouse.move(2, 2); out.leave_immediate = await dump(page);
  await page.waitForTimeout(600); out.leave_settled = await dump(page);
  const brief = o => ({ maxAbsDelta: o.summary.maxAbsDelta, allOk: o.summary.allOk, widths: o.summary.widths, heights: o.summary.heights, inlineW: o.items.map(i => i.inline.width), inlineT: o.items.map(i => i.inline.top), inlineL: o.items.map(i => i.inline.left) });
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, brief(v)]));
}
(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'fisheyebar.zul itemWidth=80 itemHeight=80 itemMaxWidth/Height=160 attachEdge=bottom; DPR 2; transitions disabled (lib NOANIM) except in the lag probe' };
  // ---- main sequence on one fresh page: horizontal -> magnify -> vertical -> magnify -> horizontal
  { const { ctx, page } = await L.open(browser, 'fisheyebar.zul');
    await setVertical(page, false);
    out.horizontal = await dump(page);
    await L.shot(page, 'rb47-h.png', { x: out.horizontal.bar.rect.l - 40, y: out.horizontal.bar.rect.t - 120, width: out.horizontal.bar.rect.w + 80, height: out.horizontal.bar.rect.h + 240 });
    out.horizontalMagnify = await magnify(page, out.horizontal, 'rb47-h-magnify.png');
    await setVertical(page, true);
    out.vertical = await dump(page);
    await L.shot(page, 'rb47-v.png', { x: out.vertical.bar.rect.l - 40, y: out.vertical.bar.rect.t - 40, width: out.vertical.bar.rect.w + 240, height: out.vertical.bar.rect.h + 80 });
    out.verticalMagnify = await magnify(page, out.vertical, 'rb47-v-magnify.png');
    await setVertical(page, false);
    out.horizontalBack = await dump(page);
    await L.shot(page, 'rb47-h-back.png', { x: out.horizontalBack.bar.rect.l - 40, y: out.horizontalBack.bar.rect.t - 120, width: out.horizontalBack.bar.rect.w + 80, height: out.horizontalBack.bar.rect.h + 240 });
    await ctx.close(); }
  // ---- transition-lag probe (transitions enabled: the NOANIM style tag injected by lib.open is removed)
  { const { ctx, page } = await L.open(browser, 'fisheyebar.zul');
    await page.evaluate(() => { for (const s of document.querySelectorAll('style')) if (s.textContent.includes('transition:none!important')) s.remove(); });
    await page.waitForTimeout(200);
    await setVertical(page, false);
    const h = await dump(page); out.lag = { horizontal: await lagProbe(page, h) };
    await setVertical(page, true);
    const v = await dump(page); out.lag.vertical = await lagProbe(page, v);
    await ctx.close(); }
  L.save('rb47.json', out);
  await browser.close();
  const show = (k, d) => { console.log('==', k, 'vertical(checkbox)=', d.vertical, 'aria=', d.ariaOrientation, 'bar', JSON.stringify(d.bar.rect), 'pos', d.bar.position, d.pointer ? 'pointer ' + JSON.stringify(d.pointer) : '');
    d.items.forEach((i, n) => console.log('  item', n, 'rect', JSON.stringify(i.rect), 'inline', [i.inline.left, i.inline.top, i.inline.width, i.inline.height].join(' '), 'delta', JSON.stringify(i.delta), i.ok ? 'OK' : 'FAIL', 'inside', i.inside, 'insideX', i.insideX, 'cursor', i.cursor, 'pos', i.position, '| img', JSON.stringify(i.img.rect), 'ratio', JSON.stringify(i.img.ratio), '| text', i.text ? JSON.stringify({ visible: i.text.visible, display: i.text.display, rel: i.text.rel, centreDx: i.text.centreDx, rect: i.text.rect, content: i.text.content }) : 'none'));
    console.log('  summary', JSON.stringify(d.summary)); };
  for (const k of ['horizontal', 'horizontalMagnify', 'vertical', 'verticalMagnify', 'horizontalBack']) show(k, out[k]);
  console.log('lag', JSON.stringify(out.lag, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
