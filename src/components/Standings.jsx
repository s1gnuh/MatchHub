import { Link } from 'react-router-dom'
import FormDots from './FormDots.jsx'
import useApi from '../utils/useApi.js'
import { fetchCompetitionMatches } from '../services/api.js'
import { recentForm } from '../utils/form.js'
import { useLang } from '../utils/i18n.jsx'

// Rank badge: gold / silver / bronze for the podium, plain number otherwise.
const MEDAL = { 1: 'bg-primary text-black', 2: 'bg-zinc-300 text-black', 3: 'bg-amber-700 text-white' }
const Rank = ({ n, podium }) =>
  n <= podium
    ? <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${MEDAL[n]}`}>{n}</span>
    : <span className="inline-block w-6 text-center">{n}</span>

const Crest =({ src }) =>
  src ? <img src={src} alt="" loading="lazy" className="h-6 w-6 object-contain" /> : <span className="h-6 w-6" />

// League table(s). Cup-style competitions return several groups.
export default function Standings({ standings, code }) {
  const { t } = useLang()
  // Form comes from the league's match list (same cache as the Matches tab). The table never waits for it
  // and simply shows no form column content if that request fails.
  const matches = useApi(['matches', code], () => fetchCompetitionMatches(code), { enabled: Boolean(code) })
  const groups = standings.filter((s) => s.type === 'TOTAL')
  if (!groups.length) return <p className="py-12 text-center text-muted">{t('st.none')}</p>
  return (
    <div className="space-y-6">
      {groups.map((g, i) => {
        // Full league table: top 3 get medals and the leader's row is tinted. Small cup groups: top 2 qualify.
        const league = g.table.length > 8
        const podium = league ? 3 : 2
        return (
        <div key={g.group || i} className="animate-fade-in overflow-x-auto rounded-xl bg-card shadow-sm">
          {g.group && <h2 className="px-4 pt-4 font-bold">{g.group.replace('_', ' ')}</h2>}
          <table className="w-full min-w-[600px] text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-3">#</th><th className="py-3">{t('st.team')}</th>
                {['P', 'W', 'D', 'L', 'GD'].map((h) => <th key={h} className="px-2 py-3 text-center">{t('st.' + h)}</th>)}
                <th className="px-3 py-3 text-center">{t('st.Pts')}</th>
                <th className="px-3 py-3">{t('st.Form')}</th>
              </tr>
            </thead>
            <tbody>
              {g.table.map((r) => (
                <tr key={r.team.id} className={`border-t border-line transition hover:bg-subtle ${league && r.position === 1 ? 'bg-primary/10' : ''}`}>
                  <td className="px-3 py-2 font-semibold"><Rank n={r.position} podium={podium} /></td>
                  <td className="py-2">
                    <Link to={`/teams/${r.team.id}`} className="flex items-center gap-2 hover:text-primary">
                      <Crest src={r.team.crest} />{r.team.shortName || r.team.name}
                    </Link>
                  </td>
                  <td className="px-2 text-center">{r.playedGames}</td>
                  <td className="px-2 text-center">{r.won}</td>
                  <td className="px-2 text-center">{r.draw}</td>
                  <td className="px-2 text-center">{r.lost}</td>
                  <td className="px-2 text-center">{r.goalDifference}</td>
                  <td className="px-3 text-center font-bold">{r.points}</td>
                  <td className="px-3">{matches.data && <FormDots form={recentForm(matches.data, r.team.id)} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )
      })}
    </div>
  )
}


