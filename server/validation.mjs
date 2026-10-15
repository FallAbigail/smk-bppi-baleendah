const programIcons = new Set([
  'science',
  'social',
  'technology',
  'arts',
  'language',
  'environment',
  'business',
])
const schoolLevels = new Set(['smk'])
const announcementCategories = new Set(['berita', 'pengumuman', 'penerimaan'])

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value, label, maxLength) {
  if (typeof value !== 'string') throw new Error(`${label} harus berupa teks.`)
  const normalized = value.trim()
  if (!normalized) throw new Error(`${label} wajib diisi.`)
  if (normalized.length > maxLength) throw new Error(`${label} terlalu panjang.`)
  return normalized
}

export function validateProgram(input) {
  if (!isRecord(input)) throw new Error('Data bidang pembelajaran tidak valid.')
  const level = input.level ?? 'smk'
  if (!schoolLevels.has(level)) throw new Error('Jenjang pendidikan tidak valid.')
  const nameLabel = 'Nama program keahlian'
  const itemLabel = 'Kompetensi keahlian'
  const title = text(input.title, nameLabel, 100)
  const description = text(input.description, 'Deskripsi', 400)
  const rawHighlights = input.highlights ?? input.subjects
  if (!Array.isArray(rawHighlights) || rawHighlights.length === 0 || rawHighlights.length > 30) {
    throw new Error(`Tambahkan 1–30 ${itemLabel.toLocaleLowerCase('id-ID')}.`)
  }
  const highlights = rawHighlights.map((item) => text(item, itemLabel, 100))
  if (
    new Set(highlights.map((item) => item.toLocaleLowerCase('id-ID'))).size !== highlights.length
  ) {
    throw new Error(`${itemLabel} tidak boleh duplikat.`)
  }
  if (!programIcons.has(input.icon)) throw new Error('Ikon bidang tidak valid.')
  return { level, title, description, highlights, icon: input.icon }
}

export function validateAnnouncement(input) {
  if (!isRecord(input)) throw new Error('Data informasi tidak valid.')
  const title = text(input.title, 'Judul', 120)
  const body = text(input.body, 'Isi informasi', 3000)
  if (!announcementCategories.has(input.category))
    throw new Error('Kategori informasi tidak valid.')
  if (typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new Error('Tanggal informasi tidak valid.')
  }
  const parsedDate = new Date(`${input.date}T00:00:00.000Z`)
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== input.date) {
    throw new Error('Tanggal informasi tidak valid.')
  }
  if (typeof input.published !== 'boolean') throw new Error('Status publikasi tidak valid.')
  return { title, body, category: input.category, date: input.date, published: input.published }
}

export function validateSiteContent(input) {
  if (!isRecord(input) || !Array.isArray(input.programs) || !Array.isArray(input.announcements)) {
    throw new Error('Format backup konten tidak valid.')
  }
  if (input.programs.length > 100 || input.announcements.length > 500) {
    throw new Error('Backup melewati batas jumlah data yang diizinkan.')
  }
  if (typeof input.programsVerified !== 'boolean')
    throw new Error('Status verifikasi program tidak valid.')

  const programs = input.programs.map((program) => {
    if (
      !isRecord(program) ||
      typeof program.id !== 'string' ||
      !/^[\w-]{1,100}$/.test(program.id)
    ) {
      throw new Error('ID bidang pada backup tidak valid.')
    }
    return { id: program.id, ...validateProgram(program) }
  })
  const announcements = input.announcements.map((item) => {
    if (!isRecord(item) || typeof item.id !== 'string' || !/^[\w-]{1,100}$/.test(item.id)) {
      throw new Error('ID informasi pada backup tidak valid.')
    }
    return { id: item.id, ...validateAnnouncement(item) }
  })
  if (
    new Set(programs.map((program) => program.title.toLocaleLowerCase('id-ID'))).size !==
    programs.length
  ) {
    throw new Error('Nama program keahlian pada backup tidak boleh duplikat.')
  }
  return { programs, announcements, programsVerified: input.programsVerified }
}
