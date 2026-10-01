import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import LeagueMatches from '../components/LeagueMatches.jsx'
import Standings from '../components/Standings.jsx'
import Scorers from '../components/Scorers.jsx'
import TeamGrid from '../components/TeamGrid.jsx'
import NotFound from './NotFound.jsx'
import { useLang } from '../utils/i18n.jsx'
import useApi from '../utils/useApi.js'
import { COMPETITIONS, fetchStandings, fetchScorers, fetchTeams } from '../services/api.js'

const TABS = ['Matches', 'Standings', 'Scorers', 'Teams']

// Generic tab: loads data then renders `render(data)`.
function DataTab({ name, loader, code, render }) {
  const r = useApi([name, code], () => loader(code))
  return <AsyncBoundary {...r}>{r.data && <div className="animate-fade-in">{render(r.data)}</div>}</AsyncBoundary>
}

export default function Competition() {
  const { t } = useLang()
  const { code } = useParams()
  const [tab, setTab] = useState('Matches')
  const comp = COMPETITIONS.find((c) => c.code === code)
  if (!comp) return <NotFound />

  return (
    <>
      <Link to="/leagues" className="text-sm text-primary hover:underline">{t('comp.back')}</Link>
      <h1 className="mb-4 mt-1 text-3xl font-extrabold tracking-tight">{comp.name}</h1>
      <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition duration-300 ${tab === tb ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-main'}`}>
            {t('tab.' + tb)}
          </button>
        ))}
      </div>
      {tab === 'Matches' && <LeagueMatches code={code} />}
      {tab === 'Standings' && <DataTab name="standings" loader={fetchStandings} code={code} render={(d) => <Standings standings={d} code={code} />} />}
      {tab === 'Scorers' && <DataTab name="scorers" loader={fetchScorers} code={code} render={(d) => <Scorers scorers={d} />} />}
      {tab === 'Teams' && <DataTab name="teams" loader={fetchTeams} code={code} render={(d) => <TeamGrid teams={d} />} />}
    </>
  )
}


