import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Code2,
  FlaskConical,
  Globe2,
  Leaf,
  Palette,
  BookA,
  Check,
  type LucideIcon,
} from 'lucide-react'
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
const programAbbreviations: Record<string, string> = {
  'program-smk-akl': 'AKL',
  'program-smk-pplg': 'PPLG',
  'program-smk-tjkt': 'TJKT',
  'program-smk-acp': 'ACP',
}

export default function Programs({
  headingLevel = 'h2',
  carousel = false,
}: {
  headingLevel?: 'h1' | 'h2'
  carousel?: boolean
}) {
  const Heading = headingLevel
  const { content } = useSiteContent()
  const { t } = useLanguage()
  const programs = content.programs.filter((program) => program.level === 'smk')
  const [activeProgramIndex, setActiveProgramIndex] = useState(0)
  const selectedProgramIndex = Math.min(activeProgramIndex, programs.length - 1)

  return (
    <section id="smk" className="scroll-mt-28 bg-gray-50 py-24 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10">
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
            <div className="flex flex-wrap items-end gap-4 sm:shrink-0">
              {carousel && programs.length > 0 && (
                <ProgramSelect
                  programs={programs}
                  selectedIndex={selectedProgramIndex}
                  onSelect={setActiveProgramIndex}
                />
              )}
              {headingLevel !== 'h1' && (
                <Link
                  to="/program"
                  className="inline-flex shrink-0 items-center gap-1.5 pb-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  {t('Lihat semua')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
          {!content.programsVerified && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('Hubungi sekolah untuk memastikan program yang tersedia.')}
            </p>
          )}
        </div>

        {carousel && programs.length > 0 ? (
          <ProgramCarousel
            programs={programs}
            activeIndex={selectedProgramIndex}
          />
        ) : programs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
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

function ProgramSelect({
  programs,
  selectedIndex,
  onSelect,
}: {
  programs: AcademicProgram[]
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listId = useId()
  const activeProgram = programs[selectedIndex]
  const activeAbbreviation = activeProgram
    ? programAbbreviations[activeProgram.id] ?? t(activeProgram.title)
    : ''
  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus())
    }
  }, [open])

  const closeAndFocusTrigger = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  const chooseProgram = (index: number) => {
    onSelect(index)
    closeAndFocusTrigger()
  }

  const focusOption = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, programs.length - 1))
    optionRefs.current[boundedIndex]?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor="home-program-select"
        className="absolute left-2.5 top-0 z-10 -translate-y-1/2 bg-gray-50 px-1 text-[10px] font-medium text-gray-500 dark:bg-gray-950 dark:text-gray-400"
      >
        {t('Pilih jurusan')}
      </label>
      <button
        ref={triggerRef}
        id="home-program-select"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            const nextIndex = event.key === 'ArrowDown'
              ? Math.min(selectedIndex, programs.length - 1)
              : Math.max(0, selectedIndex)
            requestAnimationFrame(() => optionRefs.current[nextIndex]?.focus())
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
        className="flex h-10 w-36 items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm font-medium text-gray-800 transition-colors hover:border-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-brand-500"
      >
        <span className="truncate">
          {activeProgram && `${String(selectedIndex + 1).padStart(2, '0')} · ${activeAbbreviation}`}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-150 dark:text-gray-400 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-3rem)] rounded-xl border border-gray-200 bg-white p-2 shadow-[0_12px_30px_rgba(25,47,67,0.14)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/30">
          <div id={listId} role="listbox" aria-label={t('Pilih jurusan')}>
            {programs.map((program, index) => {
              const isSelected = selectedIndex === index
              return (
                <button
                  key={program.id}
                  ref={(element) => { optionRefs.current[index] = element }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => chooseProgram(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      focusOption((index + 1) % programs.length)
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      focusOption((index - 1 + programs.length) % programs.length)
                    } else if (event.key === 'Escape') {
                      event.preventDefault()
                      closeAndFocusTrigger()
                    }
                  }}
                  className={`grid w-full grid-cols-[1.75rem_minmax(0,1fr)_1rem] items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${isSelected ? 'bg-brand-50 dark:bg-brand-950/60' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${isSelected ? 'bg-brand-700 text-white dark:bg-brand-500 dark:text-gray-950' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium leading-snug text-gray-800 dark:text-gray-100">
                      {t(program.title)}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-gray-500 dark:text-gray-400">
                      {programAbbreviations[program.id] ?? t(program.title)}
                    </span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-brand-700 dark:text-brand-300" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ProgramCarousel({
  programs,
  activeIndex,
}: {
  programs: AcademicProgram[]
  activeIndex: number
}) {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()
  const activeProgram = programs[activeIndex]
  const activeLogo = programLogoById[activeProgram.id]
  const activeProfile = activeProgram.description
  const ActiveIcon = programPresentation[activeProgram.icon] ?? BookOpen

  return (
    <div>
      <div className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={activeProgram.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          >
            <Link
              to={`/program/${encodeURIComponent(activeProgram.id)}`}
              className="group grid h-full min-h-[17.5rem] grid-cols-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[13.5rem_minmax(0,1fr)]"
            >
              <div className="flex min-h-48 items-center justify-center border-b border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800 sm:min-h-0 sm:border-b-0 sm:border-r">
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt={`${t('Logo')} ${t(activeProgram.title)}`}
                    className="h-36 w-36 object-contain sm:h-40 sm:w-40"
                    decoding="async"
                  />
                ) : (
                  <span className={`flex h-36 w-36 items-center justify-center rounded-md ${programIconStyle}`}>
                    <ActiveIcon className="h-12 w-12" aria-hidden="true" />
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-9">
                <h3 className="text-xl font-semibold leading-snug text-gray-900 dark:text-white sm:text-2xl">
                  {t(activeProgram.title)}
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
                  {t(activeProfile)}
                </p>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('Fokus pembelajaran')}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {activeProgram.highlights.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {t(item)}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {t('Pelajari program')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProgramCard({
  program,
}: {
  program: AcademicProgram
}) {
  const Icon = programPresentation[program.icon] ?? BookOpen
  const { t } = useLanguage()
  const logo = programLogoById[program.id]
  const profile = program.description

  return (
    <article
      className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-brand-700"
    >
      <Link
        to={`/program/${encodeURIComponent(program.id)}`}
        className="group grid h-full min-h-64 grid-cols-[6.5rem_minmax(0,1fr)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)]"
      >
        <div className="flex items-center justify-center border-r border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24 lg:h-32 lg:w-32">
            {logo ? (
              <img
                src={logo}
                alt={`${t('Logo')} ${t(program.title)}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className={`flex h-full w-full items-center justify-center rounded-md ${programIconStyle}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5 lg:p-6">
          <h3 className="text-base font-semibold leading-snug text-gray-900 dark:text-white sm:text-lg">
            {t(program.title)}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {t(profile)}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
            {t('Pelajari program')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}
