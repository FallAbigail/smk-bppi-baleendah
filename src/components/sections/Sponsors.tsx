import { useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'
import { useLanguage } from '../../contexts/LanguageContext'

interface SchoolPartner {
  name: string
  logo?: string
  logoClassName?: string
  surface?: 'light' | 'otsuka'
}

// Partner names are taken from SMK BPPI's official site. Only verified logo
// files are used; entries without an image stay as plain text wordmarks.
const schoolPartners: SchoolPartner[] = [
  {
    name: 'PT Amerta Indah Otsuka',
    logo: '/images/sponsors/amerta-indah-otsuka.webp',
    logoClassName: 'h-9 w-[9rem] object-contain',
    surface: 'otsuka',
  },
  {
    name: 'CyberLabs',
    logo: '/images/sponsors/cyberlabs.png',
    logoClassName: 'h-8 w-[8.5rem] object-contain',
  },
  {
    name: 'Axioo Class Program',
    logo: '/images/bppi/programs/acp.png',
    logoClassName: 'h-[3.8rem] w-[3.8rem] object-contain',
  },
  {
    name: 'PT Wahana Internet Nusantara (BNET)',
    logo: '/images/sponsors/bnet.png',
    logoClassName: 'h-9 w-[6rem] object-contain',
  },
  {
    name: 'Bank Syariah Indonesia (BSI)',
    logo: '/images/sponsors/bsi.svg',
    logoClassName: 'h-8 w-[8.5rem] object-contain',
  },
  {
    name: 'Korea Investment & Sekuritas Indonesia (KISI)',
    logo: '/images/sponsors/kisi.svg',
    logoClassName: 'h-8 w-[9rem] object-contain',
  },
  {
    name: 'SATU University',
    logo: '/images/sponsors/satu-university.png',
    logoClassName: 'h-[3.8rem] w-[7rem] object-contain',
  },
  { name: 'PT Esto Kreasi Nusantara' },
  { name: 'PT Teradata Indonesia Tbk' },
  { name: 'Bursa Efek Indonesia' },
]

function PartnerPill({ partner, ariaHidden }: { partner: SchoolPartner; ariaHidden: boolean }) {
  const isOtsuka = partner.surface === 'otsuka'

  return (
    <li
      aria-label={ariaHidden ? undefined : partner.name}
      aria-hidden={ariaHidden}
      className={[
        'flex h-[4.75rem] w-[15.5rem] shrink-0 items-center justify-center rounded-full border px-5',
        isOtsuka
          ? 'border-[#1d614f] bg-[#1d614f] text-white'
          : 'border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-white dark:text-gray-800',
      ].join(' ')}
    >
      {partner.logo && (
        <img
          src={partner.logo}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`shrink-0 ${partner.logoClassName ?? 'h-9 w-14 object-contain'}`}
        />
      )}
      {!partner.logo && (
        <span className="text-center text-[0.72rem] font-semibold leading-snug">{partner.name}</span>
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
  const repeatedPartners = [...partners, ...partners]

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
            className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
          >
            {repeatedPartners.map((partner, index) => (
              <PartnerPill
                key={`${copy}-${partner.name}-${index}`}
                partner={partner}
                ariaHidden={copy > 0 || index >= partners.length}
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
            duration={58}
            visible={inView}
            label={t('Mitra SMK BPPI')}
          />
          <MarqueeRow
            partners={[...schoolPartners].reverse()}
            direction="right"
            duration={64}
            visible={inView}
            label={t('Mitra SMK BPPI')}
          />
        </div>
      </section>
    </>
  )
}
