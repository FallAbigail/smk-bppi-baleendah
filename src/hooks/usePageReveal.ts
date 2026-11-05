import { useLayoutEffect, useRef } from 'react'
import { hasHomeWaveOpeningSkip } from '../components/sections/heroMotion'

function getStaggerDelay(index: number, count: number) {
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const step = isMobile ? 72 : 84
  const limit = isMobile ? 360 : 420
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

// Images keep their original frame and receive no separate entrance effect.
function getRevealItems(container: HTMLElement) {
  const items = new Set<HTMLElement>()

  function collect(item: HTMLElement, depth = 0) {
    const containsMedia = item.matches('img, picture, video') || item.querySelector('img, picture, video')
    if (!containsMedia) {
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
  const previousPathname = useRef(pathname)

  useLayoutEffect(() => {
    const isRouteChange = previousPathname.current !== pathname
    previousPathname.current = pathname
    const revealHomeHero = isRouteChange && pathname === '/' && hasHomeWaveOpeningSkip()

    if (pathname.startsWith('/admin') || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let pageRoot: HTMLElement | null = null
    let sectionObserver: IntersectionObserver | null = null
    let contentObserver: MutationObserver | null = null
    const preparedItems = new Set<HTMLElement>()
    const observedSections = new WeakSet<HTMLElement>()
    const revealedSections = new WeakSet<HTMLElement>()
    const sectionItems = new WeakMap<HTMLElement, Set<HTMLElement>>()

    function revealItem(item: HTMLElement) {
      item.classList.add('is-revealed')
    }

    function clearRevealTransition(event: TransitionEvent) {
      if (event.propertyName !== 'transform') return
      const item = event.target instanceof HTMLElement ? event.target : null
      if (!item?.hasAttribute('data-scroll-reveal') || !item.classList.contains('is-revealed')) return

      item.removeAttribute('data-scroll-reveal')
      item.classList.remove('is-revealed')
      item.style.removeProperty('--scroll-reveal-delay')
      preparedItems.delete(item)
    }

    function prepareSection(section: HTMLElement) {
      if (!observedSections.has(section)) {
        observedSections.add(section)
        sectionObserver?.observe(section)
      }

      const knownItems = sectionItems.get(section) ?? new Set<HTMLElement>()
      const items = getRevealItems(section)
      items.forEach((item, index) => {
        if (!knownItems.has(item)) {
          knownItems.add(item)
          if (!preparedItems.has(item)) {
            preparedItems.add(item)
            item.dataset.scrollReveal = 'pending'
            item.style.setProperty('--scroll-reveal-delay', `${getStaggerDelay(index, items.length)}ms`)
          }
        }
        if (revealedSections.has(section)) revealItem(item)
      })
      sectionItems.set(section, knownItems)
    }

    function scanPage() {
      if (!pageRoot?.isConnected) return
      const sections = Array.from(pageRoot.querySelectorAll<HTMLElement>('section'))
        .filter((section) => section.id === 'section-hero'
          ? revealHomeHero
          : !section.closest('#section-hero'))
      const standaloneArticles = Array.from(pageRoot.querySelectorAll<HTMLElement>('article'))
        .filter((article) => !article.closest('section') && !article.parentElement?.closest('article'))
      const containers = [...sections, ...standaloneArticles]

      if (containers.length === 0) {
        prepareSection(pageRoot)
        return
      }

      containers.forEach(prepareSection)
    }

    function watchPageRoot() {
      if (disposed || pageRoot?.isConnected) return
      const candidate = document.getElementById('main-content') ?? document.querySelector<HTMLElement>('main')
      if (!candidate || candidate.getAttribute('aria-busy') === 'true' || candidate.getAttribute('role') === 'status') {
        return
      }

      pageRoot = candidate
      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const section = entry.target as HTMLElement
          revealedSections.add(section)
          getRevealItems(section).forEach(revealItem)
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
          element.style.setProperty('--scroll-reveal-delay', '0ms')
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
      pageRoot?.removeEventListener('focusin', revealFocusedItems)
      pageRoot?.removeEventListener('transitionend', clearRevealTransition)
      preparedItems.forEach((item) => {
        item.removeAttribute('data-scroll-reveal')
        item.classList.remove('is-revealed')
        item.style.removeProperty('--scroll-reveal-delay')
      })
    }
  }, [pathname])
}
