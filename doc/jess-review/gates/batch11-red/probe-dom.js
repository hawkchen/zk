// Batch 11 RED, DOM shape probe for the four pages (tabbox accordion, panel, window, borderlayout).
// Records classes, rects and the computed values the plan allows (font, opacity, padding) so the measurement scripts can target the right nodes.
const L = require('./lib.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const R = `(e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })`;
(async () => {
  const browser = await launch(); const out = {};
  // tabbox: horizontal "Tab States" tabbox (index 0) and the two accordion tabboxes
  { const { ctx, page } = await L.open(browser, 'tabbox.zul');
    out.tabbox = await page.evaluate((Rsrc) => { const R = eval(Rsrc);
      const boxes = [...document.querySelectorAll('.z-tabbox')];
      const info = (tb) => ({ cls: tb.className, rect: R(tb), tabs: [...tb.querySelectorAll('.z-tab')].map(t => { const cs = getComputedStyle(t); const txt = t.querySelector('.z-tab-text'); const tcs = txt && getComputedStyle(txt); const btn = t.querySelector('.z-tab-button'); const img = t.querySelector('.z-tab-image'); const icon = t.querySelector('.z-tab-icon'); const cnt = t.querySelector('.z-tab-content');
        return { cls: t.className, label: t.textContent.trim(), rect: R(t), cnt: R(cnt), text: R(txt), font: tcs ? { fs: tcs.fontSize, fw: tcs.fontWeight, lh: tcs.lineHeight, ff: tcs.fontFamily.slice(0, 30), color: tcs.color } : null, tabFont: { fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, color: cs.color, bg: cs.backgroundColor, minH: cs.minHeight, pad: cs.padding, opacity: cs.opacity }, btn: R(btn), img: R(img), icon: icon ? { rect: R(icon), cls: icon.className } : null,
          children: [...t.children].map(c => c.tagName + '.' + c.className) }; }),
        panels: [...tb.querySelectorAll('.z-tabpanel')].map(p => ({ cls: p.className, rect: R(p), display: getComputedStyle(p).display, font: (c => c.fontSize + '/' + c.lineHeight + ' ' + c.fontWeight)(getComputedStyle(p)), pad: getComputedStyle(p).padding })) });
      return { count: boxes.length, horizontal0: info(boxes[0]), accordions: boxes.filter(b => b.className.indexOf('accordion') >= 0).map(info) };
    }, R);
    // accordion tab children pseudo-elements
    out.tabboxPseudo = await page.evaluate(() => { const acc = document.querySelector('.z-tabbox-accordion'); const tab = acc.querySelector('.z-tab'); const res = {};
      for (const sel of ['.z-tab', '.z-tab-content', '.z-tab-text', '.z-tab-button', '.z-tab-icon']) { const e = tab.matches(sel) ? tab : tab.querySelector(sel); if (!e) continue; for (const ps of ['::before', '::after']) { const c = getComputedStyle(e, ps); if (c.content !== 'none' && c.content !== '') res[sel + ps] = { content: c.content, w: c.width, h: c.height, border: c.border, transform: c.transform, pos: c.position, right: c.right, top: c.top, bg: c.backgroundColor, mask: c.maskImage.slice(0, 60) }; } }
      return res; });
    await page.screenshot({ path: L.OUT + '/probe-tabbox-page.png', fullPage: true });
    await ctx.close(); }
  // panel
  { const { ctx, page } = await L.open(browser, 'panel.zul');
    out.panel = await page.evaluate((Rsrc) => { const R = eval(Rsrc);
      return [...document.querySelectorAll('.z-panel')].map((p, i) => { const w = zk.Widget.$(p); const cs = getComputedStyle(p); const head = p.querySelector(':scope > .z-panel-head'); const body = p.querySelector(':scope > .z-panel-body'); const children = p.querySelector('.z-panelchildren');
        return { i, cls: p.className, border: w.getBorder(), title: w.getTitle(), open: w.isOpen(), rect: R(p), head: R(head), body: R(body), children: R(children), headCls: head && head.className, bodyCls: body && body.className,
          cs: { border: cs.border, radius: cs.borderRadius, shadow: cs.boxShadow, bg: cs.backgroundColor, boxSizing: cs.boxSizing }, headCs: head ? (c => ({ borderBottom: c.borderBottom, bg: c.backgroundColor, h: c.height }))(getComputedStyle(head)) : null, bodyCs: body ? (c => ({ border: c.border, bg: c.backgroundColor }))(getComputedStyle(body)) : null,
          childrenCs: children ? (c => ({ border: c.border, bg: c.backgroundColor, pad: c.padding }))(getComputedStyle(children)) : null }; });
    }, R);
    out.panelPageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor + ' / html ' + getComputedStyle(document.documentElement).backgroundColor);
    await page.screenshot({ path: L.OUT + '/probe-panel-page.png', fullPage: true });
    await ctx.close(); }
  // window
  { const { ctx, page } = await L.open(browser, 'window.zul');
    out.window = await page.evaluate((Rsrc) => { const R = eval(Rsrc);
      return [...document.querySelectorAll('.z-window')].map((p, i) => { const w = zk.Widget.$(p); const cs = getComputedStyle(p); const head = p.querySelector(':scope > .z-window-header'); const cnt = p.querySelector(':scope > .z-window-content');
        return { i, cls: p.className, border: w.getBorder(), mode: w.getMode(), title: w.getTitle(), visible: w.isVisible(), rect: R(p), head: R(head), headCls: head && head.className, cnt: R(cnt), cs: { border: cs.border, radius: cs.borderRadius, shadow: cs.boxShadow, bg: cs.backgroundColor, pos: cs.position, z: cs.zIndex, opacity: cs.opacity }, headCs: head ? (c => ({ color: c.color, fs: c.fontSize, fw: c.fontWeight, bg: c.backgroundColor, cursor: c.cursor }))(getComputedStyle(head)) : null }; });
    }, R);
    await page.screenshot({ path: L.OUT + '/probe-window-page.png', fullPage: true });
    await ctx.close(); }
  // borderlayout
  { const { ctx, page } = await L.open(browser, 'borderlayout.zul');
    out.borderlayout = await page.evaluate((Rsrc) => { const R = eval(Rsrc);
      return [...document.querySelectorAll('.z-borderlayout')].map((bl, i) => { const regions = {};
        for (const k of ['north', 'south', 'west', 'east', 'center']) { const r = bl.querySelector(':scope > .z-' + k); if (!r) continue; const body = r.querySelector(':scope > .z-' + k + '-body'); const head = r.querySelector(':scope > .z-' + k + '-header'); const bc = body && getComputedStyle(body); const first = body && body.firstElementChild;
          regions[k] = { cls: r.className, rect: R(r), head: R(head), body: R(body), bodyCls: body && body.className, bodyPad: bc && bc.padding, bodyBorder: bc && bc.border, bodyBg: bc && bc.backgroundColor, bodyOverflow: bc && bc.overflow, firstChild: first ? first.tagName + '.' + first.className : null, firstChildRect: R(first), firstChildPad: first && getComputedStyle(first).padding, bodyText: body && body.textContent.trim().slice(0, 40), bodyChildren: body ? [...body.childNodes].map(n => n.nodeType === 3 ? '#text(' + n.textContent.trim().slice(0, 20) + ')' : n.tagName + '.' + n.className) : [] }; }
        return { i, rect: R(bl), regions }; });
    }, R);
    await page.screenshot({ path: L.OUT + '/probe-borderlayout-page.png', fullPage: true });
    await ctx.close(); }
  await browser.close();
  L.save('probe-dom.json', out);
  console.log(JSON.stringify(out, null, 1).slice(0, 60000));
})();
