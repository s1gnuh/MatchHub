import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SearchFilter from '../components/SearchFilter.jsx'
import LeagueMatches from '../components/LeagueMatches.jsx'
import MatchPanel from '../components/MatchPanel.jsx'
import StandingsMini from '../components/StandingsMini.jsx'
import { ListContext } from '../components/ListContext.js'
import MatchDetail from './MatchDetail.jsx'
import useApi from '../utils/useApi.js'
import useMatch from '../utils/useMatch.js'
import useMediaQuery, { WIDE } from '../utils/useMediaQuery.js'
import { competitionName } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'
import { COMPETITIONS, fetchCompetitionMatches } from '../services/api.js'

const DEFAULT_LEAGUE = 'PL' // Premier League
const byCode = (code) => COMPETITIONS.find((c) => c.code === code)

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

/** Match to show in the centre column when none is selected: a live one, else the next one, else the latest result. */
function featuredMatch(matches) {
  if (!matches?.length) return null
  const sorted = [...matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  const live = sorted.find((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  if (live) return { match: live, kind: 'live' }
  const next = sorted.find((m) => m.status === 'TIMED' || m.status === 'SCHEDULED')
  if (next) return { match: next, kind: 'next' }
  const last = sorted.filter((m) => m.status === 'FINISHED').pop()
  return last ? { match: last, kind: 'last' } : null
}

// Matches section, for both "/" and "/matches/:id".
// Phones / tablets: the list page, or the match page when a match is open (as before).
// Desktop (lg+): one full-width screen: match list | selected match | league table (1360px+), each column scrolling
// on its own. Opening a match from the list costs no request: its data comes from the list already loaded.
export default function Home() {
  const { t } = useLang()
  const { id } = useParams()
  const wide = useMediaQuery(WIDE)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // League: ?league=, else the open match's competition, else the default.
  const selected = useMatch(wide ? id : null)
  const current = byCode(params.get('league')) || byCode(selected.data?.competition?.code) || byCode(DEFAULT_LEAGUE)
  const code = current.code
  const pick = (c) => navigate({ pathname: '/', search: c === DEFAULT_LEAGUE ? '' : `?league=${c}` }, { replace: !id })

  // Same cache entry as the list itself, so this adds no request.
  const list = useApi(['matches', code], () => fetchCompetitionMatches(code), { enabled: wide })

  if (!wide && id) return <MatchDetail />

  const title = (
    <>
      <h1 className={`font-extrabold tracking-tight ${wide ? 'text-2xl' : 'mb-1 text-3xl'}`}>{competitionName(current, t)}</h1>
      <p className={`text-muted ${wide ? 'text-sm' : 'mb-5'}`}>
        {t('home.sub', { country: t('country.' + current.country) })} · <span className="whitespace-nowrap">{t('home.tz')}</span>
      </p>
    </>
  )
  const chips = (
    <div className={`no-scrollbar flex gap-2 overflow-x-auto pb-1 ${wide ? '' : '-mx-4 mb-4 px-4 sm:mx-0 sm:px-0'}`}>
      {COMPETITIONS.map((c) => (
        <Chip key={c.code} emblem={c.emblem} label={competitionName(c, t)} active={code === c.code} onClick={() => pick(c.code)} />
      ))}
    </div>
  )

  if (!wide) {
    return (
      <>
        {title}
        {chips}
        <div className="mb-6"><SearchFilter search={search} onSearch={setSearch} /></div>
        <LeagueMatches code={code} search={search} />
      </>
    )
  }

  const featured = id ? null : featuredMatch(list.data)
  const shownId = id ? Number(id) : featured?.match.id ?? null
  const shown = id ? selected.data : featured?.match
  const highlight = shown ? [shown.homeTeam?.id, shown.awayTeam?.id] : []

  return (
    // Fills the viewport below the sticky header (--hdr is measured by the Header); the page itself barely scrolls.
    <div className="flex h-[calc(100dvh-var(--hdr,64px)-2rem)] min-h-[560px] flex-col gap-3">
      <div className="shrink-0 space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3">{title}</div>
        {chips}
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(300px,350px)_minmax(0,1fr)] min-[1360px]:grid-cols-[minmax(310px,360px)_minmax(0,1fr)_minmax(360px,420px)]">
        <aside className="flex min-h-0 flex-col rounded-xl bg-card shadow-sm">
          <div className="shrink-0 p-3"><SearchFilter search={search} onSearch={setSearch} /></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <ListContext.Provider value={{ dense: true, selectedId: shownId }}>
              <LeagueMatches code={code} search={search} />
            </ListContext.Provider>
          </div>
        </aside>

        {/* keyed by match: a new match starts scrolled to the top */}
        <section key={shownId ?? 'none'} className="min-h-0 overflow-y-auto pr-1">
          {featured && (
            <p className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${featured.kind === 'live' ? 'text-red-500' : 'text-primary'}`}>
              {t('feat.' + featured.kind)}
            </p>
          )}
          {id || featured
            ? <MatchPanel id={shownId} initial={id ? null : featured.match} squadsOnDemand={!id} />
            : list.loading
              ? <div className="h-72 animate-pulse rounded-xl bg-card" />
              : <p className="py-16 text-center text-muted">{t('shell.none')}</p>}
        </section>

        <aside className="hidden min-h-0 overflow-y-auto min-[1360px]:block">
          <StandingsMini code={code} highlight={highlight} />
        </aside>
      </div>
    </div>
  )
}
