import { Link } from 'react-router-dom'
import AsyncBoundary from './AsyncBoundary.jsx'
import useApi from '../utils/useApi.js'
import { fetchTeam } from '../services/api.js'
import { useLang } from '../utils/i18n.jsx'

const ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence']

// Squad of one team grouped by position. Uses the same ['team', id] cache as the team page,
// so opening the team page afterwards costs no extra request.
export default function TeamSquad({ team }) {
  const { t } = useLang()
  const r = useApi(['team', String(team.id)], () => fetchTeam(team.id))
  const data = r.data

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
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="shrink-0 text-xs text-muted">{p.nationality}</span>
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
