const { chromium, open } = require('./lib');
(async()=>{const b=await chromium.launch();const {page}=await open(b,'zz-b3-tmp.zul');
for(const cls of ['t-g-nested','t-g-colspan']){
const g=page.locator('.z-grid.'+cls).first();await g.scrollIntoViewIfNeeded();
const r=await g.evaluate(g=>[...g.querySelectorAll('td')].filter(t=>getComputedStyle(t).boxShadow!=='none').map(t=>({cls:t.className,txt:t.innerText.slice(0,12),l:Math.round(t.getBoundingClientRect().left),r:Math.round(t.getBoundingClientRect().right),inNested:!!t.closest('.z-grid')&&t.closest('.z-grid')!==g,rowCells:t.parentElement.cells.length})));
console.log(cls,JSON.stringify(r));
await g.screenshot({path:`dbg-${cls}-rest.png`});
await g.evaluate(g=>{const f=g.querySelector('.z-frozen-inner');f.scrollLeft=f.scrollWidth});await page.waitForTimeout(500);
await g.screenshot({path:`dbg-${cls}-end.png`});
}
await b.close()})();
