// Batch 14 FINAL — P4 side effect on colorbox-in-menu (pv/colorbox-content.zul "Colorbox in Menu"):
// nested z-menu rows whose image slot is a colour swatch (`.z-menu-image.z-colorbox-color`), inside the Format popup, and the top-level "Quick Colour" row.
const L = require('./lib.js');
const M = require('./m14.js');

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, chromium: browser.version(), date: new Date().toISOString() } };
  const { ctx, page } = await L.open(browser, 'web/colorbox.zul');
  // top row (closed): Format / Quick Colour
  const top = await page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const bar = document.querySelector('.z-menubar'); bar.scrollIntoView({ block: 'center' });
    return { bar: R(bar), items: [...bar.querySelectorAll(':scope > ul > li')].map(li => { const a = li.querySelector(':scope > a'); return { cls: li.className, label: li.querySelector('.z-menu-text')?.textContent.trim(), cnt: R(a), children: [...a.children].map(c => ({ tag: c.tagName, cls: c.className, rect: R(c), display: getComputedStyle(c).display, bg: getComputedStyle(c).backgroundColor, ml: getComputedStyle(c).marginLeft, mr: getComputedStyle(c).marginRight })) }; }) };
  });
  await page.waitForTimeout(200);
  const top2 = await page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; }; const bar = document.querySelector('.z-menubar'); return { bar: R(bar), items: [...bar.querySelectorAll(':scope > ul > li')].map(li => { const a = li.querySelector(':scope > a'); return { cls: li.className, label: li.querySelector('.z-menu-text')?.textContent.trim(), cnt: R(a), children: [...a.children].map(c => ({ tag: c.tagName, cls: c.className, rect: R(c), display: getComputedStyle(c).display, bg: getComputedStyle(c).backgroundColor, ml: getComputedStyle(c).marginLeft, mr: getComputedStyle(c).marginRight })) }; }) }; });
  out.top = top2;
  console.log('colorbox.zul menubar top row:'); for (const it of top2.items) console.log(`  ${it.label} cnt ${JSON.stringify(it.cnt)}\n    ` + it.children.map(c => `${c.tag}.${c.cls} ${JSON.stringify(c.rect)} display ${c.display} bg ${c.bg} m ${c.ml}/${c.mr}`).join('\n    '));
  const S0 = await L.shot(page, 'p4c-colorbox-menubar-top.png', { x: top2.bar.l - 8, y: top2.bar.t - 8, width: 420, height: top2.bar.h + 16 });
  // pixel: for Quick Colour, the swatch ink (anything differing from the bar base)
  const base = L.median(S0.rect(top2.bar.l + 2, top2.bar.l + 6, top2.bar.t + 4, top2.bar.b - 5).map(p => p.c));
  for (const it of top2.items) { const y0 = it.cnt.t + 2, y1 = it.cnt.b - 3; const ink = M.inkBox(S0, it.cnt.l + 1, it.cnt.r - 1, y0, y1, base, 8); it.px = { base, ink }; console.log(`  ${it.label}: ink ${ink ? `${ink.l}-${ink.r} x ${ink.t}-${ink.b} darkest ${ink.darkest}` : '-'}`); }
  // open Format
  const f = top2.items[0]; await page.mouse.click(f.cnt.l + f.cnt.w / 2, f.cnt.t + f.cnt.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(400);
  const vis = await M.visibleMenupopups(page); console.log('visible popups', JSON.stringify(vis));
  if (vis.length) {
    const { g, S } = await M.measurePopup(page, vis[0].i, 'p4c-colorbox-format-popup.png');
    // the swatch is not an <img>/<i>: find it per row and ink-box it
    const sw = await page.evaluate((idx) => { const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; }; const p = document.querySelectorAll('.z-menupopup')[idx]; return [...p.querySelectorAll('.z-menupopup-content > li')].map(li => { const a = li.querySelector(':scope > a'); return { label: li.textContent.trim(), children: a ? [...a.children].map(c => ({ tag: c.tagName, cls: c.className, rect: R(c), display: getComputedStyle(c).display, bg: getComputedStyle(c).backgroundColor, ml: getComputedStyle(c).marginLeft, mr: getComputedStyle(c).marginRight, w: getComputedStyle(c).width, h: getComputedStyle(c).height })) : [] }; }); }, vis[0].i);
    out.format = { g, sw };
    console.log('Format popup', JSON.stringify(g.popup));
    for (const [i, r] of g.rows.entries()) {
      if (r.kind === 'separator') { console.log('  ---- separator'); continue; }
      const row = sw[i]; const swatch = row.children.find(c => /z-colorbox-color/.test(c.cls));
      let swInk = null; if (swatch && swatch.display !== 'none') { const y0 = r.cnt.t + 2, y1 = r.cnt.b - 3; swInk = M.inkBox(S, swatch.rect.l - 2, swatch.rect.r + 2, y0, y1, r.px.base, 8); }
      console.log(`  ${r.kind.padEnd(8)} ${r.label.padEnd(16)} h ${r.cnt.h} textInk popup+${r.px.textFromPopup} | swatch ${swatch ? `${swatch.tag}.${swatch.cls} box ${swatch.rect.l}-${swatch.rect.r} ${swatch.rect.w}x${swatch.rect.h} display ${swatch.display} bg ${swatch.bg} m ${swatch.ml}/${swatch.mr}` : '-'} ink ${swInk ? `${swInk.l}-${swInk.r} x ${swInk.t}-${swInk.b} ${swInk.w}x${swInk.h} cx popup+${((swInk.l + swInk.r) / 2 - g.popup.l).toFixed(2)} cyOff ${((swInk.t + swInk.b) / 2 - (r.cnt.t + r.cnt.b) / 2).toFixed(2)} colour ${swInk.darkest}` : '-'} arrow ${r.px.arrow ? `${r.px.arrow.l}-${r.px.arrow.r}` : '-'} | children ${row.children.map(c => c.cls).join(', ')}`);
      r.swatch = swatch; r.swInk = swInk;
    }
  }
  L.save('final-p4-colorbox.json', out);
  await ctx.close(); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
