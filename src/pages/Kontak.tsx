import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Clipboard, LoaderCircle, Mail, MapPin, Phone, Send } from 'lucide-react'
import { schoolProfile } from '../data/schoolProfile'
import { usePageMeta } from '../hooks/usePageMeta'
import { useLanguage } from '../contexts/LanguageContext'
import { apiRequest } from '../lib/api'

const privateThreadStoragePrefix = 'smk-bppi-private-thread:'
const activePrivateThreadStorageKey = 'smk-bppi-private-thread:active'
function getStoredPrivateThread(email: string) {
  try {
    return window.localStorage.getItem(`${privateThreadStoragePrefix}${email}`)
      ?? window.localStorage.getItem(activePrivateThreadStorageKey)
      ?? ''
  } catch {
    return ''
  }
}

function savePrivateThread(email: string, trackingCode: string) {
  try {
    window.localStorage.setItem(`${privateThreadStoragePrefix}${email}`, trackingCode)
    window.localStorage.setItem(activePrivateThreadStorageKey, trackingCode)
  } catch {
    // The conversation link remains available in the submission confirmation.
  }
}

export default function Kontak() {
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [conversationPath, setConversationPath] = useState('')
  const [continuedPreviousConversation, setContinuedPreviousConversation] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { t } = useLanguage()
  usePageMeta(
    t('Kontak'),
    `${t('Hubungi')} ${schoolProfile.name} ${schoolProfile.city} ${t('untuk informasi sekolah dan PPDB SMK.')}`,
  )

  useEffect(() => {
    if (!sent) return
    const frame = requestAnimationFrame(() => {
      const confirmation = document.getElementById('contact-result')
      confirmation?.scrollIntoView({ block: 'start' })
      confirmation?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [sent])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(event.currentTarget)
    const contactMessage = {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? '').trim().toLowerCase(),
      topic: String(form.get('topic') ?? 'other'),
      message: String(form.get('message') ?? ''),
    }

    setIsSending(true)
    setSubmitError('')
    try {
      const continuationTrackingCode = getStoredPrivateThread(contactMessage.email)
      const response = await apiRequest<{ ok: boolean; trackingCode: string; reusedConversation: boolean }>('/contact/messages', {
        method: 'POST',
        body: JSON.stringify({ ...contactMessage, continuationTrackingCode, replyChannel: 'website' }),
      })
      formElement.reset()
      savePrivateThread(contactMessage.email, response.trackingCode)
      setConversationPath(`/pesan/${response.trackingCode}`)
      setContinuedPreviousConversation(response.reusedConversation)
      setLinkCopied(false)
      setSent(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('Pesan belum dapat dikirim. Coba lagi.'))
    } finally {
      setIsSending(false)
    }
  }

  async function copyConversationLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${conversationPath}`)
      setLinkCopied(true)
    } catch {
      setLinkCopied(false)
    }
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
            {t('Kirim pertanyaan langsung melalui formulir ini. Pesan akan masuk ke sistem sekolah untuk ditindaklanjuti.')}
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
            {sent ? (
              <div id="contact-result" tabIndex={-1} className="scroll-mt-4 py-8 text-center outline-none" role="status" aria-live="polite">
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
                  {continuedPreviousConversation ? t('Pesan lanjutan terkirim') : t('Pesan berhasil dikirim')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-5">
                  {continuedPreviousConversation
                    ? t('Pesan ditambahkan ke percakapan privat sebelumnya. Gunakan tautan yang sama untuk membaca balasan sekolah.')
                    : t('Pesan tersimpan di website. Balasan sekolah akan muncul di percakapan privat ini. Simpan tautannya agar Anda bisa membukanya kembali.')}
                </p>
                {conversationPath && (
                  <div className="rounded-xl border border-emerald-200 bg-white p-4 text-left dark:border-emerald-900 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('Tautan percakapan privat')}</p>
                    <Link to={conversationPath} className="mt-2 block break-all text-sm font-medium text-brand-700 underline underline-offset-2 dark:text-brand-300">
                      {window.location.origin}{conversationPath}
                    </Link>
                    <button type="button" onClick={() => void copyConversationLink()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                      <Clipboard className="h-4 w-4" aria-hidden="true" /> {linkCopied ? t('Tautan disalin') : t('Salin tautan privat')}
                    </button>
                    <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{t('Siapa pun yang memiliki tautan ini dapat melihat pesan dan balasannya. Jangan bagikan ke orang lain.')}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setSent(false); setConversationPath(''); setContinuedPreviousConversation(false); setLinkCopied(false) }}
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                >
                  {t('Kirim pesan lain')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="public-form space-y-5">
                {submitError && (
                  <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {submitError}
                  </p>
                )}
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
                      minLength={2}
                      maxLength={80}
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
                      maxLength={32}
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
                    maxLength={254}
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
                <div className="rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
                  <p className="font-semibold">{t('Balasan melalui percakapan privat')}</p>
                  <p className="mt-1">{t('Setelah mengirim pesan, simpan tautan percakapan yang muncul. Buka kembali tautan itu untuk membaca dan membalas pesan sekolah.')}</p>
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
                    <option value="ppdb">{t('PPDB SMK')}</option>
                    <option value="program">{t('Program keahlian')}</option>
                    <option value="partnership">{t('Kerja sama')}</option>
                    <option value="other">{t('Lainnya')}</option>
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
                    minLength={10}
                    maxLength={3000}
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
                  disabled={isSending}
                  className={[
                    'w-full flex items-center justify-center gap-2',
                    'bg-brand-700 hover:bg-brand-800 text-white font-semibold',
                    'disabled:cursor-wait disabled:opacity-70',
                    'px-6 py-3.5 rounded-xl transition-colors text-sm',
                    'focus-visible:outline focus-visible:outline-2',
                    'focus-visible:outline-offset-2',
                    'focus-visible:outline-brand-700',
                  ].join(' ')}
                >
                  {isSending ? t('Mengirim pesan…') : t('Kirim Pesan')}
                  {isSending
                    ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    : <Send className="w-4 h-4" aria-hidden="true" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
