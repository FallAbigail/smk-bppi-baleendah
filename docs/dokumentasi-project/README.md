# Dokumentasi project website sekolah

Dokumen Word mengikuti format laporan perpustakaan yang diberikan pengguna. Materi diambil dari source code website sekolah dan pemeriksaan lokal tanggal 1 November 2026.

## Isi

- Laporan Word dengan delapan bab, daftar isi, daftar gambar dan tabel, serta lampiran.
- Tujuh sumber diagram Mermaid beserta hasil PNG.
- Screenshot antarmuka desktop, mobile, dan panel admin.
- Builder Python yang menyalin komponen dan format dari dokumen referensi.

Data privat pada screenshot admin memakai respons contoh di browser. Periode terbuka serta hasil status PPDB juga diperagakan dengan respons contoh. Tidak ada pendaftaran, status, pesan, ulasan, atau akun operasional yang diubah untuk mengambil gambar. Cookie dan kredensial tidak disertakan.

## Merender diagram

Diagram dibuat dengan Mermaid CLI 12.0.0. Pasang Mermaid CLI pada direktori alat terpisah atau gunakan instalasi yang sudah tersedia. Dari direktori ini, jalankan:

```sh
mmdc -i mermaid/02-alur-ppdb.mmd -o assets/02-alur-ppdb.png -c mermaid/theme.json --size 1800 -s 2 -b white
```

Jika Chrome tidak dideteksi otomatis, sesuaikan `executablePath` pada `mermaid/puppeteer.json` lalu tambahkan `-p mermaid/puppeteer.json`. Konfigurasi yang disertakan menggunakan lokasi umum Chrome di Windows. Hasil eksekusi ketujuh diagram dicatat di `mermaid/render-results.json`.

## Membuat ulang dokumen

Gunakan Python dengan `python-docx` dan `Pillow`, kemudian berikan dokumen referensi milik pengguna:

```sh
python build_document.py --reference "PATH_DOKUMEN_REFERENSI.docx"
```

Builder tidak mengubah referensi. Dokumen memerlukan logo serta komponen gaya dari referensi tersebut. Setelah membangun ulang, buka hasilnya di Microsoft Word dan perbarui seluruh field, daftar isi, serta nomor halaman. Render dan periksa semua halaman sebelum membagikannya.

## Pemeriksaan

Build aplikasi dan pemeriksaan sintaks empat modul server berhasil. API publik merespons HTTP 200, akses PPDB admin tanpa sesi ditolak dengan 401, dan pemeriksaan pasangan kode tidak terdaftar menghasilkan 404. Screenshot contoh tidak dianggap sebagai pengujian tulis database ujung ke ujung. Rincian serta pengujian lanjutan tercantum pada Bab VI.
