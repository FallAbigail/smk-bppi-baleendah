import { useLayoutEffect, type RefObject } from 'react'

type Section = {
  originalTranslate: string
  originalOpacity: string
  shift: number
  revealed: boolean
  mode?: string
  opacity?: string
  maxShift: number
}
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

/** Move complete informational sections; never crop or transform their images. */
export function usePageScrollEffects(pathname: string, enabled: boolean, progressRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    if (!enabled) return
    const mobile = window.matchMedia('(max-width: 1023px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sections = new Map<HTMLElement, Section>()
    const progress = progressRef.current
    let main: HTMLElement | null = null
    let frame = 0
    let disposed = false
    let previousProgress = '0'

    const reset = (host: HTMLElement, section: Section) => {
      host.style.translate = section.originalTranslate
      host.style.opacity = section.originalOpacity
      host.removeAttribute('data-scroll-section-mode')
      section.shift = 0
      section.opacity = undefined
      section.mode = undefined
    }

    function draw() {
      frame = 0
      if (disposed) return
      const height = window.innerHeight
      const scrollRange = Math.max(0, document.documentElement.scrollHeight - height)
      const nextProgress = String(scrollRange ? clamp(window.scrollY / scrollRange) : 0)
      if (nextProgress !== previousProgress) {
        progress?.style.setProperty('--page-scroll-progress', nextProgress)
        previousProgress = nextProgress
      }
      // Geometry uses the unmoved position, so translation cannot feed back
      // into the next frame. Batch all reads before any style writes.
      const updates = Array.from(sections, ([host, section]) => ({ host, section, bounds: host.getBoundingClientRect() }))
      for (const { host, section, bounds } of updates) {
        if (reducedMotion.matches) {
          if (section.mode) reset(host, section)
          continue
        }
        const top = bounds.top - section.shift
        const mode = mobile.matches ? 'reveal' : 'parallax'
        if (section.mode !== mode) {
          reset(host, section)
          host.dataset.scrollSectionMode = mode
          section.mode = mode
        }
        if (!bounds.height || top > height + 100 || top + bounds.height < -100) continue

        // Keep a clicked control or focused input stationary while it is used.
        // Do not snap its position on focus: that can move a pointer target.
        const focused = document.activeElement
        if (focused instanceof HTMLElement && host.contains(focused) && focused.matches('input, textarea, select, [contenteditable="true"], :focus-visible')) {
          section.revealed = true
          if (section.opacity !== section.originalOpacity) {
            host.style.opacity = section.originalOpacity
            section.opacity = section.originalOpacity
          }
          continue
        }
        let shift: number
        let opacity = section.originalOpacity
        if (mobile.matches) {
          // Reveal once, before the section reaches the reading area. Returning
          // from another route or scrolling back up never hides its content.
          const entrance = clamp((height - top) / (height * 0.3))
          if (entrance >= 1) section.revealed = true
          const amount = section.revealed ? 1 : 1 - Math.pow(1 - entrance, 3)
          shift = Math.round((1 - amount) * 24)
          if (amount < 1) opacity = String(0.55 + amount * 0.45)
        } else {
          shift = Math.round(clamp((height * 0.4 - top) * 0.18, -section.maxShift, section.maxShift))
        }
        if (section.shift !== shift) {
          host.style.translate = shift ? `0 ${shift}px` : section.originalTranslate
          section.shift = shift
        }
        if (section.opacity !== opacity) {
          host.style.opacity = opacity
          section.opacity = opacity
        }
      }
    }

    function schedule() {
      if (!disposed && !frame) frame = window.requestAnimationFrame(draw)
    }

    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resize?.observe(document.documentElement)
    resize?.observe(document.body)

    function reconcile() {
      if (disposed) return
      const candidate = document.getElementById('main-content')
      if (candidate !== main) {
        if (main) resize?.unobserve(main)
        main = candidate
        if (main) resize?.observe(main)
      }
      for (const [host, section] of sections) {
        if (!main?.contains(host)) {
          reset(host, section)
          sections.delete(host)
        }
      }
      main?.querySelectorAll<HTMLElement>('section').forEach((host) => {
        const existing = sections.get(host)
        const padding = parseFloat(getComputedStyle(host).paddingTop)
        const maxShift = padding >= 48 ? Math.min(64, padding * 0.7) : 6
        if (existing) {
          existing.maxShift = maxShift
          return
        }
        if (host.hasAttribute('data-scroll-section-ignore') || host.id === 'section-hero' || host.closest('#section-hero')) return
        // A semantic parent section owns its entire content. Do not double
        // animate nested sections or operational registration/status forms.
        if (host.parentElement?.closest('section') || (host.querySelector('form') && !host.classList.contains('community-reviews'))) return
        sections.set(host, {
          originalTranslate: host.style.translate,
          originalOpacity: host.style.opacity,
          shift: 0,
          revealed: false,
          // Closely packed accordion cards retain their spacing.
          maxShift,
        })
      })
      schedule()
    }

    const content = new MutationObserver(reconcile)
    content.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.addEventListener('resize', reconcile)
    window.addEventListener('pageshow', reconcile)
    document.addEventListener('focusin', schedule)
    document.addEventListener('focusout', schedule)
    document.addEventListener('load', schedule, true)
    mobile.addEventListener('change', schedule)
    reducedMotion.addEventListener('change', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    progress?.style.setProperty('--page-scroll-progress', '0')
    reconcile()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      content.disconnect()
      resize?.disconnect()
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', reconcile)
      window.removeEventListener('pageshow', reconcile)
      document.removeEventListener('focusin', schedule)
      document.removeEventListener('focusout', schedule)
      document.removeEventListener('load', schedule, true)
      mobile.removeEventListener('change', schedule)
      reducedMotion.removeEventListener('change', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      sections.forEach((section, host) => reset(host, section))
      progress?.style.removeProperty('--page-scroll-progress')
    }
  }, [pathname, enabled, progressRef])
}
