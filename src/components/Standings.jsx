import { Link } from 'react-router-dom'
import { useLang } from '../utils/i18n.jsx'

const Crest = ({ src }) =>
  src ? <img src={src} alt="" loading="lazy" className="h-6 w-6 object-contain" /> : <span className="h-6 w-6" />

// League table(s). Cup-style competitions return several groups.
export default function Standings({ standings }) {
  const { t } = useLang()
  const groups = standings.filter((s) => s.type === 'TOTAL')
  if (!groups.length) return <p className="py-12 text-center text-muted">{t('st.none')}</p>
  return (
    <div className="space-y-6">
      {groups.map((g, i) => (
        <div key={g.group || i} className="animate-fade-in overflow-x-auto rounded-xl bg-card shadow-sm">
          {g.group && <h2 className="px-4 pt-4 font-bold">{g.group.replace('_', ' ')}</h2>}
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-3">#</th><th className="py-3">{t('st.team')}</th>
                {['P', 'W', 'D', 'L', 'GD'].map((h) => <th key={h} className="px-2 py-3 text-center">{t('st.' + h)}</th>)}
                <th className="px-3 py-3 text-center">{t('st.Pts')}</th>
              </tr>
            </thead>
            <tbody>
              {g.table.map((r) => (
                <tr key={r.team.id} className="border-t border-line transition hover:bg-subtle">
                  <td className="px-3 py-2 font-semibold">{r.position}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}


