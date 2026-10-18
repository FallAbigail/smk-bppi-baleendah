import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSiteContent } from '../../contexts/SiteContentContext'

export default function CTA() {
  const { content } = useSiteContent()
  const { t } = useLanguage()
  const programs = content.programs.filter((program) => program.level === 'smk')

  return (
    <section id="section-cta" className="bg-gray-50 py-20 dark:bg-gray-950 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:p-12">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
              {t('Penerimaan Siswa Baru')}
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-4xl">
              {t('Siap menentukan langkah berikutnya?')}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              {t('Kenali program keahlian yang tersedia, lalu cari tahu proses pendaftarannya.')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/ppdb"
                className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                {t('Info PPDB')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <Link
                to="/program#smk"
                className="inline-flex min-h-12 items-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-100 dark:hover:border-brand-700 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-offset-gray-900"
              >
                {t('Lihat program keahlian')}
              </Link>
            </div>
          </div>

          <div className="lg:border-l lg:border-gray-200 lg:pl-9 dark:lg:border-gray-700">
            <div className="mb-2 flex items-center justify-between gap-4 border-b border-gray-200 pb-3 dark:border-gray-700">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                {t('Program Keahlian')}
              </h3>
              <Link
                to="/program#smk"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {t('Semua program')}
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {programs.map((program, index) => {
                const code = program.id.split('-').pop()?.toUpperCase() ?? ''

                return (
                  <li key={program.id}>
                    <Link
                      to={`/program/${program.id}`}
                      className="group flex items-center justify-between gap-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="w-8 shrink-0 text-xs font-semibold tabular-nums text-gray-400 dark:text-gray-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 transition-colors group-hover:text-brand-800 dark:text-white dark:group-hover:text-brand-300">
                            {t(program.title)}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{code}</span>
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-brand-700 dark:text-gray-500 dark:group-hover:text-brand-300" aria-hidden="true" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
