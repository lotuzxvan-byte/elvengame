'use strict';
const IndonesianGarden=WordGarden;
let currentLanguage='id';
const languageSelect=document.createElement('select');
languageSelect.id='language';
for(const [value,label] of [['id','Indonesia'],['en','English']]){const option=document.createElement('option');option.value=value;option.textContent=label;languageSelect.append(option)}
const languageLabel=document.createElement('label');languageLabel.append(document.createTextNode('Bahasa latihan'),languageSelect);document.querySelector('.settings').prepend(languageLabel);
function speechLocale(){return currentLanguage==='en'?'en-US':'id-ID'}
function selectedAudio(){return currentLanguage==='en'?EnglishAudio:WordAudio}
function storageKey(key){return currentLanguage==='en'&&['taman-word-best','taman-letters'].includes(key)?key+'-en':key}
function applyLanguage(value){
 stopWordAudio();currentLanguage=value==='en'?'en':'id';WordGarden=currentLanguage==='en'?EnglishGarden:IndonesianGarden;
 languageSelect.value=currentLanguage;letterIndex=0;best=0;learned.clear();
 try{localStorage.setItem('elven-word-language',currentLanguage);best=Number(localStorage.getItem(storageKey('taman-word-best')))||0;const saved=JSON.parse(localStorage.getItem(storageKey('taman-letters'))||'[]');if(Array.isArray(saved))saved.filter(l=>WordGarden.alphabet.includes(l)).forEach(l=>learned.add(l))}catch{}
 document.querySelector('#word').lang=currentLanguage;document.querySelector('#sentence').lang=currentLanguage;
 const english=currentLanguage==='en';
 document.querySelector('#open-words b').textContent=english?'Mom → Responsibility':'Ibu → Perpustakaan';
 const labels=english?['Mudah · mom, book','Sedang · family, teacher','Menantang · responsibility']:['Mudah · ibu, buku','Sedang · keluarga, sekolah','Menantang · perpustakaan'];[...document.querySelector('#level').options].forEach((o,i)=>o.textContent=labels[i]);
 document.querySelector('.audio-note p:last-child').textContent=english?'Contoh ucapan bahasa Inggris (Amerika) memakai file audio. Arti kata ditampilkan dalam bahasa Indonesia. Potongan kata membantu membaca, bukan panduan fonetik; dengarkan audio untuk pelafalan.':'Contoh ucapan memakai file audio bahasa Indonesia. Tekan Dengar untuk memutar, dan pastikan volume media perangkat aktif. Suara bawaan perangkat hanya dipakai sebagai cadangan.';
 updateRecord();detectVoice();
}
languageSelect.onchange=()=>applyLanguage(languageSelect.value);
const originalRenderWord=renderWord;
renderWord=function(){originalRenderWord();const w=list[index];const english=currentLanguage==='en';const note=document.createElement('span');note.textContent=english?'Arti: '+w.translation:'';note.className='translation';document.querySelector('#word').after(note);document.querySelectorAll('.translation').forEach((n,i)=>{if(i) n.remove()});const first=document.querySelector('.translation');first.textContent=note.textContent;document.querySelector('#syllables').setAttribute('aria-label',(english?'Potongan kata untuk membaca: ':'Panduan suku kata: ')+w.syllables.join(', '));document.querySelector('#category-label').textContent=w.category.toUpperCase()+' · '+(english?'EN':'ID')};
let savedLanguage='id';try{savedLanguage=localStorage.getItem('elven-word-language')||'id'}catch{}
applyLanguage(savedLanguage);
