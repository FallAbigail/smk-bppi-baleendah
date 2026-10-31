import {
  ArrowUpRight,
  BookOpen,
  Database,
  Megaphone,
  Pencil,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import type { AnnouncementCategory, SiteContent } from '../../data/siteContent'
import { categoryLabel, formatDate } from './adminHelpers'
import type { AdminSection } from './types'

// Read-only content summaries and shortcuts for the admin dashboard.
export function Overview({
  content,
  storageStatus,
  onNavigate,
  onNewAnnouncement,
}: {
  content: SiteContent
  storageStatus: string
  onNavigate: (section: AdminSection) => void
  onNewAnnouncement: () => void
}) {
  const published = content.announcements.filter((item) => item.published).length
  const drafts = content.announcements.length - published
  const total = content.announcements.length
  const publishedPercent = total ? Math.round((published / total) * 100) : 0
  const draftsPercent = total ? 100 - publishedPercent : 0
  const announcementCategories: Array<{ category: AnnouncementCategory; label: string }> = [
    { category: 'berita', label: 'Berita sekolah' },
    { category: 'pengumuman', label: 'Pengumuman' },
    { category: 'penerimaan', label: 'Informasi PPDB' },
  ]
  const categoryCounts = announcementCategories.map(({ category, label }) => ({
    label,
    count: content.announcements.filter((item) => item.category === category).length,
  }))
  const largestCategory = Math.max(1, ...categoryCounts.map((item) => item.count))
  const recentItems = content.announcements
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
  const storageLabel =
    storageStatus === 'unavailable'
      ? 'Terputus'
      : storageStatus === 'loading'
        ? 'Memeriksa…'
        : storageStatus === 'invalid'
          ? 'Periksa data'
          : 'Terhubung'

  return (
    <div className="admin-overview space-y-6">
      <div className="admin-stats-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Program keahlian"
          value={content.programs.length}
          detail={content.programsVerified ? 'Ditandai diverifikasi' : 'Perlu ditinjau'}
          Icon={BookOpen}
        />
        <StatCard
          label="Informasi tayang"
          value={published}
          detail="Terlihat di halaman publik"
          Icon={Megaphone}
        />
        <StatCard
          label="Draft tersimpan"
          value={drafts}
          detail="Belum ditayangkan"
          Icon={Pencil}
        />
        <StatCard
          label="Penyimpanan"
          value={storageLabel}
          detail={storageStatus === 'unavailable' ? 'Periksa koneksi server' : storageStatus === 'invalid' ? 'Data server tidak valid' : 'Database konten sekolah'}
          Icon={Database}
        />
      </div>

      {!content.programsVerified && (
        <div
          className={[
            'rounded-xl border border-amber-300/70 bg-amber-50 p-5',
            'dark:border-amber-800 dark:bg-amber-950/40',
          ].join(' ')}
        >
          <h2 className="font-semibold text-amber-950 dark:text-amber-100">
            Program keahlian belum diverifikasi
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
            Cocokkan daftar program keahlian dengan informasi resmi sekolah sebelum menandainya sudah diverifikasi.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('programs')}
            className="mt-3 text-sm font-semibold text-amber-900 underline underline-offset-4 dark:text-amber-200"
          >
            Tinjau program keahlian
          </button>
        </div>
      )}

      <div className="admin-analysis-grid grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
        <section className="admin-panel admin-category-panel rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="admin-panel-heading flex items-start justify-between gap-4">
            <div>
              <p className="admin-panel-kicker">ANALISIS KONTEN</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Distribusi informasi</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Jumlah per jenis berdasarkan data tersimpan.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('information')}
              className="admin-text-action text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
            >
              Kelola info <ArrowUpRight className="inline h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="admin-category-chart mt-7 space-y-5">
            {categoryCounts.map(({ label, count }, index) => (
              <div key={label} className="admin-category-row">
                <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{count}</span>
                </div>
                <div className="admin-chart-track" role="img" aria-label={`${label}: ${count} item`}>
                  <span className={`admin-chart-bar admin-chart-bar-${index + 1}`} style={{ width: `${(count / largestCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="admin-chart-footnote mt-6 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            Total {total} informasi · termasuk berita, pengumuman, dan PPDB.
          </p>
        </section>

        <section className="admin-panel admin-publishing-panel rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <p className="admin-panel-kicker">STATUS PUBLIKASI</p>
          <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Tayang dan draft</h2>
          <div className="admin-publishing-content mt-6 flex items-center gap-6">
            <div
              className="admin-publishing-ring"
              style={{ background: `conic-gradient(var(--admin-accent) 0 ${publishedPercent}%, var(--admin-chart-rest) ${publishedPercent}% 100%)` }}
              role="img"
              aria-label={`${published} tayang dan ${drafts} draft`}
            >
              <div className="admin-publishing-ring-center">
                <strong>{total}</strong>
                <span>INFO</span>
              </div>
            </div>
            <div className="admin-publishing-legend space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="admin-legend-dot is-published mt-1.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tayang</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{published} informasi · {publishedPercent}%</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="admin-legend-dot is-draft mt-1.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Draft</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{drafts} informasi · {draftsPercent}%</p>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('information')}
            className="admin-secondary-action mt-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Buka pengelolaan informasi <ArrowUpRight className="ml-1 inline h-4 w-4" aria-hidden="true" />
          </button>
        </section>
      </div>

      <section className="admin-panel admin-recent-panel rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="admin-panel-heading flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="admin-panel-kicker">PEMANTAUAN</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Informasi terbaru</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Konten paling baru berdasarkan tanggal yang tersimpan.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('information')}
            className="admin-text-action w-fit text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
          >
            Lihat semua <ArrowUpRight className="inline h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {recentItems.length ? (
          <div className="admin-table-wrap mt-5 overflow-x-auto">
            <table className="admin-data-table w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr>
                  <th>Judul informasi</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id}>
                    <td className="admin-table-title">{item.title}</td>
                    <td>{categoryLabel(item.category)}</td>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={`admin-publication-badge ${item.published ? 'is-live' : 'is-draft'}`}>
                        <span aria-hidden="true" />{item.published ? 'Tayang' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state mt-5 rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Belum ada informasi</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Konten yang dibuat akan muncul di sini.</p>
          </div>
        )}
      </section>

      <section className="admin-quick-actions">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="admin-panel-kicker">AKSES CEPAT</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Kelola situs</h2>
          </div>
          <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">Pintasan pekerjaan admin</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => onNavigate('programs')}
              className={[
                'admin-quick-action flex w-full items-center justify-between rounded-xl',
                'border border-gray-200 p-4 text-left transition',
                'hover:border-brand-300 hover:bg-brand-50/50',
                'dark:border-gray-700 dark:hover:border-brand-800',
                'dark:hover:bg-brand-950/40',
              ].join(' ')}
            >
              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Program keahlian SMK
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  Tambah program keahlian SMK
                </span>
              </span>
              <Plus className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onNewAnnouncement}
              className={[
                'admin-quick-action flex w-full items-center justify-between rounded-xl',
                'border border-gray-200 p-4 text-left transition',
                'hover:border-brand-300 hover:bg-brand-50/50',
                'dark:border-gray-700 dark:hover:border-brand-800',
                'dark:hover:bg-brand-950/40',
              ].join(' ')}
            >
              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Pengumuman baru
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  Simpan sebagai draft atau tayangkan
                </span>
              </span>
              <Plus className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('information')}
              className={[
                'admin-quick-action flex w-full items-center justify-between rounded-xl',
                'border border-gray-200 p-4 text-left transition',
                'hover:border-brand-300 hover:bg-brand-50/50',
                'dark:border-gray-700 dark:hover:border-brand-800',
                'dark:hover:bg-brand-950/40',
              ].join(' ')}
            >
              <span>
                <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Info penerimaan siswa
                </span>
                <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                  Kelola jadwal dan persyaratan dari data sekolah
                </span>
              </span>
              <ArrowUpRight
                className="h-5 w-5 text-brand-700 dark:text-brand-400"
                aria-hidden="true"
              />
            </button>
        </div>
      </section>
    </div>
  )
}

export function StatCard({
  label,
  value,
  detail,
  Icon,
}: {
  label: string
  value: number | string
  detail: string
  Icon: LucideIcon
}) {
  return (
    <div className="admin-stat-card rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</p>
        </div>
          <span
          className={[
            'admin-stat-icon flex h-10 w-10 items-center justify-center rounded-xl',
            'bg-brand-50 text-brand-700 dark:bg-brand-950',
            'dark:text-brand-400',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}
