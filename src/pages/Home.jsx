import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import SearchFilter from '../components/SearchFilter.jsx'
import LeagueMatches from '../components/LeagueMatches.jsx'
import { useLang } from '../utils/i18n.jsx'
import { COMPETITIONS } from '../services/api.js'

const DEFAULT_LEAGUE = 'PL' // Premier League

// League chip with its emblem (hidden if the image is missing).
function Chip({ emblem, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 active:scale-95 ${active ? 'border-primary bg-primary text-black shadow-lg shadow-primary/30' : 'border-line bg-card text-main hover:border-primary/50 hover:bg-subtle'}`}>
      <img src={emblem} alt="" className="h-5 w-5 rounded-sm bg-white object-contain p-px"
        onError={(e) => { e.currentTarget.style.display = 'none' }} />
      {label}
    </button>
  )
}

export default function Home() {
  const { t } = useLang()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  // Unknown or old values (e.g. the removed ?league=ALL) fall back to the default league.
  const current = COMPETITIONS.find((c) => c.code === params.get('league')) || COMPETITIONS.find((c) => c.code === DEFAULT_LEAGUE)
  const code = current.code

  const pick = (c) => setParams(c === DEFAULT_LEAGUE ? {} : { league: c }, { replace: true })

  return (
    <>
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">{current.name}</h1>
      <p className="mb-5 text-muted">{t('home.sub', { country: t('country.' + current.country) })} · <span className="whitespace-nowrap">{t('home.tz')}</span></p>

      <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {COMPETITIONS.map((c) => (
          <Chip key={c.code} emblem={c.emblem} label={c.name} active={code === c.code} onClick={() => pick(c.code)} />
        ))}
      </div>

      <div className="mb-6"><SearchFilter search={search} onSearch={setSearch} /></div>
      <LeagueMatches code={code} search={search} />
    </>
  )
}


