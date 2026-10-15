import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Phone, Mail } from 'lucide-react'
import { schoolProfile } from '../../data/schoolProfile'
import { useSiteContent } from '../../contexts/SiteContentContext'
import { useLanguage } from '../../contexts/LanguageContext'

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { content } = useSiteContent()
  const { t } = useLanguage()
  const latestAdmissionsInfo = content.announcements
    .filter((item) => item.category === 'penerimaan' && item.published)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  return (
    <section ref={ref} className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="bg-brand-950 dark:bg-brand-900 rounded-2xl px-5 py-12 text-white sm:px-8 sm:py-14 md:px-14"
        >
          <div className="max-w-2xl">
            <span
              className={[
                'inline-block bg-brand-800 dark:bg-brand-800',
                'text-brand-200 dark:text-white text-xs font-semibold',
                'px-3 py-1 rounded-full mb-6',
              ].join(' ')}
            >
              {t('Informasi Penerimaan Siswa')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {latestAdmissionsInfo?.title ?? (
                <>
                  {t('Kenali lebih dekat')}
                  <br />
                  {schoolProfile.name}
                </>
              )}
            </h2>
            <p className="text-brand-300 leading-relaxed mb-8">
              {latestAdmissionsInfo?.body ??
                t('Untuk informasi jadwal, persyaratan, dan alur pendaftaran, hubungi sekolah secara langsung.')}
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                to={latestAdmissionsInfo ? '/informasi#penerimaan' : '/kontak'}
                className={[
                  'group inline-flex items-center gap-2 bg-white',
                  'text-brand-950 font-semibold text-sm px-6 py-3',
                  'rounded-lg hover:bg-brand-50 transition-colors',
                ].join(' ')}
              >
                {t(latestAdmissionsInfo ? 'Lihat Informasi' : 'Tanya Informasi')}
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/kontak"
                className={[
                  'inline-flex items-center gap-2 border border-brand-700',
                  'text-brand-300 font-semibold text-sm px-6 py-3',
                  'rounded-lg hover:bg-brand-800/50 transition-colors',
                ].join(' ')}
              >
                {t('Hubungi Kami')}
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-8 border-t border-brand-800">
              <a
                href={`tel:${schoolProfile.phoneHref}`}
                className="flex items-center gap-2 text-brand-300 hover:text-white text-xs transition-colors sm:text-sm"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {schoolProfile.phoneDisplay}
              </a>
              <a
                href={`mailto:${schoolProfile.email}`}
                className="flex items-center gap-2 text-brand-300 hover:text-white text-xs transition-colors sm:text-sm"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                {schoolProfile.email}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
