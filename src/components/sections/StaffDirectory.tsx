import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { schoolLeaders, schoolStaffSource, teachingStaff } from '../../data/schoolStaff'
import { leaderPhotoByPosition, teacherOriginalPhotoByName } from '../../data/staffPhotoAssets'

type ProfilePhoto = {
  name: string
  detail: string
  src: string
}

export default function StaffDirectory() {
  const { t } = useLanguage()
  const photoDialogRef = useRef<HTMLDialogElement>(null)
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<ProfilePhoto | null>(null)
  const subjects = useMemo(
    () => [...new Set(teachingStaff.map((teacher) => teacher.subject))].sort((a, b) => a.localeCompare(b)),
    [],
  )
  const visibleTeachers = teachingStaff.filter((teacher) => {
    const matchesSearch = `${teacher.name} ${teacher.subject}`.toLocaleLowerCase('id').includes(query.trim().toLocaleLowerCase('id'))
    return matchesSearch && (!subject || teacher.subject === subject)
  })

  useEffect(() => {
    const dialog = photoDialogRef.current
    if (!dialog) return

    if (selectedPhoto && !dialog.open) dialog.showModal()
    if (!selectedPhoto && dialog.open) dialog.close()
  }, [selectedPhoto])

  const openPhoto = (photo: ProfilePhoto) => setSelectedPhoto(photo)

  return (
    <section id="pengajar" className="scroll-mt-24 bg-gray-50 py-20 dark:bg-gray-950" aria-labelledby="staff-heading">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            {t('Tim Sekolah')}
          </p>
          <h2 id="staff-heading" className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
            {t('Guru dan staf pengajar')}
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
            {t('Daftar nama, bidang mengajar, dan jabatan mengikuti laman Tim Sekolah resmi SMK BPPI Baleendah.')}
          </p>
        </header>

        <div className="mb-12 grid gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {schoolLeaders.map((leader, index) => (
            <article
              key={leader.position}
              className="group relative min-w-0 pt-8"
            >
              <div className={`relative flex min-h-[17rem] flex-col justify-end overflow-hidden rounded-[1.4rem] border px-5 pb-6 pt-24 shadow-sm transition-colors sm:px-6 sm:pb-7 ${
                index === 0
                  ? 'border-brand-200 bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:border-brand-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900'
                  : 'border-gray-200 bg-gradient-to-br from-slate-50 via-white to-brand-50/60 dark:border-gray-800 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900'
              }`}>
                <span className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full border border-brand-200/60 dark:border-brand-800/50" aria-hidden="true" />
                <div className="relative z-10 max-w-[calc(100%-5.75rem)] sm:max-w-[62%]">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700 dark:text-brand-400">
                    {t(leader.position)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-gray-900 dark:text-white sm:text-xl">
                    {leader.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openPhoto({ name: leader.name, detail: leader.position, src: leaderPhotoByPosition[leader.position] })}
                aria-label={`${t('Lihat foto')} ${leader.name}`}
                className="absolute right-4 top-0 z-20 h-32 w-32 overflow-hidden rounded-full border-[5px] border-white bg-white shadow-lg outline-none transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-800 sm:right-5 sm:h-36 sm:w-36 xl:right-6 xl:h-40 xl:w-40"
              >
                <img
                  src={leaderPhotoByPosition[leader.position]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full scale-[1.16] object-cover object-[center_24%]"
                />
              </button>
            </article>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">{t('Cari nama atau bidang')}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              placeholder={t('Cari nama atau bidang')}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </label>
          <label>
            <span className="sr-only">{t('Filter bidang pengajar')}</span>
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white sm:min-w-56"
            >
              <option value="">{t('Semua bidang')}</option>
              {subjects.map((item) => (
                <option key={item} value={item}>{t(item)}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
          {visibleTeachers.length} / {teachingStaff.length} {t('guru ditampilkan')}
        </p>
        {visibleTeachers.length > 0 ? (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {visibleTeachers.map((teacher) => (
              <li
                key={teacher.name}
                className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition-colors hover:border-brand-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-800 sm:gap-4 sm:p-4"
              >
                <button
                  type="button"
                  onClick={() => openPhoto({ name: teacher.name, detail: teacher.subject, src: teacherOriginalPhotoByName[teacher.name] })}
                  aria-label={`${t('Lihat foto')} ${teacher.name}`}
                  className="h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-100 outline-none transition-colors hover:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-500"
                >
                  <img
                    src={teacherOriginalPhotoByName[teacher.name]}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </button>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white sm:text-base">{teacher.name}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('Mengajar')}: <span className="font-medium text-brand-800 dark:text-brand-300">{t(teacher.subject)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
            {t('Tidak ada guru yang cocok dengan pencarian.')}
          </p>
        )}

        <a
          href={schoolStaffSource}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex text-sm font-semibold text-brand-700 underline-offset-4 hover:underline dark:text-brand-400"
        >
          {t('Lihat daftar tim sekolah resmi')}
        </a>
      </div>

      <dialog
        ref={photoDialogRef}
        className="staff-photo-dialog max-h-[calc(100svh-2rem)] w-[min(90vw,26rem)] overflow-hidden rounded-2xl bg-white p-0 text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-white"
        aria-label={selectedPhoto ? `${t('Foto profil')} ${selectedPhoto.name}` : t('Foto profil')}
        onClose={() => setSelectedPhoto(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedPhoto(null)
        }}
      >
        {selectedPhoto && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label={t('Tutup foto')}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white outline-none transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <img src={selectedPhoto.src} alt={selectedPhoto.name} className="max-h-[70svh] w-full bg-gray-100 object-contain dark:bg-gray-950" />
            <div className="px-5 py-4">
              <h2 className="text-lg font-semibold">{selectedPhoto.name}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t(selectedPhoto.detail)}</p>
            </div>
          </div>
        )}
      </dialog>
    </section>
  )
}
