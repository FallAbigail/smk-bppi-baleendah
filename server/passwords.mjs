import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new Error('Kata sandi harus berisi 8–128 karakter.')
  }
}

export async function hashPassword(password) {
  validatePassword(password)
  const salt = randomBytes(16)
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS)
  return {
    salt: salt.toString('hex'),
    hash: Buffer.from(derivedKey).toString('hex'),
  }
}

export async function verifyPassword(password, saltHex, hashHex) {
  const expected = Buffer.from(hashHex, 'hex')
  if (expected.length !== KEY_LENGTH) return false

  const derivedKey = await scrypt(password, Buffer.from(saltHex, 'hex'), KEY_LENGTH, SCRYPT_OPTIONS)
  const actual = Buffer.from(derivedKey)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
