import { Link, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import useApi from '../utils/useApi.js'
import { fetchTeam } from '../services/api.js'
import { useLang } from '../utils/i18n.jsx'

// Team profile: info, coach and squad grouped by position.
export default function TeamDetail() {
  const { t: tr } = useLang()
  const { id } = useParams()
  const r = useApi(['team', id], () => fetchTeam(id))
  const t = r.data
  const squad = (t?.squad || []).reduce((acc, p) => {
    const k = p.position || 'Other'
    ;(acc[k] ||= []).push(p)
    return acc
  }, {})

  return (
    <>
      <button onClick={() => history.back()} className="text-sm text-primary hover:underline">{tr('td.back')}</button>
      <div className="mt-3">
        <AsyncBoundary {...r}>
          {t && (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-6 shadow-sm sm:flex-row">
                {t.crest && <img src={t.crest} alt="" className="h-24 w-24 object-contain" />}
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold">{t.name}</h1>
                  <p className="text-muted">
                    {[t.area?.name, t.founded && tr('td.founded', { y: t.founded }), t.venue].filter(Boolean).join(' · ')}
                  </p>
                  {t.coach?.name && <p className="mt-1 text-sm">{tr('td.coach')}: <b>{t.coach.name}</b></p>}
                  {t.website && <a href={t.website} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{tr('td.website')}</a>}
                </div>
              </div>
              {t.runningCompetitions?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {t.runningCompetitions.map((c) => (
                    <Link key={c.id} to={`/leagues/${c.code}`} className="rounded-full bg-card px-3 py-1 text-sm shadow-sm hover:bg-subtle">{c.name}</Link>
                  ))}
                </div>
              )}
              {Object.entries(squad).map(([pos, players]) => (
                <section key={pos}>
                  <h2 className="mb-2 text-xl font-bold">{tr('pos.' + pos)}</h2>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {players.map((p) => (
                      <li key={p.id} className="rounded-lg bg-card px-4 py-2 text-sm shadow-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="ml-2 text-muted">{p.nationality}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </AsyncBoundary>
      </div>
    </>
  )
}




