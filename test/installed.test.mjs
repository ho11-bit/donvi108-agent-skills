import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const script = '../skills/donvi108-research/scripts/client.mjs';
test('the installable DOI library and GitHub Pages distribution are byte-identical',async()=>{
  const files=await Promise.all(['../docs/reference.mjs','../skills/donvi108-research/scripts/reference.mjs'].map(path=>readFile(new URL(path,import.meta.url))));
  assert.deepEqual(files[0],files[1]);
});
test('installed commands verify, export and preserve an existing file without a credential',async t=>{
  const dir=await mkdtemp(join(tmpdir(),'donvi108-installed-')), doi='10.1234/fixture', dest=join(dir,'paper.bib');
  const before=process.argv, previous=process.exitCode;
  const logger=t.mock.method(console,'log',()=>{}), error=t.mock.method(console,'error',()=>{});
  const bib='@article{record,doi={'+doi+'}}';
  t.mock.method(globalThis,'fetch',async (url,options)=>{
    assert.equal(new URL(url).hostname,'api.crossref.org');assert.equal(options.credentials,'omit');
    return url.endsWith('/x-bibtex')?new Response(bib):Response.json({message:{DOI:doi,title:['A title']}});
  });
  try{
    process.argv=[process.execPath,'client.mjs','verify',doi,'--title','Different'];
    await import(script+'?verify');assert.equal(JSON.parse(logger.mock.calls[0].arguments[0]).comparison,'title_differs');
    process.argv=[process.execPath,'client.mjs','bib',doi,'--out',dest];
    await import(script+'?bib');assert.equal(await readFile(dest,'utf8'),bib+'\n');
    await import(script+'?exists');assert.equal(process.exitCode,1);assert.match(error.mock.calls[0].arguments[0],/already exists/);
    assert.equal(await readFile(dest,'utf8'),bib+'\n');
  }finally{process.argv=before;process.exitCode=previous;await rm(dir,{recursive:true,force:true});}
});
