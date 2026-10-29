import { useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'
import { useLanguage } from '../../contexts/LanguageContext'

interface SchoolPartner {
  name: string
  logo: string
  darkLogo?: string
  monochromeOnLight?: boolean
}

// Partner logos use local copies of source assets so the marquee does not rely
// on live third-party image servers at runtime.
const schoolPartners: SchoolPartner[] = [
  {
    name: 'Amerta Indah Otsuka',
    logo: '/images/sponsors/amerta-indah-otsuka.webp',
    monochromeOnLight: true,
  },
  {
    name: 'CyberLabs',
    logo: '/images/sponsors/cyberlabs.png',
  },
  {
    name: 'Axioo Class Program',
    logo: '/images/sponsors/axioo.png',
    darkLogo: '/images/sponsors/axioo-dark.png',
  },
  {
    name: 'BNET',
    logo: '/images/sponsors/bnet.png',
  },
  {
    name: 'Bank Syariah Indonesia',
    logo: '/images/sponsors/bsi.svg',
  },
  {
    name: 'KISI',
    logo: '/images/sponsors/kisi.svg',
  },
  {
    name: 'SATU University',
    logo: '/images/sponsors/satu-university.png',
  },
  {
    name: 'PT Esto Kreasi Nusantara',
    logo: '/images/sponsors/esto-kreasi-nusantara.png',
  },
  {
    name: 'PT Tera Data Indonusa Tbk',
    logo: '/images/sponsors/tera-data-indonusa.png',
    monochromeOnLight: true,
  },
  {
    name: 'Bursa Efek Indonesia',
    logo: '/images/sponsors/idx-bei.png',
  },
]

function PartnerLogo({ partner, ariaHidden }: { partner: SchoolPartner; ariaHidden: boolean }) {
  const imageClass = `h-16 w-44 shrink-0 object-contain transition-opacity duration-300 hover:opacity-75 ${partner.monochromeOnLight ? 'partner-logo-monochrome' : ''}`

  return (
    <li
      aria-hidden={ariaHidden}
      className="sponsor-partner-item flex h-20 w-48 shrink-0 items-center justify-center sm:w-52"
    >
      <img
        src={partner.logo}
        alt={ariaHidden ? '' : partner.name}
        title={ariaHidden ? undefined : partner.name}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`${imageClass} ${partner.darkLogo ? 'dark:hidden' : ''}`}
      />
      {partner.darkLogo && (
        <img
          src={partner.darkLogo}
          alt=""
          title={ariaHidden ? undefined : partner.name}
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`${imageClass} hidden dark:block`}
        />
      )}
    </li>
  )
}

function MarqueeRow({
  partners,
  direction,
  duration,
  visible,
  label,
}: {
  partners: SchoolPartner[]
  direction: 'left' | 'right'
  duration: number
  visible: boolean
  label: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="sponsor-marquee-row overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`sponsor-marquee-track sponsor-marquee-${direction} flex w-max items-center`}
        style={
          {
            '--ticker-duration': `${duration}s`,
            animationPlayState: visible && !hovered ? 'running' : 'paused',
          } as CSSProperties
        }
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-label={copy === 0 ? label : undefined}
            aria-hidden={copy > 0}
            className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
          >
            {partners.map((partner) => (
              <PartnerLogo
                key={`${copy}-${partner.name}`}
                partner={partner}
                ariaHidden={copy > 0}
              />
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default function Sponsors() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: false, margin: '80px' })
  const { t } = useLanguage()

  return (
    <>
      <style>{`
        @keyframes sponsor-ticker-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes sponsor-ticker-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .partner-logo-monochrome { filter: brightness(0); }
        .dark .partner-logo-monochrome { filter: none; }
        .sponsor-marquee-left { animation: sponsor-ticker-left var(--ticker-duration) linear infinite; }
        .sponsor-marquee-right { animation: sponsor-ticker-right var(--ticker-duration) linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sponsor-marquee-track { animation-play-state: paused !important; }
        }
      `}</style>

      <section
        ref={ref}
        id="section-sponsors"
        className="home-compact-section sponsor-section overflow-hidden bg-gray-50 py-12 dark:bg-gray-950 sm:py-14"
      >
        <div className="sponsor-heading mx-auto mb-7 max-w-7xl px-6 lg:px-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            {t('Mitra SMK BPPI')}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {t('Mitra industri dan pendidikan')}
          </h2>
        </div>

        <div
          className="flex flex-col gap-3"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          }}
        >
          <MarqueeRow
            partners={schoolPartners}
            direction="left"
            duration={54}
            visible={inView}
            label={t('Mitra SMK BPPI')}
          />
          <MarqueeRow
            partners={[...schoolPartners].reverse()}
            direction="right"
            duration={63}
            visible={inView}
            label={t('Mitra SMK BPPI')}
          />
        </div>
      </section>
    </>
  )
}
