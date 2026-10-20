import siteContent from './site-content.json'

export type ProgramIcon =
  | 'science'
  | 'social'
  | 'technology'
  | 'arts'
  | 'language'
  | 'environment'
  | 'business'
export type SchoolLevel = 'smk'

export type AnnouncementCategory = 'berita' | 'pengumuman' | 'penerimaan'

export interface AcademicProgram {
  id: string
  level: SchoolLevel
  title: string
  description: string
  highlights: string[]
  icon: ProgramIcon
  logo?: string
}

export interface SchoolAnnouncement {
  id: string
  title: string
  body: string
  category: AnnouncementCategory
  date: string
  published: boolean
}

export interface SiteContent {
  programs: AcademicProgram[]
  announcements: SchoolAnnouncement[]
  programsVerified: boolean
}

export const defaultSiteContent = siteContent as SiteContent
