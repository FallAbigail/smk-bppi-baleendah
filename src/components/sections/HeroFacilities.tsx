import { useHeroFacilities } from '../../hooks/useHeroFacilities'
import { heroFacilities } from '../../data/heroFacilities'
import { useLanguage } from '../../contexts/LanguageContext'

export default function HeroFacilities() {
  const { t } = useLanguage()
  const { trackRef, repetitions } = useHeroFacilities()
  // Each repeated group must cover the viewport before it can wrap safely.
  const group = Array.from({ length: repetitions }, () => heroFacilities).flat()
  // Two identical cycles are enough to wrap safely. A third copy only adds
  // off-screen DOM nodes and per-card work to the animation loop.
  const cards = [...group, ...group]
  const groupLength = heroFacilities.length * repetitions

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
        data-reveal-ignore
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
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              draggable={false}
            />
            <figcaption>{t(facility.name)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
