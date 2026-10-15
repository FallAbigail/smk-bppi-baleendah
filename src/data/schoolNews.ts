export interface SchoolNewsItem {
  id: string
  title: string
  body: string
  date: string
  image: string
  sourceUrl: string
}

const officialNewsRoot = 'https://smk.sekolahbppi.sch.id'

// Ringkasan berita yang dipublikasikan pada situs resmi SMK BPPI Baleendah.
export const schoolNews: SchoolNewsItem[] = [
  {
    id: 'bppi-cyberlabs-tefa',
    title: 'SMK BPPI dan Cyberlabs siapkan Teaching Factory',
    body: 'Sekolah dan Cyberlabs menyepakati tahapan pembentukan Teaching Factory selama satu tahun untuk mendekatkan pembelajaran teknologi dengan standar industri.',
    date: '2026-01-28',
    image: '/images/bppi/perkuat-pendidikan-vokasi-smk-bppi-baleendah-jalin-kerja-sama-strategis-dengan-cyberlabs-untuk-pembentukan-teaching-factory.jpg',
    sourceUrl: `${officialNewsRoot}/news/7`,
  },
  {
    id: 'bppi-pasar-modal',
    title: 'Sekolah Pasar Modal tingkatkan literasi finansial',
    body: 'Program Level 1, 2, dan lanjutan berlangsung di Aula Sekolah BPPI pada 20 Oktober 2025, dengan materi pasar modal dan investasi bersama narasumber BEI Jawa Barat dan KISI.',
    date: '2026-01-28',
    image: '/images/bppi/tingkatkan-literasi-finansial-smk-bppi-baleendah-gelar-sekolah-pasar-modal-level-1-2-dan-lanjutan.webp',
    sourceUrl: `${officialNewsRoot}/news/6`,
  },
  {
    id: 'bppi-lks',
    title: 'Siswa SMK BPPI raih juara LKS Kabupaten Bandung',
    body: 'Delegasi sekolah meraih Juara 1 bidang Web Technology dan Juara 3 bidang IT Software Solution for Business pada Lomba Kompetensi Siswa tingkat Kabupaten Bandung.',
    date: '2026-01-28',
    image: '/images/bppi/harumkan-nama-sekolah-siswa-smk-bppi-baleendah-raih-juara-di-lks-tingkat-kabupaten-bandung.jpg',
    sourceUrl: `${officialNewsRoot}/news/4`,
  },
  {
    id: 'bppi-pkl-pplg',
    title: 'Lulusan PPLG terserap industri setelah PKL',
    body: 'Laporan sekolah menyebut sejumlah siswa PPLG melanjutkan ke pekerjaan profesional, proyek freelance, dan program magang di perusahaan mitra setelah Praktik Kerja Lapangan.',
    date: '2026-01-28',
    image: '/images/bppi/bukti-kualitas-unggul-siswa-pplg-smk-bppi-baleendah-berhasil-terserap-industri-pasca-pkl.webp',
    sourceUrl: `${officialNewsRoot}/news/5`,
  },
  {
    id: 'bppi-axioo-sertifikasi',
    title: 'Siswa Axioo mengikuti sertifikasi perakitan laptop',
    body: 'Siswa kelas X Industri Axioo mengikuti sertifikasi perakitan laptop pada 22 Oktober 2024 sebagai bagian dari pembelajaran berbasis industri.',
    date: '2026-01-28',
    image: '/images/bppi/cetak-tenaga-terampil-siswa-kelas-industri-axioo-smk-bppi-baleendah-laksanakan-sertifikasi-perakitan-laptop.jpg',
    sourceUrl: `${officialNewsRoot}/news/3`,
  },
  {
    id: 'bppi-kunjungan-industri',
    title: 'Kunjungan industri ke PT Amerta Indah Otsuka dan BNET',
    body: 'Siswa berkunjung untuk melihat lingkungan kerja, proses industri, budaya disiplin, dan kolaborasi secara langsung.',
    date: '2026-01-28',
    image: '/images/bppi/perluas-wawasan-dunia-kerja-siswa-smk-bppi-baleendah-laksanakan-kunjungan-industri-ke-pt-amerta-indah-otsuka-dan-bnet.jpeg',
    sourceUrl: `${officialNewsRoot}/news/2`,
  },
  {
    id: 'bppi-future-x-2024',
    title: 'SMK BPPI Baleendah gelar Future-X 2024',
    body: 'Future-X Vol. 1 menggabungkan job fair dan expo universitas. Pengunjung mendapat wawasan persiapan kerja dan studi lanjut dari narasumber ITB dan IPB, serta dapat berkonsultasi dengan perusahaan dan perguruan tinggi peserta.',
    date: '2026-01-28',
    image: '/images/bppi/perkuat-sinergi-industri-dan-pendidikan-smk-bppi-baleendah-gelar-future-x-2024.jpg',
    sourceUrl: `${officialNewsRoot}/news/1`,
  },
]
