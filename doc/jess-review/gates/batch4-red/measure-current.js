const { chromium } = require('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://127.0.0.1:8085/biglistbox.zul'); await p.waitForSelector('.z-biglistbox-header', {timeout: 20000});
  await p.waitForTimeout(1500);
  await p.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
  const r = await p.evaluate(() => [...document.querySelectorAll('.z-biglistbox')].map(w => {
    const q = s => w.querySelector(s); const R = e => { if(!e) return null; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height,disp:cs.display,vis:cs.visibility}; };
    return { id: w.id, box: R(w), headOuter: R(q('.z-biglistbox-head-outer')), bodyOuter: R(q('.z-biglistbox-body-outer')),
      vbar: R(q('.z-biglistbox-wscroll-vertical')), hbar: R(q('.z-biglistbox-wscroll-horizontal')),
      vdrag: R(q('.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag')), hdrag: R(q('.z-biglistbox-wscroll-horizontal .z-biglistbox-wscroll-drag')),
      lastHeader: R([...w.querySelectorAll('th.z-biglistbox-header')].pop()) };
  }));
  console.log(JSON.stringify(r, null, 1));
  await p.screenshot({ path: '/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/91040505-ac54-4b45-a393-92933f6c251e/scratchpad/bl.png' });
  await b.close();
})();
