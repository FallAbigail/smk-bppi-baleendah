import { useLayoutEffect } from 'react'

const STAGGER_STEP_MS = 72
const STAGGER_LIMIT_MS = 864

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

function getRevealItems(container: HTMLElement) {
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

export function usePageReveal(pathname: string) {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let frame = 0
    let waitingForRoot = false
    let pageRoot: HTMLElement | null = null
    let sectionObserver: IntersectionObserver | null = null
    let contentObserver: MutationObserver | null = null
    const revealTimers = new Set<number>()
    const observedSections = new WeakSet<HTMLElement>()
    const revealedSections = new WeakSet<HTMLElement>()
    const scheduledItems = new WeakSet<HTMLElement>()
    const sectionItems = new WeakMap<HTMLElement, Set<HTMLElement>>()

    function revealItem(item: HTMLElement, index: number) {
      if (item.classList.contains('is-revealed') || scheduledItems.has(item)) return
      scheduledItems.add(item)
      const delay = Math.min(index * STAGGER_STEP_MS, STAGGER_LIMIT_MS)
      const timer = window.setTimeout(() => {
        item.classList.add('is-revealed')
        scheduledItems.delete(item)
        revealTimers.delete(timer)
      }, delay)
      revealTimers.add(timer)
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
          item.dataset.scrollReveal = 'pending'
          item.style.setProperty('--scroll-reveal-delay', `${Math.min(index * STAGGER_STEP_MS, STAGGER_LIMIT_MS)}ms`)
        }
        if (revealedSections.has(section)) revealItem(item, index)
      })
      sectionItems.set(section, knownItems)
    }

    function scanPage() {
      if (!pageRoot?.isConnected) return
      const sections = Array.from(pageRoot.querySelectorAll<HTMLElement>('section'))
      const standaloneArticles = Array.from(pageRoot.querySelectorAll<HTMLElement>('article'))
        .filter((article) => !article.closest('section') && !article.parentElement?.closest('article'))
      const containers = [...sections, ...standaloneArticles]

      if (containers.length === 0) {
        prepareSection(pageRoot)
        return
      }

      containers.forEach(prepareSection)
    }

    function scheduleRootCheck() {
      if (disposed || waitingForRoot) return
      waitingForRoot = true
      frame = window.requestAnimationFrame(() => {
        waitingForRoot = false
        watchPageRoot()
      })
    }

    function watchPageRoot() {
      if (disposed || pageRoot?.isConnected) return
      const candidate = document.getElementById('main-content') ?? document.querySelector<HTMLElement>('main')
      if (!candidate || candidate.getAttribute('aria-busy') === 'true' || candidate.getAttribute('role') === 'status') {
        scheduleRootCheck()
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
      scanPage()
    }

    function revealFocusedItems(event: FocusEvent) {
      let element = event.target instanceof HTMLElement ? event.target : null
      while (element && pageRoot?.contains(element)) {
        if (element.hasAttribute('data-scroll-reveal')) {
          element.style.setProperty('--scroll-reveal-delay', '0ms')
          element.classList.add('is-revealed')
          scheduledItems.delete(element)
        }
        element = element.parentElement
      }
    }

    const rootObserver = new MutationObserver(() => {
      if (pageRoot?.isConnected) return
      contentObserver?.disconnect()
      sectionObserver?.disconnect()
      pageRoot = null
      sectionObserver = null
      contentObserver = null
      scheduleRootCheck()
    })
    rootObserver.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true })
    watchPageRoot()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      rootObserver.disconnect()
      contentObserver?.disconnect()
      sectionObserver?.disconnect()
      pageRoot?.removeEventListener('focusin', revealFocusedItems)
      revealTimers.forEach(window.clearTimeout)
    }
  }, [pathname])
}
