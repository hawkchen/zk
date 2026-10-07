const { chromium, open, settle } = require('./lib');
(async()=>{const b=await chromium.launch();const {page}=await open(b,'zz-b3-tmp.zul',{deviceScaleFactor:2});
const g=page.locator('.z-grid.t-g-hdr');await g.scrollIntoViewIfNeeded();
for(let i=0;i<4;i++){const th=g.locator('th.z-column').nth(i);
 await th.locator('.z-column-content').click({position:{x:8,y:8}});await settle(page);
 await page.mouse.move(5,5);await page.waitForTimeout(150);
 const bb=await th.boundingBox();
 await page.screenshot({path:`hdr-col${i}-asc-rest.png`,clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height}});
 await th.hover({position:{x:10,y:10}});await page.waitForTimeout(150);
 await page.screenshot({path:`hdr-col${i}-asc-hover.png`,clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height}});
 const info=await th.evaluate(t=>{const c=t.querySelector('.z-column-content');const cs=getComputedStyle(c);const ic=t.querySelector('.z-column-sorticon');const ics=getComputedStyle(ic);
  const w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT);let n,tr;while((n=w.nextNode())){if(n.textContent.trim()){const r=document.createRange();r.selectNodeContents(n);tr=r.getBoundingClientRect();break}}
  const R=e=>{const r=e.getBoundingClientRect();return [+r.left.toFixed(1),+r.right.toFixed(1)]};
  return {content:R(c),text:[+tr.left.toFixed(1),+tr.right.toFixed(1)],overflow:cs.overflow,textOverflow:cs.textOverflow,whiteSpace:cs.whiteSpace,sorticonBox:R(ic),sorticonDisplay:ics.display,sortI:t.querySelector('.z-column-sorticon i')?R(t.querySelector('.z-column-sorticon i')):null,btn:R(t.querySelector('.z-column-button')),th:R(t),order:[...c.children].map(e=>e.className)}});
 console.log(i,JSON.stringify(info));
}
await b.close()})();
