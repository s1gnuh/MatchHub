import { useContext } from 'react'
import MatchCard from './MatchCard.jsx'
import { ListContext } from './ListContext.js'
import { useLang } from '../utils/i18n.jsx'
import { dayKey, relativeDay, formatDate } from '../utils/helpers.js'

// Groups matches by local day; each group gets a "Today / Tomorrow / date" heading.
// `compact` renders small day labels, for use inside a round section. In a dense list (ListContext) the matches
// are compact rows in one column instead of a card grid.
export default function MatchList({ matches, compact = false }) {
  const { t } = useLang()
  const { dense } = useContext(ListContext)
  const groups = matches.reduce((acc, m) => {
    const k = dayKey(m.utcDate)
    ;(acc[k] ||= []).push(m)
    return acc
  }, {})

  return (
    <div className={compact ? 'space-y-4' : 'space-y-8'}>
      {Object.keys(groups).sort().map((k) => {
        const rel = relativeDay(groups[k][0].utcDate)
        const isToday = rel === 'today'
        return (
        <section key={k}>
          {compact ? (
            <h3 className={`mb-2 text-xs font-bold uppercase tracking-wide ${isToday ? 'text-primary' : 'text-muted'}`}>
              {rel ? `${t(rel)} · ` : ''}{formatDate(groups[k][0].utcDate)}
            </h3>
          ) : (
            <h2 className="mb-3 flex items-baseline gap-2">
              {rel ? (
                <>
                  <span className={`text-xl font-extrabold ${isToday ? 'text-primary' : ''}`}>{t(rel)}</span>
                  <span className="text-sm text-muted">{formatDate(groups[k][0].utcDate)}</span>
                </>
              ) : (
                <span className="text-xl font-extrabold">{formatDate(groups[k][0].utcDate)}</span>
              )}
            </h2>
          )}
          <div className={dense
            ? 'divide-y divide-line overflow-hidden rounded-lg border border-line'
            : 'grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}>
            {groups[k].map((m, i) => <MatchCard key={m.id} match={m} index={i} today={isToday} />)}
          </div>
        </section>
        )
      })}
    </div>
  )
}
