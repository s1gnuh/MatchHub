import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Leagues from './pages/Leagues.jsx'
import Competition from './pages/Competition.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import TeamDetail from './pages/TeamDetail.jsx'
import NotFound from './pages/NotFound.jsx'

// App shell. The wrapper is keyed by pathname so every route change replays the page-in animation.
export default function App() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div key={location.pathname} className="animate-page">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/leagues/:code" element={<Competition />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}
