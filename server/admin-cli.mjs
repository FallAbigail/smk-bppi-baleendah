import { createInterface } from 'node:readline/promises'
import { stderr, stdin, stdout } from 'node:process'
import {
  createAdmin,
  findAdminByUsername,
  updateAdminCredentials,
  updateAdminPassword,
} from './database.mjs'
import { hashPassword, validatePassword } from './passwords.mjs'

async function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error(
      'Jalankan perintah ini langsung di terminal interaktif agar kata sandi tidak tampil di layar.',
    )
  }

  stdout.write(prompt)
  stdin.setRawMode(true)
  stdin.resume()

  return new Promise((resolve, reject) => {
    let value = ''
    let finished = false
    const onData = (chunk) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') {
          finish(new Error('Pembuatan akun dibatalkan.'))
          return
        }
        if (character === '\r' || character === '\n') {
          finish(null)
          return
        }
        if (character === '\u007f' || character === '\b') {
          value = Array.from(value).slice(0, -1).join('')
          continue
        }
        if (character >= ' ') value += character
      }
    }

    function finish(error) {
      if (finished) return
      finished = true
      stdin.removeListener('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
      stdout.write('\n')
      if (error) reject(error)
      else resolve(value)
    }

    stdin.on('data', onData)
  })
}

function validateUsername(username) {
  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
    throw new Error(
      'Username harus 3–40 karakter dan hanya berisi huruf, angka, titik, garis bawah, atau tanda hubung.',
    )
  }
}

async function promptUsername(prompt = 'Username admin: ') {
  const rl = createInterface({ input: stdin, output: stdout })
  const username = (await rl.question(prompt)).trim()
  rl.close()
  return username
}

async function main() {
  const action = process.argv[2]
  if (!['create', 'reset-password', 'set-credentials'].includes(action)) {
    throw new Error(
      'Gunakan: npm run admin:create, npm run admin:reset-password, atau npm run admin:set-credentials',
    )
  }

  const username = await promptUsername(
    action === 'set-credentials' ? 'Username admin saat ini: ' : 'Username admin: ',
  )
  validateUsername(username)

  const existingAdmin = findAdminByUsername(username)
  if (action !== 'create' && !existingAdmin) {
    throw new Error(`Admin "${username}" tidak ditemukan.`)
  }

  const nextUsername =
    action === 'set-credentials' ? await promptUsername('Username admin baru: ') : username
  validateUsername(nextUsername)
  const conflictingAdmin = findAdminByUsername(nextUsername)
  if (conflictingAdmin && conflictingAdmin.id !== existingAdmin?.id) {
    throw new Error(`Username "${nextUsername}" sudah digunakan.`)
  }

  const password = await readHidden('Kata sandi baru (tidak ditampilkan): ')
  validatePassword(password)
  const confirmation = await readHidden('Ulangi kata sandi: ')
  if (password !== confirmation) throw new Error('Kata sandi tidak sama.')

  const { salt, hash } = await hashPassword(password)
  if (action === 'create') {
    createAdmin(username, salt, hash)
    stdout.write(`Akun admin "${username}" berhasil dibuat.\n`)
    return
  }

  if (action === 'set-credentials') {
    if (!updateAdminCredentials(username, nextUsername, salt, hash)) {
      throw new Error(`Admin "${username}" tidak ditemukan.`)
    }
    stdout.write(
      `Username dan kata sandi admin berhasil diperbarui. Semua sesi lama sudah dicabut.\n`,
    )
    return
  }

  if (!updateAdminPassword(username, salt, hash)) {
    throw new Error(`Admin "${username}" tidak ditemukan.`)
  }
  stdout.write(
    `Kata sandi admin "${username}" berhasil diperbarui. Semua sesi lama sudah dicabut.\n`,
  )
}

main().catch((error) => {
  stderr.write(`${error instanceof Error ? error.message : 'Terjadi kesalahan.'}\n`)
  process.exitCode = 1
})
