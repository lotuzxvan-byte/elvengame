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

Contoh kata: ibu, ayah, buku, guru → keluarga, seragam, penggaris → kebersamaan, perpustakaan, ekstrakurikuler. Setiap kata dilengkapi panduan suku kata dan kalimat sederhana. Huruf alfabet dibacakan sebagai nama huruf bahasa Indonesia, bukan fonem.

**Contoh ucapan:** 122 file MP3 bahasa Indonesia disertakan di `alphabet/audio`: 26 nama huruf, 48 kata, dan 48 kalimat. Dibuat dengan suara neural khusus bahasa Indonesia, bukan rekaman karakter atau tiruan suara anak. Pemutaran utama memakai HTML Audio dan tidak memerlukan suara Indonesia terpasang di perangkat. Browser dapat meminta klik pengguna untuk memutar; aktifkan volume media. Tombol Pelan memperlambat audio kata utuh dengan pitch dipertahankan jika didukung. Jika file gagal dimuat, suara Indonesia bawaan perangkat digunakan sebagai cadangan. Offline tersedia jika seluruh folder audio sudah diunduh; ini bukan service worker/PWA. Generator opsional `scripts/build-word-audio.py` membutuhkan Python edge-tts dan internet hanya untuk membuat ulang file, bukan saat server berjalan. Uji: `node --test tests/audio.test.cjs`.

**Latihan:** pemain mengucapkan kata dan menekan Sudah kuucapkan (penandaan mandiri), lalu memilih huruf awal. Jawaban benar pada pilihan pertama memberi 100 poin, setelah kesalahan 60 poin. Tidak ada poin dari suara, klaim akurasi pelafalan, atau nilai kualitas pengucapan. Tanda alfabet dan rekor kuis disimpan lokal dengan kunci terpisah dari dua game lain.

**Mikrofon opsional:** memerlukan browser yang mendukung Web Speech Recognition serta secure context/HTTPS. Izin diperlukan lewat dialog penjelasan dan otorisasi browser; tidak aktif otomatis. Browser mungkin mengirim audio ke layanan pengenalannya. Game tidak menyimpan rekaman atau transkrip secara persisten, dan hanya menampilkan teks yang dikenali sementara. Kesamaan teks bukan pengukuran pelafalan. Mikrofon berhenti saat sesi dibatalkan, kartu diganti, tab disembunyikan, atau kembali ke menu; batas sesi 12 detik. Tidak diperlukan untuk menyelesaikan game.

Game petualangan, game matematika, dan kelima gambar asli tidak dimodifikasi dalam penambahan game ketiga. Uji data: `node tests/words.test.cjs`. UI dan alur izin diuji memakai simulasi API suara; suara dan mikrofon nyata perlu dukungan perangkat pengguna. Source game ketiga tersedia di repository.

`index.html` sekarang menjadi menu awal untuk memilih game:

- **Berburu Bintang**: versi petualangan sebelumnya, dipindahkan utuh ke `adventure/index.html`. Source HTML, CSS, dan JavaScript petualangan tidak diubah dalam penambahan game kedua ini.
- **Taman Angka**: 12 soal matematika dasar per sesi, dengan foto sekolah dan karakter asli yang sama. Pilih penjumlahan, pengurangan, campuran +/−, perkalian, atau pembagian.

Taman Angka tidak memakai batas waktu. Tingkat pemula membatasi hasil penjumlahan/pengurangan hingga 10; lanjutan hingga 20. Perkalian/pembagian memakai faktor 1–5 atau 1–10; pembagian selalu bulat dan tidak membagi dengan nol. Hasil pengurangan tidak negatif. Mode campuran berisi 6 soal penjumlahan dan 6 pengurangan.

Jawaban benar tanpa salah atau bantuan memberi 100 poin. Setelah percobaan keliru atau memakai bantuan visual, jawaban benar memberi 60 poin. Anak boleh mencoba lagi; soal baru hanya muncul setelah menekan tombol berikutnya. Rekor matematika disimpan terpisah dari rekor petualangan. Ringkasan menampilkan berapa soal dijawab benar pada pilihan pertama (termasuk jika dibantu).

Tiga soal membawa pemain ke lokasi sekolah berikutnya. Pilihan suasana dan suara memakai pengaturan bersama; pengaturan suara bisa diubah lagi di masing-masing game. Data karakter diekstrak tanpa perubahan dari foto karakter yang sudah ada, bukan digambar ulang.

Tombol **Pilih game** kembali ke menu setelah konfirmasi dan mengakhiri sesi yang sedang berjalan; rekor yang sudah disimpan tidak hilang. Setiap game hanya dimuat ketika dipilih sehingga game lain tidak berjalan di latar.

Untuk bermain offline, ekstrak seluruh paket lalu buka `index.html`. Jangan memisahkan folder `assets`, `adventure`, `math`, atau `alphabet`. Game tidak membutuhkan build atau akun pemain. Pencatatan online, login admin, dan sebagian fitur suara membutuhkan layanan atau dukungan runtime sebagaimana dijelaskan di **ONLINE-README.md**.

Uji mesin matematika: `node tests/math-engine.test.cjs`.

## Game petualangan sebelumnya

Panah kiri/kanan untuk bergerak, Spasi untuk lompat dua kali, P untuk jeda. Tombol sentuh tersedia. Kumpulkan 20 bintang dan buka peti hadiah; kupu-kupu memberi bonus poin dan waktu. Pilih mode santai untuk bermain tanpa batas waktu.

Game petualangan juga dapat dibuka langsung lewat `adventure/index.html`. Di folder itu, HTML, CSS, dan JavaScript versi sebelumnya disimpan bersama. Semua gambar dalam game petualangan tetap tertanam.

## Peningkatan visual dan fitur

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
