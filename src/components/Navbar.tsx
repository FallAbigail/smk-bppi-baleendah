import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type Lenis from 'lenis'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '../utils/cn'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { schoolProfile } from '../data/schoolProfile'
import {
  clearHomeWaveOpeningSkip,
  hasHomeWaveOpeningSkip,
  HERO_WAVE_EXIT_PROGRESS,
  HERO_WAVE_SETTLE_DELAY,
  HOME_NAVIGATION_EVENT,
  releaseHomeWaveSettlePauseSkip,
  shouldSkipHomeWaveSettlePause,
  skipHeroWaveOnNextHomeNavigation,
} from './sections/heroMotion'

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Program', href: '/program' },
  { label: 'Ekskul', href: '/ekskul' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Informasi', href: '/informasi' },
  { label: 'Kontak', href: '/kontak' },
]

function isNavLinkActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('Pilih bahasa')}
      className={cn(
        'inline-flex items-center rounded-lg border border-gray-200/80 dark:border-gray-700/80',
        'bg-transparent p-0.5',
        mobile ? 'self-end mx-4 my-2' : 'ml-1 shrink-0',
      )}
    >
      {(['id', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          aria-label={option === 'id' ? t('Bahasa Indonesia') : t('Bahasa Inggris')}
          aria-pressed={language === option}
          className={cn(
            'min-w-8 rounded-md px-2 py-1 text-xs font-semibold transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700',
            language === option
              ? 'bg-brand-700 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70',
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function Navbar({ lenisRef }: { lenisRef: RefObject<Lenis | null> }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [heroWaveFinished, setHeroWaveFinished] = useState(
    () => location.pathname !== '/' || hasHomeWaveOpeningSkip(),
  )
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { isDark, toggleTheme } = useTheme()
  const { t } = useLanguage()

  useLayoutEffect(() => {
    if (location.pathname !== '/') {
      clearHomeWaveOpeningSkip()
      setHeroWaveFinished(true)
      return
    }

    let waveStopTimer: number | undefined
    let waveStopMaxTimer: number | undefined
    let waveSettled = false
    let settlePauseActive = false
    const skipOpeningWave = hasHomeWaveOpeningSkip()
    let skipFirstSettlePause = shouldSkipHomeWaveSettlePause()
    let observedHomeTop = false

    const clearWaveStopTimer = () => {
      if (waveStopTimer !== undefined) window.clearTimeout(waveStopTimer)
      if (waveStopMaxTimer !== undefined) window.clearTimeout(waveStopMaxTimer)
      waveStopTimer = undefined
      waveStopMaxTimer = undefined
    }

    const extendWaveSettlePause = () => {
      if (!settlePauseActive) return
      if (waveStopTimer !== undefined) window.clearTimeout(waveStopTimer)
      waveStopTimer = window.setTimeout(resumeWaveSettlePause, HERO_WAVE_SETTLE_DELAY)
    }

    const resumeOnScrollKey = (event: KeyboardEvent) => {
      if (!settlePauseActive) return
      if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key) && event.code !== 'Space') return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('a, button, input, select, textarea, [contenteditable="true"]')) return
      resumeWaveSettlePause()
    }

    const resumeWaveSettlePause = () => {
      clearWaveStopTimer()
      if (!settlePauseActive) return
      settlePauseActive = false
      window.removeEventListener('keydown', resumeOnScrollKey)
      const lenis = lenisRef.current
      lenis?.off('virtual-scroll', extendWaveSettlePause)
      if (lenis?.isStopped) lenis.start()
    }

    const pauseAfterWaveReveal = (hero: HTMLElement) => {
      waveSettled = true

      const lenis = lenisRef.current
      const skipPause = skipFirstSettlePause || shouldSkipHomeWaveSettlePause()
      const shouldPause = Boolean(lenis && !lenis.isStopped && !skipPause)
      const scrollRoom = Math.max(0, hero.offsetHeight - window.innerHeight)
      const heroDocumentTop = window.scrollY + hero.getBoundingClientRect().top
      const waveExitScrollY = Math.max(
        0,
        heroDocumentTop + scrollRoom * HERO_WAVE_EXIT_PROGRESS + 2,
      )

      // Scroll positions can land on fractional CSS pixels. Snap slightly past
      // the threshold so rounding cannot leave the navbar hidden at wave end.
      // Pause briefly so the same wheel gesture cannot skip the hero resting view.
      if (shouldPause && lenis) {
        settlePauseActive = true
        lenis.on('virtual-scroll', extendWaveSettlePause)
        window.addEventListener('keydown', resumeOnScrollKey)
        lenis.stop()
      }

      if (lenis) {
        lenis.scrollTo(waveExitScrollY, { immediate: true, force: true })
      } else {
        window.scrollTo({ top: waveExitScrollY, left: 0, behavior: 'auto' })
      }

      setHeroWaveFinished(true)

      if (skipPause) {
        skipFirstSettlePause = false
        releaseHomeWaveSettlePauseSkip()
        return
      }

      if (shouldPause) {
        extendWaveSettlePause()
        waveStopMaxTimer = window.setTimeout(resumeWaveSettlePause, 450)
      }
    }

    const updateWaveState = () => {
      const hero = document.getElementById('section-hero')
      if (!hero) {
        resumeWaveSettlePause()
        setHeroWaveFinished(hasHomeWaveOpeningSkip())
        return
      }

      const scrollDistance = hero.offsetHeight - window.innerHeight
      const progress = scrollDistance > 0
        ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / scrollDistance))
        : 0
      const waveExitReached = progress >= HERO_WAVE_EXIT_PROGRESS - 0.003

      if (skipOpeningWave) {
        if (!waveExitReached) {
          if (window.scrollY <= 32) observedHomeTop = true
          resumeWaveSettlePause()
          waveSettled = true
          setHeroWaveFinished(true)
          return
        }

        // The first reading can still belong to the route we just left. Keep
        // the navbar visible until the home page has actually been seen at top.
        if (!observedHomeTop) {
          resumeWaveSettlePause()
          waveSettled = true
          setHeroWaveFinished(true)
          return
        }

        if (waveExitReached) {
          skipFirstSettlePause = false
          waveSettled = true
          setHeroWaveFinished(true)
          releaseHomeWaveSettlePauseSkip()
          return
        }
      }

      if (!waveExitReached) {
        resumeWaveSettlePause()
        waveSettled = false
        setHeroWaveFinished(false)
        return
      }

      if (waveSettled || settlePauseActive) return

      pauseAfterWaveReveal(hero)
    }

    updateWaveState()
    window.addEventListener('scroll', updateWaveState, { passive: true })
    window.addEventListener('resize', updateWaveState)

    return () => {
      resumeWaveSettlePause()
      clearWaveStopTimer()
      window.removeEventListener('scroll', updateWaveState)
      window.removeEventListener('resize', updateWaveState)
    }
  }, [location.pathname])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const themeLabel = t(isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap')

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return
    }

    if (location.pathname !== '/') {
      // Lenis persists between routes. Make sure no wave settle from the old
      // route can hold the first scroll on the home page.
      lenisRef.current?.start()
      skipHeroWaveOnNextHomeNavigation()
      return
    }

    window.dispatchEvent(new Event(HOME_NAVIGATION_EVENT))
  }

  return (
    <header
      aria-hidden={location.pathname === '/' && !heroWaveFinished}
      className={cn(
        'navbar-frame fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6',
        location.pathname === '/' && !heroWaveFinished && 'is-hero-hidden',
      )}
    >
      <div className="navbar-layout">
        <Link
          to="/"
          onClick={handleHomeClick}
          className="navbar-brand-panel"
          aria-label={`${schoolProfile.name} ${t(schoolProfile.city)}, ${t('Beranda').toLowerCase()}`}
        >
          <img
            src="/images/logo-smk-bppi.png"
            alt=""
            aria-hidden="true"
            className="navbar-brand-logo"
          />
          <span className="navbar-brand-copy leading-tight">
            <span className="navbar-brand-name block font-bold text-sm">
              {schoolProfile.name}
            </span>
            <span className="navbar-brand-city block text-xs">
              {t(schoolProfile.city)}
            </span>
          </span>
        </Link>

        <div className="navbar-menu">
          <div className="navbar-content px-2 sm:px-4 lg:px-4 xl:px-6">
            <div className="navbar-controls flex items-center justify-between h-14 md:h-16">
              <nav className="hidden lg:flex items-center gap-0.5" aria-label={t('Navigasi utama')}>
                {navLinks.map((link) => {
                  const active = isNavLinkActive(location.pathname, link.href)
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={link.href === '/' ? handleHomeClick : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'navbar-link px-1.5 py-2 text-sm font-medium transition-colors xl:px-3',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                        'focus-visible:outline-brand-700',
                        active
                          ? 'text-brand-900 dark:text-brand-200'
                          : [
                              'text-gray-900 dark:text-gray-100 hover:text-brand-700',
                              'dark:hover:text-brand-200',
                            ].join(' '),
                      )}
                    >
                      {t(link.label)}
                    </Link>
                  )
                })}
                <LanguageSwitcher />
              </nav>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    'text-brand-900 dark:text-brand-200 hover:bg-gray-100',
                    'dark:hover:bg-gray-800 transition-colors',
                  ].join(' ')}
                  aria-label={themeLabel}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Moon className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
                <Link
                  to="/ppdb"
                  aria-current={isNavLinkActive(location.pathname, '/ppdb') ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold',
                    'border-brand-300 bg-white text-brand-900 transition-colors',
                    'hover:bg-brand-50 focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-brand-700',
                    'dark:border-brand-700 dark:bg-gray-900 dark:text-brand-200 dark:hover:bg-gray-800',
                    isNavLinkActive(location.pathname, '/ppdb') &&
                      'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/70',
                  )}
                >
                  {t('PPDB')}
                </Link>
                <Link
                  to="/kontak"
                  aria-current={isNavLinkActive(location.pathname, '/kontak') ? 'page' : undefined}
                  className={[
                    'inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm',
                    'font-semibold text-white transition-colors hover:bg-brand-800',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2',
                    'focus-visible:outline-brand-700',
                  ].join(' ')}
                >
                  {t('Hubungi Sekolah')}
                </Link>
              </div>

              <div className="lg:hidden flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    'text-brand-900 dark:text-brand-200 hover:bg-gray-100',
                    'dark:hover:bg-gray-800 transition-colors',
                  ].join(' ')}
                  aria-label={themeLabel}
                >
                  {isDark ? (
                    <Sun className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Moon className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={() => setOpen((value) => !value)}
                  className={[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    'text-brand-900 dark:text-brand-200 hover:bg-gray-100',
                    'dark:hover:bg-gray-800 transition-colors',
                  ].join(' ')}
                  aria-label={t(open ? 'Tutup menu navigasi' : 'Buka menu navigasi')}
                  aria-expanded={open}
                  aria-controls="mobile-navigation"
                >
                  {open ? (
                    <X className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <nav
              id="mobile-navigation"
              className={cn(
                'navbar-mobile-nav lg:hidden border-t border-gray-100 dark:border-gray-800 py-3 flex-col gap-1',
                open ? 'flex' : 'hidden',
              )}
              aria-label={t('Navigasi utama')}
              hidden={!open}
            >
              {navLinks.map((link) => {
                const active = isNavLinkActive(location.pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(event) => {
                      if (link.href === '/') handleHomeClick(event)
                      setOpen(false)
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'navbar-link block px-4 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'text-brand-900 dark:text-brand-200'
                        : 'text-gray-900 dark:text-gray-100 hover:text-brand-700 dark:hover:text-brand-200',
                    )}
                  >
                    {t(link.label)}
                  </Link>
                )
              })}
              <LanguageSwitcher mobile />
              <div className="flex gap-2 px-4 pt-2">
                <Link
                  to="/ppdb"
                  onClick={() => setOpen(false)}
                  aria-current={isNavLinkActive(location.pathname, '/ppdb') ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border px-4 py-2',
                    'border-brand-300 bg-white text-center text-sm font-semibold text-brand-900',
                    'transition-colors hover:bg-brand-50 dark:border-brand-700 dark:bg-gray-900',
                    'dark:text-brand-200 dark:hover:bg-gray-800',
                    isNavLinkActive(location.pathname, '/ppdb') &&
                      'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/70',
                  )}
                >
                  {t('PPDB')}
                </Link>
                <Link
                  to="/kontak"
                  onClick={() => setOpen(false)}
                  className={[
                    'inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-brand-700 px-3 py-2',
                    'text-center text-sm font-semibold text-white transition-colors hover:bg-brand-800',
                  ].join(' ')}
                >
                  {t('Hubungi Sekolah')}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
