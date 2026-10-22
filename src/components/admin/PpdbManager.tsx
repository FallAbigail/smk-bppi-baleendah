import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Archive, Check, CircleStop, ClipboardList, LoaderCircle, RotateCcw, Search, Settings2, X } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useConfirmDialog } from '../../contexts/ConfirmDialogContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  ppdbStatusOptions,
  type PpdbApplication,
  type PpdbApplicationStatus,
  type PpdbPeriod,
  type PpdbSettings,
} from '../../data/ppdb'

type AdminPpdbResponse = { settings: PpdbSettings; applications: PpdbApplication[]; archivedApplications: PpdbApplication[]; periods: PpdbPeriod[] }
type ApplicationEdit = Pick<PpdbApplication, 'status' | 'publicMessage' | 'internalNote'>
type ApplicationFilter = 'semua' | PpdbApplicationStatus
type ApplicationView = 'aktif' | 'arsip'

const emptySettings: PpdbSettings = { isOpen: false, academicYear: '', publicMessage: '' }
const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-950'

function shortDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function statusTone(status: PpdbApplicationStatus) {
  if (status === 'diterima' || status === 'pembayaran_dikonfirmasi') return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
  if (status === 'tidak_diterima') return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  if (status === 'perlu_konfirmasi' || status === 'menunggu_pembayaran') return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
  return 'bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200'
}

