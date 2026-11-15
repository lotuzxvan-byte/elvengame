# Game Elven — Pencatatan dan dashboard admin

## Status deliverable

Source backend tersedia bersama frontend di repository. Game petualangan, matematika, alfabet, dan gambar karakter tidak diubah; adapter skor dimuat oleh menu utama saat game dibuka. Backend belum dideploy ke hosting publik; GitHub Pages tidak menjalankan Node.js atau SQLite. Dashboard demo terpisah memakai data fiktif, bukan data pemain, dan tidak digunakan oleh halaman admin produksi.

## Arsitektur

- Node.js 22.13+ HTTP server, SQLite server-side (`node:sqlite`), tanpa dependensi npm eksternal. SQLite pada Node 22 masih berstatus experimental; verifikasi versi runtime sebelum produksi.
- Semua halaman, backend, dan dashboard pada origin HTTPS yang sama. Cocok untuk satu instance Node dengan disk persisten. Bukan aplikasi statis GitHub Pages dan bukan arsitektur multi-instance SQLite.
- Nama panggilan dan ID UUID per browser; identitas pemain berasal dari token acak cookie HttpOnly/SameSite, bukan ID yang dikirim client. Nama yang sama tidak otomatis digabung.
- Satu browser dipakai beberapa anak akan berbagi profil. Mereka bisa mengganti nama panggilan, tetapi ID tetap sama. Jumlah pemain adalah jumlah profil browser, bukan jumlah orang unik yang pasti.
- Hasil setiap sesi selesai (termasuk kehabisan waktu di petualangan) disimpan dengan timestamp server, jenis game, tingkat, poin, dan jawaban pertama untuk kuis. Tidak ada rekaman atau transkrip mikrofon di payload/database.
- Sesi yang ditinggalkan tidak tampil sebagai hasil selesai. Alfabet eksplorasi A–Z bukan sesi kuis dan belum dicatat; sesi Taman Kata yang menyelesaikan 8 kata dicatat.
- Skor masih dilaporkan oleh client, bukan anti-cheat. API membatasi nilai/tipe dan menolak kepemilikan sesi yang salah tetapi bukan otoritas gameplay. Jangan memakai skor untuk hadiah uang atau evaluasi resmi anak.

## Aktivasi server

Konfigurasi rahasia melalui environment hosting, bukan JavaScript frontend atau GitHub publik:

- `ADMIN_SETUP_TOKEN`: token acak rahasia minimal 32 byte untuk aktivasi admin pertama. Tidak ada password default. Jangan membagikan di repository.
- `PUBLIC_ORIGIN`: origin HTTPS final tanpa slash terakhir, wajib jika `NODE_ENV=production`. Semua POST/DELETE harus berasal dari origin ini.
- `NODE_ENV=production`: cookie Secure, pengecekan origin produksi.
- `DB_PATH`: path di volume persisten, default `data/elven.sqlite`. Jangan simpan data di filesystem ephemeral host. Folder data dan file SQLite harus hanya terbaca oleh pemilik proses; backup terenkripsi di luar webroot.
- `RETENTION_DAYS`: default 90, rentang 1–365. Penghapusan data lama tiap jam, termasuk profil lama tanpa sesi. Masa simpan backup dikelola operator, jangan melebihi kebijakan privasi.
- `PORT`: 3000 untuk preview/hosting yang sesuai, dapat disesuaikan operator.

Start command untuk hosting: `npm start`. Tidak perlu npm install. Gunakan TLS reverse proxy dan satu instance dengan disk persisten. Server tidak mempercayai header forwarded IP; rate limit berbasis koneksi proxy dapat membatasi semua pengguna di satu bucket. Sesuaikan strategi rate limit sebelum trafik tinggi; jangan mempercayai sembarang X-Forwarded-For.

Admin membuka `/admin/`, memasukkan kode aktivasi dan membuat password pribadi minimal 12 karakter. Aktivasi hanya bisa dilakukan satu kali. Password di-hash dengan scrypt; sesi acak disimpan sebagai hash, berlaku 8 jam. Ganti password membatalkan semua sesi admin. Pemulihan password memerlukan operator server; tidak ada reset lewat email pada versi ini.

Menu game utama perlu disajikan oleh server ini (atau reverse proxy origin yang sama), bukan GitHub Pages yang hanya statis. Server mengarahkan akses langsung game kembali ke menu jika dibuka sebagai halaman dokumen agar profil dapat dibuat. Jangan mengunggah folder backend sebagai website statis dengan harapan API aktif.

## Dashboard

- Login admin privat, aktivitas tanggal UTC, statistik per game (skor antar-game tidak dibandingkan), daftar hasil dan pagination.
- Filter nama/ID, game, tanggal. Klik ID pemain untuk melihat hasil pemain itu.
- Ekspor CSV maksimal 10.000 hasil sesuai filter, dengan escaping formula spreadsheet.
- Hapus sesi dan hapus profil beserta seluruh hasil. Pengguna juga dapat menghapus profil/hasil sendiri dari menu profil.
- Tidak ada leaderboard publik. GET hasil/ekspor dan endpoint kelola memerlukan sesi admin.

## Offline dan batasan

Game tetap berjalan jika server pencatatan gagal. Antrean maksimal 30 hasil disimpan di browser dan dicoba ulang ketika online/tiap 20 detik selama halaman terbuka. Sesi dan hasil mempunyai ID sehingga kirim ulang tidak membuat duplikat. Cookie dibersihkan, browser diganti, localStorage dihapus, atau hasil tertua keluar dari antrean dapat membuat hasil belum terkirim hilang. Jika hasil disimpan offline, timestamp server adalah waktu diterima, bukan waktu permainan asli; UI memberitahu belum tersimpan online. Antrean tidak menggabungkan hasil ke profil lain.

Nama panggilan dan ID bukan bukti identitas. Kumpulkan hanya data minimal, gunakan dengan pendamping untuk anak, dan lengkapi kebijakan privasi/contact pengelola sebelum publikasi. Persetujuan mikrofon pada Taman Kata terpisah dari pencatatan skor.

## Verifikasi

`npm test`: uji autentikasi, aktivasi, akses hasil privat, cookie, batas skor, kepemilikan sesi, anti-duplikasi, filter, CSV, ganti password, penghapusan data, CSRF/origin, rate limit. Test engine game tetap tersedia di `tests/math-engine.test.cjs` dan `tests/words.test.cjs`.

Uji browser dilakukan terhadap backend nyata dengan database validasi sementara: hasil matematika/Taman Kata, antrean offline dan kirim ulang, admin login dan tampilan hasil. Kredensial dan database validasi tidak disertakan dalam paket. Demo visual memakai data fiktif dan tidak menyediakan autentikasi sungguhan.
