// #8 FINAL protections beyond red8.js: cave heights not stretched, tall cave (max-height) scrolls, expand behaviour
// (cave count grows on click), third level if the page has one, popup hidden when closed. Pixels/rects + hit tests only.
// Output: final-red8-protect.json, final-red8-protect-*.png
const L = require('./final-lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'cascader.zul');
  const out = {};
  const all = await page.evaluate(() => [...document.querySelectorAll('.z-cascader')].map((n, i) => ({ i, id: n.id, cls: n.className, rect: n.getBoundingClientRect().toJSON(), text: n.textContent.trim().slice(0, 40) })));
  out.widgets = all;
  const popupState = (id) => page.evaluate(id => { const pp = document.getElementById(id + '-pp'); if (!pp) return null; const cs = getComputedStyle(pp);
    return { display: cs.display, visible: cs.display !== 'none' && pp.getBoundingClientRect().height > 0, rect: pp.getBoundingClientRect().toJSON(), inline: pp.getAttribute('style'),
      caves: [...pp.querySelectorAll('.z-cascader-cave')].map(c => { const items = [...c.querySelectorAll('.z-cascader-item')]; const r = c.getBoundingClientRect();
        return { rect: r.toJSON(), scrollH: c.scrollHeight, clientH: c.clientHeight, scrollTop: c.scrollTop, overflowY: getComputedStyle(c).overflowY, maxHeight: getComputedStyle(c).maxHeight, nItems: items.length,
          sumItemH: +items.reduce((a, li) => a + li.getBoundingClientRect().height, 0).toFixed(2), firstItemTop: items.length ? items[0].getBoundingClientRect().top : null, lastItemBottom: items.length ? items[items.length - 1].getBoundingClientRect().bottom : null,
          padTop: getComputedStyle(c).paddingTop, padBottom: getComputedStyle(c).paddingBottom }; }) }; }, id);
  // every widget: open, walk the first item of each column as deep as it goes (records the max depth available on the page)
  out.walk = [];
  for (const w of all) {
    if (/disabled/.test(w.cls)) { out.walk.push({ i: w.i, skipped: 'disabled' }); continue; }
    await page.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'center' }), w.id); await page.waitForTimeout(150);
    const closedBefore = await popupState(w.id);
    await page.click('#' + w.id, { position: { x: 60, y: 20 } }); await L.settle(page);
    let st = await popupState(w.id);
    if (!st || !st.visible) { out.walk.push({ i: w.i, opened: false, closedBefore }); continue; }
    const rec = { i: w.i, opened: true, closedBefore: closedBefore && { display: closedBefore.display, visible: closedBefore.visible }, levels: [] };
    for (let depth = 0; depth < 5; depth++) {
      st = await popupState(w.id);
      const cave = st.caves[st.caves.length - 1];
      rec.levels.push({ depth: depth + 1, nCaves: st.caves.length, popupW: +st.rect.width.toFixed(2), sumCaveW: +st.caves.reduce((a, c) => a + c.rect.width, 0).toFixed(2), caveWidths: st.caves.map(c => +c.rect.width.toFixed(2)), caveHeights: st.caves.map(c => +c.rect.height.toFixed(2)), sumItemH: st.caves.map(c => c.sumItemH), scroll: st.caves.map(c => ({ scrollH: c.scrollH, clientH: c.clientH, overflowY: c.overflowY, maxHeight: c.maxHeight })) });
      // click the first item of the last cave that has children (the one carrying an arrow icon), if any
      const next = await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const caves = pp.querySelectorAll('.z-cascader-cave'); const last = caves[caves.length - 1];
        const li = [...last.querySelectorAll('.z-cascader-item')].find(li => li.querySelector('.z-cascader-icon, [class*="icon"]')); return li ? li.getBoundingClientRect().toJSON() : null; }, w.id);
      if (!next) break;
      await page.mouse.click(next.x + 30, next.y + next.height / 2); await L.settle(page);
      const st2 = await popupState(w.id);
      if (!st2 || !st2.visible || st2.caves.length <= st.caves.length) { rec.levels[rec.levels.length - 1].clickDidNotExpand = true; break; }
    }
    const final = await popupState(w.id);
    const P = final.rect;
    await L.shot(page, `final-red8-protect-w${w.i}.png`, { x: P.x - 12, y: P.y - 50, width: P.width + 70, height: P.height + 24 });
    // tall cave: if any cave scrolls, wheel inside it and confirm scrollTop moves
    const tall = final.caves.findIndex(c => c.scrollH > c.clientH + 1);
    if (tall >= 0) { const c = final.caves[tall]; await page.mouse.move(c.rect.x + c.rect.width / 2, c.rect.y + c.rect.height / 2); await page.mouse.wheel(0, 120); await page.waitForTimeout(250);
      const after = await popupState(w.id); rec.tallCave = { index: tall, before: { scrollTop: c.scrollTop, scrollH: c.scrollH, clientH: c.clientH, maxHeight: c.maxHeight, overflowY: c.overflowY }, afterWheel: { scrollTop: after.caves[tall].scrollTop }, scrolled: after.caves[tall].scrollTop > c.scrollTop };
      await L.shot(page, `final-red8-protect-w${w.i}-scrolled.png`, { x: P.x - 12, y: P.y - 50, width: P.width + 70, height: P.height + 24 }); }
    // close with Escape: popup hidden
    await page.keyboard.press('Escape'); await L.settle(page); await page.mouse.move(2, 2);
    const closed = await popupState(w.id);
    rec.afterEscape = closed && { display: closed.display, visible: closed.visible };
    if (closed && closed.visible) { await page.mouse.click(5, 5); await L.settle(page); const c2 = await popupState(w.id); rec.afterOutsideClick = c2 && { display: c2.display, visible: c2.visible }; }
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(150);
    out.walk.push(rec);
  }
  // if no cave on the page scrolls, force one: shrink the first widget's cave with an inline max-height (page-injected probe, not a judgment)
  if (!out.walk.some(w => w.tallCave)) {
    const w = all.find(w => !/disabled/.test(w.cls));
    await page.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'center' }), w.id);
    await page.click('#' + w.id, { position: { x: 60, y: 20 } }); await L.settle(page);
    const probe = await page.evaluate(id => { const c = document.getElementById(id + '-pp').querySelector('.z-cascader-cave'); const h0 = c.getBoundingClientRect().height; c.style.maxHeight = Math.round(h0 / 2) + 'px'; c.style.overflowY = 'auto';
      return { h0, rect: c.getBoundingClientRect().toJSON(), scrollH: c.scrollHeight, clientH: c.clientHeight, scrollTop: c.scrollTop }; }, w.id);
    await page.mouse.move(probe.rect.x + probe.rect.width / 2, probe.rect.y + probe.rect.height / 2); await page.mouse.wheel(0, 120); await page.waitForTimeout(250);
    const after = await page.evaluate(id => { const c = document.getElementById(id + '-pp').querySelector('.z-cascader-cave'); return { scrollTop: c.scrollTop, rect: c.getBoundingClientRect().toJSON() }; }, w.id);
    out.forcedTallCaveProbe = { note: 'page-injected inline max-height on the cave (no page on cascader.zul scrolls by itself)', before: probe, afterWheel: after, scrolled: after.scrollTop > probe.scrollTop };
    const P = await page.evaluate(id => document.getElementById(id + '-pp').getBoundingClientRect().toJSON(), w.id);
    await L.shot(page, 'final-red8-protect-forced-scroll.png', { x: P.x - 12, y: P.y - 50, width: P.width + 70, height: P.height + 24 });
    await page.keyboard.press('Escape'); await L.settle(page);
  }
  await ctx.close();
  L.save('final-red8-protect.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
