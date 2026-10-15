import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'

const missions = [
  'Mewujudkan budaya religius melalui pendidikan yang memuat IMTAQ.',
  'Membangun perilaku disiplin siswa sejak dini.',
  'Meningkatkan kemampuan siswa dalam kegiatan intrakurikuler dan ekstrakurikuler.',
  'Meningkatkan efektivitas pembelajaran dan menegakkan disiplin dengan tanggung jawab.',
  'Mengembangkan profesionalisme guru dan tenaga tata laksana.',
  'Menyiapkan lulusan untuk bekerja, berwirausaha, atau melanjutkan studi.',
  'Mewujudkan lingkungan sekolah yang hijau, indah, aman, dan nyaman.',
]

export default function About({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const { t } = useLanguage()
  const Heading = headingLevel

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-950" aria-labelledby="about-heading">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            {t('Tentang SMK BPPI')}
          </p>
          <Heading id="about-heading" className="text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
            {t('Sekolah kejuruan informatika sejak 2008')}
          </Heading>
          <p className="mt-5 leading-relaxed text-gray-600 dark:text-gray-400">
            {t('SMK BPPI Baleendah berdiri pada tahun 2008 dengan fokus pendidikan kejuruan informatika. Lulusan disiapkan untuk bekerja, berwirausaha, atau melanjutkan pendidikan ke perguruan tinggi.')}
          </p>

          <div className="mt-6 border-y border-gray-200 py-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('Program keahlian')}
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">AKL · PPLG · TJKT · ACP</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            <Link to="/program" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400">
              {t('Lihat program keahlian')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/tentang#pengajar" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400">
              {t('Kenali guru pengajar')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div id="visi-misi" className="space-y-4 scroll-mt-24">
          <article className="rounded-xl bg-brand-950 p-6 text-white sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">{t('Visi sekolah')}</p>
            <p className="mt-3 text-lg font-semibold leading-relaxed sm:text-xl">
              {t('Menciptakan lulusan yang kompeten sesuai kebutuhan industri serta berkarakter, religius, profesional, dan berwawasan lingkungan.')}
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('Misi sekolah')}</h3>
            <ul className="mt-4 space-y-3">
              {missions.map((mission) => (
                <li key={mission} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                  <span>{t(mission)}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}
