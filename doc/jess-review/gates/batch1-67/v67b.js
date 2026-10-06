const { launch, open, idle } = require('./common');
const fs = require('fs');
const OUT = __dirname + '/i67';
const RED = '/Users/hawk/Documents/workspace/ZK10/zk/doc/jess-review/gates/batch1-red/i67/forced-static.png';
(async () => {
  const browser = await launch();
  const page = await open(browser, '/errorbox.zul', { forcedColors: true });
  const st = page.locator('.z-errorbox').first();
  const c = await st.locator('.z-errorbox-content').boundingBox();
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2); await idle(page);
  const b = await st.locator('.z-errorbox-close').boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await idle(page);
  await st.screenshot({ path: `${OUT}/forced-static-hoverclose.png` });
  const p2 = await browser.newPage();
  const r = await p2.evaluate(async ([da, db]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; });
    const [ia, ib] = await Promise.all([load(da), load(db)]);
    const g = (i) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
    const pa = g(ia), pb = g(ib); let n = 0;
    for (let k = 0; k < pa.length; k += 4) if (pa[k] !== pb[k] || pa[k+1] !== pb[k+1] || pa[k+2] !== pb[k+2]) n++;
    return { size: [ia.width, ia.height, ib.width, ib.height], diffPx: n };
  }, ['data:image/png;base64,' + fs.readFileSync(`${OUT}/forced-static-hoverclose.png`).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(RED).toString('base64')]);
  console.log(JSON.stringify(r));
  await browser.close();
})();
