import { useCallback, useEffect, useState } from 'react'
import { AdminAccessScreen, AdminLoading } from '../components/admin/AdminAccess'
import { AdminWorkspace } from '../components/admin/AdminWorkspace'
import type { AdminRole } from '../components/admin/types'
import { useSiteContent } from '../contexts/SiteContentContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { apiRequest } from '../lib/api'

function AdminPage() {
  usePageMeta('Admin', 'Panel pengelolaan konten profil sekolah.')
  const { loadAdminContent, loadPublicContent } = useSiteContent()
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [setupRequired, setSetupRequired] = useState(false)
  const [username, setUsername] = useState('')
  const [adminRole, setAdminRole] = useState<AdminRole>('admin')
  const [authError, setAuthError] = useState('')
  const [loginPending, setLoginPending] = useState(false)

  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previousContent = existing?.content
    const robots = existing ?? document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    if (!existing) document.head.appendChild(robots)

    return () => {
      if (existing) existing.content = previousContent ?? ''
      else robots.remove()
    }
  }, [])

  const checkSession = useCallback(async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const session = await apiRequest<{
        authenticated: boolean
        username?: string
        role?: AdminRole
        setupRequired: boolean
      }>('/auth/session')
      setSetupRequired(session.setupRequired)
      if (session.authenticated) {
        await loadAdminContent()
        setUsername(session.username ?? 'admin')
        setAdminRole(session.role ?? 'admin')
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
      }
    } catch (error) {
      setAuthenticated(false)
      setAuthError(error instanceof Error ? error.message : 'Backend belum dapat dihubungi.')
    } finally {
      setAuthLoading(false)
    }
  }, [loadAdminContent])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  async function handleLogin(user: string, password: string) {
    setLoginPending(true)
    setAuthError('')
    try {
      const session = await apiRequest<{ authenticated: boolean; username: string; role: AdminRole }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username: user, password }),
        },
      )
      await loadAdminContent()
      setUsername(session.username)
      setAdminRole(session.role)
      setAuthenticated(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login belum berhasil.')
    } finally {
      setLoginPending(false)
    }
  }

  async function handleLogout() {
    try {
      await apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' })
      await loadPublicContent().catch(() => undefined)
      setAuthenticated(false)
      setUsername('')
      setAdminRole('admin')
      setAuthError('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Logout belum berhasil.')
    }
  }

  if (authLoading) return <AdminLoading />
  if (!authenticated) {
    return (
      <AdminAccessScreen
        setupRequired={setupRequired}
        error={authError}
        pending={loginPending}
        onLogin={handleLogin}
        onRetry={() => {
          void checkSession()
        }}
      />
    )
  }

  return (
    <AdminWorkspace
      username={username}
      role={adminRole}
      onLogout={() => {
        void handleLogout()
      }}
    />
  )
}

export default AdminPage
