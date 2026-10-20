import { ArrowRight, ArrowUpRight, BookOpen, ClipboardList, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteContent } from '../../contexts/SiteContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { programLogoById } from '../../data/programLogos'

const schoolPhoto =
  'https://cdn-sdotid.adg.id/images/35c9da98-1c6c-4f3a-9e51-5093bd059cab_2847x2133.webp.jpeg'

const programAbbreviations: Record<string, string> = {
  'program-smk-akl': 'AKL',
  'program-smk-pplg': 'PPLG',
  'program-smk-tjkt': 'TJKT',
  'program-smk-acp': 'ACP',
}

const programCardPositions = [
  'left-0 top-0',
  'right-0 top-0',
  'bottom-0 left-0',
  'bottom-0 right-4 w-[calc(50%-1.375rem)] sm:right-0 sm:w-[calc(50%-0.375rem)]',
]

const ctaSteps = [
  { label: 'Pilih jurusan', href: '/program#smk', Icon: BookOpen },
  { label: 'Hubungi sekolah', href: '/kontak', Icon: MessageCircle },
  { label: 'Info PPDB', href: '/ppdb', Icon: ClipboardList },
]

export default function CTA() {
  const { content } = useSiteContent()
  const { t } = useLanguage()
  const programs = content.programs.filter((program) => program.level === 'smk')

  return (
    <section id="section-cta" className="bg-gray-50 py-20 dark:bg-gray-950 sm:py-24">
      <div className="mx-auto max-w-[86rem] px-5 xl:px-6">
        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6 xl:p-8">
          <div className="grid items-center gap-6 sm:gap-8 xl:grid-cols-[0.88fr_1.12fr] xl:gap-10">
            <div className="flex flex-col justify-center px-2 py-3 sm:px-4 xl:py-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
                {t('Penerimaan Siswa Baru')}
              </p>
              <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl xl:text-5xl">
                {t('Siap menentukan langkah berikutnya?')}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-gray-600 dark:text-gray-300">
                {t('Kenali program keahlian yang tersedia, lalu cari tahu proses pendaftarannya.')}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  to="/ppdb"
                  className="group inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                >
                  {t('Info PPDB')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <Link
                  to="/program#smk"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-800 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                >
                  {t('Lihat program keahlian')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </div>
              <div className="mt-8 border-t border-gray-200 pt-5 dark:border-gray-700">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  {t('Mulai dari sini')}
                </p>
                <ol className="grid grid-cols-3 gap-2 sm:gap-3">
                  {ctaSteps.map(({ label, href, Icon }) => (
                    <li key={label} className="min-w-0">
                      <Link
                        to={href}
                        className="group flex h-full min-w-0 items-start gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100 dark:bg-brand-900/50 dark:text-brand-300 dark:group-hover:bg-brand-900">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="pt-1 text-[10px] font-medium leading-snug text-gray-600 transition-colors group-hover:text-brand-800 dark:text-gray-300 dark:group-hover:text-brand-200 sm:text-xs">
                            {t(label)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <figure className="relative isolate aspect-square overflow-hidden rounded-[1.25rem] bg-gray-100 dark:bg-gray-800 sm:aspect-[16/10] xl:aspect-[1.45/1]">
              <img
                src={schoolPhoto}
                alt="Tampak depan gedung dan gerbang SMK BPPI Baleendah"
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-950/10 via-transparent to-gray-950/20" aria-hidden="true" />
              {programs.length > 0 && (
                <ul className="absolute inset-3 sm:inset-4" aria-label={t('Program Keahlian')}>
                  {programs.slice(0, 4).map((program, index) => {
                    const code = programAbbreviations[program.id] ?? t(program.title)
                    const logo = program.logo || programLogoById[program.id]

                    return (
                      <li
                        key={program.id}
                        className={`absolute w-[calc(50%-0.375rem)] ${programCardPositions[index]}`}
                      >
                        <Link
                          to={`/program/${program.id}`}
                          className="group relative block overflow-hidden rounded-2xl border border-white/90 bg-white/90 p-2.5 shadow-lg shadow-gray-950/10 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 dark:border-gray-700/90 dark:bg-gray-950/90 dark:hover:bg-gray-900 sm:p-3.5"
                        >
                          <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-brand-500/80" aria-hidden="true" />
                          <span className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              {logo && (
                                <span className="grid h-6 w-6 shrink-0 place-items-center overflow-hidden rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm sm:h-7 sm:w-7">
                                  <img
                                    src={logo}
                                    alt={`${t('Logo')} ${t(program.title)}`}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full w-full object-contain"
                                  />
                                </span>
                              )}
                              <span className="truncate rounded-full bg-brand-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-brand-800 dark:bg-brand-900/60 dark:text-brand-200 sm:px-2 sm:text-[9px]">
                                {code}
                              </span>
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-colors group-hover:text-brand-700 dark:text-gray-500 dark:group-hover:text-brand-300 sm:h-4 sm:w-4" aria-hidden="true" />
                          </span>
                          <span className="block line-clamp-3 text-[10px] font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand-800 dark:text-white dark:group-hover:text-brand-200 sm:line-clamp-2 sm:text-xs">
                            {t(program.title)}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
              <figcaption className="sr-only">{t('Program Keahlian')}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
