const { chromium, pixels } = require('./lib'); const fs = require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext();const page=await ctx.newPage();await page.goto('about:blank');
for(const n of process.argv.slice(2)){const d=`/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/test-results/${n}`;const nm=n.replace('screenshot-','').replace('-chromium','').replace('tablet-','');
 const f=fs.readdirSync(d).filter(x=>x.endsWith('-expected.png'))[0].replace('-expected.png','');
 const e=await pixels(page,fs.readFileSync(`${d}/${f}-expected.png`)),a=await pixels(page,fs.readFileSync(`${d}/${f}-actual.png`));
 console.log(n,e.w+'x'+e.h,a.w+'x'+a.h);
 if(e.w!==a.w||e.h!==a.h){console.log(' SIZE DIFFERS');continue}
 const W=e.w,H=e.h;const pts=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;const m=Math.max(Math.abs(e.d[i]-a.d[i]),Math.abs(e.d[i+1]-a.d[i+1]),Math.abs(e.d[i+2]-a.d[i+2]));if(m>12)pts.push([x,y,m])}
 // cluster by grid of 40px
 const cl=new Map();for(const [x,y,m] of pts){const k=Math.floor(x/60)+','+Math.floor(y/30);const c=cl.get(k)||{x0:1e9,y0:1e9,x1:0,y1:0,n:0,max:0};c.x0=Math.min(c.x0,x);c.y0=Math.min(c.y0,y);c.x1=Math.max(c.x1,x);c.y1=Math.max(c.y1,y);c.n++;c.max=Math.max(c.max,m);cl.set(k,c)}
 console.log(' diff px(>12):',pts.length,'clusters',cl.size);
 for(const c of [...cl.values()].sort((p,q)=>p.y0-q.y0||p.x0-q.x0))console.log('  ',`x${c.x0}-${c.x1} y${c.y0}-${c.y1} n=${c.n} max=${c.max}`);
}
await b.close()})();
