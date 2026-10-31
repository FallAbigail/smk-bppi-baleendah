import { useLayoutEffect, type RefObject } from 'react'

type Reveal = { group: Element; order: number; animation?: Animation; done: boolean }
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const candidates = '[data-scroll-reveal-block], h1, h2, h3, p, article, li, form, dl, a'
const excluded = '#section-hero, [data-scroll-reveal-ignore], [data-scroll-section-ignore], dialog, [role="dialog"], [role="alert"], [role="status"], [aria-live], nav'

/** Once-only, staggered entrances. Default document styles always remain visible. */
export function usePageScrollEffects(pathname: string, enabled: boolean, progressRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    if (!enabled) return
    const mobile = window.matchMedia('(max-width: 1023px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reveals = new Map<HTMLElement, Reveal>()
    const groupStarts = new Map<Element, number>()
    const progress = progressRef.current
    let main: HTMLElement | null = null
    let frame = 0
    let disposed = false
    let previousProgress = ''

    function finish(host: HTMLElement, reveal: Reveal) {
      reveal.animation?.cancel()
      reveal.animation = undefined
      reveal.done = true
      host.dataset.scrollReveal = 'done'
      entrance?.unobserve(host)
    }

    function enter(entries: Pick<IntersectionObserverEntry, 'target' | 'isIntersecting' | 'boundingClientRect'>[]) {
      const entering: { host: HTMLElement; reveal: Reveal; opacity: number; translate: string; spatial: boolean }[] = []
      // Read the whole incoming batch before creating any animations.
      for (const entry of entries) {
        const host = entry.target as HTMLElement
        const reveal = reveals.get(host)
        if (!reveal || reveal.done) continue
        if (!entry.isIntersecting) {
          // A small entrance translation can cross the observer's inset.
          // Only finish an interrupted entrance once it leaves the real screen.
          if (reveal.animation && (entry.boundingClientRect.bottom < 0 || entry.boundingClientRect.top > window.innerHeight)) finish(host, reveal)
          continue
        }
        if (reveal.animation) continue
        if (reducedMotion.matches || document.hidden || entry.boundingClientRect.bottom <= 0) {
          finish(host, reveal)
          continue
        }
        const style = getComputedStyle(host)
        const interactive = host.matches('a, button, form') || Boolean(host.querySelector('a, button, input, select, textarea, iframe'))
        entering.push({ host, reveal, opacity: Number(style.opacity), translate: style.translate, spatial: !interactive && style.translate === 'none' })
      }
      const now = performance.now()
      entering.sort((a, b) => a.reveal.order - b.reveal.order).forEach(({ host, reveal, opacity, translate, spatial }) => {
        // Respect components which already own an entrance, plus keyboard and
        // pointer interaction. Controls fade without moving their hit targets.
        if (!opacity || host.contains(document.activeElement) || typeof host.animate !== 'function') {
          finish(host, reveal)
          return
        }
        const start = Math.min(now + 220, Math.max(now, (groupStarts.get(reveal.group) ?? now - 60) + 60))
        groupStarts.set(reveal.group, start)
        const animation = host.animate([
          { opacity: opacity * 0.18, translate: spatial ? `0 ${mobile.matches ? 12 : 18}px` : translate },
          { opacity, translate },
        ], {
          duration: mobile.matches ? 420 : 500,
          delay: start - now,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        })
        reveal.animation = animation
        host.dataset.scrollReveal = 'running'
        animation.onfinish = () => finish(host, reveal)
      })
    }

    const entrance = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(enter, { rootMargin: '0px 0px -6% 0px', threshold: 0 })

    function drawProgress() {
      frame = 0
      if (disposed) return
      const range = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const value = String(range ? clamp(window.scrollY / range) : 0)
      if (value !== previousProgress) {
        progress?.style.setProperty('--page-scroll-progress', value)
        previousProgress = value
      }
    }

    function schedule() {
      if (!disposed && !frame) frame = window.requestAnimationFrame(drawProgress)
    }

    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    resize?.observe(document.documentElement)
    resize?.observe(document.body)

    function reconcile() {
      if (disposed) return
      const candidate = document.getElementById('main-content')
      const ready = candidate?.getAttribute('aria-busy') !== 'true' ? candidate : null
      if (ready !== main) {
        if (main) resize?.unobserve(main)
        main = ready
        if (main) resize?.observe(main)
      }
      for (const [host, reveal] of reveals) {
        if (!main?.contains(host)) {
          reveal.animation?.cancel()
          entrance?.unobserve(host)
          host.removeAttribute('data-scroll-reveal')
          reveals.delete(host)
        }
      }
      const added: HTMLElement[] = []
      main?.querySelectorAll<HTMLElement>(candidates).forEach((host, order) => {
        if (reveals.has(host) || host.closest(excluded)) return
        const explicit = host.hasAttribute('data-scroll-reveal-block')
        // Keep long article/page wrappers open so their actual content can
        // enter in sequence. Do not split a card, list item or form internally.
        if (!explicit && host.matches('article') && host.querySelector('h1, section')) return
        if (!explicit && (host.closest('figure') || host.parentElement?.closest('button, a'))) return
        let parent = host.parentElement
        while (parent && parent !== main) {
          if (reveals.has(parent)) return
          parent = parent.parentElement
        }
        const reveal: Reveal = { group: host.closest('section') ?? main!, order, done: false }
        reveals.set(host, reveal)
        host.dataset.scrollReveal = 'pending'
        if (reducedMotion.matches || !entrance) finish(host, reveal)
        else {
          entrance.observe(host)
          added.push(host)
        }
      })
      // Seed visible route content before paint, avoiding a full-opacity flash
      // before the asynchronous intersection callback. Clipped rails use IO.
      enter(added.filter(host => !host.closest('.home-mobile-rail')).map(host => {
        const bounds = host.getBoundingClientRect()
        return { target: host, boundingClientRect: bounds, isIntersecting: bounds.width > 0 && bounds.height > 0 && bounds.top < window.innerHeight * 0.94 && bounds.bottom > 0 && bounds.right > 0 && bounds.left < window.innerWidth }
      }).filter(entry => entry.isIntersecting))
      schedule()
    }

    function revealFocused(event: Event) {
      const target = event.target
      if (!(target instanceof Element)) return
      for (const [host, reveal] of reveals) {
        if (!reveal.done && (host.contains(target) || (event.type === 'focusin' && target.contains(host)))) finish(host, reveal)
      }
    }

    function preferenceChanged() {
      if (reducedMotion.matches) reveals.forEach((reveal, host) => finish(host, reveal))
      schedule()
    }

    function visibilityChanged() {
      if (document.hidden) reveals.forEach((reveal, host) => { if (reveal.animation) finish(host, reveal) })
    }

    const content = new MutationObserver(reconcile)
    content.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('pageshow', reconcile)
    document.addEventListener('focusin', revealFocused)
    document.addEventListener('pointerdown', revealFocused, true)
    document.addEventListener('visibilitychange', visibilityChanged)
    reducedMotion.addEventListener('change', preferenceChanged)
    window.visualViewport?.addEventListener('resize', schedule)
    reconcile()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      entrance?.disconnect()
      content.disconnect()
      resize?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('pageshow', reconcile)
      document.removeEventListener('focusin', revealFocused)
      document.removeEventListener('pointerdown', revealFocused, true)
      document.removeEventListener('visibilitychange', visibilityChanged)
      reducedMotion.removeEventListener('change', preferenceChanged)
      window.visualViewport?.removeEventListener('resize', schedule)
      reveals.forEach((reveal, host) => {
        reveal.animation?.cancel()
        host.removeAttribute('data-scroll-reveal')
      })
      groupStarts.clear()
      progress?.style.removeProperty('--page-scroll-progress')
    }
  }, [pathname, enabled, progressRef])
}