export default function PpdbManager() {
  const confirm = useConfirmDialog()
  const { t } = useLanguage()
  const [data, setData] = useState<AdminPpdbResponse | null>(null)
  const [settingsDraft, setSettingsDraft] = useState<PpdbSettings>(emptySettings)
  const [edits, setEdits] = useState<Record<string, ApplicationEdit>>({})
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ApplicationFilter>('semua')
  const [applicationView, setApplicationView] = useState<ApplicationView>('aktif')
  const [yearFilter, setYearFilter] = useState('current')
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [endingPpdb, setEndingPpdb] = useState(false)
  const [savingApplication, setSavingApplication] = useState('')
  const [processingApplication, setProcessingApplication] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<AdminPpdbResponse>('/admin/ppdb')
      .then((response) => {
        if (!active) return
        setData(response)
        setSettingsDraft(response.settings)
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Data pendaftar belum dapat dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const applications = data?.applications ?? []
  const archivedApplications = data?.archivedApplications ?? []
  const periods = data?.periods ?? []
  const activeYear = data?.settings.academicYear || periods[0]?.academicYear || ''
  const isAllYears = yearFilter === 'all'
  const selectedYear = yearFilter === 'current' ? activeYear : isAllYears ? '' : yearFilter
  const matchesYear = (application: PpdbApplication) =>
    isAllYears || !selectedYear || application.academicYear === selectedYear
  const applicationsForYear = applications.filter(matchesYear)
  const archivedApplicationsForYear = archivedApplications.filter(matchesYear)
  const yearApplications = applicationView === 'arsip' ? archivedApplicationsForYear : applicationsForYear
  const visibleApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID')
    return yearApplications.filter((application) => {
      const matchesStatus = filter === 'semua' || application.status === filter
      const searchable = [application.studentName, application.applicationNumber, application.programTitle, application.previousSchool]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('id-ID')
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [yearApplications, filter, query])

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingSettings(true)
    setError('')
    setFeedback('')
    try {
      const response = await apiRequest<{ settings: PpdbSettings; periods: PpdbPeriod[] }>('/admin/ppdb/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsDraft),
      })
      setSettingsDraft(response.settings)
      setData((current) => current ? { ...current, settings: response.settings, periods: response.periods } : current)
      if (response.settings.isOpen) setYearFilter('current')
      setFeedback(response.settings.isOpen
        ? 'PPDB online dibuka. Formulir publik sekarang menerima pendaftaran.'
        : 'PPDB online ditutup. Data pendaftar yang sudah masuk tetap tersimpan.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pengaturan PPDB belum dapat disimpan.')
    } finally {
      setSavingSettings(false)
    }
  }

  async function endPpdb() {
    if (!data?.settings.isOpen) return
    const academicYear = data.settings.academicYear
    const confirmed = await confirm({
      title: `${t('Akhiri PPDB tahun ajaran')} ${academicYear}?`,
      description: t('Formulir pendaftaran akan langsung ditutup. Semua data pendaftar tetap tersimpan dan bisa dilihat di riwayat tahun ajaran.'),
      confirmLabel: t('Akhiri PPDB'),
      tone: 'warning',
    })
    if (!confirmed) return

    setEndingPpdb(true)
    setError('')
    setFeedback('')
    try {
      const response = await apiRequest<{ settings: PpdbSettings; periods: PpdbPeriod[] }>('/admin/ppdb/end', {
        method: 'POST',
      })
      setSettingsDraft(response.settings)
      setData((current) => current ? { ...current, settings: response.settings, periods: response.periods } : current)
      setYearFilter(academicYear)
      setFeedback(`PPDB ${academicYear} sudah diakhiri. Seluruh data tersimpan dan tersedia di riwayat tahun ajaran.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Periode PPDB belum dapat diakhiri.')
    } finally {
      setEndingPpdb(false)
    }
  }

  function editFor(application: PpdbApplication): ApplicationEdit {
    return edits[application.applicationNumber] ?? {
      status: application.status,
      publicMessage: application.publicMessage,
      internalNote: application.internalNote,
    }
  }

  function changeEdit(application: PpdbApplication, patch: Partial<ApplicationEdit>) {
    setEdits((current) => ({
      ...current,
      [application.applicationNumber]: { ...editFor(application), ...patch },
    }))
  }

  async function saveApplication(application: PpdbApplication) {
    const edit = editFor(application)
    setSavingApplication(application.applicationNumber)
    setError('')
    setFeedback('')
    try {
      await apiRequest(`/admin/ppdb/applications/${encodeURIComponent(application.applicationNumber)}`, {
        method: 'PATCH',
        body: JSON.stringify(edit),
      })
      setData((current) => current ? {
        ...current,
        applications: current.applications.map((item) => item.applicationNumber === application.applicationNumber
          ? { ...item, ...edit, updatedAt: new Date().toISOString() }
          : item),
        archivedApplications: current.archivedApplications.map((item) => item.applicationNumber === application.applicationNumber
          ? { ...item, ...edit, updatedAt: new Date().toISOString() }
          : item),
      } : current)
      setEdits((current) => {
        const next = { ...current }
        delete next[application.applicationNumber]
        return next
      })
      setFeedback(`Status ${application.studentName} berhasil diperbarui.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Pembaruan pendaftar belum dapat disimpan.')
    } finally {
      setSavingApplication('')
    }
  }

  async function archiveApplication(application: PpdbApplication) {
    const confirmed = await confirm({
      title: t('Pindahkan pendaftaran ke arsip?'),
      description: `${application.studentName} · ${application.applicationNumber}. ${t('Data tetap tersimpan dan bisa dipulihkan kapan saja.')}`,
      confirmLabel: t('Pindahkan ke arsip'),
      tone: 'warning',
    })
    if (!confirmed) return
    setProcessingApplication(application.applicationNumber)
    setError('')
    setFeedback('')
    try {
      const response = await apiRequest<{ archivedAt: string }>(`/admin/ppdb/applications/${encodeURIComponent(application.applicationNumber)}/archive`, { method: 'POST' })
      setData((current) => current ? {
        ...current,
        applications: current.applications.filter((item) => item.applicationNumber !== application.applicationNumber),
        archivedApplications: [{ ...application, archivedAt: response.archivedAt }, ...current.archivedApplications],
        periods: current.periods.map((period) => period.academicYear === application.academicYear
          ? { ...period, activeApplicationCount: Math.max(0, period.activeApplicationCount - 1), archivedApplicationCount: period.archivedApplicationCount + 1 }
          : period),
      } : current)
      setFeedback('Data pendaftaran dipindahkan ke arsip. Data bisa dipulihkan kapan saja.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Data pendaftaran belum dapat diarsipkan.')
    } finally {
      setProcessingApplication('')
    }
  }

  async function restoreApplication(application: PpdbApplication) {
    setProcessingApplication(application.applicationNumber)
    setError('')
    setFeedback('')
    try {
      await apiRequest(`/admin/ppdb/applications/${encodeURIComponent(application.applicationNumber)}/restore`, { method: 'POST' })
      setData((current) => current ? {
        ...current,
        archivedApplications: current.archivedApplications.filter((item) => item.applicationNumber !== application.applicationNumber),
        applications: [{ ...application, archivedAt: null }, ...current.applications],
        periods: current.periods.map((period) => period.academicYear === application.academicYear
          ? { ...period, activeApplicationCount: period.activeApplicationCount + 1, archivedApplicationCount: Math.max(0, period.archivedApplicationCount - 1) }
          : period),
      } : current)
      setFeedback(`Data ${application.studentName} berhasil dipulihkan ke daftar pendaftar aktif.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Data pendaftaran belum dapat dipulihkan.')
    } finally {
      setProcessingApplication('')
    }
  }

  if (loading) {
    return <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Memuat pendaftar…</div>
  }

  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      {feedback && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"><Check className="h-4 w-4" aria-hidden="true" />{feedback}</p>}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6" aria-labelledby="ppdb-settings-heading">
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><Settings2 className="h-5 w-5" aria-hidden="true" /></span>
          <div><h2 id="ppdb-settings-heading" className="text-lg font-bold text-gray-900 dark:text-white">Periode pendaftaran</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Saat PPDB dibuka dan disimpan, formulir publik langsung menerima pendaftaran pada tahun ajaran ini.</p></div>
        </div>
        <form onSubmit={saveSettings} className="grid gap-4 md:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1.2fr)]">
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Tahun ajaran</span><input className={inputClass} placeholder="2026/2027" pattern="\d{4}/\d{4}" maxLength={9} required={settingsDraft.isOpen} value={settingsDraft.academicYear} onChange={(event) => setSettingsDraft((current) => ({ ...current, academicYear: event.target.value }))} /></label>
          <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Pesan untuk calon pendaftar</span><textarea className={`${inputClass} min-h-[2.75rem] resize-y`} maxLength={500} placeholder="Informasi tambahan yang tampil pada formulir pendaftaran." value={settingsDraft.publicMessage} onChange={(event) => setSettingsDraft((current) => ({ ...current, publicMessage: event.target.value }))} /></label>
          <label className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-950 md:col-span-2">
            <input className="mt-0.5 h-4 w-4 accent-brand-700" type="checkbox" checked={settingsDraft.isOpen} onChange={(event) => setSettingsDraft((current) => ({ ...current, isOpen: event.target.checked }))} />
            <span><strong className="block text-gray-900 dark:text-white">Terima pendaftaran online</strong><span className="mt-1 block text-gray-600 dark:text-gray-400">Saat aktif, formulir di halaman PPDB bisa langsung digunakan. Setiap pendaftar masuk dengan status baru untuk ditinjau admin.</span></span>
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" disabled={savingSettings || endingPpdb} className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">{savingSettings ? 'Menyimpan…' : settingsDraft.isOpen !== data?.settings.isOpen ? settingsDraft.isOpen ? 'Simpan & buka PPDB online' : 'Simpan & tutup PPDB online' : 'Simpan pengaturan'}</button>
            {data?.settings.isOpen && (
              <button type="button" disabled={savingSettings || endingPpdb} onClick={() => void endPpdb()} className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40">
                <CircleStop className="h-4 w-4" aria-hidden="true" />
                {endingPpdb ? 'Mengakhiri PPDB…' : `Akhiri PPDB ${data.settings.academicYear}`}
              </button>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="ppdb-history-heading" className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="mb-4">
          <h2 id="ppdb-history-heading" className="text-lg font-bold text-gray-900 dark:text-white">Riwayat per tahun ajaran</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Setiap periode yang dibuka tersimpan di database. Pilih tahun untuk melihat seluruh data pendaftarnya.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button type="button" aria-pressed={isAllYears} onClick={() => setYearFilter('all')} className={`rounded-xl border p-4 text-left transition ${isAllYears ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100 dark:border-brand-700 dark:bg-brand-950/40 dark:ring-brand-950' : 'border-gray-200 hover:border-brand-300 dark:border-gray-700 dark:hover:border-brand-800'}`}>
            <span className="block text-sm font-semibold text-gray-900 dark:text-white">Semua tahun ajaran</span>
            <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">{periods.reduce((total, period) => total + period.applicationCount, 0)} pendaftar tersimpan</span>
          </button>
          {periods.map((period) => {
            const isSelected = yearFilter === period.academicYear || (yearFilter === 'current' && period.academicYear === activeYear)
            return (
              <button key={period.academicYear} type="button" aria-pressed={isSelected} onClick={() => setYearFilter(period.academicYear)} className={`rounded-xl border p-4 text-left transition ${isSelected ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100 dark:border-brand-700 dark:bg-brand-950/40 dark:ring-brand-950' : 'border-gray-200 hover:border-brand-300 dark:border-gray-700 dark:hover:border-brand-800'}`}>
                <span className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{period.academicYear}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${period.status === 'open' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {period.status === 'open' ? 'Sedang dibuka' : 'Berakhir'}
                  </span>
                </span>
                <span className="mt-2 block text-xs text-gray-500 dark:text-gray-400">
                  {period.applicationCount} pendaftar · {period.activeApplicationCount} aktif · {period.archivedApplicationCount} di arsip
                </span>
                {period.startedAt && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">Dibuka {shortDate(period.startedAt)}</span>}
                {period.endedAt && <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">Diakhiri {shortDate(period.endedAt)}</span>}
              </button>
            )
          })}
        </div>
        {periods.length === 0 && <p className="mt-3 rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">Riwayat periode akan muncul setelah PPDB pertama kali dibuka.</p>}
      </section>

      <section aria-labelledby="applicants-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="flex items-center gap-2 text-brand-700 dark:text-brand-300"><ClipboardList className="h-4 w-4" aria-hidden="true" /><span className="text-xs font-semibold uppercase tracking-wider">PPDB</span></div><h2 id="applicants-heading" className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Data calon siswa</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Admin memeriksa data dan memperbarui status pembayaran atau penerimaan. Pendaftar melihat pembaruan lewat halaman cek status.</p><p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Pilih tahun ajaran di atas untuk melihat rincian pendaftar. Data tetap tersimpan setelah periode diakhiri.</p></div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs dark:bg-gray-800">{isAllYears || !selectedYear ? 'Semua tahun ajaran' : `Tahun ajaran ${selectedYear}`}</span>
            <span>{yearApplications.length} {applicationView === 'arsip' ? 'data arsip' : 'pendaftar aktif'}</span>
          </div>
        </div>
        {applicationView === 'aktif' && <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
          {ppdbStatusOptions.map((item) => <div key={item.value} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"><p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p><p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{applicationsForYear.filter((application) => application.status === item.value).length}</p></div>)}
        </div>}
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Daftar pendaftar PPDB">
          <button type="button" role="tab" aria-selected={applicationView === 'aktif'} onClick={() => setApplicationView('aktif')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${applicationView === 'aktif' ? 'bg-brand-700 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'}`}>Pendaftar aktif ({applicationsForYear.length})</button>
          <button type="button" role="tab" aria-selected={applicationView === 'arsip'} onClick={() => setApplicationView('arsip')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${applicationView === 'arsip' ? 'bg-brand-700 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'}`}><Archive className="h-4 w-4" aria-hidden="true" /> Arsip ({archivedApplicationsForYear.length})</button>
        </div>
        <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <label className="relative block"><span className="sr-only">Cari pendaftar</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" /><input className={`${inputClass} pl-9`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, nomor, sekolah, program" /></label>
          <label><span className="sr-only">Filter status</span><select className={inputClass} value={filter} onChange={(event) => setFilter(event.target.value as ApplicationFilter)}><option value="semua">Semua status</option>{ppdbStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>

        {visibleApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900"><p className="font-semibold text-gray-800 dark:text-gray-200">{yearApplications.length ? 'Data tidak ditemukan.' : applicationView === 'arsip' ? 'Belum ada data arsip untuk tahun ajaran ini.' : 'Belum ada pendaftar untuk tahun ajaran ini.'}</p><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{yearApplications.length ? 'Coba ubah kata pencarian atau filter status.' : 'Data pendaftar lama tetap dapat dipilih melalui riwayat tahun ajaran di atas.'}</p></div>
        ) : (
          <div className="space-y-4">
            {visibleApplications.map((application) => {
              const edit = editFor(application)
              const saving = savingApplication === application.applicationNumber
              const processing = processingApplication === application.applicationNumber
              return (
                <article key={application.applicationNumber} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-bold text-gray-900 dark:text-white">{application.studentName}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(application.status)}`}>{ppdbStatusOptions.find((item) => item.value === application.status)?.label ?? application.status}</span></div><p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">{application.applicationNumber} · {shortDate(application.createdAt)}{applicationView === 'arsip' && application.archivedAt ? ` · Diarsipkan ${shortDate(application.archivedAt)}` : ''}</p><p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{application.programTitle ?? 'Program dihapus'} <span className="text-gray-400">·</span> {application.previousSchool}</p></div>
                    {applicationView === 'aktif' ? (
                      <button type="button" disabled={processing} onClick={() => void archiveApplication(application)} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-900 dark:hover:text-brand-300"><Archive className="h-4 w-4" aria-hidden="true" />{processing ? 'Mengarsipkan…' : 'Arsipkan'}</button>
                    ) : (
                      <button type="button" disabled={processing} onClick={() => void restoreApplication(application)} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-900 dark:hover:text-emerald-300"><RotateCcw className="h-4 w-4" aria-hidden="true" />{processing ? 'Memulihkan…' : 'Pulihkan'}</button>
                    )}
                  </div>

                  <details className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-800">
                    <summary className="cursor-pointer text-sm font-semibold text-brand-700 dark:text-brand-300">Lihat data pendaftar dan tindak lanjut</summary>
                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={(event) => { const details = event.currentTarget.closest('details'); if (details) details.open = false }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                        <X className="h-4 w-4" aria-hidden="true" />
                        Tutup
                      </button>
                    </div>
                    <div className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                      <p><span className="block text-xs text-gray-500 dark:text-gray-400">Tanggal lahir · jenis kelamin</span><span className="mt-0.5 block text-gray-800 dark:text-gray-200">{application.birthDate} · {application.gender}</span></p>
                      <p><span className="block text-xs text-gray-500 dark:text-gray-400">Tahun ajaran</span><span className="mt-0.5 block text-gray-800 dark:text-gray-200">{application.academicYear}</span></p>
                      <p><span className="block text-xs text-gray-500 dark:text-gray-400">Orang tua/wali</span><span className="mt-0.5 block text-gray-800 dark:text-gray-200">{application.guardianName} · <a className="text-brand-700 hover:underline dark:text-brand-300" href={`tel:${application.guardianPhone}`}>{application.guardianPhone}</a></span></p>
                      <p><span className="block text-xs text-gray-500 dark:text-gray-400">Kontak calon siswa</span><span className="mt-0.5 block text-gray-800 dark:text-gray-200">{application.studentPhone || '—'}{application.studentEmail ? ` · ${application.studentEmail}` : ''}</span></p>
                      <p><span className="block text-xs text-gray-500 dark:text-gray-400">Tahun lulus</span><span className="mt-0.5 block text-gray-800 dark:text-gray-200">{application.graduationYear ?? '—'}</span></p>
                      <p className="sm:col-span-2"><span className="block text-xs text-gray-500 dark:text-gray-400">Alamat</span><span className="mt-0.5 block text-gray-800 dark:text-gray-200">{application.address}</span></p>
                    </div>
                    <div className="mt-5 grid gap-4 border-t border-gray-200 pt-4 dark:border-gray-800 sm:grid-cols-2">
                      <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Status pendaftaran</span><select className={inputClass} value={edit.status} onChange={(event) => changeEdit(application, { status: event.target.value as PpdbApplicationStatus })}>{ppdbStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
                      <div className="hidden sm:block" />
                      <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Pesan untuk calon pendaftar</span><textarea className={`${inputClass} min-h-20 resize-y`} maxLength={500} placeholder="Pesan ini tampil saat calon siswa memeriksa status." value={edit.publicMessage} onChange={(event) => changeEdit(application, { publicMessage: event.target.value })} /></label>
                      <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Catatan internal petugas</span><textarea className={`${inputClass} min-h-20 resize-y`} maxLength={1000} placeholder="Hanya terlihat di panel admin." value={edit.internalNote} onChange={(event) => changeEdit(application, { internalNote: event.target.value })} /></label>
                      <button type="button" disabled={saving} onClick={() => void saveApplication(application)} className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 sm:col-span-2">{saving ? 'Menyimpan…' : 'Simpan tindak lanjut'}</button>
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
