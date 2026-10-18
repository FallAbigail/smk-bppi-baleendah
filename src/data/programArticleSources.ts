export interface ProgramArticleSource {
  profile: string
}

// Ringkasan profil program keahlian SMK BPPI Baleendah.
export const programArticleSources: Record<string, ProgramArticleSource> = {
  'program-smk-akl': {
    profile:
      'Akuntansi dan Keuangan Lembaga (AKL) mempelajari pencatatan, pengelolaan, dan pelaporan keuangan pada perusahaan maupun lembaga. Siswa belajar mengelola informasi keuangan dan administrasi dengan teliti dan rapi. Fokus pembelajarannya meliputi pencatatan, pengelolaan, dan pelaporan keuangan, serta administrasi keuangan. Kompetensi ini dapat menjadi bekal untuk berkarier sebagai staf akuntansi, administrasi keuangan, atau manajemen.',
  },
  'program-smk-pplg': {
    profile:
      'Pengembangan Perangkat Lunak dan Gim (PPLG) mempelajari cara membuat, mengembangkan, dan mengelola aplikasi, website, serta gim. Materi pengembangannya mencakup pemrograman, logika pemrograman, desain website, basis data, dan aplikasi mobile. Program ini cocok bagi siswa yang tertarik pada teknologi dan ingin memahami proses pembuatan produk digital.',
  },
  'program-smk-tjkt': {
    profile:
      'Teknik Jaringan Komputer dan Telekomunikasi (TJKT) mempelajari perancangan, pembangunan, pengelolaan, dan perbaikan jaringan komputer serta sistem telekomunikasi. Fokus pembelajaran mencakup instalasi jaringan, konfigurasi router, pengelolaan server, fiber optic, dan perawatan perangkat jaringan. Program ini sesuai bagi siswa yang tertarik pada teknologi, internet, dan komunikasi data.',
  },
  'program-smk-acp': {
    profile:
      'Axioo Class Program (ACP) adalah kelas industri dari PT Tera Data Indonusa Tbk (Axioo Indonesia) yang membekali siswa SMK jurusan TKJ dan PPLG dengan keterampilan hardware, software, jaringan, dan teknologi informasi. Pembelajarannya juga memberi pengalaman magang industri melalui PKL. Siswa berpeluang direkrut di industri IT, termasuk lingkungan Axioo, sesuai kompetensi dan kebutuhan perusahaan.',
  },
}
