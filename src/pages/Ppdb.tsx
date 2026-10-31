import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Check, ClipboardCheck, GraduationCap, LockKeyhole } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useSiteContent } from '../contexts/SiteContentContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { apiRequest, ApiError } from '../lib/api'
import { schoolProfile } from '../data/schoolProfile'
import { ppdbStatusLabels, type PpdbApplicationResult, type PpdbSettings, type PpdbStatusResult } from '../data/ppdb'

type ApplicationForm = {
  studentName: string
  birthDate: string
  gender: string
  address: string
  studentPhone: string
  studentEmail: string
  guardianName: string
  guardianPhone: string
  previousSchool: string
  graduationYear: string
  programId: string
  consent: boolean
  website: string
}

const emptyForm: ApplicationForm = {
  studentName: '',
  birthDate: '',
  gender: '',
  address: '',
  studentPhone: '',
  studentEmail: '',
  guardianName: '',
  guardianPhone: '',
  previousSchool: '',
  graduationYear: '',
  programId: '',
  consent: false,
  website: '',
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      {children}
    </label>
  )
}

const controlClass = 'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-950'

export default function Ppdb() {
  const { t } = useLanguage()
  const { content } = useSiteContent()
  usePageMeta(t('Pendaftaran PPDB Online'), `${t('Formulir pendaftaran peserta didik baru')} · ${schoolProfile.name}`)

  const [settings, setSettings] = useState<PpdbSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsError, setSettingsError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [result, setResult] = useState<PpdbApplicationResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')
  const [trackingCode, setTrackingCode] = useState('')
  const [status, setStatus] = useState<PpdbStatusResult | null>(null)
  const [statusError, setStatusError] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(false)

  const programs = content.programs.filter((program) => program.level === 'smk')

  useEffect(() => {
    let active = true
    let initialRequest = true
    const loadSettings = async () => {
      try {
        const data = await apiRequest<PpdbSettings>('/ppdb/settings')
        if (active) {
          setSettings(data)
          setSettingsError('')
        }
      } catch (error) {
        if (active && initialRequest) {
          setSettingsError(error instanceof Error ? error.message : t('Informasi PPDB belum dapat dimuat.'))
        }
      } finally {
        if (active && initialRequest) setSettingsLoading(false)
        initialRequest = false
      }
    }

    void loadSettings()
    const refreshTimer = window.setInterval(() => void loadSettings(), 10_000)
    return () => {
      active = false
      if (refreshTimer !== undefined) window.clearInterval(refreshTimer)
    }
  }, [t])

  useEffect(() => {
    if (!result) return
    const frame = requestAnimationFrame(() => {
      const confirmation = document.getElementById('ppdb-application-result')
      confirmation?.scrollIntoView({ block: 'start' })
      confirmation?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [result])

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')
    setResult(null)
    try {
      const saved = await apiRequest<PpdbApplicationResult>('/ppdb/applications', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setResult(saved)
      setForm(emptyForm)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('Pendaftaran belum dapat dikirim.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function checkStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCheckingStatus(true)
    setStatusError('')
    setStatus(null)
    try {
      const data = await apiRequest<PpdbStatusResult>('/ppdb/status', {
        method: 'POST',
        body: JSON.stringify({ applicationNumber, trackingCode }),
      })
      setStatus(data)
    } catch (error) {
      setStatusError(error instanceof ApiError ? error.message : t('Status pendaftaran belum dapat diperiksa.'))
    } finally {
      setCheckingStatus(false)
    }
  }

  async function copyTrackingDetails() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(`${t('Nomor pendaftaran')}: ${result.applicationNumber}\n${t('Kode pelacakan')}: ${result.trackingCode}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const input = (name: keyof ApplicationForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gray-50 pb-20 pt-24 dark:bg-gray-950 sm:pt-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">{schoolProfile.name}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('Pendaftaran peserta didik baru')}</h1>
          <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">{settings?.isOpen ? t('Daftarkan calon siswa secara online dan simpan kode pelacakan untuk memeriksa perkembangan pendaftaran.') : t('Lihat informasi penerimaan siswa baru, persiapkan data pendaftaran, atau periksa status pendaftaran sebelumnya.')}</p>
          {settings?.academicYear && (
            <p className="mt-4 inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-200">
              {t('Tahun ajaran')} {settings.academicYear}
            </p>
          )}
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7" aria-labelledby="application-heading">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><GraduationCap className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 id="application-heading" className="text-xl font-bold text-gray-900 dark:text-white">{settings?.isOpen ? t('Formulir pendaftaran') : t('Informasi pendaftaran')}</h2>
                {settings?.isOpen && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {settings.publicMessage || t('Lengkapi data calon siswa dan orang tua atau wali.')}
                  </p>
                )}
              </div>
            </div>

            {settingsLoading ? (
              <p className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600 dark:bg-gray-950 dark:text-gray-300" role="status">{t('Memuat periode pendaftaran…')}</p>
            ) : settingsError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100" role="alert">
                <h3 className="font-semibold">{t('Status PPDB belum dapat dimuat')}</h3>
                <p className="mt-1 leading-6">{settingsError}</p>
                <a className="mt-3 inline-flex font-semibold underline" href={`tel:${schoolProfile.phoneHref}`}>{t('Hubungi Sekolah')}</a>
              </div>
            ) : settings?.isOpen ? (
              result ? (
                <div id="ppdb-application-result" tabIndex={-1} role="status" className="scroll-mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 outline-none dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-emerald-950 dark:text-emerald-100">{t('Pendaftaran berhasil dikirim')}</h3>
                      <p className="mt-1 text-sm leading-6 text-emerald-900 dark:text-emerald-200">{t('Simpan nomor pendaftaran dan kode pelacakan ini. Keduanya diperlukan untuk memeriksa status. Admin sekolah akan meninjau data, mengonfirmasi pembayaran, dan memperbarui hasil penerimaan secara manual.')}</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-3 rounded-lg bg-white/80 p-4 text-sm dark:bg-gray-900/80 sm:grid-cols-2">
                    <div><dt className="text-gray-500 dark:text-gray-400">{t('Nomor pendaftaran')}</dt><dd className="mt-1 break-all font-bold tracking-wide text-gray-900 dark:text-white">{result.applicationNumber}</dd></div>
                    <div><dt className="text-gray-500 dark:text-gray-400">{t('Kode pelacakan')}</dt><dd className="mt-1 font-mono text-lg font-bold tracking-[0.16em] text-gray-900 dark:text-white">{result.trackingCode}</dd></div>
                  </dl>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => void copyTrackingDetails()} className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> {copied ? t('Tersalin') : t('Salin data pelacakan')}
                    </button>
                    <button type="button" onClick={() => { setResult(null); setCopied(false) }} className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-white/70 dark:text-brand-200 dark:hover:bg-gray-900">{t('Daftarkan calon siswa lain')}</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitApplication} className="public-form space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('Nama lengkap calon siswa')}><input className={controlClass} autoComplete="name" maxLength={100} required value={form.studentName} onChange={(event) => input('studentName', event.target.value)} /></Field>
                    <Field label={t('Tanggal lahir')}><input className={controlClass} type="date" required value={form.birthDate} onChange={(event) => input('birthDate', event.target.value)} /></Field>
                    <Field label={t('Jenis kelamin')}><select className={controlClass} required value={form.gender} onChange={(event) => input('gender', event.target.value)}><option value="">{t('Pilih jenis kelamin')}</option><option value="Laki-laki">{t('Laki-laki')}</option><option value="Perempuan">{t('Perempuan')}</option></select></Field>
                    <Field label={t('Program keahlian pilihan')}><select className={controlClass} required value={form.programId} onChange={(event) => input('programId', event.target.value)}><option value="">{t('Pilih program keahlian')}</option>{programs.map((program) => <option key={program.id} value={program.id}>{t(program.title)}</option>)}</select></Field>
                    <Field label={t('Asal sekolah')}><input className={controlClass} autoComplete="organization" maxLength={150} required value={form.previousSchool} onChange={(event) => input('previousSchool', event.target.value)} /></Field>
                    <Field label={t('Tahun lulus')}><input className={controlClass} type="number" min="2000" max={new Date().getFullYear() + 1} inputMode="numeric" value={form.graduationYear} onChange={(event) => input('graduationYear', event.target.value)} /></Field>
                    <div className="sm:col-span-2"><Field label={t('Alamat lengkap')}><textarea className={`${controlClass} min-h-24 resize-y`} autoComplete="street-address" maxLength={500} required value={form.address} onChange={(event) => input('address', event.target.value)} /></Field></div>
                  </div>

                  <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{t('Kontak orang tua atau wali')}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t('Nama orang tua atau wali')}><input className={controlClass} autoComplete="name" maxLength={100} required value={form.guardianName} onChange={(event) => input('guardianName', event.target.value)} /></Field>
                      <Field label={t('Nomor telepon orang tua atau wali')}><input className={controlClass} type="tel" autoComplete="tel" maxLength={20} required value={form.guardianPhone} onChange={(event) => input('guardianPhone', event.target.value)} /></Field>
                      <Field label={t('Nomor telepon calon siswa (opsional)')}><input className={controlClass} type="tel" maxLength={20} value={form.studentPhone} onChange={(event) => input('studentPhone', event.target.value)} /></Field>
                      <Field label={t('Email (opsional)')}><input className={controlClass} type="email" autoComplete="email" maxLength={150} value={form.studentEmail} onChange={(event) => input('studentEmail', event.target.value)} /></Field>
                    </div>
                  </div>

                  <div className="sr-only" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => input('website', event.target.value)} /></div>
                  <label className="flex items-start gap-3 rounded-lg bg-gray-50 p-3.5 text-sm leading-6 text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                    <input className="mt-1 h-4 w-4 shrink-0 accent-brand-700" type="checkbox" required checked={form.consent} onChange={(event) => input('consent', event.target.checked)} />
                    <span>{t('Saya menyetujui data ini digunakan oleh sekolah untuk proses PPDB dan memahami data pendaftaran hanya dapat diakses oleh petugas sekolah yang berwenang.')} <Link to="/privasi" className="font-semibold text-brand-700 underline dark:text-brand-300">{t('Kebijakan Privasi')}</Link>.</span>
                  </label>

                  {formError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{formError}</p>}
                  <button type="submit" disabled={submitting || programs.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
                    {submitting ? t('Mengirim pendaftaran…') : t('Kirim pendaftaran')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              )
            ) : settings ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
                <LockKeyhole className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{t('Pendaftaran online belum dibuka')}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">{settings.publicMessage || t('Jadwal pembukaan belum dicantumkan di halaman ini. Hubungi sekolah untuk informasi periode berikutnya.')}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700 dark:text-gray-300">
                  <li>{t('Kenali program keahlian sebelum menentukan pilihan.')}</li>
                  <li>{t('Siapkan data diri calon siswa, asal sekolah, dan kontak orang tua atau wali.')}</li>
                  <li>{t('Sudah pernah mendaftar? Gunakan nomor dan kode pelacakan pada bagian cek status.')}</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link to="/program" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-200 px-3 text-sm font-semibold text-brand-700 dark:border-brand-800 dark:text-brand-300">{t('Lihat program keahlian')} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                  <a href={`tel:${schoolProfile.phoneHref}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 dark:text-brand-300">{t('Tanya PPDB ke sekolah')}</a>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6" aria-labelledby="status-heading">
              <div className="mb-5 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"><ClipboardCheck className="h-5 w-5" aria-hidden="true" /></span>
                <div><h2 id="status-heading" className="text-lg font-bold text-gray-900 dark:text-white">{t('Cek status pendaftaran')}</h2><p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">{t('Gunakan nomor pendaftaran dan kode pelacakan yang diterima setelah mengirim formulir.')}</p></div>
              </div>
              <form onSubmit={checkStatus} className="public-form space-y-4">
                <Field label={t('Nomor pendaftaran')}><input className={controlClass} autoComplete="off" placeholder="BPPI-2026-XXXXXXXX" required value={applicationNumber} onChange={(event) => setApplicationNumber(event.target.value.toUpperCase())} /></Field>
                <Field label={t('Kode pelacakan')}><input className={`${controlClass} font-mono tracking-[0.12em]`} autoComplete="off" maxLength={16} placeholder="XXXXXXXXXXXXXXXX" required value={trackingCode} onChange={(event) => setTrackingCode(event.target.value.toUpperCase())} /></Field>
                {statusError && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{statusError}</p>}
                <button type="submit" disabled={checkingStatus} className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:border-brand-400 hover:text-brand-800 disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:border-brand-700 dark:hover:text-brand-300">{checkingStatus ? t('Memeriksa…') : t('Periksa status')}</button>
              </form>
              {status && (
                <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900 dark:bg-brand-950/30" role="status">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">{t('Status saat ini')}</p>
                  <p className="mt-1 font-bold text-gray-900 dark:text-white">{t(ppdbStatusLabels[status.status])}</p>
                  <dl className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex justify-between gap-3"><dt>{t('Tahun ajaran')}</dt><dd className="font-medium text-right">{status.academicYear}</dd></div>
                    <div className="flex justify-between gap-3"><dt>{t('Program pilihan')}</dt><dd className="font-medium text-right">{status.programTitle ?? t('Program keahlian')}</dd></div>
                    <div className="flex justify-between gap-3"><dt>{t('Tanggal daftar')}</dt><dd className="font-medium text-right">{formatDate(status.createdAt)}</dd></div>
                    <div className="flex justify-between gap-3"><dt>{t('Pembaruan status')}</dt><dd className="font-medium text-right">{formatDate(status.updatedAt)}</dd></div>
                  </dl>
                  {status.publicMessage && <p className="mt-3 border-t border-brand-200 pt-3 text-sm leading-6 text-gray-700 dark:border-brand-900 dark:text-gray-200">{status.publicMessage}</p>}
                </div>
              )}
            </section>
            <p className="px-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{t('Untuk bantuan pendaftaran, hubungi')} <a className="font-semibold text-brand-700 dark:text-brand-300" href={`mailto:${schoolProfile.email}`}>{schoolProfile.email}</a> {t('atau')} <a className="font-semibold text-brand-700 dark:text-brand-300" href={`tel:${schoolProfile.phoneHref}`}>{schoolProfile.phoneDisplay}</a>.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
