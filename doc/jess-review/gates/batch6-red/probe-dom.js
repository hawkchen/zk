// Batch 6 RED: DOM shape probe for the six preview pages (read-only; records rects, classes, computed cursor/background).
const L = require('./lib');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };

(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  // combobutton
  {
    const { ctx, page } = await L.open(browser, 'combobutton.zul');
    out.combobutton = await page.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      return [...document.querySelectorAll('.z-combobutton')].map(n => {
        const c = n.querySelector('.z-combobutton-content'), b = n.querySelector('.z-combobutton-button');
        const cs = e => { const s = getComputedStyle(e); return { bg: s.backgroundColor, color: s.color, opacity: s.opacity, cursor: s.cursor, borderLeft: s.borderLeftWidth + ' ' + s.borderLeftColor, position: s.position }; };
        const bef = e => { const s = getComputedStyle(e, '::before'); return { content: s.content, bg: s.backgroundColor, opacity: s.opacity }; };
        return { cls: n.className, html: n.outerHTML.slice(0, 400), root: R(n), rootCs: cs(n), content: R(c), contentCs: cs(c), contentBefore: bef(c), button: R(b), buttonCs: cs(b), buttonBefore: bef(b), disabled: zk.$(n)._disabled };
      });
    });
    await page.screenshot({ path: L.OUT + '/probe-combobutton.png' });
    await ctx.close();
  }
  // slider
  {
    const { ctx, page } = await L.open(browser, 'slider.zul');
    out.slider = await page.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      return [...document.querySelectorAll('.z-slider')].map(n => {
        const w = zk.$(n);
        return { cls: n.className, mold: w._mold, orient: w._orient, slidingtext: w._slidingtext, curpos: w._curpos, root: R(n), rootCursor: getComputedStyle(n).cursor,
          btn: R(n.querySelector('.z-slider-button')), btnCls: (n.querySelector('.z-slider-button') || {}).className, area: R(n.querySelector('.z-slider-area')), center: R(n.querySelector('.z-slider-center')),
          input: R(n.querySelector('.z-slider-input')), inputHtml: (n.querySelector('.z-slider-input') || {}).outerHTML, inputCs: (() => { const i = n.querySelector('.z-slider-input'); if (!i) return null; const s = getComputedStyle(i); return { bg: s.backgroundColor, border: s.borderWidth + ' ' + s.borderStyle + ' ' + s.borderColor, outline: s.outlineWidth + ' ' + s.outlineStyle + ' ' + s.outlineColor, color: s.color, fontSize: s.fontSize, fontWeight: s.fontWeight, textAlign: s.textAlign, fontFamily: s.fontFamily, boxShadow: s.boxShadow, radius: s.borderRadius }; })(),
          children: [...n.children].map(c => c.className + ' ' + JSON.stringify(R(c))) };
      });
    });
    await page.screenshot({ path: L.OUT + '/probe-slider.png' });
    await ctx.close();
  }
  for (const pg of ['multislider', 'rangeslider']) {
    const { ctx, page } = await L.open(browser, pg + '.zul');
    out[pg] = await page.evaluate((pg) => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      return [...document.querySelectorAll('.z-' + pg)].map(n => {
        const w = zk.$(n);
        const btns = [...n.querySelectorAll('.z-sliderbuttons-button, [id$="-start-btn"], [id$="-end-btn"], button')];
        return { cls: n.className, orient: w._orient, disabled: !!w._disabled, root: R(n), rootCursor: getComputedStyle(n).cursor, rootPadding: getComputedStyle(n).padding,
          track: R(n.querySelector('.z-' + pg + '-track')), trackCursor: n.querySelector('.z-' + pg + '-track') && getComputedStyle(n.querySelector('.z-' + pg + '-track')).cursor,
          marks: [...n.querySelectorAll('.z-' + pg + '-mark')].slice(0, 3).map(m => m.outerHTML.slice(0, 200)),
          btns: btns.map(b => ({ id: b.id, cls: b.className, rect: R(b), cursor: getComputedStyle(b).cursor, style: b.getAttribute('style') })),
          children: [...n.children].map(c => c.className + ' ' + JSON.stringify(R(c))),
          html: n.outerHTML.slice(0, 900) };
      });
    }, pg);
    await page.screenshot({ path: L.OUT + '/probe-' + pg + '.png', fullPage: true });
    await ctx.close();
  }
  // rating
  {
    const { ctx, page } = await L.open(browser, 'rating.zul');
    out.rating = await page.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      return [...document.querySelectorAll('.z-rating')].map(n => {
        const w = zk.$(n);
        return { cls: n.className, orient: w._orient, disabled: !!w._disabled, readonly: !!w._readonly, rating: w._rating, root: R(n), rootCursor: getComputedStyle(n).cursor, display: getComputedStyle(n).display, gap: getComputedStyle(n).gap,
          stars: [...n.querySelectorAll('i')].map(i => ({ cls: i.className, rect: R(i), cursor: getComputedStyle(i).cursor, pe: getComputedStyle(i).pointerEvents })) };
      });
    });
    await page.screenshot({ path: L.OUT + '/probe-rating.png', fullPage: true });
    await ctx.close();
  }
  // inputgroup
  {
    const { ctx, page } = await L.open(browser, 'inputgroup.zul');
    out.inputgroup = await page.evaluate(() => {
      const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
      const bw = e => { const s = getComputedStyle(e); return [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth].join(' ') + ' | ' + s.borderTopColor + ' ' + s.borderLeftColor; };
      return [...document.querySelectorAll('.z-inputgroup')].map(n => {
        const w = zk.$(n);
        return { cls: n.className, vertical: w._orient, root: R(n), rootBorder: bw(n), rootBg: getComputedStyle(n).backgroundColor,
          children: [...n.children].map(c => ({ tag: c.tagName, cls: c.className, rect: R(c), border: bw(c), bg: getComputedStyle(c).backgroundColor, text: (c.textContent || '').trim().slice(0, 30), inner: [...c.querySelectorAll('input,textarea,button')].map(i => ({ cls: i.className, rect: R(i), border: bw(i), bg: getComputedStyle(i).backgroundColor })) })) };
      });
    });
    await page.screenshot({ path: L.OUT + '/probe-inputgroup.png', fullPage: true });
    await ctx.close();
  }
  L.save('probe-dom.json', out);
  await browser.close();
  console.log(JSON.stringify(out, null, 1).slice(0, 60000));
})().catch(e => { console.error(e); process.exit(1); });
