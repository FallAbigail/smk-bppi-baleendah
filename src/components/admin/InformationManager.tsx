import { Megaphone, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { type FormEvent } from 'react'
import type { AnnouncementCategory, SchoolAnnouncement } from '../../data/siteContent'
import { categoryLabel, categoryLabels, formatDate, inputClass } from './adminHelpers'
import type { AnnouncementDraft, AnnouncementFilter } from './types'

// Announcement filters and the create/edit announcement form.
export function InformationManager({
  draft,
  filter,
  items,
  error,
  onNew,
  onEdit,
  onDelete,
  onCancel,
  onChange,
  onSubmit,
  onFilter,
}: {
  draft: AnnouncementDraft | null
  filter: AnnouncementFilter
  items: SchoolAnnouncement[]
  error: string
  onNew: (category?: AnnouncementCategory) => void
  onEdit: (item: SchoolAnnouncement) => void
  onDelete: (item: SchoolAnnouncement) => void
  onCancel: () => void
  onChange: (draft: AnnouncementDraft) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFilter: (filter: AnnouncementFilter) => void
}) {
  const filters: Array<{ id: AnnouncementFilter; label: string }> = [
    { id: 'all', label: 'Semua' },
    { id: 'published', label: 'Tayang' },
    { id: 'draft', label: 'Draft' },
  ]

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              Berita, pengumuman, dan PPDB
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Hanya informasi berstatus tayang yang muncul di situs publik.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNew('penerimaan')}
              className={[
                'inline-flex items-center gap-2 rounded-lg border',
                'border-gray-200 px-3.5 py-2.5 text-sm font-semibold',
                'text-gray-700 hover:bg-gray-50 dark:border-gray-700',
                'dark:text-gray-300 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Info PPDB
            </button>
            <button
              type="button"
              onClick={() => onNew('pengumuman')}
              className={[
                'inline-flex items-center gap-2 rounded-lg bg-brand-700',
                'px-3.5 py-2.5 text-sm font-semibold text-white',
                'hover:bg-brand-800',
              ].join(' ')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Tulis informasi
            </button>
          </div>
        </div>
      </section>

      {draft && (
        <AnnouncementForm
          draft={draft}
          error={error}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div
          className={[
            'flex flex-col gap-4 border-b border-gray-100 pb-4',
            'dark:border-gray-800 sm:flex-row sm:items-center',
            'sm:justify-between',
          ].join(' ')}
        >
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Daftar informasi</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {items.length} item pada filter ini.
            </p>
          </div>
          <div
            className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800"
            aria-label="Filter informasi"
          >
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilter(item.id)}
                aria-pressed={filter === item.id}
                className={[
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition',
                  filter === item.id
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.length > 0 ? (
            items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 py-4 first:pt-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        'rounded-full bg-brand-50 px-2.5 py-1 text-xs',
                        'font-semibold text-brand-800 dark:bg-brand-950',
                        'dark:text-brand-300',
                      ].join(' ')}
                    >
                      {categoryLabel(item.category)}
                    </span>
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        item.published
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
                      ].join(' ')}
                    >
                      {item.published ? 'Tayang' : 'Draft'}
                    </span>
                    <time dateTime={item.date} className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </time>
                  </div>
                  <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p
                    className={[
                      'mt-1 line-clamp-3 whitespace-pre-wrap text-sm',
                      'leading-relaxed text-gray-600 dark:text-gray-400',
                    ].join(' ')}
                  >
                    {item.body}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className={[
                      'inline-flex items-center gap-1.5 rounded-lg border',
                      'border-gray-200 px-3 py-2 text-xs font-semibold',
                      'text-gray-700 hover:bg-gray-50 dark:border-gray-700',
                      'dark:text-gray-300 dark:hover:bg-gray-800',
                    ].join(' ')}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Ubah
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label={`Hapus ${item.title}`}
                    className={[
                      'rounded-lg border border-gray-200 p-2 text-gray-500',
                      'hover:border-red-200 hover:bg-red-50 hover:text-red-700',
                      'dark:border-gray-700 dark:text-gray-400',
                      'dark:hover:border-red-900 dark:hover:bg-red-950/40',
                      'dark:hover:text-red-300',
                    ].join(' ')}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="py-12 text-center">
              <Megaphone className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
              <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">
                Belum ada informasi di sini
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tulis berita, pengumuman, atau informasi penerimaan dari sumber sekolah.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export function AnnouncementForm({
  draft,
  error,
  onChange,
  onSubmit,
  onCancel,
}: {
  draft: AnnouncementDraft
  error: string
  onChange: (draft: AnnouncementDraft) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-5 dark:border-brand-900 dark:bg-gray-900 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">
            {draft.id ? 'Ubah informasi' : 'Tulis informasi'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Isi hanya informasi yang sudah dikonfirmasi oleh sekolah.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup formulir"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Kategori
          <select
            value={draft.category}
            onChange={(event) =>
              onChange({ ...draft, category: event.target.value as AnnouncementCategory })
            }
            className={inputClass}
          >
            {(Object.keys(categoryLabels) as AnnouncementCategory[]).map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tanggal informasi
          <input
            required
            type="date"
            value={draft.date}
            onChange={(event) => onChange({ ...draft, date: event.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
          Judul
          <input
            required
            maxLength={120}
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            className={inputClass}
            placeholder="Tulis judul yang jelas"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
          Isi informasi
          <textarea
            required
            maxLength={3000}
            rows={6}
            value={draft.body}
            onChange={(event) => onChange({ ...draft, body: event.target.value })}
            className={inputClass}
            placeholder="Masukkan detail sesuai pengumuman resmi sekolah."
          />
        </label>
        <label
          className={[
            'flex cursor-pointer items-start gap-3 rounded-xl border',
            'border-gray-200 p-4 dark:border-gray-700 md:col-span-2',
          ].join(' ')}
        >
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(event) => onChange({ ...draft, published: event.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-700 focus:ring-brand-600"
          />
          <span>
            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
              Tayangkan di situs publik
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              Jika tidak dicentang, informasi hanya tersimpan sebagai draft di panel ini.
            </span>
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300 md:col-span-2">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="submit"
            className={[
              'inline-flex items-center gap-2 rounded-lg bg-brand-700',
              'px-4 py-2.5 text-sm font-semibold text-white',
              'hover:bg-brand-800',
            ].join(' ')}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {draft.published ? 'Simpan & tayangkan' : 'Simpan draft'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={[
              'rounded-lg border border-gray-200 px-4 py-2.5 text-sm',
              'font-semibold text-gray-700 hover:bg-gray-50',
              'dark:border-gray-700 dark:text-gray-300',
              'dark:hover:bg-gray-800',
            ].join(' ')}
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  )
}
