import { FormEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ArrowLeft, ArrowRight, Filter, MessageSquareText, Star, X } from 'lucide-react'
import { useMobileLayout } from '../../hooks/useMobileLayout'
import { ApiError, apiRequest } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'

type ReviewerRole = 'alumni' | 'student' | 'parent'

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

interface ReviewListResponse {
  reviews: Review[]
  summary: ReviewSummary
  pagination: ReviewPagination
}

interface ReviewPagination {
  page: number
  pageCount: number
  pageSize: number
}

const roleLabels: Record<ReviewerRole, string> = {
  alumni: 'Alumni',
  student: 'Siswa',
  parent: 'Orang tua',
}

const emptySummary: ReviewSummary = { count: 0, average: 0 }
const emptyPagination: ReviewPagination = { page: 1, pageCount: 0, pageSize: 3 }
const reviewSlideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 48 : -48 }),
  visible: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -48 : 48 }),
}

export default function CommunityReviews() {
  const { language, t } = useLanguage()
  const mobile = useMobileLayout()
  const [mobileReviewRail, setMobileReviewRail] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches,
  )
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState(emptySummary)
  const [pagination, setPagination] = useState(emptyPagination)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [writingReview, setWritingReview] = useState(false)
  const reviewNameRef = useRef<HTMLInputElement>(null)
  const writeButtonRef = useRef<HTMLButtonElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [slideDirection, setSlideDirection] = useState(1)
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<ReviewerRole>('alumni')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const syncLayout = () => setMobileReviewRail(mediaQuery.matches)
    syncLayout()
    mediaQuery.addEventListener('change', syncLayout)
    return () => mediaQuery.removeEventListener('change', syncLayout)
  }, [])

  useEffect(() => {
    let active = true
    const ratingQuery = ratingFilter === null ? '' : `&rating=${ratingFilter}`
    apiRequest<ReviewListResponse>(`/reviews?page=${page}${ratingQuery}`)
      .then((payload) => {
        if (!active) return
        setReviews(payload.reviews)
        setSummary(payload.summary)
        setPagination(payload.pagination)
        setLoadError('')
      })
      .catch(() => {
        if (active) setLoadError(t('Ulasan belum dapat dimuat. Coba muat ulang halaman.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, ratingFilter, t])

  useEffect(() => {
    if (!submitted) return

    const timeoutId = window.setTimeout(() => setSubmitted(false), 5000)
    return () => window.clearTimeout(timeoutId)
  }, [submitted])

  useEffect(() => {
    if (!writingReview || !mobile) return
    const frame = requestAnimationFrame(() => {
      document.getElementById('review-form')?.scrollIntoView({ block: 'start' })
      reviewNameRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [writingReview, mobile])

  useEffect(() => {
    if (!filterOpen) return
    const dismissOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !filterRef.current?.contains(event.target)) {
        setFilterOpen(false)
      }
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setFilterOpen(false)
      filterRef.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [filterOpen])

  function closeReviewForm() {
    setWritingReview(false)
    writeButtonRef.current?.focus({ preventScroll: true })
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > pagination.pageCount || nextPage === page) return
    setSlideDirection(nextPage > page ? 1 : -1)
    setExpandedReviewId(null)
    setPage(nextPage)
  }

  function selectRatingFilter(nextRating: number | null) {
    setFilterOpen(false)
    if (nextRating === ratingFilter) return
    setRatingFilter(nextRating)
    setPage(1)
    setExpandedReviewId(null)
    setLoading(true)
  }

  function handleReviewSwipe(offset: number, velocity: number) {
    if (offset < -70 || velocity < -500) goToPage(page + 1)
    else if (offset > 70 || velocity > 500) goToPage(page - 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (rating < 1 || rating > 5) {
      setSubmitError(t('Pilih rating dari 1 sampai 5 bintang.'))
      return
    }
    setSubmitting(true)
    setSubmitError('')
    setSubmitted(false)

    try {
      const payload = await apiRequest<{
        review: Review
        summary: ReviewSummary
        pagination: ReviewPagination
      }>('/reviews', {
        method: 'POST',
        body: JSON.stringify({ name, role, rating, comment }),
      })
      setSummary(payload.summary)
      setPagination(payload.pagination)
      setSlideDirection(-1)
      setExpandedReviewId(null)
      setPage(1)
      if (page === 1 && ratingFilter === null) {
        setReviews((current) => [payload.review, ...current].slice(0, payload.pagination.pageSize))
      } else {
        setRatingFilter(null)
        setLoading(true)
      }
      setComment('')
      setRating(0)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 0
          ? t('Ulasan gagal dikirim. Periksa koneksi lalu coba lagi.')
          : error instanceof Error
            ? t(error.message)
            : t('Ulasan gagal dikirim. Coba lagi.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const formattedAverage = summary.count
    ? summary.average.toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
    : '—'

  const ratingFilterControl = (
            <div ref={filterRef} className="relative shrink-0">
              <button
                type="button"
                aria-label={ratingFilter === null ? t('Filter ulasan') : `${t('Filter ulasan')}: ${ratingFilter} ${t('bintang')}`}
                aria-expanded={filterOpen}
                aria-controls="review-rating-filter"
                title={t('Filter ulasan')}
                onClick={() => setFilterOpen((open) => !open)}
                className={`relative inline-flex h-9 w-9 items-center justify-center max-lg:h-11 max-lg:w-auto max-lg:gap-2 max-lg:px-3 rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  ratingFilter !== null
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-brand-500 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:text-brand-300'
                }`}
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-semibold lg:hidden">{t('Filter ulasan')}</span>
                {ratingFilter !== null && (
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-none text-white">
                    {ratingFilter}
                  </span>
                )}
              </button>
              {filterOpen && (
                <div
                  id="review-rating-filter"
                  role="group"
                  aria-label={t('Filter berdasarkan rating')}
                  className="absolute right-0 top-full z-30 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900"
                >
                  <p className="px-2 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('Filter berdasarkan rating')}
                  </p>
                  <button
                    type="button"
                    aria-pressed={ratingFilter === null}
                    onClick={() => selectRatingFilter(null)}
                    className={`flex w-full items-center justify-between min-h-11 rounded-lg px-2 py-2 lg:min-h-0 text-left text-sm transition ${
                      ratingFilter === null
                        ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t('Semua rating')}
                  </button>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} ${t('bintang')}`}
                      aria-pressed={ratingFilter === value}
                      onClick={() => selectRatingFilter(value)}
                      className={`flex w-full items-center justify-between min-h-11 rounded-lg px-2 py-2 lg:min-h-0 text-sm transition ${
                        ratingFilter === value
                          ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span>{value} {t('bintang')}</span>
                      <span className="flex text-amber-500" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-3.5 w-3.5 ${star <= value ? 'fill-current' : ''}`} />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
  )

  const reviewForm = (
        <form
          id="review-form"
          onSubmit={handleSubmit}
          className="public-form mb-6 rounded-2xl max-lg:mt-6 max-lg:scroll-mt-32 border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('Tulis ulasan')}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {t('Ulasan dan nama yang ditampilkan dapat dibaca publik.')}
              </p>
            </div>
            {mobile ? (
            <button type="button" onClick={closeReviewForm} aria-label={t('Tutup formulir')} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            ) : ratingFilterControl}
          </div>

          <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <label htmlFor="review-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('Nama yang ditampilkan')}
              </label>
              <input
                ref={reviewNameRef}
                id="review-name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="review-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('Saya adalah')}
              </label>
              <select
                id="review-role"
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value as ReviewerRole)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                {(Object.keys(roleLabels) as ReviewerRole[]).map((value) => (
                  <option key={value} value={value}>{t(roleLabels[value])}</option>
                ))}
              </select>
            </div>

            <fieldset className="sm:col-span-2 lg:col-span-3">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('Rating Anda')}
              </legend>
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} ${t('bintang')}`}
                    aria-pressed={rating === value}
                    onClick={() => setRating(value)}
                    className="rounded p-1 text-amber-500 max-lg:inline-flex max-lg:h-11 max-lg:w-11 max-lg:items-center max-lg:justify-center outline-none transition hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Star className={`h-6 w-6 ${value <= rating ? 'fill-current' : ''}`} aria-hidden="true" />
                  </button>
                ))}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {rating ? `${rating}/5` : t('Pilih bintang')}
                </span>
              </div>
            </fieldset>

            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('Komentar')}
              </label>
              <textarea
                id="review-comment"
                name="comment"
                required
                minLength={10}
                maxLength={500}
                rows={2}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={t('Ceritakan pengalaman Anda…')}
                className="mt-1.5 w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-relaxed text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder:text-gray-500"
              />
              <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
                {comment.length}/500
              </p>
            </div>

            {(submitError || submitted) && (
              <div className="space-y-2 sm:col-span-2 lg:col-span-9">
                {submitError && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                    {submitError}
                  </p>
                )}
                {submitted && (
                  <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
                    {t('Terima kasih, ulasan Anda sudah ditampilkan.')}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || rating < 1}
              className="sm:col-span-2 lg:col-span-3 inline-flex w-full items-center justify-center self-end rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
            >
              {submitting ? t('Mengirim…') : t('Kirim ulasan')}
            </button>
          </div>
        </form>
  )

  return (
    <section className="community-reviews home-compact-section bg-gray-50 py-16 dark:bg-gray-950 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">
              {t('Cerita komunitas')}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              {t('Ulasan siswa dan alumni')}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {t('Bagikan pengalaman belajar dan kegiatan di sekolah ini.')}
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {formattedAverage}
            </span>
            <div>
              <div className="flex text-amber-500" aria-label={`${formattedAverage} ${t('dari 5 bintang')}`}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-4 w-4 ${summary.count && value <= Math.round(summary.average) ? 'fill-current' : ''}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {summary.count} {t('ulasan dibagikan')}
              </p>
            </div>
          </div>
        </div>

        {mobile ? (
        <div className="relative z-20 mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            ref={writeButtonRef}
            type="button"
            aria-expanded={writingReview}
            aria-controls="review-form"
            onClick={() => {
              setFilterOpen(false)
              if (writingReview) closeReviewForm()
              else setWritingReview(true)
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            {writingReview ? t('Tutup formulir') : t('Tulis ulasan')}
          </button>
            {ratingFilterControl}
        </div>
        ) : reviewForm}

        <div className="space-y-4" aria-live="polite">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              {t('Memuat ulasan…')}
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {loadError}
            </div>
          ) : reviews.length ? (
            <div>
              <div className="review-cards-viewport relative overflow-hidden">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={pagination.page}
                    custom={slideDirection}
                    variants={reviewSlideVariants}
                    initial="enter"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    drag={!mobileReviewRail && pagination.pageCount > 1 ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(_event, info) => handleReviewSwipe(info.offset.x, info.velocity.x)}
                    className={`home-mobile-rail review-cards-rail grid gap-4 ${reviews.length === 1 ? 'grid-cols-1' : reviews.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}
                    role="group"
                    aria-roledescription={t('slide')}
                    aria-label={`${t('Blok komentar')} ${pagination.page}`}
                    tabIndex={mobileReviewRail ? 0 : undefined}
                  >
                    {reviews.map((review) => (
                      <article
                        key={review.id}
                        className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-gray-900 dark:text-white">{review.name}</h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {t(roleLabels[review.role])}
                              <span aria-hidden="true"> · </span>
                              {new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
                                dateStyle: 'medium',
                              }).format(new Date(review.createdAt))}
                            </p>
                          </div>
                          <div className="flex shrink-0" aria-label={`${review.rating} ${t('dari 5 bintang')}`}>
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star
                                key={value}
                                className={`h-4 w-4 text-amber-500 ${value <= review.rating ? 'fill-current' : ''}`}
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                        </div>
                        <p className={`mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${expandedReviewId === review.id ? '' : 'line-clamp-3'}`}>
                          {review.comment}
                        </p>
                        {review.comment.length > 140 && (
                          <button
                            type="button"
                            onClick={() => setExpandedReviewId((current) => current === review.id ? null : review.id)}
                            className="mt-2 text-xs font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
                          >
                            {expandedReviewId === review.id ? t('Tampilkan lebih sedikit') : t('Baca selengkapnya')}
                          </button>
                        )}
                      </article>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <nav className="mt-4 flex justify-center" aria-label={t('Navigasi blok komentar')}>
                <div className="flex max-w-full items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    aria-label={t('Blok sebelumnya')}
                    className="inline-flex h-11 w-11 shrink-0 items-center lg:h-10 lg:w-10 justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-brand-300"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="flex min-w-0 max-w-[min(70vw,32rem)] gap-2 overflow-x-auto px-1 py-1">
                  {Array.from({ length: pagination.pageCount }, (_, index) => index + 1).map((block) => (
                    <button
                      key={block}
                      type="button"
                      onClick={() => goToPage(block)}
                      aria-label={`${t('Blok komentar')} ${block}`}
                      aria-current={page === block ? 'page' : undefined}
                      className={`h-11 w-11 shrink-0 rounded-md lg:h-10 lg:w-10 border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        page === block
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-brand-500 hover:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-brand-300'
                      }`}
                    >
                      {block}
                    </button>
                  ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= pagination.pageCount}
                    aria-label={t('Blok selanjutnya')}
                    className="inline-flex h-11 w-11 shrink-0 items-center lg:h-10 lg:w-10 justify-center rounded-md border border-gray-300 bg-white text-gray-700 transition hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:text-brand-300"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </nav>
            </div>
          ) : ratingFilter !== null ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="font-semibold text-gray-900 dark:text-white">
                {t('Tidak ada ulasan dengan rating ini.')}
              </p>
              <button
                type="button"
                onClick={() => selectRatingFilter(null)}
                className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
              >
                {t('Hapus filter')}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
              <MessageSquareText className="mx-auto h-6 w-6 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                {t('Belum ada ulasan')}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t('Jadi yang pertama membagikan pengalaman.')}
              </p>
            </div>
          )}
        </div>

        {mobile && writingReview && reviewForm}

      </div>
    </section>
  )
}
