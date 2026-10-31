import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import type Lenis from 'lenis'
import { HOME_NAVIGATION_EVENT } from './sections/heroMotion'
import { useLanguage } from '../contexts/LanguageContext'

export function RouteScrollManager({ lenisRef }: { lenisRef: RefObject<Lenis | null> }) {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    const scrollHomeToTop = () => {
      const lenis = lenisRef.current
      if (lenis) {
        // A prior wave settle can leave the persistent Lenis instance stopped
        // while the route changes. Resume before resetting the new page.
        lenis.start()
        lenis.scrollTo(0, { immediate: true, force: true })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }
    }

    window.addEventListener(HOME_NAVIGATION_EVENT, scrollHomeToTop)
    return () => window.removeEventListener(HOME_NAVIGATION_EVENT, scrollHomeToTop)
  }, [lenisRef])

  useLayoutEffect(() => {
    if (hash) {
      let targetId = hash.slice(1)
      try {
        targetId = decodeURIComponent(targetId)
      } catch {
        // Keep the raw fragment when it is not valid percent-encoded text.
      }

      const scrollToTarget = () => {
        const target = document.getElementById(targetId)
        if (!target) return false

        if (lenisRef.current) {
          // CSS scroll-padding-top accounts for the fixed header.
          lenisRef.current.scrollTo(target)
        } else {
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
        }
        return true
      }

      if (scrollToTarget()) return

      // Lazy route chunks may render the anchor after the route change effect.
      const observer = new MutationObserver(() => {
        if (scrollToTarget()) {
          observer.disconnect()
          window.clearTimeout(timeout)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
      const timeout = window.setTimeout(() => observer.disconnect(), 5000)
      return () => {
        observer.disconnect()
        window.clearTimeout(timeout)
      }
    }

    const lenis = lenisRef.current
    if (lenis) {
      lenis.start()
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [pathname, hash, lenisRef])

  return null
}

export function ScrollToTopButton({ lenisRef }: { lenisRef: RefObject<Lenis | null> }) {
  const [visible, setVisible] = useState(false)
  const { pathname } = useLocation()
  const { t } = useLanguage()

  useEffect(() => {
    let focusFrame = 0
    const updateVisibility = () => {
      // Keep floating controls out of the way while a form is being read or filled.
      const formVisible = Array.from(document.querySelectorAll('main form')).some((form) => {
        const bounds = form.getBoundingClientRect()
        return bounds.height > 0 && bounds.bottom > 100 && bounds.top < window.innerHeight
      })
      setVisible(window.scrollY > 480 && !formVisible)
    }
    const updateAfterFocus = () => {
      cancelAnimationFrame(focusFrame)
      focusFrame = requestAnimationFrame(updateVisibility)
    }
    updateVisibility()
    window.addEventListener('scroll', updateVisibility, { passive: true })
    window.addEventListener('resize', updateVisibility)
    document.addEventListener('focusin', updateAfterFocus)
    document.addEventListener('focusout', updateAfterFocus)
    return () => {
      cancelAnimationFrame(focusFrame)
      window.removeEventListener('scroll', updateVisibility)
      window.removeEventListener('resize', updateVisibility)
      document.removeEventListener('focusin', updateAfterFocus)
      document.removeEventListener('focusout', updateAfterFocus)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo('top', { force: true })
        } else {
          const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
        }
      }}
      className={[
        'fixed bottom-5 right-5 z-40 inline-flex h-11 w-11',
        'items-center justify-center rounded-full bg-brand-700',
        'text-white shadow-lg transition hover:bg-brand-800',
        'focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-brand-700',
      ].join(' ')}
      aria-label={t('Kembali ke atas')}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
