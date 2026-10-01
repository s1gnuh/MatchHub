import { useContext } from 'react'
import { Link } from 'react-router-dom'
import Countdown, { startsSoon } from './Countdown.jsx'
import { ListContext } from './ListContext.js'
import useTablePositions from '../utils/useTablePositions.js'
import { useLang } from '../utils/i18n.jsx'
import { formatTime, statusInfo, leagueColor, stageLabel, durationBadge, competitionName } from '../utils/helpers.js'

// One team row: crest + name + score (or table position before the match is decided).
function TeamRow({ team, score, bold, rank, rankTitle, small }) {
  const crest = small ? 'h-5 w-5' : 'h-6 w-6'
  return (
    <div className={`flex items-center ${small ? 'gap-2.5' : 'gap-3'}`}>
      {team.crest ? (
        <img src={team.crest} alt="" loading="lazy" className={`${crest} shrink-0 object-contain`} />
      ) : (
        <div className={`${crest} shrink-0 rounded-full bg-subtle`} />
      )}
      <span className={`flex-1 truncate text-sm ${bold ? 'font-bold' : 'font-medium'}`}>{team.shortName || team.name}</span>
      {score != null && <span className={`w-5 text-right text-sm tabular-nums ${bold ? 'font-bold' : ''}`}>{score}</span>}
      {score == null && rank != null && (
        <span title={rankTitle} className="rounded bg-subtle px-1.5 text-[11px] font-semibold tabular-nums text-muted">#{rank}</span>
      )}
    </div>
  )
}

// A match as a SofaScore-style card (time/status on the left, two stacked teams on the right).
// Inside a dense list (desktop side column) it renders as a compact row instead, highlighted when open.
export default function MatchCard({ match, index = 0, today = false }) {
  const { t } = useLang()
  const { dense, selectedId } = useContext(ListContext)
  const { homeTeam, awayTeam, competition, status, utcDate, score } = match
  const st = statusInfo(status, t)
  const full = score?.fullTime
  const played = full && full.home != null
  const live = status === 'IN_PLAY' || status === 'PAUSED'
  // The API's winner field also covers matches settled on penalties, where the full-time score may be level.
  const homeWon = played && (score.winner ? score.winner === 'HOME_TEAM' : full.home > full.away)
  const awayWon = played && (score.winner ? score.winner === 'AWAY_TEAM' : full.away > full.home)
  const extra = played ? durationBadge(score, t) : null
  const stage = stageLabel(match.stage, t)
  // League position of each team, shown until the match is finished (current table, not the one at kickoff).
  const positions = useTablePositions(competition?.code)
  const rankOf = (team) => (status === 'FINISHED' ? null : positions?.get(team.id) ?? null)
  const soon = !played && !live && (status === 'TIMED' || status === 'SCHEDULED') && startsSoon(utcDate)
  const active = selectedId === match.id

  const status_ = (
    <>
      <span className={`flex items-center gap-1.5 font-bold ${dense ? 'text-xs' : 'text-sm'} ${live ? 'text-red-500' : ''}`}>
        {live && (
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        )}
        {played || live ? st.label : formatTime(utcDate)}
      </span>
      {extra && <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">{extra}</span>}
      {soon && <Countdown utcDate={utcDate} className="text-[10px] font-semibold leading-tight text-primary" />}
      {!played && !live && status !== 'TIMED' && status !== 'SCHEDULED' && (
        <span className={`rounded-full px-1.5 text-[10px] font-semibold ${st.cls}`}>{st.label}</span>
      )}
    </>
  )
  const teams = (small) => (
    <>
      <TeamRow team={homeTeam} score={played ? full.home : null} bold={homeWon} small={small}
        rank={rankOf(homeTeam)} rankTitle={t('mc.rank', { n: rankOf(homeTeam) })} />
      <TeamRow team={awayTeam} score={played ? full.away : null} bold={awayWon} small={small}
        rank={rankOf(awayTeam)} rankTitle={t('mc.rank', { n: rankOf(awayTeam) })} />
    </>
  )

  if (dense) {
    return (
      <Link to={`/matches/${match.id}`} aria-current={active ? 'true' : undefined}
        className={`flex items-stretch border-l-2 transition duration-200 ${active ? 'border-primary bg-subtle' : `border-transparent hover:bg-subtle ${today ? 'bg-primary/5' : ''}`}`}>
        <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-0.5 py-2 text-center">{status_}</div>
        <div className="min-w-0 flex-1 space-y-1.5 py-2.5 pr-3">
          {stage && <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted">{stage}</p>}
          {teams(true)}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/matches/${match.id}`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      className={`group block animate-fade-in overflow-hidden rounded-xl border border-line border-l-4 bg-card transition ${today ? 'shadow-md shadow-primary/20 ring-1 ring-primary/40' : 'shadow-sm'} duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 active:scale-[0.99] ${leagueColor(competition?.code)}`}
    >
      <div className="flex items-stretch">
        <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 border-r border-line px-2 py-3 text-center">{status_}</div>
        <div className="min-w-0 flex-1 space-y-2 px-4 py-3">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted">{competitionName(competition, t)}{stage && ` · ${stage}`}</p>
          {teams(false)}
        </div>
      </div>
    </Link>
  )
}
