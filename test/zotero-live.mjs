// Opt-in integration check. Uses real Crossref exports and an isolated Zotero translator.
import assert from 'node:assert/strict';
import { verifyReference, downloadBibtex, comparableTitle } from '../docs/reference.mjs';
const dois = ['10.1016/j.compstruct.2021.114254','10.1515/rams-2021-0066',
  '10.1007/s13369-024-09002-9','10.1007/s40069-015-0123-6','10.1038/171737a0'];
for (const doi of dois) {
  const record = await verifyReference(doi);
  const bib = await downloadBibtex(doi);
  const response = await fetch('http://127.0.0.1:1969/import', {
    method:'POST',headers:{'Content-Type':'text/plain'},body:bib,signal:AbortSignal.timeout(20000)
  });
  assert.ok(response.ok, 'Zotero HTTP '+response.status+' for '+doi);
  const items = await response.json();
  assert.equal(items.length,1);
  const [item] = items;
  assert.equal(item.DOI.toLowerCase(),doi);
  assert.ok([record.title,[record.title,...record.subtitles].join(': ')].map(comparableTitle).includes(comparableTitle(item.title)),doi+' title');
  assert.ok(Object.values(record.years).filter(Boolean).some(y => item.date.includes(String(y))),doi+' year');
  const authors = item.creators.filter(a => a.creatorType === 'author').map(a => a.name || [a.firstName,a.lastName].filter(Boolean).join(' '));
  assert.deepEqual(authors.map(comparableTitle),record.authors.map(comparableTitle),doi+' author order');
  console.log(doi, item.title, item.date, authors.length+' authors');
}
