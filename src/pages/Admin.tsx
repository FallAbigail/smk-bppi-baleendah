import { useCallback, useEffect, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  ClipboardList,
  BriefcaseBusiness,
  Database,
  Check,
  CircleAlert,
  FlaskConical,
  Globe2,
  Code2,
  Palette,
  BookA,
  Leaf,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageSquareText,
  LockKeyhole,
  LogOut,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  UsersRound,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  LEGACY_STORAGE_KEY,
  readLegacySiteContent,
  useSiteContent,
  type StorageStatus,
} from '../contexts/SiteContentContext'
import { useConfirmDialog } from '../contexts/ConfirmDialogContext'
import { useLanguage } from '../contexts/LanguageContext'
import { apiRequest } from '../lib/api'
import type {
  AcademicProgram,
  AnnouncementCategory,
  ProgramIcon,
  SchoolLevel,
  SchoolAnnouncement,
  SiteContent,
} from '../data/siteContent'
import { programLogoById } from '../data/programLogos'
import { schoolProfile } from '../data/schoolProfile'
import PpdbManager from '../components/admin/PpdbManager'
import ReviewsManager from '../components/admin/ReviewsManager'
import ContactMessagesManager from '../components/admin/ContactMessagesManager'
import AdminAccountsManager from '../components/admin/AdminAccountsManager'

type AdminRole = 'owner' | 'admin'
type AdminSection =
  | 'overview'
  | 'programs'
  | 'information'
  | 'ppdb'
  | 'reviews'
  | 'messages'
  | 'admins'
type ProgramDraft = {
  id?: string
  level: SchoolLevel
  title: string
  description: string
  highlights: string
  icon: ProgramIcon
  logo: string
}
type ProgramDraftSetter = Dispatch<SetStateAction<ProgramDraft | null>>
type AnnouncementDraft = {
  id?: string
  title: string
  body: string
  category: AnnouncementCategory
  date: string
  published: boolean
}
type AnnouncementFilter = 'all' | 'published' | 'draft'

const sections: Array<{ id: AdminSection; label: string; Icon: LucideIcon }> = [
  { id: 'overview', label: 'Ringkasan', Icon: LayoutDashboard },
  { id: 'programs', label: 'Program keahlian', Icon: BookOpen },
  { id: 'information', label: 'Informasi & PPDB', Icon: Megaphone },
  { id: 'ppdb', label: 'Pendaftar PPDB', Icon: ClipboardList },
  { id: 'reviews', label: 'Ulasan', Icon: MessageSquareText },
  { id: 'messages', label: 'Pesan Masuk', Icon: Mail },
  { id: 'admins', label: 'Akun admin', Icon: UsersRound },
]

const iconComponents: Record<ProgramIcon, LucideIcon> = {
  science: FlaskConical,
  social: Globe2,
  technology: Code2,
  arts: Palette,
  language: BookA,
  environment: Leaf,
  business: BriefcaseBusiness,
}

async function prepareProgramLogo(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    throw new Error('Pilih gambar PNG, JPG, atau WebP.')
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Ukuran gambar maksimal 6 MB sebelum diproses.')
  }

  const image = new Image()
  const objectUrl = URL.createObjectURL(file)
  try {
    image.src = objectUrl
    await image.decode()
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error('Gambar logo tidak bisa dibaca.')
  }

  let maxSide = 512
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Gambar logo belum dapat diproses di browser ini.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const logo = canvas.toDataURL('image/webp', 0.82)
    if (!logo.startsWith('data:image/webp;')) {
      throw new Error('Browser ini belum mendukung pemrosesan gambar logo.')
    }
    if (logo.length <= 360_000) return logo
    maxSide = Math.floor(maxSide * 0.8)
  }

  throw new Error('Logo terlalu besar setelah diproses. Coba unggah gambar yang lebih sederhana.')
}

const categoryLabels: Record<AnnouncementCategory, string> = {
  berita: 'Berita sekolah',
  pengumuman: 'Pengumuman',
  penerimaan: 'PPDB SMK',
}

function localDate() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        parsed,
      )
}

function categoryLabel(category: AnnouncementCategory) {
  return categoryLabels[category]
}

