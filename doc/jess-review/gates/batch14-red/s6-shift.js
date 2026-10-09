// where does the 3px height shift start in grid-header-gallery? compare actual[y] with expected[y+k], k=0..3, per 50-row block
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs=require('fs'),path=require('path'); const {PNG}=require('playwright-core/lib/utilsBundle');
const d=path.join(__dirname,'s6/grid-run1/gallery-scan-gallery-grid-header-gallery/'); const E=PNG.sync.read(fs.readFileSync(d+'grid-header-gallery-expected.png')), A=PNG.sync.read(fs.readFileSync(d+'grid-header-gallery-actual.png'));
const w=E.width; const rowEq=(ya,ye)=>{ if(ye<0||ye>=E.height) return 0; let n=0; for(let x=0;x<w;x++){const i=(ye*w+x)*4,j=(ya*w+x)*4; if(E.data[i]===A.data[j]&&E.data[i+1]===A.data[j+1]&&E.data[i+2]===A.data[j+2]) n++;} return n; };
for(let y0=0;y0<A.height;y0+=100){ const res=[]; for(const k of [0,1,2,3]){ let s=0,t=0; for(let y=y0;y<Math.min(y0+100,A.height);y++){ s+=rowEq(y,y+k); t+=w; } res.push((100*s/t).toFixed(1)); } console.log(`y${y0}-${Math.min(y0+99,A.height-1)}: match% k0 ${res[0]} k1 ${res[1]} k2 ${res[2]} k3 ${res[3]}`); }
