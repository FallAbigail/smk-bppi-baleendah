import { ExternalLink, MapPin } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { schoolProfile } from '../../data/schoolProfile'

export default function SchoolLocation() {
  const { t } = useLanguage()

  return (
    <section
      id="section-location"
      className="home-compact-section bg-gray-50 py-14 dark:bg-gray-950 sm:py-20"
      aria-labelledby="school-location-heading"
    >
      <div className="mx-auto max-w-[86rem] px-5 xl:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-400">
              {t('Kunjungi kami')}
            </p>
            <h2
              id="school-location-heading"
              className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              {t('Lokasi SMK BPPI Baleendah')}
            </h2>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
              <span>{schoolProfile.address}</span>
            </p>
          </div>
          <a
            href={schoolProfile.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-brand-300 dark:hover:border-brand-700 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-950 sm:self-auto"
          >
            {t('Buka di Google Maps')}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-900/5 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20 sm:rounded-3xl">
          <iframe
            title={t('Lokasi SMK BPPI Baleendah')}
            src={schoolProfile.googleMapsEmbedUrl}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="block h-[22rem] w-full border-0 bg-gray-100 dark:bg-gray-800 sm:h-[27rem] lg:h-[32rem]"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
