import {
  BookA,
  BriefcaseBusiness,
  Code2,
  FlaskConical,
  Globe2,
  Leaf,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import type { AnnouncementCategory, ProgramIcon, SiteContent } from '../../data/siteContent'

// Shared presentation helpers, backup download, and logo preparation.
export const iconComponents: Record<ProgramIcon, LucideIcon> = {
  science: FlaskConical,
  social: Globe2,
  technology: Code2,
  arts: Palette,
  language: BookA,
  environment: Leaf,
  business: BriefcaseBusiness,
}

export async function prepareProgramLogo(file: File) {
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

export const categoryLabels: Record<AnnouncementCategory, string> = {
  berita: 'Berita sekolah',
  pengumuman: 'Pengumuman',
  penerimaan: 'PPDB SMK',
}

export function localDate() {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 10)
}

export function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        parsed,
      )
}

export function categoryLabel(category: AnnouncementCategory) {
  return categoryLabels[category]
}

export function downloadBackup(content: SiteContent) {
  const file = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `backup-profil-sekolah-${localDate()}.json`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const inputClass = [
  'mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm',
  'text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-600',
  'focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100',
  'dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:ring-brand-950',
].join(' ')
