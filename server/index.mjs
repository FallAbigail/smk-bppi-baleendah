import { createHash, randomBytes } from 'node:crypto'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import {
  addLegacyContentIfUnchanged,
  contentRevision,
  createReview,
  createPpdbApplication,
  createSession,
  deletePpdbApplication,
  db,
  deleteExpiredSessions,
  deleteSession,
  findAdminByUsername,
  findSession,
  getContentUpdatedAt,
  getReviewSummary,
  getPpdbSettings,
  findPpdbApplicationForTracking,
  hasAdminAccounts,
  listPpdbApplications,
  listReviews,
  readSiteContent,
  removeAnnouncement,
  removeProgram,
  replaceSiteContent,
  saveAnnouncement,
  saveProgram,
  savePpdbSettings,
  setProgramsVerified,
  updatePpdbApplication,
} from './database.mjs'
import { verifyPassword } from './passwords.mjs'
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
app.use('/api', express.json({ limit: '256kb', strict: true }))

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
  const developmentOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173'])
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

const reviewPageSize = 3

function reviewPagination(requestedPage, summary) {
  const pageCount = Math.ceil(summary.count / reviewPageSize)
  const parsedPage = Number.parseInt(String(requestedPage ?? '1'), 10) || 1
  const page = pageCount ? Math.max(1, Math.min(pageCount, parsedPage)) : 1
  return { page, pageCount, pageSize: reviewPageSize }
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
    ...(admin ? { username: admin.username } : {}),
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
  res.json({ authenticated: true, username: admin.username })
})

app.post('/api/auth/logout', sameOrigin, (req, res) => {
  const token = readSessionToken(req)
  if (token && /^[A-Za-z0-9_-]{40,60}$/.test(token)) deleteSession(hashToken(token))
  clearSessionCookie(res)
  res.json({ ok: true })
})

app.get('/api/admin/content', requireAdmin, (_req, res) => {
  res.json({
    content: readSiteContent({ includeDrafts: true }),
    updatedAt: getContentUpdatedAt(),
    revision: contentRevision(),
  })
})

app.get('/api/admin/ppdb', requireAdmin, (_req, res) => {
  res.json({ settings: getPpdbSettings(), applications: listPpdbApplications() })
})

app.put('/api/admin/ppdb/settings', requireAdmin, sameOrigin, (req, res) => {
  try {
    const settings = validatePpdbSettings(req.body)
    res.json({ settings: savePpdbSettings(settings) })
  } catch (error) {
    handleDatabaseError(error, res)
  }
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

app.delete('/api/admin/ppdb/applications/:applicationNumber', requireAdmin, sameOrigin, (req, res) => {
  const applicationNumber = req.params.applicationNumber.toUpperCase()
  if (!/^BPPI-\d{4}-[A-F0-9]{8}$/.test(applicationNumber) || !deletePpdbApplication(applicationNumber)) {
    res.status(404).json({ message: 'Pendaftar tidak ditemukan.' })
    return
  }
  res.json({ ok: true })
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
