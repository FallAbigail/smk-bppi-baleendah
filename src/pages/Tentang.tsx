import About from '../components/sections/About'
import StaffDirectory from '../components/sections/StaffDirectory'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function Tentang() {
  const { t } = useLanguage()
  usePageMeta(
    t('Tentang Sekolah'),
    `${t('Kenali visi, misi, dan pendekatan pendidikan')} ${schoolProfile.name} ${schoolProfile.city}.`,
  )

  return (
    <main id="main-content" tabIndex={-1} className="pt-20">
      <About headingLevel="h1" />
      <StaffDirectory />
    </main>
  )
}
