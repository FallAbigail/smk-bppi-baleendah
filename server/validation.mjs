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
const ppdbApplicationStatuses = new Set([
  'baru',
  'ditinjau',
  'perlu_konfirmasi',
  'menunggu_pembayaran',
  'pembayaran_dikonfirmasi',
  'diterima',
  'tidak_diterima',
])

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

function programLogo(value) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string' || value.length > 360_000) {
    throw new Error('Logo harus berupa gambar WebP maksimal 270 KB.')
  }
  const match = /^data:image\/webp;base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match) throw new Error('Format logo tidak valid. Unggah gambar PNG, JPG, atau WebP.')
  const bytes = Buffer.from(match[1], 'base64')
  if (
    bytes.length < 12 ||
    bytes.length > 270_000 ||
    bytes.toString('ascii', 0, 4) !== 'RIFF' ||
    bytes.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    throw new Error('Logo tidak valid atau ukurannya terlalu besar. Coba gunakan gambar lain.')
  }
  return value
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
  return { level, title, description, highlights, icon: input.icon, logo: programLogo(input.logo) }
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

function optionalText(value, label, maxLength) {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string') throw new Error(`${label} harus berupa teks.`)
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (normalized.length > maxLength) throw new Error(`${label} terlalu panjang.`)
  return normalized
}

function validIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function jakartaToday() {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  )
  return `${values.year}-${values.month}-${values.day}`
}

function phone(value, label, required = true) {
  if (typeof value !== 'string') throw new Error(`${label} tidak valid.`)
  const normalized = value.trim().replace(/[\s().-]/g, '')
  if (!normalized && !required) return ''
  if (!/^\+?\d{8,15}$/.test(normalized)) {
    throw new Error(`${label} harus berisi 8–15 angka.`)
  }
  return normalized
}

export function validatePpdbApplication(input) {
  if (!isRecord(input)) throw new Error('Data pendaftaran tidak valid.')
  if (typeof input.website === 'string' && input.website.trim()) {
    throw new Error('Data pendaftaran tidak valid.')
  }
  const studentName = text(input.studentName, 'Nama calon siswa', 100).replace(/\s+/g, ' ')
  if (studentName.length < 2) throw new Error('Nama calon siswa minimal 2 karakter.')
  if (!validIsoDate(input.birthDate) || input.birthDate > jakartaToday()) {
    throw new Error('Tanggal lahir tidak valid.')
  }
  if (!['Laki-laki', 'Perempuan'].includes(input.gender)) {
    throw new Error('Pilih jenis kelamin calon siswa.')
  }
  const address = text(input.address, 'Alamat', 500)
  if (address.length < 8) throw new Error('Alamat calon siswa terlalu singkat.')
  const guardianName = text(input.guardianName, 'Nama orang tua/wali', 100).replace(/\s+/g, ' ')
  if (guardianName.length < 2) throw new Error('Nama orang tua/wali minimal 2 karakter.')
  const guardianPhone = phone(input.guardianPhone, 'Nomor telepon orang tua/wali')
  const studentPhone = phone(input.studentPhone ?? '', 'Nomor telepon calon siswa', false)
  const studentEmail = optionalText(input.studentEmail, 'Email', 150).toLowerCase()
  if (studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
    throw new Error('Alamat email tidak valid.')
  }
  const previousSchool = text(input.previousSchool, 'Asal sekolah', 150)
  const graduationYear = input.graduationYear === undefined || input.graduationYear === '' || input.graduationYear === null
    ? null
    : Number(input.graduationYear)
  if (
    graduationYear !== null &&
    (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > new Date().getFullYear() + 1)
  ) {
    throw new Error('Tahun lulus tidak valid.')
  }
  if (typeof input.programId !== 'string' || !/^[\w-]{1,100}$/.test(input.programId)) {
    throw new Error('Pilih program keahlian.')
  }
  if (input.consent !== true) throw new Error('Persetujuan penggunaan data wajib dicentang.')

  return {
    studentName,
    birthDate: input.birthDate,
    gender: input.gender,
    address,
    studentPhone,
    studentEmail,
    guardianName,
    guardianPhone,
    previousSchool,
    graduationYear,
    programId: input.programId,
  }
}

export function validatePpdbSettings(input) {
  if (!isRecord(input) || typeof input.isOpen !== 'boolean') {
    throw new Error('Pengaturan pendaftaran tidak valid.')
  }
  const academicYear = optionalText(input.academicYear, 'Tahun ajaran', 9)
  if (academicYear && !/^\d{4}\/\d{4}$/.test(academicYear)) {
    throw new Error('Tahun ajaran harus menggunakan format, misalnya 2026/2027.')
  }
  if (academicYear) {
    const [start, end] = academicYear.split('/').map(Number)
    if (end !== start + 1) throw new Error('Tahun ajaran harus terdiri dari dua tahun berurutan.')
  }
  if (input.isOpen && !academicYear) {
    throw new Error('Isi tahun ajaran sebelum membuka pendaftaran.')
  }
  return {
    isOpen: input.isOpen,
    academicYear,
    publicMessage: optionalText(input.publicMessage, 'Pesan pendaftaran', 500),
  }
}

export function validatePpdbApplicationUpdate(input) {
  if (!isRecord(input) || !ppdbApplicationStatuses.has(input.status)) {
    throw new Error('Status pendaftaran tidak valid.')
  }
  return {
    status: input.status,
    publicMessage: optionalText(input.publicMessage, 'Pesan untuk pendaftar', 500),
    internalNote: optionalText(input.internalNote, 'Catatan internal', 1000),
  }
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
