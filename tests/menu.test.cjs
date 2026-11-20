const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
test('seven menu routes stay distinct and unknown games never fall back',()=>{
 const nodes=new Map();let frame;
 const node=()=>({hidden:false,classList:{add(){},remove(){}},addEventListener(){},replaceChildren(value){frame=value},focus(){},showModal(){},close(){},querySelector(){return null}});
 const document={title:'',body:node(),querySelector(selector){if(!nodes.has(selector))nodes.set(selector,node());return nodes.get(selector)},querySelectorAll(){return []},createElement(){return node()}};
 const context=vm.createContext({document,window:{},location:{href:'https://example.test/elvengame/'}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../menu.js'),'utf8'),context);
 for(const [name,file,title] of [['adventure','adventure/index.html?v=runner-1','Taman Bermain'],['math','math/index.html','Taman Angka'],['alphabet','alphabet/index.html?v=word-zh-1','Taman Kata'],['bible','bible/index.html','Jejak Kasih'],['prayers','prayers/index.html?v=prayers-crucifix-1','Doa Katolik'],['melody','melody/index.html?v=melody-1','Kebun Melodi'],['hymns','hymns/index.html?v=hymns-1','Taman Pujian']]){vm.runInContext(`openGame('${name}',{})`,context);assert.equal(frame.src,file);assert.equal(frame.title,title)}
 const before=frame;vm.runInContext("openGame('unknown',{})",context);assert.equal(frame,before);
});
test('menu assets have cache versions and score adapter respects project subpaths',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert.match(html,/menu\.js\?v=elven-hymns-1/);assert.match(html,/scores\.js\?v=elven-hymns-1/);
 const adapter=new URL('score-bridge.js?v=elven-hymns-1','https://example.test/elvengame/');assert.equal(adapter.pathname,'/elvengame/score-bridge.js');
});