function downloadBackup(content: SiteContent) {
  const file = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `backup-profil-sekolah-${localDate()}.json`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function AdminPage() {
  usePageMeta('Admin', 'Panel pengelolaan konten profil sekolah.')
  const { loadAdminContent, loadPublicContent } = useSiteContent()
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const [username, setUsername] = useState('')
  const [adminRole, setAdminRole] = useState<AdminRole>('admin')
  const [authError, setAuthError] = useState('')
  const [loginPending, setLoginPending] = useState(false)

  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousContent = existing?.content
    const robots = existing ?? document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    if (!existing) document.head.appendChild(robots)

    return () => {
      if (existing) existing.content = previousContent ?? ''
      else robots.remove()
    }
  }, [])

  const checkSession = useCallback(async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const session = await apiRequest<{
        authenticated: boolean
        username?: string
        role?: AdminRole
        setupRequired: boolean
      }>('/auth/session')
      setSetupRequired(session.setupRequired)
      if (session.authenticated) {
        await loadAdminContent()
        setUsername(session.username ?? 'admin')
        setAdminRole(session.role ?? 'admin')
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
      }
    } catch (error) {
      setAuthenticated(false)
      setAuthError(error instanceof Error ? error.message : 'Backend belum dapat dihubungi.')
    } finally {
      setAuthLoading(false)
    }
  }, [loadAdminContent])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  async function handleLogin(user: string, password: string) {
    setLoginPending(true)
    setAuthError('')
    try {
      const session = await apiRequest<{ authenticated: boolean; username: string; role: AdminRole }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username: user, password }),
        },
      )
      await loadAdminContent()
      setUsername(session.username)
      setAdminRole(session.role)
      setAuthenticated(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login belum berhasil.')
    } finally {
      setLoginPending(false)
    }
  }

  async function handleLogout() {
    try {
      await apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' })
      await loadPublicContent().catch(() => undefined)
      setAuthenticated(false)
      setUsername('')
      setAdminRole('admin')
      setAuthError('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Logout belum berhasil.')
    }
  }

  if (authLoading) return <AdminLoading />
  if (!authenticated) {
    return (
      <AdminAccessScreen
        setupRequired={setupRequired}
        error={authError}
        pending={loginPending}
        onLogin={handleLogin}
        onRetry={() => {
          void checkSession()
        }}
      />
    )
  }

  return (
    <AdminWorkspace
      username={username}
      role={adminRole}
      onLogout={() => {
        void handleLogout()
      }}
    />
  )
}

function AdminLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950"
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          'flex items-center gap-3 rounded-2xl border',
          'border-gray-200 bg-white px-5 py-4 text-sm text-gray-600',
          'shadow-sm dark:border-gray-800 dark:bg-gray-900',
          'dark:text-gray-300',
        ].join(' ')}
      >
        <ShieldCheck className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />
        Memeriksa sesi admin…
      </div>
    </main>
  )
}

