/** Real native paid-profile defaults must never bill a proxy-owned child. */
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import http from 'node:http';import {once} from 'node:events';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {createOpenClawGateway} from '../openclaw/gateway.mjs';import {createPoIBroker} from '../openclaw/broker.mjs';import {engine} from '../lib/engine.mjs';import {DIMENSIONS,FRUITS} from '../lib/providers.mjs';import {controlSessionKey} from '../lib/openclaw-controls.mjs';import {currentCanonicalSkill} from '../lib/canonical-skill.mjs';
const packageRoot=process.env.CT_OPENCLAW_PACKAGE,nodePath=process.env.CT_OPENCLAW_NODE;
test('actual native paid default cannot replace Free or BYOK child transport, and native mode still works',{
 skip:!packageRoot||!nodePath?'Set the reviewed native package and Node paths.':false,timeout:420000,
},async t=>{
 const directory=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'ct-mixed-route-'))),root=path.join(directory,'parent');
 const canonicalSkill=(await currentCanonicalSkill()).skill,answer='I can help with care and honesty.';
 const calls=[],diagnostics=[],children=new Map(),spawned=new Set(),registrations=[];let manager,broker,phase='setup',activeProxy;
 const provider=http.createServer(async(req,res)=>{
  let raw='';for await(const chunk of req)raw+=chunk;const body=JSON.parse(raw),native=req.url.startsWith('/native/');
  const text=(body.messages||[]).map(message=>typeof message.content==='string'?message.content:JSON.stringify(message.content)).join('\n');
  calls.push({phase,native,canonical:text.includes(canonicalSkill),privateMarker:raw.includes('[CHAINCHAT_PRIVATE_MODEL_ROUTE:'),model:body.model,auth:req.headers.authorization});
  const spawn=!native&&!spawned.has(phase)&&(body.messages||[]).some(message=>message.role==='user'&&JSON.stringify(message.content).includes('CT_PARENT_SPAWN'));
  if(spawn)spawned.add(phase);
  const delta=spawn?{role:'assistant',tool_calls:[{index:0,id:'mixedspawn'+phase,type:'function',function:{name:'sessions_spawn',arguments:JSON.stringify({task:'CT_CHILD_TASK_'+phase+': Please say you can help with care and honesty.',runtime:'subagent',agentId:'main',model:'fixture-native/paid',mode:'run',cleanup:'keep'})}}]}:{role:'assistant',content:answer};
  res.writeHead(200,{'content-type':'text/event-stream'});res.write(`data: ${JSON.stringify({id:'mixed-route',choices:[{index:0,delta,finish_reason:null}]})}\n\n`);res.end(`data: ${JSON.stringify({id:'mixed-route',choices:[{index:0,delta:{},finish_reason:spawn?'tool_calls':'stop'}],usage:{prompt_tokens:20,completion_tokens:10,total_tokens:30}})}\n\ndata: [DONE]\n\n`);
 });provider.listen(0,'127.0.0.1');await once(provider,'listening');
 t.after(async()=>{await manager?.close();await broker?.close();provider.closeAllConnections();await new Promise(resolve=>provider.close(resolve));assert.ok(directory.startsWith(await fs.realpath(os.tmpdir())+path.sep));await fs.rm(directory,{recursive:true,force:true,maxRetries:8,retryDelay:150});});
 await engine({op:'init',root,registryRoot:root,name:'Mixed route parent'});const initial=await engine({op:'inspect',root,registryRoot:root,learning:false});
 const identity={agentId:'mixed-route-parent',genesisHash:initial.genesis.hash},ownerKey=identity.agentId+':'+identity.genesisHash;
 const nativeCapabilities={enabled:true,acknowledged:true,tools:['sessions_spawn'],settings:[],delegatedRuns:true,backgroundRuns:false};
 const toolAuthority={enabled:true,acknowledged:true,tools:[],roots:[],networkHosts:[],allowExecution:false,nativeCapabilities};
 const context=input=>({root,input,purpose:'candidate',learning:false,loadout:[],settings:{recall:false},nativeIdentity:identity,nativeOwnerKey:ownerKey,nativeTools:['sessions_spawn'],toolAuthority,authorize:async()=>{}});
 broker=createPoIBroker({engine,review:async()=>({approved:true,scores:Object.fromEntries(DIMENSIONS.map(name=>[name,240])),fruitages:Object.fromEntries(FRUITS.map(name=>[name,240])),usedRings:[],rationale:'Synthetic local harmless route regression.'})});await broker.start();
 const register=broker.registerInvocation.bind(broker),finish=broker.finishInvocation.bind(broker);
 broker.registerInvocation=async input=>{const result=await register(input);registrations.push({phase,sessionKey:input.sessionKey,invocationId:input.invocationId,expected:input.context.expectedClientInputId||input.context.expectedNativeRunId,claimId:result.claimId});return result;};
 broker.finishInvocation=async input=>{const entry=registrations.find(row=>row.claimId===input.claimId);if(entry){const current=broker.nativeInvocation(entry.sessionKey);entry.observed=current?.claimId===input.claimId?current.runId:null;entry.sourceProof=current?.claimId===input.claimId?current.nativeInputProof:undefined;}return finish(input);};
 manager=createOpenClawGateway({stateDir:path.join(directory,'gateway'),packageRoot,nodePath,broker,deferNativeSources:true,pluginPath:fileURLToPath(new URL('../openclaw/plugin',import.meta.url)),onDiagnostic:line=>diagnostics.push(line),resolveNativeModelRoute:async({ownerKey:key})=>{assert.equal(key,ownerKey);return{config:activeProxy,authorize:async()=>{}};},resolveNativeOwner:async binding=>{
  assert.equal(binding.ownerKey,ownerKey);assert.equal(binding.kind,'subagent');let child=children.get(binding.nativeSessionKey);
  if(!child){const childRoot=path.join(directory,'child-'+createHash('sha256').update(binding.nativeSessionKey).digest('hex'));await engine({op:'init',root:childRoot,registryRoot:childRoot,name:'Mixed route child'});const state=await engine({op:'inspect',root:childRoot,registryRoot:childRoot,learning:false});child={phase,root:childRoot,identity:{agentId:'child-'+children.size,genesisHash:state.genesis.hash}};children.set(binding.nativeSessionKey,child);}
  return{config:activeProxy,context:{...context(binding.input),root:child.root,nativeIdentity:child.identity,autonomousCommit:true},release:async()=>{}};
 }});
 try{
  const base=`http://127.0.0.1:${provider.address().port}`;
  await manager.configureNativeProvider({identity,provider:'fixture-native',configuration:{baseUrl:base+'/native/v1',api:'openai-completions',models:[{id:'paid',name:'Synthetic native profile, no real fees',reasoning:false,input:['text'],contextWindow:131072,maxTokens:4096,cost:{input:1,output:1,cacheRead:0,cacheWrite:0}}]}});
  await manager.nativeAuth({identity,action:'key',provider:'fixture-native',apiKey:'synthetic-native-model-key'});await manager.setNativeModel(identity,'fixture-native/paid');
  assert.equal(calls.length,0,'Onboarding must not silently start native model inference.');
  for(const selected of ['free','byok']){
   phase=selected;activeProxy={provider:'compatible',tier:selected,model:'proxy-fixture',baseUrl:base+'/proxy/v1',apiKey:selected==='free'?'chainchat-free-tier':'synthetic-byok-route-key',contextWindow:131072,maxOutputTokens:4096};
   const input='CT_PARENT_SPAWN: Start the requested native child task, then say you can help with care and honesty.';
   const parent=await manager.generate(activeProxy,{messages:[{role:'user',content:input}],maxTokens:512,nativeControl:{kind:'message',sessionKey:controlSessionKey(identity)}},context(input));
   assert.equal(parent.text,answer);assert.equal(parent.enforcement.reviewed,true);manager.resumeNativeSources();
   const deadline=Date.now()+60000;let accepted=false;
   while(Date.now()<deadline){for(const child of children.values())if(child.phase===selected){const state=await engine({op:'inspect',root:child.root,registryRoot:child.root,learning:false});if(state.verified&&state.head.index>=1)accepted=true;}if(accepted)break;await new Promise(resolve=>setTimeout(resolve,100));}
   assert.equal(accepted,true,'The actual '+selected+' child must finish through the admitted proxy, despite its explicit native paid model override.');
   assert.equal(calls.filter(call=>call.native).length,0,'No native paid-profile request is allowed during '+selected+' ownership.');assert.ok(calls.filter(call=>call.phase===selected).length>=3);
   assert.ok(calls.filter(call=>call.phase===selected).every(call=>call.model==='proxy-fixture'&&call.auth==='Bearer '+activeProxy.apiKey&&call.canonical&&!call.privateMarker));
  }
  phase='native-final';const native={provider:'native',tier:'native',model:'fixture-native/paid',contextWindow:131072,maxOutputTokens:4096,reasoningCapable:false},input='Please introduce yourself with care and honesty.';
  const result=await manager.generateNative(native,{messages:[{role:'user',content:input}],maxTokens:512},context(input));assert.equal(result.text,answer);assert.equal(result.enforcement.reviewed,true);
  assert.ok(calls.some(call=>call.native&&call.phase==='native-final'&&call.model==='paid'&&call.auth==='Bearer synthetic-native-model-key'));
  assert.ok(calls.every(call=>call.canonical&&!call.privateMarker));assert.deepEqual((await engine({op:'inspect',root,registryRoot:root,learning:false})).head,initial.head);
  assert.ok(registrations.every(row=>!row.expected||!row.observed||row.expected===row.observed||row.sourceProof?.kind==='source-turn'&&row.sourceProof.inputId===row.expected),'Unrelated native turns must never consume a foreground request claim.');
  t.diagnostic(JSON.stringify({proxyPhasePaidCounter:{free:calls.filter(row=>row.phase==='free'&&row.native).length,byok:calls.filter(row=>row.phase==='byok'&&row.native).length},nativePositive:calls.some(row=>row.native&&row.phase==='native-final')}));
 }catch(error){t.diagnostic(JSON.stringify({phase,code:error.code||'ASSERTION',children:[...children.values()].map(child=>({phase:child.phase})),calls:calls.map(({auth,...safe})=>safe),registrations:registrations.map(({claimId,sessionKey,...safe})=>safe)}));t.diagnostic(diagnostics.join('').slice(-7000));throw error;}
});
