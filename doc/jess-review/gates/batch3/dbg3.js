const { chromium, open } = require('./lib');
(async()=>{const b=await chromium.launch();const {page}=await open(b,'zz-b3-tmp.zul');
console.log(await page.evaluate(()=>[...document.querySelectorAll('.z-grid')].map(g=>g.className).slice(-3)));
console.log(await page.evaluate(()=>document.body.innerText.slice(-300)));
await b.close()})();
