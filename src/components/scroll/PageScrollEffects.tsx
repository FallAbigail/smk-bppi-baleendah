import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageScrollEffects } from '../../hooks/usePageScrollEffects'

export default function PageScrollEffects() {
  const { pathname } = useLocation()
  const progressRef = useRef<HTMLDivElement>(null)
  const enabled = !pathname.startsWith('/admin')
  usePageScrollEffects(pathname, enabled, progressRef)

  if (!enabled) return null

  return (
    <div ref={progressRef} className="mobile-scroll-progress" aria-hidden="true">
      <span />
    </div>
  )
}
