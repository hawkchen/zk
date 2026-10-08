// Batch 7 RED, DOM-shape probe (no judgments): selectbox / combobox / bandbox popup / plain listbox.
// Records tag, classes, rects, scrollbar widths and a few computed values that explain the DOM, never a CSS diff.
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const out = { ua: null, pages: {} };
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
  // ---- selectbox.zul
  {
    const { ctx, page } = await L.open(browser, 'selectbox.zul');
    out.ua = await page.evaluate(() => navigator.userAgent);
    out.pages.selectbox = await page.evaluate((Rs) => {
      const R = new Function('return ' + Rs)();
      const els = [...document.querySelectorAll('.z-selectbox')];
      return els.map((e, i) => {
        const cs = getComputedStyle(e); const w = zk.$(e);
        const sel = e.tagName === 'SELECT' ? e : e.querySelector('select');
        const scs = sel ? getComputedStyle(sel) : null;
        return { i, tag: e.tagName, cls: e.className, rect: R(e), disabled: w && w._disabled, selectedText: sel && sel.options[sel.selectedIndex] && sel.options[sel.selectedIndex].text,
          appearance: cs.appearance, bg: cs.backgroundColor, border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius, opacity: cs.opacity,
          bgImage: cs.backgroundImage.slice(0, 80), paddingRight: cs.paddingRight,
          innerSelect: sel && sel !== e ? { tag: sel.tagName, cls: sel.className, rect: R(sel), appearance: scs.appearance, bgImage: scs.backgroundImage.slice(0, 80) } : null,
          pickerIconSupported: CSS.supports('appearance', 'base-select'),
          pickerIcon: (() => { try { const p = getComputedStyle(sel || e, '::picker-icon'); return { content: p.content, fontSize: p.fontSize, color: p.color, display: p.display, transform: p.transform, width: p.width, height: p.height }; } catch (x) { return 'n/a ' + x.message; } })(),
          selectedContent: (() => { const sc = e.querySelector('selectedcontent'); return sc ? { rect: R(sc), text: sc.textContent } : null; })(),
          children: [...e.children].map(c => ({ tag: c.tagName, cls: c.className, rect: R(c) })),
        };
      });
    }, R.toString());
    await L.shot(page, 'probe-selectbox.png');
    await ctx.close();
  }
  // ---- combobox.zul
  {
    const { ctx, page } = await L.open(browser, 'combobox.zul');
    out.pages.combobox = await page.evaluate((Rs) => {
      const R = new Function('return ' + Rs)();
      const els = [...document.querySelectorAll('.z-combobox')].slice(0, 3);
      return els.map((e, i) => {
        const btn = e.querySelector('.z-combobox-button'); const icon = e.querySelector('.z-combobox-icon'); const inp = e.querySelector('input');
        const ics = icon ? getComputedStyle(icon) : null;
        return { i, cls: e.className, rect: R(e), disabled: zk.$(e)._disabled, input: R(inp), button: btn ? { cls: btn.className, rect: R(btn) } : null,
          icon: icon ? { tag: icon.tagName, cls: icon.className, rect: R(icon), maskImage: (ics.maskImage || ics.webkitMaskImage || '').slice(0, 80), bgImage: ics.backgroundImage.slice(0, 80), w: ics.width, h: ics.height, color: ics.color, bg: ics.backgroundColor } : null };
      });
    }, R.toString());
    await L.shot(page, 'probe-combobox.png');
    await ctx.close();
  }
  // ---- bandbox.zul: open the rich-content bandbox
  {
    const { ctx, page } = await L.open(browser, 'bandbox.zul');
    const info = await page.evaluate((Rs) => {
      const R = new Function('return ' + Rs)();
      const bbs = [...document.querySelectorAll('.z-bandbox')];
      const pps = [...document.querySelectorAll('.z-bandpopup')];
      const richPp = pps.find(p => p.querySelector('.z-listbox'));
      // the rich bandbox is the last one on the page (after the 10 matrix cells); cross-check with the popup's parent widget when rendered
      let rich = bbs[bbs.length - 1];
      if (richPp && zk.$(richPp) && zk.$(richPp).parent && zk.$(richPp).parent.$n()) rich = zk.$(richPp).parent.$n();
      const btn = rich.querySelector('.z-bandbox-button');
      return { nBandbox: bbs.length, nPopupsRendered: pps.length, richPopupRendered: !!richPp, richIndex: bbs.indexOf(rich), rich: R(rich), button: R(btn), popupUuid: zk.$(rich).firstChild && zk.$(rich).firstChild.uuid };
    }, R.toString());
    await page.mouse.click(info.button.l + info.button.w / 2, info.button.t + info.button.h / 2);
    await L.settle(page);
    await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.pages.bandbox = Object.assign(info, await page.evaluate((Rs) => {
      const R = new Function('return ' + Rs)();
      const pp = document.querySelector('.z-bandpopup'); const pcs = getComputedStyle(pp);
      const lb = pp.querySelector('.z-listbox'); const body = lb.querySelector('.z-listbox-body'); const head = lb.querySelector('.z-listbox-header') || lb.querySelector('.z-listbox-head');
      const walk = (e, d) => { const o = { tag: e.tagName, cls: e.className, rect: R(e), bg: getComputedStyle(e).backgroundColor }; if (d < 3) o.ch = [...e.children].map(c => walk(c, d + 1)); return o; };
      return { popup: { cls: pp.className, rect: R(pp), display: pcs.display, visible: pcs.visibility, bg: pcs.backgroundColor, border: pcs.borderTopWidth + ' ' + pcs.borderTopColor, radius: pcs.borderTopLeftRadius, shadow: pcs.boxShadow, minWidth: pcs.minWidth, width: pcs.width },
        listbox: { cls: lb.className, rect: R(lb) }, head: head ? { cls: head.className, rect: R(head) } : null,
        body: { rect: R(body), offsetWidth: body.offsetWidth, clientWidth: body.clientWidth, scrollbarW: body.offsetWidth - body.clientWidth, overflowY: getComputedStyle(body).overflowY, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight },
        ths: [...lb.querySelectorAll('th')].map(t => ({ cls: t.className, rect: R(t), bg: getComputedStyle(t).backgroundColor })),
        bodyTds: [...lb.querySelectorAll('.z-listbox-body tr')].slice(0, 1).flatMap(tr => [...tr.children].map(t => ({ cls: t.className, rect: R(t) }))),
        tree: walk(lb, 0) };
    }, R.toString()));
    await L.shot(page, 'probe-bandbox-open.png');
    await ctx.close();
  }
  // ---- listbox.zul: any listbox with a vertical scrollbar?
  for (const pg of ['listbox.zul', 'listbox-header.zul', 'listbox-grouping.zul']) {
    const { ctx, page } = await L.open(browser, pg);
    out.pages[pg] = await page.evaluate((Rs) => {
      const R = new Function('return ' + Rs)();
      return [...document.querySelectorAll('.z-listbox')].map((lb, i) => { const body = lb.querySelector('.z-listbox-body'); const head = lb.querySelector('.z-listbox-header') || lb.querySelector('.z-listbox-head');
        return { i, cls: lb.className, rect: R(lb), hasHead: !!head, body: body ? { offsetWidth: body.offsetWidth, clientWidth: body.clientWidth, scrollbarW: body.offsetWidth - body.clientWidth, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight, overflowY: getComputedStyle(body).overflowY } : null }; });
    }, R.toString());
    await ctx.close();
  }
  L.save('probe-dom.json', out);
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
