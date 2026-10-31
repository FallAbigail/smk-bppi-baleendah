import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { teachingStaff } from '../../data/schoolStaff'
import { teacherPhotoByName } from '../../data/staffPhotoAssets'

const featuredTeachers = [
  teachingStaff[0],
  teachingStaff[1],
  teachingStaff.find((teacher) => teacher.name.startsWith('Kisan Ramadhan')),
].filter((teacher): teacher is (typeof teachingStaff)[number] => Boolean(teacher))

const missions = [
  'Mewujudkan budaya religius melalui pendidikan yang memuat IMTAQ.',
  'Membangun perilaku disiplin siswa sejak dini.',
  'Meningkatkan kemampuan siswa dalam kegiatan intrakurikuler dan ekstrakurikuler.',
  'Meningkatkan efektivitas pembelajaran dan menegakkan disiplin dengan tanggung jawab.',
  'Mengembangkan profesionalisme guru dan tenaga tata laksana.',
  'Menyiapkan lulusan untuk bekerja, berwirausaha, atau melanjutkan studi.',
  'Mewujudkan lingkungan sekolah yang hijau, indah, aman, dan nyaman.',
]

export default function About({ headingLevel = 'h2', compact = false }: { headingLevel?: 'h1' | 'h2'; compact?: boolean }) {
  const { t } = useLanguage()
  const Heading = headingLevel

  return (
    <section className="home-compact-section bg-gray-50 py-20 dark:bg-gray-950" aria-labelledby="about-heading">
      <div className={`mx-auto grid max-w-7xl gap-10 px-6 lg:px-8 ${compact ? 'lg:max-w-4xl' : 'lg:grid-cols-[0.9fr_1.1fr] lg:gap-16'}`}>
        <div className="flex flex-col">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            {t('Tentang SMK BPPI')}
          </p>
          <Heading id="about-heading" className="text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl">
            {t('Sekolah kejuruan informatika sejak 2008')}
          </Heading>
          <p className="mt-5 leading-relaxed text-gray-600 dark:text-gray-400">
            {t('SMK BPPI Baleendah berdiri pada tahun 2008 dengan fokus pendidikan kejuruan informatika. Lulusan disiapkan untuk bekerja, berwirausaha, atau melanjutkan pendidikan ke perguruan tinggi.')}
          </p>

          {compact ? (
            <Link to="/tentang" className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300">
              {t('Kenali sekolah lebih dekat')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : <>
          <div className="mt-6 border-y border-gray-200 py-4 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('Program keahlian')}
            </p>
            <p className="mt-1 font-medium text-gray-900 dark:text-white">AKL · PPLG · TJKT · ACP</p>
          </div>

          <div className="mt-auto pt-4">
            <ul className="home-mobile-rail teacher-rail grid grid-cols-2 [grid-auto-rows:1fr] gap-x-2 gap-y-9 sm:grid-cols-3" aria-label={t('Guru dan staf pengajar')} tabIndex={0}>
              {featuredTeachers.map((teacher) => (
                <li key={teacher.name} className="teacher-rail-card relative flex min-w-0 flex-col items-center pt-[56px] text-center">
                  <img
                    src={teacherPhotoByName[teacher.name]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="teacher-rail-photo absolute left-1/2 top-0 z-10 h-36 w-28 -translate-x-1/2 object-contain object-bottom"
                  />
                  <div className="teacher-rail-info flex min-h-[148px] w-full flex-1 flex-col items-center rounded-xl border border-gray-200 bg-white px-2 pb-3 pt-[100px] shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                      {teacher.name}
                    </h3>
                    <p className="mt-auto pt-1 text-xs font-medium text-brand-800 dark:text-brand-300">
                      {t(teacher.subject)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to="/tentang#pengajar"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400"
            >
              {t('Kenali guru pengajar')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          </>}
        </div>

        {!compact && <div id="visi-misi" className="flex flex-col justify-end space-y-4 scroll-mt-24">
          <article className="rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-white sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">{t('Visi sekolah')}</p>
            <p className="mt-3 text-lg font-semibold leading-relaxed text-gray-900 dark:text-white sm:text-xl">
              {t('Menciptakan lulusan yang kompeten sesuai kebutuhan industri serta berkarakter, religius, profesional, dan berwawasan lingkungan.')}
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('Misi sekolah')}</h3>
            <ul className="home-mobile-rail mission-rail mt-4 space-y-3" aria-label={t('Daftar misi sekolah')}>
              {missions.map((mission) => (
                <li key={mission} className="mission-rail-card flex items-start gap-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                  <span>{t(mission)}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>}
      </div>
    </section>
  )
}
