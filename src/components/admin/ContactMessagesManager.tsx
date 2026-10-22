import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Mail, Phone, Reply, RotateCcw, Trash2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useConfirmDialog } from '../../contexts/ConfirmDialogContext'
import { useLanguage } from '../../contexts/LanguageContext'

type MessageTopic = 'ppdb' | 'program' | 'partnership' | 'other'
type MessageStatus = 'unread' | 'read'

interface ContactMessage {
  id: string
  name: string
  phone: string
  email: string
  topic: MessageTopic
  message: string
  status: MessageStatus
  createdAt: string
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

  const pageCount = Math.max(1, data.pagination.pageCount)

  return (
    <section aria-labelledby="admin-contact-messages-heading" className="space-y-5">
      <div>
        <h2 id="admin-contact-messages-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
          Kotak pesan website
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Pesan dari formulir kontak tersimpan di database dan hanya dapat dibaca melalui panel admin.
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
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </p>
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
                  <a href={`mailto:${message.email}`} className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-brand-300">
                    <Mail className="h-4 w-4" aria-hidden="true" /> {message.email}
                  </a>
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

              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                <a
                  href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Tanggapan: ${topicLabels[message.topic]}`)}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                >
                  <Reply className="h-4 w-4" aria-hidden="true" /> Balas
                </a>
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
    </section>
  )
}
