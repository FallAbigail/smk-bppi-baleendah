import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, ChevronRight, Moon, Sun, X } from 'lucide-react'
import type Lenis from 'lenis'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { schoolProfile } from '../data/schoolProfile'

const links = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang Sekolah', href: '/tentang' },
  { label: 'Program Keahlian', href: '/program' },
  { label: 'Ekskul', href: '/ekskul' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Informasi', href: '/informasi' },
  { label: 'Kontak', href: '/kontak' },
]

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/smkbppi_be/' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@smkbppibaleendah' },
  { label: 'YouTube', href: 'https://www.youtube.com/@sekolahbppi' },
]

interface Props {
  open: boolean
  onClose: () => void
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void
  lenisRef: RefObject<Lenis | null>
  languageControl: ReactNode
}

export default function MobileNavigation({ open, onClose, onNavigate, lenisRef, languageControl }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const { t } = useLanguage()
  const { isDark, toggleTheme } = useTheme()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!open) {
      if (dialog.open) dialog.close()
      return
    }

    dialog.showModal()
    closeRef.current?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    const lenis = lenisRef.current
    const wasStopped = lenis?.isStopped
    document.body.style.overflow = 'hidden'
    lenis?.stop()

    return () => {
      if (dialog.open) dialog.close()
      document.body.style.overflow = previousOverflow
      if (lenis && !wasStopped) lenis.start()
    }
  }, [open, lenisRef])

  useEffect(() => {
    if (!open) return
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => { if (desktop.matches) onClose() }
    closeOnDesktop()
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [open, onClose])

  return createPortal(
    <dialog
      ref={dialogRef}
      id="mobile-navigation"
      className="mobile-navigation-dialog"
      aria-label={t('Navigasi utama')}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <div className="mobile-navigation-panel" data-lenis-prevent>
        <div className="mobile-navigation-header">
          <Link className="mobile-navigation-brand" to="/" onClick={(event) => onNavigate(event, '/')}>
            <img src="/images/logo-smk-bppi.png" width={40} height={40} alt="" />
            <span>
              <strong>{schoolProfile.name}</strong>
              <span>{t(schoolProfile.city)}</span>
            </span>
          </Link>
          <button ref={closeRef} className="mobile-navigation-close" type="button" onClick={onClose} aria-label={t('Tutup menu navigasi')}>
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <nav className="mobile-navigation-links" aria-label={t('Navigasi utama')}>
          {links.map(({ label, href }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
            return (
              <Link key={href} to={href} onClick={(event) => onNavigate(event, href)} aria-current={active ? 'page' : undefined}>
                <span>{t(label)}</span>
                <ChevronRight size={19} aria-hidden="true" />
              </Link>
            )
          })}
        </nav>

        <Link className="mobile-navigation-ppdb" to="/ppdb" onClick={(event) => onNavigate(event, '/ppdb')} aria-current={pathname === '/ppdb' ? 'page' : undefined}>
          {t('Pendaftaran PPDB')}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>

        <div className="mobile-navigation-preferences">
          {languageControl}
          <button type="button" onClick={toggleTheme} aria-label={t(isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap')}>
            {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </div>

        <div className="mobile-navigation-socials" role="group" aria-label={t('Media sosial')}>
          {socials.map(({ label, href }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
