import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useLenis } from './hooks/useLenis'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { RouteScrollManager, ScrollToTopButton } from './components/ScrollToTop'
import { useLanguage } from './contexts/LanguageContext'

const Home = lazy(() => import('./pages/Home'))
const Tentang = lazy(() => import('./pages/Tentang'))
const Program = lazy(() => import('./pages/Program'))
const ProgramArticle = lazy(() => import('./pages/ProgramArticle'))
const Eskul = lazy(() => import('./pages/Eskul'))
const Galeri = lazy(() => import('./pages/Galeri'))
const ExtracurricularArticle = lazy(() => import('./pages/ExtracurricularArticle'))
const Kontak = lazy(() => import('./pages/Kontak'))
const Informasi = lazy(() => import('./pages/Informasi'))
const Ppdb = lazy(() => import('./pages/Ppdb'))
const KebijakanPrivasi = lazy(() => import('./pages/KebijakanPrivasi'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Admin = lazy(() => import('./pages/Admin'))

function PageLoading() {
  const { t } = useLanguage()
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[55vh] px-6 py-24 text-center"
      aria-busy="true"
      role="status"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('Memuat halaman…')}</p>
    </main>
  )
}

function App() {
  const lenisRef = useLenis()
  const location = useLocation()
  const { t } = useLanguage()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t('Lompat ke konten utama')}
      </a>
      {!isAdmin && <RouteScrollManager lenisRef={lenisRef} />}
      {!isAdmin && <Navbar lenisRef={lenisRef} />}
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/" element={<Home />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/program" element={<Program />} />
          <Route path="/program/:slug" element={<ProgramArticle />} />
          <Route path="/ekskul" element={<Eskul />} />
          <Route path="/ekskul/:slug" element={<ExtracurricularArticle />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/informasi" element={<Informasi />} />
          <Route path="/ppdb" element={<Ppdb />} />
          <Route path="/privasi" element={<KebijakanPrivasi />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdmin && <Footer />}
      {!isAdmin && <ScrollToTopButton lenisRef={lenisRef} />}
    </>
  )
}

export default App
