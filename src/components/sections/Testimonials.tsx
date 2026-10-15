import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Stethoscope,
  Users,
  Code2,
  Paintbrush,
  Heart,
  Star,
} from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  year: string
  quote: string
  icon: React.ReactNode
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Rizky Aditya Pratama',
    role: 'Alumni — Diterima di ITB',
    year: 'Angkatan 2022',
    quote:
      'Sekolah kami benar-benar mempersiapkan saya menghadapi kuliah di ITB. ' +
      'Guru-gurunya kompeten, bimbingan belajarnya intensif, dan suasana sekolahnya mendorong saya untuk terus berkembang.',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    id: 2,
    name: 'Siti Rahma Aulia',
    role: 'Alumni — UI Kedokteran',
    year: 'Angkatan 2023',
    quote:
      'Laboratorium sains di sini sangat lengkap. Praktikum yang rutin membuat saya benar-benar ' +
      'paham materi, bukan sekadar hafalan. Inilah bekal terkuat saya lolos UTBK Kedokteran.',
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: 3,
    name: 'Bapak Hendra Wijaya',
    role: 'Orang Tua Siswa',
    year: '',
    quote:
      'Komunikasi antara sekolah dan keluarga sangat aktif. Perkembangan anak saya dipantau dengan ' +
      'baik, dan guru-guru selalu terbuka untuk berdiskusi mengenai kemajuan belajar.',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 4,
    name: 'Muhammad Farhan',
    role: 'Siswa — Kelas XII',
    year: '',
    quote:
      'Ekskul robotika di sini luar biasa. Kami sudah tiga kali menang kompetisi tingkat nasional. ' +
      'Fasilitas dan pembimbing yang kompeten membuat saya makin semangat belajar teknologi.',
    icon: <Code2 className="w-5 h-5" />,
  },
  {
    id: 5,
    name: 'Dewi Kusuma Ningrum',
    role: 'Alumni — Beasiswa Luar Negeri',
    year: 'Angkatan 2021',
    quote:
      'Program bilingual di sekolah kami sangat membantu kemampuan bahasa Inggris saya. ' +
      'Berkat itu, saya berhasil mendapatkan beasiswa penuh ke Belanda untuk studi S1 Desain.',
    icon: <Paintbrush className="w-5 h-5" />,
  },
  {
    id: 6,
    name: 'Ibu Dian Permatasari',
    role: 'Orang Tua Siswa',
    year: '',
    quote:
      'Anak saya sangat senang bersekolah di sini. Teman-temannya supportif, guru-gurunya ' +
      'menyenangkan, dan lingkungannya sangat kondusif untuk belajar.',
    icon: <Heart className="w-5 h-5" />,
  },
]

function Stars() {
  return (
    <div className="mb-4 flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className="h-4 w-4 fill-current text-amber-400" />
      ))}
    </div>
  )
}

function Avatar({ t }: { t: Testimonial }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400"
    >
      {t.icon}
    </div>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [cur, setCur] = useState(0)
  const [dir, setDir] = useState(0)

  const prev = () => {
    setDir(-1)
    setCur((c) => (c - 1 + testimonials.length) % testimonials.length)
  }
  const next = () => {
    setDir(1)
    setCur((c) => (c + 1) % testimonials.length)
  }
  const visible = [0, 1, 2].map((i) => testimonials[(cur + i) % testimonials.length])

  return (
    <section ref={ref} className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
        >
          <div>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-3">
              Testimoni
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Kata Mereka
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className={[
                'w-9 h-9 rounded-lg border border-gray-200',
                'dark:border-gray-700 hover:border-gray-300',
                'dark:hover:border-gray-600 text-gray-600',
                'dark:text-gray-300 flex items-center justify-center',
                'transition-colors',
              ].join(' ')}
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className={[
                'w-9 h-9 rounded-lg border border-gray-200',
                'dark:border-gray-700 hover:border-gray-300',
                'dark:hover:border-gray-600 text-gray-600',
                'dark:text-gray-300 flex items-center justify-center',
                'transition-colors',
              ].join(' ')}
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Desktop 3-col */}
        <div className="hidden lg:grid grid-cols-3 gap-5">
          {visible.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`bg-white dark:bg-gray-800 border rounded-2xl p-6 transition-all duration-200 ${
                i === 0
                  ? 'border-brand-200 dark:border-brand-700'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Stars />
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Avatar t={t} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">{t.role}</p>
                  {t.year && <p className="text-brand-600 dark:text-brand-400 text-xs">{t.year}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile single */}
        <div className="lg:hidden overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={cur}
              custom={dir}
              initial={{ x: dir > 0 ? 40 : -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir > 0 ? -40 : 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6"
            >
              <Stars />
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-6">
                "{testimonials[cur].quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Avatar t={testimonials[cur]} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {testimonials[cur].name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {testimonials[cur].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDir(i > cur ? 1 : -1)
                setCur(i)
              }}
              className={`rounded-full transition-all duration-200 ${
                i === cur
                  ? 'w-5 h-2 bg-brand-700'
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Testimoni ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
