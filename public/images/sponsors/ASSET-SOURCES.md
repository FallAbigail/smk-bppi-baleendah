# Mitra SMK BPPI

Daftar mitra di `src/components/sections/Sponsors.tsx` mengikuti informasi di situs resmi SMK BPPI Baleendah:

- https://smk.sekolahbppi.sch.id/home — mencantumkan PT Amerta Indah Otsuka, PT Esto Kreasi Nusantara, PT Teradata Indonesia Tbk, PT Wahana Internet Nusantara (BNET), Bursa Efek Indonesia, Korea Investment and Sekuritas Indonesia (KISI), Bank Syariah Indonesia (BSI), dan SATU University.
- https://smk.sekolahbppi.sch.id/news/7 — berita kerja sama SMK BPPI dengan CyberLabs untuk pembentukan Teaching Factory.
- https://smk.sekolahbppi.sch.id/jurusan/4 — menjelaskan Axioo Class Program sebagai kelas industri dari PT Tera Data Indonusa Tbk (Axioo Indonesia). Halaman program tetap memakai badge resmi sekolah di `public/images/bppi/programs/acp.png`; marquee mitra memakai wordmark Axioo yang diberikan pengguna di `public/images/sponsors/axioo.png`.

Logo lokal berikut dipakai di marquee; selain wordmark Axioo yang diberikan pengguna, aset diambil dari situs resmi mitra masing-masing:

- `amerta-indah-otsuka.webp`: https://www.aio.co.id/assets/images/static_webp/logo-otsuka-aio.webp
- `axioo.png` and `axioo-dark.png`: Axioo wordmark provided by the user; the checkerboard preview background was removed, and the dark-mode variant uses a light wordmark while retaining the colored X.
- `bnet.png`: https://bnet.id/wp-content/uploads/2020/11/retina-bnet-1.png
- `bsi.svg`: https://www.bsi.co.id/assets/image_assets/icon/logo-bsi.svg
- `cyberlabs.png`: https://cyberlabs.co.id/wp-content/uploads/2024/03/LOGO-CYBERLABS-Hi-Res-1024x262.png
- `kisi.svg`: https://kisi.co.id/static/media/logo.93e66f8df8de59774c93f429fb184c7b.svg
- `satu-university.png`: https://satu.ac.id/wp-content/themes/satu-2023-core/image/logo/satu.png
- `idx-bei.png`: secondary lockup (logomark + IDX wordmark) prepared from https://www.idx.id/media/jgad3455/logo-bursa-efek-indonesia-final.png, following the secondary logo configuration in https://www.idx.id/en/about-idx/idx-visual-identity/.
- `tera-data-indonusa.png`: https://static.wixstatic.com/media/6e87fa_a26e57d38a2d4b4896d850bbf988ce23~mv2.png/v1/crop/x_345,y_737,w_2813,h_1012/fill/w_454,h_162,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/New%20TDI%20TBK%20FIx-04.png — TDI wordmark shown on the official Tera Data Indonusa website.
- `esto-kreasi-nusantara.png`: https://www.estokreasinusantara.com/asset_frontends/imgs/logo/esto.png — official Esto wordmark from the company website.

The partner marquee uses locally stored logo assets listed above. Unused transparent margins are trimmed where needed, and every logo is fitted into the same 176 × 64 px display box.
