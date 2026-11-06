import { useLayoutEffect } from 'react'

function getStaggerDelay(index: number, count: number, preserveHomeBehavior: boolean) {
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const reduceMotion = !preserveHomeBehavior && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const step = preserveHomeBehavior ? isMobile ? 72 : 84 : reduceMotion ? 160 : isMobile ? 240 : 280
  const limit = preserveHomeBehavior ? isMobile ? 360 : 420 : reduceMotion ? 800 : isMobile ? 960 : 1140
  const naturalDelay = index * step
  if (count <= 1 || naturalDelay <= limit) return naturalDelay
  return Math.round((index / (count - 1)) * limit)
}

function visibleChildren(element: HTMLElement) {
  return Array.from(element.children).filter((child): child is HTMLElement =>
    child instanceof HTMLElement &&
    !child.hasAttribute('data-reveal-ignore') &&
    child.style.opacity === '' &&
    child.style.transform === '' &&
    window.getComputedStyle(child).display !== 'none',
  )
}

function isStaggerGroup(element: HTMLElement) {
  const display = window.getComputedStyle(element).display
  return (
    display === 'grid' ||
    display === 'flex' ||
    element.tagName === 'UL' ||
    element.tagName === 'OL' ||
    Array.from(element.classList).some((name) => name.startsWith('space-y-') || name.startsWith('divide-y-'))
  )
}

function getRevealCandidates(container: HTMLElement) {
  let branch = container

  for (let depth = 0; depth < 4; depth += 1) {
    const children = visibleChildren(branch)
    if (children.length >= 2) {
      return children.flatMap((child) => {
        const groupItems = isStaggerGroup(child) ? visibleChildren(child) : []
        return groupItems.length > 1 ? groupItems : [child]
      })
    }
    if (children.length === 1 && children[0].children.length > 0) {
      branch = children[0]
      continue
    }
    return children
  }

  return visibleChildren(branch)
}

// Image-bearing cards reveal as one unit; images never receive their own animation.
function getRevealItems(container: HTMLElement, revealMediaCardsAsUnit: boolean) {
  const items = new Set<HTMLElement>()

  function collect(item: HTMLElement, depth = 0) {
    const containsMedia = item.matches('img, picture, video') || item.querySelector('img, picture, video')
    const isMediaCard = revealMediaCardsAsUnit && item.matches('article, [data-reveal-unit]')
    if (!containsMedia || isMediaCard) {
      items.add(item)
      return
    }

    if (depth >= 4 || item.matches('img, picture, video')) return
    getRevealCandidates(item).forEach((child) => collect(child, depth + 1))
  }

  getRevealCandidates(container).forEach((item) => collect(item))
  return [...items]
}

