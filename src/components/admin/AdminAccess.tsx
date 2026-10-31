import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { schoolProfile } from '../../data/schoolProfile'
import { inputClass } from './adminHelpers'

// Loading, first-time setup instructions, and the admin login form.
export function AdminLoading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950"
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          'flex items-center gap-3 rounded-2xl border',
          'border-gray-200 bg-white px-5 py-4 text-sm text-gray-600',
          'shadow-sm dark:border-gray-800 dark:bg-gray-900',
          'dark:text-gray-300',
        ].join(' ')}
      >
        <ShieldCheck className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />
        Memeriksa sesi admin…
      </div>
    </main>
  )
}

export function AdminAccessScreen({
  setupRequired,
  error,
  pending,
  onLogin,
  onRetry,
}: {
  setupRequired: boolean
  error: string
  pending: boolean
  onLogin: (username: string, password: string) => Promise<void>
  onRetry: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onLogin(username.trim(), password)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6">
      <section
        className={[
          'w-full max-w-md rounded-2xl border border-gray-200',
          'bg-white p-6 shadow-sm dark:border-gray-800',
          'dark:bg-gray-900 sm:p-8',
        ].join(' ')}
      >
        <a
          href="/"
          className={[
            'mb-8 inline-flex items-center gap-2 text-sm font-medium',
            'text-gray-500 transition hover:text-brand-700',
            'dark:text-gray-400 dark:hover:text-brand-300',
          ].join(' ')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke situs
        </a>
        <div className="mb-7 flex items-center gap-3.5">
          <img
            src="/images/logo-smk-bppi.png"
            alt={schoolProfile.name}
            className="h-14 w-14 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
              {schoolProfile.name}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {schoolProfile.city} · Panel pengelola
            </p>
          </div>
        </div>
        {setupRequired ? (
          <>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Siapkan akun admin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Belum ada akun admin. Buat akun dari terminal pada komputer server; pendaftaran tidak
              tersedia dari halaman publik.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-xl bg-gray-950 p-4 text-sm text-gray-100">
              <code>npm run admin:create</code>
            </pre>
            {error && (
              <p
                role="alert"
                className={[
                  'mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-sm',
                  'text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
                ].join(' ')}
              >
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={onRetry}
              className={[
                'mt-5 w-full rounded-lg border border-gray-200 px-4',
                'py-2.5 text-sm font-semibold text-gray-700 transition',
                'hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300',
                'dark:hover:bg-gray-800',
              ].join(' ')}
            >
              Periksa lagi
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Masuk ke panel admin
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              Gunakan akun yang dibuat di server. Sesi akan berakhir otomatis setelah 12 jam.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
                <input
                  required
                  autoComplete="username"
                  maxLength={40}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kata sandi
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                />
              </label>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending}
                className={[
                  'inline-flex w-full items-center justify-center gap-2',
                  'rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold',
                  'text-white transition hover:bg-brand-800',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                ].join(' ')}
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                {pending ? 'Memeriksa…' : 'Masuk dengan aman'}
              </button>
            </form>
            <p
              className={[
                'mt-5 border-t border-gray-100 pt-4 text-xs',
                'leading-relaxed text-gray-500 dark:border-gray-800',
                'dark:text-gray-400',
              ].join(' ')}
            >
              Lupa kata sandi? Reset dari terminal server dengan{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">
                npm run admin:reset-password
              </code>
              .
            </p>
          </>
        )}
      </section>
    </main>
  )
}
