# Implementasi prioritas mobile — 1 November 2026

Menindaklanjuti lima prioritas pada `2026-10-31T16-50-22Z__src-pages-home-tsx.md`.

## Perubahan

1. Nama guru menjadi 14 px dan mata pelajaran 12 px. Caption fasilitas memakai alas gelap yang stabil, dengan ukuran mobile 16 px sebelum transformasi carousel. Placeholder form publik dipergelap di tema terang dan diperjelas di tema gelap. Input mobile menjadi 16 px.
2. Area sentuh menu, tema, bahasa, tab program, rating, dan pagination diperbesar. Menu pendek dapat digulir pada layar 320×568. Tombol kembali ke atas disembunyikan saat form terlihat; label invalid-field tetap di bawah navbar. Konfirmasi kontak dan pendaftaran dibawa ke area pandang serta mendapat fokus setelah berhasil.
3. Beranda memakai pengantar ringkas, kemudian program dan CTA PPDB. Profil guru, visi, dan misi lengkap tetap tersedia di Tentang. Pada pengukuran 360 px, program berada sekitar 1.178 px dan CTA sekitar 2.003 px, dibanding sekitar 2.228 px dan 6.603 px pada review awal. Angka dapat berubah mengikuti konten/font/perangkat.
4. Ulasan pembaca tampil sebelum formulir. Filter rating berada di toolbar pembaca. Formulir dibuka dengan Tulis ulasan, dapat ditutup, dan mempertahankan draft selama komponen tetap terpasang. Filter dapat ditutup dengan Escape atau klik di luar.
5. Form kontak baru memakai balasan melalui tautan privat yang sudah tersedia; pemrosesan data email dan pesan email lama di admin tidak dihapus. PPDB menyesuaikan pengantar/judul dengan status aktual, menampilkan tahun ajaran, arahan persiapan, pilihan program, dan kontak sekolah. Jadwal tidak direkayasa; pesan admin tetap menjadi sumber informasi ketika tersedia. Copy baru memiliki terjemahan Inggris.

## Verifikasi

- `npm run build`: lolos TypeScript dan bundle produksi.
- `git diff --check`: lolos.
- Chromium mobile emulation 360×800 dan 390×844: menu dan area sentuh, pilihan PPLG, filter rating, buka/tutup form ulasan, draft tetap ada, label validasi kontak, status PPDB tertutup, ukuran nama guru/mata pelajaran, dan tidak ada overflow horizontal pada beranda/Tentang/kontak/PPDB.
- Layout tambahan 320×568, 768×900, 1440×900: route publik yang sama tidak overflow. Menu 320 px dapat digulir hingga kontrol bahasa dan CTA.
- Tema gelap dan Inggris: petunjuk kontak, style placeholder dan input 16 px, error mempertahankan input, konfirmasi tautan privat, pengiriman ulasan yang memperbarui daftar, serta PPDB terbuka dengan data pelacakan.
- Semua POST pada tes sukses/error di atas dicegat dan dijawab di browser. Pengaturan PPDB terbuka juga disimulasikan hanya di browser. Tidak ada pesan, ulasan, atau calon siswa uji yang disimpan ke database sekolah. Ini verifikasi state UI, bukan pengujian transaksi backend baru.
- Carousel diuji tiga skenario: gerak otomatis, scroll turun lalu naik, dan navigasi Tentang lalu kembali ke beranda. Tetap bergerak, memiliki kartu terlihat, dan tidak memiliki kartu reveal yang tertahan. Perhitungan lingkaran tidak diubah.
- Tidak ada exception JavaScript pada sesi tes yang dicatat. Pemeriksaan ini menggunakan Chromium emulation, bukan pengujian fisik seluruh perangkat atau browser.
- `impeccable detect --json src`: exit 2 dengan tujuh advisory: enam `overused-font` untuk Inter dan satu `side-tab` pada `.admin-stat-card::after`. Font adalah bagian dari visual yang dipertahankan; aksen admin sudah ada dan di luar perubahan mobile publik. Tidak ditambahkan pengecualian global atau klaim bahwa semua temuan aksesibilitas telah hilang.

## Bukti setelah implementasi

- [Hero mobile 390 px](evidence/mobile-implementation-2026-11-01/home-390.png)
- [Form ulasan 360 px](evidence/mobile-implementation-2026-11-01/reviews-360.png)
- [PPDB tertutup 360 px](evidence/mobile-implementation-2026-11-01/ppdb-360.png)
- [Kontak sukses, tema gelap dan Inggris, respons uji](evidence/mobile-implementation-2026-11-01/contact-success-dark-en.png)
- [PPDB sukses, tema gelap dan Inggris, respons uji](evidence/mobile-implementation-2026-11-01/ppdb-open-success-dark-en.png)
