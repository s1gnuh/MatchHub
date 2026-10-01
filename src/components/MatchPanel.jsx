import { useState } from 'react'
import { Link } from 'react-router-dom'
import AsyncBoundary from './AsyncBoundary.jsx'
import TeamSquad from './TeamSquad.jsx'
import Countdown from './Countdown.jsx'
import MatchInsights from './MatchInsights.jsx'
import LazyMount from './LazyMount.jsx'
import useMatch from '../utils/useMatch.js'
import { formatDate, formatTime, statusInfo, stageLabel } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const Side = ({ team }) => (
  <Link to={`/teams/${team.id}`} className="flex w-1/3 flex-col items-center gap-2 text-center hover:text-primary">
    {team.crest && <img src={team.crest} alt="" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />}
    <span className="font-bold">{team.name}</span>
  </Link>
)

// Everything about one match: score / kickoff, referee, form, head to head and both squads.
// Used by the match page (phones) and the centre column of the desktop layout.
// Request cost: the match comes from an already loaded list when possible (see useMatch); squads load only when
// scrolled into view (one shared request per league, cached for a day), or only on a click with `squadsOnDemand`
// (the desktop default view, which the visitor did not pick); earlier-season meetings only on demand.
export default function MatchPanel({ id, initial = null, squadsOnDemand = false }) {
  const { t } = useLang()
  const [squadsWanted, setSquadsWanted] = useState(false)
  const r = useMatch(id, initial)
  const m = r.data
  const st = m && statusInfo(m.status, t)
  const ft = m?.score?.fullTime
  const ht = m?.score?.halfTime
  const pens = m?.score?.penalties
  // Matchday numbers only mean something in league-style phases, not in knockout rounds.
  const showMatchday = Boolean(m?.matchday) && ['REGULAR_SEASON', 'LEAGUE_STAGE', 'GROUP_STAGE'].includes(m.stage)

  return (
    <AsyncBoundary {...r}>
      {m && (
        <div className="space-y-6">
          <div className="animate-fade-in rounded-xl bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              <Link to={`/leagues/${m.competition.code}`} className="font-medium text-muted hover:text-primary">
                {[m.competition.name, stageLabel(m.stage, t), showMatchday && t('md.matchday', { n: m.matchday })].filter(Boolean).join(' · ')}
              </Link>
              <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <Side team={m.homeTeam} />
              <div className="text-center">
                {ft?.home != null
                  ? <p className="text-4xl font-bold">{ft.home} – {ft.away}</p>
                  : <p className="text-3xl font-bold text-primary">{formatTime(m.utcDate)}</p>}
                {ft?.home != null && m.score.duration === 'EXTRA_TIME' && (
                  <p className="mt-1 text-sm font-semibold text-primary">{t('md.aet')}</p>
                )}
                {ft?.home != null && m.score.duration === 'PENALTY_SHOOTOUT' && (
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {pens?.home != null ? t('md.pens', { h: pens.home, a: pens.away }) : t('md.penShort')}
                  </p>
                )}
                <p className="mt-1 text-sm text-muted">{formatDate(m.utcDate)}</p>
                {(m.status === 'TIMED' || m.status === 'SCHEDULED') && (
                  <Countdown utcDate={m.utcDate} className="mt-1 block text-sm font-semibold text-primary" />
                )}
                {ht?.home != null && <p className="text-xs text-muted">{t('md.ht', { h: ht.home, a: ht.away })}</p>}
              </div>
              <Side team={m.awayTeam} />
            </div>
            {(m.venue || m.referees?.length > 0) && (
              <dl className="mt-6 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
                {m.venue && <div><dt className="text-muted">{t('md.venue')}</dt><dd className="font-medium">{m.venue}</dd></div>}
                {m.referees?.length > 0 && <div><dt className="text-muted">{t('md.referee')}</dt><dd className="font-medium">{m.referees[0].name}</dd></div>}
              </dl>
            )}
          </div>

          {/* keyed by match so "show earlier seasons" resets when another match is opened */}
          <MatchInsights key={m.id} match={m} />

          {/* Squads of both teams, side by side on wider screens, stacked on phones */}
          <div className="animate-fade-in">
            <h2 className="mb-3 text-xl font-extrabold">{t('md.squads')}</h2>
            {squadsOnDemand && !squadsWanted ? (
              <button onClick={() => setSquadsWanted(true)}
                className="w-full rounded-xl border border-line bg-card py-4 text-sm font-semibold text-primary transition hover:border-primary/50 hover:bg-subtle">
                {t('md.showSquads')}
              </button>
            ) : (
              <LazyMount placeholder={<div className="h-64 animate-pulse rounded-xl bg-card" />}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TeamSquad team={m.homeTeam} code={m.competition.code} />
                  <TeamSquad team={m.awayTeam} code={m.competition.code} />
                </div>
              </LazyMount>
            )}
          </div>
        </div>
      )}
    </AsyncBoundary>
  )
}
