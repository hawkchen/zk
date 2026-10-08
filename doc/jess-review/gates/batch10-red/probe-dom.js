// DOM reconnaissance for batch 10 (no judgments): class names, rects and a few computed values per page. Output: probe-dom.json
const L = require('./lib');
const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };

(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  { // button.zul
    const { ctx, page } = await L.open(browser, 'button.zul');
    out.button = await page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      return [...document.querySelectorAll('.z-button')].map(b => { const s = getComputedStyle(b); return { cls: b.className, tag: b.tagName, disabled: b.disabled, rect: R(b), boxShadow: s.boxShadow, bg: s.backgroundColor, color: s.color, cursor: s.cursor, parentBg: getComputedStyle(b.parentElement).backgroundColor }; });
    }, R.toString());
    out.buttonBodyBg = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector('.z-p-8')).backgroundColor]);
    await ctx.close();
  }
  { // calendar.zul
    const { ctx, page } = await L.open(browser, 'calendar.zul');
    out.calendar = await page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      const cals = [...document.querySelectorAll('.z-calendar')];
      return cals.map((c, i) => { const cells = [...c.querySelectorAll('td')]; return { i, rect: R(c), cls: c.className, head: [...c.querySelectorAll('th')].map(t => ({ cls: t.className, txt: t.textContent, color: getComputedStyle(t).color })), cells: cells.slice(0, 50).map(td => { const s = getComputedStyle(td); return { cls: td.className, txt: td.textContent.trim(), color: s.color, td: s.textDecorationLine, cursor: s.cursor, pe: s.pointerEvents, opacity: s.opacity, rect: R(td) }; }) }; });
    }, R.toString());
    await ctx.close();
  }
  { // label.zul
    const { ctx, page } = await L.open(browser, 'label.zul');
    out.label = await page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      const sels = ['.z-checkbox', '.z-checkbox-content', '.z-checkbox-mold', '.z-checkbox input', '.z-radio', '.z-radio-content', '.z-radio-mold', '.z-radio input', '.z-radiogroup', '.z-label', '.z-textbox'];
      const o = {};
      for (const sel of sels) o[sel] = [...document.querySelectorAll(sel)].slice(0, 6).map(e => { const s = getComputedStyle(e); return { tag: e.tagName, cls: e.className, txt: (e.textContent || '').trim().slice(0, 30), rect: R(e), fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, fontFamily: s.fontFamily.slice(0, 40), minHeight: s.minHeight, height: s.height, display: s.display, alignItems: s.alignItems, verticalAlign: s.verticalAlign, parentCls: e.parentElement.className, html: e.outerHTML.slice(0, 200) }; });
      return o;
    }, R.toString());
    await ctx.close();
  }
  { // checkbox.zul
    const { ctx, page } = await L.open(browser, 'checkbox.zul');
    out.checkboxPage = await page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      const o = {};
      for (const sel of ['.z-checkbox', '.z-checkbox-content', '.z-radio', '.z-radio-content']) o[sel] = [...document.querySelectorAll(sel)].slice(0, 4).map(e => { const s = getComputedStyle(e); return { cls: e.className, txt: (e.textContent || '').trim().slice(0, 30), rect: R(e), fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight }; });
      o.radioZul = !!document.querySelector('.z-radio');
      return o;
    }, R.toString());
    await ctx.close();
  }
  { // fisheyebar.zul
    const { ctx, page } = await L.open(browser, 'fisheyebar.zul');
    const dump = () => page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      const bar = document.querySelector('.z-fisheyebar'); const bs = getComputedStyle(bar);
      return { bar: { cls: bar.className, rect: R(bar), style: bar.getAttribute('style'), display: bs.display, flexDirection: bs.flexDirection, position: bs.position, width: bs.width, height: bs.height, overflow: bs.overflow, html: bar.outerHTML.slice(0, 600) },
        items: [...bar.querySelectorAll('.z-fisheye')].map(f => { const s = getComputedStyle(f); const img = f.querySelector('.z-fisheye-image'); const is = img && getComputedStyle(img); const t = f.querySelector('.z-fisheye-text'); return { cls: f.className, rect: R(f), style: f.getAttribute('style'), position: s.position, display: s.display, width: s.width, height: s.height, flex: s.flex, img: img ? { tag: img.tagName, cls: img.className, rect: R(img), style: img.getAttribute('style'), width: is.width, height: is.height, display: is.display, objectFit: is.objectFit, natural: [img.naturalWidth, img.naturalHeight] } : null, text: t ? { rect: R(t), style: t.getAttribute('style'), display: getComputedStyle(t).display } : null }; }) };
    }, R.toString());
    out.fisheyeH = await dump();
    await page.getByText('Vertical orient').click(); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(400);
    out.fisheyeV = await dump();
    await L.shot(page, 'probe-fisheye-vertical.png');
    await ctx.close();
  }
  for (const pg of ['portallayout.zul', 'tbeditor.zul']) { // tbeditor
    const { ctx, page } = await L.open(browser, pg);
    out[pg] = await page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      const eds = [...document.querySelectorAll('.z-tbeditor')];
      return eds.slice(0, 1).map(ed => { const tb = ed.querySelector('.z-tbeditor-toolbar') || ed.querySelector('[class*=toolbar]'); return { cls: ed.className, rect: R(ed), html: ed.outerHTML.slice(0, 2500), toolbar: tb ? { cls: tb.className, rect: R(tb), children: [...tb.querySelectorAll('*')].slice(0, 80).map(e => { const s = getComputedStyle(e); const b = getComputedStyle(e, '::before'); return { tag: e.tagName, cls: e.className, rect: R(e), fontSize: s.fontSize, fontFamily: s.fontFamily.slice(0, 30), color: s.color, bg: s.backgroundColor, fontWeight: s.fontWeight, display: s.display, beforeContent: b.content, beforeMask: (b.webkitMaskImage || b.maskImage || '').slice(0, 60), beforeFont: b.fontFamily.slice(0, 30), beforeSize: b.fontSize, beforeColor: b.color, beforeBg: b.backgroundColor, beforeW: b.width, beforeH: b.height, bgImage: s.backgroundImage.slice(0, 60), mask: (s.webkitMaskImage || s.maskImage || '').slice(0, 60) }; }) } : null }; });
    }, R.toString());
    await ctx.close();
  }
  { // utility/icons.zul
    const { ctx, page } = await L.open(browser, 'utility/icons.zul');
    out.icons = await page.evaluate((Rs) => {
      const R = new Function('e', 'return (' + Rs + ')(e)');
      const els = [...document.querySelectorAll('[class*=z-icon-]')].slice(0, 40);
      return { count: document.querySelectorAll('[class*=z-icon-]').length, bodyHtml: document.body.innerHTML.slice(0, 3000), els: els.map(e => { const s = getComputedStyle(e); const b = getComputedStyle(e, '::before'); return { tag: e.tagName, cls: e.className, rect: R(e), fontSize: s.fontSize, fontFamily: s.fontFamily.slice(0, 30), color: s.color, fontWeight: s.fontWeight, display: s.display, width: s.width, height: s.height, beforeContent: b.content, beforeMask: (b.webkitMaskImage || b.maskImage || '').slice(0, 80), beforeFont: b.fontFamily.slice(0, 30), beforeSize: b.fontSize, beforeW: b.width, beforeH: b.height, beforeBg: b.backgroundColor, beforeColor: b.color, mask: (s.webkitMaskImage || s.maskImage || '').slice(0, 80), bgImage: s.backgroundImage.slice(0, 60), parentCls: e.parentElement.className, parentFont: getComputedStyle(e.parentElement).fontSize }; }) };
    }, R.toString());
    await ctx.close();
  }
  L.save('probe-dom.json', out);
  await browser.close();
  console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
