export type ExtracurricularCategory = 'Teknologi' | 'Seni' | 'Olahraga' | 'Organisasi & layanan'

export interface Extracurricular {
  id: number
  name: string
  category: ExtracurricularCategory
  description: string
  logo: string
}

const officialRoot = 'https://smk.sekolahbppi.sch.id/ekskul'

export const extracurriculars: Extracurricular[] = [
  {
    id: 1,
    name: 'ANDRO-IT',
    category: 'Teknologi',
    logo: '/images/extracurricular-logos/01-andro-it.png',
    description: 'Andro-IT berfokus pada pengembangan keterampilan teknologi dan kreativitas digital anggota, meliputi pemrograman, desain, robotik, dan multimedia. Kegiatannya dirancang untuk membangun dasar pengetahuan, meningkatkan kerja sama tim, serta melatih anggota mengerjakan project yang terstruktur dan berkelanjutan.',
  },
  {
    id: 2,
    name: 'Band-SMK BPPI',
    category: 'Seni',
    logo: '/images/extracurricular-logos/02-band.png',
    description: 'Band berfokus pada pengembangan kemampuan bermusik anggota, baik secara individu maupun dalam kerja sama kelompok. Kegiatannya melatih teknik bermain alat musik, membangun kekompakan, serta mempersiapkan anggota untuk penampilan dan project musik secara berkelanjutan.',
  },
  {
    id: 3,
    name: 'Basket',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/03-basket.png',
    description: 'Basket berfokus pada pengembangan kemampuan teknis dan fisik anggota. Latihan bertujuan meningkatkan keterampilan dasar, kerja sama tim, serta kesiapan menghadapi pertandingan dan kompetisi.',
  },
  {
    id: 4,
    name: 'Badminton',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/04-badminton.png',
    description: 'Badminton membina minat dan bakat siswa di bidang olahraga bulu tangkis. Melalui latihan rutin dan terstruktur, anggota berlatih meningkatkan teknik bermain, disiplin, dan sportivitas.',
  },
  {
    id: 5,
    name: 'Futsal',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/05-futsal.png',
    description: 'Melalui futsal, siswa dilatih meningkatkan kemampuan individu dan kolektif dalam permainan. Latihan dirancang untuk membentuk kekompakan tim dan mental bertanding yang kuat.',
  },
  {
    id: 6,
    name: 'IRMA',
    category: 'Organisasi & layanan',
    logo: '/images/extracurricular-logos/06-irma.png',
    description: 'IRMA (Ikatan Remaja Masjid) berfokus pada pembinaan karakter dan keagamaan remaja. Kegiatannya bertujuan meningkatkan keimanan, akhlak, serta kepedulian sosial melalui berbagai program keislaman.',
  },
  {
    id: 7,
    name: 'JBM',
    category: 'Organisasi & layanan',
    logo: '/images/extracurricular-logos/07-jbm.png',
    description: 'JBM (Jurnalis BPPI Media) berfokus pada pengembangan kemampuan jurnalistik dan literasi media. Kegiatannya melatih keterampilan menulis, peliputan, serta pengelolaan konten media secara bertanggung jawab.',
  },
  {
    id: 8,
    name: 'Karate',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/08-karate.png',
    description: 'Karate mengembangkan keterampilan bela diri dan nilai kedisiplinan siswa. Melalui latihan rutin dan terstruktur, anggota berlatih meningkatkan teknik, ketahanan fisik, dan sikap sportivitas.',
  },
  {
    id: 9,
    name: 'MuayThai',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/09-muaythai.png',
    description: 'Muay Thai menitikberatkan pembinaan kemampuan fisik dan mental secara seimbang. Program latihan dirancang untuk melatih teknik, kekuatan, dan kesiapan anggota dalam berbagai kegiatan dan kompetisi.',
  },
  {
    id: 10,
    name: 'OSIS',
    category: 'Organisasi & layanan',
    logo: '/images/extracurricular-logos/10-osis.png',
    description: 'OSIS menjadi wadah pengembangan kepemimpinan dan tanggung jawab siswa. Kegiatannya bertujuan melatih kemampuan berorganisasi, kerja sama, serta partisipasi aktif di lingkungan sekolah.',
  },
  {
    id: 11,
    name: 'Padus',
    category: 'Seni',
    logo: '/images/extracurricular-logos/11-padus.png',
    description: 'Paduan suara membina minat dan bakat siswa di bidang seni musik vokal. Melalui latihan rutin dan terstruktur, anggota berlatih meningkatkan kualitas vokal, disiplin, dan kerja sama tim.',
  },
  {
    id: 12,
    name: 'Paskibra',
    category: 'Organisasi & layanan',
    logo: '/images/extracurricular-logos/12-paskibra.png',
    description: 'Melalui Paskibra, siswa dibina menjadi pribadi yang disiplin dan berkarakter. Latihannya dilakukan secara terarah untuk membangun kerja sama, tanggung jawab, dan kesiapan dalam berbagai kegiatan resmi.',
  },
  {
    id: 13,
    name: 'Pencak Silat',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/13-pencak-silat.png',
    description: 'Pencak Silat mengembangkan keterampilan bela diri siswa melalui latihan yang terarah dan berkelanjutan. Anggota dibina agar memiliki disiplin, mental yang kuat, serta sikap sportif.',
  },
  {
    id: 14,
    name: 'PMR',
    category: 'Organisasi & layanan',
    logo: '/images/extracurricular-logos/14-pmr.png',
    description: 'PMR membentuk anggota yang tanggap, terampil, dan berjiwa sosial. Melalui pelatihan dan kegiatan kemanusiaan, anggota dibekali pengetahuan dasar kesehatan, pertolongan pertama, dan kerja sama tim.',
  },
  {
    id: 15,
    name: 'Pramuka',
    category: 'Organisasi & layanan',
    logo: '/images/extracurricular-logos/15-pramuka.png',
    description: 'Melalui Pramuka, siswa dibina untuk memiliki sikap mandiri, disiplin, dan jiwa kepemimpinan. Kegiatannya dilaksanakan secara terarah untuk membentuk karakter dan kepedulian sosial.',
  },
  {
    id: 16,
    name: 'Seni Tari',
    category: 'Seni',
    logo: '/images/extracurricular-logos/16-seni-tari.png',
    description: 'Seni Tari berfokus pada pengembangan kemampuan gerak dan ekspresi seni anggota. Latihannya bertujuan meningkatkan teknik tari, kreativitas, serta pemahaman terhadap nilai budaya.',
  },
  {
    id: 17,
    name: 'Volly',
    category: 'Olahraga',
    logo: '/images/extracurricular-logos/17-volly.png',
    description: 'Voli menjadi wadah pengembangan keterampilan olahraga dan kebugaran siswa. Kegiatannya berfokus pada latihan teknik dasar, kekompakan tim, serta kesiapan menghadapi pertandingan.',
  },
]

export const extracurricularCategories: ExtracurricularCategory[] = [
  'Teknologi',
  'Seni',
  'Olahraga',
  'Organisasi & layanan',
]

export function getExtracurricularSlug(item: Pick<Extracurricular, 'id' | 'name'>) {
  const nameSlug = item.name
    .toLocaleLowerCase('id')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return `${item.id}-${nameSlug}`
}

export function getExtracurricularBySlug(slug: string | undefined) {
  const id = Number(slug?.match(/^\d+/)?.[0])
  return extracurriculars.find((item) => item.id === id)
}

export const extracurricularListSource = officialRoot
