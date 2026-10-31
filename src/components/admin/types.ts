import { type Dispatch, type SetStateAction } from 'react'
import type { AnnouncementCategory, ProgramIcon, SchoolLevel } from '../../data/siteContent'

// Shared types for admin navigation and editable form drafts.
export type AdminRole = 'owner' | 'admin'

export type AdminSection =
  | 'overview'
  | 'programs'
  | 'information'
  | 'ppdb'
  | 'reviews'
  | 'messages'
  | 'admins'

export type ProgramDraft = {
  id?: string
  level: SchoolLevel
  title: string
  description: string
  highlights: string
  icon: ProgramIcon
  logo: string
}

export type ProgramDraftSetter = Dispatch<SetStateAction<ProgramDraft | null>>

export type AnnouncementDraft = {
  id?: string
  title: string
  body: string
  category: AnnouncementCategory
  date: string
  published: boolean
}

export type AnnouncementFilter = 'all' | 'published' | 'draft'
