# Taman Bintang

Game browser berbahasa Indonesia, dioptimalkan untuk HP.

## Menu dan dua game

`index.html` sekarang menjadi menu awal untuk memilih game:

- **Berburu Bintang**: versi petualangan sebelumnya, dipindahkan utuh ke `adventure/index.html`. Source HTML, CSS, dan JavaScript petualangan tidak diubah dalam penambahan game kedua ini.
- **Taman Angka**: 12 soal matematika dasar per sesi, dengan foto sekolah dan karakter asli yang sama. Pilih penjumlahan, pengurangan, campuran +/−, perkalian, atau pembagian.

Taman Angka tidak memakai batas waktu. Tingkat pemula membatasi hasil penjumlahan/pengurangan hingga 10; lanjutan hingga 20. Perkalian/pembagian memakai faktor 1–5 atau 1–10; pembagian selalu bulat dan tidak membagi dengan nol. Hasil pengurangan tidak negatif. Mode campuran berisi 6 soal penjumlahan dan 6 pengurangan.

Jawaban benar tanpa salah atau bantuan memberi 100 poin. Setelah percobaan keliru atau memakai bantuan visual, jawaban benar memberi 60 poin. Anak boleh mencoba lagi; soal baru hanya muncul setelah menekan tombol berikutnya. Rekor matematika disimpan terpisah dari rekor petualangan. Ringkasan menampilkan berapa soal dijawab benar pada pilihan pertama (termasuk jika dibantu).

Tiga soal membawa pemain ke lokasi sekolah berikutnya. Pilihan suasana dan suara memakai pengaturan bersama; pengaturan suara bisa diubah lagi di masing-masing game. Data karakter diekstrak tanpa perubahan dari foto karakter yang sudah ada, bukan digambar ulang.

Tombol **Pilih game** kembali ke menu setelah konfirmasi dan mengakhiri sesi yang sedang berjalan; rekor yang sudah disimpan tidak hilang. Setiap game hanya dimuat ketika dipilih sehingga game lain tidak berjalan di latar.

Untuk bermain offline, ekstrak seluruh paket lalu buka `index.html`. Jangan memisahkan folder `assets`, `adventure`, atau `math`. Tidak ada build, API key, layanan eksternal, atau login. Preview ini belum dipush ke GitHub.

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
