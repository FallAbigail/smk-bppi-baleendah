import { useRef } from 'react'
import { motion, useReducedMotion, useScroll } from 'framer-motion'
import { useSlideTransition } from './useSlideTransition'

interface Props {
  children: React.ReactNode
  id?: string
}

/** Give each home section a scroll-driven slide handoff without a blur filter. */
export default function ScrollSection({ children, id }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const { opacity, scale, y } = useSlideTransition(scrollYProgress)

  return (
    <motion.div
      ref={sectionRef}
      id={id}
      style={shouldReduceMotion ? undefined : { opacity, scale, y }}
    >
      {children}
    </motion.div>
  )
}
