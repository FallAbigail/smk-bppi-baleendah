import './load-env.mjs'
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const databasePath = resolve(
  process.env.DATABASE_PATH ?? resolve(projectRoot, 'data/site-content.sqlite'),
)
mkdirSync(dirname(databasePath), { recursive: true })

export const db = new DatabaseSync(databasePath)
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL COLLATE NOCASE UNIQUE,
    description TEXT NOT NULL,
    -- Kept for existing databases; the app now presents this list as highlights.
    subjects_json TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'sma' CHECK(level IN ('sma', 'smk')),
    icon TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('berita', 'pengumuman', 'penerimaan')),
    date TEXT NOT NULL,
    published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('alumni', 'student', 'parent')),
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_announcements_public_date ON announcements(published, date DESC);
  CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
`)

const programColumns = new Set(
  db
    .prepare('PRAGMA table_info(programs)')
    .all()
    .map((column) => column.name),
)
if (!programColumns.has('level')) {
  db.exec(
    "ALTER TABLE programs ADD COLUMN level TEXT NOT NULL DEFAULT 'sma' CHECK(level IN ('sma', 'smk'))",
  )
}

function runTransaction(operation) {
  db.exec('BEGIN IMMEDIATE')
  try {
    const result = operation()
    db.exec('COMMIT')
    return result
  } catch (error) {
    try {
      db.exec('ROLLBACK')
    } catch {
      /* The transaction may already have rolled back. */
    }
    throw error
  }
}

const defaultContent = JSON.parse(
  readFileSync(resolve(projectRoot, 'src/data/site-content.json'), 'utf8'),
)
const getMeta = db.prepare('SELECT value FROM app_meta WHERE key = ?')
const setMeta = db.prepare(
  'INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
)

if (!getMeta.get('seeded')) {
  runTransaction(() => {
    const insertProgram = db.prepare(`
      INSERT OR IGNORE INTO programs
        (id, title, description, subjects_json, level, icon, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    defaultContent.programs.forEach((program, index) => {
      insertProgram.run(
        program.id,
        program.title,
        program.description,
        JSON.stringify(program.highlights),
        program.level,
        program.icon,
        index,
        now,
        now,
      )
    })
    setMeta.run('programs_verified', String(defaultContent.programsVerified))
    setMeta.run('content_revision', '0')
    setMeta.run('content_updated_at', now)
    setMeta.run('seeded', '1')
  })
}

