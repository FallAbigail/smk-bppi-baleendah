# Pemeriksaan dokumentasi

Tanggal pemeriksaan: 1 November 2026. Subjek laporan adalah website SMK BPPI Baleendah pada commit `85b03714f0d12fe619a43b9360514d514faefd4c`.

- Hasil akhir berjumlah 52 halaman, 28 keterangan gambar, dan 18 tabel.
- Tujuh sumber Mermaid dijalankan melalui Mermaid CLI 12.0.0; seluruh proses selesai dengan kode keluar 0. Log tersedia di `mermaid/render-results.json`.
- Dokumen dirender melalui Microsoft Word dan pipeline PNG dari renderer dokumen. Semua halaman diperiksa secara visual. Untuk halaman yang tidak berubah pada revisi akhir, kesamaan piksel diperiksa dengan SHA-256 terhadap hasil render yang sudah ditinjau.
- Daftar isi, daftar gambar, daftar tabel, serta nomor halaman diperbarui menggunakan field Word.
- Ukuran halaman, margin, gaya inti, logo sampul, dan pola header/footer mengikuti dokumen referensi. File referensi tidak diubah.
- Screenshot berasal dari antarmuka aplikasi di Chrome. Data privat admin, contoh periode PPDB terbuka, serta contoh hasil status menggunakan respons contoh di browser; tidak ada data layanan operasional yang ditulis untuk membuat ilustrasi.
- Build aplikasi dan pemeriksaan sintaks empat modul server berhasil. API publik memberikan HTTP 200, akses admin tanpa sesi ditolak dengan HTTP 401, dan pencarian nomor/kode PPDB tidak terdaftar memberikan HTTP 404.
- Pemeriksaan ini tidak mencakup pengujian tulis database dari awal hingga akhir. Batas pengujian dijelaskan pada Bab VI.

File render PDF dan PNG per halaman digunakan untuk pemeriksaan internal dan tidak disertakan sebagai hasil dokumentasi. Sumber Mermaid, PNG diagram, screenshot, dan builder disimpan agar laporan dapat diperbarui.
