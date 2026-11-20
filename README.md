# Game Elven

Versi ini menambahkan backend pencatatan skor dan dashboard admin. Panduan utama deployment, aktivasi login, privasi, serta keterbatasan ada di **ONLINE-README.md**. Source backend tersedia di repository, tetapi pencatatan online dan login admin baru aktif setelah deployment Node.js dengan database persisten. GitHub Pages hanya menyajikan frontend statis; pada Pages, game tetap dapat dimainkan dengan profil sementara dan peringatan bahwa skor belum tersimpan online.

Game browser berbahasa Indonesia, dioptimalkan untuk HP.

## Pembaruan pelafalan Indonesia

Audio Indonesia pada Jejak Kasih (162 klip) dan Taman Kata (122 klip) dibuat ulang memakai suara neural khusus `id-ID-GadisNeural`, tempo `-8%`, dengan jeda tanda baca. Bentuk seperti `murid-murid-Nya`, `Bapa-Ku`, dan `nama-Mu` dinormalisasi hanya pada teks suara menjadi `murid-muridnya`, `Bapaku`, dan `namamu` agar akhiran tidak dibaca terpisah; tulisan layar dan isi cerita tetap. Nama huruf ber-e taling memakai petunjuk `é` hanya di teks sintesis. Semua 26 audio huruf hanya menyebut nama huruf, misalnya “bé” dan “wé”, tanpa kalimat pengantar “Huruf ini dibaca”. Bunyi target tidak menggunakan ejaan Inggris; tulisan huruf dan kunci jawaban tetap. Audio Taman Kata memakai versi cache `id-letters-4`, termasuk URL iframe game dan skrip menu, agar halaman lama tidak memilih rekaman pengantar yang tersimpan di cache. Audio English tidak diubah. Audio lama katalog kitab merupakan arsip dan tidak ikut alur utama.

Berkas MP3 sudah disertakan sehingga browser tidak perlu menghubungi layanan sintesis saat bermain. Generator opsional memerlukan Python `edge-tts` dan akses internet saat membuat ulang audio. Manifest `indonesian-speech.json` mencatat teks yang benar-benar disintesis, locale, versi, dan hash setiap klip; generator mengganti audio lama ketika input/versi berubah, bukan sekadar melewati file yang ada. URL audio Indonesia dan skrip diberi versi baru untuk menghindari cache lama. Suara tetap sintetis; pelafalan tertentu sebaiknya dievaluasi bersama pendamping, bukan dianggap sempurna.

## Jejak Kasih: kisah Yesus dalam 18 episode kartun

Alur utama kini mengikuti perjalanan kehidupan Yesus dari kelahiran sampai kebangkitan, bukan lagi katalog 27 kitab. 18 episode: kelahiran, gembala, orang majus, Yesus kecil di Bait Allah, baptisan, murid pertama, Kana, orang lumpuh ditolong, badai, roti dan ikan, anak-anak, Zakeus, masuk Yerusalem, perjamuan, Getsemani, penyaliban, kubur kosong, dan Yesus menampakkan diri. Ini urutan belajar gabungan Injil, bukan klaim tanggal pasti semua peristiwa atau liputan lengkap Injil.

Masing-masing episode mempunyai tiga adegan kartun SVG, narasi singkat, dua dialog pendek per adegan, dan dua pertanyaan. Tokoh kartun memakai karakter ilustrasi sendiri; foto wajah Elven dan ketiga game lama tidak diubah. Dialog merupakan dramatisasi/parafrasa anak, bukan kutipan terjemahan Alkitab. Satu suara sintetis Indonesia membacakan narasi dan nama pembicara/dialog; bukan sulih suara aktor profesional. Mode film memainkan narasi dan dialog berurutan, menyorot tokoh/balon dialog, lalu berpindah adegan otomatis dan berhenti di kuis. Mode manual, jeda/lanjut suara, pelan, jeda animasi, serta reduced motion tersedia. 162 MP3 baru disertakan (54 narasi + 108 dialog).

Getsemani dan penyaliban disampaikan lembut: mengakui penderitaan, kematian, dan penguburan Yesus tanpa gambar luka atau kekerasan; dianjurkan pendamping. Tidak ada autoplay suara saat membuka episode. Audio berhenti saat navigasi, keluar game, atau tab disembunyikan. Progres episode lokal memakai kunci baru `elven-jesus-episodes-completed`, terpisah dari progres kitab lama; masih berbasis browser, bukan per profil. Backend menerima ID episode baru sekaligus ID kitab lama agar data admin tidak hilang. Pencatatan server hanya aktif pada deployment Node.js, bukan GitHub Pages. Berkas katalog lama dan 81 MP3 kitab tetap tersimpan sebagai arsip sumber; alur utama tidak menampilkannya. Uji: `npm test`.

