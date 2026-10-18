import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getExtracurricularBySlug, getExtracurricularSlug, extracurriculars } from '../data/extracurriculars'
import { categoryVisuals } from '../data/extracurricularVisuals'
import { extracurricularArticles } from '../data/extracurricularArticles'
import { useLanguage } from '../contexts/LanguageContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import PinnedArticleHeading from '../components/scroll/PinnedArticleHeading'

export default function ExtracurricularArticle() {
  const { slug } = useParams()
  const item = getExtracurricularBySlug(slug)
  const { t } = useLanguage()
  const articleSectionRef = useRef<HTMLElement>(null)
  const article = item ? extracurricularArticles[item.id] : undefined
  const title = item ? t(item.name) : t('Ekstrakurikuler')
  const description = item ? t(item.description) : t('Kegiatan di luar kelas')
  usePageMeta(title, description)

  if (!item) {
    return (
      <main id="main-content" tabIndex={-1} className="bg-gray-50 px-6 pb-20 pt-32 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Ekstrakurikuler tidak ditemukan')}</h1>
          <Link to="/ekskul#ekstrakurikuler" className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-300">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('Kembali ke daftar ekstrakurikuler')}
          </Link>
        </div>
      </main>
    )
  }

  const visual = categoryVisuals[item.category]
  const relatedItems = [
    ...extracurriculars.filter((activity) => activity.id !== item.id && activity.category === item.category),
    ...extracurriculars.filter((activity) => activity.id !== item.id && activity.category !== item.category),
  ].slice(0, 3)
  return (
    <main id="main-content" tabIndex={-1} className="bg-gray-50 pb-20 pt-24 dark:bg-gray-950 sm:pt-28">
      <article className="mx-auto max-w-6xl px-6 lg:px-8">
        <nav aria-label={t('Lokasi halaman')} className="mb-7">
          <Link
            to="/ekskul#ekstrakurikuler"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-700 dark:text-gray-300 dark:hover:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('Kembali ke daftar ekstrakurikuler')}
          </Link>
        </nav>

        <header className="relative isolate overflow-hidden rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white">
          <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">
                {t('Ekstrakurikuler')} <span aria-hidden="true">·</span> {t(item.category)}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400">
                {schoolProfile.name} · {schoolProfile.city}
              </p>
            </div>

            <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-0 text-center">
              <img
                src={item.logo}
                alt={`Logo ${title}`}
                className="h-40 w-40 object-contain"
                decoding="async"
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t(item.category)}</span>
            </div>
          </div>
        </header>

        <div className="mt-7 grid gap-6 md:grid-cols-[minmax(0,1fr)_19rem]">
          <section className="rounded-3xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900 sm:p-9" aria-labelledby="activity-overview-heading">
            <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${visual.labelTone}`}>{t('Tentang kegiatan')}</p>
            <h2 id="activity-overview-heading" className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-4 text-base leading-8 text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </section>

          <aside className="rounded-3xl border border-gray-200 bg-white p-7 dark:border-gray-800 dark:bg-gray-900" aria-labelledby="activity-info-heading">
            <h2 id="activity-info-heading" className="text-lg font-bold text-gray-900 dark:text-white">
              {t('Informasi kegiatan')}
            </h2>
            <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('Bidang')}</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">{t(item.category)}</p>
            </div>
            <div className="mt-5 rounded-2xl bg-gray-50 p-4 dark:bg-gray-950">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('Jadwal dan pendaftaran')}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {t('Untuk informasi jadwal latihan dan pendaftaran, hubungi sekolah.')}
              </p>
              <Link to="/kontak" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200">
                {t('Hubungi Sekolah')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        {article && (
          <section ref={articleSectionRef} className="relative mt-12 grid gap-7 md:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)] md:gap-10" aria-labelledby="activity-article-heading">
            <PinnedArticleHeading sectionRef={articleSectionRef} className="self-start">
              <header className="bg-gray-50 dark:bg-gray-950">
                <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${visual.labelTone}`}>{t('Artikel Ekstrakurikuler')}</p>
                <h2 id="activity-article-heading" className="mt-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl">
                  {t(article.title)}
                </h2>
              </header>
            </PinnedArticleHeading>
            <article className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
              {article.sections.map((section, index) => (
                <section key={section.heading} className={index > 0 ? 'mt-7 border-t border-gray-100 pt-6 dark:border-gray-800' : ''}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(section.heading)}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
                    {t(section.body)}
                  </p>
                </section>
              ))}
            </article>
          </section>
        )}

        <section className="mt-12" aria-labelledby="related-activities-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-400">{t('Ekstrakurikuler')}</p>
              <h2 id="related-activities-heading" className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{t('Kegiatan lainnya')}</h2>
            </div>
            <Link to="/ekskul#ekstrakurikuler" className="hidden items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200 sm:inline-flex">
              {t('Lihat semua')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedItems.map((activity) => {
              return (
                <Link
                  key={activity.id}
                  to={`/ekskul/${getExtracurricularSlug(activity)}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-600"
                >
                  <span className="flex items-center gap-4">
                    <img
                      src={activity.logo}
                      alt={`Logo ${t(activity.name)}`}
                      className="h-16 w-16 shrink-0 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{t(activity.category)}</span>
                      <span className="mt-1 block font-semibold text-gray-900 dark:text-white">{t(activity.name)}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-700 dark:group-hover:text-brand-300" aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </article>
    </main>
  )
}
