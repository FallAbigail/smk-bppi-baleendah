import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  extracurricularCategories,
  extracurricularListSource,
  extracurriculars,
  getExtracurricularSlug,
} from '../../data/extracurriculars'
import { categoryVisuals } from '../../data/extracurricularVisuals'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ExtracurricularDirectory({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const { t } = useLanguage()
  const Heading = headingLevel

  return (
    <section
      id="ekstrakurikuler"
      className="scroll-mt-24 bg-gray-50 py-16 dark:bg-gray-950 sm:py-20"
      aria-labelledby="extracurricular-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              {t('Ekstrakurikuler')}
            </p>
            <Heading id="extracurricular-heading" className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {t('Kegiatan di luar kelas')}
            </Heading>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('17 kegiatan yang tercantum pada daftar ekstrakurikuler resmi SMK BPPI Baleendah.')}
            </p>
          </div>
          <a
            href={extracurricularListSource}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
          >
            {t('Lihat daftar resmi')}
          </a>
        </header>

        <div className="space-y-10">
          {extracurricularCategories.map((category) => {
            const entries = extracurriculars.filter((item) => item.category === category)
            const categoryId = category.toLocaleLowerCase('id').replace(/[^a-z0-9]+/g, '-')
            const CategoryIcon = categoryVisuals[category].icon
            const categoryTone = categoryVisuals[category].tone
            const gridColumns = entries.length === 1
              ? 'grid max-w-md gap-4'
              : entries.length === 2
                ? 'grid gap-4 sm:grid-cols-2'
                : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'

            return (
              <section key={category} aria-labelledby={`extracurricular-${categoryId}`}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${categoryTone}`}>
                      <CategoryIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 id={`extracurricular-${categoryId}`} className="font-semibold text-gray-900 dark:text-white">
                      {t(category)}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                    {entries.length} {t('kegiatan')}
                  </span>
                </div>

                <ul className={gridColumns}>
                  {entries.map((item) => {
                    return (
                      <li key={item.id} className="h-full">
                        <Link
                          to={`/ekskul/${getExtracurricularSlug(item)}`}
                          className="group flex h-full min-h-52 flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-600"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-4">
                              <img
                                src={item.logo}
                                alt={`Logo ${t(item.name)}`}
                                className="h-16 w-16 shrink-0 object-contain"
                                loading="lazy"
                                decoding="async"
                              />
                              <div className="min-w-0">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {t(item.name)}
                                </h4>
                              </div>
                            </div>
                            <ArrowRight
                              className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-brand-700 dark:text-gray-500 dark:group-hover:text-brand-300"
                              aria-hidden="true"
                            />
                          </div>

                          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            {t(item.description)}
                          </p>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
