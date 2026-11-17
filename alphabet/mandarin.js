'use strict';
const MandarinGarden=(()=>{
 const rows=[
 ['keluarga',1,'妈妈','mā ma','ibu','👩','妈妈爱我。','Ibu menyayangiku.'],
 ['keluarga',1,'爸爸','bà ba','ayah','👨','爸爸回家了。','Ayah sudah pulang.'],
 ['keluarga',1,'哥哥','gē ge','kakak laki-laki','👦','哥哥看书。','Kakak laki-laki membaca buku.'],
 ['keluarga',1,'姐姐','jiě jie','kakak perempuan','👧','姐姐画画。','Kakak perempuan menggambar.'],
 ['keluarga',1,'弟弟','dì di','adik laki-laki','🧒','弟弟玩球。','Adik laki-laki bermain bola.'],
 ['keluarga',1,'妹妹','mèi mei','adik perempuan','👧','妹妹笑了。','Adik perempuan tersenyum.'],
 ['keluarga',1,'家','jiā','rumah; keluarga','🏡','我爱我的家。','Aku menyayangi keluargaku.'],
 ['keluarga',1,'爱','ài','sayang; cinta','💛','我爱妈妈。','Aku menyayangi ibu.'],
 ['sekolah',1,'书','shū','buku','📚','这是我的书。','Ini bukuku.'],
 ['sekolah',1,'笔','bǐ','alat tulis; pena','🖊️','这是我的笔。','Ini alat tulisku.'],
 ['sekolah',1,'纸','zhǐ','kertas','📄','纸是白色的。','Kertas berwarna putih.'],
 ['sekolah',1,'门','mén','pintu','🚪','请开门。','Tolong buka pintu.'],
 ['sekolah',1,'水','shuǐ','air','💧','我喝水。','Aku minum air.'],
 ['sekolah',1,'球','qiú','bola','⚽','我们玩球。','Kami bermain bola.'],
 ['sekolah',1,'桌子','zhuō zi','meja','🪑','书在桌子上。','Buku ada di atas meja.'],
 ['sekolah',1,'椅子','yǐ zi','kursi','🪑','这是小椅子。','Ini kursi kecil.'],
 ['keluarga',2,'爷爷','yé ye','kakek dari pihak ayah','👴','爷爷讲故事。','Kakek dari pihak ayah bercerita.'],
 ['keluarga',2,'奶奶','nǎi nai','nenek dari pihak ayah','👵','奶奶做饭。','Nenek dari pihak ayah memasak.'],
 ['keluarga',2,'外公','wài gōng','kakek dari pihak ibu','👴','外公来看我。','Kakek dari pihak ibu datang menemuiku.'],
 ['keluarga',2,'外婆','wài pó','nenek dari pihak ibu','👵','外婆给我苹果。','Nenek dari pihak ibu memberiku apel.'],
 ['keluarga',2,'家人','jiā rén','anggota keluarga','👨‍👩‍👧','我和家人在一起。','Aku bersama keluargaku.'],
 ['keluarga',2,'生日','shēng rì','ulang tahun','🎂','今天是我的生日。','Hari ini ulang tahunku.'],
 ['keluarga',2,'早餐','zǎo cān','sarapan','🍞','我们一起吃早餐。','Kami sarapan bersama.'],
 ['keluarga',2,'快乐','kuài lè','gembira','😊','我很快乐。','Aku sangat gembira.'],
 ['sekolah',2,'老师','lǎo shī','guru','🧑‍🏫','老师教我们读书。','Guru mengajari kami membaca.'],
 ['sekolah',2,'学校','xué xiào','sekolah','🏫','我喜欢学校。','Aku menyukai sekolah.'],
 ['sekolah',2,'学生','xué sheng','murid','🧒','我是一名学生。','Aku seorang murid.'],
 ['sekolah',2,'同学','tóng xué','teman sekolah','🤝','同学和我一起玩。','Teman sekolah bermain bersamaku.'],
 ['sekolah',2,'书包','shū bāo','tas sekolah','🎒','书在书包里。','Buku ada di dalam tas sekolah.'],
 ['sekolah',2,'铅笔','qiān bǐ','pensil','✏️','我用铅笔写字。','Aku menulis dengan pensil.'],
 ['sekolah',2,'教室','jiào shì','ruang kelas','🏫','教室很干净。','Ruang kelas sangat bersih.'],
 ['sekolah',2,'学习','xué xí','belajar','📖','我们一起学习。','Kami belajar bersama.'],
 ['keluarga',3,'照顾','zhào gù','merawat','🤲','我照顾妹妹。','Aku merawat adik perempuan.'],
 ['keluarga',3,'帮助','bāng zhù','membantu','🤝','我帮助爸爸。','Aku membantu ayah.'],
 ['keluarga',3,'分享','fēn xiǎng','berbagi','💛','我和姐姐分享玩具。','Aku berbagi mainan dengan kakak perempuan.'],
 ['keluarga',3,'尊重','zūn zhòng','menghormati','🙏','我们尊重家人。','Kami menghormati anggota keluarga.'],
 ['keluarga',3,'团圆','tuán yuán','berkumpul kembali sebagai keluarga','👨‍👩‍👧','我们回家团圆。','Kami pulang untuk berkumpul kembali dengan keluarga.'],
 ['keluarga',3,'幸福','xìng fú','bahagia; kebahagiaan','😊','我们一家很幸福。','Keluarga kami sangat bahagia.'],
 ['keluarga',3,'亲戚','qīn qi','kerabat','🏡','亲戚来我们家。','Kerabat datang ke rumah kami.'],
 ['keluarga',3,'庆祝','qìng zhù','merayakan','🎉','我们庆祝奶奶的生日。','Kami merayakan ulang tahun nenek dari pihak ayah.'],
 ['sekolah',3,'图书馆','tú shū guǎn','perpustakaan','📚','我在图书馆看书。','Aku membaca di perpustakaan.'],
 ['sekolah',3,'数学','shù xué','matematika','🔢','我喜欢数学。','Aku menyukai matematika.'],
 ['sekolah',3,'科学','kē xué','sains','🔬','科学很有趣。','Sains sangat menarik.'],
 ['sekolah',3,'运动场','yùn dòng chǎng','lapangan olahraga','⚽','我们在运动场跑步。','Kami berlari di lapangan olahraga.'],
 ['sekolah',3,'橡皮擦','xiàng pí cā','penghapus','🧽','我用橡皮擦。','Aku memakai penghapus.'],
 ['sekolah',3,'课程表','kè chéng biǎo','jadwal pelajaran','🗓️','我看看课程表。','Aku melihat jadwal pelajaran.'],
 ['sekolah',3,'普通话','pǔ tōng huà','bahasa Mandarin standar','🗣️','我们学习普通话。','Kami belajar bahasa Mandarin standar.'],
 ['sekolah',3,'好朋友','hǎo péng you','sahabat','🤗','你是我的好朋友。','Kamu sahabatku.']
 ];
 const words=Object.freeze(rows.map(([category,level,word,pinyin,translation,emoji,sentence,sentenceTranslation],i)=>Object.freeze({id:String(i+1).padStart(2,'0'),category,level,word,pinyin,syllables:pinyin.split(' '),translation,emoji,sentence,sentenceTranslation})));
 const alphabet=Object.freeze([...new Set(words.map(w=>w.word[0]))]);
 function shuffle(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
 function session(category,level){const pool=words.filter(w=>(category==='all'||w.category===category)&&w.level===Number(level));return category==='all'?shuffle([...shuffle(pool.filter(w=>w.category==='keluarga')).slice(0,4),...shuffle(pool.filter(w=>w.category==='sekolah')).slice(0,4)]):shuffle(pool).slice(0,8)}
 function choices(word){return shuffle([word[0],...shuffle(alphabet.filter(c=>c!==word[0])).slice(0,3)])}
 function normalize(text){return text.normalize('NFKC').replace(/[^\u3400-\u9fff]/g,'')}
 return Object.freeze({language:'zh',alphabet,letterNames:[],words,session,choices,normalize});
})();
if(typeof module!=='undefined')module.exports=MandarinGarden;
