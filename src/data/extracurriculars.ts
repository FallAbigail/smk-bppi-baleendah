export type ExtracurricularCategory = 'Teknologi' | 'Seni' | 'Olahraga' | 'Organisasi & layanan'

export interface Extracurricular {
  id: number
  name: string
  category: ExtracurricularCategory
  description: string
}

const officialRoot = 'https://smk.sekolahbppi.sch.id/ekskul'

export const extracurriculars: Extracurricular[] = [
  {
    id: 1,
    name: 'ANDRO-IT',
    category: 'Teknologi',
    description: 'Mencakup pemrograman, desain, robotik, dan multimedia; anggota berlatih kerja tim melalui proyek terstruktur.',
  },
  {
    id: 2,
    name: 'Band-SMK BPPI',
    category: 'Seni',
    description: 'Latihan alat musik, kekompakan kelompok, dan persiapan penampilan serta proyek musik.',
  },
  {
    id: 3,
    name: 'Basket',
    category: 'Olahraga',
    description: 'Mengembangkan teknik dan kondisi fisik, kerja sama tim, serta kesiapan bertanding.',
  },
  {
    id: 4,
    name: 'Badminton',
    category: 'Olahraga',
    description: 'Latihan terstruktur untuk mengasah teknik bulu tangkis, disiplin, dan sportivitas.',
  },
  {
    id: 5,
    name: 'Futsal',
    category: 'Olahraga',
    description: 'Mengasah kemampuan individu dan tim, kekompakan, serta mental bertanding.',
  },
  {
    id: 6,
    name: 'IRMA',
    category: 'Organisasi & layanan',
    description: 'Ikatan Remaja Masjid, organisasi yang berfokus pada pembinaan karakter dan keagamaan.',
  },
  {
    id: 7,
    name: 'JBM',
    category: 'Organisasi & layanan',
    description: 'Jurnalis BPPI Media: melatih keterampilan menulis, peliputan, dan pengelolaan konten media.',
  },
  {
    id: 8,
    name: 'Karate',
    category: 'Olahraga',
    description: 'Latihan bela diri untuk mengembangkan teknik, ketahanan fisik, disiplin, dan sportivitas.',
  },
  {
    id: 9,
    name: 'MuayThai',
    category: 'Olahraga',
    description: 'Latihan teknik dan kekuatan yang membina kemampuan fisik serta mental secara seimbang.',
  },
  {
    id: 10,
    name: 'OSIS',
    category: 'Organisasi & layanan',
    description: 'Wadah untuk melatih kepemimpinan, tanggung jawab, kerja sama, dan partisipasi siswa.',
  },
  {
    id: 11,
    name: 'Padus',
    category: 'Seni',
    description: 'Latihan paduan suara untuk meningkatkan kualitas vokal, disiplin, dan kerja sama tim.',
  },
  {
    id: 12,
    name: 'Paskibra',
    category: 'Organisasi & layanan',
    description: 'Latihan terarah untuk membangun disiplin, karakter, kerja sama, dan tanggung jawab.',
  },
  {
    id: 13,
    name: 'Pencak Silat',
    category: 'Olahraga',
    description: 'Latihan bela diri yang membina disiplin, mental kuat, dan sikap sportif.',
  },
  {
    id: 14,
    name: 'PMR',
    category: 'Organisasi & layanan',
    description: 'Pelatihan kesehatan dasar dan pertolongan pertama untuk membangun keterampilan serta kepedulian sosial.',
  },
  {
    id: 15,
    name: 'Pramuka',
    category: 'Organisasi & layanan',
    description: 'Kegiatan terarah untuk menumbuhkan kemandirian, disiplin, kepemimpinan, dan kepedulian sosial.',
  },
  {
    id: 16,
    name: 'Seni Tari',
    category: 'Seni',
    description: 'Latihan untuk mengembangkan teknik gerak, ekspresi, kreativitas, dan pemahaman nilai budaya.',
  },
  {
    id: 17,
    name: 'Volly',
    category: 'Olahraga',
    description: 'Latihan teknik dasar, kekompakan tim, kebugaran, dan kesiapan menghadapi pertandingan.',
  },
]

export const extracurricularCategories: ExtracurricularCategory[] = [
  'Teknologi',
  'Seni',
  'Olahraga',
  'Organisasi & layanan',
]

export function getExtracurricularSource(id: number) {
  return `${officialRoot}/${id}`
}

export const extracurricularListSource = officialRoot
