import { useLayoutEffect, type RefObject } from 'react'

type Photo = { image: HTMLImageElement; mode?: string; value?: string }
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

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

    const reset = (host: HTMLElement, photo: Photo) => {
      host.removeAttribute('data-scroll-photo-mode')
      host.style.removeProperty('--photo-inset')
      host.style.removeProperty('--photo-shift')
      photo.mode = undefined
      photo.value = undefined
    }

    function draw() {
      frame = 0
      if (disposed) return
      const height = window.innerHeight
      const width = window.innerWidth
      const scrollRange = Math.max(0, document.documentElement.scrollHeight - height)
      progress?.style.setProperty('--page-scroll-progress', String(scrollRange ? clamp(window.scrollY / scrollRange) : 0))

      // Read every frame's geometry before writing styles, avoiding layout thrashing.
      const updates = Array.from(photos, ([host, photo]) => ({ host, photo, bounds: host.getBoundingClientRect() }))
      for (const { host, photo, bounds } of updates) {
        if (reducedMotion.matches || !photo.image.complete || !photo.image.naturalWidth || !bounds.height || !bounds.width) {
          if (photo.mode) reset(host, photo)
          continue
        }
        if (bounds.right < 0 || bounds.left > width) continue
        const mode = mobile.matches ? 'reveal' : 'parallax'
        const value = mobile.matches
          ? `${((1 - clamp((height - bounds.top) / ((height + Math.min(bounds.height, height)) / 2))) * 34).toFixed(3)}%`
          : `${(clamp((height / 2 - (bounds.top + bounds.height / 2)) / ((height + bounds.height) / 2), -1, 1) * 24).toFixed(3)}px`
        if (photo.mode !== mode) {
          reset(host, photo)
          host.dataset.scrollPhotoMode = mode
          photo.mode = mode
        }
        if (photo.value !== value) {
          host.style.setProperty(mode === 'reveal' ? '--photo-inset' : '--photo-shift', value)
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
