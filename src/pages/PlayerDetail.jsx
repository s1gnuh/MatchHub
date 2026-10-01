import { Link, useNavigate, useParams } from 'react-router-dom'
import AsyncBoundary from '../components/AsyncBoundary.jsx'
import useApi from '../utils/useApi.js'
import { fetchPerson } from '../services/api.js'
import { ageFrom, formatDateFull } from '../utils/helpers.js'
import { useLang } from '../utils/i18n.jsx'

const Fact = ({ label, children }) => (
  <div className="rounded-lg bg-subtle px-4 py-3">
    <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
    <dd className="mt-0.5 font-semibold">{children}</dd>
  </div>
)

// Player profile from /persons/{id}: shirt number, position, nationality, age and current team.
export default function PlayerDetail() {
  const { t } = useLang()
  const { id } = useParams()
  const navigate = useNavigate()
  const r = useApi(['person', id], () => fetchPerson(id))
  const p = r.data
  const age = ageFrom(p?.dateOfBirth)
  const team = p?.currentTeam

  return (
    <>
      <button onClick={() => navigate(window.history.state?.idx > 0 ? -1 : '/')} className="text-sm text-primary hover:underline">{t('pl.back')}</button>
      <div className="mt-3">
        <AsyncBoundary {...r}>
          {p && (
            <div className="animate-fade-in space-y-6">
              <div className="flex flex-col items-center gap-5 rounded-xl bg-card p-6 shadow-sm sm:flex-row">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary text-4xl font-extrabold text-black">
                  {p.shirtNumber ?? '?'}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-extrabold">{p.name}</h1>
                  <p className="text-muted">
                    {[p.position && t('pos1.' + p.position), p.nationality].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {p.shirtNumber != null && <Fact label={t('pl.shirt')}>{p.shirtNumber}</Fact>}
                {p.position && <Fact label={t('pl.position')}>{t('pos1.' + p.position)}</Fact>}
                {p.nationality && <Fact label={t('pl.nation')}>{p.nationality}</Fact>}
                {age != null && (
                  <Fact label={t('sc.age')}>
                    {age} <span className="text-sm font-normal text-muted">· {t('pl.born', { d: formatDateFull(p.dateOfBirth) })}</span>
                  </Fact>
                )}
              </dl>

              {team?.id && (
                <Link to={`/teams/${team.id}`} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm transition hover:bg-subtle">
                  {team.crest && <img src={team.crest} alt="" className="h-12 w-12 object-contain" />}
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{t('pl.team')}</p>
                    <p className="text-lg font-bold">{team.name}</p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </AsyncBoundary>
      </div>
    </>
  )
}
