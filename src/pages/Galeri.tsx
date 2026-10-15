import Gallery from '../components/sections/Gallery'
import ExtracurricularDirectory from '../components/sections/ExtracurricularDirectory'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function Galeri() {
  const { t } = useLanguage()
  usePageMeta(
    t('Galeri Kegiatan'),
    `${t('Kegiatan sekolah dan daftar ekstrakurikuler')} ${schoolProfile.name} ${schoolProfile.city}.`,
  )

  return (
    <main id="main-content" tabIndex={-1} className="pt-20">
      <Gallery headingLevel="h1" />
      <ExtracurricularDirectory />
    </main>
  )
}
