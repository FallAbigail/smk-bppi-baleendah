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
    role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('owner', 'admin')),
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

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL,
    topic TEXT NOT NULL CHECK(topic IN ('ppdb', 'program', 'partnership', 'other')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK(status IN ('unread', 'read')),
    reply_token_hash TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_message_replies (
    id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ppdb_applications (
    id TEXT PRIMARY KEY,
    application_number TEXT NOT NULL UNIQUE,
    tracking_hash TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    student_name TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('Laki-laki', 'Perempuan')),
    address TEXT NOT NULL,
    student_phone TEXT NOT NULL DEFAULT '',
    student_email TEXT NOT NULL DEFAULT '',
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    previous_school TEXT NOT NULL,
    graduation_year INTEGER,
    program_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'baru' CHECK(status IN ('baru', 'ditinjau', 'perlu_konfirmasi', 'menunggu_pembayaran', 'pembayaran_dikonfirmasi', 'diterima', 'tidak_diterima')),
    public_message TEXT NOT NULL DEFAULT '',
    internal_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ppdb_periods (
    academic_year TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK(status IN ('open', 'closed')),
    public_message TEXT NOT NULL DEFAULT '',
    started_at TEXT,
    ended_at TEXT
  );

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_announcements_public_date ON announcements(published, date DESC);
  CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created_at ON contact_messages(status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_contact_message_replies_message_created ON contact_message_replies(message_id, created_at ASC);
  CREATE INDEX IF NOT EXISTS idx_ppdb_applications_created ON ppdb_applications(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_ppdb_applications_status ON ppdb_applications(status, created_at DESC);
`)

const contactMessageColumns = new Set(
  db
    .prepare('PRAGMA table_info(contact_messages)')
    .all()
    .map((column) => column.name),
)
if (!contactMessageColumns.has('reply_token_hash')) {
  db.exec('ALTER TABLE contact_messages ADD COLUMN reply_token_hash TEXT')
}
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_messages_reply_token_hash
  ON contact_messages(reply_token_hash)
  WHERE reply_token_hash IS NOT NULL
`)

const adminColumns = new Set(
  db
    .prepare('PRAGMA table_info(admins)')
    .all()
    .map((column) => column.name),
)
if (!adminColumns.has('role')) {
  db.exec(
    "ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin' CHECK(role IN ('owner', 'admin'))",
  )
}
if (!db.prepare("SELECT 1 FROM admins WHERE role = 'owner' LIMIT 1").get()) {
  db.prepare(`
    UPDATE admins SET role = 'owner'
    WHERE id = (SELECT id FROM admins ORDER BY created_at ASC, id ASC LIMIT 1)
  `).run()
}

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
if (!programColumns.has('logo')) {
  db.exec("ALTER TABLE programs ADD COLUMN logo TEXT NOT NULL DEFAULT ''")
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

const ppdbSchema = db
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'ppdb_applications'")
  .get()?.sql ?? ''
if (!ppdbSchema.includes("'menunggu_pembayaran'") || !ppdbSchema.includes("'pembayaran_dikonfirmasi'")) {
  runTransaction(() => {
    db.exec(`
      CREATE TABLE ppdb_applications_next (
        id TEXT PRIMARY KEY,
        application_number TEXT NOT NULL UNIQUE,
        tracking_hash TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        student_name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        gender TEXT NOT NULL CHECK(gender IN ('Laki-laki', 'Perempuan')),
        address TEXT NOT NULL,
        student_phone TEXT NOT NULL DEFAULT '',
        student_email TEXT NOT NULL DEFAULT '',
        guardian_name TEXT NOT NULL,
        guardian_phone TEXT NOT NULL,
        previous_school TEXT NOT NULL,
        graduation_year INTEGER,
        program_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'baru' CHECK(status IN ('baru', 'ditinjau', 'perlu_konfirmasi', 'menunggu_pembayaran', 'pembayaran_dikonfirmasi', 'diterima', 'tidak_diterima')),
        public_message TEXT NOT NULL DEFAULT '',
        internal_note TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      INSERT INTO ppdb_applications_next SELECT * FROM ppdb_applications;
      DROP TABLE ppdb_applications;
      ALTER TABLE ppdb_applications_next RENAME TO ppdb_applications;
      CREATE INDEX idx_ppdb_applications_created ON ppdb_applications(created_at DESC);
      CREATE INDEX idx_ppdb_applications_status ON ppdb_applications(status, created_at DESC);
    `)
  })
}

const ppdbColumns = new Set(
  db
    .prepare('PRAGMA table_info(ppdb_applications)')
    .all()
    .map((column) => column.name),
)
if (!ppdbColumns.has('archived_at')) {
  db.exec('ALTER TABLE ppdb_applications ADD COLUMN archived_at TEXT')
}
db.exec('CREATE INDEX IF NOT EXISTS idx_ppdb_applications_archived_created ON ppdb_applications(archived_at, created_at DESC)')
db.exec('CREATE INDEX IF NOT EXISTS idx_ppdb_applications_year_archive ON ppdb_applications(academic_year, archived_at)')

const defaultContent = JSON.parse(
  readFileSync(resolve(projectRoot, 'src/data/site-content.json'), 'utf8'),
)
const getMeta = db.prepare('SELECT value FROM app_meta WHERE key = ?')
const setMeta = db.prepare(
  'INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
)

db.prepare(`
  INSERT OR IGNORE INTO ppdb_periods (academic_year, status)
  SELECT DISTINCT academic_year, 'closed'
  FROM ppdb_applications
  WHERE academic_year <> ''
`).run()

const savedPpdbYear = getMeta.get('ppdb_academic_year')?.value ?? ''
if (savedPpdbYear) {
  const isPpdbOpen = getMeta.get('ppdb_is_open')?.value === 'true'
  db.prepare(`
    INSERT INTO ppdb_periods (academic_year, status, public_message)
    VALUES (?, ?, ?)
    ON CONFLICT(academic_year) DO UPDATE SET
      status = excluded.status,
      public_message = excluded.public_message,
      ended_at = CASE WHEN excluded.status = 'open' THEN NULL ELSE ppdb_periods.ended_at END
  `).run(savedPpdbYear, isPpdbOpen ? 'open' : 'closed', getMeta.get('ppdb_public_message')?.value ?? '')
  if (isPpdbOpen) {
    db.prepare("UPDATE ppdb_periods SET status = 'closed' WHERE academic_year <> ? AND status = 'open'").run(savedPpdbYear)
  }
}

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
  return runTransaction(() => {
    const id = `admin-${randomUUID()}`
    const existingOwner = db.prepare("SELECT 1 FROM admins WHERE role = 'owner' LIMIT 1").get()
    const assignedRole = existingOwner || hasAdminAccounts() ? 'admin' : 'owner'
    db.prepare(
      'INSERT INTO admins (id, username, password_salt, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(id, username, passwordSalt, passwordHash, assignedRole, new Date().toISOString())
    return id
  })
}

export function findAdminByUsername(username) {
  return db
    .prepare(
      'SELECT id, username, password_salt, password_hash, role FROM admins WHERE username = ? COLLATE NOCASE',
    )
    .get(username)
}

export function listAdmins() {
  return db
    .prepare(`
      SELECT id, username, role, created_at AS createdAt
      FROM admins
      ORDER BY (role = 'owner') DESC, created_at ASC
    `)
    .all()
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

export function updateAdminCredentials(currentUsername, nextUsername, passwordSalt, passwordHash) {
  return runTransaction(() => {
    const result = db
      .prepare(
        'UPDATE admins SET username = ?, password_salt = ?, password_hash = ? WHERE username = ? COLLATE NOCASE',
      )
      .run(nextUsername, passwordSalt, passwordHash, currentUsername)
    if (result.changes) {
      const admin = findAdminByUsername(nextUsername)
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
    SELECT sessions.admin_id AS id, admins.username, admins.role
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
      'SELECT id, level, title, description, subjects_json, icon, logo FROM programs ORDER BY position, title COLLATE NOCASE',
    )
    .all()
    .map((program) => ({
      id: program.id,
      level: program.level,
      title: program.title,
      description: program.description,
      highlights: JSON.parse(program.subjects_json),
      icon: program.icon,
      logo: program.logo,
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
      INSERT INTO programs (id, title, description, subjects_json, level, icon, logo, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        description = excluded.description,
        subjects_json = excluded.subjects_json,
        level = excluded.level,
        icon = excluded.icon,
        logo = excluded.logo,
        updated_at = excluded.updated_at
    `,
    ).run(
      id,
      program.title,
      program.description,
      JSON.stringify(program.highlights),
      program.level,
      program.icon,
      program.logo ?? '',
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
      INSERT INTO programs (id, title, description, subjects_json, level, icon, logo, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        program.logo ?? '',
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
  if (rating === 'low') {
    return db
      .prepare(`SELECT id, name, role, rating, comment, created_at AS createdAt
                FROM reviews WHERE rating <= 2 ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(safeLimit, safeOffset)
  }
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
  if (rating === 'low') {
    const summary = db
      .prepare('SELECT COUNT(*) AS count, COALESCE(AVG(rating), 0) AS average FROM reviews WHERE rating <= 2')
      .get()
    return { count: summary.count, average: Number(summary.average) }
  }
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

export function deleteReview(id) {
  return db.prepare('DELETE FROM reviews WHERE id = ?').run(id).changes > 0
}

export function createContactMessage(contactMessage, replyTokenHash) {
  const id = `contact-${randomUUID()}`
  const createdAt = new Date().toISOString()
  db.prepare(`
    INSERT INTO contact_messages (id, name, phone, email, topic, message, status, reply_token_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'unread', ?, ?)
  `).run(
    id,
    contactMessage.name,
    contactMessage.phone,
    contactMessage.email,
    contactMessage.topic,
    contactMessage.message,
    replyTokenHash,
    createdAt,
  )
  return { id, ...contactMessage, status: 'unread', createdAt }
}

function listRepliesForContactMessage(messageId) {
  return db.prepare(`
    SELECT id, body, created_at AS createdAt
    FROM contact_message_replies
    WHERE message_id = ?
    ORDER BY created_at ASC, id ASC
  `).all(messageId)
}

export function listContactMessages(limit = 12, offset = 0) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 12)))
  const safeOffset = Math.max(0, Math.floor(Number(offset) || 0))
  const messages = db.prepare(`
    SELECT id, name, phone, email, topic, message, status,
      CASE WHEN reply_token_hash IS NULL THEN 0 ELSE 1 END AS hasPrivateThread,
      created_at AS createdAt
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(safeLimit, safeOffset)
  return messages.map((message) => ({
    ...message,
    hasPrivateThread: Boolean(message.hasPrivateThread),
    replies: listRepliesForContactMessage(message.id),
  }))
}

export function findContactConversation(replyTokenHash) {
  const message = db.prepare(`
    SELECT id, name, topic, message, created_at AS createdAt
    FROM contact_messages
    WHERE reply_token_hash = ?
  `).get(replyTokenHash)
  if (!message) return null
  const { id, ...publicMessage } = message
  return { message: publicMessage, replies: listRepliesForContactMessage(id) }
}

export function createContactMessageReply(messageId, body, replyTokenHash) {
  return runTransaction(() => {
    const message = db.prepare('SELECT reply_token_hash FROM contact_messages WHERE id = ?').get(messageId)
    if (!message) return null
    const trackingTokenCreated = !message.reply_token_hash
    if (trackingTokenCreated) {
      db.prepare('UPDATE contact_messages SET reply_token_hash = ? WHERE id = ?').run(replyTokenHash, messageId)
    }
    const reply = {
      id: `contact-reply-${randomUUID()}`,
      body,
      createdAt: new Date().toISOString(),
    }
    db.prepare(`
      INSERT INTO contact_message_replies (id, message_id, body, created_at)
      VALUES (?, ?, ?, ?)
    `).run(reply.id, messageId, reply.body, reply.createdAt)
    db.prepare("UPDATE contact_messages SET status = 'read' WHERE id = ?").run(messageId)
    return { reply, trackingTokenCreated }
  })
}

export function getContactMessageSummary() {
  const summary = db.prepare(`
    SELECT COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END), 0) AS unread
    FROM contact_messages
  `).get()
  return { total: summary.total, unread: summary.unread }
}

export function setContactMessageStatus(id, status) {
  return db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id).changes > 0
}

export function deleteContactMessage(id) {
  return db.prepare('DELETE FROM contact_messages WHERE id = ?').run(id).changes > 0
}

export function getPpdbSettings() {
  return {
    isOpen: getMeta.get('ppdb_is_open')?.value === 'true',
    academicYear: getMeta.get('ppdb_academic_year')?.value ?? '',
    publicMessage: getMeta.get('ppdb_public_message')?.value ?? '',
  }
}

export function savePpdbSettings(settings) {
  const now = new Date().toISOString()
  runTransaction(() => {
    setMeta.run('ppdb_is_open', String(settings.isOpen))
    setMeta.run('ppdb_academic_year', settings.academicYear)
    setMeta.run('ppdb_public_message', settings.publicMessage)

    if (settings.isOpen) {
      db.prepare(`
        UPDATE ppdb_periods
        SET status = 'closed', ended_at = COALESCE(ended_at, ?)
        WHERE status = 'open' AND academic_year <> ?
      `).run(now, settings.academicYear)
      db.prepare(`
        INSERT INTO ppdb_periods (academic_year, status, public_message, started_at, ended_at)
        VALUES (?, 'open', ?, ?, NULL)
        ON CONFLICT(academic_year) DO UPDATE SET
          status = 'open',
          public_message = excluded.public_message,
          started_at = COALESCE(ppdb_periods.started_at, excluded.started_at),
          ended_at = NULL
      `).run(settings.academicYear, settings.publicMessage, now)
    } else {
      db.prepare(`
        UPDATE ppdb_periods
        SET status = 'closed', ended_at = COALESCE(ended_at, ?)
        WHERE status = 'open'
      `).run(now)
    }
  })
  return getPpdbSettings()
}

export function endPpdbPeriod() {
  const settings = getPpdbSettings()
  if (!settings.isOpen || !settings.academicYear) return null

  const now = new Date().toISOString()
  runTransaction(() => {
    setMeta.run('ppdb_is_open', 'false')
    db.prepare(`
      UPDATE ppdb_periods
      SET status = 'closed', ended_at = ?
      WHERE academic_year = ? AND status = 'open'
    `).run(now, settings.academicYear)
  })
  return getPpdbSettings()
}

export function listPpdbPeriods() {
  return db.prepare(`
    SELECT
      periods.academic_year AS academicYear,
      periods.status,
      periods.started_at AS startedAt,
      periods.ended_at AS endedAt,
      COUNT(applications.id) AS applicationCount,
      COALESCE(SUM(CASE WHEN applications.archived_at IS NULL AND applications.id IS NOT NULL THEN 1 ELSE 0 END), 0) AS activeApplicationCount,
      COALESCE(SUM(CASE WHEN applications.archived_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS archivedApplicationCount
    FROM ppdb_periods AS periods
    LEFT JOIN ppdb_applications AS applications
      ON applications.academic_year = periods.academic_year
    GROUP BY periods.academic_year
    ORDER BY periods.academic_year DESC
  `).all()
}

export function createPpdbApplication(application, academicYear, trackingHash) {
  const id = `ppdb-${randomUUID()}`
  const createdAt = new Date().toISOString()
  const year = academicYear.slice(0, 4)
  let applicationNumber
  let attempts = 0
  do {
    applicationNumber = `BPPI-${year}-${randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`
    attempts += 1
  } while (
    attempts < 3 &&
    db.prepare('SELECT 1 FROM ppdb_applications WHERE application_number = ?').get(applicationNumber)
  )

  db.prepare(`
    INSERT INTO ppdb_applications (
      id, application_number, tracking_hash, academic_year, student_name, birth_date,
      gender, address, student_phone, student_email, guardian_name, guardian_phone,
      previous_school, graduation_year, program_id, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'baru', ?, ?)
  `).run(
    id,
    applicationNumber,
    trackingHash,
    academicYear,
    application.studentName,
    application.birthDate,
    application.gender,
    application.address,
    application.studentPhone,
    application.studentEmail,
    application.guardianName,
    application.guardianPhone,
    application.previousSchool,
    application.graduationYear,
    application.programId,
    createdAt,
    createdAt,
  )

  return { applicationNumber, createdAt }
}

export function findPpdbApplicationForTracking(applicationNumber, trackingHash) {
  return db.prepare(`
    SELECT
      applications.application_number AS applicationNumber,
      applications.academic_year AS academicYear,
      applications.status,
      applications.public_message AS publicMessage,
      applications.created_at AS createdAt,
      applications.updated_at AS updatedAt,
      programs.title AS programTitle
    FROM ppdb_applications AS applications
    LEFT JOIN programs ON programs.id = applications.program_id
    WHERE applications.application_number = ? AND applications.tracking_hash = ?
  `).get(applicationNumber, trackingHash)
}

function queryPpdbApplications(archived) {
  return db.prepare(`
    SELECT
      applications.application_number AS applicationNumber,
      applications.academic_year AS academicYear,
      applications.student_name AS studentName,
      applications.birth_date AS birthDate,
      applications.gender,
      applications.address,
      applications.student_phone AS studentPhone,
      applications.student_email AS studentEmail,
      applications.guardian_name AS guardianName,
      applications.guardian_phone AS guardianPhone,
      applications.previous_school AS previousSchool,
      applications.graduation_year AS graduationYear,
      applications.program_id AS programId,
      programs.title AS programTitle,
      applications.status,
      applications.public_message AS publicMessage,
      applications.internal_note AS internalNote,
      applications.created_at AS createdAt,
      applications.updated_at AS updatedAt,
      applications.archived_at AS archivedAt
    FROM ppdb_applications AS applications
    LEFT JOIN programs ON programs.id = applications.program_id
    WHERE applications.archived_at IS ${archived ? 'NOT ' : ''}NULL
    ORDER BY applications.created_at DESC
  `).all()
}

export function listPpdbApplications() {
  return queryPpdbApplications(false)
}

export function listArchivedPpdbApplications() {
  return queryPpdbApplications(true)
}

export function updatePpdbApplication(applicationNumber, update) {
  const result = db.prepare(`
    UPDATE ppdb_applications
    SET status = ?, public_message = ?, internal_note = ?, updated_at = ?
    WHERE application_number = ?
  `).run(update.status, update.publicMessage, update.internalNote, new Date().toISOString(), applicationNumber)
  return result.changes === 1
}

export function archivePpdbApplication(applicationNumber) {
  const archivedAt = new Date().toISOString()
  const result = db.prepare(`
    UPDATE ppdb_applications
    SET archived_at = ?
    WHERE application_number = ? AND archived_at IS NULL
  `).run(archivedAt, applicationNumber)
  return result.changes === 1 ? archivedAt : null
}

export function restorePpdbApplication(applicationNumber) {
  const result = db.prepare(`
    UPDATE ppdb_applications
    SET archived_at = NULL
    WHERE application_number = ? AND archived_at IS NOT NULL
  `).run(applicationNumber)
  return result.changes === 1
}
