#!/usr/bin/env node
import {mkdir,open,readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
const origin='https://donvi108-agent-hub-live-preview.donvi108.workers.dev';
const directory=process.env.DONVI108_BETA_CREDENTIAL_DIR || join(homedir(),'.config','donvi108-beta');
const credentialFile=join(directory,'credential.json');
const [command,argument,...options]=process.argv.slice(2);
const flags={};
for(let i=0;i<options.length;i+=2){if(!options[i]?.startsWith('--')||options[i+1]===undefined)throw new Error('Flags require values');flags[options[i].slice(2)]=options[i+1];}
async function request(path,input,token){
 const response=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(input),redirect:'error',signal:AbortSignal.timeout(25000)});
 let body;try{body=await response.json();}catch{throw new Error('Invalid service response; no automatic retry');}
 if(!response.ok)throw new Error(`HTTP ${response.status}: ${body.error?.code??'REQUEST_FAILED'}. Consult quickstart; no automatic retry.`);
 return body.data;
}
try{
 if(command==='register'){
  if(!/^[a-z0-9][a-z0-9-]{2,59}$/.test(argument??''))throw new Error('Provide a unique public lowercase slug (3-60 characters).');
  if(Object.keys(flags).length)throw new Error('No registration flags supported');
  await mkdir(directory,{recursive:true,mode:0o700});
  const file=await open(credentialFile,'wx',0o600);
  try{
   await file.writeFile(JSON.stringify({state:'registration_pending',slug:argument}));await file.sync();
   const value=await request('/v1/agents/register',{slug:argument,display_name:argument});
   if(typeof value?.credential?.token!=='string'||typeof value?.agent?.id!=='string')throw new Error('Registration response incomplete; do not automatically register again');
   const bytes=Buffer.from(JSON.stringify({origin,agent_id:value.agent.id,token:value.credential.token}));
   await file.truncate(0);await file.write(bytes,0,bytes.length,0);await file.sync();
   console.log(JSON.stringify({registered:true,agent_id:value.agent.id,credential_stored:true,token_printed:false}));
  }finally{await file.close();}
 }else if(command==='search'||command==='feedback'){
  const stored=JSON.parse(await readFile(credentialFile,'utf8'));
  if(stored.origin!==origin||typeof stored.token!=='string')throw new Error('Credential is missing or registration outcome is uncertain; do not blindly register again');
  let path,input;
  if(command==='search'){
   if(Object.keys(flags).some(k=>!['limit','source'].includes(k)))throw new Error('Unsupported search flag');
   if(!argument||argument.length<3||argument.length>300)throw new Error('Query must have 3-300 characters');
   const limit=Number(flags.limit??3);if(!Number.isInteger(limit)||limit<1||limit>5)throw new Error('limit must be 1-5');
   path='/v1/beta/research/search';input={query:argument,limit,source:flags.source??'unknown'};
  }else{
   if(Object.keys(flags).some(k=>!['useful','category','comment'].includes(k)))throw new Error('Unsupported feedback flag');
   if(!argument||!['true','false'].includes(flags.useful)||!['relevant','irrelevant','missing_metadata','slow','integration','other'].includes(flags.category))throw new Error('Feedback needs call ID, --useful true|false and a documented --category');
   path='/v1/beta/feedback';input={call_id:argument,useful:flags.useful==='true',category:flags.category,comment:flags.comment??''};
  }
  console.log(JSON.stringify(await request(path,input,stored.token),null,2));
 }else{
  console.log('Usage: client.mjs register UNIQUE-SLUG | search "PUBLIC QUERY" [--limit 3] [--source github] | feedback CALL-ID --useful true|false --category CATEGORY [--comment "PUBLIC-SAFE COMMENT"]');
  if(command)process.exitCode=1;
 }
}catch(error){
 const known=error?.code==='EEXIST'?'Credential file already exists; registration stopped. Use it if valid, or inspect an uncertain registration outcome without exposing its contents.':error?.code==='ENOENT'?'No saved credential. Register once first.':String(error.message??'Request failed');
 console.error(known.replace(/dv108\.[A-Z0-9-]+\.[a-f0-9]{64}/gi,'[REDACTED]'));process.exitCode=1;
}
