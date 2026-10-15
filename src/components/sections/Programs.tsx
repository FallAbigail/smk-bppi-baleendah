import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  FlaskConical,
  Globe2,
  Leaf,
  Palette,
  BookA,
  type LucideIcon,
} from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useSiteContent } from '../../contexts/SiteContentContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { schoolProfile } from '../../data/schoolProfile'
import { programLogoById } from '../../data/programLogos'
import type { AcademicProgram, ProgramIcon } from '../../data/siteContent'

const programPresentation: Record<ProgramIcon, LucideIcon> = {
  science: FlaskConical,
  social: Globe2,
  technology: Code2,
  arts: Palette,
  language: BookA,
  environment: Leaf,
  business: BriefcaseBusiness,
}
const programIconStyle = 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400'

export default function Programs({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const Heading = headingLevel
  const { content } = useSiteContent()
  const { t } = useLanguage()
  const programs = content.programs.filter((program) => program.level === 'smk')

  return (
    <section ref={ref} id="smk" className="scroll-mt-28 bg-white py-24 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            {schoolProfile.name}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Heading className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                {t('Program Keahlian')}
              </Heading>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t('Kenali program keahlian yang tersedia di SMK BPPI Baleendah.')}
              </p>
            </div>
            {headingLevel !== 'h1' && (
              <Link
                to="/program"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {t('Lihat semua')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
          {!content.programsVerified && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('Hubungi sekolah untuk memastikan program yang tersedia.')}
            </p>
          )}
        </motion.div>

        {programs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                inView={inView}
                delay={index * 0.05}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {t('Belum ada program keahlian yang ditampilkan.')}
          </p>
        )}
      </div>
    </section>
  )
}

function ProgramCard({
  program,
  inView,
  delay,
}: {
  program: AcademicProgram
  inView: boolean
  delay: number
}) {
  const Icon = programPresentation[program.icon] ?? BookOpen
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const logo = programLogoById[program.id]

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
    >
      <div className="mb-3 flex items-center gap-3">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.26, delay }}
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-1.5 dark:border-gray-700"
        >
          {logo ? (
            <img src={logo} alt={`${t('Logo')} ${t(program.title)}`} loading="lazy" decoding="async" className="h-full w-full object-contain" />
          ) : (
            <span className={`flex h-full w-full items-center justify-center rounded-md ${programIconStyle}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
        </motion.div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{t(program.title)}</h3>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
        {t(program.description)}
      </p>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {t('Kompetensi keahlian')}
      </p>
      <ul className="flex flex-wrap gap-1.5" aria-label={t('Kompetensi keahlian')}>
        {program.highlights.map((item) => (
          <li
            key={item}
            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {t(item)}
          </li>
        ))}
      </ul>
    </motion.article>
  )
}
