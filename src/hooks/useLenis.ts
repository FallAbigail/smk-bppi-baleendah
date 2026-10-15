import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/** Keep one Lenis instance for the lifetime of the routed application. */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      // A lower lerp makes wheel input glide longer without making each
      // individual scroll step feel like a delayed, fixed-duration animation.
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
      respectReducedMotion: true,
    })

    lenisRef.current = lenis

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
