// crop a PNG region via canvas: node crop.js in.png out.png x y w h [scale]
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs'); const { chromium } = require('@playwright/test');
(async () => { const [a, o, x, y, w, h, s] = process.argv.slice(2); const browser = await chromium.launch(); const page = await browser.newPage();
  const b64 = await page.evaluate(async ([b, x, y, w, h, s]) => { const img = new Image(); img.src = 'data:image/png;base64,' + b; await img.decode(); const c = document.createElement('canvas'); c.width = w * s; c.height = h * s; const cx = c.getContext('2d'); cx.imageSmoothingEnabled = false; cx.drawImage(img, x, y, w, h, 0, 0, w * s, h * s); return c.toDataURL().split(',')[1]; }, [fs.readFileSync(a).toString('base64'), +x, +y, +w, +h, +(s || 1)]);
  fs.writeFileSync(o, Buffer.from(b64, 'base64')); await browser.close(); })();
