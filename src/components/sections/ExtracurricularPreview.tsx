import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { extracurriculars, getExtracurricularSlug } from '../../data/extracurriculars'

const featuredIds = [1, 2, 3]

const summaries: Record<number, string> = {
  1: 'Belajar pemrograman, desain, robotik, dan multimedia melalui proyek digital.',
  2: 'Mengasah kemampuan bermusik, kekompakan, dan pengalaman tampil bersama.',
  3: 'Melatih teknik dasar basket, kebugaran, dan kerja sama tim melalui latihan rutin.',
}

export default function ExtracurricularPreview() {
  const { t } = useLanguage()
  const featuredActivities = extracurriculars.filter((activity) => featuredIds.includes(activity.id))

  return (
    <section className="home-compact-section bg-gray-50 py-20 dark:bg-gray-950" aria-labelledby="home-extracurricular-heading">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
              {t('Kegiatan Siswa')}
            </p>
            <h2 id="home-extracurricular-heading" className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {t('Ekstrakurikuler')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('Temukan ruang untuk mengembangkan minat, bakat, dan kerja sama siswa.')}
            </p>
          </div>
          <Link
            to="/ekskul#ekstrakurikuler"
            className="inline-flex shrink-0 items-center gap-1.5 pb-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('Lihat semua')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <ul className="home-mobile-rail extracurricular-rail grid gap-5 md:grid-cols-3" aria-label={t('Kegiatan ekstrakurikuler')} tabIndex={0}>
          {featuredActivities.map((activity) => (
            <li key={activity.id} className="extracurricular-rail-card h-full">
              <Link
                to={`/ekskul/${getExtracurricularSlug(activity)}`}
                className="extracurricular-preview-card group flex h-full min-h-60 flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700"
              >
                <div className="relative flex justify-center">
                  <div className="extracurricular-logo flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gray-50 p-1.5 dark:bg-gray-950">
                    <img
                      src={activity.logo}
                      alt={`Logo ${t(activity.name)}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <ArrowRight
                    className="absolute right-0 top-2 h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-brand-700 dark:text-gray-500 dark:group-hover:text-brand-300"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-5 text-center text-xl font-semibold text-gray-900 dark:text-white">
                  {t(activity.name)}
                </h3>
                <p className="mt-2 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {t(summaries[activity.id] ?? activity.description)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
