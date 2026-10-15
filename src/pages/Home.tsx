import ScrollSection from '../components/scroll/ScrollSection'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Programs from '../components/sections/Programs'
import Features from '../components/sections/Features'
import Gallery from '../components/sections/Gallery'
import CommunityReviews from '../components/sections/CommunityReviews'
import Sponsors from '../components/sections/Sponsors'
import CTA from '../components/sections/CTA'
import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  usePageMeta(
    t('Profil Sekolah'),
    `${t('Kenali profil, program keahlian, fasilitas, dan kegiatan')} ${schoolProfile.name} ${schoolProfile.city}.`,
  )

  return (
    <main id="main-content" tabIndex={-1}>
      <Hero blank />

      <ScrollSection id="section-about">
        <About />
      </ScrollSection>

      <ScrollSection id="section-programs">
        <Programs />
      </ScrollSection>

      <ScrollSection id="section-features">
        <Features />
      </ScrollSection>

      <ScrollSection id="section-gallery">
        <Gallery preview />
      </ScrollSection>

      <ScrollSection id="section-reviews">
        <CommunityReviews />
      </ScrollSection>

      <Sponsors />

      <ScrollSection id="section-cta">
        <CTA />
      </ScrollSection>
    </main>
  )
}
