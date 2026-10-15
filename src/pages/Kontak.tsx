import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react'
import { schoolProfile } from '../data/schoolProfile'
import { usePageMeta } from '../hooks/usePageMeta'
import { useLanguage } from '../contexts/LanguageContext'

export default function Kontak() {
  const [emailReady, setEmailReady] = useState(false)
  const { t } = useLanguage()
  usePageMeta(
    t('Kontak'),
    `${t('Hubungi')} ${schoolProfile.name} ${schoolProfile.city} ${t('untuk informasi sekolah dan PPDB SMK.')}`,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '')
    const phone = String(form.get('phone') ?? '')
    const email = String(form.get('email') ?? '')
    const topic = String(form.get('topic') ?? t('Informasi umum'))
    const message = String(form.get('message') ?? '')
    const subject = encodeURIComponent(`${t('Pesan website')} — ${topic}`)
    const body = encodeURIComponent(
      `${t('Nama')}: ${name}\n${t('Telepon')}: ${phone || '-'}\nEmail: ${email}\n${t('Keperluan')}: ${topic}\n\n${t('Pesan')}:\n${message}`,
    )

    setEmailReady(true)
    window.location.href = `mailto:${schoolProfile.email}?subject=${subject}&body=${body}`
  }

  const contactItems = [
    {
      icon: <MapPin className="w-5 h-5" aria-hidden="true" />,
      title: 'Alamat',
      value: schoolProfile.address,
      href: schoolProfile.googleMapsUrl,
    },
    {
      icon: <Phone className="w-5 h-5" aria-hidden="true" />,
      title: 'Telepon',
      value: schoolProfile.phoneDisplay,
      href: `tel:${schoolProfile.phoneHref}`,
    },
    {
      icon: <Mail className="w-5 h-5" aria-hidden="true" />,
      title: 'Email',
      value: schoolProfile.email,
      href: `mailto:${schoolProfile.email}`,
    },
  ]

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span
            className={[
              'inline-block bg-brand-50 dark:bg-brand-950',
              'text-brand-700 dark:text-brand-400 text-sm font-semibold',
              'px-4 py-1.5 rounded-full mb-4',
            ].join(' ')}
          >
            {t('Hubungi Kami')}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('Ada Pertanyaan?')}{' '}
            <span className="text-brand-700 dark:text-brand-400">{t('Kami Siap Membantu')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {t('Hubungi sekolah melalui telepon, email, atau tulis pesan. Formulir akan menyiapkan email di aplikasi Anda.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div className="space-y-4">
            {contactItems.map((item) => {
              const cardContent = (
                <>
                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400',
                    ].join(' ')}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {t(item.title)}
                    </p>
                    <p className="break-words text-gray-600 dark:text-gray-300 text-sm mt-0.5">
                      {t(item.value)}
                    </p>
                  </div>
                </>
              )
              const cardClass =
                'flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700'

              return item.href ? (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.title === 'Alamat' ? '_blank' : undefined}
                  rel={item.title === 'Alamat' ? 'noopener noreferrer' : undefined}
                  aria-label={
                    item.title === 'Alamat'
                      ? `${t('Buka alamat sekolah di Google Maps')}: ${item.value}`
                      : `${t(item.title)}: ${item.value}`
                  }
                  className={[
                    cardClass,
                    'transition-colors hover:border-brand-200 dark:hover:border-brand-800',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    'focus-visible:outline-brand-700',
                  ].join(' ')}
                >
                  {cardContent}
                </a>
              ) : (
                <div key={item.title} className={cardClass}>
                  {cardContent}
                </div>
              )
            })}
            <Link
              to="/informasi"
              className={[
                'inline-flex items-center gap-2 text-sm font-semibold',
                'text-brand-700 dark:text-brand-400 hover:underline',
              ].join(' ')}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t('Lihat informasi sekolah')}
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
            {emailReady ? (
              <div className="text-center py-8" role="status" aria-live="polite">
                <div
                  className={[
                    'w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950',
                    'text-emerald-600 dark:text-emerald-400 flex items-center',
                    'justify-center mx-auto mb-4',
                  ].join(' ')}
                >
                  <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('Email Siap Dikirim')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-5">
                  {t('Aplikasi email Anda akan terbuka. Pesan baru terkirim setelah Anda menekan tombol kirim di aplikasi tersebut.')}
                </p>
                <a
                  href={`mailto:${schoolProfile.email}`}
                  className="font-semibold text-brand-700 dark:text-brand-400 underline underline-offset-4"
                >
                  {t('Buka email secara langsung')}
                </a>
                <button
                  type="button"
                  onClick={() => setEmailReady(false)}
                  className="mt-5 block w-full text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  {t('Ubah pesan')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <p
                  className={[
                    'rounded-xl bg-brand-50 dark:bg-brand-950/60 px-4 py-3',
                    'text-sm leading-relaxed text-brand-900',
                    'dark:text-brand-200',
                  ].join(' ')}
                >
                  {t('Situs ini tidak menyimpan pesan. Formulir menyiapkan email di perangkat Anda; pengiriman dilakukan dari aplikasi email.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      {t('Nama Lengkap')}{' '}
                      <span className="text-red-500" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder={t('Masukkan nama lengkap')}
                      className={[
                        'w-full px-4 py-3 rounded-xl border border-gray-200',
                        'dark:border-gray-700 bg-white dark:bg-gray-900',
                        'text-gray-900 dark:text-white placeholder-gray-400',
                        'dark:placeholder-gray-500 focus:border-brand-500',
                        'focus:ring-2 focus:ring-brand-100',
                        'dark:focus:ring-brand-900 outline-none transition',
                        'text-sm',
                      ].join(' ')}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      {t('Nomor Telepon')}
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="08xxxxxxxxxx"
                      className={[
                        'w-full px-4 py-3 rounded-xl border border-gray-200',
                        'dark:border-gray-700 bg-white dark:bg-gray-900',
                        'text-gray-900 dark:text-white placeholder-gray-400',
                        'dark:placeholder-gray-500 focus:border-brand-500',
                        'focus:ring-2 focus:ring-brand-100',
                        'dark:focus:ring-brand-900 outline-none transition',
                        'text-sm',
                      ].join(' ')}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Email{' '}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className={[
                      'w-full px-4 py-3 rounded-xl border border-gray-200',
                      'dark:border-gray-700 bg-white dark:bg-gray-900',
                      'text-gray-900 dark:text-white placeholder-gray-400',
                      'dark:placeholder-gray-500 focus:border-brand-500',
                      'focus:ring-2 focus:ring-brand-100',
                      'dark:focus:ring-brand-900 outline-none transition',
                      'text-sm',
                    ].join(' ')}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-topic"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t('Keperluan')}
                  </label>
                  <select
                    id="contact-topic"
                    name="topic"
                    className={[
                      'w-full px-4 py-3 rounded-xl border border-gray-200',
                      'dark:border-gray-700 bg-white dark:bg-gray-900',
                      'text-gray-700 dark:text-gray-300 focus:border-brand-500',
                      'focus:ring-2 focus:ring-brand-100',
                      'dark:focus:ring-brand-900 outline-none transition',
                      'text-xs sm:text-sm',
                    ].join(' ')}
                  >
                    <option value={t('Informasi penerimaan SMK')}>{t('PPDB SMK')}</option>
                    <option value={t('Informasi program keahlian')}>
                      {t('Program keahlian')}
                    </option>
                    <option>{t('Kerja sama')}</option>
                    <option>{t('Lainnya')}</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t('Pesan')}{' '}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    placeholder={t('Tulis pesan Anda di sini...')}
                    className={[
                      'w-full px-4 py-3 rounded-xl border border-gray-200',
                      'dark:border-gray-700 bg-white dark:bg-gray-900',
                      'text-gray-900 dark:text-white placeholder-gray-400',
                      'dark:placeholder-gray-500 focus:border-brand-500',
                      'focus:ring-2 focus:ring-brand-100',
                      'dark:focus:ring-brand-900 outline-none transition',
                      'text-sm resize-y',
                    ].join(' ')}
                  />
                </div>
                <button
                  type="submit"
                  className={[
                    'w-full flex items-center justify-center gap-2',
                    'bg-brand-700 hover:bg-brand-800 text-white font-semibold',
                    'px-6 py-3.5 rounded-xl transition-colors text-sm',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2',
                    'focus-visible:outline-brand-700',
                  ].join(' ')}
                >
                  {t('Siapkan Email')}
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
