// Batch 7 RED, scrollbar probe. Playwright's default headless args include --hide-scrollbars, so in probe-dom.json every
// .z-listbox-body had offsetWidth == clientWidth and the listhead-bar cell was 0px wide: Jess's strip cannot appear there.
// This probe shows the three launch configurations; red3.js launches with ignoreDefaultArgs:['--hide-scrollbars'].
// (A wrapper passing macOS '-AppleShowScrollBars Always' to the browser process made no difference and was dropped.)
const L = require('./lib.js');
(async () => {
  const out = [];
  for (const cfg of [{}, { ignoreDefaultArgs: ['--hide-scrollbars'] }, { ignoreDefaultArgs: ['--hide-scrollbars'], headless: false }]) {
    const browser = await L.chromium.launch(cfg);
    const { ctx, page } = await L.open(browser, 'listbox-header.zul');
    const r = await page.evaluate(() => {
      const lb = [...document.querySelectorAll('.z-listbox')][9]; const body = lb.querySelector('.z-listbox-body'); const bar = lb.querySelector('.z-listhead-bar');
      return { offsetWidth: body.offsetWidth, clientWidth: body.clientWidth, scrollbarW: body.offsetWidth - body.clientWidth, scrollHeight: body.scrollHeight, clientHeight: body.clientHeight, barW: bar ? bar.getBoundingClientRect().width : null };
    });
    out.push({ cfg, listboxHeader9: r });
    console.log(JSON.stringify(cfg), JSON.stringify(r));
    await ctx.close(); await browser.close();
  }
  L.save('probe-scrollbar.json', out);
})();
