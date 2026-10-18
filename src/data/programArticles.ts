export interface ProgramArticleSection {
  heading: string
  body: string
}

export interface ProgramArticleContent {
  title: string
  sections: ProgramArticleSection[]
}

export const programArticles: Record<string, ProgramArticleContent> = {
  'program-smk-akl': {
    title: 'Mengelola keuangan dengan teliti dan terstruktur',
    sections: [
      {
        heading: 'Pembelajaran inti',
        body: 'Siswa mempelajari proses pencatatan transaksi, pengelolaan data keuangan, penyusunan laporan, dan administrasi. Ketelitian, kerapian, serta tanggung jawab menjadi bagian penting saat mengolah informasi keuangan perusahaan maupun lembaga.',
      },
      {
        heading: 'Penerapan kompetensi',
        body: 'Kemampuan tersebut digunakan untuk menyajikan informasi keuangan yang tertata dan mendukung pekerjaan administrasi. Bekal AKL dapat dikembangkan menuju pekerjaan staf akuntansi atau administrasi keuangan, maupun studi lanjutan di bidang terkait.',
      },
    ],
  },
  'program-smk-pplg': {
    title: 'Mewujudkan ide menjadi perangkat lunak dan gim',
    sections: [
      {
        heading: 'Dari logika ke produk digital',
        body: 'Pembelajaran PPLG mengajak siswa memahami cara kerja program, menyusun alur pemecahan masalah, lalu menerapkannya dalam aplikasi, website, dan gim. Dasar pemrograman, logika, basis data, desain website, serta aplikasi mobile menjadi bagian dari kompetensinya.',
      },
      {
        heading: 'Belajar melalui proses pengembangan',
        body: 'Siswa berlatih merancang, membuat, dan memperbaiki produk digital secara bertahap. Proses tersebut membangun ketelitian, kreativitas, kemampuan memecahkan masalah, dan kesiapan untuk mengembangkan karya teknologi lebih lanjut.',
      },
    ],
  },
  'program-smk-tjkt': {
    title: 'Membangun jaringan yang menghubungkan banyak perangkat',
    sections: [
      {
        heading: 'Ruang lingkup pembelajaran',
        body: 'TJKT mempelajari perancangan, pemasangan, pengelolaan, dan perbaikan jaringan komputer serta sistem telekomunikasi. Siswa mengenal instalasi jaringan, konfigurasi router, server, fiber optic, dan perawatan perangkat jaringan.',
      },
      {
        heading: 'Praktik dan pemecahan masalah',
        body: 'Kompetensi jaringan digunakan untuk menghubungkan perangkat dan menjaga layanan komunikasi tetap berfungsi. Siswa berlatih memahami konfigurasi serta menelusuri gangguan agar dapat menangani kebutuhan jaringan di lingkungan sekolah maupun dunia kerja.',
      },
    ],
  },
  'program-smk-acp': {
    title: 'Belajar teknologi dengan pendekatan kelas industri',
    sections: [
      {
        heading: 'Pembelajaran berbasis industri',
        body: 'Axioo Class Program membekali siswa dengan keterampilan teknologi informasi yang dekat dengan kebutuhan industri. Materinya mencakup hardware, software, jaringan, dan teknologi informasi, disertai pembelajaran praktik serta sertifikasi sesuai program yang tersedia.',
      },
      {
        heading: 'Pengalaman untuk memasuki dunia kerja',
        body: 'Siswa mendapat kesempatan untuk mengenal ritme kerja industri melalui praktik dan pengalaman magang atau PKL. Kompetensi yang dikembangkan dapat menjadi bekal untuk melanjutkan karier di bidang teknologi informasi sesuai kemampuan dan kebutuhan perusahaan.',
      },
    ],
  },
}
