import {
  ArrowDownToLine,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ClipboardList,
  Globe2,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useConfirmDialog } from '../../contexts/ConfirmDialogContext'
import { useLanguage } from '../../contexts/LanguageContext'
import {
  LEGACY_STORAGE_KEY,
  readLegacySiteContent,
  useSiteContent,
  type StorageStatus,
} from '../../contexts/SiteContentContext'
import { schoolProfile } from '../../data/schoolProfile'
import type {
  AcademicProgram,
  AnnouncementCategory,
  SchoolAnnouncement,
  SchoolLevel,
  SiteContent,
} from '../../data/siteContent'
import AdminAccountsManager from './AdminAccountsManager'
import { downloadBackup, localDate } from './adminHelpers'
import { Overview } from './AdminOverview'
import ContactMessagesManager from './ContactMessagesManager'
import { InformationManager } from './InformationManager'
import PpdbManager from './PpdbManager'
import { ProgramManager } from './ProgramsManager'
import ReviewsManager from './ReviewsManager'
import type {
  AdminRole,
  AdminSection,
  AnnouncementDraft,
  AnnouncementFilter,
  ProgramDraft,
} from './types'

// Coordinate content changes and navigation between admin sections.
export const sections: Array<{ id: AdminSection; label: string; Icon: LucideIcon }> = [
  { id: 'overview', label: 'Ringkasan', Icon: LayoutDashboard },
  { id: 'programs', label: 'Program keahlian', Icon: BookOpen },
  { id: 'information', label: 'Informasi & PPDB', Icon: Megaphone },
  { id: 'ppdb', label: 'Pendaftar PPDB', Icon: ClipboardList },
  { id: 'reviews', label: 'Ulasan', Icon: MessageSquareText },
  { id: 'messages', label: 'Pesan Masuk', Icon: Mail },
  { id: 'admins', label: 'Akun admin', Icon: UsersRound },
]

export function AdminWorkspace({
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

export function AdminNavigation({
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

export function StorageNotice({ status, lastSaved }: { status: StorageStatus; lastSaved: string | null }) {
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
