const { chromium } = require('./lib'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 400 } });
  const files = process.argv.slice(3);
  const html = '<body style="margin:0;font:11px sans-serif;background:#fff">' + files.map(f => `<div style="margin:4px;display:inline-block;vertical-align:top;border:1px solid #f00"><div>${f}</div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"></div>`).join('') + '</body>';
  await p.setContent(html); await p.screenshot({ path: process.argv[2], fullPage: true }); await b.close(); })();
