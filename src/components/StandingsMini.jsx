import { Link } from 'react-router-dom'
import { Rank } from './Standings.jsx'
import useApi from '../utils/useApi.js'
import { fetchStandings } from '../services/api.js'
import { useLang } from '../utils/i18n.jsx'

// Compact league table for the desktop side column. Shares the ['standings', code] cache entry with the
// position chips on match cards and the Standings tab, so it costs no extra request.
// Teams of the match shown in the centre (`highlight`) are outlined.
export default function StandingsMini({ code, highlight = [] }) {
  const { t } = useLang()
  const r = useApi(['standings', code], () => fetchStandings(code), { enabled: Boolean(code) })
  const groups = (r.data || []).filter((s) => s.type === 'TOTAL')

  return (
    <section className="rounded-xl bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2 px-1">
        <h2 className="text-base font-extrabold">{t('tab.Standings')}</h2>
        <Link to={`/leagues/${code}`} className="text-xs font-semibold text-primary hover:underline">{t('sm.full')}</Link>
      </div>
      {r.loading && <div className="h-96 animate-pulse rounded-lg bg-subtle" role="status" aria-label={t('loading')} />}
      {!r.loading && !groups.length && <p className="py-6 text-center text-sm text-muted">{t('st.none')}</p>}
      {groups.map((g, i) => {
        const podium = g.table.length > 8 ? 3 : 2
        return (
          <table key={g.group || i} className="mb-2 w-full table-fixed text-xs">
            {/* fixed numeric columns so longer headers (e.g. Vietnamese "Trận", "Điểm") never squeeze the team name */}
            <colgroup><col className="w-9" /><col /><col className="w-11" /><col className="w-9" /><col className="w-12" /></colgroup>
            {groups.length > 1 && g.group && <caption className="px-1 pb-1 text-left text-xs font-bold text-muted">{g.group.replace('_', ' ')}</caption>}
            <thead className="text-left uppercase text-muted">
              <tr>
                <th className="py-1.5 pl-1 font-semibold">#</th>
                <th className="py-1.5 font-semibold">{t('st.team')}</th>
                <th className="px-1 py-1.5 text-center font-semibold">{t('st.P')}</th>
                <th className="px-1 py-1.5 text-center font-semibold">{t('st.GD')}</th>
                <th className="py-1.5 pr-1 text-center font-semibold">{t('st.Pts')}</th>
              </tr>
            </thead>
            <tbody>
              {g.table.map((row) => (
                <tr key={row.team.id}
                  className={`border-t border-line ${highlight.includes(row.team.id) ? 'bg-primary/15' : row.position === 1 && podium === 3 ? 'bg-primary/5' : ''}`}>
                  <td className="py-1 pl-1"><Rank n={row.position} podium={podium} /></td>
                  <td className="py-1">
                    <Link to={`/teams/${row.team.id}`} className="flex items-center gap-1.5 hover:text-primary">
                      {row.team.crest && <img src={row.team.crest} alt="" loading="lazy" className="h-4 w-4 shrink-0 object-contain" />}
                      <span className="truncate font-medium">{row.team.shortName || row.team.name}</span>
                    </Link>
                  </td>
                  <td className="px-1 text-center tabular-nums">{row.playedGames}</td>
                  <td className="px-1 text-center tabular-nums">{row.goalDifference}</td>
                  <td className="pr-1 text-center font-bold tabular-nums">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      })}
    </section>
  )
}
