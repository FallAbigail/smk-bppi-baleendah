import Gallery from '../components/sections/Gallery'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function Galeri() {
  const { t } = useLanguage()
  usePageMeta(
    t('Galeri Kegiatan'),
    `${t('Galeri foto kegiatan sekolah')} ${schoolProfile.name} ${schoolProfile.city}.`,
  )

  return (
    <main id="main-content" tabIndex={-1} className="pt-20">
      <Gallery headingLevel="h1" />
    </main>
  )
}
