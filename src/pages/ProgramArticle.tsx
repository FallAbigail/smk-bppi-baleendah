import { useRef } from 'react'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { programLogoById } from '../data/programLogos'
import { schoolProfile } from '../data/schoolProfile'
import { useSiteContent } from '../contexts/SiteContentContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { programArticles } from '../data/programArticles'
import PinnedArticleHeading from '../components/scroll/PinnedArticleHeading'

export default function ProgramArticle() {
  const { slug } = useParams()
  const { content } = useSiteContent()
  const { t } = useLanguage()
  const articleSectionRef = useRef<HTMLElement>(null)
  const program = content.programs.find((item) => item.level === 'smk' && item.id === slug)
  const article = program ? programArticles[program.id] : undefined
  const title = program ? t(program.title) : t('Program keahlian tidak ditemukan')
  const description = program ? t(program.description) : ''
  usePageMeta(title, description)

  if (!program) {
    return (
      <main id="main-content" tabIndex={-1} className="bg-gray-50 px-6 pb-20 pt-32 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('Program keahlian tidak ditemukan')}
          </h1>
          <Link
            to="/program#smk"
            className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('Kembali ke program keahlian')}
          </Link>
        </div>
      </main>
    )
  }

  const logo = programLogoById[program.id]
  const relatedPrograms = content.programs.filter(
    (item) => item.level === 'smk' && item.id !== program.id,
  )
  return (
    <main id="main-content" tabIndex={-1} className="bg-gray-50 pb-20 pt-24 dark:bg-gray-950 sm:pt-28">
      <article className="mx-auto max-w-6xl px-6 lg:px-8">
        <nav aria-label={t('Lokasi halaman')} className="mb-7">
          <Link
            to="/program#smk"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-brand-700 dark:text-gray-300 dark:hover:text-brand-300"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('Kembali ke program keahlian')}
          </Link>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <header className="grid gap-8 p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_13rem] md:items-center lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
                {schoolProfile.name} <span aria-hidden="true">·</span> {t('Program Keahlian')}
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
                {description}
              </p>
            </div>

            <div className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden p-4">
              {logo ? (
                <img
                  src={logo}
                  alt={`${t('Logo')} ${title}`}
                  className="h-full w-full object-contain"
                  decoding="async"
                />
              ) : (
                <BookOpen className="h-14 w-14 text-brand-700 dark:text-brand-300" aria-hidden="true" />
              )}
            </div>
          </header>

          <div className="grid gap-8 border-t border-gray-200 p-7 dark:border-gray-800 sm:p-10 md:grid-cols-[minmax(0,1fr)_18rem] lg:p-12">
            <section aria-labelledby="program-competencies-heading">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
                {t('Program Keahlian')}
              </p>
              <h2 id="program-competencies-heading" className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {t('Kompetensi yang dipelajari')}
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {program.highlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                    {t(item)}
                  </li>
                ))}
              </ul>
            </section>

            <aside className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('Informasi program')}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {schoolProfile.name} · {schoolProfile.city}
              </p>
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {t('Untuk bertanya tentang kurikulum dan pendaftaran program ini, hubungi sekolah.')}
              </p>
              <Link
                to="/kontak"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {t('Hubungi Sekolah')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </div>

        {article && (
          <section ref={articleSectionRef} className="relative mt-12 grid gap-7 md:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)] md:gap-10" aria-labelledby="program-article-heading">
            <PinnedArticleHeading sectionRef={articleSectionRef} className="self-start">
              <header className="bg-gray-50 dark:bg-gray-950">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
                  {t('Artikel Program Keahlian')}
                </p>
                <h2 id="program-article-heading" className="mt-2 text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl">
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

        {relatedPrograms.length > 0 && (
          <section className="mt-12" aria-labelledby="related-programs-heading">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
                {schoolProfile.name}
              </p>
              <h2 id="related-programs-heading" className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {t('Program lainnya')}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPrograms.map((item) => {
                const relatedLogo = programLogoById[item.id]

                return (
                  <Link
                    key={item.id}
                    to={`/program/${encodeURIComponent(item.id)}`}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-600"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden">
                      {relatedLogo ? (
                        <img
                          src={relatedLogo}
                          alt={`${t('Logo')} ${t(item.title)}`}
                          className="h-full w-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1 font-semibold text-gray-900 dark:text-white">
                      {t(item.title)}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
