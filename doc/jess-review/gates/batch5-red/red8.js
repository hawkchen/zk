// #8 cascader: reproduce Jess's dropdown (single column with hover, multi-column expanded, pre-selected path),
// measure where the hover/selected highlight of the last column ends vs the popup inner right edge (pixels + rects).
// Output: red8.json, red8-*.png
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  async function run(opts, tag) {
    const { ctx, page } = await L.open(browser, 'cascader.zul', opts);
    const out = {};
    const ids = await page.evaluate(() => { const all = [...document.querySelectorAll('.z-cascader')]; return { def: all[0].id, pre: all[3].id, ph: all[2].id }; });
    out.ids = ids;
    const popupInfo = (id) => page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const cs = getComputedStyle(pp);
      const caves = [...pp.querySelectorAll('.z-cascader-cave')];
      return { popup: pp.getBoundingClientRect().toJSON(), inlineStyle: pp.getAttribute('style'), display: cs.display, width: cs.width, minWidth: cs.minWidth, border: [cs.borderLeftWidth, cs.borderRightWidth], padding: [cs.paddingLeft, cs.paddingRight], popupBg: cs.backgroundColor, popupDisplayInner: cs.display, flex: cs.flexDirection,
        innerRight: pp.getBoundingClientRect().right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight), innerLeft: pp.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft),
        caves: caves.map(c => { const ccs = getComputedStyle(c); return { rect: c.getBoundingClientRect().toJSON(), display: ccs.display, width: ccs.width, minWidth: ccs.minWidth, flex: ccs.flex, items: [...c.querySelectorAll('.z-cascader-item')].map(li => { const lcs = getComputedStyle(li); return { text: li.firstChild.textContent, cls: li.className, rect: li.getBoundingClientRect().toJSON(), bg: lcs.backgroundColor, display: lcs.display, width: lcs.width }; }) }; }),
        trigger: document.getElementById(id).getBoundingClientRect().toJSON() }; }, id);
    // highlight extent at the item's mid-y: pixels that differ from the popup background, scanned across the popup inner width
    async function highlight(S, info, li, file) {
      const y = Math.round(li.rect.y + 3); // 3px below the item top: background band, above the glyphs
      const y2 = Math.round(li.rect.y + li.rect.height / 2);
      const bg = L.parseRgb(info.popupBg) ? L.over(L.parseRgb(info.popupBg).length > 3 ? L.parseRgb(info.popupBg) : [...L.parseRgb(info.popupBg), 1]) : [255, 255, 255];
      // sample inner pixels only: x in [innerLeft, innerRight - 1] CSS px (the popup's 1px right border column is excluded);
      // report contiguous non-background segments along the first device row so a border/separator line cannot extend a block
      const band = (yy) => { const px = S.rect(info.innerLeft, info.innerRight - 1, yy, yy); const row0 = px[0].dy; const line = px.filter(p => p.dy === row0).sort((a, b) => a.dx - b.dx);
        const segs = []; let cur = null; for (const p of line) { const h = L.dE(p.c, bg) >= 1.5; if (h) { if (cur && p.dx === cur.lastDx + 1) { cur.lastDx = p.dx; cur.px.push(p); } else { cur = { x0: p.x, lastDx: p.dx, px: [p] }; segs.push(cur); } } }
        return segs.map(sg => ({ x0: sg.x0, x1: (sg.lastDx + 1) / S.dpr, widthCss: +((sg.lastDx + 1) / S.dpr - sg.x0).toFixed(1), colour: L.median(sg.px.map(p => p.c)) })).filter(sg => sg.widthCss >= 2); };
      const top = band(y), mid = band(y2);
      const blk = top.length ? top.reduce((a, b) => b.widthCss > a.widthCss ? b : a) : null; // the widest segment = the highlight block (if any)
      return { item: li.text, cls: li.cls, itemRect: li.rect, itemRight: li.rect.right, popupInnerRight: info.innerRight, popupInnerLeft: info.innerLeft, popupRight: info.popup.right,
        gapItemRightToInnerRight: +(info.innerRight - li.rect.right).toFixed(2),
        segmentsAtTopPlus3: top, segmentsAtMid: mid, block: blk,
        gapHighlightRightToInnerRight: blk ? +(info.innerRight - blk.x1).toFixed(2) : null, gapHighlightLeftToInnerLeft: blk ? +(blk.x0 - info.innerLeft).toFixed(2) : null, bgUsed: bg };
    }
    // A) default cascader, open, hover "Japan" (Jess's screenshot)
    await page.click('#' + ids.def, { position: { x: 180, y: 20 } }); await L.settle(page);
    let info = await popupInfo(ids.def);
    const japan = info.caves[0].items[1];
    await page.mouse.move(japan.rect.x + 30, japan.rect.y + japan.rect.height / 2); await page.waitForTimeout(250);
    info = await popupInfo(ids.def);
    const P = info.popup; const clipOf = (P) => ({ x: P.x - 12, y: P.y - 50, width: P.width + 70, height: P.height + 24 });
    let S = await L.shot(page, `red8-${tag}-A-single-hover.png`, clipOf(P));
    out.A_singleHover = { info, highlight: await highlight(S, info, info.caves[0].items[1]),
      stripHitTest: await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const li = pp.querySelectorAll('.z-cascader-item')[1]; const r = li.getBoundingClientRect(); const pr = pp.getBoundingClientRect();
        return [r.right - 2, r.right + 2, (r.right + pr.right) / 2, pr.right - 2].map(x => { const e = document.elementFromPoint(x, r.y + r.height / 2); return { x: +x.toFixed(1), hit: e ? e.tagName + '.' + e.className.slice(0, 40) : null, onItem: !!(e && (e === li || li.contains(e))) }; }); }, ids.def) };
    // does clicking in the strip open the sub-column? (compare cave count before/after)
    const stripX = (japan.rect.right + info.popup.right - 1) / 2;
    await page.mouse.click(stripX, japan.rect.y + japan.rect.height / 2); await L.settle(page);
    out.A_singleHover.stripClick = { x: stripX, cavesAfter: (await popupInfo(ids.def)).caves.length, popupOpen: await page.evaluate(id => getComputedStyle(document.getElementById(id + '-pp')).display !== 'none', ids.def) };
    if (!out.A_singleHover.stripClick.popupOpen) { await page.click('#' + ids.def, { position: { x: 60, y: 20 } }); await L.settle(page); }
    // B) click "Japan" -> second column; hover "Kyoto" in the last column
    await page.mouse.click(japan.rect.x + 30, japan.rect.y + japan.rect.height / 2); await L.settle(page);
    info = await popupInfo(ids.def);
    const last = info.caves[info.caves.length - 1];
    const kyoto = last.items[last.items.length - 1];
    await page.mouse.move(kyoto.rect.x + 20, kyoto.rect.y + kyoto.rect.height / 2); await page.waitForTimeout(250);
    info = await popupInfo(ids.def);
    S = await L.shot(page, `red8-${tag}-B-multi-hover.png`, clipOf(info.popup));
    out.B_multiHover = { info, highlightLastCol: await highlight(S, info, info.caves[info.caves.length - 1].items[info.caves[info.caves.length - 1].items.length - 1]), highlightFirstColJapan: await highlight(S, info, info.caves[0].items[1]) };
    await page.keyboard.press('Escape'); await page.mouse.move(2, 2); await L.settle(page);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(200);
    // C) pre-selected path (Japan / Kyoto): scroll it into view (its popup would fall below the 900px viewport), open, no hover -> selected highlight in both columns
    await page.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'center' }), ids.pre); await page.waitForTimeout(200);
    await page.click('#' + ids.pre, { position: { x: 60, y: 20 } }); await L.settle(page); // x=60: on the label, away from the clear (×) icon at the right end
    await page.mouse.move(2, 2); await page.waitForTimeout(250);
    info = await popupInfo(ids.pre);
    S = await L.shot(page, `red8-${tag}-C-preselected.png`, clipOf(info.popup));
    const lastC = info.caves[info.caves.length - 1];
    out.C_preselected = { info, highlightLastColSelected: await highlight(S, info, lastC.items.find(i => /selected/.test(i.cls)) || lastC.items[0]), highlightFirstColSelected: await highlight(S, info, info.caves[0].items.find(i => /selected/.test(i.cls))) };
    // D) single column, item hovered at the far right of the popup: is the pointer still "on" the item there? (hit test across the row)
    out.D_hitTest = await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const li = pp.querySelector('.z-cascader-cave:last-child .z-cascader-item'); const r = li.getBoundingClientRect(); const pr = pp.getBoundingClientRect();
      return [r.x + 2, r.right - 2, r.right + 2, pr.right - 2].map(x => { const e = document.elementFromPoint(x, r.y + r.height / 2); return { x: +x.toFixed(1), hit: e ? e.tagName + '.' + e.className.slice(0, 40) : null, onItem: !!(e && (e === li || li.contains(e))) }; }); }, ids.pre);
    await ctx.close();
    return out;
  }
  const out = { default: await run({}, 'default') };
  const fc = await run({ forcedColors: 'active' }, 'forced');
  out.forcedColors = { A: fc.A_singleHover.highlight, B_last: fc.B_multiHover.highlightLastCol };
  L.save('red8.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
