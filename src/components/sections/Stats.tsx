import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { UsersRound, Presentation, Trophy, GraduationCap } from 'lucide-react'

interface StatItem {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
}

const stats: StatItem[] = [
  { icon: <UsersRound className="w-5 h-5" />, value: 1200, suffix: '+', label: 'Siswa Aktif' },
  { icon: <Presentation className="w-5 h-5" />, value: 85, suffix: '+', label: 'Tenaga Pendidik' },
  { icon: <Trophy className="w-5 h-5" />, value: 30, suffix: '+', label: 'Prestasi Nasional' },
  { icon: <GraduationCap className="w-5 h-5" />, value: 95, suffix: '%', label: 'Tingkat Kelulusan' },
]

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let current = 0
    const inc = target / 60
    const timer = setInterval(() => {
      current += inc
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else setCount(Math.floor(current))
    }, 20)
    return () => clearInterval(timer)
  }, [active, target])
  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export default function Stats() {
  const inViewRef = useRef<HTMLDivElement>(null)
  const inView = useInView(inViewRef, { once: true, margin: '-100px' })

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div ref={inViewRef} className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          className={[
            'grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100',
            'dark:bg-gray-800 rounded-2xl overflow-hidden',
          ].join(' ')}
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white dark:bg-gray-900 p-8 flex flex-col items-start gap-3"
            >
              <div
                aria-hidden="true"
                className={[
                  'w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950',
                  'text-brand-700 dark:text-brand-400 flex items-center',
                  'justify-center',
                ].join(' ')}
              >
                {s.icon}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                <CountUp target={s.value} suffix={s.suffix} active={inView} />
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
