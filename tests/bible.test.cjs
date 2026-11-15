const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {books,groups,shuffle}=require("../bible/books.js");
test("all 27 New Testament books have scenes, references and valid quizzes",()=>{
 assert.equal(books.length,27);assert.equal(new Set(books.map(b=>b.id)).size,27);
 assert.equal(books[0].name,"Matius");assert.equal(books[26].name,"Wahyu");
 assert.deepEqual(groups.map(g=>books.filter(b=>b.group===g.id).length),[4,1,21,1]);
 const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(__dirname,"../bible/scenes.js"),"utf8"),context);
 for(const [index,book] of books.entries()){
  assert.equal(book.number,index+1);assert.ok(book.ref&&book.lesson&&book.title);
  assert.equal(book.scenes.length,3);assert.equal(book.quiz.length,2);
  for(const [step,scene] of book.scenes.entries()){
   assert.equal(scene.length,2);assert.ok(scene[1].length>70);
   assert.match(vm.runInContext(`BibleScenes.scene("${book.theme}",${step})`,context),/^<svg/);
   const audio=path.join(__dirname,"../bible/audio",book.id+"-"+(step+1)+".mp3");assert.ok(fs.statSync(audio).size>1000,audio);
  }
  for(const question of book.quiz){assert.equal(question.length,4);assert.equal(new Set(question.slice(1)).size,3);assert.ok(question.every(v=>typeof v==="string"&&v.length));}
 }
});
test("shuffling leaves original choices unchanged",()=>{
 const choices=["a","b","c"];assert.deepEqual([...shuffle(choices)].sort(),choices);assert.deepEqual(choices,["a","b","c"]);
});
