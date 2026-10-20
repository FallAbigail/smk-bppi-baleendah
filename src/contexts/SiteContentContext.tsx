import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  defaultSiteContent,
  type AcademicProgram,
  type SchoolAnnouncement,
  type SiteContent,
} from '../data/siteContent'
import { apiRequest } from '../lib/api'

export const LEGACY_STORAGE_KEY = 'sma-negeri-x:site-content:v1'

export type StorageStatus = 'loading' | 'ready' | 'saved' | 'unavailable' | 'invalid'

interface ContentState {
  content: SiteContent
  storageStatus: StorageStatus
  lastSaved: string | null
}

interface ContentResponse {
  content: SiteContent
}

interface AdminContentResponse extends ContentResponse {
  updatedAt: string | null
  revision: number
}

interface SiteContentContextValue extends ContentState {
  loadAdminContent: () => Promise<Pick<AdminContentResponse, 'updatedAt' | 'revision'>>
  loadPublicContent: () => Promise<void>
  importLegacyContent: (content: SiteContent) => Promise<void>
  saveProgram: (program: Omit<AcademicProgram, 'id'> & { id?: string }) => Promise<string>
  removeProgram: (id: string) => Promise<void>
  setProgramsVerified: (verified: boolean) => Promise<void>
  saveAnnouncement: (
    announcement: Omit<SchoolAnnouncement, 'id'> & { id?: string },
  ) => Promise<string>
  removeAnnouncement: (id: string) => Promise<void>
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProgram(value: unknown): value is AcademicProgram {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    value.level === 'smk' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    Array.isArray(value.highlights) &&
    value.highlights.every((item) => typeof item === 'string') &&
    (value.logo === undefined || typeof value.logo === 'string') &&
    ['science', 'social', 'technology', 'arts', 'language', 'environment', 'business'].includes(
      String(value.icon),
    )
  )
}

function isAnnouncement(value: unknown): value is SchoolAnnouncement {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    ['berita', 'pengumuman', 'penerimaan'].includes(String(value.category)) &&
    typeof value.date === 'string' &&
    typeof value.published === 'boolean'
  )
}

function isSiteContent(value: unknown): value is SiteContent {
  return (
    isRecord(value) &&
    Array.isArray(value.programs) &&
    value.programs.every(isProgram) &&
    Array.isArray(value.announcements) &&
    value.announcements.every(isAnnouncement) &&
    typeof value.programsVerified === 'boolean'
  )
}

export function readLegacySiteContent(): SiteContent | null {
  try {
    const saved = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!saved) return null
    const parsed: unknown = JSON.parse(saved)
    if (!isRecord(parsed) || !Array.isArray(parsed.programs)) return null

    const programs = parsed.programs.map((program) => {
      if (!isRecord(program)) return program
      return {
        ...program,
        level: program.level ?? 'smk',
        highlights: program.highlights ?? program.subjects,
      }
    })
    const normalized = { ...parsed, programs }
    return isSiteContent(normalized) ? normalized : null
  } catch {
    return null
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({
    content: defaultSiteContent,
    storageStatus: 'loading',
    lastSaved: null,
  })

  const loadPublicContent = useCallback(async () => {
    try {
      const content = await apiRequest<SiteContent>('/content')
      if (!isSiteContent(content)) throw new Error('Data situs dari server tidak valid.')
      setState({ content, storageStatus: 'ready', lastSaved: null })
    } catch {
      setState((current) => ({ ...current, storageStatus: 'unavailable' }))
      throw new Error('Backend belum dapat dihubungi. Konten contoh tetap ditampilkan.')
    }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest<SiteContent>('/content')
      .then((content) => {
        if (!active) return
        if (!isSiteContent(content)) throw new Error('Data situs dari server tidak valid.')
        setState({ content, storageStatus: 'ready', lastSaved: null })
      })
      .catch(() => {
        if (active) setState((current) => ({ ...current, storageStatus: 'unavailable' }))
      })
    return () => {
      active = false
    }
  }, [])

  const applyAdminContent = useCallback(
    (content: SiteContent, lastSaved: string | null = new Date().toISOString()) => {
      if (!isSiteContent(content)) throw new Error('Data admin dari server tidak valid.')
      setState({ content, storageStatus: 'saved', lastSaved })
    },
    [],
  )

  const loadAdminContent = useCallback(async () => {
    const response = await apiRequest<AdminContentResponse>('/admin/content')
    applyAdminContent(response.content, response.updatedAt)
    return { updatedAt: response.updatedAt, revision: response.revision }
  }, [applyAdminContent])

  const importLegacyContent = useCallback(
    async (content: SiteContent) => {
      const response = await apiRequest<AdminContentResponse>('/admin/legacy-import', {
        method: 'POST',
        body: JSON.stringify(content),
      })
      applyAdminContent(response.content, response.updatedAt)
    },
    [applyAdminContent],
  )

  const saveProgram = useCallback(
    async (program: Omit<AcademicProgram, 'id'> & { id?: string }) => {
      const path = program.id
        ? `/admin/programs/${encodeURIComponent(program.id)}`
        : '/admin/programs'
      const response = await apiRequest<ContentResponse & { id?: string }>(path, {
        method: program.id ? 'PUT' : 'POST',
        body: JSON.stringify(program),
      })
      applyAdminContent(response.content)
      return response.id ?? program.id ?? ''
    },
    [applyAdminContent],
  )

  const removeProgram = useCallback(
    async (id: string) => {
      const response = await apiRequest<ContentResponse>(
        `/admin/programs/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      applyAdminContent(response.content)
    },
    [applyAdminContent],
  )

  const setProgramsVerified = useCallback(
    async (verified: boolean) => {
      const response = await apiRequest<ContentResponse>('/admin/programs/verified', {
        method: 'PATCH',
        body: JSON.stringify({ verified }),
      })
      applyAdminContent(response.content)
    },
    [applyAdminContent],
  )

  const saveAnnouncement = useCallback(
    async (announcement: Omit<SchoolAnnouncement, 'id'> & { id?: string }) => {
      const path = announcement.id
        ? `/admin/announcements/${encodeURIComponent(announcement.id)}`
        : '/admin/announcements'
      const response = await apiRequest<ContentResponse & { id?: string }>(path, {
        method: announcement.id ? 'PUT' : 'POST',
        body: JSON.stringify(announcement),
      })
      applyAdminContent(response.content)
      return response.id ?? announcement.id ?? ''
    },
    [applyAdminContent],
  )

  const removeAnnouncement = useCallback(
    async (id: string) => {
      const response = await apiRequest<ContentResponse>(
        `/admin/announcements/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      )
      applyAdminContent(response.content)
    },
    [applyAdminContent],
  )

  const value = useMemo(
    () => ({
      ...state,
      loadAdminContent,
      loadPublicContent,
      importLegacyContent,
      saveProgram,
      removeProgram,
      setProgramsVerified,
      saveAnnouncement,
      removeAnnouncement,
    }),
    [
      state,
      loadAdminContent,
      loadPublicContent,
      importLegacyContent,
      saveProgram,
      removeProgram,
      setProgramsVerified,
      saveAnnouncement,
      removeAnnouncement,
    ],
  )

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent() {
  const context = useContext(SiteContentContext)
  if (!context) throw new Error('useSiteContent must be used inside SiteContentProvider')
  return context
}
