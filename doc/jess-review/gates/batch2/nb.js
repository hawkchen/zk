module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test'); const fs=require('fs');
(async()=>{const [e,a]=process.argv.slice(2).map(f=>fs.readFileSync(f).toString('base64')); const b=await chromium.launch(); const p=await b.newPage();
console.log(JSON.stringify(await p.evaluate(async([e64,a64])=>{const load=async s=>{const i=new Image();i.src='data:image/png;base64,'+s;await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return{w:i.width,h:i.height,d:x.getImageData(0,0,i.width,i.height).data}};
const E=await load(e64),A=await load(a64);const near=(d,i,q,t)=>Math.abs(d[i]-q[0])<=t&&Math.abs(d[i+1]-q[1])<=t&&Math.abs(d[i+2]-q[2])<=t;
const grey=(d,i)=>Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])<=8; const tinted=(d,i)=>d[i+2]-d[i]>=10;
const OLD=[[213,230,255],[197,213,241]],NEW=[[200,213,234],[186,198,219]];let inSel=0,outSel=0;const out=[];
for(let y=0;y<E.h;y++)for(let x=0;x<E.w;x++){const i=(y*E.w+x)*4;if(Math.max(Math.abs(E.d[i]-A.d[i]),Math.abs(E.d[i+1]-A.d[i+1]),Math.abs(E.d[i+2]-A.d[i+2]))<=3)continue;
if(OLD.some(o=>near(E.d,i,o,4))||NEW.some(o=>near(A.d,i,o,4))||(tinted(E.d,i)&&tinted(A.d,i)))continue; if(grey(E.d,i)&&grey(A.d,i))continue;
let f=false;for(let dy=-12;dy<=12&&!f;dy++)for(let dx=-30;dx<=30&&!f;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=E.w||yy>=E.h)continue;const j=(yy*E.w+xx)*4;if(OLD.some(o=>near(E.d,j,o,4))&&NEW.some(o=>near(A.d,j,o,4)))f=true;}
f?inSel++:(outSel++,out.push([x,y]));}
return{inSel,outSel,out:out.slice(0,20)}},[e,a])));await b.close();})();
