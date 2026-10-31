import { BookOpen, Check, CircleAlert, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { programLogoById } from '../../data/programLogos'
import type { AcademicProgram, SchoolLevel, SiteContent } from '../../data/siteContent'
import { iconComponents, inputClass, prepareProgramLogo } from './adminHelpers'
import type { ProgramDraft, ProgramDraftSetter } from './types'

// Program list, editing form, and logo upload controls.
export function ProgramManager({
  content,
  draft,
  error,
  onNew,
  onEdit,
  onDelete,
  onCancel,
  onChange,
  onSubmit,
  onVerify,
}: {
  content: SiteContent
  draft: ProgramDraft | null
  error: string
  onNew: (level: SchoolLevel) => void
  onEdit: (program: AcademicProgram) => void
  onDelete: (program: AcademicProgram) => void
  onCancel: () => void
  onChange: ProgramDraftSetter
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onVerify: () => void
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">
              Program keahlian SMK
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {content.programs.length} item · perubahan langsung terlihat di halaman Program.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNew('smk')}
              className={[
                'inline-flex items-center gap-2 rounded-lg bg-brand-700',
                'px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800',
              ].join(' ')}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Tambah program keahlian
            </button>
          </div>
        </div>

        <div
          className={[
            'mt-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row',
            'sm:items-center sm:justify-between',
            content.programsVerified
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
              : 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
          ].join(' ')}
        >
          <div className="flex items-start gap-3">
            {content.programsVerified ? (
              <Check
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300"
                aria-hidden="true"
              />
            ) : (
              <CircleAlert
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300"
                aria-hidden="true"
              />
            )}
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {content.programsVerified
                ? 'Daftar ini ditandai sudah diverifikasi. Perubahan berikutnya akan mengembalikan status ke belum diverifikasi.'
                : 'Data awal berasal dari contoh di project. Tinjau dulu dengan data sekolah sebelum menandainya sudah diverifikasi.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onVerify}
            className="shrink-0 text-left text-sm font-semibold underline underline-offset-4 sm:text-right"
          >
            {content.programsVerified ? 'Batalkan verifikasi' : 'Tandai sudah diverifikasi'}
          </button>
        </div>
      </section>

      {draft && (
        <ProgramForm
          draft={draft}
          error={error}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}

      {content.programs.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {content.programs.map((program) => {
            const Icon = iconComponents[program.icon]
            const logo = program.logo || programLogoById[program.id]
            return (
              <article
                key={program.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center',
                      'rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950',
                      'dark:text-brand-400',
                    ].join(' ')}
                  >
                    {logo ? (
                      <img src={logo} alt={`Logo ${program.title}`} className="h-full w-full object-contain p-1" />
                    ) : (
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={[
                        'mb-2 inline-flex rounded-full bg-brand-50 px-2.5 py-1',
                        'text-[11px] font-semibold text-brand-800',
                        'dark:bg-brand-950 dark:text-brand-200',
                      ].join(' ')}
                    >
                      Program keahlian SMK
                    </span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{program.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {program.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(program)}
                      aria-label={`Ubah ${program.title}`}
                      className={[
                        'rounded-lg p-2 text-gray-500 hover:bg-gray-100',
                        'hover:text-brand-700 dark:text-gray-400',
                        'dark:hover:bg-gray-800 dark:hover:text-brand-400',
                      ].join(' ')}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(program)}
                      aria-label={`Hapus ${program.title}`}
                      className={[
                        'rounded-lg p-2 text-gray-500 hover:bg-red-50',
                        'hover:text-red-700 dark:text-gray-400',
                        'dark:hover:bg-red-950/40 dark:hover:text-red-300',
                      ].join(' ')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Kompetensi keahlian
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {program.highlights.map((item, index) => (
                    <span
                      key={`${program.id}-${item}-${index}`}
                      className={[
                        'rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600',
                        'dark:bg-gray-800 dark:text-gray-300',
                      ].join(' ')}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <BookOpen className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">
            Belum ada program keahlian
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tambahkan program keahlian agar tampil di situs publik.
          </p>
          <button
            type="button"
            onClick={() => onNew('smk')}
            className="mt-4 text-sm font-semibold text-brand-700 underline underline-offset-4 dark:text-brand-400"
          >
            Tambah program keahlian
          </button>
        </div>
      )}
    </div>
  )
}

export function ProgramForm({
  draft,
  error,
  onChange,
  onSubmit,
  onCancel,
}: {
  draft: ProgramDraft
  error: string
  onChange: ProgramDraftSetter
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  const [logoError, setLogoError] = useState('')
  const [processingLogo, setProcessingLogo] = useState(false)
  const previewLogo = draft.logo || (draft.id ? programLogoById[draft.id] : '')

  function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    setLogoError('')
    setProcessingLogo(true)
    void prepareProgramLogo(file)
      .then((logo) => onChange((current) => current ? { ...current, logo } : current))
      .catch((cause) => setLogoError(cause instanceof Error ? cause.message : 'Logo belum dapat diproses.'))
      .finally(() => {
        setProcessingLogo(false)
        input.value = ''
      })
  }

  return (
    <section className="rounded-2xl border border-brand-200 bg-white p-5 dark:border-brand-900 dark:bg-gray-900 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">
            {draft.id ? 'Ubah program keahlian' : 'Tambah program keahlian'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Data ini akan ditampilkan di halaman Program dan beranda.
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
          Nama program keahlian
          <input
            required
            maxLength={100}
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            className={inputClass}
            placeholder="Contoh: Pengembangan Perangkat Lunak dan Gim"
          />
        </label>
        <div className="grid gap-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tambahkan logo program
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadLogo}
              disabled={processingLogo}
              className={inputClass}
            />
            <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
              PNG, JPG, atau WebP. Maksimal 6 MB; gambar akan diperkecil otomatis.
            </span>
          </label>
          <div className="flex min-h-20 items-center gap-3 sm:justify-end">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
              {previewLogo ? (
                <img src={previewLogo} alt="Pratinjau logo program" className="h-full w-full object-contain" />
              ) : (
                <span className="text-center text-xs text-gray-500 dark:text-gray-400">Belum ada logo</span>
              )}
            </div>
            {draft.logo && (
              <button
                type="button"
                disabled={processingLogo}
                onClick={() => { onChange({ ...draft, logo: '' }); setLogoError('') }}
                className="text-sm font-semibold text-gray-600 underline underline-offset-4 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:text-red-300"
              >
                Hapus logo
              </button>
            )}
          </div>
          {(logoError || processingLogo) && (
            <p role={logoError ? 'alert' : 'status'} className={`text-sm md:col-span-2 ${logoError ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {logoError || 'Memproses logo…'}
            </p>
          )}
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
          Deskripsi
          <textarea
            required
            maxLength={400}
            rows={3}
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
            className={inputClass}
            placeholder="Jelaskan program keahlian yang sudah dikonfirmasi."
          />
        </label>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
          Kompetensi keahlian
          <textarea
            required
            rows={2}
            value={draft.highlights}
            onChange={(event) => onChange({ ...draft, highlights: event.target.value })}
            className={inputClass}
            placeholder="Contoh: Pemrograman, Basis Data, Pengembangan Gim"
          />
          <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
            Pisahkan setiap item dengan koma atau baris baru.
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
            disabled={processingLogo}
            className={[
              'inline-flex items-center gap-2 rounded-lg bg-brand-700',
              'px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60',
              'hover:bg-brand-800',
            ].join(' ')}
          >
            <Save className="h-4 w-4" aria-hidden="true" /> Simpan bidang
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
