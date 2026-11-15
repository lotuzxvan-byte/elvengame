import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
test('authentication, private results, score lifecycle and privacy',async()=>{
 const server=createApp({dbPath:':memory:',setupToken:'unit-test-setup-token'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 async function call(route,method='GET',body,cookie='',origin=base){const response=await fetch(base+route,{method,headers:{Origin:origin,...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});const contentType=response.headers.get('content-type');return {status:response.status,body:contentType?.includes('json')?await response.json():await response.text(),cookie:response.headers.get('set-cookie')?.split(';')[0],headers:response.headers}}
 try{
  assert.equal((await call('/api/admin/results')).status,401);
  assert.equal((await call('/api/admin/export')).status,401);
  assert.equal((await call('/server.mjs')).status,404);
  assert.equal((await call('/data/elven.sqlite')).status,404);
  assert.equal((await call('/api/player','POST',{nickname:'Elven'},'','https://malicious.invalid')).status,403);
  assert.equal((await call('/api/admin/setup','POST',{token:'wrong',password:'a-valid-test-password'})).status,403);
  assert.equal((await call('/api/admin/setup','POST',{token:'unit-test-setup-token',password:'short'})).status,400);
  assert.equal((await call('/api/admin/setup','POST',{token:'unit-test-setup-token',password:'a-valid-test-password'})).status,201);
  assert.equal((await call('/api/admin/setup','POST',{token:'unit-test-setup-token',password:'other-password'})).status,409);
  assert.equal((await call('/api/admin/login','POST',{password:'wrong-password'})).status,401);
  let login=await call('/api/admin/login','POST',{password:'a-valid-test-password'}),adminCookie=login.cookie;assert.equal(login.status,200);assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
  const p1=await call('/api/player','POST',{nickname:'Pemain Test'}),p2=await call('/api/player','POST',{nickname:'Pemain Test'});assert.equal(p1.status,201);assert.notEqual(p1.body.player.id,p2.body.player.id);
  assert.equal((await call('/api/player','POST',{nickname:'<script>alert(1)</script>'})).status,400);
  const update=await call('/api/player','POST',{nickname:'Panggilan Baru'},p1.cookie);assert.equal(update.body.player.id,p1.body.player.id);
  assert.equal((await call('/api/runs','POST',{game:'math',difficulty:'easy:mix'})).status,401);
  assert.equal((await call('/api/runs','POST',{game:'math',difficulty:'bad'},p1.cookie)).status,400);
  const run=await call('/api/runs','POST',{game:'math',difficulty:'easy:mix'},p1.cookie);assert.equal(run.status,201);const endpoint='/api/runs/'+run.body.id+'/finish';
  assert.equal((await call(endpoint,'POST',{score:1200,firstTry:12,status:'completed'},p2.cookie)).status,404);
  assert.equal((await call(endpoint,'POST',{score:1201,firstTry:12,status:'completed'},p1.cookie)).status,400);
  assert.equal((await call(endpoint,'POST',{score:1200,firstTry:13,status:'completed'},p1.cookie)).status,400);
  assert.equal((await call(endpoint,'POST',{score:1160,firstTry:11,status:'completed'},p1.cookie)).status,200);
  assert.equal((await call(endpoint,'POST',{score:1200,firstTry:12,status:'completed'},p1.cookie)).body.duplicate,true);
  const results=await call('/api/admin/results?game=math','GET',null,adminCookie);assert.equal(results.body.summary.sessions,1);assert.equal(results.body.rows[0].score,1160);assert.equal(results.body.clientReported,true);assert.equal(results.body.rows[0].nickname,'Panggilan Baru');assert.equal((await call('/api/admin/results?game=alphabet','GET',null,adminCookie)).body.summary.sessions,0);
  const csv=await call('/api/admin/export','GET',null,adminCookie);assert.equal(csv.status,200);assert.match(csv.body,/Panggilan Baru/);assert.equal((await call('/api/admin/results?from=bad','GET',null,adminCookie)).status,400);
  assert.equal((await call('/api/admin/password','POST',{oldPassword:'a-valid-test-password',password:'new-valid-test-password'},adminCookie)).status,200);
  assert.equal((await call('/api/admin/results','GET',null,adminCookie)).status,401);
  login=await call('/api/admin/login','POST',{password:'new-valid-test-password'});adminCookie=login.cookie;
  assert.equal((await call('/api/admin/results/'+run.body.id,'DELETE',null,adminCookie)).status,200);assert.equal((await call('/api/admin/results','GET',null,adminCookie)).body.summary.sessions,0);
  const r2=await call('/api/runs','POST',{game:'alphabet',difficulty:'3:sekolah'},p1.cookie);await call('/api/runs/'+r2.body.id+'/finish','POST',{score:800,firstTry:8,status:'completed'},p1.cookie);
  assert.equal((await call('/api/player','DELETE',null,p1.cookie)).status,200);assert.equal((await call('/api/admin/results','GET',null,adminCookie)).body.summary.sessions,0);assert.equal((await call('/api/player','GET',null,p1.cookie)).body.player,null);
  assert.equal((await call('/api/admin/logout','POST',{},adminCookie)).status,200);assert.equal((await call('/api/admin/results','GET',null,adminCookie)).status,401);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
test('login rate limiting',async()=>{const server=createApp({dbPath:':memory:',setupToken:'test'});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;try{for(let n=0;n<16;n++){const response=await fetch(base+'/api/admin/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password:'bad'})});assert.equal(response.status,n<15?401:429)}}finally{await new Promise(r=>server.close(r))}});
test('SQLite persists across restart without leaking data files',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'elven-persist-'));const dbPath=path.join(dir,'scores.sqlite');let server;
 async function boot(){server=createApp({dbPath,setupToken:'test-persist-token'});await new Promise(r=>server.listen(0,'127.0.0.1',r));return 'http://127.0.0.1:'+server.address().port}
 try{let base=await boot();const response=await fetch(base+'/api/player',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({nickname:'Persistensi'})});const p=await response.json();const cookie=response.headers.get('set-cookie').split(';')[0];await new Promise(r=>server.close(r));base=await boot();const res=await fetch(base+'/api/player',{headers:{Cookie:cookie}});assert.equal((await res.json()).player.id,p.player.id);assert.equal((await fetch(base+'/scores.sqlite')).status,404);await new Promise(r=>server.close(r));server=null}finally{if(server?.listening)await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true})}
});
