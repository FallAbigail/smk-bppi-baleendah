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
    let visible = false
    let lastPaintedScroll = Number.NaN
    let drag: { x: number; y: number; scroll: number; horizontal: boolean } | null = null

    const paint = (force = false, fractionalScroll = 0) => {
      const visualScroll = track.scrollLeft + fractionalScroll
      if (!force && visualScroll === lastPaintedScroll) return
      lastPaintedScroll = visualScroll
      const center = visualScroll + track.clientWidth / 2
      const baseWidth = figures[0]?.offsetWidth ?? 0
      if (!baseWidth) return

      const baseCenters = figures.map((card) => card.offsetLeft + card.offsetWidth / 2)
      let offsets = figures.map(() => 0)
      let states: { side: number; scale: number; rotation: number; visibleWidth: number }[] = []

      // Keep each rendered edge gap equal to the track gap while cards change
      // size. Translate offsets compensate for the width added or removed by
      // each neighboring pair; anchoring the visible cards prevents the row
      // from drifting as the carousel loops.
      for (let pass = 0; pass < 4; pass += 1) {
        states = baseCenters.map((baseCenter, index) => {
          const distance = baseCenter + offsets[index] - center
          const side = Math.max(-1, Math.min(1, distance / (track.clientWidth / 2)))
          const curve = Math.pow(Math.abs(side), 1.7)
          const scale = reduceMotion ? 1 : (0.68 + 0.62 * curve) * 1.15
          const rotation = reduceMotion ? 0 : -Math.sin(side * Math.PI / 2) * 36
          const visibleWidth = scale * Math.cos(rotation * Math.PI / 180)
          return { side, scale, rotation, visibleWidth }
        })

        const nextOffsets = figures.map(() => 0)
        for (let index = 1; index < figures.length; index += 1) {
          const pairWidth = (states[index - 1].visibleWidth + states[index].visibleWidth) / 2
          nextOffsets[index] = nextOffsets[index - 1] + (pairWidth - 1) * baseWidth
        }

        // Interpolate the anchor at the viewport center instead of averaging
        // a thresholded set of cards. The set changed abruptly as cards crossed
        // its bounds, shifting the whole row by a few pixels in one frame.
        let rightIndex = baseCenters.findIndex((x) => x >= center)
        if (rightIndex < 0) rightIndex = baseCenters.length - 1
        const leftIndex = Math.max(0, rightIndex - 1)
        const span = baseCenters[rightIndex] - baseCenters[leftIndex]
        const progress = span > 0
          ? Math.max(0, Math.min(1, (center - baseCenters[leftIndex]) / span))
          : 0
        const anchor = nextOffsets[leftIndex]
          + (nextOffsets[rightIndex] - nextOffsets[leftIndex]) * progress
        offsets = nextOffsets.map((offset) => offset - anchor)
      }

      figures.forEach((card, index) => {
        const { side, scale, rotation } = states[index]
        const verticalScale = reduceMotion
          ? 1
          : scale * Math.cos(rotation * Math.PI / 180)
        const horizontalOffset = offsets[index] - fractionalScroll
        card.style.setProperty('translate', reduceMotion ? 'none' : `${horizontalOffset}px 0px`)
        card.style.transform = reduceMotion
          ? 'none'
          : `perspective(900px) rotateY(${rotation}deg) scale(${scale}, ${verticalScale})`
        card.style.zIndex = String(Math.round(Math.abs(side) * 100))
      })
    }

    const wrap = (fractionalScroll = 0) => {
      if (!loopWidth) {
        paint(false, fractionalScroll)
        return
      }
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
      paint(false, fractionalScroll)
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
      paint(true)
    }

    const animate = (time: number) => {
      frame = 0
      if (!visible || drag || time < resumeAt) {
        previousTime = 0
        return
      }

      const elapsed = previousTime ? Math.min(time - previousTime, 40) : 0
      previousTime = time

      // Preserve subpixel motion between integer scrollLeft updates so even
      // browsers that quantize scrollLeft can animate at the display frame rate.
      pendingPixels += elapsed * 0.022
      const pixels = Math.floor(pendingPixels)
      pendingPixels -= pixels
      if (pixels > 0) track.scrollLeft += pixels
      wrap(pendingPixels)
      frame = requestAnimationFrame(animate)
    }

    const stopAnimation = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
    }
    const startAnimation = () => {
      if (reduceMotion || !visible || drag || frame || performance.now() < resumeAt) return
      frame = requestAnimationFrame(animate)
    }
    let resumeTimer = 0
    const pauseBriefly = () => {
      resumeAt = performance.now() + 2200
      stopAnimation()
      pendingPixels = 0
      paint(true)
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(startAnimation, 2200)
    }
    const focus = () => { pauseBriefly() }
    const onScroll = () => { wrap(pendingPixels) }
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
      wrap()
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
      wrap()
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
        paint(true)
        startAnimation()
      } else {
        stopAnimation()
      }
    })
    resize.observe(track)
    intersection.observe(track)
    track.addEventListener('scroll', onScroll)
    track.addEventListener('wheel', wheel, { passive: false })
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
      track.removeEventListener('scroll', onScroll)
      track.removeEventListener('wheel', wheel)
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
