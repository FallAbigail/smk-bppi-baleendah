import { useTransform, type MotionValue } from 'framer-motion'

const smoothStep = (progress: number) => {
  const clamped = Math.min(1, Math.max(0, progress))
  return clamped * clamped * (3 - 2 * clamped)
}

/** Scroll-linked slide handoff: fade and settle in, then gently shrink and move out. */
export function useSlideTransition(progress: MotionValue<number>) {
  const opacity = useTransform(progress, (value) => {
    const entering = smoothStep(value / 0.2)
    const leaving = smoothStep((1 - value) / 0.24)
    return Math.min(entering, leaving)
  })

  const scale = useTransform(progress, (value) => {
    if (value < 0.2) return 0.97 + 0.03 * smoothStep(value / 0.2)
    if (value > 0.76) {
      return 1 - 0.04 * smoothStep((value - 0.76) / 0.24)
    }
    return 1
  })

  const y = useTransform(progress, (value) => {
    if (value < 0.2) return 12 * (1 - smoothStep(value / 0.2))
    if (value > 0.76) return -12 * smoothStep((value - 0.76) / 0.24)
    return 0
  })

  return { opacity, scale, y }
}
