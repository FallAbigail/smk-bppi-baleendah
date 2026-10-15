import Programs from '../components/sections/Programs'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function Program() {
  const { t } = useLanguage()
  usePageMeta(
    t('Program Keahlian'),
    `${t('Jelajahi program keahlian di')} ${schoolProfile.name} ${schoolProfile.city}.`,
  )

  return (
    <main id="main-content" tabIndex={-1} className="pt-20">
      <Programs headingLevel="h1" />
    </main>
  )
}
