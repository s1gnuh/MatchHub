import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FiCalendar } from 'react-icons/fi'
import SearchFilter from '../components/SearchFilter.jsx'
import ChipRail from '../components/ChipRail.jsx'
import FeaturedMatches from '../components/FeaturedMatches.jsx'
import LeagueMatches from '../components/LeagueMatches.jsx'
import MatchPanel from '../components/MatchPanel.jsx'
import StandingsMini from '../components/StandingsMini.jsx'
import { ListContext } from '../components/ListContext.js'
import MatchDetail from './MatchDetail.jsx'
import useApi from '../utils/useApi.js'
import useMatch from '../utils/useMatch.js'
import useUpcoming from '../utils/useUpcoming.js'
import useMediaQuery, { WIDE } from '../utils/useMediaQuery.js'
import { competitionName, dayKey } from '../utils/helpers.js'
import { hotness } from '../utils/hotness.js'
import { useLang } from '../utils/i18n.jsx'
import { COMPETITIONS, UPCOMING_DAYS, fetchCompetitionMatches, fetchStandings } from '../services/api.js'

// The screen a visitor lands on: the biggest matches of every supported competition rather than one league's
// fixtures. It is not a competition code, so it travels as the absence of ?league=.
const FEATURED = 'FEAT'
const byCode = (code) => COMPETITIONS.find((c) => c.code === code)

