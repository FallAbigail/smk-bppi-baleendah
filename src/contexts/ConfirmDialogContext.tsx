import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export type ConfirmDialogTone = 'danger' | 'warning' | 'brand'

export interface ConfirmDialogOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmDialogTone
}

type ConfirmDialogRequest = Required<ConfirmDialogOptions>
type ConfirmDialogContextValue = { confirm: (options: ConfirmDialogOptions) => Promise<boolean> }

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null)

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext)
  if (!context) throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider')
  return context.confirm
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const [request, setRequest] = useState<ConfirmDialogRequest | null>(null)
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  const confirm = useCallback((options: ConfirmDialogOptions) => new Promise<boolean>((resolve) => {
    resolveRef.current?.(false)
    const nextRequest: ConfirmDialogRequest = {
      ...options,
      confirmLabel: options.confirmLabel ?? t('Lanjutkan'),
      cancelLabel: options.cancelLabel ?? t('Batal'),
      tone: options.tone ?? 'brand',
    }
    resolveRef.current = resolve
    setRequest(nextRequest)
  }), [t])

  const finish = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current
    resolveRef.current = null
    setRequest(null)
    resolve?.(confirmed)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (request && !dialog.open) dialog.showModal()
    if (!request && dialog.open) dialog.close()
    if (request) cancelButtonRef.current?.focus()
  }, [request])

  const toneStyles = request?.tone === 'danger'
    ? {
        icon: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
        action: 'bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-300 dark:bg-red-600 dark:hover:bg-red-500',
        Icon: ShieldAlert,
      }
    : request?.tone === 'warning'
      ? {
          icon: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          action: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-500',
          Icon: AlertTriangle,
        }
      : {
          icon: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300',
          action: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-500',
          Icon: AlertTriangle,
        }
  const Icon = toneStyles.Icon

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,32rem)] max-w-none overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-gray-950/50 backdrop:backdrop-blur-[2px] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        onCancel={(event) => {
          event.preventDefault()
          finish(false)
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) finish(false)
        }}
      >
        {request && (
          <div className="p-6 sm:p-7">
            <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${toneStyles.icon}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 id="confirm-dialog-title" className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">
              {request.title}
            </h2>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {request.description}
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => finish(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-gray-700"
              >
                {request.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 ${toneStyles.action}`}
              >
                {request.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </dialog>
    </ConfirmDialogContext.Provider>
  )
}
