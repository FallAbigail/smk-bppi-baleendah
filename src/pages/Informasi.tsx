import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Megaphone,
  Newspaper,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSiteContent } from '../contexts/SiteContentContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { AnnouncementCategory } from '../data/siteContent'
import { schoolProfile } from '../data/schoolProfile'
import { schoolNews } from '../data/schoolNews'

type DisplayItem = {
  id: string
  title: string
  body: string
  date: string
  image?: string
  sourceUrl?: string
}

const sections = [
  {
    id: 'berita',
    category: 'berita' as AnnouncementCategory,
    icon: Newspaper,
    title: 'Berita Sekolah',
    text: 'Berita dan kegiatan yang dipublikasikan oleh SMK BPPI Baleendah.',
  },
  {
    id: 'pengumuman',
    category: 'pengumuman' as AnnouncementCategory,
    icon: Megaphone,
    title: 'Pengumuman',
    text: 'Belum ada pengumuman aktif. Hubungi sekolah untuk memastikan informasi terbaru.',
  },
  {
    id: 'penerimaan',
    category: 'penerimaan' as AnnouncementCategory,
    icon: GraduationCap,
    title: 'PPDB SMK',
    text: 'Belum ada informasi penerimaan yang dipublikasikan. Hubungi sekolah untuk memastikan jadwal dan persyaratan terbaru.',
  },
  {
    id: 'kalender',
    icon: CalendarDays,
    title: 'Kalender Akademik',
    text: 'Kalender akademik belum tersedia di situs ini. Silakan konfirmasi jadwal langsung ke sekolah.',
  },
  {
    id: 'alumni',
    icon: UsersRound,
    title: 'Informasi Alumni',
    text: 'Informasi jejaring alumni akan ditambahkan setelah tersedia.',
  },
]

function formatDate(date: string, locale: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        parsed,
      )
}

export default function Informasi() {
  const { language, t } = useLanguage()
  const [expandedSection, setExpandedSection] = useState<string | null>('berita')
  usePageMeta(
    t('Informasi Sekolah'),
    t('Berita, pengumuman, kalender akademik, dan informasi alumni') + ` ${schoolProfile.name} ${schoolProfile.city}.`,
  )
  const { content } = useSiteContent()

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="max-w-2xl mb-10">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-3">
            {t('Pusat Informasi')}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('Informasi Sekolah')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('Pilih bagian untuk membuka berita dan informasi sekolah.')}
          </p>
        </header>

        <div className="space-y-4">
          {sections.map(({ id, category, icon: Icon, title, text }) => {
            const items: DisplayItem[] = category
              ? [
                  ...(category === 'berita' ? schoolNews : []),
                  ...content.announcements.filter(
                    (announcement) => announcement.category === category && announcement.published,
                  ),
                ].sort((a, b) => b.date.localeCompare(a.date))
              : []
            const isExpanded = expandedSection === id
            const headingId = `${id}-heading`
            const panelId = `${id}-panel`
            const triggerId = `${id}-trigger`

            return (
              <section
                key={id}
                id={id}
                className={[
                  'scroll-mt-24 rounded-2xl border border-gray-200',
                  'dark:border-gray-800 bg-white dark:bg-gray-900 p-6',
                  'sm:p-8',
                ].join(' ')}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center',
                      'justify-center rounded-xl bg-brand-50 text-brand-700',
                      'dark:bg-brand-950 dark:text-brand-400',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 id={headingId} className="min-w-0 flex-1">
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() => setExpandedSection(isExpanded ? null : id)}
                      className="flex w-full items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-bold text-gray-900 dark:text-white">
                          {t(title)}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                          {items.length > 0
                            ? `${items.length} ${t('informasi tersedia')}`
                            : t('Klik untuk melihat isi')}
                        </span>
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 dark:text-gray-400 ${isExpanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  </h2>
                </div>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  hidden={!isExpanded}
                  className="ml-14 mt-4 border-t border-gray-100 pt-4 dark:border-gray-800"
                >
                  {items.length > 0 ? (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <article
                          key={item.id}
                          className="border-t border-gray-100 pt-4 first:border-0 first:pt-0 dark:border-gray-800"
                        >
                          <div className={item.image ? 'grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]' : ''}>
                            {item.image && (
                              <img
                                src={item.image}
                                alt=""
                                loading="lazy"
                                className="aspect-[4/3] w-full rounded-lg object-cover sm:aspect-auto sm:h-28"
                              />
                            )}
                            <div>
                              <time
                                dateTime={item.date}
                                className="text-xs font-medium text-gray-500 dark:text-gray-400"
                              >
                                {formatDate(item.date, language === 'en' ? 'en-US' : 'id-ID')}
                              </time>
                              <h3 className="mt-1 font-semibold text-gray-900 dark:text-white">
                                {t(item.title)}
                              </h3>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                {t(item.body)}
                              </p>
                              {item.sourceUrl && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-2 inline-flex text-xs font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
                                >
                                  {t('Baca di situs resmi')}
                                </a>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {t(text)}
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-brand-950 p-6 sm:p-8 text-white">
          <h2 className="text-xl font-bold">{t('Perlu konfirmasi langsung?')}</h2>
          <p className="mt-2 text-sm text-brand-200">
            {t('Hubungi sekolah untuk mendapatkan informasi terbaru dan terverifikasi.')}
          </p>
          <Link
            to="/kontak"
            className={[
              'mt-5 inline-flex items-center gap-2 rounded-lg bg-white',
              'px-5 py-3 text-sm font-semibold text-brand-950',
              'hover:bg-brand-50',
            ].join(' ')}
          >
            {t('Hubungi Sekolah')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  )
}
