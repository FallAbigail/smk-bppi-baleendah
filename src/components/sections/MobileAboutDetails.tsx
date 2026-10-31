import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { teacherPhotoByName } from '../../data/staffPhotoAssets'

interface Props {
  vision: string
  missions: readonly string[]
  teachers: readonly { name: string; subject: string }[]
}

export default function MobileAboutDetails({ vision, missions, teachers }: Props) {
  const { t } = useLanguage()

  return (
    <div className="mobile-about-details">
      <div id="visi-misi" className="mobile-about-values">
        <article className="mobile-about-vision">
          <h3>{t('Visi sekolah')}</h3>
          <p>{t(vision)}</p>
        </article>

        <div className="mobile-about-mission">
          <h3>{t('Misi sekolah')}</h3>
          <ul aria-label={t('Misi sekolah')}>
            {missions.map((mission) => (
              <li key={mission}>
                <Check size={18} aria-hidden="true" />
                <span>{t(mission)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mobile-about-staff">
        <h3>{t('Guru dan staf pengajar')}</h3>
        <ul aria-label={t('Guru dan staf pengajar')}>
          {teachers.map((teacher) => (
            <li key={teacher.name}>
              <div className="mobile-about-portrait">
                <img src={teacherPhotoByName[teacher.name]} width={72} height={88} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="mobile-about-teacher-copy">
                <h4>{teacher.name}</h4>
                <p>{t(teacher.subject)}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link to="/tentang#pengajar" className="mobile-about-staff-link">
          {t('Kenali guru pengajar')}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
