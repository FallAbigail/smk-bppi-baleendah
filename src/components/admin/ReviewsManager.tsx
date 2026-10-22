import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useConfirmDialog } from '../../contexts/ConfirmDialogContext'
import { useLanguage } from '../../contexts/LanguageContext'

type ReviewerRole = 'alumni' | 'student' | 'parent'
type ReviewFilter = 'all' | 'low'

interface Review {
  id: string
  name: string
  role: ReviewerRole
  rating: number
  comment: string
  createdAt: string
}

interface ReviewSummary {
  count: number
  average: number
}

interface ReviewPagination {
  page: number
  pageCount: number
  pageSize: number
}

interface ReviewListResponse {
  reviews: Review[]
  summary: ReviewSummary
  pagination: ReviewPagination
}

const roleLabels: Record<ReviewerRole, string> = {
  alumni: 'Alumni',
  student: 'Siswa',
  parent: 'Orang tua',
}

const emptySummary: ReviewSummary = { count: 0, average: 0 }
const emptyPagination: ReviewPagination = { page: 1, pageCount: 0, pageSize: 12 }

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

export default function ReviewsManager() {
  const confirm = useConfirmDialog()
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState(emptySummary)
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const query = new URLSearchParams({ page: String(page) })
    if (filter === 'low') query.set('filter', 'low')

    setLoading(true)
    setLoadError('')
    apiRequest<ReviewListResponse>(`/admin/reviews?${query.toString()}`)
      .then((payload) => {
        if (!active) return
        setReviews(payload.reviews)
        setSummary(payload.summary)
        setPagination(payload.pagination)
        if (payload.pagination.page !== page) setPage(payload.pagination.page)
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Ulasan belum dapat dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filter, page, refreshKey])

  function changeFilter(nextFilter: ReviewFilter) {
    if (nextFilter === filter) return
    setFilter(nextFilter)
    setPage(1)
    setNotice('')
  }

  async function removeReview(review: Review) {
    const confirmed = await confirm({
      title: t('Hapus ulasan?'),
      description: `${t('Ulasan dari')} ${review.name} ${t('dengan rating')} ${review.rating}/5 ${t('akan dihapus. Tindakan ini tidak dapat dibatalkan.')}`,
      confirmLabel: t('Hapus ulasan'),
      tone: 'danger',
    })
    if (!confirmed) return

    setRemovingId(review.id)
    setLoadError('')
    setNotice('')
    try {
      await apiRequest<{ ok: boolean }>(`/admin/reviews/${encodeURIComponent(review.id)}`, {
        method: 'DELETE',
      })
      setNotice(`Ulasan dari ${review.name} berhasil dihapus.`)
      if (reviews.length === 1 && page > 1) setPage((current) => current - 1)
      else setRefreshKey((current) => current + 1)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Ulasan belum dapat dihapus.')
    } finally {
      setRemovingId(null)
    }
  }

  const pageCount = Math.max(1, pagination.pageCount)
  const average = summary.count
    ? summary.average.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : '—'

  return (
    <section aria-labelledby="admin-reviews-heading" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="admin-reviews-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
            Ulasan publik
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Ulasan baru dari formulir situs tersimpan di database dan tampil untuk publik. Gunakan filter rating rendah untuk meninjau masukan 1–2 bintang.
          </p>
        </div>
        <div className="flex w-fit rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-900">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => changeFilter('all')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${filter === 'all' ? 'bg-brand-700 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
          >
            Semua
          </button>
          <button
            type="button"
            aria-pressed={filter === 'low'}
            onClick={() => changeFilter('low')}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${filter === 'low' ? 'bg-red-700 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
          >
            Rating rendah
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {summary.count} ulasan{filter === 'low' ? ' dengan rating 1–2' : ''}
        </p>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" aria-hidden="true" />
          {average} / 5
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </p>
      )}
      {loadError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {loadError}
        </p>
      )}

      {loading ? (
        <div role="status" className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          Memuat ulasan…
        </div>
      ) : reviews.length ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{review.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">· {roleLabels[review.role]}</span>
                    {review.rating <= 2 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                        Rating rendah
                      </span>
                    )}
                  </div>
                  <time dateTime={review.createdAt} className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="flex items-center gap-0.5" aria-label={`Rating ${review.rating} dari 5`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${value <= review.rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <button
                    type="button"
                    disabled={removingId === review.id}
                    onClick={() => void removeReview(review)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {removingId === review.id ? 'Menghapus…' : 'Hapus'}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="font-semibold text-gray-900 dark:text-white">
            {filter === 'low' ? 'Tidak ada ulasan dengan rating rendah.' : 'Belum ada ulasan yang masuk.'}
          </p>
        </div>
      )}

      {pagination.pageCount > 1 && (
        <nav aria-label="Halaman ulasan admin" className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Sebelumnya
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">{page} / {pageCount}</span>
          <button
            type="button"
            disabled={page >= pagination.pageCount || loading}
            onClick={() => setPage((current) => Math.min(pagination.pageCount, current + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            Berikutnya <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  )
}
