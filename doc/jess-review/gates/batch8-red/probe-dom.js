// Batch 8 RED, DOM shape probe: what the menubar popups and the navbar actually render (tags/classes/rects), before measuring.
// Measurement-free; only reads geometry and class names so the measurement scripts can pick the right elements.
const L = require('./lib.js');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
// outline of an element subtree: tag.class [rect] (depth-limited, text nodes shown)
const outlineSrc = `(function outline(e, depth, max) {
  const R = e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)).join(','); };
  const lines = [];
  const walk = (n, d) => { if (d > max) return;
    if (n.nodeType === 3) { const t = n.textContent.trim(); if (t) lines.push('  '.repeat(d) + '#text "' + t + '"'); return; }
    if (n.nodeType !== 1) return;
    const cls = typeof n.className === 'string' ? n.className : (n.getAttribute('class') || '');
    const cs = getComputedStyle(n);
    lines.push('  '.repeat(d) + n.tagName.toLowerCase() + (cls ? '.' + cls.trim().split(/\\s+/).join('.') : '') + ' [' + R(n) + ']' + (cs.display === 'none' ? ' display:none' : '') + (n.tagName === 'IMG' ? ' src=' + n.getAttribute('src') : ''));
    for (const c of n.childNodes) walk(c, d + 1); };
  walk(e, depth); return lines.join('\\n'); })`;
