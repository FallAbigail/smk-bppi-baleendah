# Profil SMK BPPI Baleendah

## Menjalankan lokal

Gunakan Node.js 22.13 atau lebih baru.

```sh
npm install
npm run dev
```

Frontend berjalan di `http://127.0.0.1:5173` dan API berjalan di `http://127.0.0.1:3001`. Perintah `npm run dev` menyalakan keduanya.

## Membuat akses admin

Tidak ada akun bawaan dan tidak ada pendaftaran dari halaman web. Buat akun dari terminal di komputer yang menjalankan server:

```sh
npm run admin:create
```

Masukkan username dan kata sandi saat diminta. Input kata sandi tidak ditampilkan di terminal dan panjangnya 8–128 karakter. Buka `/admin` untuk login. Untuk mengganti kata sandi:

```sh
npm run admin:reset-password
```

Reset kata sandi mencabut semua sesi admin yang aktif.

Untuk mengganti username sekaligus kata sandi akun yang sudah ada:

```sh
npm run admin:set-credentials
```

Perintah ini juga mencabut semua sesi lama agar perubahan kredensial langsung berlaku.

## Database dan penyimpanan

Data disimpan di `data/site-content.sqlite` menggunakan SQLite. Database dibuat otomatis saat API pertama kali dijalankan dan diisi dengan data awal situs. File database dan file WAL diabaikan Git.

Data program, pengumuman, status publikasi, akun admin, dan sesi disimpan di server. API publik hanya memberikan pengumuman yang sudah tayang. Draft dan operasi perubahan hanya tersedia untuk sesi admin.

Panel admin menyediakan backup JSON untuk konten. Jika ada konten lama di browser dari versi localStorage, panel menawarkan impor satu kali ke database. Impor hanya diterima jika database belum pernah diedit, sehingga tidak menimpa perubahan server secara diam-diam.

## Sistem PPDB online

Halaman pendaftar berada di `/ppdb`. Pendaftaran tertutup secara default. Setelah login ke `/admin`, buka bagian **Pendaftar PPDB**, isi tahun ajaran, lalu aktifkan penerimaan pendaftaran online. Formulir mengumpulkan data calon siswa, pilihan program, dan kontak orang tua/wali; data disimpan di SQLite dan hanya bisa dikelola melalui sesi admin.

Setelah formulir dikirim, pendaftar mendapat nomor pendaftaran serta kode pelacakan untuk memeriksa status. Admin dapat mengubah status, menulis pesan yang terlihat oleh pendaftar, menambahkan catatan internal, atau menghapus data pendaftaran. Sistem versi ini belum mengirim email otomatis dan belum menyediakan unggah berkas; sekolah dapat memberi arahan lanjutan melalui pesan status atau kontak yang sudah diisi.

## Menjalankan produksi

```sh
npm run build
npm start
```

Server menyajikan frontend dan API dari port `PORT` (default `3001`). Gunakan HTTPS di reverse proxy/hosting, set `APP_ORIGIN` ke origin publik yang tepat, dan set `TRUST_PROXY=1` hanya jika request memang melewati reverse proxy tepercaya. Hosting harus menyediakan disk persisten untuk file SQLite; penyimpanan filesystem sementara akan kehilangan database saat instance diganti.

Jaga file database dan backup server sebagai data privat. Jangan masukkan kata sandi admin ke source code atau file yang masuk Git.
