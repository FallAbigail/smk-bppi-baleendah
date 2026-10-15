import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { schoolProfile } from '../../data/schoolProfile'
import { useLanguage } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'
import HeroFacilities from './HeroFacilities'
import {
  consumeHomeWaveOpeningSkip,
  HERO_WAVE_EXIT_PROGRESS,
} from './heroMotion'

const HERO_VIDEO = '/videos/smk-bppi-hero.mp4'
const HERO_POSTER = '/images/bppi/gerbang-sekolah.jpg'
const HERO_STUDENTS_IMAGE = '/images/bppi/hero-students-transparent.png'

const HERO_WAVE_PATHS = {
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

function HeroRevealWave({ edge }: { edge: 'top' | 'bottom' }) {
  const gradientId = `hero-wave-gradient-${edge}`
  const path = HERO_WAVE_PATHS[edge]

  return (
    <svg
      className="hero-wave-face"
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
      <path d={path} fill={`url(#${gradientId})`} />
    </svg>
  )
}

export default function Hero({ blank = false }: { blank?: boolean }) {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const heroSchoolName = schoolProfile.name.replace(/^Sekolah\s+/i, '')
  const heroSchoolNameWords = heroSchoolName.split(/\s+/).filter(Boolean)
  // Keep the route-return bypass for this mount: its shorter scroll range
  // would compress the wave and zoom transforms when the user reverses scroll.
  const [skippedHomeEntry] = useState(consumeHomeWaveOpeningSkip)
  const skipWaveOpening = skippedHomeEntry
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '-5%'])
  const waveOpeningScale = useTransform(
    scrollYProgress,
    [0, HERO_WAVE_EXIT_PROGRESS, 1],
    [1.06, 1.32, 1.32],
  )
  const copyZ = useTransform(scrollYProgress, [0, 1], [0, 70])
  const copyScale = useTransform(scrollYProgress, [0, 1], [0.99, 1.01])
  const copyY = useTransform(scrollYProgress, [0, 1], [6, -6])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.22], [0.82, 1])
  const topPanelY = useTransform(
    scrollYProgress,
    [0, HERO_WAVE_EXIT_PROGRESS, 1],
    ['0%', '-112%', '-112%'],
  )
  const bottomPanelY = useTransform(
    scrollYProgress,
    [0, HERO_WAVE_EXIT_PROGRESS, 1],
    ['0%', '112%', '112%'],
  )
  const reducedMotionPanelY = useTransform(scrollYProgress, (progress) =>
    progress >= HERO_WAVE_EXIT_PROGRESS ? '-112%' : '0%',
  )
  const reducedMotionBottomPanelY = useTransform(scrollYProgress, (progress) =>
    progress >= HERO_WAVE_EXIT_PROGRESS ? '112%' : '0%',
  )

  const activeImageScale = skippedHomeEntry ? 1.06 : waveOpeningScale

  return (
    <section
      ref={heroRef}
      id="section-hero"
      className={cn(
        'hero-intro-scroll',
        skippedHomeEntry && 'hero-intro-skip-opening',
        shouldReduceMotion && 'hero-intro-static',
      )}
    >
      <div id="hero" className={cn('hero-scene-sticky', blank && 'hero-scene-empty')}>
        <motion.div
          className="hero-background-layer"
          style={shouldReduceMotion
            ? undefined
            : skippedHomeEntry
              ? { scale: 1.06 }
              : { y: imageY, scale: activeImageScale }}
          aria-hidden="true"
        >
          <video
            className="h-full w-full object-cover object-center"
            autoPlay={!shouldReduceMotion}
            muted
            loop={!shouldReduceMotion}
            playsInline
            preload={shouldReduceMotion ? 'none' : 'auto'}
            poster={HERO_POSTER}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </motion.div>

        {blank && (
          <div className="hero-stage">
            <div className="hero-students-cutout" aria-hidden="true">
              <img src={HERO_STUDENTS_IMAGE} alt="" draggable={false} />
            </div>
            <div className="hero-name-layout">
              <h1 className="hero-school-name">
                <span className="hero-school-prefix">Sekolah</span>
                <span className="hero-school-name-main">
                  {heroSchoolNameWords.map((word, index) => (
                    <span
                      key={`${word}-${index}`}
                      className={cn(
                        'hero-school-name-word',
                        index === heroSchoolNameWords.length - 1 && 'hero-school-name-word-accent',
                      )}
                    >
                      {index > 0 && ' '}
                      {word}
                    </span>
                  ))}
                </span>
              </h1>
              <HeroFacilities />
            </div>
          </div>
        )}
        {blank && (
          <div className="hero-quick-actions" role="group" aria-label={t('Tautan utama sekolah')}>
            <Link to="/program" className="hero-button hero-button-secondary group">
              {t('Lihat Program')}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
            <Link to="/kontak" className="hero-button hero-button-primary group">
              {t('Hubungi Kami')}
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
        {!blank && (
          <div className="hero-stage">
            <motion.div
              className="hero-copy"
              style={
                shouldReduceMotion
                  ? undefined
                  : { z: copyZ, scale: copyScale, y: copyY, opacity: copyOpacity }
              }
            >
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="hero-kicker"
              >
                <span className="hero-kicker-dot" aria-hidden="true" />
                {t('Profil Sekolah')}
              </motion.p>

              <motion.h1
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.06 }}
                className="hero-title"
              >
                {schoolProfile.name}
                <span>{schoolProfile.city}</span>
              </motion.h1>

              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.14 }}
                className="hero-description"
              >
                {t('Kenali lingkungan belajar, program keahlian, dan kegiatan siswa di')}{' '}
                {schoolProfile.name}.
              </motion.p>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22 }}
                className="hero-actions"
              >
                <Link to="/program" className="hero-button hero-button-primary group">
                  {t('Lihat Program')}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link to="/tentang" className="hero-button hero-button-secondary">
                  {t('Tentang Sekolah')}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        )}

        <div className="hero-reveal-curtains" aria-hidden="true">
          <motion.div
            className="hero-reveal-panel hero-reveal-panel-top"
            style={{
              y: skipWaveOpening
                ? '-112%'
                : shouldReduceMotion
                  ? (blank ? reducedMotionPanelY : '-126%')
                  : topPanelY,
            }}
          >
            <HeroRevealWave edge="top" />
          </motion.div>
          <motion.div
            className="hero-reveal-panel hero-reveal-panel-bottom"
            style={{
              y: skipWaveOpening
                ? '112%'
                : shouldReduceMotion
                  ? (blank ? reducedMotionBottomPanelY : '126%')
                  : bottomPanelY,
            }}
          >
            <HeroRevealWave edge="bottom" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

