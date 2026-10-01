import { Link, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import useAsync from '../utils/useAsync.js'
import { fetchMatch } from '../services/api.js'
import { formatDate, formatTime, statusInfo } from '../utils/helpers.js'

const Side = ({ team }) => (
  <Link to={`/teams/${team.id}`} className="flex w-1/3 flex-col items-center gap-2 text-center hover:text-primary">
    {team.crest && <img src={team.crest} alt="" className="h-20 w-20 object-contain" />}
    <span className="font-bold">{team.name}</span>
  </Link>
)

// Single match: teams, score/kickoff, venue-ish info and referees.
export default function MatchDetail() {
  const { id } = useParams()
  const r = useAsync(() => fetchMatch(id), [id])
  const m = r.data
  const st = m && statusInfo(m.status)
  const ft = m?.score?.fullTime
  const ht = m?.score?.halfTime

  return (
    <>
      <Link to="/" className="text-sm text-primary hover:underline">← Back to matches</Link>
      <div className="mt-3">
        <AsyncBoundary {...r}>
          {m && (
            <div className="animate-fade-in rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <Link to={`/leagues/${m.competition.code}`} className="font-medium text-gray-500 hover:text-primary">
                  {m.competition.name}{m.matchday ? ` · Matchday ${m.matchday}` : ''}
                </Link>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <Side team={m.homeTeam} />
                <div className="text-center">
                  {ft?.home != null
                    ? <p className="text-4xl font-bold">{ft.home} – {ft.away}</p>
                    : <p className="text-3xl font-bold text-primary">{formatTime(m.utcDate)}</p>}
                  <p className="mt-1 text-sm text-gray-500">{formatDate(m.utcDate)}</p>
                  {ht?.home != null && <p className="text-xs text-gray-400">HT {ht.home} – {ht.away}</p>}
                </div>
                <Side team={m.awayTeam} />
              </div>
              {(m.venue || m.referees?.length > 0) && (
                <dl className="mt-6 grid gap-2 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
                  {m.venue && <div><dt className="text-gray-500">Venue</dt><dd className="font-medium">{m.venue}</dd></div>}
                  {m.referees?.length > 0 && <div><dt className="text-gray-500">Referee</dt><dd className="font-medium">{m.referees[0].name}</dd></div>}
                </dl>
              )}
            </div>
          )}
        </AsyncBoundary>
      </div>
    </>
  )
}
