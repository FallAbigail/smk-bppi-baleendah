import { useEffect, useState, type FormEvent } from 'react'
import { ShieldCheck, UserPlus, UsersRound } from 'lucide-react'
import { apiRequest } from '../../lib/api'

type AdminAccount = {
  id: string
  username: string
  role: 'owner' | 'admin'
  createdAt: string
}

type AdminListResponse = { admins: AdminAccount[] }

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

export default function AdminAccountsManager() {
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    apiRequest<AdminListResponse>('/admin/admins')
      .then((payload) => {
        if (active) setAdmins(payload.admins)
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Daftar admin gagal dimuat.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function addAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (password !== confirmation) {
      setError('Konfirmasi kata sandi belum sama.')
      return
    }

    setSaving(true)
    try {
      const response = await apiRequest<AdminListResponse>('/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setAdmins(response.admins)
      setUsername('')
      setPassword('')
      setConfirmation('')
      setNotice('Akun admin baru berhasil ditambahkan. Admin tersebut dapat login menggunakan username dan kata sandinya.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Akun admin belum dapat dibuat.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section aria-labelledby="admin-accounts-heading" className="space-y-5">
      <div>
        <h2 id="admin-accounts-heading" className="text-lg font-semibold text-gray-900 dark:text-white">
          Akun admin
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Tambahkan petugas yang perlu mengelola konten dan pendaftaran. Akun admin tambahan tidak dapat menambahkan admin lain.
        </p>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </p>
      )}

      <form onSubmit={(event) => void addAdmin(event)} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            <UserPlus className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tambahkan admin</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Username dan kata sandi dipakai untuk login panel.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
            <input
              required
              minLength={3}
              maxLength={40}
              pattern="[A-Za-z0-9_.-]+"
              autoComplete="off"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Contoh: petugas-ppdb"
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-brand-900"
            />
            <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">3–40 karakter: huruf, angka, titik, garis bawah, atau tanda hubung.</span>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Kata sandi
            <input
              required
              minLength={8}
              maxLength={128}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-brand-900"
            />
            <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">Minimal 8 karakter.</span>
          </label>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
            Ulangi kata sandi
            <input
              required
              minLength={8}
              maxLength={128}
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:ring-brand-900 sm:max-w-xl"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Menyimpan…' : 'Tambahkan admin'}
        </button>
      </form>

      <section aria-labelledby="admin-list-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <UsersRound className="h-5 w-5 text-brand-700 dark:text-brand-300" aria-hidden="true" />
          <h3 id="admin-list-heading" className="font-semibold text-gray-900 dark:text-white">Admin yang dapat login</h3>
        </div>
        {loading ? (
          <p role="status" className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">Memuat daftar admin…</p>
        ) : admins.length ? (
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
            {admins.map((admin) => (
              <li key={admin.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{admin.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ditambahkan {formatDate(admin.createdAt)}</p>
                  </div>
                </div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${admin.role === 'owner' ? 'bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                  {admin.role === 'owner' ? 'Admin utama' : 'Admin'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">Belum ada akun admin.</p>
        )}
      </section>
    </section>
  )
}
