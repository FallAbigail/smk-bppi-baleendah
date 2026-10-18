import { useId } from 'react'
import { cn } from '../../utils/cn'

const WAVE_PATHS = {
  top: [
    'M0 150',
    'C145 171 262 159 405 130',
    'C560 100 700 103 848 136',
    'C1000 171 1125 174 1270 150',
    'C1345 139 1395 132 1440 140 V0 H0 Z',
  ].join(' '),
  bottom: [
    'M0 50 C145 29 262 41 405 70',
    'C560 100 700 97 848 64',
    'C1000 29 1125 26 1270 50',
    'C1345 61 1395 68 1440 60 V200 H0 Z',
  ].join(' '),
}

export default function WaveFace({
  edge,
  className,
}: {
  edge: 'top' | 'bottom'
  className?: string
}) {
  const reactId = useId().replace(/:/g, '')
  const gradientId = `school-wave-gradient-${reactId}-${edge}`

  return (
    <svg
      className={cn('hero-wave-face', className)}
      viewBox="0 0 1440 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(var(--hero-wave-start-rgb))" />
          <stop offset="100%" stopColor="rgb(var(--hero-wave-end-rgb))" />
        </linearGradient>
      </defs>
      <path d={WAVE_PATHS[edge]} fill={`url(#${gradientId})`} />
    </svg>
  )
}
