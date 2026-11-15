const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {books,groups}=require('../bible/episodes.js');
const {scene}=require('../bible/cartoon.js');
test('18 chronological learning episodes cover birth through resurrection',()=>{
 assert.equal(books.length,18);assert.equal(new Set(books.map(b=>b.id)).size,18);
 assert.equal(books[0].id,'jesus-birth');assert.equal(books.at(-1).id,'jesus-risen');
 assert.deepEqual(groups.map(g=>books.filter(b=>b.group===g.id).length),[4,8,6]);
 for(const [i,book] of books.entries()){
  assert.equal(book.number,i+1);assert.ok(book.ref&&book.lesson);assert.equal(book.scenes.length,3);assert.equal(book.quiz.length,2);
  for(const [step,[title,narration,dialogue]] of book.scenes.entries()){
   assert.ok(title&&narration.length>50);assert.equal(dialogue.length,2);
   const svg=scene(book.theme,step);assert.match(svg,/^<svg/);assert.ok(svg.includes('toon-actor'));assert.ok(!svg.includes('undefined'));
   assert.ok(fs.statSync(path.join(__dirname,'../bible/audio',book.id+'-'+(step+1)+'.mp3')).size>1000);
   for(const [line,[speaker,text]] of dialogue.entries()){
    assert.ok(speaker&&text&&text.length<150);
    assert.ok(fs.statSync(path.join(__dirname,'../bible/audio',book.id+'-'+(step+1)+'-d'+(line+1)+'.mp3')).size>1000);
   }
  }
  for(const q of book.quiz){assert.equal(q.length,4);assert.equal(new Set(q.slice(1)).size,3)}
 }
});
