const { chromium } = require('/Users/hawk/Documents/workspace/ZK10/jess-b/zk/zkpreview/node_modules/playwright');
const URL = 'http://127.0.0.1:8105/web/errorbox.zul';
const WORKAROUND = `(function(){var _f=zul.inp.Errorbox.prototype._fixarrow;zul.inp.Errorbox.prototype._fixarrow=function(){var ps=this.$n('p').style;ps.left=ps.top=ps.right=ps.bottom='';_f.apply(this,arguments);};})()`;
async function state(page){
  return page.evaluate(()=>{
    const b=[...document.querySelectorAll('.z-errorbox')].find(e=>e.offsetParent&&!e.closest('.z-div-static')&&e.querySelector('.z-errorbox-content') && getComputedStyle(e).position==='absolute' && e.style.top!=='');
    if(!b) return null;
    const p=b.querySelector('.z-errorbox-pointer'), r=b.getBoundingClientRect(), pr=p.getBoundingClientRect(), c=b.querySelector('.z-errorbox-content').getBoundingClientRect();
    return {cls:p.className, inline:p.getAttribute('style'), box:[r.left,r.top,r.right,r.bottom].map(Math.round), content:[c.left,c.top,c.right,c.bottom].map(Math.round), ptr:[pr.left,pr.top,pr.right,pr.bottom].map(Math.round)};
  });
}
async function run(withWorkaround){
  const br=await chromium.launch(); const page=await br.newPage({viewport:{width:1280,height:900}});
  await page.goto(URL); await page.waitForSelector('input[placeholder="Required field"]');
  if(withWorkaround) await page.evaluate(WORKAROUND);
  const inp=page.locator('input[placeholder="Required field"]').first();
  await inp.click(); await page.keyboard.press('Tab'); await page.waitForTimeout(800);
  const first=await state(page);
  if(!first){ await br.close(); return {error:'no errorbox'}; }
  // drag the box content (left part) to above the field
  const ib=await inp.boundingBox(); const cb={x:first.content[0]+6,y:(first.content[1]+first.content[3])/2};
  await page.mouse.move(cb.x,cb.y); await page.mouse.down();
  await page.mouse.move(cb.x+10,cb.y-10,{steps:3}); await page.mouse.move(ib.x+20, ib.y-70,{steps:12}); await page.mouse.up(); await page.waitForTimeout(800);
  const after=await state(page);
  await page.screenshot({path:`/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/a6e892bb-3163-46a7-9e44-4a31bcc5d0b0/scratchpad/z6188/${withWorkaround?'with':'without'}-workaround.png`});
  await br.close(); return {first,after};
}
(async()=>{ console.log(JSON.stringify({without:await run(false), with:await run(true)},null,1)); })();
