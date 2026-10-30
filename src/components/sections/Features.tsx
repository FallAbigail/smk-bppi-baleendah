import { useLanguage } from '../../contexts/LanguageContext'
import { Fingerprint, Projector, Wifi } from 'lucide-react'

const facilities = [
  {
    title: 'Laboratorium komputer',
    description: 'Ruang praktik komputer sekolah.',
    image: '/images/bppi/optimized/facilities/lab-komputer.webp',
  },
  {
    title: 'Perpustakaan',
    description: 'Koleksi bacaan dan referensi belajar.',
    image: '/images/bppi/optimized/facilities/perpustakaan.webp',
  },
  {
    title: 'Lapangan',
    description: 'Area kegiatan luar ruang dan olahraga.',
    image: '/images/bppi/optimized/facilities/lapangan.webp',
  },
  {
    title: 'Masjid',
    description: 'Fasilitas ibadah di lingkungan sekolah.',
    image: '/images/bppi/optimized/facilities/masjid.webp',
  },
  {
    title: 'Bank Mini SMK BPPI',
    description: 'Fasilitas praktik yang tercantum di galeri sekolah.',
    image: '/images/bppi/optimized/facilities/bank-mini-smk-bppi.webp',
  },
  {
    title: 'Rooftop',
    description: 'Area rooftop sekolah.',
    image: '/images/bppi/optimized/facilities/rooftop.webp',
  },
  {
    title: 'Absensi fingerprint',
    description: 'Sistem kehadiran berbasis sidik jari.',
    image: '/images/bppi/optimized/facilities/absensi-fingerprint.webp',
  },
]

const supportedFacilities = [
  { label: 'Wi-Fi di lingkungan sekolah', icon: Wifi },
  { label: 'Proyektor di setiap kelas', icon: Projector },
  { label: 'Absensi menggunakan fingerprint', icon: Fingerprint },
]

export default function Features() {
  const { t } = useLanguage()

  return (
    <section className="home-compact-section bg-gray-50 py-20 dark:bg-gray-950" aria-labelledby="facilities-heading">
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

        <ul className="home-mobile-rail facility-facts-rail mb-8 grid gap-3 sm:grid-cols-3" aria-label={t('Fasilitas pendukung')}>
          {supportedFacilities.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="facility-fact-card flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
                <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
              </span>
              <span>{t(label)}</span>
            </li>
          ))}
        </ul>

        <div className="home-mobile-rail facility-gallery-grid grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="region" aria-label={t('Galeri fasilitas sekolah')} tabIndex={0}>
          {facilities.map((facility) => (
            <figure key={facility.title} className="group relative isolate aspect-[3/4] overflow-hidden rounded-3xl bg-gray-900 shadow-sm transition-shadow hover:shadow-xl">
              <img
                src={facility.image}
                alt={t(facility.title)}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" aria-hidden="true" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-5">
                <h3 className="text-sm font-semibold leading-snug sm:text-lg">
                  {t(facility.title)}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/80 sm:text-sm">
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
