import { createHash, randomBytes } from 'node:crypto'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import {
  addLegacyContentIfUnchanged,
  contentRevision,
  createContactMessage,
  createContactConversationReply,
  createContactFormFollowUp,
  createContactMessageReply,
  createReview,
  createAdmin,
  createPpdbApplication,
  createSession,
  deleteContactMessage,
  deleteReview,
  archivePpdbApplication,
  endPpdbPeriod,
  db,
  deleteExpiredSessions,
  deleteSession,
  findAdminByUsername,
  findContactConversation,
  findSession,
  getContactMessageSummary,
  getContentUpdatedAt,
  getReviewSummary,
  getPpdbSettings,
  findPpdbApplicationForTracking,
  hasAdminAccounts,
  listPpdbApplications,
  listArchivedPpdbApplications,
  listPpdbPeriods,
  listAdmins,
  listContactMessages,
  listReviews,
  readSiteContent,
  removeAnnouncement,
  removeProgram,
  replaceSiteContent,
  saveAnnouncement,
  saveProgram,
  savePpdbSettings,
  setContactMessageStatus,
  setProgramsVerified,
  updatePpdbApplication,
  restorePpdbApplication,
} from './database.mjs'
import { hashPassword, verifyPassword } from './passwords.mjs'
import {
  validateAnnouncement,
  validateProgram,
  validateSiteContent,
  validatePpdbApplication,
  validatePpdbApplicationUpdate,
  validatePpdbSettings,
} from './validation.mjs'

const app = express()
const runtimeMode =
  process.env.NODE_ENV ?? (process.argv[2] === 'dev' ? 'development' : 'production')
const isProduction = runtimeMode === 'production'
const sessionCookieName = 'school_admin_session'
const sessionLifetimeMs = 12 * 60 * 60 * 1000
const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const distDirectory = resolve(projectRoot, 'dist')

app.disable('x-powered-by')
app.set('trust proxy', process.env.TRUST_PROXY === '1')
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            frameSrc: ['https://www.google.com'],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: isProduction ? undefined : false,
  }),
)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})
app.use('/api', express.json({ limit: '512kb', strict: true }))

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login. Coba lagi beberapa menit kemudian.' },
})

const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Batas kiriman ulasan tercapai. Coba lagi satu jam kemudian.' },
})

const contactMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Batas kirim pesan tercapai. Coba lagi satu jam kemudian.' },
})

const contactConversationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Batas pemeriksaan percakapan tercapai. Coba lagi nanti.' },
})

const contactConversationReplyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Batas balasan percakapan tercapai. Coba lagi satu jam kemudian.' },
})

const ppdbSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Batas pengiriman formulir tercapai. Coba lagi satu jam kemudian.' },
})

const ppdbStatusLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Batas pemeriksaan status tercapai. Coba lagi nanti.' },
})

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function readSessionToken(req) {
  const prefix = `${sessionCookieName}=`
  const cookie = (req.headers.cookie ?? '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
  return cookie ? cookie.slice(prefix.length) : null
}

function writeSessionCookie(res, token, maxAgeSeconds) {
  const parts = [
    `${sessionCookieName}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`,
  ]
  if (isProduction) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

function clearSessionCookie(res) {
  const parts = [`${sessionCookieName}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0']
  if (isProduction) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

function sameOrigin(req, res, next) {
  const origin = req.get('origin')
  const expectedOrigin = `${req.protocol}://${req.get('host')}`
  const developmentOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ])
  const configuredOrigin = process.env.APP_ORIGIN?.replace(/\/$/, '')
  const allowed = new Set([expectedOrigin, configuredOrigin].filter(Boolean))
  if (!isProduction)
    for (const developmentOrigin of developmentOrigins) allowed.add(developmentOrigin)

  if (!origin || !allowed.has(origin)) {
    res.status(403).json({ message: 'Permintaan ditolak karena asal halaman tidak valid.' })
    return
  }
  next()
}

function requireAdmin(req, res, next) {
  const token = readSessionToken(req)
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    res.status(401).json({ message: 'Sesi admin tidak aktif. Silakan login kembali.' })
    return
  }

  const admin = findSession(hashToken(token))
  if (!admin) {
    clearSessionCookie(res)
    res.status(401).json({ message: 'Sesi admin sudah berakhir. Silakan login kembali.' })
    return
  }

  req.admin = admin
  next()
}

