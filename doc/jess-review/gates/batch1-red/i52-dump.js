// Dump raw pixel colours along the scan line of each saved screenshot (diagnostic for #52)
const { launch } = require('./common');
const fs = require('fs');
(async () => {
  const b = await launch(); const p = await b.newPage();
  const r = require('./i52.out.json');
  for (const k of ['first', 'bottom', 'vertical', 'right']) {
    const o = r[k]; const buf = fs.readFileSync(__dirname + '/i52/' + o.label + '.png');
    const d = await p.evaluate(async ([b64, o]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const t = o.textBoxInImg; const tcx = Math.round((t.x0 + t.x1) / 2 - 0.5), tcy = Math.round((t.y0 + t.y1) / 2 - 0.5);
      const px = (X, Y) => Array.from(x.getImageData(X, Y, 1, 1).data.slice(0, 3)).join(',');
      const out = [];
      if (o.axis.startsWith('horizontal')) { for (let y = 0; y < img.height; y++) out.push(y + ':' + px(tcx, y)); }
      else { for (let X = 0; X < img.width; X++) out.push(X + ':' + px(X, tcy)); }
      return out;
    }, [buf.toString('base64'), o]);
    const filt = d.filter((s) => !s.endsWith(':255,255,255'));
    console.log(k, o.axis, '\n ', filt.join('  '));
  }
  await b.close();
})();