const programModelVersion = 'sma-smk-v2'
if (getMeta.get('program_model_version')?.value !== programModelVersion) {
  runTransaction(() => {
    const revision = Number(getMeta.get('content_revision')?.value ?? '0')
    const programsVerified = getMeta.get('programs_verified')?.value === 'true'
    const legacySamples = new Map([
      ['program-adiwiyata', 'Adiwiyata'],
      ['program-bahasa', 'Bahasa & Sastra'],
      ['program-ips', 'IPS'],
      ['program-mipa', 'MIPA'],
      ['program-seni', 'Seni & Budaya'],
      ['program-teknologi', 'Teknologi & Informatika'],
    ])
    const currentSamples = new Map(
      defaultContent.programs.map((program) => [program.id, program.title]),
    )
    const existingSamples = db
      .prepare(
        'SELECT id, title, description, subjects_json, level, icon FROM programs ORDER BY id',
      )
      .all()
    const hasSampleTitles = (samples) =>
      existingSamples.length === samples.size &&
      existingSamples.every((program) => samples.get(program.id) === program.title)
    const isKnownSample = hasSampleTitles(legacySamples) || hasSampleTitles(currentSamples)
    const matchesCurrentDefault =
      existingSamples.length === defaultContent.programs.length &&
      existingSamples.every((program) => {
        const sample = defaultContent.programs.find((item) => item.id === program.id)
        return (
          sample &&
          program.title === sample.title &&
          program.description === sample.description &&
          program.level === sample.level &&
          program.icon === sample.icon &&
          JSON.stringify(JSON.parse(program.subjects_json)) === JSON.stringify(sample.highlights)
        )
      })

    if (revision === 0 && !programsVerified && isKnownSample && !matchesCurrentDefault) {
      db.exec('DELETE FROM programs')
      const insertProgram = db.prepare(`
        INSERT INTO programs
          (id, title, description, subjects_json, level, icon, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      const now = new Date().toISOString()
      defaultContent.programs.forEach((program, index) => {
        insertProgram.run(
          program.id,
          program.title,
          program.description,
          JSON.stringify(program.highlights),
          program.level,
          program.icon,
          index,
          now,
          now,
        )
      })
      setMeta.run('programs_verified', 'false')
      setMeta.run('content_updated_at', now)
    }

    setMeta.run('program_model_version', programModelVersion)
  })
}

const programCopyCleanupVersion = 'program-copy-v1'
if (getMeta.get('program_copy_cleanup_version')?.value !== programCopyCleanupVersion) {
  runTransaction(() => {
    const programsVerified = getMeta.get('programs_verified')?.value === 'true'
    const descriptions = [
      {
        id: 'program-smk-pplg',
        previous: 'Contoh jurusan untuk belajar membuat aplikasi, mengelola data, dan mengembangkan gim.',
        next: 'Mempelajari pembuatan aplikasi, pengelolaan data, dan pengembangan gim.',
      },
      {
        id: 'program-smk-dkv',
        previous: 'Contoh jurusan yang menggabungkan keterampilan desain, ilustrasi, dan produksi media.',
        next: 'Menggabungkan keterampilan desain, ilustrasi, dan produksi media.',
      },
      {
        id: 'program-smk-akl',
        previous: 'Contoh jurusan untuk mengenal pencatatan keuangan, perpajakan, dan administrasi.',
        next: 'Mempelajari pencatatan keuangan, perpajakan, dan administrasi.',
      },
    ]
    const now = new Date().toISOString()
    let changed = 0

    if (!programsVerified) {
      const updateDescription = db.prepare(
        'UPDATE programs SET description = ?, updated_at = ? WHERE id = ? AND description = ?',
      )
      for (const item of descriptions) {
        changed += updateDescription.run(item.next, now, item.id, item.previous).changes
      }
    }

    if (changed > 0) {
      const revision = Number(getMeta.get('content_revision')?.value ?? '0') + 1
      setMeta.run('content_revision', String(revision))
      setMeta.run('content_updated_at', now)
    }
    setMeta.run('program_copy_cleanup_version', programCopyCleanupVersion)
  })
}

const bppiSchoolProfileVersion = 'bppi-smk-v1'
if (getMeta.get('school_profile_version')?.value !== bppiSchoolProfileVersion) {
  runTransaction(() => {
    const existingPrograms = db.prepare('SELECT id, title, level FROM programs ORDER BY id').all()
    const previousDemoPrograms = new Map([
      ['program-sma-umum', 'Mata Pelajaran Umum'],
      ['program-sma-pilihan', 'Mata Pelajaran Pilihan'],
      ['program-smk-pplg', 'Pengembangan Perangkat Lunak dan Gim (PPLG)'],
      ['program-smk-dkv', 'Desain Komunikasi Visual (DKV)'],
      ['program-smk-akl', 'Akuntansi dan Keuangan Lembaga (AKL)'],
    ])
    const isPreviousDemo =
      existingPrograms.length === previousDemoPrograms.size &&
      existingPrograms.every((program) => previousDemoPrograms.get(program.id) === program.title)
    const now = new Date().toISOString()
    let changed = 0

    if (isPreviousDemo) {
      db.exec('DELETE FROM programs')
      const insertProgram = db.prepare(`
        INSERT INTO programs
          (id, title, description, subjects_json, level, icon, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      defaultContent.programs.forEach((program, index) => {
        insertProgram.run(
          program.id,
          program.title,
          program.description,
          JSON.stringify(program.highlights),
          program.level,
          program.icon,
          index,
          now,
          now,
        )
      })
      setMeta.run('programs_verified', 'true')
      changed = 1
    } else {
      changed = db.prepare("DELETE FROM programs WHERE level = 'sma'").run().changes
      if (changed > 0) setMeta.run('programs_verified', 'false')
    }

    if (changed > 0) {
      const revision = Number(getMeta.get('content_revision')?.value ?? '0') + 1
      setMeta.run('content_revision', String(revision))
      setMeta.run('content_updated_at', now)
    }
    setMeta.run('school_profile_version', bppiSchoolProfileVersion)
  })
}

export function hasAdminAccounts() {
  return db.prepare('SELECT EXISTS(SELECT 1 FROM admins) AS present').get().present === 1
}

export function createAdmin(username, passwordSalt, passwordHash) {
  const id = `admin-${randomUUID()}`
  db.prepare(
    'INSERT INTO admins (id, username, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, username, passwordSalt, passwordHash, new Date().toISOString())
  return id
}

export function findAdminByUsername(username) {
  return db
    .prepare(
      'SELECT id, username, password_salt, password_hash FROM admins WHERE username = ? COLLATE NOCASE',
    )
    .get(username)
}

export function updateAdminPassword(username, passwordSalt, passwordHash) {
  return runTransaction(() => {
    const result = db
      .prepare(
        'UPDATE admins SET password_salt = ?, password_hash = ? WHERE username = ? COLLATE NOCASE',
      )
      .run(passwordSalt, passwordHash, username)
    if (result.changes) {
      const admin = findAdminByUsername(username)
      db.prepare('DELETE FROM sessions WHERE admin_id = ?').run(admin.id)
    }
    return result.changes === 1
  })
}

export function deleteExpiredSessions(now = Date.now()) {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now)
}

export function createSession(adminId, tokenHash, expiresAt) {
  db.prepare(
    'INSERT INTO sessions (token_hash, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
  ).run(tokenHash, adminId, Date.now(), expiresAt)
}

export function findSession(tokenHash, now = Date.now()) {
  return db
    .prepare(
      `
    SELECT sessions.admin_id AS id, admins.username
    FROM sessions JOIN admins ON admins.id = sessions.admin_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `,
    )
    .get(tokenHash, now)
}

export function deleteSession(tokenHash) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash)
}

