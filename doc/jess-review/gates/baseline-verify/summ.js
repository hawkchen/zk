const r = require(process.argv[2]);
const out = []; const counts = {};
(function walk(s, pre) { for (const sp of s.specs || []) for (const t of sp.tests) { const res = t.results[t.results.length-1]; const st = res ? res.status : 'none'; counts[st]=(counts[st]||0)+1; out.push([pre+' › '+sp.title, st, (res && res.errors && res.errors[0] ? res.errors[0].message.split('\n')[0].slice(0,160):'') ]);} for (const c of s.suites||[]) walk(c, pre? pre+' › '+c.title : c.title); })({suites:r.suites}, '');
console.log(JSON.stringify(counts), 'stats', JSON.stringify(r.stats && {expected:r.stats.expected, unexpected:r.stats.unexpected, skipped:r.stats.skipped, flaky:r.stats.flaky}));
const f = process.argv[3]; for (const o of out) if (!f || new RegExp(f).test(o[0])) console.log(o.join(' | '));
