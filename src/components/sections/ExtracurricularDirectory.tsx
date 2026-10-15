import {
  extracurricularCategories,
  extracurricularListSource,
  extracurriculars,
  getExtracurricularSource,
} from '../../data/extracurriculars'
import { useLanguage } from '../../contexts/LanguageContext'

export default function ExtracurricularDirectory() {
  const { t } = useLanguage()

  return (
    <section
      id="ekstrakurikuler"
      className="scroll-mt-24 bg-gray-50 py-16 dark:bg-gray-950 sm:py-20"
      aria-labelledby="extracurricular-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              {t('Ekstrakurikuler')}
            </p>
            <h2 id="extracurricular-heading" className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {t('Kegiatan di luar kelas')}
            </h2>
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

        <div className="space-y-8">
          {extracurricularCategories.map((category) => {
            const entries = extracurriculars.filter((item) => item.category === category)
            const categoryId = category.toLocaleLowerCase('id').replace(/[^a-z0-9]+/g, '-')

            return (
              <section key={category} aria-labelledby={`extracurricular-${categoryId}`}>
                <div className="mb-2 flex items-baseline justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
                  <h3 id={`extracurricular-${categoryId}`} className="font-semibold text-gray-900 dark:text-white">
                    {t(category)}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {entries.length} {t('kegiatan')}
                  </span>
                </div>
                <ul className="grid gap-x-8 sm:grid-cols-2">
                  {entries.map((item) => (
                    <li key={item.id} className="border-b border-gray-200 py-3 dark:border-gray-800">
                      <a
                        href={getExtracurricularSource(item.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-gray-900 underline-offset-4 hover:underline dark:text-white"
                      >
                        {t(item.name)}
                      </a>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {t(item.description)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
