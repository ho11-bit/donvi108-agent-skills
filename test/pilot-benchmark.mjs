// Run on demand; one request per seven seconds, operator-labelled, no paid services.
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { writeFile } from 'node:fs/promises';
const origin = 'https://donvi108-agent-hub-live-preview.donvi108.workers.dev';
const cases = [
  ['B1','10.14359/51689151','Thử nghiệm nào xét ảnh hưởng của tỷ số nhịp cắt và chiều cao hữu hiệu đến sức kháng cắt của dầm cao?','reinforced concrete deep beams shear behavior shear span depth effective beam depth 24 beams'],
  ['B2','10.1016/j.istruc.2024.107106','Nghiên cứu nào xét cốt thép bụng ngang và bản đệm gối trong dầm cao?','horizontal web reinforcement depth bearing plates serviceability reinforced concrete deep beams'],
  ['B3','10.1007/s40069-015-0123-6','Có nghiên cứu nào mô hình hóa phân bố xác suất của hệ số khuếch tán clorua trong bê tông cốt liệu tái chế?','probability distribution chloride diffusion coefficient recycled aggregate concrete'],
  ['B4','10.1016/j.scitotenv.2022.159197','Bài nào đề xuất hai bước tính hệ số khuếch tán clorua khi có cả cốt liệu tự nhiên và tái chế?','two-step approach calculating chloride diffusion coefficient natural recycled aggregates']
];
async function search(surface, query) {
  const args = {query,limit:5,source:'internal-qa'};
  const rpc = {jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'research_papers',arguments:args}};
  const isMcp = surface === 'MCP';
  const response = await fetch(origin+(isMcp ? '/mcp':'/v1/beta/research/search'), {
    method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},
    body:JSON.stringify(isMcp ? rpc : args),signal:AbortSignal.timeout(25000)
  });
  if (!response.ok) throw new Error('HTTP '+response.status);
  const result = await response.json();
  if (isMcp && !result.result?.content?.[0]?.text) throw new Error('MCP error');
  const body = isMcp ? JSON.parse(result.result.content[0].text) : result;
  if (!Array.isArray(body.data?.items)) throw new Error(body.error?.code || 'missing results');
  return body.data.items.map(item => item.doi.toLowerCase());
}
const rows = [];
for (const [id,accepted,vi,en] of cases) {
  for (const [language,query] of [['en',en],['vi',vi]]) {
    for (const surface of ['REST','MCP']) {
      if (rows.length) await delay(7100);
      const row = {at:new Date().toISOString(),id,language,surface};
      try {
        const dois = await search(surface,query);
        Object.assign(row,{status:'ok',rank:dois.includes(accepted)?dois.indexOf(accepted)+1:null,dois});
      } catch (error) { Object.assign(row,{status:'unavailable',reason:error.message}); }
      rows.push(row); console.log(JSON.stringify(row));
    }
  }
}
const metrics = await (await fetch(origin+'/v1/beta/metrics',{signal:AbortSignal.timeout(15000)})).json();
assert.ok(metrics.data.anonymous_daily.some(row=>row.channel==='internal-qa' && row.count>0));
await writeFile('pilot-benchmark.json',JSON.stringify({rows,measurement:'operator QA; no people counted'},null,2));
assert.ok(rows.some(row=>row.status==='ok'), 'All searches unavailable');
