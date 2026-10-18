import { useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'
import { useLanguage } from '../../contexts/LanguageContext'

interface SchoolPartner {
  name: string
  detail: string
  accent: string
  logoSurface: string
  logo: string
}

// Partner logos use local copies of source assets so the marquee does not rely
// on live third-party image servers at runtime.
const schoolPartners: SchoolPartner[] = [
  {
    name: 'Amerta Indah Otsuka',
    detail: 'Kunjungan industri',
    accent: '#28745b',
    logoSurface: '#1d614f',
    logo: '/images/sponsors/amerta-indah-otsuka.webp',
  },
  {
    name: 'CyberLabs',
    detail: 'Teaching Factory',
    accent: '#1f679a',
    logoSurface: '#ffffff',
    logo: '/images/sponsors/cyberlabs.png',
  },
  {
    name: 'Axioo Class Program',
    detail: 'Kelas industri · PT Tera Data Indonusa Tbk',
    accent: '#1674b8',
    logoSurface: '#ffffff',
    logo: '/images/bppi/programs/acp.png',
  },
  {
    name: 'BNET',
    detail: 'PT Wahana Internet Nusantara',
    accent: '#2673b8',
    logoSurface: '#245c91',
    logo: '/images/sponsors/bnet.png',
  },
  {
    name: 'Bank Syariah Indonesia',
    detail: 'Mitra sekolah',
    accent: '#168b72',
    logoSurface: '#ffffff',
    logo: '/images/sponsors/bsi.svg',
  },
  {
    name: 'KISI',
    detail: 'Korea Investment & Sekuritas Indonesia',
    accent: '#28527b',
    logoSurface: '#ffffff',
    logo: '/images/sponsors/kisi.svg',
  },
  {
    name: 'SATU University',
    detail: 'Mitra pendidikan',
    accent: '#a64c34',
    logoSurface: '#ffffff',
    logo: '/images/sponsors/satu-university.png',
  },
  {
    name: 'PT Esto Kreasi Nusantara',
    detail: 'Mitra sekolah',
    accent: '#315d7c',
    logoSurface: '#edf2f7',
    logo: '/images/sponsors/esto-kreasi-nusantara.png',
  },
  {
    name: 'PT Tera Data Indonusa Tbk',
    detail: 'Teknologi · AXIOO',
    accent: '#32668c',
    logoSurface: '#173a58',
    logo: '/images/sponsors/tera-data-indonusa.png',
  },
  {
    name: 'Bursa Efek Indonesia',
    detail: 'Sekolah Pasar Modal',
    accent: '#b72e36',
    logoSurface: '#ffffff',
    logo: '/images/sponsors/idx-bei.png',
  },
]

function PartnerPill({ partner, ariaHidden }: { partner: SchoolPartner; ariaHidden: boolean }) {
  return (
    <li
      aria-label={ariaHidden ? undefined : partner.name}
      aria-hidden={ariaHidden}
      className="partner-pill flex h-[5rem] w-[19rem] shrink-0 items-center gap-3 rounded-full border px-4"
      style={{ '--partner-accent': partner.accent } as CSSProperties}
    >
      <span
        className="partner-logo-frame flex h-12 w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full px-1.5"
        style={{ backgroundColor: partner.logoSurface }}
        aria-hidden="true"
      >
        <img
          src={partner.logo}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="max-h-10 max-w-full object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold leading-tight text-gray-900 dark:text-gray-100">
          {partner.name}
        </span>
        <span className="mt-1 block line-clamp-2 text-[0.625rem] leading-tight text-gray-600 dark:text-gray-300">
          {partner.detail}
        </span>
      </span>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--partner-accent)]" aria-hidden="true" />
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
        .partner-pill {
          border-color: color-mix(in srgb, var(--partner-accent) 27%, rgb(var(--gray-200)));
          background: rgb(255 255 255 / 88%);
          box-shadow: 0 4px 14px color-mix(in srgb, var(--partner-accent) 8%, transparent);
        }
        .dark .partner-pill {
          border-color: color-mix(in srgb, var(--partner-accent) 42%, rgb(var(--gray-800)));
          background: rgb(var(--gray-900));
          box-shadow: none;
        }
        .partner-logo-frame {
          border: 1px solid color-mix(in srgb, var(--partner-accent) 16%, transparent);
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
