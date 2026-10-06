module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { PNG } = require('playwright-core/lib/utilsBundle'); const fs=require('fs');
for (const n of ['listbox','tree']) {
  const d = `pw-chromium/screenshot-${n}-gallery-chromium/${n}-gallery-`;
  const a = PNG.sync.read(fs.readFileSync(d+'expected.png')), b = PNG.sync.read(fs.readFileSync(d+'actual.png'));
  // find diff pixels whose expected AND actual are both non-text-ish: report diff pixels where neither is dark (lum<180)
  let nonText=0, boxes=[];
  for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++){const i=(y*a.width+x)*4;
    const dd=Math.abs(a.data[i]-b.data[i])+Math.abs(a.data[i+1]-b.data[i+1])+Math.abs(a.data[i+2]-b.data[i+2]);
    if(dd>30){ const la=(a.data[i]+a.data[i+1]+a.data[i+2])/3, lb=(b.data[i]+b.data[i+1]+b.data[i+2])/3;
      const sa=Math.max(a.data[i],a.data[i+1],a.data[i+2])-Math.min(a.data[i],a.data[i+1],a.data[i+2]), sb=Math.max(b.data[i],b.data[i+1],b.data[i+2])-Math.min(b.data[i],b.data[i+1],b.data[i+2]);
      if (sa>60||sb>60) { nonText++; if(boxes.length<8) boxes.push([x,y,[...a.data.slice(i,i+3)],[...b.data.slice(i,i+3)]]); } } }
  console.log(n,'saturated(color) diff px',nonText, JSON.stringify(boxes));
}
