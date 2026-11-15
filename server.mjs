import http from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const bibleBooks=[...require('./bible/books.js').books,...require('./bible/episodes.js').books];
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,createHash,scrypt,timingSafeEqual,randomUUID} from 'node:crypto';
import {promisify} from 'node:util';
import {mkdirSync,readFileSync,existsSync,statSync,chmodSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const derive=promisify(scrypt);
const digest=value=>createHash('sha256').update(value).digest('hex');
const token=()=>randomBytes(32).toString('base64url');
const gameNames={adventure:'Berburu Bintang',math:'Taman Angka',alphabet:'Taman Kata',bible:'Jejak Kasih'};
export function createApp(options={}){
 const dbPath=options.dbPath||process.env.DB_PATH||path.join(root,'data','elven.sqlite');
 if(dbPath!==':memory:')mkdirSync(path.dirname(dbPath),{recursive:true,mode:0o700});
 const db=new DatabaseSync(dbPath);
 if(dbPath!==':memory:')chmodSync(dbPath,0o600);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,nickname TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,game TEXT NOT NULL,difficulty TEXT NOT NULL,total INTEGER NOT NULL,started_at TEXT NOT NULL,completed_at TEXT,score INTEGER,first_try INTEGER,status TEXT);
 CREATE TABLE IF NOT EXISTS admin(id INTEGER PRIMARY KEY CHECK(id=1),password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS run_completed ON runs(completed_at);
 CREATE INDEX IF NOT EXISTS run_player ON runs(player_id);`);
 const setupToken=options.setupToken??process.env.ADMIN_SETUP_TOKEN;
 const publicOrigin=options.publicOrigin??process.env.PUBLIC_ORIGIN;
 const production=options.production??process.env.NODE_ENV==='production';
 if(production&&!publicOrigin)throw Error('PUBLIC_ORIGIN wajib di produksi');
 const secure=production||publicOrigin?.startsWith('https://');
 const retention=Math.min(365,Math.max(1,Number(options.retentionDays??process.env.RETENTION_DAYS)||90));
 function prune(){const cutoff=new Date(Date.now()-retention*86400000).toISOString();db.prepare('DELETE FROM runs WHERE started_at < ?').run(cutoff);db.prepare('DELETE FROM players WHERE created_at < ? AND NOT EXISTS(SELECT 1 FROM runs WHERE player_id=players.id)').run(cutoff);db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now())}
 prune();const timer=setInterval(prune,3600000);timer.unref();
 const buckets=new Map();
 function rate(req,group,max){const key=group+':'+req.socket.remoteAddress;const now=Date.now();let entry=buckets.get(key);if(!entry||now>entry.until){entry={count:0,until:now+3600000};buckets.set(key,entry)}if(++entry.count>max)throw Object.assign(Error('Terlalu banyak percobaan. Coba lagi nanti.'),{status:429});if(buckets.size>10000)for(const [k,v] of buckets)if(v.until<now)buckets.delete(k)}
 function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')).filter(pair=>pair.length===2))}
 function setCookie(res,name,value,maxAge){res.setHeader('Set-Cookie',`${name}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure?'; Secure':''}`)}
 function player(req){const t=cookies(req).elven_player;if(!t)return null;return db.prepare('SELECT id,nickname,created_at FROM players WHERE token_hash=?').get(digest(t))||null}
 function admin(req){const t=cookies(req).elven_admin;return t&&!!db.prepare('SELECT 1 FROM sessions WHERE token_hash=? AND expires>?').get(digest(t),Date.now())}
 function auth(req){if(!admin(req))throw Object.assign(Error('Silakan login admin.'),{status:401})}
 async function body(req){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)throw Object.assign(Error('Permintaan terlalu besar.'),{status:413})}try{const b=JSON.parse(text||'{}');if(!b||typeof b!=='object'||Array.isArray(b))throw Error();return b}catch{throw Object.assign(Error('JSON tidak valid.'),{status:400})}}
 function fail(message,status=400){throw Object.assign(Error(message),{status})}
 function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))}
 async function hashPassword(password){const salt=token();return salt+':'+(await derive(password,salt,64)).toString('hex')}
 async function verifyPassword(password,stored){const [salt,hash]=stored.split(':');const derived=await derive(password,salt,64);return timingSafeEqual(derived,Buffer.from(hash,'hex'))}
 function filter(url){const values=[];const clauses=['r.completed_at IS NOT NULL'];const game=url.searchParams.get('game');if(game){if(!gameNames[game])fail('Game tidak valid.');clauses.push('r.game=?');values.push(game)}const search=(url.searchParams.get('search')||'').slice(0,80);if(search){clauses.push('(p.nickname LIKE ? OR p.id LIKE ?)');values.push('%'+search+'%','%'+search+'%')}for(const [name,op] of [['from','>='],['to','<=']]){const date=url.searchParams.get(name);if(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date)))fail('Tanggal tidak valid.');clauses.push(`substr(r.completed_at,1,10) ${op} ?`);values.push(date)}}return {where:clauses.join(' AND '),values}}
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');res.setHeader('Cache-Control','no-store');
  try{
   const url=new URL(req.url,'http://localhost');const route=url.pathname;
   if(route.startsWith('/api/')){
    if(!['GET','POST','DELETE'].includes(req.method))fail('Metode tidak didukung.',405);
    if(req.method!=='GET'){
     const origin=req.headers.origin;
     const same=publicOrigin?origin===publicOrigin:origin===`http://${req.headers.host}`||origin===`https://${req.headers.host}`||req.headers['sec-fetch-site']==='same-origin';
     if(!same)fail('Origin tidak diizinkan.',403);
     if(req.method==='POST'&&!req.headers['content-type']?.startsWith('application/json'))fail('Gunakan JSON.',415);
    }
    if(route==='/api/health'&&req.method==='GET')return json(res,200,{ok:true,retentionDays:retention});
    if(route==='/api/player'&&req.method==='GET')return json(res,200,{player:player(req)});
    if(route==='/api/player'&&req.method==='POST'){
     rate(req,'register',30);const b=await body(req);const nickname=typeof b.nickname==='string'?b.nickname.normalize('NFKC').trim():'';
     if(!/^[\p{L}\p{N} _.-]{2,24}$/u.test(nickname))fail('Nama panggilan 2–24 huruf/angka, bukan nama lengkap.');
     const existing=player(req);if(existing){db.prepare('UPDATE players SET nickname=? WHERE id=?').run(nickname,existing.id);return json(res,200,{player:{...existing,nickname}})}
     const t=token(),id=randomUUID(),created_at=new Date().toISOString();db.prepare('INSERT INTO players VALUES(?,?,?,?)').run(id,nickname,digest(t),created_at);setCookie(res,'elven_player',t,retention*86400);return json(res,201,{player:{id,nickname,created_at}});
    }
    if(route==='/api/player'&&req.method==='DELETE'){const p=player(req);if(p)db.prepare('DELETE FROM players WHERE id=?').run(p.id);setCookie(res,'elven_player','',0);return json(res,200,{ok:true})}
    if(route==='/api/runs'&&req.method==='POST'){
     rate(req,'runs',300);const p=player(req);if(!p)fail('Profil pemain belum terdaftar.',401);const b=await body(req);
     const difficulties={adventure:['santai','waktu'],math:['easy:add','easy:subtract','easy:multiply','easy:divide','easy:mix','normal:add','normal:subtract','normal:multiply','normal:divide','normal:mix'],alphabet:['1:all','1:keluarga','1:sekolah','2:all','2:keluarga','2:sekolah','3:all','3:keluarga','3:sekolah'],bible:bibleBooks.map(book=>book.id)};
     const checkedDifficulty=b.game==='alphabet'&&typeof b.difficulty==='string'&&b.difficulty.endsWith(':en')?b.difficulty.slice(0,-3):b.difficulty;
     if(!difficulties[b.game]?.includes(checkedDifficulty))fail('Game atau tingkat tidak valid.');const id=randomUUID(),started_at=new Date().toISOString();db.prepare('INSERT INTO runs(id,player_id,game,difficulty,total,started_at) VALUES(?,?,?,?,?,?)').run(id,p.id,b.game,b.difficulty,b.game==='math'?12:b.game==='alphabet'?8:b.game==='bible'?2:20,started_at);return json(res,201,{id,started_at});
    }
    if(/^\/api\/runs\/[a-f0-9-]{36}\/finish$/.test(route)&&req.method==='POST'){
     rate(req,'finish',300);const p=player(req);if(!p)fail('Profil tidak tersedia.',401);const id=route.split('/')[3];const run=db.prepare('SELECT * FROM runs WHERE id=? AND player_id=?').get(id,p.id);if(!run)fail('Sesi tidak ditemukan.',404);if(run.completed_at)return json(res,200,{saved:true,id,duplicate:true});
     const b=await body(req),max=run.game==='math'?1200:run.game==='alphabet'?800:run.game==='bible'?200:30000;
     if(!Number.isInteger(b.score)||b.score<0||b.score>max)fail('Skor di luar batas.');if(run.game!=='adventure'&&(!Number.isInteger(b.firstTry)||b.firstTry<0||b.firstTry>run.total))fail('Jumlah jawaban tidak valid.');
     if(run.game==='adventure'?!['won','lost'].includes(b.status):b.status!=='completed')fail('Status sesi tidak valid.');
     const completed=new Date().toISOString();db.prepare('UPDATE runs SET completed_at=?,score=?,first_try=?,status=? WHERE id=?').run(completed,b.score,run.game==='adventure'?null:b.firstTry,b.status,id);return json(res,200,{saved:true,id,completed_at:completed});
    }
    if(route==='/api/admin/status'&&req.method==='GET')return json(res,200,{configured:!!db.prepare('SELECT 1 FROM admin').get(),authenticated:!!admin(req)});
    if(route==='/api/admin/setup'&&req.method==='POST'){
     rate(req,'setup',10);const b=await body(req);if(db.prepare('SELECT 1 FROM admin').get())fail('Admin sudah dibuat.',409);if(!setupToken||typeof b.token!=='string'||digest(b.token)!==digest(setupToken))fail('Kode aktivasi salah.',403);
     if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)fail('Password harus 12–128 karakter.');const hash=await hashPassword(b.password);if(db.prepare('SELECT 1 FROM admin').get())fail('Admin sudah dibuat.',409);db.prepare('INSERT INTO admin VALUES(1,?)').run(hash);return json(res,201,{ok:true});
    }
    if(route==='/api/admin/login'&&req.method==='POST'){
     rate(req,'login',15);const b=await body(req);const a=db.prepare('SELECT password FROM admin').get();const pass=typeof b.password==='string'&&b.password.length<=128?b.password:'';
     const dummy='elven-dummy:'+('00'.repeat(64));if(!(await verifyPassword(pass,a?.password||dummy))||!a)fail('Password salah.',401);const t=token();db.prepare('INSERT INTO sessions VALUES(?,?)').run(digest(t),Date.now()+28800000);setCookie(res,'elven_admin',t,28800);return json(res,200,{ok:true});
    }
    if(route==='/api/admin/logout'&&req.method==='POST'){const t=cookies(req).elven_admin;if(t)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(t));setCookie(res,'elven_admin','',0);return json(res,200,{ok:true})}
    if(route==='/api/admin/password'&&req.method==='POST'){auth(req);rate(req,'password',10);const b=await body(req),a=db.prepare('SELECT password FROM admin').get();if(typeof b.oldPassword!=='string'||b.oldPassword.length>128||!(await verifyPassword(b.oldPassword,a.password)))fail('Password lama salah.',401);if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)fail('Password baru minimal 12 karakter.');db.prepare('UPDATE admin SET password=? WHERE id=1').run(await hashPassword(b.password));db.prepare('DELETE FROM sessions').run();setCookie(res,'elven_admin','',0);return json(res,200,{ok:true})}
    if(route.startsWith('/api/admin/'))auth(req);
    if(route==='/api/admin/results'&&req.method==='GET'){
     const {where,values}=filter(url);const page=Math.max(1,Math.min(10000,Number(url.searchParams.get('page'))||1));const base=`FROM runs r JOIN players p ON p.id=r.player_id WHERE ${where}`;
     const rows=db.prepare(`SELECT r.id,r.game,r.difficulty,r.total,r.score,r.first_try,r.status,r.started_at,r.completed_at,p.nickname,p.id player_id ${base} ORDER BY r.completed_at DESC LIMIT 25 OFFSET ?`).all(...values,(page-1)*25);
     const summary=db.prepare(`SELECT count(*) sessions,count(DISTINCT p.id) players,coalesce(max(r.score),0) best ${base}`).get(...values);
     const games=db.prepare(`SELECT r.game,count(*) sessions,count(DISTINCT p.id) players,round(avg(r.score),1) average,max(r.score) best ${base} GROUP BY r.game`).all(...values);
     const days=db.prepare(`SELECT substr(r.completed_at,1,10) day,count(*) sessions ${base} GROUP BY day ORDER BY day DESC LIMIT 14`).all(...values).reverse();return json(res,200,{rows,summary,games,days,page,pages:Math.ceil(summary.sessions/25),retentionDays:retention,clientReported:true});
    }
    if(route==='/api/admin/export'&&req.method==='GET'){
     const {where,values}=filter(url);const rows=db.prepare(`SELECT p.nickname,p.id player_id,r.game,r.difficulty,r.score,r.first_try,r.status,r.completed_at FROM runs r JOIN players p ON p.id=r.player_id WHERE ${where} ORDER BY r.completed_at DESC LIMIT 10000`).all(...values);
     const escape=value=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};const keys=['nickname','player_id','game','difficulty','score','first_try','status','completed_at'];res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="Game-Elven-Hasil.csv"'});return res.end('\uFEFF'+[keys.join(','),...rows.map(r=>keys.map(k=>escape(r[k])).join(','))].join('\r\n'));
    }
    if(/^\/api\/admin\/results\/[a-f0-9-]{36}$/.test(route)&&req.method==='DELETE'){db.prepare('DELETE FROM runs WHERE id=?').run(route.split('/')[4]);return json(res,200,{ok:true})}
    if(/^\/api\/admin\/players\/[a-f0-9-]{36}$/.test(route)&&req.method==='DELETE'){db.prepare('DELETE FROM players WHERE id=?').run(route.split('/')[4]);return json(res,200,{ok:true})}
    fail('Endpoint tidak ditemukan.',404);
   }
   if(!['GET','HEAD'].includes(req.method))fail('Metode tidak didukung.',405);
   if(route==='/favicon.ico'){res.writeHead(204);return res.end()}
   if(/^\/(adventure|math|alphabet|bible)\/(index\.html)?$/.test(route)&&req.headers['sec-fetch-dest']==='document'){res.writeHead(302,{Location:'/'});return res.end()}
   const routePath=route==='/'?'index.html':route==='/admin'||route==='/admin/'?'admin/index.html':decodeURIComponent(route).replace(/^\//,'');
   const allowed=routePath==='index.html'||['menu.js','menu.css','scores.js','scores.css','score-bridge.js'].includes(routePath)||/^(admin|assets|adventure|math|alphabet|bible)\/[a-zA-Z0-9_.-]+\.(html|css|js|png|jpg)$/.test(routePath)||/^(alphabet|bible)\/audio\/[a-zA-Z0-9-]+\.mp3$/.test(routePath);
   if(!allowed)fail('File tidak ditemukan.',404);const file=path.join(root,routePath);if(!existsSync(file)||!statSync(file).isFile())fail('File tidak ditemukan.',404);
   const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.mp3':'audio/mpeg'};
   if(route.startsWith('/admin'))res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:readFileSync(file));
  }catch(error){json(res,error.status||500,{error:error.status?error.message:'Server belum dapat memproses permintaan.'})}
 });
 server.on('close',()=>{clearInterval(timer);db.close()});return server;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(!process.env.ADMIN_SETUP_TOKEN)throw Error('Atur ADMIN_SETUP_TOKEN rahasia sebelum memulai server.');
 const server=createApp();server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Game Elven server ready'));
}
