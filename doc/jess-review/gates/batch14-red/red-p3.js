// Batch 14 RED — P3: horizontal navbar dropdown, nested z-nav indent per level (navbar.zul).
// Also records the vertical navbar and the collapsed-horizontal popup (.z-nav-popup) as today's protection baselines.
const L = require('./lib.js');
const M = require('./m14.js');

// in-page: rows of a dropdown list (ul) — every descendant li that is a nav/navitem/navseparator, with its nesting level
const rowsSrc = `(function (ul) {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; };
  const vis = e => e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 0;
  const rows = [];
  for (const li of ul.querySelectorAll('li')) {
    let lvl = 1, p = li.parentElement; while (p && p !== ul) { if (p.tagName === 'UL') lvl++; p = p.parentElement; }
    const kind = li.classList.contains('z-nav') ? 'nav' : li.classList.contains('z-navitem') ? 'navitem' : li.classList.contains('z-navseparator') ? 'separator' : 'other';
    const cnt = li.querySelector(':scope > .z-nav-content, :scope > .z-navitem-content, :scope > a');
    const text = cnt && cnt.querySelector('.z-nav-text, .z-navitem-text');
    const icon = cnt && [...cnt.querySelectorAll('[class*="z-icon-"]')].find(i => !i.classList.contains('z-nav-icon') || true);
    const info = cnt && cnt.querySelector('.z-nav-info, .z-navitem-info');
    const sub = li.querySelector(':scope > ul'); const scs = sub ? getComputedStyle(sub) : null;
    rows.push({ level: lvl, kind, cls: li.className, label: text ? text.textContent.trim() : li.textContent.trim().slice(0, 30), visible: vis(li), open: li.classList.contains('z-nav-open') || li.className.includes('open'),
      li: R(li), cnt: R(cnt), text: R(text), icon: icon ? { cls: icon.className, rect: R(icon) } : null, info: R(info),
      subUl: sub ? { rect: R(sub), position: scs.position, display: scs.display, bg: scs.backgroundColor, shadow: scs.boxShadow, zIndex: scs.zIndex, top: scs.top, left: scs.left } : null,
      cntPaddingLeft: cnt ? getComputedStyle(cnt).paddingLeft : null, cntBg: cnt ? getComputedStyle(cnt).backgroundColor : null, liDisplay: getComputedStyle(li).display, ulPaddingLeft: getComputedStyle(li.parentElement).paddingLeft });
  }
  const cs = getComputedStyle(ul);
  return { ul: R(ul), ulCls: ul.className, ulId: ul.id, position: cs.position, bg: cs.backgroundColor, paddingLeft: cs.paddingLeft, rows };
})`;

async function dumpList(page, locate) { return page.evaluate(({ locate, src }) => { const ul = eval(locate)(); return ul ? eval(src)(ul) : null; }, { locate, src: rowsSrc }); }

// pixel measure of each visible row: text ink left, icon ink left/centre, base colour from the row's left strip
async function measureRows(page, g, file) {
  const U = g.ul; const pad = 16;
  // crop = union of the list box and every visible row (nested lists may be absolutely positioned outside the parent ul)
  const boxes = [U, ...g.rows.filter(r => r.visible && r.cnt).map(r => r.cnt)];
  const bb = { l: Math.min(...boxes.map(b => b.l)), t: Math.min(...boxes.map(b => b.t)), r: Math.max(...boxes.map(b => b.r)), b: Math.max(...boxes.map(b => b.b)) };
  const S = await L.shot(page, file, { x: bb.l - pad, y: bb.t - pad, width: bb.r - bb.l + 2 * pad, height: bb.b - bb.t + 2 * pad });
  const listBg = L.median(S.rect(U.l + 2, U.l + 5, U.t + 2, U.b - 3).map(p => p.c));
  for (const row of g.rows) {
    if (!row.visible || !row.cnt || row.kind === 'separator') continue;
    const y0 = row.cnt.t + 2, y1 = row.cnt.b - 3;
    const base = L.median(S.rect(row.cnt.l + 1, row.cnt.l + 4, y0, y1).map(p => p.c));
    const text = row.text ? M.inkBox(S, row.text.l - 2, row.text.r + 2, y0, y1, base, 8) : null;
    const icon = row.icon ? M.inkBox(S, row.icon.rect.l - 1, row.icon.rect.r + 1, y0, y1, base, 8) : null;
    row.px = { base, dE_base_list: +L.dE(base, listBg).toFixed(2), text, icon, textInkLeft: text ? text.l : null, textFromUl: text ? +(text.l - U.l).toFixed(2) : null, textFromCnt: text ? +(text.l - row.cnt.l).toFixed(2) : null,
      iconInkLeft: icon ? icon.l : null, iconCentre: icon ? +((icon.l + icon.r) / 2).toFixed(2) : null, iconFromUl: icon ? +(icon.l - U.l).toFixed(2) : null };
  }
  g.listBg = listBg;
  return S;
}
function table(g) { for (const r of g.rows) { if (!r.visible) continue; console.log(`  L${r.level} ${r.kind.padEnd(8)} ${r.label.padEnd(20)} cnt ${r.cnt ? `${r.cnt.l},${r.cnt.t} ${r.cnt.w}x${r.cnt.h}` : '-'} padL ${r.cntPaddingLeft} text.l ${r.text ? r.text.l : '-'} textInk.l ${r.px && r.px.textInkLeft} (ul+${r.px && r.px.textFromUl}) icon ${r.icon ? r.icon.cls.replace(/.*(z-icon-[\\w-]+).*/, '$1') : '-'} iconInk.l ${r.px && r.px.iconInkLeft} centre ${r.px && r.px.iconCentre} base ${r.px && r.px.base}${r.subUl && r.subUl.display !== 'none' ? ` | subUl ${r.subUl.position} ${JSON.stringify(r.subUl.rect)} z ${r.subUl.zIndex}` : ''}`); } }