function readPrograms() {
  return db
    .prepare(
      'SELECT id, level, title, description, subjects_json, icon FROM programs ORDER BY position, title COLLATE NOCASE',
    )
    .all()
    .map((program) => ({
      id: program.id,
      level: program.level,
      title: program.title,
      description: program.description,
      highlights: JSON.parse(program.subjects_json),
      icon: program.icon,
    }))
}

function readAnnouncements({ includeDrafts }) {
  const query = includeDrafts
    ? 'SELECT id, title, body, category, date, published FROM announcements ORDER BY date DESC, created_at DESC'
    : 'SELECT id, title, body, category, date, published FROM announcements WHERE published = 1 ORDER BY date DESC, created_at DESC'
  return db
    .prepare(query)
    .all()
    .map((item) => ({ ...item, published: item.published === 1 }))
}

export function readSiteContent({ includeDrafts = false } = {}) {
  return {
    programs: readPrograms(),
    announcements: readAnnouncements({ includeDrafts }),
    programsVerified: getMeta.get('programs_verified')?.value === 'true',
  }
}

function touchContent() {
  const revision = Number(getMeta.get('content_revision')?.value ?? '0') + 1
  setMeta.run('content_revision', String(revision))
  setMeta.run('content_updated_at', new Date().toISOString())
}

export function contentRevision() {
  return Number(getMeta.get('content_revision')?.value ?? '0')
}

