import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import MatchList from '../components/MatchList.jsx'
import Standings from '../components/Standings.jsx'
import Scorers from '../components/Scorers.jsx'
import TeamGrid from '../components/TeamGrid.jsx'
import useAsync from '../utils/useAsync.js'
import {
  COMPETITIONS, fetchCompetitionMatches, fetchStandings, fetchScorers, fetchTeams,
} from '../services/api.js'

const TABS = ['Matches', 'Standings', 'Scorers', 'Teams']
const UPCOMING = ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED']

// Matches tab: toggle between upcoming fixtures and latest results.
function MatchesTab({ code }) {
  const [mode, setMode] = useState('upcoming')
  const r = useAsync(() => fetchCompetitionMatches(code), [code])
  return (
    <AsyncBoundary {...r}>
      {r.data && (() => {
        const sorted = [...r.data].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
        const upcoming = sorted.filter((m) => UPCOMING.includes(m.status)).slice(0, 30)
        const results = sorted.filter((m) => m.status === 'FINISHED').slice(-30)
        const list = mode === 'upcoming' ? upcoming : results
        return (
          <>
            <div className="mb-4 flex gap-2">
              {['upcoming', 'results'].map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${mode === m ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                  {m}
                </button>
              ))}
            </div>
            {list.length ? <MatchList matches={list} /> : <p className="py-12 text-center text-gray-500">No matches to show.</p>}
          </>
        )
      })()}
    </AsyncBoundary>
  )
}

// Generic tab: loads data then renders `render(data)`.
function DataTab({ loader, code, render }) {
  const r = useAsync(() => loader(code), [code])
  return <AsyncBoundary {...r}>{r.data && render(r.data)}</AsyncBoundary>
}

export default function Competition() {
  const { code } = useParams()
  const [tab, setTab] = useState('Matches')
  const comp = COMPETITIONS.find((c) => c.code === code)

  return (
    <>
      <Link to="/leagues" className="text-sm text-primary hover:underline">← All leagues</Link>
      <h1 className="mb-4 mt-1 text-3xl font-bold">{comp ? comp.name : code}</h1>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'Matches' && <MatchesTab code={code} />}
      {tab === 'Standings' && <DataTab loader={fetchStandings} code={code} render={(d) => <Standings standings={d} />} />}
      {tab === 'Scorers' && <DataTab loader={fetchScorers} code={code} render={(d) => <Scorers scorers={d} />} />}
      {tab === 'Teams' && <DataTab loader={fetchTeams} code={code} render={(d) => <TeamGrid teams={d} />} />}
    </>
  )
}
