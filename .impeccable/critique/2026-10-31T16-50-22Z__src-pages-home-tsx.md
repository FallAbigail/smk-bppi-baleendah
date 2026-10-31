---
target: Tampilan mobile web profil sekolah SMK BPPI
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\laragon\\www\\profile-sekolah\\src\\pages\\Home.tsx"
target_fingerprint: "sha256:8cd4fd5ff36a99abfe1856712d51850cf55479830eb700fa4b8b17cf74b4db91"
target_path: "C:\\laragon\\www\\profile-sekolah\\src\\pages\\Home.tsx"
timestamp: 2026-10-31T16-50-22Z
slug: src-pages-home-tsx
---
Method: dual-agent (A: /root/mobile_design_review · B: /root/mobile_evidence_review)

Menurutku mobile web ini sudah punya karakter sekolah yang jelas, tetapi keterbacaan dan urutan informasinya masih perlu dibenahi. **Skor heuristik: 28/40 (Good)**. Ini penilaian desain pada kondisi yang diperiksa, bukan sertifikasi aksesibilitas.

Review memakai tampilan browser 360×800 dan 390×844: beranda, program, tentang, PPDB, kontak, dan menu mobile. Kondisi PPDB saat diperiksa tertutup; formulir pendaftaran terbuka belum diuji. Tidak ada pesan, ulasan, atau pendaftaran nyata yang dikirim.

**Yang sudah bekerja**

- Foto kampus, guru, logo jurusan, dan carousel melingkar membuatnya terasa milik SMK BPPI. Bentuk serta gerakan carousel layak dipertahankan.
- Tidak ditemukan overflow horizontal halaman pada kedua ukuran yang diperiksa. Pemilihan jurusan bekerja dan menampilkan nama lengkap serta informasi yang sesuai.
- Menu mobile muat di layar, menandai halaman aktif, dan bisa ditutup dengan Escape. Input pelacakan PPDB tetap tersimpan ketika kode fiktif tidak ditemukan.

**Lima prioritas perbaikan**

1. **[P1] Sebagian teks terlalu kecil untuk dibaca nyaman.** Isi misi sekolah sekitar **10,72 px**, nama guru **11 px**, dan mata pelajaran **10 px**. Caption fasilitas juga kecil dan berubah latarnya mengikuti gambar. Pada cuplikan tertentu, kontras caption terukur sekitar **2,4–3,0:1**; hasil ini bergantung pada frame, bukan rasio permanen. Naikkan teks isi penting menuju 14–16 px, metadata menuju 12–14 px, dan gunakan alas caption yang konsisten. Placeholder kontak/pelacakan juga sekitar 3,1:1 pada latar putih; pergelap placeholder tanpa mengubah label yang sudah jelas. **Arah: `$impeccable typeset`, lalu `$impeccable harden`.**

2. **[P2] Beberapa kontrol mobile masih kurang ramah jempol.** Tombol menu/tema berukuran **40×40 px**; pilihan bahasa sekitar **32×24 px**. Tombol utama kontak dan inputnya sudah lebih nyaman, jadi perbaikannya perlu selektif. Besarkan area sentuh kontrol kecil menuju 44×44 px. Tombol kembali ke atas juga terlihat menimpa sisi kanan `Kirim ulasan` pada 360 px: pindahkan atau sembunyikan selama interaksi formulir. Pastikan fokus validasi tidak membawa label field ke balik navbar tetap. **Arah: `$impeccable adapt` / `$impeccable harden`.**

3. **[P2] Informasi praktis beranda datang terlalu jauh di bawah.** Pada 360 px, bagian program baru mulai sekitar **2.228 px**, sedangkan CTA penerimaan sekitar **6.603 px**, setelah pengantar sekolah, guru, visi, dan tujuh misi. Tombol hero memang menyediakan jalan pintas, tetapi alur membaca normal masih panjang. Ringkas pengantar di beranda, majukan program dan informasi PPDB; simpan uraian institusi lengkap di halaman Tentang. Pertahankan hero melingkar dan pola pilih jurusan yang ada. **Arah: `$impeccable layout` / `$impeccable distill`.**

4. **[P2] Bagian ulasan mencampur kebutuhan pembaca dan penulis.** Filter rating ditempatkan pada area `Tulis ulasan`, sedangkan ulasan yang sudah ada muncul setelah formulir panjang. Dua konteks bintang menjadi mudah tertukar. Tampilkan ringkasan, filter, dan ulasan lebih dulu; buka formulir melalui aksi `Tulis ulasan` yang terpisah. **Arah: `$impeccable layout` / `$impeccable clarify`.**

