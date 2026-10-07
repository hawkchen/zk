// #13 chosenbox creatable row (.z-chosenbox-empty-creatable): icon→text gap, vertical centre delta,
// left alignment vs .z-chosenbox-option text, DOM shape explaining the gap, protections (row hit test, hover block width).
// Output: red13.json, red13-*.png
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'chosenbox.zul');
  const out = {};
  // the "createMessage + noResultsText" chosenbox = last creatable widget (what Jess's screenshot shows)
  const uuid = await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox')].map(n => zk.$(n)).filter(w => w._creatable).pop().uuid);
  out.uuid = uuid;
  const textRect = (el) => { const r = document.createRange(); const t = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!t) return null; r.selectNodeContents(t); return r.getBoundingClientRect().toJSON(); };
  // 1) open with empty input: option rows visible -> reference text left edge of .z-chosenbox-option
  await page.click('#' + uuid + ' input'); await L.settle(page);
  out.optionsOpen = await page.evaluate(([uuid, tr]) => { const f = new Function('el', 'return (' + tr + ')(el)');
    const pp = document.getElementById(uuid + '-pp'); const cs = getComputedStyle(pp);
    return { popup: pp.getBoundingClientRect().toJSON(), popupBorder: [cs.borderLeftWidth, cs.borderRightWidth], popupPadding: [cs.paddingLeft, cs.paddingRight],
      options: [...pp.querySelectorAll('.z-chosenbox-option')].filter(o => getComputedStyle(o).display !== 'none').map(o => { const ocs = getComputedStyle(o); return { text: o.textContent, rect: o.getBoundingClientRect().toJSON(), textRect: f(o), paddingLeft: ocs.paddingLeft, display: ocs.display, cls: o.className }; }) }; }, [uuid, textRect.toString()]);
  await L.shot(page, 'red13-options.png', { x: out.optionsOpen.popup.x - 10, y: out.optionsOpen.popup.y - 60, width: out.optionsOpen.popup.width + 20, height: out.optionsOpen.popup.height + 80 });
  // 2) type a word that matches nothing -> creatable row
  await page.keyboard.type('ffff'); await L.settle(page);
  out.creatable = await page.evaluate(([uuid, tr]) => { const f = new Function('el', 'return (' + tr + ')(el)');
    const pp = document.getElementById(uuid + '-pp'); const row = pp.querySelector('.z-chosenbox-empty-creatable');
    const icon = row.querySelector('i, .z-chosenbox-create'); const span = row.querySelector('span');
    const rcs = getComputedStyle(row), ics = getComputedStyle(icon), bcs = getComputedStyle(icon, '::before'), scs = span ? getComputedStyle(span) : null;
    const iconRange = document.createRange(); iconRange.selectNodeContents(icon);
    return { popup: pp.getBoundingClientRect().toJSON(), popupHtml: pp.outerHTML.slice(0, 1200),
      row: { cls: row.className, html: row.outerHTML, rect: row.getBoundingClientRect().toJSON(), display: rcs.display, gap: rcs.gap, columnGap: rcs.columnGap, alignItems: rcs.alignItems, paddingLeft: rcs.paddingLeft, lineHeight: rcs.lineHeight, fontSize: rcs.fontSize,
        children: [...row.childNodes].map(n => n.nodeType === 3 ? { type: 'text', text: n.textContent } : { type: 'el', tag: n.tagName, cls: n.className, text: n.textContent }) },
      icon: { tag: icon.tagName, cls: icon.className, rect: icon.getBoundingClientRect().toJSON(), display: ics.display, width: ics.width, marginRight: ics.marginRight, fontSize: ics.fontSize, lineHeight: ics.lineHeight, verticalAlign: ics.verticalAlign, beforeContent: bcs.content, beforeDisplay: bcs.display, beforeWidth: bcs.width, beforeHeight: bcs.height, beforeMask: bcs.maskImage && bcs.maskImage.slice(0, 40), beforeBg: bcs.backgroundColor },
      span: span ? { rect: span.getBoundingClientRect().toJSON(), textRect: f(span), display: scs.display, marginLeft: scs.marginLeft, paddingLeft: scs.paddingLeft, text: span.textContent } : null,
      rowTextRect: f(row) }; }, [uuid, textRect.toString()]);
  const c = out.creatable;
  const txt = c.span ? (c.span.textRect || c.span.rect) : c.rowTextRect;
  const iconR = c.icon.rect;
  out.judgments = {
    gapIconRightToTextLeft: +(txt.x - iconR.right).toFixed(2),
    gapIconRightToSpanLeft: c.span ? +(c.span.rect.x - iconR.right).toFixed(2) : null,
    vCentreDelta: +((iconR.y + iconR.height / 2) - (txt.y + txt.height / 2)).toFixed(2),
    iconLeftVsOptionTextLeft: +(iconR.x - out.optionsOpen.options[0].textRect.x).toFixed(2),
    textLeftVsOptionTextLeft: +(txt.x - out.optionsOpen.options[0].textRect.x).toFixed(2),
    rowLeftVsOptionLeft: +(c.row.rect.x - out.optionsOpen.options[0].rect.x).toFixed(2),
  };
  const P = c.popup;
  await L.shot(page, 'red13-creatable.png', { x: P.x - 10, y: P.y - 60, width: P.width + 20, height: P.height + 80 });
  // pixel: icon glyph extents (ink) vs text ink on the row, using a 2x crop of the row
  const S = await L.shot(page, 'red13-row.png', { x: P.x, y: c.row.rect.y, width: P.width, height: c.row.rect.height });
  const rowY0 = c.row.rect.y, rowY1 = c.row.rect.y + c.row.rect.height - 1;
  const bgRow = L.median(S.rect(P.x + P.width - 6, P.x + P.width - 2, rowY0 + 2, rowY1 - 2).map(p => p.c)); // row background (hover block or popup bg) sampled at the right end
  const ink = S.rect(P.x + 1, P.x + P.width - 2, rowY0, rowY1).filter(p => L.dE(p.c, bgRow) >= 20);
  const inkIcon = ink.filter(p => p.x >= iconR.x - 0.5 && p.x <= iconR.right + 0.5), inkText = ink.filter(p => p.x >= txt.x - 0.5);
  const ext = a => a.length ? { x0: Math.min(...a.map(p => p.x)), x1: Math.max(...a.map(p => p.x)) + 0.5, y0: Math.min(...a.map(p => p.y)), y1: Math.max(...a.map(p => p.y)) + 0.5 } : null;
  out.ink = { rowBg: bgRow, icon: ext(inkIcon), text: ext(inkText) };
  if (out.ink.icon && out.ink.text) out.ink.gapInk = +(out.ink.text.x0 - out.ink.icon.x1).toFixed(2), out.ink.vCentreDeltaInk = +(((out.ink.icon.y0 + out.ink.icon.y1) / 2) - ((out.ink.text.y0 + out.ink.text.y1) / 2)).toFixed(2);
  // protections: whole row clickable (hit test at 5 x positions), hover block covers the full popup inner width
  out.protect = await page.evaluate(uuid => { const pp = document.getElementById(uuid + '-pp'); const row = pp.querySelector('.z-chosenbox-empty-creatable'); const r = row.getBoundingClientRect(); const cs = getComputedStyle(pp);
    const xs = [r.x + 2, r.x + r.width * 0.25, r.x + r.width / 2, r.x + r.width * 0.75, r.right - 2];
    return { rowCls: row.className, hits: xs.map(x => { const e = document.elementFromPoint(x, r.y + r.height / 2); return { x: +x.toFixed(1), hit: e ? e.tagName + '.' + e.className.slice(0, 50) : null, inRow: !!(e && (e === row || row.contains(e))) }; }),
      popupInner: { left: pp.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth), right: pp.getBoundingClientRect().right - parseFloat(cs.borderRightWidth) }, rowRect: r.toJSON(), rowBg: getComputedStyle(row).backgroundColor, popupBg: cs.backgroundColor }; }, uuid);
  // hover block extent at the row's mid-y: pixels that differ from the popup background (white)
  const popBg = L.median(S.rect(P.x + 2, P.x + 6, rowY0 + 1, rowY0 + 2).map(p => p.c));
  const midY = Math.round(rowY0 + c.row.rect.height / 2);
  const line = S.rect(P.x + 1, P.x + P.width - 2, midY, midY);
  const edgeY = S.rect(P.x + 1, P.x + P.width - 2, rowY0 + 2, rowY0 + 2); // 2px below the row top: hover block without glyphs
  const blk = edgeY.filter(p => L.dE(p.c, [255, 255, 255]) >= 1.5);
  out.hoverBlock = { rowTopPlus2_nonWhite: blk.length ? { x0: Math.min(...blk.map(p => p.x)), x1: Math.max(...blk.map(p => p.x)) + 0.5, colour: L.median(blk.map(p => p.c)) } : null, popupInner: out.protect.popupInner, sampleMidY: line.filter((p, i) => i % 40 === 0).map(p => [p.x, p.c]) };
  // click the row: a chip "ffff" must appear
  await page.mouse.click(c.row.rect.x + c.row.rect.width / 2, c.row.rect.y + c.row.rect.height / 2); await L.settle(page);
  out.clickRow = { chips: await page.evaluate(uuid => [...document.getElementById(uuid).querySelectorAll('.z-chosenbox-item-content')].map(e => e.textContent), uuid) };
  // the same row in the first creatable widget ("Add new", no {0}) for completeness
  const u2 = await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox')].map(n => zk.$(n)).filter(w => w._creatable)[0].uuid);
  await page.click('#' + u2 + ' input'); await page.keyboard.type('zzz'); await L.settle(page);
  out.firstCreatable = await page.evaluate(([u2, tr]) => { const f = new Function('el', 'return (' + tr + ')(el)'); const row = document.getElementById(u2 + '-pp').querySelector('.z-chosenbox-empty-creatable'); const icon = row.querySelector('i'); const span = row.querySelector('span');
    return { html: row.outerHTML, icon: icon.getBoundingClientRect().toJSON(), spanText: span ? f(span) : null, gap: span ? +(f(span).x - icon.getBoundingClientRect().right).toFixed(2) : null }; }, [u2, textRect.toString()]);
  await ctx.close();
  // forced-colors one-off record: is the plus icon visible on the creatable row?
  const fc = await L.open(browser, 'chosenbox.zul', { forcedColors: 'active' });
  const fu = await fc.page.evaluate(() => [...document.querySelectorAll('.z-chosenbox')].map(n => zk.$(n)).filter(w => w._creatable).pop().uuid);
  await fc.page.click('#' + fu + ' input'); await fc.page.keyboard.type('ffff'); await L.settle(fc.page);
  const fr = await fc.page.evaluate(fu => { const row = document.getElementById(fu + '-pp').querySelector('.z-chosenbox-empty-creatable'); const i = row.querySelector('i'); return { icon: i.getBoundingClientRect().toJSON(), row: row.getBoundingClientRect().toJSON(), popup: document.getElementById(fu + '-pp').getBoundingClientRect().toJSON() }; }, fu);
  const FS = await L.shot(fc.page, 'red13-forced-colors.png', { x: fr.popup.x - 10, y: fr.popup.y - 60, width: fr.popup.width + 20, height: fr.popup.height + 80 });
  const fbg = L.median(FS.rect(fr.row.right - 6, fr.row.right - 2, fr.row.y + 2, fr.row.y + fr.row.height - 2).map(p => p.c));
  out.forcedColors = { rowBg: fbg, iconInkPixels: FS.rect(fr.icon.x, fr.icon.right, fr.icon.y, fr.icon.bottom).filter(p => L.dE(p.c, fbg) >= 20).length };
  await fc.ctx.close();
  L.save('red13.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