async function outline(page, sel, idx = 0, max = 6) { return page.evaluate(({ sel, idx, max, src }) => { const e = typeof sel === 'string' ? document.querySelectorAll(sel)[idx] : null; if (!e) return 'NOT FOUND ' + sel; return eval(src)(e, 0, max); }, { sel, idx, max, src: outlineSrc }); }
async function clickCenter(page, sel, idx = 0) { const r = await page.evaluate(({ sel, idx }) => { const e = document.querySelectorAll(sel)[idx]; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, { sel, idx }); if (!r) throw new Error('no ' + sel + '[' + idx + ']'); await page.mouse.click(r.x, r.y); await L.settle(page); return r; }
async function visiblePopups(page) { return page.evaluate(() => [...document.querySelectorAll('.z-menupopup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0).map(p => { const r = p.getBoundingClientRect(); return { cls: p.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) }; })); }

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { chromium: browser.version() };
  // ---- menubar.zul
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    out.menubars = await page.evaluate(() => [...document.querySelectorAll('.z-menubar')].map((m, i) => { const r = m.getBoundingClientRect(); return { i, cls: m.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), tops: [...m.querySelectorAll(':scope > ul > li')].map(li => ({ cls: li.className, text: li.textContent.trim().slice(0, 30), rect: (r => [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)))(li.getBoundingClientRect()) })) }; }));
    out.menubar1_outline = await outline(page, '.z-menubar', 1, 5);
    // File (menubar[1], first top item)
    await clickCenter(page, '.z-menubar:nth-of-type(1)', 0).catch(() => {});
    await page.mouse.move(2, 2); await page.waitForTimeout(200);
    await page.evaluate(() => { document.body.click(); }); await L.settle(page);
    const file = await page.evaluate(() => { const m = document.querySelectorAll('.z-menubar')[1]; const li = m.querySelector('li.z-menu'); const a = li.querySelector('.z-menu-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: a.textContent.trim() }; });
    await page.mouse.click(file.x, file.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.file_popups = await visiblePopups(page);
    const fileIdx = await page.evaluate(() => [...document.querySelectorAll('.z-menupopup')].findIndex(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0));
    out.file_outline = await outline(page, '.z-menupopup', fileIdx, 7);
    await page.screenshot({ path: L.OUT + '/probe-file-open.png' });
    // hover the nested "Open" menu inside the File popup -> its submenu
    const openRow = await page.evaluate(i => { const p = document.querySelectorAll('.z-menupopup')[i]; const a = p.querySelector('li.z-menu > .z-menu-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, fileIdx);
    await page.mouse.move(openRow.x, openRow.y); await page.waitForTimeout(600); await L.settle(page);
    out.file_open_hover_popups = await visiblePopups(page);
    await page.screenshot({ path: L.OUT + '/probe-file-open-submenu.png' });
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    // View (menubar[1], second top item)
    const view = await page.evaluate(() => { const m = document.querySelectorAll('.z-menubar')[1]; const li = m.querySelectorAll('li.z-menu')[1]; const a = li.querySelector('.z-menu-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: a.textContent.trim() }; });
    await page.mouse.click(view.x, view.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.view_popups = await visiblePopups(page);
    const viewIdx = await page.evaluate(() => [...document.querySelectorAll('.z-menupopup')].findIndex(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0));
    out.view_outline = await outline(page, '.z-menupopup', viewIdx, 7);
    await page.screenshot({ path: L.OUT + '/probe-view-open.png' });
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    // Project (menubar[0], first top item)
    const proj = await page.evaluate(() => { const m = document.querySelectorAll('.z-menubar')[0]; const li = m.querySelector('li.z-menu'); const a = li.querySelector('.z-menu-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: a.textContent.trim() }; });
    await page.mouse.click(proj.x, proj.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.project_popups = await visiblePopups(page);
    const projIdx = await page.evaluate(() => [...document.querySelectorAll('.z-menupopup')].findIndex(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0));
    out.project_outline = await outline(page, '.z-menupopup', projIdx, 7);
    await page.screenshot({ path: L.OUT + '/probe-project-open.png' });
    await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'menubar.zul');
    // vertical menubar (menubar[2]) Help -> About (menubar[0]'s Help is disabled)
    const help = await page.evaluate(() => { const m = document.querySelectorAll('.z-menubar')[2]; const li = m.querySelectorAll('li.z-menu')[1]; const a = li.querySelector('.z-menu-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: a.textContent.trim(), cls: li.className }; });
    out.vertical_help = help;
    await page.mouse.click(help.x, help.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.help_popups = await visiblePopups(page);
    const helpIdx = await page.evaluate(() => [...document.querySelectorAll('.z-menupopup')].findIndex(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0));
    out.help_outline = await outline(page, '.z-menupopup', helpIdx, 7);
    const about = await page.evaluate(i => { const p = document.querySelectorAll('.z-menupopup')[i]; const a = p.querySelector('li.z-menu > .z-menu-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, helpIdx);
    await page.mouse.move(about.x, about.y); await page.waitForTimeout(600); await L.settle(page);
    out.about_popups = await visiblePopups(page);
    await page.screenshot({ path: L.OUT + '/probe-help-about-open.png' });
    await ctx.close(); }
  // ---- navbar.zul
  { const { ctx, page } = await L.open(browser, 'navbar.zul');
    out.navbars = await page.evaluate(() => [...document.querySelectorAll('.z-navbar')].map((m, i) => { const r = m.getBoundingClientRect(); return { i, cls: m.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)) }; }));
    out.nav0_outline_closed = await outline(page, '.z-navbar', 0, 4);
    // expand Contact (nav index 1 in navbar[0]) then Settings (nested nav)
    const contact = await page.evaluate(() => { const nb = document.querySelectorAll('.z-navbar')[0]; const navs = [...nb.querySelectorAll('.z-nav')]; const n = navs.find(x => x.textContent.indexOf('Contact') >= 0); const a = n.querySelector('.z-nav-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: n.className }; });
    await page.mouse.click(contact.x, contact.y); await L.settle(page); await page.waitForTimeout(500);
    const settings = await page.evaluate(() => { const nb = document.querySelectorAll('.z-navbar')[0]; const navs = [...nb.querySelectorAll('.z-nav')]; const n = navs.find(x => x.textContent.indexOf('Settings') >= 0 && x.textContent.indexOf('Contact') < 0); const a = n.querySelector('.z-nav-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: n.className }; });
    await page.mouse.click(settings.x, settings.y); await L.settle(page); await page.waitForTimeout(500); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    out.nav0_outline_open = await outline(page, '.z-navbar', 0, 9);
    await page.screenshot({ path: L.OUT + '/probe-navbar-expanded.png' });
    // collapsed navbar vn1 (navbar[1]): click Contact and see what opens
    const c2 = await page.evaluate(() => { const nb = document.querySelectorAll('.z-navbar')[1]; const navs = [...nb.querySelectorAll('.z-nav')]; const n = navs.find(x => x.textContent.indexOf('Contact') >= 0); const a = n.querySelector('.z-nav-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: n.className, navbarCls: nb.className }; });
    out.collapsed_contact = c2;
    await page.mouse.click(c2.x, c2.y); await L.settle(page); await page.waitForTimeout(500);
    out.collapsed_popups = await page.evaluate(() => [...document.querySelectorAll('.z-nav-popup, .z-navbar-popup, .z-popup, [class*="nav-popup"]')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0).map(p => { const r = p.getBoundingClientRect(); return { tag: p.tagName, cls: p.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 120) }; }));
    out.collapsed_outline = await outline(page, '.z-navbar', 1, 9);
    const popSel = out.collapsed_popups.length ? null : null;
    out.collapsed_popup_outline = await page.evaluate(src => { const ps = [...document.querySelectorAll('[class*="nav-popup"], .z-navbar-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0); return ps.map(p => eval(src)(p, 0, 9)).join('\n-----\n'); }, outlineSrc);
    await page.screenshot({ path: L.OUT + '/probe-navbar-collapsed-open.png' });
    // then Settings inside the popup
    const s2 = await page.evaluate(() => { const ps = [...document.querySelectorAll('[class*="nav-popup"], .z-navbar-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0); for (const p of ps) { const navs = [...p.querySelectorAll('.z-nav')]; const n = navs.find(x => x.textContent.indexOf('Settings') >= 0); if (n) { const a = n.querySelector('.z-nav-content'); const r = a.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cls: n.className, popupCls: p.className }; } } return null; });
    out.collapsed_settings = s2;
    if (s2) { await page.mouse.click(s2.x, s2.y); await L.settle(page); await page.waitForTimeout(500); await page.mouse.move(2, 2); await page.waitForTimeout(300);
      out.collapsed_popups_2 = await page.evaluate(() => [...document.querySelectorAll('[class*="nav-popup"], .z-navbar-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0).map(p => { const r = p.getBoundingClientRect(); return { tag: p.tagName, cls: p.className, rect: [r.left, r.top, r.width, r.height].map(v => +v.toFixed(2)), text: p.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) }; }));
      out.collapsed_popup_outline_2 = await page.evaluate(src => { const ps = [...document.querySelectorAll('[class*="nav-popup"], .z-navbar-popup')].filter(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().width > 0); return ps.map(p => eval(src)(p, 0, 9)).join('\n-----\n'); }, outlineSrc);
      await page.screenshot({ path: L.OUT + '/probe-navbar-collapsed-settings.png' }); }
    await ctx.close(); }
  await browser.close();
  L.save('probe-dom.json', out);
  for (const k of Object.keys(out)) { const v = out[k]; console.log('=== ' + k); console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 0)); }
})();