5. **[P2] Kejelasan langkah berikutnya melemah di kontak dan PPDB.** Pilihan `Email Disiapkan` menampilkan penjelasan tentang konfigurasi layanan dan draf admin. Orang tua perlu tahu cara menerima balasan, bukan menafsirkan proses internal. Tampilkan jalur balasan yang benar-benar tersedia dengan penjelasan sederhana. Di PPDB, pengantar mengajak mendaftar sementara panel mengatakan belum dibuka: sesuaikan pengantar dengan status aktual, tampilkan jadwal jika sudah resmi atau nyatakan belum diumumkan, dan beri arahan persiapan/kontak penerimaan. Ini kritik kejelasan UI; pengiriman email tidak diuji dan tidak dinyatakan rusak. **Arah: `$impeccable clarify` / `$impeccable onboard`.**

**Penilaian heuristik**

| Aspek | Skor | Catatan utama |
|---|---:|---|
| Status sistem | 3/4 | Ada loading, status pilihan, dan hasil pencarian |
| Bahasa yang familiar | 3/4 | Copy konfigurasi email terlalu teknis |
| Kendali pengguna | 3/4 | Menu bisa ditutup; pencarian bisa dibersihkan |
| Konsistensi | 3/4 | Warna, input, dan navigasi cukup konsisten |
| Pencegahan kesalahan | 3/4 | Field wajib dan batas input tersedia |
| Mudah dikenali | 3/4 | Singkatan jurusan perlu konteks bagi pengunjung baru |
| Efisiensi | 3/4 | Ada pintasan program/kontak; urutan konten masih panjang |
| Kesederhanaan visual | 2/4 | Banyak kartu setara dan formulir ulasan dominan |
| Pemulihan error | 3/4 | Lookup PPDB memberi pesan dan mempertahankan input |
| Bantuan | 2/4 | Kontak ada; arahan saat PPDB tertutup masih minim |
| **Total** | **28/40** | **Good; perbaikan mobile tetap diperlukan** |

**Beban perhatian dan pengalaman pengguna**

Beban perhatian sedang: tujuh tautan menu ditambah dua CTA dan enam pilihan filter rating masih dapat dikelola, tetapi perlu pengelompokan. Pembukaan dengan kampus dan fasilitas membangun rasa percaya; deretan informasi institusi memperlambat pencarian jurusan, lalu status PPDB tertutup dan pilihan email menambah ketidakpastian.

Untuk pengunjung baru, singkatan jurusan dan langkah setelah PPDB tertutup butuh penjelasan. Untuk pengguna HP yang terburu-buru, area sentuh kecil dan form ulasan menghambat. Untuk pengguna dengan penglihatan terbatas, teks misi/guru serta caption gambar adalah hambatan paling nyata.

**Catatan kecil dan hasil detektor**

- Scan sumber Home.tsx dan komponen sections masing-masing menghasilkan **0 temuan**. Pemeriksaan runtime berbeda: beranda menghasilkan 6 kelompok temuan di bagian atas atau 17 setelah bagian Tentang terbuka, PPDB 6, dan kontak 8. Jangan menjumlahkan angka itu karena elemen yang sama berulang antar tampilan.
- Temuan teks kecil dan kontras didukung pengukuran browser. Sinyal seperti penggunaan Inter, kartu bersarang pada pesan PPDB, dan kode pos yang jatuh sendiri pada baris baru tidak otomatis merupakan masalah penggunaan.
- Marquee sponsor memang berjalan terus, tetapi sudah memiliki dukungan reduced motion dan berhenti saat di luar viewport. Tidak perlu menghapus semua animasi.
- Chip ACP yang terpotong merupakan rail yang bisa digeser dan berhasil dipilih, bukan overflow halaman.
- Ada warning React development terkait `fetchPriority` pada gambar hero; tidak teramati crash pada alur yang diperiksa. Ini bukan klaim seluruh runtime bebas error.
- Review memakai tema terang. Dark mode, screen reader, zoom 200%, koneksi lambat, dan alur pendaftaran terbuka belum termasuk cakupan.

**Bukti visual**

- [Beranda 360 px](evidence/mobile-2026-10-31/home-360.png)
- [Pengantar dan guru 360 px](evidence/mobile-2026-10-31/about-360.png)
- [Form kontak 360 px](evidence/mobile-2026-10-31/contact-form-360.png)
- [Program terpilih 360 px](evidence/mobile-2026-10-31/home-programs-360.png)

**Arah lanjutan**

1. Fokus awal: **keterbacaan + area sentuh**, atau **urutan beranda + arahan PPDB**?
2. Cakupan: **tiga prioritas pertama**, atau **kelima prioritas**?
