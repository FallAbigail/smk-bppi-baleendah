import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { SiFacebook, SiInstagram, SiTiktok, SiYoutube } from 'react-icons/si'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

const socialLinks = [
  {
    label: 'Instagram SMK BPPI',
    href: 'https://www.instagram.com/smkbppi_be/',
    Icon: SiInstagram,
  },
  {
    label: 'TikTok SMK BPPI',
    href: 'https://www.tiktok.com/@smkbppibaleendah',
    Icon: SiTiktok,
  },
  {
    label: 'YouTube Sekolah BPPI',
    href: 'https://www.youtube.com/@sekolahbppi',
    Icon: SiYoutube,
  },
  {
    label: 'Facebook Yayasan BPPI',
    href: 'https://www.facebook.com/YayasanBPPI/',
    Icon: SiFacebook,
  },
]

const navGroups = [
  {
    title: 'Navigasi',
    links: [
      { label: 'Beranda', href: '/' },
      { label: 'Tentang Sekolah', href: '/tentang' },
      { label: 'Program Keahlian', href: '/program' },
      { label: 'Pendaftaran PPDB', href: '/ppdb' },
      { label: 'Ekskul', href: '/ekskul' },
      { label: 'Galeri Kegiatan', href: '/galeri' },
      { label: 'Hubungi Sekolah', href: '/kontak' },
    ],
  },
  {
    title: 'Pendidikan',
    links: [
      { label: 'Program Keahlian SMK', href: '/program#smk' },
    ],
  },
  {
    title: 'Informasi',
    links: [
      { label: 'Berita Sekolah', href: '/informasi#berita' },
      { label: 'Pengumuman', href: '/informasi#pengumuman' },
      { label: 'Kalender Akademik', href: '/informasi#kalender' },
      { label: 'PPDB SMK', href: '/informasi#penerimaan' },
      { label: 'Informasi Alumni', href: '/informasi#alumni' },
    ],
  },
]

