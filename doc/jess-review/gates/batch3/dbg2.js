const { chromium, open } = require('./lib');
(async()=>{const b=await chromium.launch();const {page}=await open(b,'zz-b3-tmp.zul');
const g=page.locator('.z-grid.t-g-nested').first();await g.scrollIntoViewIfNeeded();
await g.evaluate(g=>{const f=g.querySelector('.z-frozen-inner');f.scrollLeft=f.scrollWidth});await page.waitForTimeout(500);
console.log(await g.evaluate(g=>{const n=g.querySelector('.z-grid .z-grid');const r=n.getBoundingClientRect();return {l:r.left,r:r.right,bs:getComputedStyle(n).borderRightWidth+' '+getComputedStyle(n).borderRightColor}}));
await g.screenshot({path:'dbg-t-g-nested-end2.png'});
await b.close()})();
