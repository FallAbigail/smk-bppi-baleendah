import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

type Category = 'Semua' | 'Literasi' | 'Pembiasaan' | 'Olahraga' | 'Prestasi' | 'Industri'

interface GalleryItem {
  id: number
  title: string
  category: Category
  image: string
  lightboxImage: string
  summary: string
  sourceUrl: string
}

const items: GalleryItem[] = [
  {
    id: 1,
    title: 'Gema Literasi setiap Rabu',
    category: 'Literasi',
    image: '/images/bppi/optimized/gallery/01-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/01-large.webp',
    summary: 'Siswa membaca bersama sebelum kegiatan belajar mengajar dimulai untuk membangun kebiasaan literasi.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/articles/1',
  },
  {
    id: 2,
    title: 'Jumat Bersih',
    category: 'Pembiasaan',
    image: '/images/bppi/optimized/gallery/02-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/02-large.webp',
    summary: 'Siswa bergotong royong membersihkan kelas sebelum kegiatan belajar mengajar.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/articles/4',
  },
  {
    id: 3,
    title: 'Senam Jumat',
    category: 'Olahraga',
    image: '/images/bppi/optimized/gallery/03-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/03-large.webp',
    summary: 'Senam pagi menjadi kegiatan rutin untuk mengawali aktivitas sekolah dengan gerak bersama.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/articles/3',
  },
  {
    id: 4,
    title: 'Jumat Berkah',
    category: 'Pembiasaan',
    image: '/images/bppi/optimized/gallery/04-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/04-large.webp',
    summary: 'Ibadah bersama dan siraman rohani membahas karakter, akhlak, etika kerja, serta integritas.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/articles/2',
  },
  {
    id: 5,
    title: 'Sekolah Pasar Modal',
    category: 'Literasi',
    image: '/images/bppi/optimized/gallery/05-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/05-large.webp',
    summary: 'Kegiatan literasi finansial Level 1, 2, dan lanjutan berlangsung di aula sekolah pada 20 Oktober 2025.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/6',
  },
  {
    id: 6,
    title: 'Prestasi Lomba Kompetensi Siswa',
    category: 'Prestasi',
    image: '/images/bppi/optimized/gallery/06-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/06-large.webp',
    summary: 'SMK BPPI meraih Juara 1 Web Technology dan Juara 3 IT Software Solution for Business di tingkat Kabupaten Bandung.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/4',
  },
  {
    id: 7,
    title: 'Sertifikasi perakitan laptop Axioo',
    category: 'Industri',
    image: '/images/bppi/optimized/gallery/07-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/07-large.webp',
    summary: 'Siswa kelas X Industri Axioo mengikuti sertifikasi perakitan laptop pada 22 Oktober 2024.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/3',
  },
  {
    id: 8,
    title: 'Kunjungan industri ke Otsuka dan BNET',
    category: 'Industri',
    image: '/images/bppi/optimized/gallery/08-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/08-large.webp',
    summary: 'Siswa mengamati proses kerja dan budaya industri secara langsung di PT Amerta Indah Otsuka dan BNET.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/2',
  },
  {
    id: 9,
    title: 'Teaching Factory bersama Cyberlabs',
    category: 'Industri',
    image: '/images/bppi/optimized/gallery/09-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/09-large.webp',
    summary: 'SMK BPPI dan Cyberlabs menyepakati tahapan pembentukan Teaching Factory berbasis kebutuhan industri.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/7',
  },
  {
    id: 10,
    title: 'Siswa PPLG terserap industri setelah PKL',
    category: 'Prestasi',
    image: '/images/bppi/optimized/gallery/10-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/10-large.webp',
    summary: 'Sejumlah siswa PPLG melanjutkan ke pekerjaan profesional, proyek freelance, dan magang setelah PKL.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/5',
  },
  {
    id: 11,
    title: 'Future-X Vol. 1: Job Fair & Expo University',
    category: 'Industri',
    image: '/images/bppi/optimized/gallery/11-card.webp',
    lightboxImage: '/images/bppi/optimized/gallery/11-large.webp',
    summary: 'Gelaran 2024 mempertemukan siswa dengan perusahaan dan kampus melalui job fair dan expo pendidikan.',
    sourceUrl: 'https://smk.sekolahbppi.sch.id/news/1',
  },
]

const categories: Category[] = ['Semua', 'Literasi', 'Pembiasaan', 'Olahraga', 'Prestasi', 'Industri']

