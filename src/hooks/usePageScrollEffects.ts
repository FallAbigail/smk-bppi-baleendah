import { useLayoutEffect, type RefObject } from 'react'

type Photo = { image: HTMLImageElement; mode?: string; value?: string; bleed?: string; active?: boolean }
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const PARALLAX_RATE = 0.22
const MIN_PARALLAX_SHIFT = 56
const MAX_PARALLAX_SHIFT = 112

/** Opt-in photography only: no animation styles on text, controls or section wrappers. */
export function usePageScrollEffects(pathname: string, enabled: boolean, progressRef: RefObject<HTMLDivElement>) {
  useLayoutEffect(() => {
    if (!enabled) return
    const mobile = window.matchMedia('(max-width: 1023px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const photos = new Map<HTMLElement, Photo>()
    const progress = progressRef.current
    let main: HTMLElement | null = null
    let frame = 0
    let disposed = false
    let previousProgress = '0'

    const reset = (host: HTMLElement, photo: Photo) => {
      host.removeAttribute('data-scroll-photo-mode')
      host.removeAttribute('data-scroll-photo-active')
      host.style.removeProperty('--photo-inset')
      photo.image.style.removeProperty('--photo-shift')
      photo.image.style.removeProperty('--photo-bleed')
      photo.mode = undefined
      photo.value = undefined
      photo.bleed = undefined
      photo.active = false
    }

    function draw() {
      frame = 0
      if (disposed) return
      const height = window.innerHeight
      const width = window.innerWidth
      const scrollRange = Math.max(0, document.documentElement.scrollHeight - height)
      const nextProgress = String(scrollRange ? clamp(window.scrollY / scrollRange) : 0)
      if (nextProgress !== previousProgress) {
        progress?.style.setProperty('--page-scroll-progress', nextProgress)
        previousProgress = nextProgress
      }

      // Read every frame's geometry before writing styles, avoiding layout thrashing.
      const updates = Array.from(photos, ([host, photo]) => ({ host, photo, bounds: host.getBoundingClientRect() }))
      for (const { host, photo, bounds } of updates) {
        if (reducedMotion.matches || !photo.image.complete || !photo.image.naturalWidth || !bounds.height || !bounds.width) {
          if (photo.mode) reset(host, photo)
          continue
        }
        if (bounds.right < 0 || bounds.left > width || bounds.bottom < -120 || bounds.top > height + 120) {
          if (photo.active) {
            host.removeAttribute('data-scroll-photo-active')
            photo.active = false
          }
          continue
        }
        const mode = mobile.matches ? 'reveal' : 'parallax'
        // A consistent relative scroll speed is more legible than a small fixed
        // offset spread over the entire viewport. Cap travel for smaller photos.
        const maxShift = clamp(bounds.height * 0.18, MIN_PARALLAX_SHIFT, MAX_PARALLAX_SHIFT)
        const value = mobile.matches
          ? `${((1 - clamp((height - bounds.top) / ((height + Math.min(bounds.height, height)) / 2))) * 34).toFixed(3)}%`
          : `${clamp((height / 2 - (bounds.top + bounds.height / 2)) * PARALLAX_RATE, -maxShift, maxShift).toFixed(3)}px`
        if (photo.mode !== mode) {
          reset(host, photo)
          host.dataset.scrollPhotoMode = mode
          photo.mode = mode
        }
        if (mode === 'parallax') {
          if (!photo.active) {
            host.setAttribute('data-scroll-photo-active', '')
            photo.active = true
          }
          // Overscan changes only when frame size changes, never with scroll.
          const bleed = `${Math.ceil(maxShift + 2)}px`
          if (photo.bleed !== bleed) {
            photo.image.style.setProperty('--photo-bleed', bleed)
            photo.bleed = bleed
          }
        }
        if (photo.value !== value) {
          if (mode === 'reveal') host.style.setProperty('--photo-inset', value)
          else photo.image.style.setProperty('--photo-shift', value)
          photo.value = value
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
      for (const [host, photo] of photos) {
        if (!main?.contains(host) || !host.contains(photo.image)) {
          reset(host, photo)
          photos.delete(host)
        }
      }
      main?.querySelectorAll<HTMLElement>('[data-scroll-photo]').forEach((host) => {
        if (photos.has(host)) return
        const image = host.querySelector<HTMLImageElement>('[data-scroll-photo-image]')
        if (image) photos.set(host, { image })
      })
      schedule()
    }

    const content = new MutationObserver(reconcile)
    content.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', schedule, { passive: true, capture: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('pageshow', reconcile)
    document.addEventListener('load', schedule, true)
    document.addEventListener('error', schedule, true)
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
      window.removeEventListener('resize', schedule)
      window.removeEventListener('pageshow', reconcile)
      document.removeEventListener('load', schedule, true)
      document.removeEventListener('error', schedule, true)
      mobile.removeEventListener('change', schedule)
      reducedMotion.removeEventListener('change', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      photos.forEach((photo, host) => reset(host, photo))
      progress?.style.removeProperty('--page-scroll-progress')
    }
  }, [pathname, enabled, progressRef])
}
