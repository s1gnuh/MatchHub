import { Link } from 'react-router-dom'
import { useLang } from '../utils/i18n.jsx'
import { COMPETITIONS } from '../services/api.js'
import { leagueColor } from '../utils/helpers.js'

// Grid of supported leagues; each links to its detail page.
export default function Leagues() {
  const { t } = useLang()
  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">{t('leagues.title')}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COMPETITIONS.map((c) => (
          <Link
            key={c.code}
            to={`/leagues/${c.code}`}
            className={`group flex animate-fade-in items-center gap-4 rounded-xl border-l-4 bg-card p-5 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-lg ${leagueColor(c.code)}`}
          >
            {/* Emblems are often dark on transparent, so they sit on a white tile (hidden if the image fails). */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 transition duration-300 group-hover:scale-105">
              <img src={c.emblem} alt="" loading="lazy" className="h-full w-full object-contain"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-bold">{c.name}</p>
              <p className="text-sm text-muted">{t('country.' + c.country)} · {c.code}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}