export function usePageReveal(pathname: string) {
  useLayoutEffect(() => {
    const preserveHomeBehavior = pathname === '/'
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (
      pathname.startsWith('/admin') ||
      typeof IntersectionObserver === 'undefined' ||
      (preserveHomeBehavior && reduceMotion)
    ) return

    let disposed = false
    let pageRoot: HTMLElement | null = null
    let sectionObserver: IntersectionObserver | null = null
    let contentObserver: MutationObserver | null = null
    let routeEntryRevealScheduled = false
    const revealFrames = new Set<number>()
    const revealTimers = new Set<number>()
    const preparedItems = new Set<HTMLElement>()
    const scheduledItems = new WeakSet<HTMLElement>()
    const observedSections = new WeakSet<HTMLElement>()
    const revealedSections = new WeakSet<HTMLElement>()
    const sectionItems = new WeakMap<HTMLElement, Set<HTMLElement>>()

    function revealItem(item: HTMLElement) {
      if (item.isConnected && item.hasAttribute('data-scroll-reveal')) item.classList.add('is-revealed')
    }

    function scheduleReveal(items: Iterable<HTMLElement>) {
      const newItems = [...items].filter((item) =>
        item.isConnected && item.hasAttribute('data-scroll-reveal') && !scheduledItems.has(item),
      )
      if (newItems.length === 0) return

      newItems.forEach((item) => scheduledItems.add(item))

      // Let the pending state reach a paint before toggling the revealed state.
      // A single rAF can run before the browser paints the new route, skipping the transition.
      const firstFrame = window.requestAnimationFrame(() => {
        revealFrames.delete(firstFrame)
        if (disposed) return

        const secondFrame = window.requestAnimationFrame(() => {
          revealFrames.delete(secondFrame)
          if (disposed) return
          newItems.forEach((item) => {
            const configuredDelay = Number.parseFloat(item.style.getPropertyValue('--scroll-reveal-delay'))
            const delay = Number.isFinite(configuredDelay) ? Math.max(0, configuredDelay) : 0
            item.style.removeProperty('--scroll-reveal-delay')

            if (delay === 0) {
              revealItem(item)
              return
            }

            const timer = window.setTimeout(() => {
              revealTimers.delete(timer)
              if (!disposed) revealItem(item)
            }, delay)
            revealTimers.add(timer)
          })
        })
        revealFrames.add(secondFrame)
      })
      revealFrames.add(firstFrame)
    }

    function clearRevealTransition(event: TransitionEvent) {
      const completedProperty = !preserveHomeBehavior && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'opacity'
        : 'transform'
      if (event.propertyName !== completedProperty) return
      const item = event.target instanceof HTMLElement ? event.target : null
      if (!item?.hasAttribute('data-scroll-reveal') || !item.classList.contains('is-revealed')) return

      item.removeAttribute('data-scroll-reveal')
      item.classList.remove('is-revealed')
      item.style.removeProperty('--scroll-reveal-delay')
      preparedItems.delete(item)
    }

    function scanPage() {
      if (!pageRoot?.isConnected) return
      const sections = Array.from(pageRoot.querySelectorAll<HTMLElement>('section'))
        .filter((section) => !section.closest('#section-hero'))
      const standaloneArticles = Array.from(pageRoot.querySelectorAll<HTMLElement>('article'))
        .filter((article) => !article.closest('section') && !article.parentElement?.closest('article'))
      const containers = [...sections, ...standaloneArticles]
      if (containers.length === 0) containers.push(pageRoot)

      const routeEntryItems = new Set<HTMLElement>()
      if (!routeEntryRevealScheduled) {
        containers.forEach((container) => {
          getRevealItems(container, !preserveHomeBehavior).forEach((item) => {
            if (preparedItems.has(item)) return
            const bounds = item.getBoundingClientRect()
            if (bounds.top < window.innerHeight && bounds.bottom > 0) routeEntryItems.add(item)
          })
        })
      }

      const routeEntryDelays = new Map(
        [...routeEntryItems].map((item, index) => [item, getStaggerDelay(index, routeEntryItems.size, preserveHomeBehavior)]),
      )

      containers.forEach((section) => {
        if (!observedSections.has(section)) {
          observedSections.add(section)
          sectionObserver?.observe(section)
        }

        const knownItems = sectionItems.get(section) ?? new Set<HTMLElement>()
        const items = getRevealItems(section, !preserveHomeBehavior)
        items.forEach((item, index) => {
          if (!knownItems.has(item)) {
            knownItems.add(item)
            if (!preparedItems.has(item)) {
              preparedItems.add(item)
              item.dataset.scrollReveal = 'pending'
              const delay = routeEntryDelays.get(item) ?? getStaggerDelay(index, items.length, preserveHomeBehavior)
              item.style.setProperty('--scroll-reveal-delay', `${delay}ms`)
            }
          }
        })
        sectionItems.set(section, knownItems)
        if (revealedSections.has(section)) {
          if (preserveHomeBehavior) items.forEach(revealItem)
          else scheduleReveal(items)
        }
      })

      if (routeEntryItems.size > 0) {
        routeEntryRevealScheduled = true
        if (preserveHomeBehavior) {
          const frame = window.requestAnimationFrame(() => {
            revealFrames.delete(frame)
            routeEntryItems.forEach(revealItem)
          })
          revealFrames.add(frame)
        } else {
          scheduleReveal(routeEntryItems)
        }
      }

    }

    function watchPageRoot() {
      if (disposed || pageRoot?.isConnected) return
      const candidate = document.getElementById('main-content') ?? document.querySelector<HTMLElement>('main')
      if (!candidate || candidate.getAttribute('aria-busy') === 'true' || candidate.getAttribute('role') === 'status') {
        return
      }

      pageRoot = candidate
      if (!preserveHomeBehavior) pageRoot.dataset.pageRevealMode = 'stagger'
      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const section = entry.target as HTMLElement
          revealedSections.add(section)
          const items = sectionItems.get(section) ?? new Set(getRevealItems(section, !preserveHomeBehavior))
          if (preserveHomeBehavior) items.forEach(revealItem)
          else scheduleReveal(items)
          sectionObserver?.unobserve(section)
        })
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

      contentObserver = new MutationObserver(scanPage)
      contentObserver.observe(pageRoot, { childList: true, subtree: true })
      pageRoot.addEventListener('focusin', revealFocusedItems)
      pageRoot.addEventListener('transitionend', clearRevealTransition)
      scanPage()
    }

    function revealFocusedItems(event: FocusEvent) {
      let element = event.target instanceof HTMLElement ? event.target : null
      while (element && pageRoot?.contains(element)) {
        if (element.hasAttribute('data-scroll-reveal')) {
          element.style.removeProperty('--scroll-reveal-delay')
          element.classList.add('is-revealed')
        }
        element = element.parentElement
      }
    }

    const rootObserver = new MutationObserver(() => {
      if (pageRoot && !pageRoot.isConnected) {
        contentObserver?.disconnect()
        sectionObserver?.disconnect()
        pageRoot.removeEventListener('focusin', revealFocusedItems)
        pageRoot.removeEventListener('transitionend', clearRevealTransition)
        pageRoot = null
        sectionObserver = null
        contentObserver = null
      }
      watchPageRoot()
    })
    rootObserver.observe(document.getElementById('root') ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-busy', 'role'],
    })
    watchPageRoot()

    return () => {
      disposed = true
      rootObserver.disconnect()
      contentObserver?.disconnect()
      sectionObserver?.disconnect()
      revealFrames.forEach(window.cancelAnimationFrame)
      revealTimers.forEach(window.clearTimeout)
      pageRoot?.removeEventListener('focusin', revealFocusedItems)
      pageRoot?.removeEventListener('transitionend', clearRevealTransition)
      pageRoot?.removeAttribute('data-page-reveal-mode')
      preparedItems.forEach((item) => {
        item.removeAttribute('data-scroll-reveal')
        item.classList.remove('is-revealed')
        item.style.removeProperty('--scroll-reveal-delay')
      })
    }
  }, [pathname])
}
