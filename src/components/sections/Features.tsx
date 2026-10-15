import { useLanguage } from '../../contexts/LanguageContext'

const facilities = [
  {
    title: 'Laboratorium komputer',
    description: 'Ruang praktik komputer sekolah.',
    image: '/images/bppi/lab-komputer.jpg',
  },
  {
    title: 'Perpustakaan',
    description: 'Koleksi bacaan dan referensi belajar.',
    image: '/images/bppi/perpustakaan.jpg',
  },
  {
    title: 'Lapangan',
    description: 'Area kegiatan luar ruang dan olahraga.',
    image: '/images/bppi/lapangan.jpg',
  },
  {
    title: 'Masjid',
    description: 'Fasilitas ibadah di lingkungan sekolah.',
    image: '/images/bppi/masjid.jpg',
  },
  {
    title: 'Bank Mini SMK BPPI',
    description: 'Fasilitas praktik yang tercantum di galeri sekolah.',
    image: '/images/bppi/bank-mini-smk-bppi.jpeg',
  },
  {
    title: 'Rooftop',
    description: 'Area rooftop sekolah.',
    image: '/images/bppi/rooftop.jpg',
  },
  {
    title: 'Absensi fingerprint',
    description: 'Sistem kehadiran berbasis sidik jari.',
    image: '/images/bppi/absensi-fingerprint.jpg',
  },
]

const supportedFacilities = [
  'Wi-Fi di lingkungan sekolah',
  'Proyektor di setiap kelas',
  'Absensi menggunakan fingerprint',
]

export default function Features() {
  const { t } = useLanguage()

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-950" aria-labelledby="facilities-heading">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            {t('Fasilitas')}
          </p>
          <h2 id="facilities-heading" className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {t('Fasilitas SMK BPPI Baleendah')}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {t('Ruang dan fasilitas yang tercantum pada galeri resmi sekolah.')}
          </p>
        </header>

        <ul className="mb-7 flex flex-wrap gap-x-6 gap-y-2 border-y border-gray-200 py-4 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
          {supportedFacilities.map((facility) => (
            <li key={facility} className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
              {t(facility)}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map((facility) => (
            <figure
              key={facility.title}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            >
              <img
                src={facility.image}
                alt={t(facility.title)}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                  {t(facility.title)}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-sm">
                  {t(facility.description)}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
