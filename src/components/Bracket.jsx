import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { buildBracket } from '../utils/bracket.js'
import { formatDate, formatTime, stageLabel } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const Crest = ({ team }) =>
  team.crest
    ? <img src={team.crest} alt="" loading="lazy" className="h-5 w-5 shrink-0 object-contain" />
    : <span className="h-5 w-5 shrink-0 rounded-full bg-subtle" />

// One side of a tie card: crest, name and (once the tie is decided) the aggregate score, bold for the winner.
function TieSide({ team, score, winner, decided, border }) {
  return (
    <div className={`flex items-center justify-between gap-2 px-3 py-2 ${border ? 'border-b border-line' : ''}`}>
      <span className="flex min-w-0 items-center gap-2">
        <Crest team={team} />
        <span className={`truncate text-sm ${winner ? 'font-bold' : decided ? 'text-muted' : 'font-medium'}`}>
          {team.shortName || team.name}
        </span>
      </span>
      {score != null && <span className={`shrink-0 text-sm tabular-nums ${winner ? 'font-bold text-primary' : ''}`}>{score}</span>}
    </div>
  )
}

// A tie as a small card: both clubs on top (aggregate score once decided), each leg's own result or
// kickoff underneath. Links to the leg's match page, same as any other score in the app.
function TieCard({ tie }) {
  const { t } = useLang()
  const { teamA, teamB, legs, aggA, aggB, winnerId, live } = tie
  const decided = winnerId != null
  const twoLegs = legs.length > 1

  return (
    <div className={`w-60 shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm transition ${live ? 'border-red-500/60 shadow-red-500/10' : 'border-line'}`}>
      <TieSide team={teamA} score={decided ? aggA : null} winner={decided && winnerId === teamA.id} decided={decided} border />
      <TieSide team={teamB} score={decided ? aggB : null} winner={decided && winnerId === teamB.id} decided={decided} />
      <div className="space-y-1 border-t border-line bg-subtle/60 px-3 py-1.5">
        {legs.map((leg, i) => {
          const ft = leg.score?.fullTime
          const played = ft?.home != null
          const aOnHomeSide = leg.homeTeam.id === teamA.id
          return (
            <Link key={leg.id} to={`/matches/${leg.id}`} className="flex items-center justify-between gap-2 text-[11px] text-muted transition hover:text-primary">
              <span>{twoLegs ? t('br.leg', { n: i + 1 }) : formatDate(leg.utcDate)}</span>
              <span className="tabular-nums">
                {played ? `${aOnHomeSide ? ft.home : ft.away} – ${aOnHomeSide ? ft.away : ft.home}` : formatTime(leg.utcDate)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Knockout stages of a competition's season as bracket columns, each tie showing both legs aggregated into
 * one score. Built entirely from the season's match list (already loaded by LeagueMatches for every mode
 * but "soon"), so switching to this tab costs no request of its own.
 *
 * What this does not attempt: drawing the lines connecting one round's ties to the next. The data states
 * each match's stage but never which later tie a given winner is drawn into, so columns are laid out in
 * kickoff order and left unconnected rather than guessing a pairing that could just as easily be wrong.
 */
export default function Bracket({ matches }) {
  const { t } = useLang()
  const { columns, thirdPlace } = useMemo(() => buildBracket(matches, t), [matches, t])

  return (
    <div className="space-y-8">
      <div className="flex gap-6 overflow-x-auto pb-2">
        {columns.map((col) => (
          <div key={col.stage} className="flex min-w-[15rem] shrink-0 flex-col gap-4">
            <h3 className="text-center text-xs font-bold uppercase tracking-wide text-muted">{col.label}</h3>
            <div className="flex flex-1 flex-col justify-around gap-4">
              {col.ties.map((tie) => <TieCard key={tie.key} tie={tie} />)}
            </div>
          </div>
        ))}
      </div>
      {thirdPlace && (
        <div className="border-t border-line pt-5">
          <h3 className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted">{stageLabel('THIRD_PLACE', t)}</h3>
          <div className="flex justify-center"><TieCard tie={thirdPlace} /></div>
        </div>
      )}
    </div>
  )
}