function requireOwner(req, res, next) {
  if (req.admin?.role !== 'owner') {
    res.status(403).json({ message: 'Hanya admin utama yang dapat mengelola akun admin.' })
    return
  }
  next()
}

function handleValidationError(error, res) {
  if (error?.errcode === 2067 || error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    res.status(409).json({ message: 'Nama bidang tersebut sudah digunakan.' })
    return true
  }
  if (error instanceof Error && !error.message.includes('SQLITE_CONSTRAINT')) {
    res.status(400).json({ message: error.message })
    return true
  }
  return false
}

function handleDatabaseError(error, res) {
  if (handleValidationError(error, res)) return
  console.error('Database request failed:', error)
  res.status(500).json({ message: 'Data belum dapat disimpan. Coba lagi.' })
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.get('/api/content', (_req, res) => {
  res.json(readSiteContent({ includeDrafts: false }))
})

app.post('/api/contact/messages', contactMessageLimiter, sameOrigin, (req, res) => {
  const name = typeof req.body?.name === 'string'
    ? req.body.name.trim().replace(/\s+/g, ' ')
    : ''
  const phone = typeof req.body?.phone === 'string'
    ? req.body.phone.trim().replace(/\s+/g, ' ')
    : ''
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const topic = req.body?.topic
  const replyChannel = req.body?.replyChannel ?? 'website'
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''

  if (name.length < 2 || name.length > 80) {
    res.status(400).json({ message: 'Nama harus berisi 2–80 karakter.' })
    return
  }
  if (phone.length > 32 || (phone && !/^[+\d().\-\s]+$/.test(phone))) {
    res.status(400).json({ message: 'Nomor telepon tidak valid.' })
    return
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    res.status(400).json({ message: 'Alamat email tidak valid.' })
    return
  }
  if (!['ppdb', 'program', 'partnership', 'other'].includes(topic)) {
    res.status(400).json({ message: 'Pilih keperluan pesan yang tersedia.' })
    return
  }
  if (!['website', 'email'].includes(replyChannel)) {
    res.status(400).json({ message: 'Pilih cara menerima balasan yang tersedia.' })
    return
  }
  if (message.length < 10 || message.length > 3000) {
    res.status(400).json({ message: 'Pesan harus berisi 10–3.000 karakter.' })
    return
  }

  try {
    const continuationTrackingCode = typeof req.body?.continuationTrackingCode === 'string'
      ? req.body.continuationTrackingCode.trim()
      : ''
    if (/^[A-Za-z0-9_-]{40,60}$/.test(continuationTrackingCode)) {
      const continuation = createContactFormFollowUp(
        hashToken(continuationTrackingCode),
        { name, email, topic, message, replyChannel },
      )
      if (continuation) {
        res.status(201).json({
          ok: true,
          id: continuation.id,
          trackingCode: continuationTrackingCode,
          reusedConversation: true,
        })
        return
      }
    }

    const trackingCode = randomBytes(32).toString('base64url')
    const saved = createContactMessage({ name, phone, email, topic, message, replyChannel }, hashToken(trackingCode))
    res.status(201).json({ ok: true, id: saved.id, trackingCode, reusedConversation: false })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.post('/api/contact/messages/conversation', contactConversationLimiter, sameOrigin, (req, res) => {
  const trackingCode = typeof req.body?.trackingCode === 'string' ? req.body.trackingCode.trim() : ''
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(trackingCode)) {
    res.status(404).json({ message: 'Tautan percakapan tidak valid atau sudah tidak tersedia.' })
    return
  }

  const conversation = findContactConversation(hashToken(trackingCode))
  if (!conversation) {
    res.status(404).json({ message: 'Tautan percakapan tidak valid atau sudah tidak tersedia.' })
    return
  }
  res.json(conversation)
})

app.post('/api/contact/messages/conversation/replies', contactConversationReplyLimiter, sameOrigin, (req, res) => {
  const trackingCode = typeof req.body?.trackingCode === 'string' ? req.body.trackingCode.trim() : ''
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(trackingCode)) {
    res.status(404).json({ message: 'Tautan percakapan tidak valid atau sudah tidak tersedia.' })
    return
  }
  if (!body || body.length > 3000) {
    res.status(400).json({ message: 'Pesan lanjutan harus berisi 1–3.000 karakter.' })
    return
  }

  try {
    const reply = createContactConversationReply(hashToken(trackingCode), body)
    if (!reply) {
      res.status(404).json({ message: 'Tautan percakapan tidak valid atau sudah tidak tersedia.' })
      return
    }
    res.status(201).json({ reply })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

const reviewPageSize = 3
const adminReviewPageSize = 12

function reviewPagination(requestedPage, summary, pageSize = reviewPageSize) {
  const pageCount = Math.ceil(summary.count / pageSize)
  const parsedPage = Number.parseInt(String(requestedPage ?? '1'), 10) || 1
  const page = pageCount ? Math.max(1, Math.min(pageCount, parsedPage)) : 1
  return { page, pageCount, pageSize }
}

app.get('/api/reviews', (req, res) => {
  const summary = getReviewSummary()
  const rating = req.query.rating === undefined ? null : Number(req.query.rating)
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    res.status(400).json({ message: 'Pilih rating dari 1 sampai 5 bintang.' })
    return
  }
  const filteredSummary = rating === null ? summary : getReviewSummary(rating)
  const pagination = reviewPagination(req.query.page, filteredSummary)
  const offset = (pagination.page - 1) * pagination.pageSize
  res.json({ reviews: listReviews(pagination.pageSize, offset, rating), summary, pagination })
})

app.post('/api/reviews', reviewLimiter, sameOrigin, (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().replace(/\s+/g, ' ') : ''
  const role = req.body?.role
  const rating = req.body?.rating
  const comment =
    typeof req.body?.comment === 'string' ? req.body.comment.trim().replace(/\s+/g, ' ') : ''

  if (name.length < 2 || name.length > 60) {
    res.status(400).json({ message: 'Nama harus berisi 2–60 karakter.' })
    return
  }
  if (!['alumni', 'student', 'parent'].includes(role)) {
    res.status(400).json({ message: 'Pilih status alumni, siswa, atau orang tua.' })
    return
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ message: 'Pilih rating dari 1 sampai 5 bintang.' })
    return
  }
  if (comment.length < 10 || comment.length > 500) {
    res.status(400).json({ message: 'Komentar harus berisi 10–500 karakter.' })
    return
  }

  try {
    const review = createReview({ name, role, rating, comment })
    const summary = getReviewSummary()
    res.status(201).json({ review, summary, pagination: reviewPagination(1, summary) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.get('/api/admin/reviews', requireAdmin, (req, res) => {
  const filter = req.query.filter === 'low' ? 'low' : null
  const summary = getReviewSummary(filter)
  const pagination = reviewPagination(req.query.page, summary, adminReviewPageSize)
  const offset = (pagination.page - 1) * pagination.pageSize
  res.json({
    reviews: listReviews(pagination.pageSize, offset, filter),
    summary,
    pagination,
  })
})

app.delete('/api/admin/reviews/:id', requireAdmin, sameOrigin, (req, res) => {
  const id = req.params.id
  if (!/^[\w-]{1,100}$/.test(id) || !deleteReview(id)) {
    res.status(404).json({ message: 'Ulasan tidak ditemukan.' })
    return
  }
  res.json({ ok: true, summary: getReviewSummary() })
})

app.get('/api/admin/contact-messages', requireAdmin, (req, res) => {
  const pageSize = 12
  const summary = getContactMessageSummary()
  const pageCount = Math.ceil(summary.total / pageSize)
  const requestedPage = Number.parseInt(String(req.query.page ?? '1'), 10) || 1
  const page = pageCount ? Math.max(1, Math.min(pageCount, requestedPage)) : 1
  res.json({
    messages: listContactMessages(pageSize, (page - 1) * pageSize),
    summary,
    pagination: { page, pageCount, pageSize },
  })
})

app.post('/api/admin/contact-messages/:id/replies', requireAdmin, sameOrigin, (req, res) => {
  const id = req.params.id
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!/^[\w-]{1,100}$/.test(id)) {
    res.status(400).json({ message: 'Pesan tidak valid.' })
    return
  }
  if (!body || body.length > 3000) {
    res.status(400).json({ message: 'Balasan harus berisi 1–3.000 karakter.' })
    return
  }
  const trackingCode = randomBytes(32).toString('base64url')
  const result = createContactMessageReply(id, body, hashToken(trackingCode))
  if (result === null) {
    res.status(404).json({ message: 'Pesan tidak ditemukan.' })
    return
  }
  if (result.channelMismatch) {
    res.status(409).json({ message: 'Pengirim memilih balasan email. Pengiriman otomatis belum aktif.' })
    return
  }
  res.status(201).json({
    reply: result.reply,
    ...(result.trackingTokenCreated ? { trackingCode } : {}),
  })
})

app.patch('/api/admin/contact-messages/:id', requireAdmin, sameOrigin, (req, res) => {
  const id = req.params.id
  const status = req.body?.status
  if (!/^[\w-]{1,100}$/.test(id) || !['unread', 'read'].includes(status)) {
    res.status(400).json({ message: 'Status pesan tidak valid.' })
    return
  }
  if (!setContactMessageStatus(id, status)) {
    res.status(404).json({ message: 'Pesan tidak ditemukan.' })
    return
  }
  res.json({ ok: true, summary: getContactMessageSummary() })
})

app.delete('/api/admin/contact-messages/:id', requireAdmin, sameOrigin, (req, res) => {
  const id = req.params.id
  if (!/^[\w-]{1,100}$/.test(id) || !deleteContactMessage(id)) {
    res.status(404).json({ message: 'Pesan tidak ditemukan.' })
    return
  }
  res.json({ ok: true, summary: getContactMessageSummary() })
})

app.get('/api/ppdb/settings', (_req, res) => {
  res.json(getPpdbSettings())
})

app.post('/api/ppdb/applications', ppdbSubmissionLimiter, sameOrigin, (req, res) => {
  const settings = getPpdbSettings()
  if (!settings.isOpen || !settings.academicYear) {
    res.status(403).json({ message: 'Pendaftaran online sedang ditutup.' })
    return
  }

  try {
    const application = validatePpdbApplication(req.body)
    if (!db.prepare('SELECT 1 FROM programs WHERE id = ? AND level = \'smk\'').get(application.programId)) {
      res.status(400).json({ message: 'Program keahlian yang dipilih tidak tersedia.' })
      return
    }
    const trackingCode = randomBytes(8).toString('hex').toUpperCase()
    const saved = createPpdbApplication(application, settings.academicYear, hashToken(trackingCode))
    res.status(201).json({ ...saved, trackingCode })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.post('/api/ppdb/status', ppdbStatusLimiter, sameOrigin, (req, res) => {
  const applicationNumber =
    typeof req.body?.applicationNumber === 'string' ? req.body.applicationNumber.trim().toUpperCase() : ''
  const trackingCode = typeof req.body?.trackingCode === 'string' ? req.body.trackingCode.trim().toUpperCase() : ''
  if (!/^BPPI-\d{4}-[A-F0-9]{8}$/.test(applicationNumber) || !/^[A-F0-9]{16}$/.test(trackingCode)) {
    res.status(404).json({ message: 'Nomor pendaftaran atau kode pelacakan tidak cocok.' })
    return
  }

  const application = findPpdbApplicationForTracking(applicationNumber, hashToken(trackingCode))
  if (!application) {
    res.status(404).json({ message: 'Nomor pendaftaran atau kode pelacakan tidak cocok.' })
    return
  }
  res.json(application)
})

app.get('/api/auth/session', (req, res) => {
  deleteExpiredSessions()
  const token = readSessionToken(req)
  const admin = token && /^[A-Za-z0-9_-]{40,60}$/.test(token) ? findSession(hashToken(token)) : null
  res.json({
    authenticated: Boolean(admin),
    ...(admin ? { username: admin.username, role: admin.role } : {}),
    setupRequired: !hasAdminAccounts(),
  })
})

app.post('/api/auth/login', loginLimiter, sameOrigin, async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!username || !password || password.length > 128) {
    res.status(400).json({ message: 'Isi username dan kata sandi.' })
    return
  }
  if (!hasAdminAccounts()) {
    res
      .status(503)
      .json({ message: 'Akun admin belum dibuat. Jalankan npm run admin:create di server.' })
    return
  }

  const admin = findAdminByUsername(username)
  const validPassword = admin
    ? await verifyPassword(password, admin.password_salt, admin.password_hash)
    : false
  if (!admin || !validPassword) {
    res.status(401).json({ message: 'Username atau kata sandi salah.' })
    return
  }

  const previousToken = readSessionToken(req)
  if (previousToken && /^[A-Za-z0-9_-]{40,60}$/.test(previousToken))
    deleteSession(hashToken(previousToken))
  const token = randomBytes(32).toString('base64url')
  const expiresAt = Date.now() + sessionLifetimeMs
  createSession(admin.id, hashToken(token), expiresAt)
  writeSessionCookie(res, token, Math.floor(sessionLifetimeMs / 1000))
  res.json({ authenticated: true, username: admin.username, role: admin.role })
})

app.post('/api/auth/logout', sameOrigin, (req, res) => {
  const token = readSessionToken(req)
  if (token && /^[A-Za-z0-9_-]{40,60}$/.test(token)) deleteSession(hashToken(token))
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/admins', requireAdmin, requireOwner, (_req, res) => {
  res.json({ admins: listAdmins() })
})

app.post('/api/admin/admins', requireAdmin, requireOwner, sameOrigin, async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    res.status(400).json({
      message:
        'Username harus 3–40 karakter dan hanya berisi huruf, angka, titik, garis bawah, atau tanda hubung.',
    })
    return
  }

  try {
    const { salt, hash } = await hashPassword(password)
    const id = createAdmin(username, salt, hash)
    res.status(201).json({ id, admins: listAdmins() })
  } catch (error) {
    if (error?.errcode === 2067 || error?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ message: 'Username tersebut sudah digunakan.' })
      return
    }
    if (error instanceof Error && !error.message.includes('SQLITE_CONSTRAINT')) {
      res.status(400).json({ message: error.message })
      return
    }
    console.error('Admin account creation failed:', error)
    res.status(500).json({ message: 'Akun admin belum dapat dibuat. Coba lagi.' })
  }
})

app.get('/api/admin/content', requireAdmin, (_req, res) => {
  res.json({
    content: readSiteContent({ includeDrafts: true }),
    updatedAt: getContentUpdatedAt(),
    revision: contentRevision(),
  })
})

app.get('/api/admin/ppdb', requireAdmin, (_req, res) => {
  res.json({
    settings: getPpdbSettings(),
    applications: listPpdbApplications(),
    archivedApplications: listArchivedPpdbApplications(),
    periods: listPpdbPeriods(),
  })
})

app.put('/api/admin/ppdb/settings', requireAdmin, sameOrigin, (req, res) => {
  try {
    const settings = validatePpdbSettings(req.body)
    res.json({ settings: savePpdbSettings(settings), periods: listPpdbPeriods() })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.post('/api/admin/ppdb/end', requireAdmin, sameOrigin, (req, res) => {
  const settings = endPpdbPeriod()
  if (!settings) {
    res.status(409).json({ message: 'Tidak ada periode PPDB yang sedang dibuka.' })
    return
  }
  res.json({ settings, periods: listPpdbPeriods() })
})

app.patch('/api/admin/ppdb/applications/:applicationNumber', requireAdmin, sameOrigin, (req, res) => {
  try {
    const applicationNumber = req.params.applicationNumber.toUpperCase()
    if (!/^BPPI-\d{4}-[A-F0-9]{8}$/.test(applicationNumber)) {
      res.status(404).json({ message: 'Pendaftar tidak ditemukan.' })
      return
    }
    const update = validatePpdbApplicationUpdate(req.body)
    if (!updatePpdbApplication(applicationNumber, update)) {
      res.status(404).json({ message: 'Pendaftar tidak ditemukan.' })
      return
    }
    res.json({ ok: true })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.post('/api/admin/ppdb/applications/:applicationNumber/archive', requireAdmin, sameOrigin, (req, res) => {
  const applicationNumber = req.params.applicationNumber.toUpperCase()
  const archivedAt = /^BPPI-\d{4}-[A-F0-9]{8}$/.test(applicationNumber)
    ? archivePpdbApplication(applicationNumber)
    : null
  if (!archivedAt) {
    res.status(404).json({ message: 'Pendaftar tidak ditemukan.' })
    return
  }
  res.json({ ok: true, archivedAt })
})

app.post('/api/admin/ppdb/applications/:applicationNumber/restore', requireAdmin, sameOrigin, (req, res) => {
  const applicationNumber = req.params.applicationNumber.toUpperCase()
  if (!/^BPPI-\d{4}-[A-F0-9]{8}$/.test(applicationNumber) || !restorePpdbApplication(applicationNumber)) {
    res.status(404).json({ message: 'Data arsip tidak ditemukan.' })
    return
  }
  res.json({ ok: true })
})

// Keep old admin clients safe: their former delete action now archives the record.
app.delete('/api/admin/ppdb/applications/:applicationNumber', requireAdmin, sameOrigin, (req, res) => {
  const applicationNumber = req.params.applicationNumber.toUpperCase()
  const archivedAt = /^BPPI-\d{4}-[A-F0-9]{8}$/.test(applicationNumber)
    ? archivePpdbApplication(applicationNumber)
    : null
  if (!archivedAt) {
    res.status(404).json({ message: 'Pendaftar tidak ditemukan.' })
    return
  }
  res.json({ ok: true, archivedAt })
})

app.post('/api/admin/programs', requireAdmin, sameOrigin, (req, res) => {
  try {
    const program = validateProgram(req.body)
    const id = saveProgram(program)
    res.status(201).json({ id, content: readSiteContent({ includeDrafts: true }) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.put('/api/admin/programs/:id', requireAdmin, sameOrigin, (req, res) => {
  try {
    const program = validateProgram(req.body)
    const id = req.params.id
    if (!/^[\w-]{1,100}$/.test(id) || !db.prepare('SELECT 1 FROM programs WHERE id = ?').get(id)) {
      res.status(404).json({ message: 'Bidang pembelajaran tidak ditemukan.' })
      return
    }
    saveProgram(program, id)
    res.json({ content: readSiteContent({ includeDrafts: true }) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.delete('/api/admin/programs/:id', requireAdmin, sameOrigin, (req, res) => {
  try {
    if (!removeProgram(req.params.id)) {
      res.status(404).json({ message: 'Bidang pembelajaran tidak ditemukan.' })
      return
    }
    res.json({ content: readSiteContent({ includeDrafts: true }) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.patch('/api/admin/programs/verified', requireAdmin, sameOrigin, (req, res) => {
  if (typeof req.body?.verified !== 'boolean') {
    res.status(400).json({ message: 'Status verifikasi tidak valid.' })
    return
  }
  setProgramsVerified(req.body.verified)
  res.json({ content: readSiteContent({ includeDrafts: true }) })
})

app.post('/api/admin/announcements', requireAdmin, sameOrigin, (req, res) => {
  try {
    const announcement = validateAnnouncement(req.body)
    const id = saveAnnouncement(announcement)
    res.status(201).json({ id, content: readSiteContent({ includeDrafts: true }) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.put('/api/admin/announcements/:id', requireAdmin, sameOrigin, (req, res) => {
  try {
    const announcement = validateAnnouncement(req.body)
    const id = req.params.id
    if (
      !/^[\w-]{1,100}$/.test(id) ||
      !db.prepare('SELECT 1 FROM announcements WHERE id = ?').get(id)
    ) {
      res.status(404).json({ message: 'Informasi tidak ditemukan.' })
      return
    }
    saveAnnouncement(announcement, id)
    res.json({ content: readSiteContent({ includeDrafts: true }) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.delete('/api/admin/announcements/:id', requireAdmin, sameOrigin, (req, res) => {
  try {
    if (!removeAnnouncement(req.params.id)) {
      res.status(404).json({ message: 'Informasi tidak ditemukan.' })
      return
    }
    res.json({ content: readSiteContent({ includeDrafts: true }) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

app.post('/api/admin/legacy-import', requireAdmin, sameOrigin, (req, res) => {
  try {
    const content = validateSiteContent(req.body)
    if (!addLegacyContentIfUnchanged(content)) {
      res.status(409).json({
        message:
          'Database sudah memiliki perubahan. Backup browser belum diimpor agar data server tidak tertimpa.',
      })
      return
    }
    res.json({
      content: readSiteContent({ includeDrafts: true }),
      updatedAt: getContentUpdatedAt(),
      revision: contentRevision(),
    })
  } catch (error) {
    handleDatabaseError(error, res)
  }
})

if (isProduction) {
  app.use(express.static(distDirectory, { index: false, maxAge: '1h' }))
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res, next) => {
    res.sendFile(resolve(distDirectory, 'index.html'), (error) => {
      if (error) next(error)
    })
  })
}

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Format JSON tidak valid.' })
    return
  }
  console.error('Unhandled server error:', error)
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' })
})

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? (isProduction ? '0.0.0.0' : '127.0.0.1')
const server = app.listen(port, host, () => {
  console.log(`School profile API listening on http://${host}:${port}`)
})

function shutdown() {
  server.close(() => {
    db.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
