const { launch, BASE } = require('./common');
(async () => {
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(BASE + '/organigram.zul', { waitUntil: 'networkidle' });
  await page.waitForSelector('.z-orgnode');
  await page.evaluate(() => { const el = document.querySelector('.z-orgnode'); el.parentElement.classList.add('z-orgitem-selected'); el.setAttribute('data-fs-idx','0'); });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[data-fs-idx="0"]' });
  await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus', 'focus-visible'] });
  const sheets = {}; cdp.on('CSS.styleSheetAdded', e => sheets[e.header.styleSheetId] = e.header.sourceURL);
  await cdp.send('CSS.disable'); await cdp.send('CSS.enable');
  await page.waitForTimeout(300);
  const ms = await cdp.send('CSS.getMatchedStylesForNode', { nodeId });
  const out = [];
  for (const r of ms.matchedCSSRules) {
    const props = r.rule.style.cssProperties.filter(p => /^(outline|background|forced-color-adjust|box-shadow)/.test(p.name) && p.value);
    if (props.length) out.push({ sel: r.rule.selectorList.text, media: (r.rule.media||[]).map(m=>m.text).join(';'), src: (sheets[r.rule.styleSheetId]||'').replace(/^.*\/zkau/, ''), props: props.map(p => p.name + ':' + p.value) });
  }
  const cs = await page.evaluate(() => { const el = document.querySelector('[data-fs-idx="0"]'); const c = getComputedStyle(el); return { cls: el.className, parentCls: el.parentElement.className, outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor + ' off ' + c.outlineOffset, bg: c.backgroundColor, parentBg: getComputedStyle(el.parentElement).backgroundColor }; });
  console.log(JSON.stringify({ cs, out }, null, 1));
  await browser.close();
})();
