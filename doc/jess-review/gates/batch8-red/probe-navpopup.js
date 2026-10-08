// Batch 8 RED, follow-up probe: how the third level (Settings) shows inside the collapsed navbar's .z-nav-popup.
// Tries: click Settings in the popup, then re-open Contact; also hover instead of click.
const L = require('./lib.js');
const outlineSrc = `(function outline(e, depth, max) {
  const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)).join(','); };
  const lines = [];
  const walk = (n, d) => { if (d > max) return;
    if (n.nodeType === 3) { const t = n.textContent.trim(); if (t) lines.push('  '.repeat(d) + '#text "' + t + '"'); return; }
    if (n.nodeType !== 1) return;
    const cls = typeof n.className === 'string' ? n.className : (n.getAttribute('class') || '');
    const cs = getComputedStyle(n);
    lines.push('  '.repeat(d) + n.tagName.toLowerCase() + (cls ? '.' + cls.trim().split(/\\s+/).join('.') : '') + ' [' + R(n) + ']' + (cs.display === 'none' ? ' display:none' : ''));
    for (const c of n.childNodes) walk(c, d + 1); };
  walk(e, depth); return lines.join('\\n'); })`;
const popups = () => [...document.querySelectorAll('.z-nav-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0).map(p => { const r = p.getBoundingClientRect(); return { cls: p.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 160), parentTag: p.parentElement.tagName, parentCls: p.parentElement.className }; });
async function clickNav(page, nbIdx, label, inPopup) { const r = await page.evaluate(({ nbIdx, label, inPopup }) => { const root = inPopup ? [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none') : document.querySelectorAll('.z-navbar')[nbIdx]; if (!root) return { err: 'noroot' }; const navs = [...root.querySelectorAll('.z-nav')]; const n = navs.find(x => x.textContent.indexOf(label) >= 0); if (!n) return { err: 'nonav', n: navs.length, cls: root.className, texts: navs.map(x => x.textContent.slice(0, 30)) }; const a = n.querySelector('.z-nav-content'); const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, cls: n.className }; }, { nbIdx, label, inPopup }); if (!r || r.err) throw new Error('no nav ' + label + ' ' + JSON.stringify(r)); await page.mouse.click(r.x, r.y); await L.settle(page); await page.waitForTimeout(500); return r; }
(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = {};
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    out.before = await page.evaluate(() => ({ navbars: [...document.querySelectorAll('.z-navbar')].map(n => n.className), navs: [...document.querySelectorAll('.z-navbar')[1].querySelectorAll('.z-nav')].map(n => n.textContent.replace(/\s+/g, ' ').slice(0, 40)), popups: [...document.querySelectorAll('.z-nav-popup')].map(p => p.className + '@' + p.parentElement.tagName) }));
    console.log('before', JSON.stringify(out.before));
    await clickNav(page, 1, 'Contact', false);
    out.afterContact = await page.evaluate(popups);
    const s = await clickNav(page, 1, 'Settings', true);
    out.settingsClicked = s;
    out.afterSettings = await page.evaluate(popups);
    out.settingsState = await page.evaluate(() => { const nb = document.querySelectorAll('.z-navbar')[1]; const navs = [...nb.querySelectorAll('.z-nav')]; return navs.map(n => ({ cls: n.className, text: (n.querySelector('.z-nav-content') || n).textContent.replace(/\s+/g, ' ').trim().slice(0, 40), ulDisplay: n.querySelector(':scope > ul') ? getComputedStyle(n.querySelector(':scope > ul')).display : null })); });
    // where did the popup go? any .z-nav-popup in the DOM at all
    out.allNavPopups = await page.evaluate(() => [...document.querySelectorAll('.z-nav-popup')].map(p => { const r = p.getBoundingClientRect(); return { cls: p.className, display: getComputedStyle(p).display, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), parent: p.parentElement.tagName + '.' + p.parentElement.className, html: p.outerHTML.length }; }));
    // re-open Contact
    await clickNav(page, 1, 'Contact', false);
    out.afterContactAgain = await page.evaluate(popups);
    out.outlineAgain = await page.evaluate(src => { const ps = [...document.querySelectorAll('.z-nav-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0); return ps.map(p => eval(src)(p, 0, 9)).join('\n-----\n'); }, outlineSrc);
    await page.screenshot({ path: L.OUT + '/probe-navpopup-reopen.png' });
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    // hover variant: hover Contact (collapsed), then hover Settings in popup
    const c = await page.evaluate(() => { const nb = document.querySelectorAll('.z-navbar')[1]; const n = [...nb.querySelectorAll('.z-nav')].find(x => x.textContent.indexOf('Contact') >= 0); const b = n.querySelector('.z-nav-content').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
    await page.mouse.move(c.x, c.y); await page.waitForTimeout(800); await L.settle(page);
    out.hoverContact = await page.evaluate(popups);
    if (out.hoverContact.length) { const s = await page.evaluate(() => { const p = [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none'); const n = [...p.querySelectorAll('.z-nav')].find(x => x.textContent.indexOf('Settings') >= 0); const b = n.querySelector('.z-nav-content').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
      await page.mouse.move(c.x + 30, c.y); await page.waitForTimeout(100); await page.mouse.move(s.x, s.y); await page.waitForTimeout(800); await L.settle(page);
      out.hoverSettings = await page.evaluate(popups);
      out.hoverOutline = await page.evaluate(src => { const ps = [...document.querySelectorAll('.z-nav-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0); return ps.map(p => eval(src)(p, 0, 9)).join('\n-----\n'); }, outlineSrc);
      await page.screenshot({ path: L.OUT + '/probe-navpopup-hover.png' }); }
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    // horizontal collapsed navbar hn1 (navbar[4]): click Contact, then Settings
    await clickNav(page, 4, 'Contact', false);
    out.hCollapsed = await page.evaluate(popups);
    out.hOutline = await page.evaluate(src => { const ps = [...document.querySelectorAll('.z-nav-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0); return ps.map(p => eval(src)(p, 0, 9)).join('\n-----\n'); }, outlineSrc);
    await page.screenshot({ path: L.OUT + '/probe-navpopup-horizontal.png' });
    await ctx.close(); }
  await browser.close();
  L.save('probe-navpopup.json', out);
  for (const k of Object.keys(out)) { const v = out[k]; console.log('=== ' + k); console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 0)); }
})();