export function saveProgram(program, id = `program-${randomUUID()}`) {
  return runTransaction(() => {
    const now = new Date().toISOString()
    const existing = db.prepare('SELECT position, created_at FROM programs WHERE id = ?').get(id)
    const position =
      existing?.position ??
      Number(db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM programs').get().next)
    db.prepare(
      `
      INSERT INTO programs (id, title, description, subjects_json, level, icon, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        subjects_json = excluded.subjects_json,
        level = excluded.level,
        icon = excluded.icon,
        updated_at = excluded.updated_at
    `,
    ).run(
      id,
      program.title,
      program.description,
      JSON.stringify(program.highlights),
      program.level,
      program.icon,
      position,
      existing?.created_at ?? now,
      now,
    )
    setMeta.run('programs_verified', 'false')
    touchContent()
    return id
  })
}

export function removeProgram(id) {
  return runTransaction(() => {
    const result = db.prepare('DELETE FROM programs WHERE id = ?').run(id)
    if (!result.changes) return false
    setMeta.run('programs_verified', 'false')
    touchContent()
    return true
  })
}

export function setProgramsVerified(verified) {
  runTransaction(() => {
    setMeta.run('programs_verified', String(verified))
    touchContent()
  })
}

export function saveAnnouncement(announcement, id = `info-${randomUUID()}`) {
  return runTransaction(() => {
    const now = new Date().toISOString()
    const existing = db.prepare('SELECT created_at FROM announcements WHERE id = ?').get(id)
    db.prepare(
      `
      INSERT INTO announcements (id, title, body, category, date, published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        body = excluded.body,
        category = excluded.category,
        date = excluded.date,
        published = excluded.published,
        updated_at = excluded.updated_at
    `,
    ).run(
      id,
      announcement.title,
      announcement.body,
      announcement.category,
      announcement.date,
      Number(announcement.published),
      existing?.created_at ?? now,
      now,
    )
    touchContent()
    return id
  })
}

export function removeAnnouncement(id) {
  return runTransaction(() => {
    const result = db.prepare('DELETE FROM announcements WHERE id = ?').run(id)
    if (result.changes) touchContent()
    return result.changes > 0
  })
}

export function replaceSiteContent(content) {
  return runTransaction(() => {
    db.exec('DELETE FROM programs; DELETE FROM announcements;')
    const insertProgram = db.prepare(`
      INSERT INTO programs (id, title, description, subjects_json, level, icon, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (id, title, body, category, date, published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    content.programs.forEach((program, index) => {
      insertProgram.run(
        program.id,
        program.title,
        program.description,
        JSON.stringify(program.highlights),
        program.level,
        program.icon,
        index,
        now,
        now,
      )
    })
    for (const item of content.announcements) {
      insertAnnouncement.run(
        item.id,
        item.title,
        item.body,
        item.category,
        item.date,
        Number(item.published),
        now,
        now,
      )
    }
    setMeta.run('programs_verified', String(content.programsVerified))
    touchContent()
  })
}

export function addLegacyContentIfUnchanged(content) {
  if (contentRevision() !== 0) return false
  replaceSiteContent(content)
  return true
}

export function getContentUpdatedAt() {
  return getMeta.get('content_updated_at')?.value ?? null
}

export function listReviews(limit = 1, offset = 0, rating = null) {
  const safeLimit = Math.max(1, Math.min(12, Math.floor(Number(limit) || 6)))
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
  const query = rating === null
    ? `SELECT id, name, role, rating, comment, created_at AS createdAt
       FROM reviews ORDER BY created_at DESC LIMIT ? OFFSET ?`
    : `SELECT id, name, role, rating, comment, created_at AS createdAt
       FROM reviews WHERE rating = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
  const statement = db.prepare(query)
  return rating === null
    ? statement.all(safeLimit, safeOffset)
    : statement.all(rating, safeLimit, safeOffset)
}

export function getReviewSummary(rating = null) {
  const query = rating === null
    ? 'SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews'
    : 'SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE rating = ?'
  const statement = db.prepare(query)
  const summary = rating === null ? statement.get() : statement.get(rating)
  return { count: summary.count, average: Number(summary.average) }
}

export function createReview(review) {
  const id = `review-${randomUUID()}`
  const createdAt = new Date().toISOString()
  db.prepare(
    'INSERT INTO reviews (id, name, role, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, review.name, review.role, review.rating, review.comment, createdAt)
  return { id, ...review, createdAt }
}
