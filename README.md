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

Masukkan username dan kata sandi saat diminta. Input kata sandi tidak ditampilkan di terminal dan panjangnya minimal 12 karakter. Buka `/admin` untuk login. Untuk mengganti kata sandi:

```sh
npm run admin:reset-password
```

Reset kata sandi mencabut semua sesi admin yang aktif.

## Database dan penyimpanan

Data disimpan di `data/site-content.sqlite` menggunakan SQLite. Database dibuat otomatis saat API pertama kali dijalankan dan diisi dengan data awal situs. File database dan file WAL diabaikan Git.

Data program, pengumuman, status publikasi, akun admin, dan sesi disimpan di server. API publik hanya memberikan pengumuman yang sudah tayang. Draft dan operasi perubahan hanya tersedia untuk sesi admin.

Panel admin menyediakan backup JSON untuk konten. Jika ada konten lama di browser dari versi localStorage, panel menawarkan impor satu kali ke database. Impor hanya diterima jika database belum pernah diedit, sehingga tidak menimpa perubahan server secara diam-diam.

## Menjalankan produksi

```sh
npm run build
npm start
```

Server menyajikan frontend dan API dari port `PORT` (default `3001`). Gunakan HTTPS di reverse proxy/hosting, set `APP_ORIGIN` ke origin publik yang tepat, dan set `TRUST_PROXY=1` hanya jika request memang melewati reverse proxy tepercaya. Hosting harus menyediakan disk persisten untuk file SQLite; penyimpanan filesystem sementara akan kehilangan database saat instance diganti.

Jaga file database dan backup server sebagai data privat. Jangan masukkan kata sandi admin ke source code atau file yang masuk Git.
