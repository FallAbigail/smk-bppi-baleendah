import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { heroFacilities } from '../../data/heroFacilities'
import { useLanguage } from '../../contexts/LanguageContext'

export default function HeroFacilities() {
  const { t } = useLanguage()
  const trackRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [repetitions, setRepetitions] = useState(1)
  // Each repeated group must cover the viewport before it can wrap safely.
  const group = Array.from({ length: repetitions }, () => heroFacilities).flat()
  // Two identical cycles are enough to wrap safely. A third copy only adds
  // off-screen DOM nodes and per-card work to the animation loop.
  const cards = [...group, ...group]
  const groupLength = heroFacilities.length * repetitions

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const figures = Array.from(track.querySelectorAll<HTMLElement>('figure'))
    let loopWidth = 0
    let frame = 0
    let previousTime = 0
    let pendingPixels = 0
    let resumeAt = 0
    let hovered = false
    let visible = false
    let drag: { x: number; y: number; scroll: number; horizontal: boolean } | null = null

    const paint = () => {
      const center = track.scrollLeft + track.clientWidth / 2
      figures.forEach((card) => {
        const distance = card.offsetLeft + card.offsetWidth / 2 - center
        const side = Math.max(-1, Math.min(1, distance / (track.clientWidth / 2)))
        // The reference is a concave arc: small in the middle, large at
        // both edges. Keep the horizontal positions evenly spaced.
        const scale = 0.86 + 0.46 * Math.pow(Math.abs(side), 1.6)
        const rotation = -side * 35

        card.style.transform = reduceMotion
          ? 'none'
          : `perspective(900px) rotateY(${rotation}deg) scale(${scale})`
        card.style.zIndex = String(Math.round(Math.abs(side) * 100))
      })
    }

    const wrap = () => {
      if (!loopWidth) return
      let shift = 0
      const scrollRoom = Math.max(0, loopWidth - track.clientWidth)
      const margin = scrollRoom / 4
      const maxScroll = track.scrollWidth - track.clientWidth
      if (track.scrollLeft < margin) shift = loopWidth
      if (track.scrollLeft > maxScroll - margin) shift = -loopWidth
      if (shift) {
        track.scrollLeft += shift
        if (drag) drag.scroll += shift
      }
      paint()
    }

    const measure = () => {
      const cycleWidth = figures[heroFacilities.length].offsetLeft - figures[0].offsetLeft
      const required = Math.max(1, Math.ceil(
        (track.clientWidth + figures[0].offsetWidth * 2) / cycleWidth,
      ))
      if (required !== repetitions) {
        setRepetitions(required)
        return
      }

      loopWidth = figures[groupLength].offsetLeft - figures[0].offsetLeft
      const maxPhase = Math.max(0, loopWidth - track.clientWidth - 1)
      const phase = Math.min(track.scrollLeft % cycleWidth, maxPhase)
      track.scrollLeft = loopWidth + phase
      paint()
    }

    const animate = (time: number) => {
      frame = 0
      if (!visible || hovered || drag || time < resumeAt) {
        previousTime = 0
        return
      }

      const elapsed = previousTime ? Math.min(time - previousTime, 40) : 0
      previousTime = time

      // 22 pixels per second: a gentle, steady right-to-left movement.
      // The scroll event paints the cards, so don't repaint the full track here.
      pendingPixels += elapsed * 0.022
      const pixels = Math.floor(pendingPixels)
      pendingPixels -= pixels
      if (pixels > 0) track.scrollLeft += pixels
      frame = requestAnimationFrame(animate)
    }

    const stopAnimation = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
    }
    const startAnimation = () => {
      if (reduceMotion || !visible || hovered || drag || frame || performance.now() < resumeAt) return
      frame = requestAnimationFrame(animate)
    }
    let resumeTimer = 0
    const pauseBriefly = () => {
      resumeAt = performance.now() + 2200
      stopAnimation()
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(startAnimation, 2200)
    }
    const enter = () => {
      hovered = true
      stopAnimation()
    }
    const leave = () => {
      hovered = false
      startAnimation()
    }
    const focus = () => { pauseBriefly() }
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      const horizontal = Math.abs(event.deltaX) >= 2
        && Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      // Leave vertical gestures to the page and Lenis.
      if (!horizontal && !event.shiftKey) return

      event.preventDefault()
      event.stopPropagation()
      pauseBriefly()
      const delta = horizontal ? event.deltaX : event.deltaY
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1
      track.scrollLeft += Math.max(-80, Math.min(80, delta * unit * 0.75))
    }
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      pauseBriefly()
      const mouse = event.pointerType === 'mouse'
      drag = {
        x: event.clientX,
        y: event.clientY,
        scroll: track.scrollLeft,
        horizontal: mouse,
      }
      if (mouse) {
        event.preventDefault()
        track.setPointerCapture(event.pointerId)
        track.classList.add('is-dragging')
      }
    }
    const move = (event: PointerEvent) => {
      if (!drag) return
      const deltaX = event.clientX - drag.x
      const deltaY = event.clientY - drag.y
      if (!drag.horizontal) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 6) return
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          drag = null
          return
        }
        drag.horizontal = true
        track.setPointerCapture(event.pointerId)
        track.classList.add('is-dragging')
      }
      event.preventDefault()
      track.scrollLeft = drag.scroll - deltaX
    }
    const up = (event: PointerEvent) => {
      drag = null
      if (track.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId)
      }
      track.classList.remove('is-dragging')
      pauseBriefly()
    }

    const resize = new ResizeObserver(measure)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) {
        paint()
        startAnimation()
      } else {
        stopAnimation()
      }
    })
    resize.observe(track)
    intersection.observe(track)
    track.addEventListener('scroll', wrap)
    track.addEventListener('wheel', wheel, { passive: false })
    track.addEventListener('mouseenter', enter)
    track.addEventListener('mouseleave', leave)
    track.addEventListener('focusin', focus)
    track.addEventListener('pointerdown', down)
    track.addEventListener('pointermove', move)
    track.addEventListener('pointerup', up)
    track.addEventListener('pointercancel', up)
    track.addEventListener('lostpointercapture', up)
    measure()
    startAnimation()

    return () => {
      stopAnimation()
      window.clearTimeout(resumeTimer)
      resize.disconnect()
      intersection.disconnect()
      track.removeEventListener('scroll', wrap)
      track.removeEventListener('wheel', wheel)
      track.removeEventListener('mouseenter', enter)
      track.removeEventListener('mouseleave', leave)
      track.removeEventListener('focusin', focus)
      track.removeEventListener('pointerdown', down)
      track.removeEventListener('pointermove', move)
      track.removeEventListener('pointerup', up)
      track.removeEventListener('pointercancel', up)
      track.removeEventListener('lostpointercapture', up)
    }
  }, [reduceMotion, repetitions, groupLength])

  return (
    <section className="hero-facilities" aria-label={t('Preview fasilitas sekolah')}>
      <div className="hero-facilities-heading">
        <p>{t('Fasilitas:')}</p>
      </div>
      <div
        ref={trackRef}
        id="hero-facilities-track"
        className="hero-facilities-track"
        tabIndex={0}
        role="region"
        aria-label={t('Galeri foto fasilitas sekolah')}
        data-lenis-prevent-horizontal
      >
        {cards.map((facility, index) => (
          <figure
            key={`${facility.name}-${index}`}
            className="hero-facility-card"
            aria-hidden={index < groupLength || index >= groupLength + heroFacilities.length}
          >
            <img
              src={facility.image}
              alt={`${t('Foto')} ${t(facility.name).toLowerCase()}`}
              width={600}
              height={450}
              loading="eager"
              draggable={false}
            />
            <figcaption>{t(facility.name)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
