import { usePageMeta } from '../hooks/usePageMeta'
import { schoolProfile } from '../data/schoolProfile'
import { useLanguage } from '../contexts/LanguageContext'

export default function KebijakanPrivasi() {
  const { t } = useLanguage()
  usePageMeta(
    t('Kebijakan Privasi'),
    `${t('Penjelasan tentang preferensi tampilan, formulir kontak, dan data pendaftaran PPDB')} ${schoolProfile.name}.`,
  )

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-950"
    >
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-sm font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-3">
          {t('Informasi Situs')}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          {t('Kebijakan Privasi')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          {t('Terakhir diperbarui: Oktober 2026')}
        </p>

        <div className="space-y-8 text-gray-600 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Preferensi tampilan')}
            </h2>
            <p>
              {t('Situs menyimpan pilihan mode terang atau gelap di penyimpanan lokal browser dengan nama')}{' '}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800">
                theme
              </code>
              {t('. Nilai ini digunakan agar pilihan tampilan tetap sama saat Anda kembali berkunjung.')}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Formulir kontak')}
            </h2>
            <p>
              {t('Formulir kontak menyiapkan draf email di aplikasi email pada perangkat Anda. Situs ini tidak mengirim atau menyimpan isi pesan. Pesan hanya terkirim jika Anda mengirimkannya dari aplikasi email tersebut.')}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Data pendaftaran PPDB')}
            </h2>
            <p>
              {t('Formulir PPDB menyimpan nama, tanggal lahir, jenis kelamin, alamat, program pilihan, asal sekolah, serta kontak calon siswa dan orang tua atau wali untuk keperluan proses penerimaan. Data hanya tersedia di panel admin yang memerlukan autentikasi. Nomor pendaftaran dan kode pelacakan digunakan untuk melihat status tanpa menampilkan data pribadi.')}
            </p>
            <p className="mt-3">
              {t('Untuk memperbarui atau meminta penghapusan data pendaftaran, hubungi sekolah melalui alamat email atau nomor telepon yang tercantum di situs.')}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Aset pihak ketiga')}
            </h2>
            <p>
              {t('Font dan foto ilustrasi dimuat dari layanan pihak ketiga seperti Google Fonts dan Unsplash. Browser Anda menghubungi layanan tersebut saat aset diminta.')}
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {t('Menghapus preferensi')}
            </h2>
            <p>
              {t('Anda dapat menghapus preferensi tema melalui pengaturan data situs di browser. Setelah dihapus, tampilan akan mengikuti preferensi perangkat Anda.')}
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
