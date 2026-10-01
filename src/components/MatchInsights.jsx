import { Link } from 'react-router-dom'
import FormDots from './FormDots.jsx'
import useApi from '../utils/useApi.js'
import { fetchCompetitionMatches } from '../services/api.js'
import { headToHead, recentForm, resultFor } from '../utils/form.js'
import { formatDate } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const name = (team) => team.shortName || team.name

// Recent form of both teams and their earlier meetings this season in the same competition.
// Everything comes from the competition's match list, which is cached and shared with the league page.
export default function MatchInsights({ match }) {
  const { t } = useLang()
  const { homeTeam: home, awayTeam: away } = match
  const r = useApi(['matches', match.competition.code], () => fetchCompetitionMatches(match.competition.code))

  if (r.loading) return <div className="h-40 animate-pulse rounded-xl bg-card" role="status" aria-label={t('loading')} />
  if (!r.data) return null // insights are optional: stay quiet on errors

  const meetings = headToHead(r.data, home.id, away.id, match.id)
  const wins = (id) => meetings.filter((m) => resultFor(m, id) === 'W').length
  const draws = meetings.filter((m) => m.score.winner === 'DRAW').length

  return (
    <div className="grid animate-fade-in grid-cols-1 gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-lg font-extrabold">{t('mi.form')}</h2>
        <ul className="space-y-3">
          {[home, away].map((tm) => (
            <li key={tm.id} className="flex items-center justify-between gap-3">
              <Link to={`/teams/${tm.id}`} className="truncate text-sm font-semibold hover:text-primary">{name(tm)}</Link>
              <FormDots form={recentForm(r.data, tm.id)} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{t('mi.formNote')}</p>
      </section>

      <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-lg font-extrabold">{t('mi.h2h')}</h2>
        {meetings.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">{t('mi.noH2h')}</p>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-3 text-center">
              <div><p className="text-2xl font-extrabold">{wins(home.id)}</p><p className="truncate text-xs text-muted">{name(home)}</p></div>
              <div><p className="text-2xl font-extrabold text-muted">{draws}</p><p className="text-xs text-muted">{t('mi.draws')}</p></div>
              <div><p className="text-2xl font-extrabold">{wins(away.id)}</p><p className="truncate text-xs text-muted">{name(away)}</p></div>
            </div>
            <ul className="divide-y divide-line">
              {meetings.map((m) => (
                <li key={m.id}>
                  <Link to={`/matches/${m.id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-primary">
                    <span className="shrink-0 text-xs text-muted">{formatDate(m.utcDate)}</span>
                    <span className="truncate">{name(m.homeTeam)}</span>
                    <b className="shrink-0 tabular-nums">{m.score.fullTime.home} – {m.score.fullTime.away}</b>
                    <span className="truncate text-right">{name(m.awayTeam)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