async function clickCnt(page, locate) {
  const r = await page.evaluate((locate) => { const e = eval(locate)(); if (!e) return null; e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, text: e.textContent.trim() }; }, locate);
  if (!r) throw new Error('not found: ' + locate);
  await page.mouse.click(r.x, r.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(500);
  return r;
}

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, chromium: browser.version(), date: new Date().toISOString() } };
  // page structure probe: navbars in order, orient, collapsed
  {
    const { ctx, page } = await L.open(browser, 'web/navbar.zul');
    out.navbars = await page.evaluate(() => [...document.querySelectorAll('.z-navbar')].map((n, i) => { const w = zk.Widget.$(n); const r = n.getBoundingClientRect(); return { i, cls: n.className, orient: w.getOrient && w.getOrient(), collapsed: w.isCollapsed && w.isCollapsed(), rect: [r.left, r.top + scrollY, r.width, r.height].map(v => +v.toFixed(1)), topItems: [...n.querySelectorAll(':scope > ul > li')].map(li => li.querySelector('.z-nav-text, .z-navitem-text')?.textContent.trim() || li.className) }; }));
    console.log('navbars:', JSON.stringify(out.navbars, null, 0));
    await ctx.close();
  }
  // ── horizontal expanded navbar (index 3): open Contact, then nested Settings ──
  const H = `() => document.querySelectorAll('.z-navbar')[3]`;
  const contactCnt = `() => [...document.querySelectorAll('.z-navbar')[3].querySelectorAll(':scope > ul > li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Contact').querySelector(':scope > .z-nav-content')`;
  const contactUl = `() => [...document.querySelectorAll('.z-navbar')[3].querySelectorAll(':scope > ul > li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Contact').querySelector(':scope > ul')`;
  const settingsCnt = `() => [...document.querySelectorAll('.z-navbar')[3].querySelectorAll('li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Settings').querySelector(':scope > .z-nav-content')`;
  {
    const { ctx, page } = await L.open(browser, 'web/navbar.zul');
    await page.evaluate(() => document.querySelectorAll('.z-navbar')[3].scrollIntoView({ block: 'start' }));
    await page.evaluate(() => window.scrollBy(0, -120)); await page.waitForTimeout(200);
    out.horizontal = {};
    // top-level row baseline (closed)
    out.horizontal.topClosed = await dumpList(page, `() => document.querySelectorAll('.z-navbar')[3].querySelector(':scope > ul')`);
    await L.shot(page, 'p3-h-closed.png', { x: 0, y: 0, width: 1280, height: 400 });
    await clickCnt(page, contactCnt);
    const g1 = await dumpList(page, contactUl);
    await measureRows(page, g1, 'p3-h-contact-open.png');
    out.horizontal.contactOpen = g1;
    console.log('horizontal Contact dropdown (Settings closed):', JSON.stringify({ ul: g1.ul, position: g1.position, bg: g1.bg, paddingLeft: g1.paddingLeft })); table(g1);
    await clickCnt(page, settingsCnt);
    const g2 = await dumpList(page, contactUl);
    await measureRows(page, g2, 'p3-h-contact-settings-open.png');
    out.horizontal.settingsOpen = g2;
    console.log('horizontal Contact dropdown (Settings open):', JSON.stringify({ ul: g2.ul })); table(g2);
    await L.shot(page, 'p3-h-contact-settings-page.png', { x: 0, y: 0, width: 1280, height: 600 });
    // hover a L1 row inside the dropdown: state layer width
    const reply = g2.rows.find(r => r.label === 'Reply');
    await page.mouse.move(reply.cnt.l + reply.cnt.w / 2, reply.cnt.t + reply.cnt.h / 2); await page.waitForTimeout(300);
    const Sh = await L.shot(page, 'p3-h-reply-hover.png', { x: g2.ul.l - 16, y: g2.ul.t - 16, width: g2.ul.w + 32, height: g2.ul.h + 32 });
    const hov = M.hExtent(Sh, g2.ul.l, g2.ul.r - 1, reply.cnt.t + 4, reply.cnt.b - 5, g2.listBg, 2);
    out.horizontal.replyHover = { ul: g2.ul, cnt: reply.cnt, extent: hov && { l: hov.l, r: hov.r, color: hov.color } };
    console.log('Reply hover extent', JSON.stringify(out.horizontal.replyHover.extent), 'ul', g2.ul.l, g2.ul.r);
    await ctx.close();
  }
  // ── vertical expanded navbar (index 0): Contact → Settings (protection baseline) ──
  {
    const { ctx, page } = await L.open(browser, 'web/navbar.zul');
    const vContact = `() => [...document.querySelectorAll('.z-navbar')[0].querySelectorAll(':scope > ul > li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Contact')`;
    await clickCnt(page, `() => (${vContact})().querySelector(':scope > .z-nav-content')`);
    await clickCnt(page, `() => [...document.querySelectorAll('.z-navbar')[0].querySelectorAll('li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Settings').querySelector(':scope > .z-nav-content')`);
    await page.evaluate(() => document.querySelectorAll('.z-navbar')[0].scrollIntoView({ block: 'start' })); await page.waitForTimeout(200);
    const g = await dumpList(page, `() => (${vContact})().querySelector(':scope > ul')`);
    await measureRows(page, g, 'p3-v-contact-settings-open.png');
    out.vertical = g;
    console.log('vertical Contact (Settings open):'); table(g);
    await ctx.close();
  }
  // ── collapsed horizontal navbar (index 4, hn1): popup mode (.z-nav-popup) — hover Contact ──
  {
    const { ctx, page } = await L.open(browser, 'web/navbar.zul');
    const hn1Contact = `() => [...document.querySelectorAll('.z-navbar')[4].querySelectorAll(':scope > ul > li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Contact').querySelector(':scope > .z-nav-content')`;
    const r = await page.evaluate((locate) => { const e = eval(locate)(); e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, hn1Contact);
    await page.mouse.move(r.x, r.y); await page.waitForTimeout(600);
    let pop = await page.evaluate(() => { const p = [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0); return p ? p.className : null; });
    if (!pop) { await page.mouse.click(r.x, r.y); await L.settle(page); await page.waitForTimeout(500); pop = await page.evaluate(() => { const p = [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0); return p ? p.className : null; }); }
    out.popup = { opened: pop };
    if (pop) {
      const popUl = `() => [...document.querySelectorAll('.z-nav-popup')].find(p => getComputedStyle(p).display !== 'none' && p.getBoundingClientRect().height > 0)`;
      // open nested Settings inside the popup
      const st = await page.evaluate((locate) => { const p = eval(locate)(); const li = [...p.querySelectorAll('li.z-nav')].find(li => li.querySelector('.z-nav-text').textContent.trim() === 'Settings'); if (!li) return null; const e = li.querySelector(':scope > .z-nav-content'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, popUl);
      if (st) { await page.mouse.click(st.x, st.y); await L.settle(page); await page.waitForTimeout(500); }
      const g = await dumpList(page, popUl);
      await measureRows(page, g, 'p3-popup-contact-settings.png');
      out.popup.list = g;
      console.log('collapsed horizontal popup (Settings open):', pop); table(g);
    } else console.log('collapsed horizontal: no .z-nav-popup appeared on hover/click');
    await ctx.close();
  }
  L.save('red-p3.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