const mobileNavGroups = [
  {
    title: 'Sekolah',
    links: [
      { label: 'Beranda', href: '/' },
      { label: 'Tentang Sekolah', href: '/tentang' },
      { label: 'Guru dan staf', href: '/tentang#pengajar' },
      { label: 'Galeri Kegiatan', href: '/galeri' },
      { label: 'Ekskul', href: '/ekskul' },
    ],
  },
  {
    title: 'Pendidikan',
    links: [
      { label: 'Program Keahlian', href: '/program' },
      { label: 'Pendaftaran PPDB', href: '/ppdb' },
      { label: 'Cek status pendaftaran', href: '/ppdb#status-heading' },
      { label: 'PPDB SMK', href: '/informasi#penerimaan' },
    ],
  },
  navGroups[2],
  {
    title: 'Kontak',
    links: [
      { label: 'Hubungi Sekolah', href: '/kontak' },
      { label: schoolProfile.phoneDisplay, href: `tel:${schoolProfile.phoneHref}` },
      { label: schoolProfile.email, href: `mailto:${schoolProfile.email}` },
      { label: 'Alamat sekolah', href: schoolProfile.googleMapsUrl },
      { label: 'Kebijakan Privasi', href: '/privasi' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const { t } = useLanguage()

  return (
    <footer className="site-footer relative isolate overflow-hidden border-t border-gray-200 bg-slate-100 text-gray-600 transition-colors dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
      <div className="footer-mobile-layout">
        <Link
          to="/"
          className="footer-mobile-brand"
          aria-label={`${schoolProfile.name} ${t(schoolProfile.city)}, ${t('Beranda').toLowerCase()}`}
        >
          <img src="/images/logo-smk-bppi.png" alt="" aria-hidden="true" width={36} height={36} />
          <span>
            <span className="footer-mobile-name">{schoolProfile.name}</span>
            <span className="footer-mobile-city">{t(schoolProfile.city)}</span>
          </span>
        </Link>
        <p className="footer-mobile-description">
          {t('Informasi sekolah, program keahlian, fasilitas, dan kegiatan dalam satu tempat.')}
        </p>
        <div className="footer-mobile-social" role="group" aria-label={t('Media sosial')}>
          {socialLinks.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={t(label)} title={t(label)}>
              <Icon size={17} aria-hidden="true" />
            </a>
          ))}
        </div>

        <section className="footer-mobile-cta" aria-labelledby="footer-updates-heading">
          <h2 id="footer-updates-heading">{t('Kabar dan pengumuman sekolah')}</h2>
          <p>{t('Baca kabar terbaru dan pengumuman resmi dari sekolah.')}</p>
          <Link to="/informasi#pengumuman">{t('Lihat pengumuman')}</Link>
        </section>

        <div className="footer-mobile-columns">
          {mobileNavGroups.map((group) => (
            <nav key={group.title} aria-label={t(group.title)}>
              <h2>{t(group.title)}</h2>
              <ul>
                {group.links.map(({ label, href }) => (
                  <li key={label}>
                    {/^(https?:|tel:|mailto:)/.test(href) ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                        {t(label)}
                      </a>
                    ) : <Link to={href}>{t(label)}</Link>}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="footer-mobile-copyright">© {year} {schoolProfile.name}. {t(schoolProfile.city)}.</p>
      </div>
      <div className="footer-desktop-layout">
        <div className="footer-map-background" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="footer-main-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-14 border-b border-gray-200 dark:border-gray-800">
            <div className="footer-brand-block lg:col-span-2">
              <Link
                to="/"
                className="footer-brand-link inline-flex items-center gap-2.5 mb-5"
                aria-label={`${schoolProfile.name} ${t(schoolProfile.city)}, ${t('Beranda').toLowerCase()}`}
              >
                <img
                  src="/images/logo-smk-bppi.png"
                  alt=""
                  aria-hidden="true"
                  className="footer-brand-logo h-14 w-14 shrink-0 object-contain"
                />
                <span>
                  <span className="block font-bold text-gray-900 text-sm dark:text-white">{schoolProfile.name}</span>
                  <span className="block text-gray-500 text-xs">{t(schoolProfile.city)}</span>
                </span>
              </Link>
              <p className="footer-brand-description text-sm leading-relaxed mb-6 max-w-xs">
                {t('Informasi sekolah, program keahlian, fasilitas, dan kegiatan dalam satu tempat.')}
              </p>
              <address className="footer-contact-grid not-italic space-y-2.5 text-sm mb-6">
                <div className="footer-contact-address flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-700 mt-0.5 shrink-0 dark:text-brand-400" aria-hidden="true" />
                  <span>{schoolProfile.address}</span>
                </div>
                <div className="footer-contact-phone flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-700 shrink-0 dark:text-brand-400" aria-hidden="true" />
                  <a
                    href={`tel:${schoolProfile.phoneHref}`}
                    className="transition-colors hover:text-brand-800 dark:hover:text-white"
                  >
                    {schoolProfile.phoneDisplay}
                  </a>
                </div>
                <div className="footer-contact-email flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-700 shrink-0 dark:text-brand-400" aria-hidden="true" />
                  <a
                    href={`mailto:${schoolProfile.email}`}
                    className="transition-colors hover:text-brand-800 dark:hover:text-white"
                  >
                    {schoolProfile.email}
                  </a>
                </div>
              </address>
            </div>

            {navGroups.map((group) => (
              <nav className="footer-nav-desktop" key={group.title} aria-label={t(group.title)}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-gray-900 dark:text-gray-100">{t(group.title)}</p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className={[
                          'text-sm text-gray-600 transition-colors hover:text-brand-800 dark:text-gray-400 dark:hover:text-white',
                          'focus-visible:outline focus-visible:outline-2',
                          'focus-visible:outline-offset-2',
                          'focus-visible:outline-brand-700 dark:focus-visible:outline-white',
                        ].join(' ')}
                      >
                        {t(link.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}


          </div>

          <div className="footer-bottom py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-500">
            <p className="footer-copyright text-center sm:text-left">
              © {year} {schoolProfile.name} {t(schoolProfile.city)}.
            </p>
            <div className="footer-bottom-actions flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div className="footer-social-group flex items-center gap-2.5" aria-label={t('Media sosial')}>
                <span className="mr-1">{t('Media sosial')}</span>
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(label)}
                    title={t(label)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white/70 text-gray-600 transition-colors hover:border-brand-700 hover:bg-brand-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 dark:border-gray-800 dark:bg-transparent dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-900 dark:hover:text-white dark:focus-visible:outline-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Link to="/privasi" className="transition-colors hover:text-brand-700 dark:hover:text-gray-300">
                  {t('Kebijakan Privasi')}
                </Link>
                <span aria-hidden="true">·</span>
                <Link to="/kontak" className="transition-colors hover:text-brand-700 dark:hover:text-gray-300">
                  {t('Kontak')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
