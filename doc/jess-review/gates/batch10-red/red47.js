// #47 RED exploration: fisheyebar horizontal vs vertical. Dumps container / item / image rects, position, inline left/top/width/height,
// computed flex properties; magnify (pointer over item 3); then in-page CSS injection experiments (page.addStyleTag, no file changes)
// to find which rule makes the items 1px wide in vertical orientation. Output: red47.json + red47-*.png
const L = require('./lib');

async function dump(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const bar = document.querySelector('.z-fisheyebar'); const bs = getComputedStyle(bar);
    const barR = R(bar);
    const items = [...bar.querySelectorAll('.z-fisheye')].map(f => { const s = getComputedStyle(f); const img = f.querySelector('.z-fisheye-image'); const is = getComputedStyle(img); const r = R(f); const ir = R(img);
      return { rect: r, inline: { left: f.style.left, top: f.style.top, width: f.style.width, height: f.style.height }, computed: { position: s.position, display: s.display, width: s.width, height: s.height, flex: s.flex, flexShrink: s.flexShrink, minWidth: s.minWidth, margin: s.margin, overflow: s.overflow },
        inside: r.l >= barR.l - 0.5 && r.r <= barR.r + 0.5 && r.t >= barR.t - 0.5 && r.b <= barR.b + 0.5,
        img: { rect: ir, inline: { left: img.style.left, top: img.style.top, width: img.style.width, height: img.style.height }, computed: { position: is.position, width: is.width, height: is.height, display: is.display, objectFit: is.objectFit, maxWidth: is.maxWidth } } }; });
    return { orient: bar.getAttribute('aria-orientation'), bar: { rect: barR, inline: { width: bar.style.width, height: bar.style.height }, computed: { display: bs.display, flexDirection: bs.flexDirection, flexWrap: bs.flexWrap, alignItems: bs.alignItems, justifyContent: bs.justifyContent, gap: bs.gap, padding: bs.padding, position: bs.position, width: bs.width, height: bs.height, overflow: bs.overflow, boxSizing: bs.boxSizing } }, items, itemWidthAttr: 80, summary: { n: items.length, allInside: items.every(i => i.inside), minW: Math.min(...items.map(i => i.rect.w)), maxW: Math.max(...items.map(i => i.rect.w)), minH: Math.min(...items.map(i => i.rect.h)), maxH: Math.max(...items.map(i => i.rect.h)), itemsL: items.map(i => i.rect.l), itemsT: items.map(i => i.rect.t) } };
  });
}
// aria-orientation stays "horizontal" after the toggle (widget does not update it), so the state is read from the checkbox itself
async function setVertical(page, on) {
  const cur = await page.evaluate(() => [...document.querySelectorAll('.z-checkbox')].find(c => c.textContent.includes('Vertical orient')).querySelector('input').checked);
  if (cur !== on) { await page.getByText('Vertical orient').click(); await L.settle(page); }
  await page.mouse.move(2, 2); await page.waitForTimeout(400);
}
async function magnify(page, d, file) { // pointer at the nominal centre of item 3 (inline left/top + 40) relative to the bar
  const it = d.items[2]; const bx = d.bar.rect.l + parseFloat(it.inline.left) + 40, by = d.bar.rect.t + parseFloat(it.inline.top) + 40;
  await page.mouse.move(bx - 20, by - 20); await page.waitForTimeout(200); await page.mouse.move(bx, by); await page.waitForTimeout(500);
  const m = await dump(page);
  await L.shot(page, file, { x: d.bar.rect.l - 120, y: d.bar.rect.t - 120, width: d.bar.rect.w + 240, height: d.bar.rect.h + 240 });
  await page.mouse.move(2, 2); await page.waitForTimeout(300);
  return { pointer: [bx, by], bar: m.bar.rect, items: m.items.map(i => ({ rect: i.rect, inline: i.inline, inside: i.inside })), summary: m.summary };
}
const EXPERIMENTS = {
  E1_itemAbsolute: '.z-fisheye{position:absolute!important}',
  E2_itemAbsolute_barRelative: '.z-fisheye{position:absolute!important}.z-fisheyebar{position:relative!important}',
  E3_barBlock: '.z-fisheyebar{display:block!important}',
  E4_barBlock_itemAbsolute_barRelative: '.z-fisheyebar{display:block!important;position:relative!important}.z-fisheye{position:absolute!important}',
  E5_barColumn: '.z-fisheyebar{flex-direction:column!important}',
  E6_noPaddingGap: '.z-fisheyebar{padding:0!important;gap:0!important}',
  E7_itemNoShrink: '.z-fisheye{flex-shrink:0!important}',
};
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'fisheyebar.zul');
  const out = { note: 'fisheyebar.zul itemWidth=80 itemHeight=80 itemMaxWidth/Height=160 attachEdge=bottom; dumps at DPR 2; experiments inject CSS with page.addStyleTag (no file change)' };
  await setVertical(page, false);
  out.horizontal = await dump(page);
  await L.shot(page, 'red47-h.png', { x: out.horizontal.bar.rect.l - 40, y: out.horizontal.bar.rect.t - 120, width: out.horizontal.bar.rect.w + 80, height: out.horizontal.bar.rect.h + 240 });
  out.horizontalMagnify = await magnify(page, out.horizontal, 'red47-h-magnify.png');
  await setVertical(page, true);
  out.vertical = await dump(page);
  await L.shot(page, 'red47-v.png', { x: out.vertical.bar.rect.l - 40, y: out.vertical.bar.rect.t - 40, width: out.vertical.bar.rect.w + 240, height: out.vertical.bar.rect.h + 80 });
  out.verticalMagnify = await magnify(page, out.vertical, 'red47-v-magnify.png');
  // the .z-fisheye / .z-fisheyebar rules that currently apply (CSSOM read for cause-finding only)
  out.matchedRules = await page.evaluate(() => { const want = ['.z-fisheyebar', '.z-fisheye', '.z-fisheye-image']; const res = []; for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch (e) { continue; } for (const r of rules) { if (r.selectorText && want.some(w => r.selectorText.split(',').some(s => s.trim().startsWith(w)))) res.push({ sheet: (ss.href || 'inline').split('/').slice(-2).join('/').slice(0, 60), sel: r.selectorText, css: r.style.cssText.slice(0, 300) }); } } return res; });
  out.experiments = {};
  for (const [name, css] of Object.entries(EXPERIMENTS)) {
    const h = await page.addStyleTag({ content: css }); await page.waitForTimeout(200);
    const r = {};
    await setVertical(page, true); const v = await dump(page); r.vertical = { bar: v.bar.rect, barComputed: v.bar.computed, items: v.items.map(i => ({ rect: i.rect, position: i.computed.position, inside: i.inside, img: i.img.rect })), summary: v.summary };
    await L.shot(page, `red47-exp-${name}-v.png`, { x: v.bar.rect.l - 40, y: v.bar.rect.t - 40, width: Math.max(v.bar.rect.w, 200) + 240, height: v.bar.rect.h + 80 });
    r.verticalMagnify = await magnify(page, v, `red47-exp-${name}-v-magnify.png`);
    await setVertical(page, false); const hd = await dump(page); r.horizontal = { bar: hd.bar.rect, items: hd.items.map(i => ({ rect: i.rect, inside: i.inside, img: i.img.rect })), summary: hd.summary };
    await L.shot(page, `red47-exp-${name}-h.png`, { x: hd.bar.rect.l - 40, y: hd.bar.rect.t - 120, width: hd.bar.rect.w + 80, height: hd.bar.rect.h + 240 });
    r.horizontalMagnify = await magnify(page, hd, `red47-exp-${name}-h-magnify.png`);
    out.experiments[name] = { css, ...r };
    await h.evaluate(e => e.remove()); await page.waitForTimeout(200);
  }
  L.save('red47.json', out);
  await ctx.close(); await browser.close();
  for (const k of ['horizontal', 'vertical']) { const d = out[k]; console.log('==', k, 'bar', JSON.stringify(d.bar.rect), JSON.stringify(d.bar.computed)); d.items.forEach((i, n) => console.log('  item', n, JSON.stringify(i.rect), 'inline', JSON.stringify(i.inline), 'pos', i.computed.position, i.computed.display, 'w', i.computed.width, 'flex', i.computed.flex, 'minW', i.computed.minWidth, 'inside', i.inside, '| img', JSON.stringify(i.img.rect), i.img.computed.position, i.img.computed.width, i.img.computed.height)); console.log('  summary', JSON.stringify(d.summary)); }
  console.log('h magnify', JSON.stringify(out.horizontalMagnify.summary), JSON.stringify(out.horizontalMagnify.items.map(i => i.rect)));
  console.log('v magnify', JSON.stringify(out.verticalMagnify.summary), JSON.stringify(out.verticalMagnify.items.map(i => i.rect)));
  console.log('rules', JSON.stringify(out.matchedRules, null, 1));
  for (const [n, e] of Object.entries(out.experiments)) console.log('EXP', n, '| V', JSON.stringify(e.vertical.summary), 'items', JSON.stringify(e.vertical.items.map(i => [i.rect.l, i.rect.t, i.rect.w, i.rect.h])), '| Vmag', JSON.stringify(e.verticalMagnify.summary), '| H', JSON.stringify(e.horizontal.summary), '| Hmag', JSON.stringify(e.horizontalMagnify.summary));
})().catch(e => { console.error(e); process.exit(1); });
