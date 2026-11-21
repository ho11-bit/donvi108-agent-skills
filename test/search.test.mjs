import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

for (const status of [200,429,503]) {
  test('guest CLI search via HTTP '+status, async t => {
    const dir = await mkdtemp(join(tmpdir(),'donvi108-ci-'));
    const originalArgs = process.argv, originalCode = process.exitCode;
    const oldDir = process.env.DONVI108_BETA_CREDENTIAL_DIR;
    process.env.DONVI108_BETA_CREDENTIAL_DIR = dir;
    process.argv = [process.execPath,'client.mjs','search','concrete test'];
    process.exitCode = 0;
    const log = t.mock.method(console,'log',() => {});
    const err = t.mock.method(console,'error',() => {});
    let request;
    t.mock.method(globalThis,'fetch',async (url, options) => {
      request = {url,options};
      return Response.json({data:{items:[]},error:{code:'UPSTREAM'}},{status});
    });
    try {
      await import('../skills/donvi108-research/scripts/client.mjs?test='+status);
      assert.equal(new URL(request.url).pathname,'/v1/beta/research/search');
      assert.equal(request.options.headers.Authorization,undefined);
      assert.deepEqual(JSON.parse(request.options.body),{query:'concrete test',limit:3,source:'unknown'});
      if (status === 200) {
        assert.equal(process.exitCode,0);
        assert.deepEqual(JSON.parse(log.mock.calls[0].arguments[0]),{items:[]});
      } else {
        assert.equal(process.exitCode,1);
        assert.match(err.mock.calls[0].arguments[0],new RegExp('HTTP '+status));
      }
    } finally {
      process.argv = originalArgs; process.exitCode = originalCode;
      if (oldDir === undefined) delete process.env.DONVI108_BETA_CREDENTIAL_DIR;
      else process.env.DONVI108_BETA_CREDENTIAL_DIR = oldDir;
      await rm(dir,{recursive:true,force:true});
    }
  });
}
