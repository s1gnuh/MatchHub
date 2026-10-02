import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Leagues from './pages/Leagues.jsx'
import Competition from './pages/Competition.jsx'
import TeamDetail from './pages/TeamDetail.jsx'
import PlayerDetail from './pages/PlayerDetail.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'
import useMediaQuery, { WIDE } from './utils/useMediaQuery.js'

// App shell, full width. The wrapper is keyed by pathname so every route change replays the page-in animation,
// except on desktop between "/" and "/matches/:id": that is one three-column screen where opening a match only
// swaps the centre column, so the list keeps its scroll position.
export default function App() {
  const location = useLocation()
  const wide = useMediaQuery(WIDE)
  const matchesScreen = location.pathname === '/' || location.pathname.startsWith('/matches/')
  const pageKey = wide && matchesScreen ? 'matches' : location.pathname

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 sm:px-6 lg:py-4">
        <div key={pageKey} className="animate-page">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/matches/:id" element={<Home />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/leagues/:code" element={<Competition />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