## Edisi pengenalan sebelumnya: 27 kitab

Menu utama menyediakan **Jejak Kasih** di `bible/index.html`, edisi pengenalan berbahasa Indonesia dengan **satu bagian pilihan untuk masing-masing 27 kitab**, bukan rangkuman seluruh kitab. Urutan Matius–Wahyu dibagi menjadi Injil, Kisah Para Rasul, Surat-surat, dan Wahyu. Setiap kitab memiliki tiga adegan, audio narasi MP3, rujukan pasal/ayat, pesan sederhana, dan dua pertanyaan pemahaman. Cerita adalah parafrasa asli berbahasa anak; baca bersama pendamping dan Alkitab keluarga. Surat-surat disajikan sebagai pesan ajaran, bukan peristiwa yang dikarang; ilustrasi Wahyu menampilkan penglihatan secara simbolis.

Ilustrasi SVG bergerak mengikuti adegan (burung, bunga, badai/perahu, roti, pohon, dan lainnya). Navigasi manual tanpa timer, jeda animasi, dukungan reduced motion, serta audio pelan tersedia. 81 MP3 bahasa Indonesia sudah disertakan di `bible/audio`. Pemutaran memerlukan klik pengguna dan volume media; koneksi dibutuhkan bila berkas belum diunduh. Audio arsip ini dahulu dibuat dengan gTTS; generator `scripts/build-bible-audio.py` sekarang hanya membangun episode kartun dengan suara neural Indonesia.

Kuis memberi 100 poin untuk jawaban benar pertama atau 60 setelah mencoba ulang, maksimal 200. Ini skor pemahaman cerita, bukan ukuran iman. Kitab selesai ditandai lokal pada browser/perangkat yang sama (tidak dipisahkan per nama panggilan dan tidak disinkronkan lintas perangkat). Source backend dan dashboard mendukung hasil per kitab bila server Node.js telah dideploy; GitHub Pages tidak menjalankan backend ini. Game dan gambar karakter asli tetap tidak diubah. Uji data dan berkas narasi: `node --test tests/bible.test.cjs`; uji penuh: `npm test`.

## Menu dan game sebelumnya

## Game ketiga: Taman Kata

### Pilihan bahasa Indonesia / English

Menu pengaturan Taman Kata menyediakan **Bahasa latihan**. Mode English menambahkan 48 kata keluarga/sekolah dalam tiga tingkat, arti kata bahasa Indonesia, contoh kalimat Inggris, dan 122 audio MP3 Inggris (Amerika): 26 nama huruf, 48 kata, dan 48 kalimat. Tombol Pelan, kuis huruf awal, dan mikrofon juga memakai bahasa terpilih; pengenalan mikrofon tetap bukan penilaian pelafalan. Potongan kata Inggris membantu membaca, bukan transkripsi fonetik; audio menjadi contoh pelafalan.

Rekor lokal serta penandaan latihan huruf English terpisah dari Indonesia. Pilihan bahasa disimpan lokal. Backend menyimpan sesi Inggris dengan suffix `:en` pada tingkat dan menampilkan bahasa di dashboard; skor tetap kuis huruf. Backend lama perlu diperbarui jika digunakan. Generator opsional `scripts/build-english-audio.py` memerlukan Python gTTS dan internet saat membangun ulang audio. Semua MP3 sudah disertakan, tidak perlu generator saat memainkan game.

Menu juga menyediakan **Taman Kata** di `alphabet/index.html`: 26 huruf A–Z dan 48 kata bahasa Indonesia bertema keluarga/sekolah. Tiga tingkat terdiri dari mudah, sedang, dan menantang; setiap tingkat memiliki 8 kata keluarga dan 8 kata sekolah. Sesi campuran mengambil 4 dari setiap tema, total 8 kata tanpa batas waktu. Pemain memilih tingkat secara bebas.

Contoh kata: ibu, ayah, buku, guru → keluarga, seragam, penggaris → kebersamaan, perpustakaan, ekstrakurikuler. Setiap kata dilengkapi panduan suku kata dan kalimat sederhana. Nama dan ucapan alfabet mengikuti [EYD V — Huruf Abjad](https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-abjad/), bukan fonem huruf dalam kata. Nama Q ditulis `qi` dengan ucapan `ki`; nama V ditulis `ve` dengan ucapan `fe`, sesuai tabel EYD V.

