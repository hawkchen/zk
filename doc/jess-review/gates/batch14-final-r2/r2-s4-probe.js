// Batch 14 FINAL R2 — S4 probe: why does the bandbox test of listhead-bar-screenshot.spec.ts fail, and what does the
// listbox-header test actually measure? Desktop Chrome settings (1280x720, dpr 1) with scrollbars shown, like the spec.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const BASE = process.env.PREVIEW_URL || 'http://localhost:8085';

const barSrc = `(lb) => {
  const bar = lb.querySelector('th.z-listhead-bar'), sib = lb.querySelector('th.z-listheader'), body = lb.querySelector('.z-listbox-body');
  const R = e => e ? e.getBoundingClientRect().width : null;
  return { rows: lb.querySelectorAll('.z-listitem').length, lbHeight: lb.getBoundingClientRect().height, bodyH: body && body.getBoundingClientRect().height,
    bodyOffsetW: body && body.offsetWidth, bodyClientW: body && body.clientWidth, bodyScrollH: body && body.scrollHeight, bodyClientH: body && body.clientHeight, bodyOverflowY: body && getComputedStyle(body).overflowY,
    barExists: !!bar, barWidth: R(bar), barBg: bar && getComputedStyle(bar).backgroundColor, siblingBg: sib && getComputedStyle(sib).backgroundColor, headers: [...lb.querySelectorAll('th.z-listheader')].map(h => h.textContent.trim()) };
}`;

(async () => {
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = {};
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  // ── listbox-header.zul (test 1 passed; record what it measured)
  {
    const page = await ctx.newPage();
    await page.goto(BASE + '/web/listbox-header.zul', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    out.listboxHeader = await page.evaluate((src) => { const f = eval(src); const lbs = [...document.querySelectorAll('.z-listbox')]; const idx = lbs.findIndex(lb => { const b = lb.querySelector('.z-listbox-body'); return !!b && b.offsetWidth > b.clientWidth; }); return { nListbox: lbs.length, idx, picked: idx >= 0 ? f(lbs[idx]) : null, all: lbs.map(f) }; }, barSrc);
    console.log('listbox-header.zul: listboxes', out.listboxHeader.nListbox, 'first with scrollbar idx', out.listboxHeader.idx, JSON.stringify(out.listboxHeader.picked));
    await page.close();
  }
  // ── bandbox.zul: the spec's locator, then the real example
  {
    const page = await ctx.newPage();
    await page.goto(BASE + '/web/bandbox.zul', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    out.bandbox = await page.evaluate(() => ({
      htmlLabelElements: document.querySelectorAll('label').length,
      htmlLabelWithText: [...document.querySelectorAll('label')].filter(l => l.textContent.trim() === 'Listbox in bandpopup').length,
      zLabelWithText: [...document.querySelectorAll('.z-label')].filter(l => l.textContent.trim() === 'Listbox in bandpopup').map(l => ({ tag: l.tagName, cls: l.className, parentTag: l.parentElement.tagName, parentCls: l.parentElement.className, parentHasBandbox: !!l.parentElement.querySelector('.z-bandbox') })),
      specLocatorMatches: document.querySelectorAll('div:has(> label)').length,
    }));
    console.log('bandbox.zul: <label> elements', out.bandbox.htmlLabelElements, '; <label> with text', out.bandbox.htmlLabelWithText, '; .z-label with text', JSON.stringify(out.bandbox.zLabelWithText));
    // open the real example: the bandbox inside the div that holds the .z-label "Listbox in bandpopup"
    const btn = page.locator('div:has(> .z-label:text-is("Listbox in bandpopup")) .z-bandbox-button');
    out.bandbox.buttonCount = await btn.count();
    if (out.bandbox.buttonCount) {
      await btn.first().click();
      const lb = page.locator('.z-bandpopup .z-listbox:visible');
      await lb.first().waitFor({ state: 'visible', timeout: 5000 });
      await page.waitForTimeout(400);
      out.bandbox.popupListbox = await lb.first().evaluate((el, src) => eval(src)(el), barSrc);
      const box = await lb.first().boundingBox();
      await page.screenshot({ path: path.join(__dirname, 's4-bandbox-popup.png'), clip: { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 60), width: box.width + 40, height: box.height + 80 } });
      console.log('bandbox popup listbox:', JSON.stringify(out.bandbox.popupListbox));
    }
    await page.close();
  }
  fs.writeFileSync(path.join(__dirname, 'r2-s4-probe.json'), JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
