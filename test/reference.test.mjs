import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDoi, verifyReference, downloadBibtex } from '../docs/reference.mjs';

const doi = '10.1234/a(b).';
const paper = { DOI: doi, title: ['Bond &amp; strength'], subtitle: ['A study'], author: [{given:'A', family:'Nguyễn'}, {name:'UTC Lab'}],
  'container-title':['Journal'], 'published-online':{'date-parts':[[2024]]}, 'published-print':{'date-parts':[[2025]]} };
const serve = message => async () => Response.json({message});
for (const form of [doi, 'DOI: '+doi, 'https://doi.org/'+doi, '<https://dx.doi.org/10.1234%2Fa(b).>']) {
  test('accepts ' + form, () => assert.equal(parseDoi(form), doi));
}
test('rejects unrelated hosts, credentials and malformed DOI', () => {
  for (const input of ['', '10.1/x', 'https://doi.org.invalid/10.1234/x','https://x@doi.org/10.1234/x','10.1234/two words'])
    assert.throws(() => parseDoi(input));
});
test('retains special characters in a DOI URL', () => {
  assert.equal(parseDoi('https://doi.org/10.1234/x%23y%2Bz%3Fq'), '10.1234/x#y+z?q');
});
test('verifies title and fields without sending the expected title or credentials', async () => {
  const item = await verifyReference(doi, 'Bond & Strength: A study.', async (url, opts) => {
    assert.equal(url, 'https://api.crossref.org/works/'+doi);
    assert.equal(opts.credentials, 'omit'); assert.deepEqual(opts.headers, {Accept:'application/json'});
    return Response.json({message:paper});
  });
  assert.equal(item.comparison,'title_matches'); assert.deepEqual(item.authors,['A Nguyễn','UTC Lab']);
  assert.deepEqual(item.years,{online:2024,print:2025,issued:null}); assert.deepEqual(item.missing,[]);
});
test('different, absent, or unavailable titles have distinct results', async () => {
  assert.equal((await verifyReference(doi,'Different work',serve(paper))).comparison,'title_differs');
  assert.equal((await verifyReference(doi,'',serve(paper))).comparison,'no_title_supplied');
  const item = await verifyReference(doi,'Expected',serve({DOI:doi}));
  assert.equal(item.comparison,'needs_review'); assert.deepEqual(item.missing,['title','authors','venue','year']);
});
test('preserves scientific symbols in comparisons', async () => {
  const item = await verifyReference(doi,'Na+',serve({...paper,title:['Na−']}));
  assert.equal(item.comparison,'title_differs');
});
test('rejects an unrelated record', async () => {
  await assert.rejects(verifyReference(doi,'',serve({...paper,DOI:'10.1234/other'})),/invalid_response/);
});
for (const [status, code] of [[404,'not_in_crossref'],[429,'rate_limited'],[503,'source_unavailable']]) {
  test('reports HTTP '+status+' for both operations', async () => {
    const fail = async () => new Response(null,{status});
    await assert.rejects(verifyReference(doi,'',fail),new RegExp(code));
    await assert.rejects(downloadBibtex(doi,fail),new RegExp(code));
  });
}
test('exports the record provided by Crossref with its author order intact', async () => {
  const bib = '@article{example, author = {First and Second}, doi = {'+doi+'}}';
  assert.equal(await downloadBibtex(doi,async (url, opts) => {
    assert.ok(url.endsWith('/transform/application/x-bibtex')); assert.equal(opts.headers.Accept,'application/x-bibtex');
    return new Response(bib);
  }),bib+'\n');
});
test('does not download an HTML error page as a citation', async () => {
  await assert.rejects(downloadBibtex(doi,async () => new Response('<html>Unavailable</html>')),/invalid_response/);
});
