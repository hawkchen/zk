// #61 reconnaissance: what the tbeditor toolbar actually looks like in the headless render (viewport + element screenshots), svg/use geometry.
const L = require('./lib');
(async () => {
  const browser = await L.chromium.launch();
  for (const pg of ['portallayout.zul', 'tbeditor.zul']) {
    const { ctx, page } = await L.open(browser, pg);
    await page.evaluate(() => document.querySelector('.z-tbeditor').scrollIntoView({ block: 'center' })); await page.waitForTimeout(500);
    await page.screenshot({ path: __dirname + '/probe-tbeditor-' + pg.replace('.zul', '') + '-viewport.png' });
    const el = await page.$('.z-tbeditor-button-pane'); await el.screenshot({ path: __dirname + '/probe-tbeditor-' + pg.replace('.zul', '') + '-pane.png' });
    const info = await page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }; const pane = document.querySelector('.z-tbeditor-button-pane'); const b = pane.querySelector('button'); const svg = b.querySelector('svg'); const use = svg.querySelector('use'); const sym = document.querySelector(use.getAttribute('xlink:href') || use.getAttribute('href')); const sprite = sym && sym.closest('svg'); const bs = getComputedStyle(b); const ss = getComputedStyle(svg);
      const bbox = (() => { try { return svg.getBBox(); } catch (e) { return null; } })(); const ubox = (() => { try { const r = use.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; } catch (e) { return null; } })();
      return { pane: R(pane), button: R(b), svg: R(svg), use: ubox, svgCss: { width: ss.width, height: ss.height, overflow: ss.overflow, fill: ss.fill, color: ss.color, display: ss.display, position: ss.position, top: ss.top, left: ss.left, transform: ss.transform }, buttonCss: { overflow: bs.overflow, position: bs.position, display: bs.display, alignItems: bs.alignItems, justifyContent: bs.justifyContent, padding: bs.padding, width: bs.width, height: bs.height }, symbol: sym && { id: sym.id, viewBox: sym.getAttribute('viewBox'), html: sym.outerHTML.slice(0, 400) }, sprite: sprite && { display: getComputedStyle(sprite).display, rect: R(sprite), attrs: [...sprite.attributes].map(a => a.name + '=' + a.value.slice(0, 40)).join(' ') }, svgAttrs: [...svg.attributes].map(a => a.name + '=' + a.value).join(' '), svgBBox: bbox && [bbox.x, bbox.y, bbox.width, bbox.height], paneScroll: [pane.scrollWidth, pane.clientWidth] }; });
    console.log(pg, JSON.stringify(info, null, 1));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
