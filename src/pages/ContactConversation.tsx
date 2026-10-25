import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, LoaderCircle, LockKeyhole, MessageSquareText, RefreshCw } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { apiRequest } from '../lib/api'

type ContactMessageTopic = 'ppdb' | 'program' | 'partnership' | 'other'

interface ContactConversation {
  message: {
    name: string
    topic: ContactMessageTopic
    message: string
    createdAt: string
  }
  replies: Array<{
    id: string
    body: string
    createdAt: string
  }>
}

const topicLabels: Record<ContactMessageTopic, string> = {
  ppdb: 'PPDB SMK',
  program: 'Program keahlian',
  partnership: 'Kerja sama',
  other: 'Lainnya',
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default function ContactConversationPage() {
  const { trackingCode = '' } = useParams()
  const [conversation, setConversation] = useState<ContactConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  usePageMeta('Percakapan Pesan', 'Lihat pesan dan balasan dari SMK BPPI Baleendah.')

  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const originalContent = robots?.content
    const createdRobots = robots ?? document.createElement('meta')
    if (!robots) {
      createdRobots.name = 'robots'
      document.head.append(createdRobots)
    }
    createdRobots.content = 'noindex, nofollow'

    return () => {
      if (robots && originalContent !== undefined) robots.content = originalContent
      else createdRobots.remove()
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    apiRequest<ContactConversation>('/contact/messages/conversation', {
      method: 'POST',
      body: JSON.stringify({ trackingCode }),
    })
      .then((response) => {
        if (active) setConversation(response)
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Percakapan belum dapat dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [trackingCode, refreshKey])

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gray-50 pt-24 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/kontak" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Kembali ke kontak
        </Link>

        <header className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" /> Percakapan website
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Pesan dan balasan</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">Balasan admin untuk formulir kontak Anda akan muncul di halaman ini.</p>
        </header>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-900 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Tautan ini bersifat privat. Simpan untuk membuka percakapan kembali dan jangan bagikan kepada orang lain.</p>
        </div>

        {loading ? (
          <div role="status" className="mt-6 flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-10 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> Memuat percakapan…
          </div>
        ) : error ? (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 dark:text-white">Percakapan belum dapat dibuka</h2>
            <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-300">{error}</p>
            <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Coba lagi
            </button>
          </div>
        ) : conversation ? (
          <section aria-label="Riwayat percakapan" className="mt-6 space-y-4">
            <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Pesan Anda · {topicLabels[conversation.message.topic]}</p>
                  <h2 className="mt-1 font-semibold text-gray-900 dark:text-white">{conversation.message.name}</h2>
                </div>
                <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={conversation.message.createdAt}>{formatDate(conversation.message.createdAt)}</time>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 dark:text-gray-300">{conversation.message.message}</p>
            </article>

            {conversation.replies.length > 0 ? conversation.replies.map((reply) => (
              <article key={reply.id} className="ml-4 rounded-2xl border border-brand-200 bg-brand-50/80 p-5 dark:border-brand-900 dark:bg-brand-950/30 sm:ml-10 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">Balasan SMK BPPI Baleendah</p>
                  <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={reply.createdAt}>{formatDate(reply.createdAt)}</time>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-gray-800 dark:text-gray-200">{reply.body}</p>
              </article>
            )) : (
              <div role="status" className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
                <MessageSquareText className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">Belum ada balasan</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Admin akan menambahkan balasan di sini. Perbarui halaman ini nanti untuk melihat kabar terbaru.</p>
              </div>
            )}

            <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Perbarui percakapan
            </button>
          </section>
        ) : null}
      </div>
    </main>
  )
}
