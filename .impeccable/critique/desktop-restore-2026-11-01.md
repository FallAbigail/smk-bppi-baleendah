# Pemulihan tampilan desktop — 1 November 2026

Permintaan pengguna: perubahan mobile tidak boleh mengubah tampilan desktop; kembalikan desktop ke sebelum implementasi mobile.

## Batas tampilan

- Mobile/tablet: lebar di bawah 1024 px, mengikuti breakpoint navigasi desktop yang sudah ada.
- Desktop: 1024 px ke atas, menggunakan susunan dan ukuran sebelum commit `7f6235f`, dengan acuan source `a496f08`.
- `useMobileLayout` mengatur perbedaan susunan tanpa menduplikasi section yang memiliki ID sama. Perubahan ukuran, placeholder, caption dan scroll margin dibatasi lewat media query.

## Desktop yang dipulihkan

- Beranda kembali memuat profil lengkap, guru, visi dan misi sebelum program; CTA kembali di bawah, setelah ulasan dan sponsor.
- Form ulasan kembali tampil sebelum daftar ulasan. Filter berada pada header form; ukuran kontrol, rating dan pagination kembali seperti sebelumnya.
- Ukuran tombol navbar, pilihan bahasa, nama guru, mata pelajaran, serta tampilan caption fasilitas kembali mengikuti desktop lama.
- Kontak kembali menampilkan pilihan balasan website/email dan copy desktop sebelumnya. Jalur mobile tetap memakai percakapan privat yang tersedia.
- PPDB desktop kembali memakai pengantar, judul form, badge tahun ajaran dan kartu tertutup sebelumnya. Arahan persiapan yang baru hanya tampil pada mobile.
- Tombol kembali ke atas dan perilaku scroll konfirmasi desktop mengikuti perilaku sebelumnya. Fungsi salin pelacakan tetap tersedia di desktop dan mobile.

## Verifikasi

- Menjalankan source acuan `a496f08` pada preview sementara terpisah. Data publik dibaca dari API yang sama; tidak ada submit data.
- Membandingkan 16 kombinasi: lebar 1024/1440 px × tema terang/gelap × beranda/Tentang/kontak/PPDB.
- Setelah font Inter dimuat, tidak ada selisih pada teks main, urutan anak main, atau properti tampilan yang dipilih untuk navbar, caption fasilitas, section utama, guru, form/filter/rating ulasan, input kontak, serta heading/input PPDB. Properti mencakup ukuran dan tinggi elemen, posisi layout, font/line height, warna, background, padding, margin, gap dan radius. Ini bukan klaim seluruh pixel video/animasi identik.
- Screenshot kontak acuan dan hasil dipandang langsung dan sesuai pada layout desktop.
- Tes mobile 360×800 dan 390×844 tetap lolos: ukuran menu, pilihan jurusan, disclosure/draft ulasan, posisi label validasi, placeholder, PPDB tertutup, tipe guru dan tidak ada overflow halaman.
- Resize mobile → desktop → mobile mengembalikan susunan yang sesuai tanpa CTA ganda. Form desktop tersedia dan disclosure mobile tetap bekerja.
- Build produksi dan `git diff --check` lolos. Detektor tetap memiliki enam advisory Inter dan satu aksen kartu admin yang telah ada; tidak mengubah visual desktop untuk mengejar advisory tersebut.
- Preview sementara dihentikan setelah perbandingan. Server pengguna pada 5173/3001 tetap berjalan.

## Bukti

- [Kontak desktop acuan](evidence/desktop-restore-2026-11-01/contact-before.png)
- [Kontak desktop hasil](evidence/desktop-restore-2026-11-01/contact-after.png)
- [PPDB desktop hasil](evidence/desktop-restore-2026-11-01/ppdb-after.png)
