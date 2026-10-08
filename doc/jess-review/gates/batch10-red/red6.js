// #6 RED: calendar disabled-date colour. Page calendar.zul (value fixed at 2020-03-15).
// Calendars on the page: 0 default (selected Sun 15), 6 constraint="no past", 7 constraint="no future".
// In Mar 2020 every day of the "no past" calendar is past (all disabled), so the same calendar is also
// navigated to the browser's current month to get a disabled/enabled mix; "no future" likewise (future days disabled).
// Measures: computed color / text-decoration / cursor / pointer-events / opacity per td, darkest text pixel per cell,
// header colours, selected-day colours, hover disc on enabled vs disabled cells. Output: red6.json + red6-*.png
const L = require('./lib');

async function cells(page, ci) {
  return page.evaluate((ci) => {
    const cal = document.querySelectorAll('.z-calendar')[ci]; const cr = cal.getBoundingClientRect();
    const title = (cal.querySelector('.z-calendar-title') || {}).textContent;
    const tds = [...cal.querySelectorAll('td.z-calendar-cell')].filter(td => td.getBoundingClientRect().width > 0);
    return { calRect: { l: cr.left, t: cr.top, r: cr.right, b: cr.bottom, w: cr.width, h: cr.height }, title, head: [...cal.querySelectorAll('th')].map(t => ({ cls: t.className, txt: t.textContent, color: getComputedStyle(t).color })),
      cells: tds.map(td => { const s = getComputedStyle(td); const r = td.getBoundingClientRect(); const inner = td.firstElementChild; const is = inner && getComputedStyle(inner); return { cls: td.className, txt: td.textContent.trim(), disabled: td.classList.contains('z-calendar-disabled'), weekend: td.classList.contains('z-calendar-weekend'), outside: td.classList.contains('z-calendar-outside'), selected: td.classList.contains('z-calendar-selected'), color: s.color, textDecorationLine: s.textDecorationLine, cursor: s.cursor, pointerEvents: s.pointerEvents, opacity: s.opacity, bg: s.backgroundColor, innerTag: inner && inner.tagName, innerColor: is && is.color, innerBg: is && is.backgroundColor, innerTD: is && is.textDecorationLine, rect: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }; }) };
  }, ci);
}
// darkest pixel (min luminance) inside each cell (inset 3px) + median of the dark pixels
function inkPerCell(S, info) {
  return info.cells.map(c => {
    const px = S.rect(c.rect.l + 3, c.rect.r - 4, c.rect.t + 3, c.rect.b - 4);
    let dark = null, lum = 1e9; for (const p of px) { const l = p.c[0] * 0.2126 + p.c[1] * 0.7152 + p.c[2] * 0.0722; if (l < lum) { lum = l; dark = p; } }
    const bg = L.median(px.map(p => p.c));
    return { txt: c.txt, cls: c.cls, darkest: dark.c, darkestAt: [dark.x, dark.y], cellBgMedian: bg, inkPx: px.filter(p => L.dE(p.c, [255, 255, 255]) >= 10).length };
  });
}
function groups(info, ink) {
  const g = { disabledWeekday: [], disabledWeekend: [], disabledOutside: [], enabledWeekday: [], enabledWeekend: [], outsideEnabled: [] };
  info.cells.forEach((c, i) => { const k = c.outside ? (c.disabled ? 'disabledOutside' : 'outsideEnabled') : (c.disabled ? (c.weekend ? 'disabledWeekend' : 'disabledWeekday') : (c.weekend ? 'enabledWeekend' : 'enabledWeekday')); if (!c.selected) g[k].push({ txt: c.txt, color: c.color, darkest: ink[i].darkest, td: c.textDecorationLine, cursor: c.cursor, pe: c.pointerEvents, opacity: c.opacity }); });
  const summary = {};
  for (const [k, arr] of Object.entries(g)) { if (!arr.length) continue; const colors = [...new Set(arr.map(a => a.color))]; let maxDE = 0; for (const a of arr) for (const b of arr) maxDE = Math.max(maxDE, L.dE(a.darkest, b.darkest)); summary[k] = { n: arr.length, days: arr.map(a => a.txt).join(','), computedColors: colors, darkestMedian: L.median(arr.map(a => a.darkest)), maxPairwiseDE: +maxDE.toFixed(2), td: [...new Set(arr.map(a => a.td))], cursor: [...new Set(arr.map(a => a.cursor))], pe: [...new Set(arr.map(a => a.pe))], opacity: [...new Set(arr.map(a => a.opacity))] }; }
  // cross-group: in-month disabled weekday vs weekend
  const x = (a, b) => summary[a] && summary[b] ? +L.dE(summary[a].darkestMedian, summary[b].darkestMedian).toFixed(2) : null;
  summary.cross = { disabledWeekdayVsWeekend_dE: x('disabledWeekday', 'disabledWeekend'), enabledWeekdayVsWeekend_dE: x('enabledWeekday', 'enabledWeekend'), disabledWeekdayVsEnabledWeekday_dE: x('disabledWeekday', 'enabledWeekday'), disabledWeekendVsEnabledWeekday_dE: x('disabledWeekend', 'enabledWeekday') };
  return summary;
}
async function snap(page, ci, file) {
  const info = await cells(page, ci);
  await page.evaluate((ci) => document.querySelectorAll('.z-calendar')[ci].scrollIntoView({ block: 'center' }), ci); await page.waitForTimeout(200);
  const info2 = await cells(page, ci);
  const S = await L.shot(page, file, { x: info2.calRect.l - 4, y: info2.calRect.t - 4, width: info2.calRect.w + 8, height: info2.calRect.h + 8 });
  const ink = inkPerCell(S, info2);
  return { title: info2.title, head: info2.head, cells: info2.cells.map((c, i) => ({ ...c, ink: ink[i] })), groups: groups(info2, ink), S, info: info2 };
}
async function goToMonth(page, ci, ym) { // ym = 'YYYY-M'; click the next arrow until the title matches
  for (let k = 0; k < 120; k++) {
    const t = await page.evaluate((ci) => { const cal = document.querySelectorAll('.z-calendar')[ci]; return { title: cal.querySelector('.z-calendar-title').textContent, btn: !!cal.querySelector('.z-calendar-right') }; }, ci);
    if (t.title === ym) return true;
    await page.evaluate((ci) => document.querySelectorAll('.z-calendar')[ci].querySelector('.z-calendar-right').click(), ci);
    await L.settle(page);
  }
  return false;
}
async function hoverDisc(page, ci, txt, file) { // move onto a cell, sample a pixel inside the disc left of the digit
  const c = (await cells(page, ci)).cells.find(x => x.txt === txt && !x.outside);
  await page.mouse.move(c.rect.l + c.rect.w / 2, c.rect.t + c.rect.h / 2); await page.waitForTimeout(300);
  const S = await L.shot(page, file, { x: c.rect.l - 4, y: c.rect.t - 4, width: c.rect.w + 8, height: c.rect.h + 8 });
  const probe = S.rect(c.rect.l + 6, c.rect.l + 9, c.rect.t + c.rect.h / 2 - 1, c.rect.t + c.rect.h / 2 + 1);
  const med = L.median(probe.map(p => p.c));
  const cs = await page.evaluate(({ ci, txt }) => { const td = [...document.querySelectorAll('.z-calendar')[ci].querySelectorAll('td')].find(t => t.textContent.trim() === txt && !t.classList.contains('z-calendar-outside')); const s = getComputedStyle(td); return { hover: td.matches(':hover'), bg: s.backgroundColor, color: s.color, cls: td.className }; }, { ci, txt });
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  return { txt, cls: cs.cls, probeMedian: med, dEvsWhite: +L.dE(med, [255, 255, 255]).toFixed(2), hoverMatches: cs.hover, computedBg: cs.bg, computedColor: cs.color };
}
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'calendar.zul');
  const out = { note: 'calendar.zul; computed per-td values + darkest pixel per cell (inset 3px) at DPR 2; groups exclude the selected cell' };
  const now = await page.evaluate(() => { const d = new Date(); return { iso: d.toISOString(), ym: d.toLocaleString('en', { month: 'short' }) + ' ' + d.getFullYear(), day: d.getDate() }; });
  out.browserNow = now;
  // Mar 2020, no past (designer's example): everything disabled
  let s = await snap(page, 6, 'red6-nopast-mar2020.png'); out.noPastMar2020 = { title: s.title, head: s.head, groups: s.groups, cells: s.cells.map(c => ({ txt: c.txt, cls: c.cls, color: c.color, darkest: c.ink.darkest, td: c.textDecorationLine, cursor: c.cursor, pe: c.pointerEvents, opacity: c.opacity })) };
  // default calendar: selected Sunday 15 + enabled weekend/weekday
  s = await snap(page, 0, 'red6-default-mar2020.png');
  const sel = s.cells.find(c => c.selected); let selPx = null;
  if (sel) { const px = s.S.rect(sel.rect.l + 4, sel.rect.r - 5, sel.rect.t + 4, sel.rect.b - 5); const disc = L.median(px.map(p => p.c)); let light = null, lum = -1; for (const p of px) { const l = p.c[0] + p.c[1] + p.c[2]; if (l > lum) { lum = l; light = p.c; } } selPx = { discMedian: disc, lightestPixel: light, computedColor: sel.color, computedBg: sel.bg, innerColor: sel.innerColor, innerBg: sel.innerBg, cls: sel.cls, txt: sel.txt }; }
  out.defaultMar2020 = { title: s.title, head: s.head, groups: s.groups, selected: selPx };
  out.hoverDefault = { enabledWeekday: await hoverDisc(page, 0, '18', 'red6-hover-default-weekday.png'), enabledWeekend: await hoverDisc(page, 0, '21', 'red6-hover-default-weekend.png') };
  // no past -> current month: mixed
  out.navNoPast = await goToMonth(page, 6, now.ym);
  s = await snap(page, 6, 'red6-nopast-current.png'); out.noPastCurrent = { title: s.title, head: s.head, groups: s.groups, cells: s.cells.map(c => ({ txt: c.txt, cls: c.cls, color: c.color, darkest: c.ink.darkest, td: c.textDecorationLine, cursor: c.cursor, pe: c.pointerEvents, opacity: c.opacity })) };
  const en = s.cells.filter(c => !c.disabled && !c.outside), dis = s.cells.filter(c => c.disabled && !c.outside);
  const enWk = en.find(c => !c.weekend), enWe = en.find(c => c.weekend), disWk = dis.find(c => !c.weekend), disWe = dis.find(c => c.weekend);
  out.hoverNoPastCurrent = { enabledWeekday: enWk && await hoverDisc(page, 6, enWk.txt, 'red6-hover-enabled-weekday.png'), enabledWeekend: enWe && await hoverDisc(page, 6, enWe.txt, 'red6-hover-enabled-weekend.png'), disabledWeekday: disWk && await hoverDisc(page, 6, disWk.txt, 'red6-hover-disabled-weekday.png'), disabledWeekend: disWe && await hoverDisc(page, 6, disWe.txt, 'red6-hover-disabled-weekend.png') };
  // no future -> current month: future days disabled
  out.navNoFuture = await goToMonth(page, 7, now.ym);
  s = await snap(page, 7, 'red6-nofuture-current.png'); out.noFutureCurrent = { title: s.title, head: s.head, groups: s.groups };
  // no future, Mar 2020 as rendered (all enabled)
  await ctx.close();
  { const { ctx: c2, page: p2 } = await L.open(browser, 'calendar.zul'); const s2 = await snap(p2, 7, 'red6-nofuture-mar2020.png'); out.noFutureMar2020 = { title: s2.title, groups: s2.groups }; await c2.close(); }
  L.save('red6.json', out);
  await browser.close();
  for (const k of ['noPastMar2020', 'noPastCurrent', 'noFutureCurrent', 'defaultMar2020', 'noFutureMar2020']) { console.log('==', k, out[k].title); for (const [g, v] of Object.entries(out[k].groups)) console.log('  ', g, JSON.stringify(v)); }
  console.log('selected', JSON.stringify(out.defaultMar2020.selected));
  console.log('hover default', JSON.stringify(out.hoverDefault)); console.log('hover nopast current', JSON.stringify(out.hoverNoPastCurrent));
  console.log('head nopast', JSON.stringify(out.noPastCurrent.head.map(h => [h.txt, h.color])));
})().catch(e => { console.error(e); process.exit(1); });
