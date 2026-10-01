import { Link, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import TeamSquad from '../components/TeamSquad.jsx'
import Countdown from '../components/Countdown.jsx'
import useApi from '../utils/useApi.js'
import { fetchMatch } from '../services/api.js'
import { formatDate, formatTime, statusInfo } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const Side = ({ team }) => (
  <Link to={`/teams/${team.id}`} className="flex w-1/3 flex-col items-center gap-2 text-center hover:text-primary">
    {team.crest && <img src={team.crest} alt="" className="h-20 w-20 object-contain" />}
    <span className="font-bold">{team.name}</span>
  </Link>
)

// Single match: teams, score/kickoff, venue-ish info and referees.
export default function MatchDetail() {
  const { t } = useLang()
  const { id } = useParams()
  const r = useApi(['match', id], () => fetchMatch(id))
  const m = r.data
  const st = m && statusInfo(m.status, t)
  const ft = m?.score?.fullTime
  const ht = m?.score?.halfTime

  return (
    <>
      <Link to="/" className="text-sm text-primary hover:underline">{t('md.back')}</Link>
      <div className="mt-3">
        <AsyncBoundary {...r}>
          {m && (
            <div className="space-y-6">
            <div className="animate-fade-in rounded-xl bg-card p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                <Link to={`/leagues/${m.competition.code}`} className="font-medium text-muted hover:text-primary">
                  {m.competition.name}{m.matchday ? ` · ${t('md.matchday', { n: m.matchday })}` : ''}
                </Link>
                <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <Side team={m.homeTeam} />
                <div className="text-center">
                  {ft?.home != null
                    ? <p className="text-4xl font-bold">{ft.home} – {ft.away}</p>
                    : <p className="text-3xl font-bold text-primary">{formatTime(m.utcDate)}</p>}
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

            {/* Squads of both teams, side by side on desktop, stacked on mobile */}
            <div className="animate-fade-in">
              <h2 className="mb-3 text-xl font-extrabold">{t('md.squads')}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TeamSquad team={m.homeTeam} code={m.competition.code} />
                <TeamSquad team={m.awayTeam} code={m.competition.code} />
              </div>
            </div>
            </div>
          )}
        </AsyncBoundary>
      </div>
    </>
  )
}




