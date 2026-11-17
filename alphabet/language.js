'use strict';
const IndonesianGarden=WordGarden;
let currentLanguage='id';
const languageSelect=document.createElement('select');
languageSelect.id='language';
for(const [value,label] of [['id','Indonesia'],['en','English'],['zh','Mandarin · 中文']]){const option=document.createElement('option');option.value=value;option.textContent=label;languageSelect.append(option)}
const languageLabel=document.createElement('label');languageLabel.append(document.createTextNode('Bahasa latihan'),languageSelect);document.querySelector('.settings').prepend(languageLabel);
function speechLocale(){return {id:'id-ID',en:'en-US',zh:'zh-CN'}[currentLanguage]}
function selectedAudio(){return currentLanguage==='zh'?MandarinAudio:currentLanguage==='en'?EnglishAudio:WordAudio}
function storageKey(key){return currentLanguage!=='id'&&['taman-word-best','taman-letters'].includes(key)?key+'-'+currentLanguage:key}
function applyLanguage(value){
 stopWordAudio();currentLanguage=['en','zh'].includes(value)?value:'id';WordGarden=currentLanguage==='zh'?MandarinGarden:currentLanguage==='en'?EnglishGarden:IndonesianGarden;
 languageSelect.value=currentLanguage;letterIndex=0;best=0;learned.clear();
 try{localStorage.setItem('elven-word-language',currentLanguage);best=Number(localStorage.getItem(storageKey('taman-word-best')))||0;const saved=JSON.parse(localStorage.getItem(storageKey('taman-letters'))||'[]');if(Array.isArray(saved))saved.filter(l=>WordGarden.alphabet.includes(l)).forEach(l=>learned.add(l))}catch{}
 document.querySelector('#word').lang=speechLocale();document.querySelector('#sentence').lang=speechLocale();document.querySelector('#garden').dataset.language=currentLanguage;
 const english=currentLanguage==='en',mandarin=currentLanguage==='zh';
 document.querySelector('#open-alphabet').hidden=mandarin;
 document.querySelector('#setup .book-icon').textContent=mandarin?'文':'Aa';
 document.querySelector('#setup h2').firstChild.textContent=mandarin?'Kata kecil,':'Huruf kecil,';
 document.querySelector('#open-words b').textContent=mandarin?'妈妈 → 图书馆':english?'Mom → Responsibility':'Ibu → Perpustakaan';
 document.querySelector('#setup>p').textContent=mandarin?'Belajar kata Mandarin dengan hanzi, pinyin, dan arti Indonesia. Dengarkan, lalu tirukan pelan-pelan.':'Kenali alfabet dan belajar mengucapkan kata. Pelan-pelan, satu kata setiap kali.';
 document.querySelector('#word-panel h3').textContent=mandarin?'Karakter hanzi pertama kata ini apa?':'Huruf pertama kata ini apa?';
 const labels=mandarin?['Mudah · 妈妈, 书','Sedang · 家人, 学校','Menantang · 图书馆, 普通话']:english?['Mudah · mom, book','Sedang · family, teacher','Menantang · responsibility']:['Mudah · ibu, buku','Sedang · keluarga, sekolah','Menantang · perpustakaan'];[...document.querySelector('#level').options].forEach((o,i)=>o.textContent=labels[i]);
 document.querySelector('#result .result-stats span').textContent=mandarin?'poin karakter awal':'poin huruf awal';
 document.querySelector('#result>p').textContent=mandarin?'Kamu menyelesaikan latihan karakter awal dan menandai sudah mengucapkan semua kata.':'Kamu menyelesaikan latihan huruf awal dan menandai sudah mengucapkan semua kata.';
 document.querySelector('#result .fineprint').textContent=mandarin?'Poin berasal dari kuis karakter, bukan penilaian suara atau nada Mandarin. Terus berlatih dengan pendamping, ya!':'Poin berasal dari kuis huruf, bukan penilaian suara. Terus berlatih dengan pendamping, ya!';
 document.querySelector('.audio-note p:last-child').textContent=mandarin?'Contoh suara Mandarin standar memakai file audio. Hanzi sederhana dan pinyin bertanda nada membantu membaca. Suku kata tanpa tanda memakai nada netral; perubahan nada saat berbicara dapat terdengar berbeda dari ejaan pinyin. Mikrofon tidak menilai ketepatan nada.':english?'Contoh ucapan bahasa Inggris (Amerika) memakai file audio. Arti kata ditampilkan dalam bahasa Indonesia. Potongan kata membantu membaca, bukan panduan fonetik; dengarkan audio untuk pelafalan.':'Contoh ucapan memakai file audio bahasa Indonesia. Suara perangkat hanya menjadi cadangan untuk kata dan kalimat, bukan contoh huruf Indonesia. Nama dan ucapan huruf mengikuti EYD V.';
 updateRecord();detectVoice();
}
languageSelect.onchange=()=>applyLanguage(languageSelect.value);
const originalRenderWord=renderWord;
renderWord=function(){
 originalRenderWord();const w=list[index],mandarin=currentLanguage==='zh';
 document.querySelectorAll('.translation,.sentence-translation').forEach(n=>n.remove());
 if(currentLanguage!=='id'){const note=document.createElement('span');note.textContent='Arti: '+w.translation;note.className='translation';note.lang='id';document.querySelector('#word').after(note)}
 if(mandarin){const note=document.createElement('p');note.textContent='Arti kalimat: '+w.sentenceTranslation;note.className='sentence-translation';note.lang='id';document.querySelector('#sentence').after(note)}
 document.querySelector('#syllables').lang=mandarin?'zh-Latn':speechLocale();document.querySelector('#syllables').setAttribute('aria-label',(mandarin?'Pinyin: ':currentLanguage==='en'?'Potongan kata untuk membaca: ':'Panduan suku kata: ')+w.syllables.join(', '));
 document.querySelector('#category-label').textContent=w.category.toUpperCase()+' · '+currentLanguage.toUpperCase();
};
let savedLanguage='id';try{savedLanguage=localStorage.getItem('elven-word-language')||'id'}catch{}
applyLanguage(savedLanguage);
