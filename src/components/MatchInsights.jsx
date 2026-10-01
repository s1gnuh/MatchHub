import { Link } from 'react-router-dom'
import FormDots from './FormDots.jsx'
import useApi from '../utils/useApi.js'
import { fetchCompetitionMatches, fetchHead2Head } from '../services/api.js'
import { headToHead, recentForm, resultFor } from '../utils/form.js'
import { formatDateFull } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const name = (team) => team.shortName || team.name

// Recent form of both teams, plus their head-to-head record.
// Form and the in-season meetings come from the competition's cached match list. The multi-season record comes
// from /matches/{id}/head2head (1 request, cached for hours), which lists meetings across the seasons the free
// plan covers. If that request fails or lists nothing we keep the in-season view.
export default function MatchInsights({ match }) {
  const { t } = useLang()
  const { homeTeam: home, awayTeam: away } = match
  const list = useApi(['matches', match.competition.code], () => fetchCompetitionMatches(match.competition.code))
  const h2h = useApi(['h2h', String(match.id)], () => fetchHead2Head(match.id))

  if (list.loading && h2h.loading) return <div className="h-40 animate-pulse rounded-xl bg-card" role="status" aria-label={t('loading')} />
  if (!list.data && !h2h.data) return null // insights are optional: stay quiet on errors

  // Multi-season meetings from the API when it lists any, otherwise this season's meetings from the cached list.
  // The API's own `aggregates` are not used: on the free plan their win/draw/loss counts do not add up.
  const apiMeetings = (h2h.data?.matches || [])
    .filter((m) => m.status === 'FINISHED' && m.score?.fullTime?.home != null && m.id !== match.id)
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
  const fromApi = apiMeetings.length > 0
  const meetings = fromApi ? apiMeetings : list.data ? headToHead(list.data, home.id, away.id, match.id) : []

  const winsOf = (id) => meetings.filter((m) => resultFor(m, id) === 'W').length
  const draws = meetings.filter((m) => m.score.winner === 'DRAW').length
  const total = meetings.length

  return (
    <div className="grid animate-fade-in grid-cols-1 gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-lg font-extrabold">{t('mi.form')}</h2>
        {list.data ? (
          <>
            <ul className="space-y-3">
              {[home, away].map((tm) => (
                <li key={tm.id} className="flex items-center justify-between gap-3">
                  <Link to={`/teams/${tm.id}`} className="truncate text-sm font-semibold hover:text-primary">{name(tm)}</Link>
                  <FormDots form={recentForm(list.data, tm.id)} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{t('mi.formNote')}</p>
          </>
        ) : <p className="py-4 text-center text-sm text-muted">–</p>}
      </section>

      <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold">{t('mi.h2h')}</h2>
          {total > 0 && <span className="text-xs text-muted">{fromApi ? t('mi.h2hLast', { n: total }) : t('mi.h2hSeason')}</span>}
        </div>
        {total === 0 ? (
          <p className="py-4 text-center text-sm text-muted">{t('mi.noH2h')}</p>
        ) : (
          <>
            <div className="mb-3 grid grid-cols-3 text-center">
              <div><p className="text-2xl font-extrabold">{winsOf(home.id)}</p><p className="truncate text-xs text-muted">{name(home)}</p></div>
              <div><p className="text-2xl font-extrabold text-muted">{draws}</p><p className="text-xs text-muted">{t('mi.draws')}</p></div>
              <div><p className="text-2xl font-extrabold">{winsOf(away.id)}</p><p className="truncate text-xs text-muted">{name(away)}</p></div>
            </div>
            <ul className="divide-y divide-line">
              {meetings.map((m) => (
                <li key={m.id}>
                  <Link to={`/matches/${m.id}`} className="flex items-center justify-between gap-3 py-1.5 text-sm hover:text-primary">
                    <span className="shrink-0 text-xs text-muted">{formatDateFull(m.utcDate)}</span>
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
