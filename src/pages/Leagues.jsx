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
            className={`animate-fade-in rounded-xl border-l-4 bg-card p-5 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-lg ${leagueColor(c.code)}`}
          >
            <p className="text-xl font-bold">{c.name}</p>
            <p className="text-sm text-muted">{t('country.' + c.country)} · {c.code}</p>
          </Link>
        ))}
      </div>
    </>
  )
}


