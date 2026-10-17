import { Link } from 'react-router-dom'
import { useLang } from '../utils/i18n.jsx'
import { ageFrom } from '../utils/helpers.js'

/** A link when there is somewhere to go, the text on its own when there is not. */
const Maybe = ({ to, children }) =>
  to ? <Link to={to} className="hover:text-primary">{children}</Link> : <span>{children}</span>

// Top scorers list: age, matches, assists, penalties and goals. Names open the player page.
export default function Scorers({ scorers }) {
  const { t } = useLang()
  if (!scorers.length) return <p className="py-12 text-center text-muted">{t('sc.none')}</p>
  return (
    <div className="animate-fade-in overflow-x-auto rounded-xl bg-card shadow-sm">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-3 py-3">#</th><th className="py-3">{t('sc.player')}</th><th className="py-3">{t('sc.team')}</th>
            <th className="px-2 py-3 text-center">{t('sc.age')}</th>
            <th className="px-2 py-3 text-center">{t('sc.played')}</th>
            <th className="px-2 py-3 text-center">{t('sc.assists')}</th>
            <th className="px-2 py-3 text-center">{t('sc.pens')}</th>
            <th className="px-3 py-3 text-center">{t('sc.goals')}</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={s.player.id ?? `${s.player.name}-${i}`} className="border-t border-line transition hover:bg-subtle">
              <td className="px-3 py-2 font-semibold">{i + 1}</td>
              <td className="py-2 font-medium">
                {/* Not every provider gives these rows a player id — see fetchGoalScorers. Without one there
                    is no page to open, so the name is plain text rather than a link that goes nowhere. */}
                <Maybe to={s.player.id && `/players/${s.player.id}`}>
                  {s.player.shirtNumber != null && <span className="mr-1.5 text-xs text-muted">{s.player.shirtNumber}</span>}
                  {s.player.name}
                </Maybe>
              </td>
              <td className="py-2">
                <Maybe to={s.team.id && `/teams/${s.team.id}`}>{s.team.shortName || s.team.name}</Maybe>
              </td>
              <td className="px-2 text-center">{ageFrom(s.player.dateOfBirth) ?? '–'}</td>
              <td className="px-2 text-center">{s.playedMatches ?? '–'}</td>
              <td className="px-2 text-center">{s.assists ?? '–'}</td>
              <td className="px-2 text-center">{s.penalties ?? '–'}</td>
              <td className="px-3 text-center font-bold text-primary">{s.goals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
