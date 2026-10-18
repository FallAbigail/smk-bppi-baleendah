import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

type PinnedArticleHeadingProps = {
  sectionRef: RefObject<HTMLElement | null>
  children: ReactNode
  className?: string
}

const PIN_TRIGGER_TOP = 205

/** Keeps an article's left heading fixed while its article is being read. */
export default function PinnedArticleHeading({ sectionRef, children, className = '' }: PinnedArticleHeadingProps) {
  const placeholderRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const placeholder = placeholderRef.current
    const heading = headingRef.current
    if (!section || !placeholder || !heading) return

    const media = window.matchMedia('(min-width: 768px)')
    let frame = 0
    const title = heading.querySelector('h2')
    const articleLead = section.querySelector('article h3')

    const reset = () => {
      placeholder.style.height = ''
      heading.style.position = ''
      heading.style.top = ''
      heading.style.bottom = ''
      heading.style.left = ''
      heading.style.width = ''
      heading.style.zIndex = ''
      heading.style.visibility = ''
    }

    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (!media.matches) {
          reset()
          return
        }

        const sectionRect = section.getBoundingClientRect()
        const headingHeight = heading.offsetHeight
        const headingWidth = Number.parseFloat(getComputedStyle(section).gridTemplateColumns)
        const maxTop = Math.max(112, window.innerHeight - headingHeight - 24)
        const triggerTop = Math.max(112, Math.min(PIN_TRIGGER_TOP, maxTop))
        const titleOffset = title
          ? title.getBoundingClientRect().top - heading.getBoundingClientRect().top
          : 0
        const articleLeadOffset = articleLead
          ? articleLead.getBoundingClientRect().top - sectionRect.top
          : titleOffset
        const pinTop = Math.max(112, Math.min(triggerTop + articleLeadOffset - titleOffset, maxTop))

        if (sectionRect.top > triggerTop) {
          reset()
          return
        }

        heading.style.width = `${Number.isFinite(headingWidth) ? headingWidth : heading.offsetWidth}px`
        heading.style.zIndex = '20'
        placeholder.style.height = `${headingHeight}px`
        heading.style.bottom = 'auto'
        heading.style.visibility = 'visible'

        if (sectionRect.bottom > pinTop + headingHeight) {
          heading.style.position = 'fixed'
          heading.style.top = `${pinTop}px`
          heading.style.left = `${sectionRect.left}px`
          return
        }

        heading.style.position = 'absolute'
        heading.style.top = `${Math.max(0, section.offsetHeight - headingHeight)}px`
        heading.style.left = `${placeholder.getBoundingClientRect().left - sectionRect.left}px`
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    media.addEventListener('change', update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      media.removeEventListener('change', update)
      reset()
    }
  }, [sectionRef])

  return (
    <div ref={placeholderRef} className={className}>
      <div ref={headingRef}>{children}</div>
    </div>
  )
}
