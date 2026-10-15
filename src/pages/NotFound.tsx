import { Link } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()
  usePageMeta(
    t('Halaman Tidak Ditemukan'),
    `${t('Halaman yang Anda cari tidak tersedia di situs')} ${schoolProfile.name}.`,
  )

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-20 min-h-[70vh] flex items-center bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <span
          className={[
            'mx-auto flex h-14 w-14 items-center justify-center',
            'rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950',
            'dark:text-brand-400',
          ].join(' ')}
        >
          <FileQuestion className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('Halaman tidak ditemukan')}
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {t('Tautan mungkin sudah berubah atau alamat yang Anda buka tidak tersedia.')}
        </p>
        <Link
          to="/"
          className={[
            'mt-8 inline-flex items-center gap-2 rounded-lg',
            'bg-brand-700 px-5 py-3 text-sm font-semibold text-white',
            'hover:bg-brand-800',
          ].join(' ')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {t('Kembali ke beranda')}
        </Link>
      </div>
    </main>
  )
}
