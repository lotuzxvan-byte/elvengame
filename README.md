# Game Elven

Versi ini menambahkan backend pencatatan skor dan dashboard admin. Panduan utama deployment, aktivasi login, privasi, serta keterbatasan ada di **ONLINE-README.md**. Source backend tersedia di repository, tetapi pencatatan online dan login admin baru aktif setelah deployment Node.js dengan database persisten. GitHub Pages hanya menyajikan frontend statis; pada Pages, game tetap dapat dimainkan dengan profil sementara dan peringatan bahwa skor belum tersimpan online.

Game browser berbahasa Indonesia, dioptimalkan untuk HP.

## Menu dan dua game

## Game ketiga: Taman Kata

### Pilihan bahasa Indonesia / English

Menu pengaturan Taman Kata menyediakan **Bahasa latihan**. Mode English menambahkan 48 kata keluarga/sekolah dalam tiga tingkat, arti kata bahasa Indonesia, contoh kalimat Inggris, dan 122 audio MP3 Inggris (Amerika): 26 nama huruf, 48 kata, dan 48 kalimat. Tombol Pelan, kuis huruf awal, dan mikrofon juga memakai bahasa terpilih; pengenalan mikrofon tetap bukan penilaian pelafalan. Potongan kata Inggris membantu membaca, bukan transkripsi fonetik; audio menjadi contoh pelafalan.

Rekor lokal serta penandaan latihan huruf English terpisah dari Indonesia. Pilihan bahasa disimpan lokal. Backend menyimpan sesi Inggris dengan suffix `:en` pada tingkat dan menampilkan bahasa di dashboard; skor tetap kuis huruf. Backend lama perlu diperbarui jika digunakan. Generator opsional `scripts/build-english-audio.py` memerlukan Python gTTS dan internet saat membangun ulang audio. Semua MP3 sudah disertakan, tidak perlu generator saat memainkan game.

Menu juga menyediakan **Taman Kata** di `alphabet/index.html`: 26 huruf A–Z dan 48 kata bahasa Indonesia bertema keluarga/sekolah. Tiga tingkat terdiri dari mudah, sedang, dan menantang; setiap tingkat memiliki 8 kata keluarga dan 8 kata sekolah. Sesi campuran mengambil 4 dari setiap tema, total 8 kata tanpa batas waktu. Pemain memilih tingkat secara bebas.

Contoh kata: ibu, ayah, buku, guru → keluarga, seragam, penggaris → kebersamaan, perpustakaan, ekstrakurikuler. Setiap kata dilengkapi panduan suku kata dan kalimat sederhana. Huruf alfabet dibacakan sebagai nama huruf bahasa Indonesia, bukan fonem.

**Contoh ucapan:** 122 file MP3 bahasa Indonesia disertakan di `alphabet/audio`: 26 nama huruf, 48 kata, dan 48 kalimat. Dibuat melalui gTTS berbahasa Indonesia, bukan rekaman karakter atau tiruan suara anak. Pemutaran utama memakai HTML Audio dan tidak memerlukan suara Indonesia terpasang di perangkat. Browser dapat meminta klik pengguna untuk memutar; aktifkan volume media. Tombol Pelan memperlambat audio kata utuh dengan pitch dipertahankan jika didukung. Jika file gagal dimuat, suara Indonesia bawaan perangkat digunakan sebagai cadangan. Offline tersedia jika seluruh folder audio sudah diunduh; ini bukan service worker/PWA. Generator opsional `scripts/build-word-audio.py` membutuhkan Python gTTS dan internet hanya untuk membuat ulang file, bukan saat server berjalan. Uji: `node --test tests/audio.test.cjs`.

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
