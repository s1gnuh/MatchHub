import { Link } from 'react-router-dom'
import AsyncBoundary from './AsyncBoundary.jsx'
import useApi from '../utils/useApi.js'
import { fetchTeam, fetchTeams } from '../services/api.js'
import { ageFrom } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence']

// Squad of one team grouped by position. The competition's teams list already contains every
// squad and is shared by all matches of that league (and the Teams tab), so one request covers
// both sides. Only if the team is missing there do we fall back to a per-team request.
export default function TeamSquad({ team, code }) {
  const { t } = useLang()
  const teams = useApi(['teams', code], () => fetchTeams(code), { enabled: Boolean(code) })
  const fromList = teams.data?.find((x) => x.id === team.id)
  const listed = Boolean(fromList?.squad?.length)
  const needTeam = !teams.loading && !listed
  const single = useApi(['team', String(team.id)], () => fetchTeam(team.id), { enabled: needTeam })
  const data = listed ? fromList : single.data
  const r = listed
    ? { data, loading: false, error: null, retry: teams.retry }
    : { ...single, loading: teams.loading || single.loading }

  const groups = (data?.squad || []).reduce((acc, p) => {
    const k = p.position || 'Other'
    ;(acc[k] ||= []).push(p)
    return acc
  }, {})
  const positions = Object.keys(groups).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  return (
    <section className="rounded-xl bg-card p-4 shadow-sm sm:p-5">
      <Link to={`/teams/${team.id}`} className="mb-4 flex items-center gap-3 hover:text-primary">
        {team.crest && <img src={team.crest} alt="" className="h-8 w-8 object-contain" />}
        <h2 className="text-lg font-bold">{team.name}</h2>
      </Link>

      <AsyncBoundary {...r}>
        {data && (
          positions.length === 0 ? (
            <p className="py-6 text-center text-muted">{t('md.noSquad')}</p>
          ) : (
            <div className="space-y-4">
              {data.coach?.name && (
                <p className="text-sm text-muted">{t('td.coach')}: <b className="text-main">{data.coach.name}</b></p>
              )}
              {positions.map((pos) => (
                <div key={pos}>
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-primary">{t('pos.' + pos)}</h3>
                  <ul className="divide-y divide-line">
                    {groups[pos].map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                        <Link to={`/players/${p.id}`} className="truncate font-medium hover:text-primary">{p.name}</Link>
                        <span className="shrink-0 text-xs text-muted">
                          {ageFrom(p.dateOfBirth) != null && `${ageFrom(p.dateOfBirth)} · `}{p.nationality}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        )}
      </AsyncBoundary>
    </section>
  )
}
