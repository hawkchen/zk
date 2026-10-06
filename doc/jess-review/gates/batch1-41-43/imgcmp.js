module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { PNG } = require('playwright-core/lib/utilsBundle');
const fs = require('fs');
for (const n of ['listbox','tree']) {
  const d = `pw-chromium/screenshot-${n}-gallery-chromium/${n}-gallery-`;
  const a = PNG.sync.read(fs.readFileSync(d+'expected.png')), b = PNG.sync.read(fs.readFileSync(d+'actual.png'));
  console.log(n, 'expected', a.width+'x'+a.height, 'actual', b.width+'x'+b.height);
  // bounding rows of differences, and test vertical shift
  const W=Math.min(a.width,b.width), H=Math.min(a.height,b.height);
  const rowDiff = (dy)=>{ let c=0; for(let y=0;y<H;y++){const y2=y+dy; if(y2<0||y2>=b.height) continue; for(let x=0;x<W;x++){const i=(y*a.width+x)*4,j=(y2*b.width+x)*4; if(Math.abs(a.data[i]-b.data[j])+Math.abs(a.data[i+1]-b.data[j+1])+Math.abs(a.data[i+2]-b.data[j+2])>30) c++;}} return c; };
  for (const dy of [-3,-2,-1,0,1,2,3]) console.log('  dy',dy,'diffpx',rowDiff(dy));
  const colDiff = (dx)=>{ let c=0; for(let y=0;y<H;y++){ for(let x=0;x<W;x++){const x2=x+dx; if(x2<0||x2>=b.width) continue; const i=(y*a.width+x)*4,j=(y*b.width+x2)*4; if(Math.abs(a.data[i]-b.data[j])+Math.abs(a.data[i+1]-b.data[j+1])+Math.abs(a.data[i+2]-b.data[j+2])>30) c++;}} return c; };
  for (const dx of [-2,-1,1,2]) console.log('  dx',dx,'diffpx',colDiff(dx));
}