**Contoh ucapan:** 122 file MP3 bahasa Indonesia disertakan di `alphabet/audio`: 26 nama huruf, 48 kata, dan 48 kalimat. Dibuat dengan suara neural khusus bahasa Indonesia, bukan rekaman karakter atau tiruan suara anak. Pemutaran utama memakai HTML Audio dan tidak memerlukan suara Indonesia terpasang di perangkat. Browser dapat meminta klik pengguna untuk memutar; aktifkan volume media. Tombol Pelan memperlambat audio kata utuh dengan pitch dipertahankan jika didukung. Untuk kata/kalimat yang gagal dimuat, suara Indonesia bawaan perangkat digunakan sebagai cadangan. Audio huruf Indonesia tidak dialihkan ke suara perangkat agar tidak kembali menggunakan pelafalan yang berbeda. Offline tersedia jika seluruh folder audio sudah diunduh; ini bukan service worker/PWA. Versi `id-letters-5` mempertahankan 17 rekaman huruf dan mengganti B, D, P, Q, T, V, W, Y, Z menggunakan sintesis fonem bahasa Indonesia (Piper `id_ID-news_tts-medium`), tanpa kalimat pengantar. Warna suara rekaman lama dan pengganti dapat berbeda. Manifest `alphabet/audio/letter-pronunciation.json` mencatat ejaan, ucapan, sumber suara, durasi, dan hash; generator menolak perubahan rekaman yang dilindungi. Rujukan model: [model card](https://huggingface.co/rhasspy/piper-voices/resolve/main/id/id_ID/news_tts/medium/MODEL_CARD). Kata, kalimat, audio English, serta audio Alkitab/doa tidak diubah oleh pembaruan huruf ini. Generator opsional `scripts/build-word-audio.py` memerlukan Python edge-tts, imageio-ffmpeg, piper-tts, dan internet untuk unduhan awal model untuk membuat ulang file; `scripts/build-letter-audio.py` hanya membangun huruf. File yang sudah tervalidasi tidak dibangun ulang. Uji: `node --test tests/audio.test.cjs`.

**Latihan:** pemain mengucapkan kata dan menekan Sudah kuucapkan (penandaan mandiri), lalu memilih huruf awal. Jawaban benar pada pilihan pertama memberi 100 poin, setelah kesalahan 60 poin. Tidak ada poin dari suara, klaim akurasi pelafalan, atau nilai kualitas pengucapan. Tanda alfabet dan rekor kuis disimpan lokal dengan kunci terpisah dari dua game lain.

**Mandarin:** pilih `Mandarin · 中文` di menu Bahasa latihan yang sama. Tersedia 48 kata bertema keluarga/sekolah, tiga tingkat dengan 8 kata per tema, hanzi sederhana, pinyin bertanda nada, arti kata dan kalimat Indonesia, serta 96 MP3 Mandarin standar (`zh-CN-XiaoxiaoNeural`). Nada netral ditulis tanpa tanda; perubahan nada dalam tuturan tidak selalu sama dengan ejaan pinyin kamus. Latihan mengucapkan kata tetap penandaan mandiri; kuis memilih karakter hanzi pertama, bukan huruf pinyin. Panel alfabet A–Z tidak ditampilkan untuk Mandarin. Rekor lokal dipisah dengan akhiran `-zh`, hasil online diberi penanda `:zh`. Bahasa Indonesia/English tetap tersedia dan file audionya tidak diganti. Generator opsional: `python scripts/build-mandarin-audio.py` (edge-tts dan internet saat membuat ulang); pemutaran memakai file yang disertakan. Uji: `node --test tests/mandarin.test.cjs`.

**Mikrofon opsional:** memerlukan browser yang mendukung Web Speech Recognition serta secure context/HTTPS. Izin diperlukan lewat dialog penjelasan dan otorisasi browser; tidak aktif otomatis. Browser mungkin mengirim audio ke layanan pengenalannya. Game tidak menyimpan rekaman atau transkrip secara persisten, dan hanya menampilkan teks yang dikenali sementara. Kesamaan teks bukan pengukuran pelafalan atau nada Mandarin. Mikrofon berhenti saat sesi dibatalkan, kartu diganti, tab disembunyikan, atau kembali ke menu; batas sesi 12 detik. Tidak diperlukan untuk menyelesaikan game.

Game petualangan, game matematika, dan kelima gambar asli tidak dimodifikasi dalam penambahan game ketiga. Uji data: `node tests/words.test.cjs`. UI dan alur izin diuji memakai simulasi API suara; suara dan mikrofon nyata perlu dukungan perangkat pengguna. Source game ketiga tersedia di repository.

`index.html` sekarang menjadi menu awal untuk memilih game:

- **Taman Bermain**: versi terkini di `adventure/index.html` memakai maju otomatis dan tombol lompat; versi petualangan lama tersimpan dalam riwayat Git.
- **Taman Angka**: 12 soal matematika dasar per sesi, dengan foto sekolah dan karakter asli yang sama. Pilih penjumlahan, pengurangan, campuran +/−, perkalian, atau pembagian.

Taman Angka tidak memakai batas waktu. Tingkat pemula membatasi hasil penjumlahan/pengurangan hingga 10; lanjutan hingga 20. Perkalian/pembagian memakai faktor 1–5 atau 1–10; pembagian selalu bulat dan tidak membagi dengan nol. Hasil pengurangan tidak negatif. Mode campuran berisi 6 soal penjumlahan dan 6 pengurangan.

Jawaban benar tanpa salah atau bantuan memberi 100 poin. Setelah percobaan keliru atau memakai bantuan visual, jawaban benar memberi 60 poin. Anak boleh mencoba lagi; soal baru hanya muncul setelah menekan tombol berikutnya. Rekor matematika disimpan terpisah dari rekor petualangan. Ringkasan menampilkan berapa soal dijawab benar pada pilihan pertama (termasuk jika dibantu).

Tiga soal membawa pemain ke lokasi sekolah berikutnya. Pilihan suasana dan suara memakai pengaturan bersama; pengaturan suara bisa diubah lagi di masing-masing game. Data karakter diekstrak tanpa perubahan dari foto karakter yang sudah ada, bukan digambar ulang.

Tombol **Pilih game** kembali ke menu setelah konfirmasi dan mengakhiri sesi yang sedang berjalan; rekor yang sudah disimpan tidak hilang. Setiap game hanya dimuat ketika dipilih sehingga game lain tidak berjalan di latar.

Untuk bermain offline, ekstrak seluruh paket lalu buka `index.html`. Jangan memisahkan folder `assets`, `adventure`, `math`, atau `alphabet`. Game tidak membutuhkan build atau akun pemain. Pencatatan online, login admin, dan sebagian fitur suara membutuhkan layanan atau dukungan runtime sebagaimana dijelaskan di **ONLINE-README.md**.

Uji mesin matematika: `node tests/math-engine.test.cjs`.

## Menu Doa Katolik

Menu kelima **Doa Katolik** tersedia di `prayers/index.html`, tanpa mengubah karakter atau game sebelumnya. Berisi 14 doa berbahasa Indonesia, termasuk Tanda Salib, Bapa Kami, Salam Maria, Kemuliaan, Aku Percaya, Terpujilah, Doa Fatima, Salam Ya Ratu, Malaikat Tuhan, dan Ratu Surga. Empat doa harian untuk anak ditandai sebagai contoh doa sederhana, bukan rumusan liturgis atau pengganti sakramen.

Pembaca menyediakan ukuran teks dan sorotan baris. Panduan Rosario meliputi Peristiwa Gembira, Terang, Sedih, dan Mulia, masing-masing lima peristiwa dengan renungan singkat. Anak dapat mengikuti pembukaan, lima puluhan, dan penutup secara manual, melihat penanda manik, kembali ke langkah sebelumnya, serta menjeda dan melanjutkan selama halaman masih terbuka. Doa Fatima dan Terpujilah dapat dipilih atau ditiadakan. Jadwal harian hanya saran; semua kelompok dapat dipilih.

Doa dan 20 renungan Rosario dapat didengarkan melalui 34 MP3 dengan suara sintetis pria khusus bahasa Indonesia (`id-ID-ArdiNeural`), tempo dasar tenang. Tombol Dengarkan/Jeda, Ulang suara, dan pilihan tempo tersedia; tidak ada pemutaran otomatis atau perpindahan langkah otomatis. Audio berhenti saat berpindah doa/langkah, kembali ke menu, atau meninggalkan tab. Jika audio gagal, pesan muncul tanpa mengganti suara ke bahasa/perangkat lain. Teks doa tidak berubah; pembacaan merapikan tanda hubung kata ganti untuk mesin suara. Tidak ada skor, timer, kewajiban nama pemain, atau pengiriman data doa. Ujud doa opsional hanya ditampilkan sementara di memori halaman dan dihapus saat panduan selesai; tidak disimpan ke browser atau server. Menutup atau memuat ulang halaman menghapus sesi. Maria diangkat ke surga dan dimahkotai diberi keterangan ajaran Katolik, bukan kutipan peristiwa eksplisit dari Kitab Suci.

Rujukan yang ditampilkan: [Vatikan — Peristiwa Terang](https://www.vatican.va/special/rosary/documents/misteri_luminosi_en.html), [rumusan doa Indonesia](https://novenatigasalammaria.id/doa-novena-tiga-salam-maria/), [Legio Maria — Malaikat Tuhan](https://www.legiomariasenatusbejanarohani.or.id/doa-malaikat-tuhan-angelus), dan [Paroki Pulogebang — Rosario](https://www.parokipulogebang.org/doa-rosario/). Ejaan dan beberapa rumusan dapat berbeda antarparoki; anak dianjurkan mengikuti pendamping atau buku doa parokinya. Uji data, urutan, dan audio: `node --test tests/prayers.test.cjs`. Generator opsional `python scripts/build-prayer-audio.py` memerlukan edge-tts dan internet saat membangun ulang; pemain tidak memerlukan generator atau suara Indonesia terpasang di perangkat. MP3 disertakan; seluruh folder `prayers/audio` harus tersedia untuk bermain offline.

## Taman Bermain — maju otomatis

Versi terbaru mengganti petualangan gerak kiri/kanan menjadi permainan maju otomatis dengan satu tombol, terinspirasi kontrol Flappy Bird. Ketuk kanvas, tombol Lompat, Spasi, atau panah atas untuk mendapat dorongan naik, termasuk saat di udara. P atau Escape menjeda. Karakter dan empat foto sekolah asli memakai berkas yang sama tanpa modifikasi.

Lintasan menyediakan 20 bintang dan 20 rintangan. Mode santai memberi 3 kesempatan dengan laju lebih pelan; mode tantangan 1 kesempatan. Menyentuh tanah bukan kegagalan; karakter terus berjalan. Tidak ada batas waktu. Bintang terlewat tidak menghalangi kemenangan: pemain menang saat sampai di gerbang akhir. Setiap bintang memberi 100 poin, rintangan terlewati 20 poin, dan sampai akhir 500 poin, maksimum 2.900.

Rekor runner disimpan terpisah dengan kunci `taman-runner-best`; rekor lama tidak dihapus. Sesi online memakai tingkat `runner-santai` atau `runner-normal` dengan ID game `adventure`, sementara tingkat lama tetap diterima untuk riwayat. Kembali ke menu mengakhiri sesi; restart mengulang lintasan. Memindahkan tab atau kehilangan fokus menjeda permainan. Suara efek opsional tidak memakai narasi. Uji: `node --test tests/runner.test.cjs`.

Taman Bermain dapat dibuka langsung lewat `adventure/index.html` pada hosting statis. HTML, `runner.css`, `runner.js`, dan `runner-engine.js` memakai gambar asli dari folder `assets`; jangan memisahkan folder saat bermain offline. Jika pencatatan online dipakai, backend juga perlu memakai `server.mjs` terbaru untuk menerima tingkat runner dan batas skor 2.900; GitHub Pages sendiri tetap hosting statis.

## Catatan petualangan lama

Daftar berikut berlaku untuk versi gerak kiri/kanan sebelum runner, bukan mekanik Taman Bermain terkini. Magnet, kupu-kupu, dan lencana berikut tidak dipakai oleh runner.

- Pilihan suasana pagi cerah, sore keemasan, dan taman ajaib. Pencahayaan hanya diterapkan pada latar, bukan karakter.
- Wajah, pakaian, dan data gambar karakter asli tidak diubah. Keempat foto latar asli juga tetap utuh.
- Dua magnet menarik bintang dalam radius 175 selama 8 detik. Ambil magnet saat melompat.
- Misi mengumpulkan 4 kupu-kupu memberi bonus 500 poin.
- Lencana Penjelajah, Sahabat kupu-kupu, dan Kombo hebat disimpan setelah kemenangan. Kombo hebat membutuhkan kombo ×5.
- Petunjuk arah bintang tersisa, progres empat lokasi, efek bintang, kontrol sentuh dengan umpan balik, dan ulang permainan dari menu jeda.
- Rekor, lencana, pilihan suasana, dan pengaturan suara disimpan lokal di browser, bila penyimpanan tersedia. Tidak ada akun atau leaderboard online.
- Efek atmosfer menghormati preferensi reduced motion. Tombol dan pilihan pengaturan mendukung navigasi keyboard.

Perubahan ini berupa source game statis; tidak memerlukan dependensi baru atau layanan eksternal.

Foto pribadi dipublikasikan atas persetujuan pemilik. Tidak disertai izin penggunaan ulang untuk pihak lain.
## Kebun Melodi

Game baru `melody/index.html` hadir sebagai pilihan keenam, tanpa mengganti game atau wajah karakter asli. Lima piano bunga membunyikan tangga nada pentatonik Do–Re–Mi–Sol–La. Pemain menirukan urutan cahaya dan nada; setiap keberhasilan memekarkan satu bunga. Tunas kecil memiliki 6 putaran (2–7 nada), Kebun ajaib 8 putaran (3–10 nada). Tidak ada batas waktu atau kehilangan bunga setelah salah. Contoh lebih pelan tersedia; suara dapat dimatikan dan seluruh latihan tetap bisa diikuti melalui cahaya, nama, dan nomor bunga. Sentuh/klik atau tombol 1–5.

Satu putaran menghasilkan 100 poin tanpa kesalahan atau bantuan dengar ulang; kesalahan/dengar ulang saat menjawab mengurangi 20 poin, minimum 40. Gangguan tab tidak mengurangi poin: audio berhenti dan urutan dapat dilanjutkan dari awal. Skor maksimum 600/800. Mode musik bebas tidak mengirim hasil atau memiliki jawaban salah. Rekor sesi selesai tersimpan lokal per tingkat; jika server pencatatan tersedia, sesi selesai tampil sebagai Kebun Melodi di dashboard admin. Audio dibuat lokal dengan Web Audio (tanpa mikrofon, rekaman, atau layanan suara eksternal). Uji: `node --test tests/melody.test.cjs` dan `npm test`.
## Taman Pujian

Pilihan ketujuh `hymns/index.html` adalah tebak lagu gereja tradisional yang dikenal dalam tradisi Katolik: Hai Mari Berhimpun / Adeste Fideles, Malam Kudus / Stille Nacht, O Sanctissima, dan Hai Dunia Gembiralah / Joy to the World. Beberapa lagu juga dinyanyikan lintas gereja. Keempat teks dan melodi dasar berasal dari karya domain publik; tidak memakai rekaman penyanyi atau menyalin terjemahan Indonesia buku nyanyian yang masih berhak cipta. Teks yang disertakan: tiga bait Latin Adeste Fideles, tiga bait Jerman Stille Nacht, empat bait Latin O Sanctissima, dan empat bait English Joy to the World, ditambah ringkasan makna Indonesia buatan Game Elven. Ini bukan kumpulan lengkap semua bait/varian historis dan bukan pengganti buku nyanyian liturgi paroki.

Delapan MP3 disertakan: empat melodi instrumental baru (satu putaran melodi per lagu) dan empat cuplikan 11 detik. Audio memakai sintesis instrumen lokal saat pembangunan, bukan suara nyanyian AI. Setelah menjawab benar, anak dapat membuka teks dan memutar melodi; perpustakaan lagu menyediakan teks/audio sebelum kuis. Tidak ada pemutaran otomatis, mikrofon, atau sorotan lirik tersinkron. Audio berhenti saat kartu/menu berganti, tab ditinggalkan, atau game ditutup. Main tanpa timer; mendengar ulang tidak mengurangi poin. Skor soal 100 tanpa bantuan, 80 dengan petunjuk, 60 setelah salah, 40 setelah salah dan memakai petunjuk; maksimum 400. Mode perpustakaan tidak mencatat skor. Rekor lokal dan integrasi dashboard `hymns:traditional` tersedia jika server pencatatan dijalankan.

Sumber per lagu ditautkan pada teksnya; rujukan melodi tambahan dan status domain publik dicatat di `hymns/SOURCES.md`. Generator opsional `python scripts/build-hymn-audio.py` membutuhkan numpy dan imageio-ffmpeg; pemain hanya membutuhkan berkas MP3 yang disertakan. Manifest hash/durasi: `hymns/audio/manifest.json`. Uji: `node --test tests/hymns.test.cjs` dan `npm test`.
