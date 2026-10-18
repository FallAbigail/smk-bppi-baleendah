import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { schoolProfile } from '../../data/schoolProfile'
import { useLanguage } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'
import { useSlideTransition } from '../scroll/useSlideTransition'
import HeroFacilities from './HeroFacilities'
import WaveFace from './WaveFace'
import {
  consumeHomeWaveOpeningSkip,
  HERO_WAVE_EXIT_PROGRESS,
} from './heroMotion'

const HERO_VIDEO = '/videos/smk-bppi-hero.mp4'
const HERO_POSTER = '/images/bppi/gerbang-sekolah.jpg'

export default function Hero({ blank = false }: { blank?: boolean }) {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLElement>(null)
  const heroVideoRef = useRef<HTMLVideoElement>(null)
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
  const { scrollYProgress: visibilityProgress } = useScroll({
    target: heroRef,
    offset: ['start end', 'end start'],
  })
  const { opacity: sectionOpacity, scale: sectionScale, y: sectionY } =
    useSlideTransition(visibilityProgress)

  useEffect(() => {
    const hero = heroRef.current
    const video = heroVideoRef.current
    if (!hero || !video) return

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !shouldReduceMotion) {
        void video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
    visibility.observe(hero)
    return () => visibility.disconnect()
  }, [shouldReduceMotion])

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
    <motion.section
      ref={heroRef}
      id="section-hero"
      style={shouldReduceMotion ? undefined : { opacity: sectionOpacity }}
      className={cn(
        'hero-intro-scroll',
        skippedHomeEntry && 'hero-intro-skip-opening',
        shouldReduceMotion && 'hero-intro-static',
      )}
    >
      <motion.div
        id="hero"
        className={cn('hero-scene-sticky', blank && 'hero-scene-empty')}
        style={shouldReduceMotion ? undefined : { scale: sectionScale, y: sectionY }}
      >
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
            ref={heroVideoRef}
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
            <div className="hero-name-layout">
              <div className="hero-name-content">
                <h1 className="hero-school-name">
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
                <span className="hero-campaign-tag">#GoDigiGoIndustri</span>
              </div>
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
            <WaveFace edge="top" />
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
            <WaveFace edge="bottom" />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}

