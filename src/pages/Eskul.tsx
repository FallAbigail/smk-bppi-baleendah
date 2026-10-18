import ExtracurricularDirectory from '../components/sections/ExtracurricularDirectory'
import { useLanguage } from '../contexts/LanguageContext'
import { schoolProfile } from '../data/schoolProfile'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Eskul() {
  const { t } = useLanguage()
  usePageMeta(
    t('Ekstrakurikuler'),
    `${t('17 kegiatan yang tercantum pada daftar ekstrakurikuler resmi SMK BPPI Baleendah.')} ${schoolProfile.name} ${schoolProfile.city}.`,
  )

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-gray-50 pt-20 dark:bg-gray-950">
      <ExtracurricularDirectory headingLevel="h1" />
    </main>
  )
}
