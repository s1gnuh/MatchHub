import { Link } from 'react-router-dom'
import { formatTime, statusInfo, leagueColor } from '../utils/helpers.js'

// One team: crest (if provided) above name.
function Team({ team }) {
  return (
    <div className="flex w-1/3 flex-col items-center gap-2 text-center">
      {team.crest ? (
        <img src={team.crest} alt="" loading="lazy" className="h-12 w-12 object-contain" />
      ) : (
        <div className="h-12 w-12 rounded-full bg-gray-100" />
      )}
      <span className="text-sm font-semibold leading-tight">{team.shortName || team.name}</span>
    </div>
  )
}

// Card for a single match; colour-coded border by league.
export default function MatchCard({ match }) {
  const { homeTeam, awayTeam, competition, status, utcDate, score } = match
  const st = statusInfo(status)
  const full = score?.fullTime
  const hasScore = full && full.home != null

  return (
    <Link to={`/matches/${match.id}`} className="block">
    <article
      className={`animate-fade-in rounded-xl border-t-4 bg-white p-4 shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-lg ${leagueColor(competition?.code)}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium uppercase tracking-wide text-gray-500">
          {competition?.name}
        </span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
      </div>
      <div className="flex items-center justify-between">
        <Team team={homeTeam} />
        <div className="text-center">
          {hasScore ? (
            <span className="text-xl font-bold">{full.home} – {full.away}</span>
          ) : (
            <>
              <span className="block text-xl font-bold text-primary">{formatTime(utcDate)}</span>
              <span className="text-xs text-gray-400">VS</span>
            </>
          )}
        </div>
        <Team team={awayTeam} />
      </div>
    </article>
    </Link>
  )
}

