import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import LeagueMatches from '../components/LeagueMatches.jsx'
import Standings from '../components/Standings.jsx'
import Scorers from '../components/Scorers.jsx'
import TeamGrid from '../components/TeamGrid.jsx'
import NotFound from './NotFound.jsx'
import { competitionName } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'
import useApi from '../utils/useApi.js'
import { COMPETITIONS, fetchCompetition, fetchStandings, fetchScorers, fetchTeams } from '../services/api.js'

const TABS = ['Matches', 'Standings', 'Scorers', 'Teams']
const SEASONS_SHOWN = 4 // the free plan only covers the last few seasons

// Generic tab: loads data then renders `render(data)`. `season` (start year) is part of the cache key only when set,
// so the current season keeps sharing its cache entry with the rest of the app.
function DataTab({ name, loader, code, season, render }) {
  const r = useApi(season ? [name, code, season] : [name, code], () => loader(code, season))
  return <AsyncBoundary {...r}>{r.data && <div className="animate-fade-in">{render(r.data)}</div>}</AsyncBoundary>
}

const seasonLabel = (s) => {
  const a = s.startDate.slice(0, 4), b = s.endDate.slice(0, 4)
  return a === b ? a : `${a}/${b.slice(2)}`
}

// Season dropdown for tables and scorers. The season list comes from /competitions/{code} (cached for a day);
// until it loads, or if it fails, the picker simply stays hidden.
function SeasonSelect({ code, value, onChange }) {
  const { t } = useLang()
  const r = useApi(['competition', code], () => fetchCompetition(code))
  const seasons = (r.data?.seasons || []).slice(0, SEASONS_SHOWN)
  if (seasons.length < 2) return null
  return (
    <label className="mb-4 flex items-center gap-2 text-sm text-muted">
      {t('season.label')}
      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}
        className="h-9 rounded-full border border-line bg-card px-3 text-sm font-semibold text-main outline-none focus:border-primary">
        {seasons.map((s, i) => (
          <option key={s.id} value={i === 0 ? '' : s.startDate.slice(0, 4)}>{seasonLabel(s)}</option>
        ))}
      </select>
    </label>
  )
}

export default function Competition() {
  const { t } = useLang()
  const { code } = useParams()
  const [tab, setTab] = useState('Matches')
  // Chosen season (start year) for Standings / Scorers; null = current. Reset when the league changes.
  const [pick, setPick] = useState({ code, season: null })
  const season = pick.code === code ? pick.season : null
  const comp = COMPETITIONS.find((c) => c.code === code)
  if (!comp) return <NotFound />

  const seasonPicker = <SeasonSelect code={code} value={season} onChange={(s) => setPick({ code, season: s })} />

  return (
    <>
      <Link to="/leagues" className="text-sm text-primary hover:underline">{t('comp.back')}</Link>
      <h1 className="mb-4 mt-1 text-3xl font-extrabold tracking-tight">{competitionName(comp, t)}</h1>
      <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition duration-300 ${tab === tb ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'}`}>
            {t('tab.' + tb)}
          </button>
        ))}
      </div>
      {tab === 'Matches' && <LeagueMatches code={code} />}
      {tab === 'Standings' && (
        <>
          {seasonPicker}
          {/* Form is computed from the current season's matches, so it is only shown for the current season. */}
          <DataTab name="standings" loader={fetchStandings} code={code} season={season}
            render={(d) => <Standings standings={d} code={season ? undefined : code} />} />
        </>
      )}
      {tab === 'Scorers' && (
        <>
          {seasonPicker}
          <DataTab name="scorers" loader={fetchScorers} code={code} season={season} render={(d) => <Scorers scorers={d} />} />
        </>
      )}
      {tab === 'Teams' && <DataTab name="teams" loader={fetchTeams} code={code} render={(d) => <TeamGrid teams={d} />} />}
    </>
  )
}