function AdminAccessScreen({
  setupRequired,
  error,
  pending,
  onLogin,
  onRetry,
}: {
  setupRequired: boolean
  error: string
  pending: boolean
  onLogin: (username: string, password: string) => Promise<void>
  onRetry: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onLogin(username.trim(), password)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6">
      <section
        className={[
          'w-full max-w-md rounded-2xl border border-gray-200',
          'bg-white p-6 shadow-sm dark:border-gray-800',
          'dark:bg-gray-900 sm:p-8',
        ].join(' ')}
      >
        <a
          href="/"
          className={[
            'mb-8 inline-flex items-center gap-2 text-sm font-medium',
            'text-gray-500 transition hover:text-brand-700',
            'dark:text-gray-400 dark:hover:text-brand-300',
          ].join(' ')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke situs
        </a>
        <div className="mb-7 flex items-center gap-3.5">
          <img
            src="/images/logo-smk-bppi.png"
            alt={schoolProfile.name}
            className="h-14 w-14 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
              {schoolProfile.name}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {schoolProfile.city} · Panel pengelola
            </p>
          </div>
        </div>
        {setupRequired ? (
          <>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Siapkan akun admin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Belum ada akun admin. Buat akun dari terminal pada komputer server; pendaftaran tidak
              tersedia dari halaman publik.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100">
              <code>npm run admin:create</code>
            </pre>
            {error && (
              <p
                role="alert"
                className={[
                  'mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm',
                  'text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
                ].join(' ')}
              >
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={onRetry}
              className={[
                'mt-5 w-full rounded-lg border border-gray-200 px-4',
                'py-2.5 text-sm font-semibold text-gray-700 transition',
                'hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300',
                'dark:hover:bg-gray-800',
              ].join(' ')}
            >
              Periksa lagi
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Masuk ke panel admin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Gunakan akun yang dibuat di server. Sesi akan berakhir otomatis setelah 12 jam.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
                <input
                  required
                  autoComplete="username"
                  maxLength={40}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kata sandi
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                />
              </label>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={[
                  'inline-flex w-full items-center justify-center gap-2',
                  'rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold',
                  'text-white transition hover:bg-brand-800',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                ].join(' ')}
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                {pending ? 'Memeriksa…' : 'Masuk dengan aman'}
              </button>
            </form>
            <p
              className={[
                'mt-5 border-t border-gray-100 pt-4 text-xs',
                'leading-relaxed text-gray-500 dark:border-gray-800',
                'dark:text-gray-400',
              ].join(' ')}
            >
              Lupa kata sandi? Reset dari terminal server dengan{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">
                npm run admin:reset-password
              </code>
              .
            </p>
          </>
        )}
      </section>
    </main>
  )
}

function AdminWorkspace({
  username,
  role,
  onLogout,
}: {
  username: string
  role: AdminRole
  onLogout: () => void
}) {
  const confirm = useConfirmDialog()
  const { t } = useLanguage()
  const {
    content,
    storageStatus,
    lastSaved,
    saveProgram,
    removeProgram,
    setProgramsVerified,
    saveAnnouncement,
    removeAnnouncement,
    importLegacyContent,
  } = useSiteContent()

  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [programDraft, setProgramDraft] = useState<ProgramDraft | null>(null)
  const [announcementDraft, setAnnouncementDraft] = useState<AnnouncementDraft | null>(null)
  const [announcementFilter, setAnnouncementFilter] = useState<AnnouncementFilter>('all')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [legacyContent, setLegacyContent] = useState<SiteContent | null>(readLegacySiteContent)
  const [migrationError, setMigrationError] = useState('')
  const [migrationPending, setMigrationPending] = useState(false)

  const publishedCount = content.announcements.filter((item) => item.published).length
  const serverStatusLabel =
    storageStatus === 'unavailable'
      ? 'Server terputus'
      : storageStatus === 'loading'
        ? 'Memeriksa server'
        : storageStatus === 'invalid'
          ? 'Data perlu diperiksa'
          : 'Server terhubung'
  const visibleAnnouncements = content.announcements
    .filter(
      (item) =>
        announcementFilter === 'all' ||
        (announcementFilter === 'published' ? item.published : !item.published),
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  function openSection(section: AdminSection) {
    if (section === 'admins' && role !== 'owner') return
    setActiveSection(section)
    setProgramDraft(null)
    setAnnouncementDraft(null)
    setFormError('')
    setFeedback('')
  }

  function startNewProgram(level: SchoolLevel = 'smk') {
    setActiveSection('programs')
    setProgramDraft({ level, title: '', description: '', highlights: '', icon: 'science', logo: '' })
    setFormError('')
    setFeedback('')
  }

  function editProgram(program: AcademicProgram) {
    setProgramDraft({
      id: program.id,
      level: program.level,
      title: program.title,
      description: program.description,
      highlights: program.highlights.join(', '),
      icon: program.icon,
      logo: program.logo ?? '',
    })
    setFormError('')
    setFeedback('')
  }

  async function submitProgram(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!programDraft) return

    const title = programDraft.title.trim()
    const description = programDraft.description.trim()
    const highlights = programDraft.highlights
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
    if (!title || !description || highlights.length === 0) {
      setFormError('Isi nama program keahlian, deskripsi, dan minimal satu kompetensi.')
      return
    }
    if (
      content.programs.some(
        (item) =>
          item.id !== programDraft.id &&
          item.title.toLocaleLowerCase() === title.toLocaleLowerCase(),
      )
    ) {
      setFormError('Nama tersebut sudah digunakan.')
      return
    }

    try {
      await saveProgram({
        id: programDraft.id,
        level: programDraft.level,
        title,
        description,
        highlights,
        icon: programDraft.icon,
        logo: programDraft.logo,
      })
      setProgramDraft(null)
      setFormError('')
      setFeedback('Program keahlian tersimpan di database server.')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Data belum dapat disimpan.')
    }
  }

  function startNewAnnouncement(category: AnnouncementCategory = 'pengumuman') {
    setActiveSection('information')
    setAnnouncementDraft({
      title: '',
      body: '',
      category,
      date: localDate(),
      published: false,
    })
    setFormError('')
    setFeedback('')
  }

  function editAnnouncement(item: SchoolAnnouncement) {
    setAnnouncementDraft({ ...item })
    setFormError('')
    setFeedback('')
  }

  async function submitAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!announcementDraft) return

    const title = announcementDraft.title.trim()
    const body = announcementDraft.body.trim()
    if (!title || !body || !announcementDraft.date) {
      setFormError('Isi judul, tanggal, dan isi informasi sebelum menyimpan.')
      return
    }

    try {
      await saveAnnouncement({ ...announcementDraft, title, body })
      setAnnouncementDraft(null)
      setFormError('')
      setFeedback(
        announcementDraft.published
          ? 'Informasi tersimpan dan tampil di halaman publik.'
          : 'Draft informasi tersimpan di database server.',
      )
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Informasi belum dapat disimpan.')
    }
  }

  async function deleteProgram(program: AcademicProgram) {
    const confirmed = await confirm({
      title: t('Hapus program keahlian?'),
      description: `“${program.title}” ${t('akan dihapus dari situs. Tindakan ini tidak dapat dibatalkan.')}`,
      confirmLabel: t('Hapus program'),
      tone: 'danger',
    })
    if (!confirmed) return
    try {
      await removeProgram(program.id)
      setFeedback(`"${program.title}" dihapus dari database.`)
      if (programDraft?.id === program.id) setProgramDraft(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Data belum dapat dihapus.')
    }
  }

  async function deleteAnnouncement(item: SchoolAnnouncement) {
    const confirmed = await confirm({
      title: t('Hapus informasi sekolah?'),
      description: `“${item.title}” ${t('akan dihapus dari situs. Tindakan ini tidak dapat dibatalkan.')}`,
      confirmLabel: t('Hapus informasi'),
      tone: 'danger',
    })
    if (!confirmed) return
    try {
      await removeAnnouncement(item.id)
      setFeedback('Informasi dihapus dari database.')
      if (announcementDraft?.id === item.id) setAnnouncementDraft(null)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Informasi belum dapat dihapus.')
    }
  }

  async function verifyPrograms(verified: boolean) {
    try {
      await setProgramsVerified(verified)
      setFeedback(
        verified
          ? 'Daftar bidang ditandai sudah diverifikasi.'
          : 'Status verifikasi dikembalikan ke belum diverifikasi.',
      )
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Status belum dapat disimpan.')
    }
  }

  async function migrateLegacyContent() {
    if (!legacyContent) return
    setMigrationPending(true)
    setMigrationError('')
    try {
      await importLegacyContent(legacyContent)
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      setLegacyContent(null)
      setFeedback('Konten lama dari browser berhasil diimpor ke database server.')
    } catch (error) {
      setMigrationError(error instanceof Error ? error.message : 'Konten lama belum dapat diimpor.')
    } finally {
      setMigrationPending(false)
    }
  }

  const activeNav = sections.find((section) => section.id === activeSection) ?? sections[0]

  return (
    <div className="admin-workspace min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header
        className={[
          'admin-topbar sticky top-0 z-30 border-b border-gray-200 bg-white/95',
          'backdrop-blur dark:border-gray-800 dark:bg-gray-900/95',
        ].join(' ')}
      >
        <div className="admin-topbar-inner mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/logo-smk-bppi.png"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {schoolProfile.name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {schoolProfile.city} · Admin workspace
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`admin-topbar-status hidden items-center gap-2 xl:inline-flex ${storageStatus === 'unavailable' || storageStatus === 'invalid' ? 'is-offline' : ''}`}
              aria-label={serverStatusLabel}
            >
              <span className="admin-status-dot" aria-hidden="true" />
              {serverStatusLabel}
            </span>
            <span
              className={[
                'admin-user-pill hidden items-center gap-1.5 rounded-lg bg-brand-50 px-3',
                'py-2 text-xs font-semibold text-brand-800',
                'dark:bg-brand-950 dark:text-brand-200 sm:inline-flex',
              ].join(' ')}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" /> {username} ·{' '}
              {role === 'owner' ? 'Admin utama' : 'Admin'}
            </span>
            <a
              href="/"
              className={[
                'inline-flex items-center gap-2 rounded-lg border',
                'border-gray-200 px-3 py-2 text-sm font-medium',
                'text-gray-700 transition hover:bg-gray-50',
                'dark:border-gray-700 dark:text-gray-300',
                'dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <Globe2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Lihat situs</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={onLogout}
              className={[
                'inline-flex items-center gap-2 rounded-lg border',
                'border-gray-200 px-3 py-2 text-sm font-medium',
                'text-gray-700 transition hover:bg-gray-50',
                'dark:border-gray-700 dark:text-gray-300',
                'dark:hover:bg-gray-800',
              ].join(' ')}
              aria-label="Keluar dari panel admin"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout mx-auto grid max-w-[1540px] lg:grid-cols-[258px_minmax(0,1fr)]">
        <aside className="admin-sidebar hidden border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:block">
          <p className="admin-sidebar-label mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Pengelolaan
          </p>
          <AdminNavigation
            activeSection={activeSection}
            onNavigate={openSection}
            isOwner={role === 'owner'}
          />
          <div className="admin-sidebar-status mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <Bell className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Status konten
            </div>
            <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {publishedCount} informasi tampil di halaman publik.
            </p>
          </div>
        </aside>

        <main
          id="main-content"
          tabIndex={-1}
          className="admin-main min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-10"
        >
          <div className="admin-mobile-navigation mb-6 lg:hidden">
            <AdminNavigation
              activeSection={activeSection}
              onNavigate={openSection}
              compact
              isOwner={role === 'owner'}
            />
          </div>

          <div className="admin-page-heading mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="admin-eyebrow text-sm font-semibold text-brand-700 dark:text-brand-400">
                WORKSPACE / {schoolProfile.name}
              </p>
              <h1 className="admin-page-title mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {activeNav.label}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {activeSection === 'overview' &&
                  'Kelola program keahlian SMK dan informasi sekolah.'}
                {activeSection === 'programs' &&
                  'Atur program keahlian SMK yang ditampilkan di situs.'}
                {activeSection === 'information' &&
                  'Tulis draft atau publikasikan berita, pengumuman, dan informasi PPDB SMK.'}
                {activeSection === 'ppdb' &&
                  'Atur periode pendaftaran online dan tinjau data calon siswa yang masuk.'}
                {activeSection === 'reviews' &&
                  'Tinjau ulasan yang masuk dari situs dan hapus komentar yang tidak sesuai.'}
                {activeSection === 'messages' &&
                  'Baca dan tindak lanjuti pesan yang dikirim melalui formulir kontak website.'}
                {activeSection === 'admins' &&
                  'Buat akun admin tambahan. Pengelolaan akun admin hanya tersedia untuk admin utama.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadBackup(content)}
              className={[
                'admin-backup-button inline-flex w-fit items-center gap-2 rounded-lg border',
                'border-gray-200 bg-white px-3.5 py-2.5 text-sm',
                'font-semibold text-gray-700 transition hover:bg-gray-50',
                'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300',
                'dark:hover:bg-gray-800',
              ].join(' ')}
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
              Unduh backup JSON
            </button>
          </div>

          <StorageNotice status={storageStatus} lastSaved={lastSaved} />
          <div
            className={[
              'mb-6 rounded-xl border border-emerald-200 bg-emerald-50',
              'p-4 text-sm leading-relaxed text-emerald-950',
              'dark:border-emerald-900 dark:bg-emerald-950/30',
              'dark:text-emerald-100 admin-session-notice',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p>
                Sesi admin aktif. Perubahan disimpan di database server; draft hanya tersedia bagi
                admin yang sudah login.
              </p>
            </div>
          </div>

          {legacyContent && JSON.stringify(legacyContent) !== JSON.stringify(content) && (
            <div
              className={[
                'mb-6 rounded-xl border border-amber-300/70 bg-amber-50',
                'p-4 text-sm leading-relaxed text-amber-950',
                'dark:border-amber-800 dark:bg-amber-950/40',
                'dark:text-amber-100',
              ].join(' ')}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">Konten lama masih tersimpan di browser ini</p>
                  <p className="mt-1">
                    Impor akan mengganti konten server dengan salinan browser. Database hanya
                    menerima impor jika belum pernah diedit. Unduh backup server dulu bila
                    diperlukan.
                  </p>
                  {migrationError && (
                    <p role="alert" className="mt-2 font-medium">
                      {migrationError}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={migrationPending}
                  onClick={() => {
                    void migrateLegacyContent()
                  }}
                  className={[
                    'shrink-0 rounded-lg border border-amber-400 bg-white',
                    'px-3.5 py-2 text-sm font-semibold text-amber-950',
                    'hover:bg-amber-100 disabled:opacity-60',
                    'dark:border-amber-700 dark:bg-gray-900',
                    'dark:text-amber-100 dark:hover:bg-amber-950',
                  ].join(' ')}
                >
                  {migrationPending ? 'Mengimpor…' : 'Impor konten browser'}
                </button>
              </div>
            </div>
          )}

          {feedback && (
            <div
              role="status"
              className={[
                'mb-5 flex items-center gap-2 rounded-lg border',
                'border-emerald-300 bg-emerald-50 px-4 py-3 text-sm',
                'text-emerald-900 dark:border-emerald-900',
                'dark:bg-emerald-950/40 dark:text-emerald-200',
              ].join(' ')}
            >
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              {feedback}
            </div>
          )}

          {activeSection === 'overview' && (
            <Overview
              content={content}
              storageStatus={storageStatus}
              onNavigate={openSection}
              onNewAnnouncement={() => startNewAnnouncement('pengumuman')}
            />
          )}

          {activeSection === 'programs' && (
            <ProgramManager
              content={content}
              draft={programDraft}
              error={formError}
              onNew={startNewProgram}
              onEdit={editProgram}
              onDelete={deleteProgram}
              onCancel={() => {
                setProgramDraft(null)
                setFormError('')
              }}
              onChange={setProgramDraft}
              onSubmit={submitProgram}
              onVerify={() => {
                void verifyPrograms(!content.programsVerified)
              }}
            />
          )}

          {activeSection === 'information' && (
            <InformationManager
              draft={announcementDraft}
              filter={announcementFilter}
              items={visibleAnnouncements}
              error={formError}
              onNew={startNewAnnouncement}
              onEdit={editAnnouncement}
              onDelete={deleteAnnouncement}
              onCancel={() => {
                setAnnouncementDraft(null)
                setFormError('')
              }}
              onChange={setAnnouncementDraft}
              onSubmit={submitAnnouncement}
              onFilter={setAnnouncementFilter}
            />
          )}

          {activeSection === 'ppdb' && <PpdbManager />}
          {activeSection === 'reviews' && <ReviewsManager />}
          {activeSection === 'messages' && <ContactMessagesManager />}
          {activeSection === 'admins' && role === 'owner' && <AdminAccountsManager />}
        </main>
      </div>
    </div>
  )
}

function AdminNavigation({
  activeSection,
  onNavigate,
  compact = false,
  isOwner = false,
}: {
  activeSection: AdminSection
  onNavigate: (section: AdminSection) => void
  compact?: boolean
  isOwner?: boolean
}) {
  const visibleSections = isOwner ? sections : sections.filter((section) => section.id !== 'admins')
  return (
    <nav aria-label="Menu admin" className={compact ? 'admin-nav admin-nav-compact grid grid-cols-2 gap-2 sm:grid-cols-4' : 'admin-nav space-y-1'}>
      {visibleSections.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onNavigate(id)}
          aria-current={activeSection === id ? 'page' : undefined}
          className={`admin-nav-button flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
            activeSection === id ? 'is-active bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          } ${compact ? 'justify-center px-2 text-xs sm:text-sm' : ''}`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className={compact ? 'text-center' : ''}>{label}</span>
        </button>
      ))}
    </nav>
  )
}

function StorageNotice({ status, lastSaved }: { status: StorageStatus; lastSaved: string | null }) {
  const copy =
    {
      loading: 'Memeriksa koneksi database server…',
      ready: 'Terhubung ke database server. Informasi publik dimuat dari penyimpanan bersama.',
      saved: 'Perubahan terakhir berhasil disimpan di database server.',
      unavailable:
        'Backend tidak terhubung. Data contoh ditampilkan dan perubahan admin belum dapat disimpan.',
      invalid: 'Data dari server tidak valid. Hubungi pengelola server sebelum mengubah konten.',
    }[status] ?? 'Status penyimpanan tidak diketahui.'

  return (
    <div
      className={[
        'mb-5 flex flex-col gap-1 rounded-xl border',
        'border-gray-200 bg-white px-4 py-3 text-sm',
        'dark:border-gray-800 dark:bg-gray-900 sm:flex-row',
        'sm:items-center sm:justify-between admin-storage-notice',
      ].join(' ')}
    >
      <p className="text-gray-600 dark:text-gray-300">{copy}</p>
      {lastSaved && (
        <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
          Terakhir disimpan:{' '}
          {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(
            new Date(lastSaved),
          )}
        </p>
      )}
    </div>
  )
}

function Overview({
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

function StatCard({
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

function ProgramManager({
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

function ProgramForm({
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

const inputClass = [
  'mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm',
  'text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-600',
  'focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100',
  'dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:ring-brand-950',
].join(' ')

function InformationManager({
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

function AnnouncementForm({
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

export default AdminPage