// League chip, with the competition's emblem or (for the featured screen) an icon.
function Chip({ emblem, icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-300 active:scale-95 ${active ? 'border-primary bg-primary text-black shadow-lg shadow-primary/30' : 'border-line bg-card text-main hover:border-primary/50 hover:bg-subtle'}`}>
      {icon || (
        <img src={emblem} alt="" className="h-5 w-5 rounded-sm bg-white object-contain p-px"
          onError={(e) => { e.currentTarget.style.display = 'none' }} />
      )}
      {label}
    </button>
  )
}

/** Match to show in the centre column when none is selected: a live one, else the one most people would pick
 * (the biggest when several leagues are in play, the next kickoff within one league), else the latest result. */
function centreMatch(matches, rankByInterest) {
  if (!matches?.length) return null
  const sorted = [...matches].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  const live = sorted.find((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  if (live) return { match: live, kind: 'live' }
  const open = sorted.filter((m) => m.status === 'TIMED' || m.status === 'SCHEDULED')
  if (open.length) {
    if (!rankByInterest) return { match: open[0], kind: 'next' }
    // Prefer today's biggest match over a bigger one a week out, so this column agrees with the list beside
    // it, which opens on today. Only when nothing is left today does it look across the window.
    const today = dayKey(new Date().toISOString())
    const pool = open.filter((m) => dayKey(m.utcDate) === today)
    const from = pool.length ? pool : open
    return { match: from.reduce((a, b) => (hotness(b) > hotness(a) ? b : a)), kind: 'hot' }
  }
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

  // ?league= names a competition; without it the featured screen is shown.
  const league = byCode(params.get('league'))
  const code = league?.code ?? FEATURED
  const feat = code === FEATURED
  const pick = (c) => navigate({ pathname: '/', search: c === FEATURED ? '' : `?league=${c}` }, { replace: !id })

  const selected = useMatch(wide ? id : null)
  // The one request the whole home screen runs on: every competition, the next ten days. Switching league
  // filters it, and opening a match reads it, so neither costs a request.
  const soon = useUpcoming(wide)
  const scoped = useMemo(() => {
    const all = soon.data || []
    return feat ? all : all.filter((m) => m.competition?.code === code)
  }, [soon.data, feat, code])

  // A league can have nothing in the next ten days (winter or international break). Only then, and only for the
  // centre column of the desktop layout, is that league's season worth a request of its own.
  const needSeason = Boolean(wide && !feat && soon.data && !scoped.length)
  const seasonList = useApi(['matches', code], () => fetchCompetitionMatches(code), { enabled: needSeason })
  const pool = needSeason ? seasonList.data : scoped

  // Start the standings request together with the match list (position badges, side table). Without this it only
  // began once the first match card rendered, i.e. one full round trip later. The featured screen shows no
  // position badges, so there it waits for the side table to ask for the league it ends up showing.
  useApi(['standings', code], () => fetchStandings(code), { enabled: !feat && (wide || !id) })

  if (!wide && id) return <MatchDetail />

  const title = feat ? (
    <>
      <h1 className={`font-extrabold tracking-tight ${wide ? 'text-2xl' : 'mb-1 text-3xl'}`}>{t('top.title')}</h1>
      <p className={`text-muted ${wide ? 'text-sm' : 'mb-5'}`}>
        {t('top.sub', { n: UPCOMING_DAYS })} · <span className="whitespace-nowrap">{t('home.tz')}</span>
      </p>
    </>
  ) : (
    <>
      <h1 className={`font-extrabold tracking-tight ${wide ? 'text-2xl' : 'mb-1 text-3xl'}`}>{competitionName(league, t)}</h1>
      <p className={`text-muted ${wide ? 'text-sm' : 'mb-5'}`}>
        {t('home.sub', { country: t('country.' + league.country) })} · <span className="whitespace-nowrap">{t('home.tz')}</span>
      </p>
    </>
  )
  // "All leagues" is pinned: it is the way back to the whole list, so it must not drift out of reach.
  // The competitions beside it ride a rail that scrolls itself — see ChipRail for when it yields.
  const chips = (
    <div className={`flex items-start gap-2 ${wide ? '' : 'mb-4'}`}>
      <Chip icon={<FiCalendar className="h-4 w-4" aria-hidden="true" />} label={t('top.chip')} active={feat} onClick={() => pick(FEATURED)} />
      <ChipRail label={t('leagues.title')} className={wide ? '' : '-mr-4 pr-4 sm:mr-0 sm:pr-0'}>
        {COMPETITIONS.map((c) => (
          <Chip key={c.code} emblem={c.emblem} label={competitionName(c, t)} active={code === c.code} onClick={() => pick(c.code)} />
        ))}
      </ChipRail>
    </div>
  )
  const list = feat ? <FeaturedMatches search={search} /> : <LeagueMatches code={code} search={search} />

  if (!wide) {
    return (
      <>
        {title}
        {chips}
        <div className="mb-6"><SearchFilter search={search} onSearch={setSearch} /></div>
        {/* Several leagues at once: name the competition on every card, and leave out the position chips,
            which would cost one /standings request per league shown. */}
        <ListContext.Provider value={{ dense: false, selectedId: null, showLeague: feat, showDay: false, noRank: feat }}>
          {list}
        </ListContext.Provider>
      </>
    )
  }

  const featured = id ? null : centreMatch(pool, feat)
  // Not coerced to a number: football-data numbers its matches, the Vietnamese provider uses cuids.
  const shownId = id ?? featured?.match.id ?? null
  const shown = id ? selected.data : featured?.match
  const highlight = shown ? [shown.homeTeam?.id, shown.awayTeam?.id] : []
  // The side table follows the league being looked at, or on the featured screen the league of the match shown.
  const tableCode = feat ? shown?.competition?.code : code
  const centreLoading = soon.loading || (needSeason && seasonList.loading)

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
            <ListContext.Provider value={{ dense: true, selectedId: shownId, showLeague: feat, showDay: false, noRank: feat }}>
              {list}
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
            ? <MatchPanel id={shownId} initial={id ? null : featured.match} squadsOnDemand={!id} insightsOnDemand={!id} />
            : centreLoading
              ? <div className="h-72 animate-pulse rounded-xl bg-card" />
              : <p className="py-16 text-center text-muted">{t('shell.none')}</p>}
        </section>

        <aside className="hidden min-h-0 overflow-y-auto min-[1360px]:block">
          {tableCode && <StandingsMini code={tableCode} highlight={highlight} />}
        </aside>
      </div>
    </div>
  )
}
