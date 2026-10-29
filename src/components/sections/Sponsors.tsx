import { useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'
import { useLanguage } from '../../contexts/LanguageContext'

interface SchoolPartner {
  name: string
  logo: string
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
    logo: '/images/bppi/programs/acp.png',
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
  return (
    <li
      aria-hidden={ariaHidden}
      className="flex h-20 w-48 shrink-0 items-center justify-center sm:w-52"
    >
      <img
        src={partner.logo}
        alt={ariaHidden ? '' : partner.name}
        title={ariaHidden ? undefined : partner.name}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`max-h-12 max-w-40 object-contain transition-opacity duration-300 hover:opacity-75 sm:max-w-44 ${partner.monochromeOnLight ? 'partner-logo-monochrome' : ''}`}
      />
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
      className="overflow-hidden"
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
        className="overflow-hidden bg-gray-50 py-12 dark:bg-gray-950 sm:py-14"
      >
        <div className="mx-auto mb-7 max-w-7xl px-6 lg:px-8">
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
