# Tentang di beranda mobile — 1 November 2026

Permintaan: pengantar Tentang tetap menampilkan visi, misi dan cuplikan guru secara jelas, dengan desain mobile yang cocok dengan sekolah. Desktop dipertahankan.

## Referensi yang diteliti sebelum implementasi

- [School Website Landing Page — Marzanur Rahman Maher / Dribbble](https://dribbble.com/shots/24715246-School-Website-Landing-Page-UI-UX-Design): struktur informasi nilai/misi sekolah dan tautan lanjutan; halaman dan deskripsi proyek dibaca.
- [Mobile teacher profile — Alice Fioroto / Dribbble](https://dribbble.com/shots/20502057-006-Daily-Ui-User-Profile): gambar desain mobile diperiksa; identitas guru, foto dan bidang dibuat mudah dikenali.
- [Online School — Sheker Alibekova / Behance](https://www.behance.net/gallery/169918885/Online-school-website-design): gambar versi mobile diperiksa, khususnya Aims & Values yang dibaca dalam satu kolom.

Referensi dipakai untuk hierarki informasi dan adaptasi mobile. Warna, Inter, foto, nama, bidang mengajar, visi dan tujuh misi memakai data/asset sekolah yang sudah ada. Gambar riset tidak menjadi asset website. Sumber foto dan staf yang sudah tersimpan di proyek adalah [Tim Sekolah SMK BPPI](https://smk.sekolahbppi.sch.id/tim-sekolah); tidak ada klaim bahwa data staf diperbarui melalui riset desain ini.

## Implementasi

Pengantar tetap ada. Setelah tautan pengenalan, satu bidang biru lembut menonjolkan visi. Tujuh misi tampil sebagai daftar vertikal dengan tanda centang; tidak dilipat atau disembunyikan di balik tab. Tiga guru yang sama dengan cuplikan desktop ditampilkan dalam daftar berfoto dengan nama utuh dan bidang mengajar. Tautan Kenali guru pengajar membuka direktori lengkap.

Komponen baru hanya dirender pada cabang beranda mobile/tablet di bawah 1024px. Visi dibagikan sebagai satu konstanta dengan cabang desktop agar copy tetap sama. Desktop dan halaman Tentang lengkap tetap memakai susunan sebelumnya. Section mobile menjadi lebih panjang karena seluruh misi diperlihatkan; ini mengikuti prioritas pengguna terbaru setelah pengantar sebelumnya dinilai terlalu ringkas.

## Checklist penerimaan section: 4/4

Ini empat syarat yang diperiksa untuk perubahan ini, bukan penilaian ulang skor heuristik seluruh website sebelumnya.

| Kriteria | Hasil dan bukti |
| --- | --- |
| Kelengkapan | Lulus: visi, 7 misi dan 3 guru tampil langsung, tidak ada accordion tersembunyi, anchor visi-misi tunggal. |
| Keterbacaan | Lulus: misi 15px, visi 18px, nama guru 14px, bidang 13px; kontras teks baru minimal 6,31:1 terang dan 7,36:1 gelap pada pengukuran browser setelah animasi selesai. Nama tidak dipotong dengan ellipsis. |
| Adaptasi dan konsistensi | Lulus: tanpa overflow horizontal di 320, 360, 390, 640, 768, 1024, 1440px untuk kedua tema; ketiga foto dimuat; token sekolah dipakai. Desktop 1024/1440 cocok persis pada teks, dimensi section dan dimensi/font/warna/destinasi semua elemen yang dibandingkan dengan baseline. |
| Navigasi dan akses | Lulus: tautan direktori dapat difokuskan dengan outline dan diaktifkan melalui Enter; tautan profil, anchor pengajar, back navigation, Inggris, reduced motion, resize desktop dan landscape bekerja; area tautan mobile minimal 44px. |

## Verifikasi

Browser: Chrome melalui Playwright pada aplikasi localhost sebenarnya. Tidak menulis data sekolah atau mengirim formulir. Bukti berada di `.impeccable/critique/evidence/mobile-about-2026-11-01/`. Capture section penuh 390px memakai viewport tinggi agar konten utuh; screenshot phone-values dan phone-staff memakai 390×844. Screenshot referensi riset juga sudah dibuka untuk inspeksi sebelum kode ditulis.

Build TypeScript/Vite dan `git diff --check` lulus. Pemeriksaan React: data statis/props dipakai ulang, keys stabil, heading h3/h4 mengikuti h2 section, ikon dekoratif disembunyikan dari pembaca layar, foto dekoratif didampingi identitas teks, ukuran gambar ditetapkan, tidak ada hook/state tambahan. Detector hanya mencatat enam advisory Inter yang memang diminta pengguna dan satu accent admin lama. Console development juga memperlihatkan warning fetchPriority pada HeroFacilities yang sudah ada; tidak ada runtime page error pada matriks tampilan. Salah satu percobaan awal Inggris/reduced-motion mengalami timeout locator; pemeriksaan render dan dua pengulangan bersih pada source yang sama kemudian lulus.

final result: passed
