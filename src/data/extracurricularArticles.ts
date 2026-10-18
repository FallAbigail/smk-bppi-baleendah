export interface ExtracurricularArticleSection {
  heading: string
  body: string
}

export interface ExtracurricularArticleContent {
  title: string
  sections: ExtracurricularArticleSection[]
}

export const extracurricularArticles: Record<number, ExtracurricularArticleContent> = {
  1: {
    title: 'ANDRO-IT: ruang berkarya di bidang teknologi',
    sections: [
      { heading: 'Eksplorasi teknologi digital', body: 'ANDRO-IT menjadi ruang bagi siswa untuk mengenal pemrograman, desain, robotik, dan multimedia. Anggota dapat mengeksplorasi minat teknologi sambil membangun pemahaman dasar melalui kegiatan yang terarah.' },
      { heading: 'Belajar melalui proyek', body: 'Kegiatan proyek melatih anggota menyusun ide, membagi peran, dan menyelesaikan pekerjaan secara bertahap. Proses ini mengembangkan kreativitas digital, komunikasi, dan kebiasaan bekerja sama dalam tim.' },
    ],
  },
  2: {
    title: 'Band: mengembangkan musik sebagai karya bersama',
    sections: [
      { heading: 'Latihan bermusik', body: 'Kegiatan Band-SMK BPPI mengembangkan kemampuan siswa memainkan alat musik dan memahami perannya dalam sebuah penampilan. Latihan rutin membantu anggota mengasah teknik secara bertahap.' },
      { heading: 'Kekompakan di atas panggung', body: 'Bermain dalam kelompok membutuhkan tempo, komunikasi, dan saling mendengarkan. Anggota berlatih menyiapkan penampilan dan proyek musik dengan disiplin serta kreativitas.' },
    ],
  },
  3: {
    title: 'Basket: bertumbuh lewat kerja sama tim',
    sections: [
      { heading: 'Teknik dan kebugaran', body: 'Latihan Basket mengembangkan kemampuan teknis dan fisik siswa. Anggota membangun keterampilan bermain secara bertahap sekaligus menjaga kebugaran untuk mengikuti kegiatan olahraga.' },
      { heading: 'Belajar bermain sebagai tim', body: 'Permainan basket menuntut koordinasi dan kerja sama antarpemain. Latihan membantu siswa memahami peran masing-masing, meningkatkan kekompakan, dan menyiapkan diri untuk pertandingan maupun kompetisi.' },
    ],
  },
  4: {
    title: 'Badminton: teknik, disiplin, dan sportivitas',
    sections: [
      { heading: 'Latihan terarah', body: 'Ekstrakurikuler Badminton membina minat siswa pada olahraga bulu tangkis melalui latihan yang rutin dan terstruktur. Anggota mengembangkan teknik bermain serta kemampuan fisik yang dibutuhkan saat bergerak di lapangan.' },
      { heading: 'Sikap dalam pertandingan', body: 'Selain keterampilan, latihan menanamkan disiplin dan sportivitas. Siswa belajar berusaha dengan konsisten, menghormati lawan, dan menerima hasil pertandingan dengan sikap positif.' },
    ],
  },
  5: {
    title: 'Futsal: mengasah kemampuan individu dan kolektif',
    sections: [
      { heading: 'Permainan yang dinamis', body: 'Latihan futsal mengembangkan kemampuan individu dan pemahaman bermain bersama. Siswa berlatih bergerak, mengolah bola, dan merespons situasi permainan dengan cepat.' },
      { heading: 'Membangun kekompakan', body: 'Kerja sama menjadi bagian penting dalam setiap permainan. Latihan membantu anggota memahami peran di dalam tim, menjaga komunikasi, dan membangun mental bertanding yang kuat.' },
    ],
  },
  6: {
    title: 'IRMA: ruang pembinaan keagamaan dan karakter',
    sections: [
      { heading: 'Kegiatan keagamaan', body: 'IRMA, Ikatan Remaja Masjid, menjadi wadah bagi siswa untuk terlibat dalam kegiatan keislaman di lingkungan sekolah. Kegiatan ini mendukung pembinaan keimanan dan pemahaman nilai agama.' },
      { heading: 'Karakter dalam keseharian', body: 'Anggota diajak membangun akhlak, tanggung jawab, dan kepedulian melalui kebersamaan. Nilai-nilai tersebut menjadi bekal untuk berperilaku baik di sekolah maupun di lingkungan masyarakat.' },
    ],
  },
  7: {
    title: 'JBM: belajar bercerita melalui jurnalistik',
    sections: [
      { heading: 'Menulis dan meliput', body: 'JBM atau Jurnalis BPPI Media mengembangkan kemampuan jurnalistik dan literasi media. Anggota berlatih menulis, melakukan peliputan, serta menyusun informasi menjadi konten yang mudah dipahami.' },
      { heading: 'Menyampaikan informasi dengan tanggung jawab', body: 'Proses jurnalistik melatih siswa untuk mengamati, menyusun fakta, dan memeriksa kembali informasi sebelum dibagikan. Kerja tim juga diperlukan dalam mengelola konten media sekolah.' },
    ],
  },
  8: {
    title: 'Karate: membangun teknik dan kedisiplinan',
    sections: [
      { heading: 'Latihan bela diri', body: 'Karate mengembangkan keterampilan bela diri siswa melalui latihan yang terarah. Anggota mempelajari teknik secara bertahap sambil melatih ketahanan dan kesiapan fisik.' },
      { heading: 'Kekuatan yang disertai sikap', body: 'Disiplin, pengendalian diri, dan sportivitas menjadi bagian dari proses latihan. Siswa diajak menggunakan kemampuan dengan tanggung jawab serta menghargai sesama.' },
    ],
  },
  9: {
    title: 'Muay Thai: melatih kebugaran dan ketangguhan',
    sections: [
      { heading: 'Keterampilan dan kondisi fisik', body: 'Latihan Muay Thai menitikberatkan pengembangan kemampuan fisik dan mental secara seimbang. Siswa mempelajari teknik dan membangun kekuatan melalui latihan yang dilakukan secara terarah.' },
      { heading: 'Konsistensi dalam berlatih', body: 'Latihan berkelanjutan membantu anggota mengukur perkembangan dan meningkatkan kesiapan diri. Disiplin serta ketekunan menjadi bagian penting dalam proses menguasai keterampilan.' },
    ],
  },
  10: {
    title: 'OSIS: belajar memimpin dan berorganisasi',
    sections: [
      { heading: 'Wadah partisipasi siswa', body: 'OSIS membuka ruang bagi siswa untuk berperan aktif dalam kehidupan sekolah. Anggota belajar mengorganisasi kegiatan, bekerja sama, dan menjalankan tanggung jawab sesuai perannya.' },
      { heading: 'Membangun kepemimpinan', body: 'Pengalaman berorganisasi melatih komunikasi, inisiatif, dan kemampuan mengambil keputusan bersama. Bekal ini membantu siswa menjadi pribadi yang lebih mandiri dan bertanggung jawab.' },
    ],
  },
  11: {
    title: 'Paduan suara: menyatukan suara dalam harmoni',
    sections: [
      { heading: 'Mengembangkan kemampuan vokal', body: 'Padus membina minat dan bakat siswa dalam seni musik vokal. Latihan rutin membantu anggota meningkatkan kualitas suara dan kesiapan dalam membawakan lagu bersama.' },
      { heading: 'Mendengar dan menyatu', body: 'Dalam paduan suara, setiap anggota perlu menjaga disiplin dan menyesuaikan suara dengan kelompok. Proses ini menguatkan konsentrasi, kerja sama, dan rasa percaya diri saat tampil.' },
    ],
  },
  12: {
    title: 'Paskibra: disiplin dan tanggung jawab dalam kebersamaan',
    sections: [
      { heading: 'Latihan yang terarah', body: 'Paskibra membina siswa melalui latihan yang mengutamakan kedisiplinan dan kesiapan. Anggota berlatih menjalankan tugas dengan tertib dalam kegiatan resmi sekolah.' },
      { heading: 'Kekompakan dan tanggung jawab', body: 'Gerakan yang selaras memerlukan kerja sama, fokus, serta rasa tanggung jawab terhadap kelompok. Nilai-nilai ini membantu siswa membangun karakter dan kepercayaan diri.' },
    ],
  },
  13: {
    title: 'Pencak Silat: keterampilan bela diri dan nilai budaya',
    sections: [
      { heading: 'Mengembangkan kemampuan bela diri', body: 'Pencak Silat memberi ruang bagi siswa untuk mempelajari keterampilan bela diri melalui latihan berkelanjutan. Anggota mengasah teknik sekaligus membangun kesiapan fisik dan mental.' },
      { heading: 'Disiplin dan sikap sportif', body: 'Latihan menumbuhkan kedisiplinan, ketangguhan, serta penghormatan terhadap orang lain. Siswa diajak memahami bahwa kemampuan bela diri berjalan bersama tanggung jawab dan sportivitas.' },
    ],
  },
  14: {
    title: 'PMR: siap membantu dan peduli sesama',
    sections: [
      { heading: 'Pengetahuan kesehatan dasar', body: 'PMR membekali anggota dengan pengetahuan dasar kesehatan dan pertolongan pertama. Siswa berlatih agar lebih siap dan tanggap saat menghadapi kebutuhan bantuan di lingkungan sekolah.' },
      { heading: 'Kemanusiaan dalam tindakan', body: 'Kegiatan PMR mengembangkan kepedulian sosial, kerja sama, dan sikap melayani. Anggota belajar membantu dengan tenang, bertanggung jawab, serta menghargai kondisi orang yang membutuhkan.' },
    ],
  },
  15: {
    title: 'Pramuka: melatih kemandirian dan kepemimpinan',
    sections: [
      { heading: 'Belajar melalui kegiatan bersama', body: 'Pramuka membina kemandirian dan disiplin melalui kegiatan yang terarah. Siswa belajar menyelesaikan tugas, mengelola tanggung jawab, dan bekerja dalam regu.' },
      { heading: 'Karakter dan kepedulian', body: 'Pengalaman dalam Pramuka mendorong tumbuhnya jiwa kepemimpinan, tanggung jawab, serta kepedulian sosial. Nilai-nilai tersebut dapat diterapkan di sekolah maupun kehidupan sehari-hari.' },
    ],
  },
  16: {
    title: 'Seni Tari: gerak, ekspresi, dan kreativitas',
    sections: [
      { heading: 'Mengeksplorasi gerak dan ekspresi', body: 'Seni Tari mengembangkan kemampuan gerak dan ekspresi siswa melalui latihan yang terarah. Anggota berlatih meningkatkan teknik tari dan menyampaikan gagasan melalui gerakan.' },
      { heading: 'Menghidupkan nilai budaya', body: 'Kegiatan ini memberi ruang untuk mengembangkan kreativitas sekaligus memahami nilai budaya dalam karya tari. Proses latihan juga menumbuhkan disiplin dan rasa percaya diri saat menampilkan karya.' },
    ],
  },
  17: {
    title: 'Voli: membangun permainan lewat koordinasi tim',
    sections: [
      { heading: 'Teknik dan kebugaran', body: 'Ekstrakurikuler Voli mengembangkan keterampilan olahraga dan kebugaran siswa. Latihan membantu anggota menguasai teknik dasar secara bertahap dan meningkatkan kesiapan bermain.' },
      { heading: 'Kerja sama di lapangan', body: 'Permainan voli bergantung pada koordinasi dan komunikasi antarpemain. Latihan membangun kekompakan tim serta menyiapkan siswa untuk mengikuti pertandingan dengan sikap sportif.' },
    ],
  },
}