const galleryTileLayout: Record<number, string> = {
  1: 'xl:col-span-2 xl:row-span-2',
  2: 'xl:row-span-1',
  3: 'xl:row-span-1',
  4: 'xl:col-span-2 xl:row-span-1',
  5: 'xl:row-span-2',
  6: 'xl:col-span-2 xl:row-span-1',
  7: 'xl:row-span-2',
  8: 'xl:col-span-2 xl:row-span-2',
  9: 'xl:row-span-1',
  10: 'xl:row-span-1',
  11: 'xl:col-span-2 xl:row-span-1',
}

export default function Gallery({
  headingLevel = 'h2',
  preview = false,
}: {
  headingLevel?: 'h1' | 'h2'
  preview?: boolean
}) {
  const Heading = headingLevel
  const { t } = useLanguage()
  const [active, setActive] = useState<Category>('Semua')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const filteredItems = active === 'Semua' ? items : items.filter((i) => i.category === active)
  const visibleItems = preview ? items.slice(0, 4) : filteredItems

  useEffect(() => {
    if (!lightbox) return

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightbox(null)
      } else if (event.key === 'Tab') {
        event.preventDefault()
        closeButtonRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [lightbox])

  return (
    <section className={`home-compact-section py-24 bg-gray-50 dark:bg-gray-950 ${preview ? 'gallery-preview-section' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-3">
              {t('Galeri')}
            </p>
            <Heading className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t('Kegiatan Siswa')}
            </Heading>
            {!preview && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t('Dokumentasi kegiatan yang dipublikasikan di situs resmi SMK BPPI Baleendah.')}
              </p>
            )}
          </div>
          <Link
            to="/galeri"
            className={[
              'inline-flex items-center gap-1.5 text-sm font-semibold',
              'text-brand-700 dark:text-brand-400 hover:text-brand-800',
              'dark:hover:text-brand-300 shrink-0',
            ].join(' ')}
          >
            {t('Lihat semua')} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {!preview && (
          <div className="mb-7 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                aria-pressed={active === cat}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active === cat
                    ? 'bg-brand-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {t(cat)}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <motion.div
          layout
          className={preview
            ? 'home-mobile-rail gallery-preview-rail grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-flow-dense xl:auto-rows-[14rem] xl:grid-cols-4'
            : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-flow-dense xl:auto-rows-[14rem] xl:grid-cols-4'}
          role={preview ? 'region' : undefined}
          aria-label={preview ? t('Galeri foto kegiatan siswa') : undefined}
          tabIndex={preview ? 0 : undefined}
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.015 }}
                onClick={() => setLightbox(item)}
                aria-label={`${t('Lihat foto kegiatan:')} ${t(item.title)}`}
                aria-haspopup="dialog"
                className={[
                  'group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl',
                  preview ? 'gallery-preview-card' : '',
                  'p-0 text-left bg-gray-200 dark:bg-gray-800',
                  'xl:h-full xl:aspect-auto',
                  'focus-visible:outline',
                  'focus-visible:outline-2 focus-visible:outline-offset-2',
                  'focus-visible:outline-brand-700',
                  galleryTileLayout[item.id] ?? '',
                ].join(' ')}
              >
                <img
                  src={item.image}
                  alt={t(item.title)}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="mb-1.5 inline-flex rounded-full border border-white/30 bg-black/25 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
                    {t(item.category)}
                  </span>
                  <p className="text-sm font-semibold leading-snug text-white sm:text-base">
                    {t(item.title)}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            role="presentation"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-sm w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="gallery-lightbox-title"
              tabIndex={-1}
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-900">
                <img
                  src={lightbox.lightboxImage}
                  alt={t(lightbox.title)}
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-400">
                  {t(lightbox.category)}
                </span>
                <h3
                  id="gallery-lightbox-title"
                  className="font-semibold text-gray-900 dark:text-white mt-1"
                >
                  {t(lightbox.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {t(lightbox.summary)}
                </p>
                <a
                  href={lightbox.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
                >
                  {t('Lihat sumber resmi')}
                </a>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setLightbox(null)}
                type="button"
                className={[
                  'absolute top-3 right-3 w-8 h-8 bg-black/20 rounded-full',
                  'flex items-center justify-center text-white',
                  'hover:bg-black/40 transition-colors',
                ].join(' ')}
                aria-label={t('Tutup')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
