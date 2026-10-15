import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

const MOBILE_VIEWPORT = '(max-width: 640px)'

interface Props {
  children: React.ReactNode
  id?: string
}

/** Blurs sections as they leave the viewport and reverses the effect on scroll up. */
export default function ScrollSection({ children, id }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_VIEWPORT).matches,
  )
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const mobileViewport = window.matchMedia(MOBILE_VIEWPORT)
    const updateViewport = () => setIsMobile(mobileViewport.matches)

    updateViewport()
    mobileViewport.addEventListener('change', updateViewport)

    return () => mobileViewport.removeEventListener('change', updateViewport)
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [0, 1, 1, 0])
  const blur = useTransform(
    scrollYProgress,
    [0, 0.12, 0.22, 0.78, 0.88, 1],
    ['blur(10px)', 'blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(10px)', 'blur(10px)'],
  )
  const y = useTransform(scrollYProgress, [0, 0.16, 0.84, 1], [20, 0, 0, -20])

  if (shouldReduceMotion || isMobile) {
    return (
      <div id={id} ref={sectionRef}>
        {children}
      </div>
    )
  }

  return (
    <motion.div id={id} ref={sectionRef} style={{ opacity, filter: blur, y }}>
      {children}
    </motion.div>
  )
}
