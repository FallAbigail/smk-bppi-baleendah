import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Copy, Mail, MessageSquareText, Phone, Reply, RotateCcw, Send, Trash2, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useConfirmDialog } from '../../contexts/ConfirmDialogContext'
import { useLanguage } from '../../contexts/LanguageContext'

type MessageTopic = 'ppdb' | 'program' | 'partnership' | 'other'
type MessageStatus = 'unread' | 'read'
type ReplyChannel = 'website' | 'email'

interface ContactMessageReply {
  id: string
  body: string
  createdAt: string
}

interface ContactMessage {
  id: string
  name: string
  phone: string
  email: string
  topic: MessageTopic
  message: string
  status: MessageStatus
  createdAt: string
  hasPrivateThread: boolean
  replies: ContactMessageReply[]
}

interface ContactMessagesResponse {
  messages: ContactMessage[]
  summary: { total: number; unread: number }
  pagination: { page: number; pageCount: number; pageSize: number }
}

const topicLabels: Record<MessageTopic, string> = {
  ppdb: 'PPDB SMK',
  program: 'Program keahlian',
  partnership: 'Kerja sama',
  other: 'Lainnya',
}

const emptyResponse: ContactMessagesResponse = {
  messages: [],
  summary: { total: 0, unread: 0 },
  pagination: { page: 1, pageCount: 0, pageSize: 12 },
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function ContactMessagesManager() {
  const confirm = useConfirmDialog()
  const { t } = useLanguage()
  const [data, setData] = useState(emptyResponse)
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [replyingTo, setReplyingTo] = useState<ContactMessage | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replyChannel, setReplyChannel] = useState<ReplyChannel>('website')
  const [copyNotice, setCopyNotice] = useState('')
  const [privateReplyLink, setPrivateReplyLink] = useState('')
  const [privateLinkCopied, setPrivateLinkCopied] = useState(false)
  const replyDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = replyDialogRef.current
    if (!dialog) return

    if (replyingTo && !dialog.open) dialog.showModal()
    if (!replyingTo && dialog.open) dialog.close()
  }, [replyingTo])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiRequest<ContactMessagesResponse>(`/admin/contact-messages?page=${page}`)
      .then((response) => {
        if (!active) return
        setData(response)
        if (response.pagination.page !== page) setPage(response.pagination.page)
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Pesan belum dapat dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, refreshKey])

  async function updateStatus(message: ContactMessage) {
    const nextStatus: MessageStatus = message.status === 'unread' ? 'read' : 'unread'
    setPendingId(message.id)
    setError('')
    setNotice('')
    try {
      await apiRequest<{ ok: boolean }>(`/admin/contact-messages/${encodeURIComponent(message.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      setNotice(nextStatus === 'read' ? 'Pesan ditandai sudah dibaca.' : 'Pesan ditandai belum dibaca.')
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Status pesan belum dapat diperbarui.')
    } finally {
      setPendingId(null)
    }
  }

  async function deleteMessage(message: ContactMessage) {
    const confirmed = await confirm({
      title: t('Hapus pesan?'),
      description: `${t('Pesan dari')} ${message.name} ${t('akan dihapus. Tindakan ini tidak dapat dibatalkan.')}`,
      confirmLabel: t('Hapus pesan'),
      tone: 'danger',
    })
    if (!confirmed) return
    setPendingId(message.id)
    setError('')
    setNotice('')
    try {
      await apiRequest<{ ok: boolean }>(`/admin/contact-messages/${encodeURIComponent(message.id)}`, {
        method: 'DELETE',
      })
      setNotice(`Pesan dari ${message.name} berhasil dihapus.`)
      if (data.messages.length === 1 && page > 1) setPage((current) => current - 1)
      else setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Pesan belum dapat dihapus.')
    } finally {
      setPendingId(null)
    }
  }

  function openReply(message: ContactMessage) {
    setReplyingTo(message)
    setReplySubject(`Re: ${topicLabels[message.topic]}`)
    setReplyBody('')
    setReplyChannel('website')
    setCopyNotice('')
    setPrivateReplyLink('')
    setPrivateLinkCopied(false)
    setError('')
  }

  async function sendWebsiteReply() {
    if (!replyingTo?.hasPrivateThread || !replyBody.trim()) return
    setPendingId(replyingTo.id)
    setError('')
    setNotice('')
    try {
      const response = await apiRequest<{ reply: ContactMessageReply; trackingCode?: string }>(`/admin/contact-messages/${encodeURIComponent(replyingTo.id)}/replies`, {
        method: 'POST',
        body: JSON.stringify({ body: replyBody }),
      })
      setNotice(response.trackingCode
        ? `Balasan tersimpan untuk ${replyingTo.name}. Salin dan bagikan tautan privat ini agar pengirim dapat membacanya.`
        : `Balasan untuk ${replyingTo.name} tersimpan di percakapan website.`)
      if (response.trackingCode) setPrivateReplyLink(`${window.location.origin}/pesan/${response.trackingCode}`)
      setReplyingTo(null)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Balasan belum dapat disimpan.')
    } finally {
      setPendingId(null)
    }
  }

  async function copyReply() {
    try {
      const text = replyChannel === 'email'
        ? `Kepada: ${replyingTo?.email ?? ''}\nSubjek: ${replySubject}\n\n${replyBody}`
        : replyBody
      await navigator.clipboard.writeText(text)
      setCopyNotice(replyChannel === 'email' ? 'Draf email disalin.' : 'Balasan disalin.')
    } catch {
      setCopyNotice('Teks belum dapat disalin dari browser ini. Pilih dan salin teks balasan secara manual.')
    }
  }

  async function copyPrivateReplyLink() {
    try {
      await navigator.clipboard.writeText(privateReplyLink)
      setPrivateLinkCopied(true)
    } catch {
      setPrivateLinkCopied(false)
    }
  }

  const pageCount = Math.max(1, data.pagination.pageCount)

  return (
    <section aria-labelledby="admin-contact-messages-heading" className="space-y-5">
      <div>
        <h2 id="admin-contact-messages-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
          Kotak pesan website
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Balasan melalui website akan tersimpan di sini dan bisa dibaca pengirim lewat tautan percakapan privat.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <span className="block text-xs text-gray-500 dark:text-gray-400">Total pesan</span>
          <span className="mt-1 block text-xl font-bold text-gray-900 dark:text-white">{data.summary.total}</span>
        </div>
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 dark:border-brand-900 dark:bg-brand-950/50">
          <span className="block text-xs text-brand-800 dark:text-brand-300">Belum dibaca</span>
          <span className="mt-1 block text-xl font-bold text-brand-900 dark:text-brand-100">{data.summary.unread}</span>
        </div>
      </div>

      {notice && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          <p>{notice}</p>
          {privateReplyLink && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <a href={privateReplyLink} className="min-w-0 break-all font-medium underline underline-offset-2">{privateReplyLink}</a>
              <button type="button" onClick={() => void copyPrivateReplyLink()} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold transition hover:bg-emerald-100 dark:border-emerald-800 dark:hover:bg-emerald-950">
                <Copy className="h-3.5 w-3.5" aria-hidden="true" /> {privateLinkCopied ? 'Tautan disalin' : 'Salin tautan'}
              </button>
            </div>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Memuat pesan…
        </div>
      ) : data.messages.length ? (
        <div className="space-y-3">
          {data.messages.map((message) => (
            <article key={message.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{message.name}</h3>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {topicLabels[message.topic]}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${message.status === 'unread' ? 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {message.status === 'unread' ? 'Belum dibaca' : 'Sudah dibaca'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(message.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium text-brand-700 dark:text-brand-300">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {message.email}
                  </span>
                  {message.phone && (
                    <a href={`tel:${message.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:underline dark:text-gray-300">
                      <Phone className="h-4 w-4" aria-hidden="true" /> {message.phone}
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {message.message}
              </p>

              {message.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-brand-200 pl-4 dark:border-brand-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">Balasan dari sekolah</p>
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="rounded-lg bg-brand-50/70 px-3 py-2.5 dark:bg-brand-950/30">
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-200">{reply.body}</p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(reply.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => openReply(message)}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                >
                  <Reply className="h-4 w-4" aria-hidden="true" /> Balas
                </button>
                <button
                  type="button"
                  disabled={pendingId === message.id}
                  onClick={() => void updateStatus(message)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {message.status === 'unread' ? <Check className="h-4 w-4" aria-hidden="true" /> : <RotateCcw className="h-4 w-4" aria-hidden="true" />}
                  {message.status === 'unread' ? 'Tandai dibaca' : 'Tandai belum dibaca'}
                </button>
                <button
                  type="button"
                  disabled={pendingId === message.id}
                  onClick={() => void deleteMessage(message)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Hapus
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <Mail className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Belum ada pesan masuk.</p>
        </div>
      )}

      {!loading && data.pagination.pageCount > 1 && (
        <nav aria-label="Halaman pesan" className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <span className="text-sm text-gray-500 dark:text-gray-400">Halaman {data.pagination.page} dari {pageCount}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Sebelumnya
            </button>
            <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300">
              Berikutnya <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}

      <dialog
        ref={replyDialogRef}
        aria-labelledby="contact-reply-heading"
        aria-describedby="contact-reply-description"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,38rem)] max-w-none overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-gray-950/50 backdrop:backdrop-blur-[2px] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        onClose={() => setReplyingTo(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close()
        }}
      >
        {replyingTo && (
          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="contact-reply-heading" className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">Tanggapi pesan</h2>
                <p id="contact-reply-description" className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  Pesan dari {replyingTo.name} tentang {topicLabels[replyingTo.topic]}.
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup composer balasan"
                onClick={() => replyDialogRef.current?.close()}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800" aria-label="Kanal balasan">
              <button type="button" aria-pressed={replyChannel === 'website'} onClick={() => { setReplyChannel('website'); setCopyNotice('') }} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${replyChannel === 'website' ? 'bg-white text-brand-800 shadow-sm dark:bg-gray-700 dark:text-brand-200' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
                <MessageSquareText className="h-4 w-4" aria-hidden="true" /> Website
              </button>
              <button type="button" aria-pressed={replyChannel === 'email'} onClick={() => { setReplyChannel('email'); setCopyNotice('') }} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${replyChannel === 'email' ? 'bg-white text-brand-800 shadow-sm dark:bg-gray-700 dark:text-brand-200' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`}>
                <Mail className="h-4 w-4" aria-hidden="true" /> Email <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-600 dark:text-gray-200">Disiapkan</span>
              </button>
            </div>

            {replyChannel === 'website' ? (
              replyingTo.hasPrivateThread ? (
                <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2.5 text-xs leading-5 text-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
                  Balasan akan tersimpan di percakapan website. Pengirim bisa membacanya lewat tautan privat yang muncul setelah mengirim formulir.
                </p>
              ) : (
                <p role="status" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  Pesan ini belum memiliki tautan privat. Tautan akan dibuat saat balasan pertama dikirim; salin dan bagikan ke pengirim agar ia bisa membuka percakapan.
                </p>
              )
            ) : (
              <div className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                <div>
                  <label htmlFor="contact-reply-to" className="mb-1.5 block text-xs font-semibold text-amber-950 dark:text-amber-100">Penerima</label>
                  <input id="contact-reply-to" readOnly value={replyingTo.email} className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none dark:border-amber-900 dark:bg-gray-900 dark:text-gray-200" />
                </div>
                <div>
                  <label htmlFor="contact-reply-subject" className="mb-1.5 block text-xs font-semibold text-amber-950 dark:text-amber-100">Subjek email</label>
                  <input id="contact-reply-subject" value={replySubject} onChange={(event) => setReplySubject(event.target.value)} className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-amber-900 dark:bg-gray-900 dark:text-white" />
                </div>
                <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">Pengiriman email belum aktif. Tampilan ini sudah disiapkan dan bisa dihubungkan setelah SMTP atau penyedia email server dikonfigurasi.</p>
              </div>
            )}

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Pesan asli · {formatDate(replyingTo.createdAt)}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-200">{replyingTo.message}</p>
            </div>

            <div className="mt-4">
              <label htmlFor="contact-reply-body" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{replyChannel === 'website' ? 'Balasan untuk website' : 'Isi email'}</label>
              <textarea id="contact-reply-body" rows={7} maxLength={3000} value={replyBody} onChange={(event) => { setReplyBody(event.target.value); setCopyNotice('') }} placeholder={replyChannel === 'website' ? 'Tulis balasan yang akan dibaca pengirim di website…' : 'Tulis isi email…'} className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm leading-6 text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-brand-950" />
              <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">{replyBody.length}/3.000</p>
            </div>

            {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
            {copyNotice && <p role="status" className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">{copyNotice}</p>}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button type="button" onClick={() => replyDialogRef.current?.close()} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                Batal
              </button>
              <button type="button" onClick={() => void copyReply()} disabled={!replyBody.trim()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                <Copy className="h-4 w-4" aria-hidden="true" /> {replyChannel === 'website' ? 'Salin balasan' : 'Salin draf email'}
              </button>
              {replyChannel === 'website' ? (
                <button type="button" disabled={!replyBody.trim() || pendingId === replyingTo.id} onClick={() => void sendWebsiteReply()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
                  <Send className="h-4 w-4" aria-hidden="true" /> {pendingId === replyingTo.id ? 'Menyimpan…' : 'Kirim balasan website'}
                </button>
              ) : (
                <button type="button" disabled className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  <Mail className="h-4 w-4" aria-hidden="true" /> Kirim email · belum aktif
                </button>
              )}
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
