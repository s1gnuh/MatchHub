import MatchCard from './MatchCard.jsx'
import { useLang } from '../utils/i18n.jsx'
import { dayKey, relativeDay, formatDate } from '../utils/helpers.js'

// Groups matches by local day; each group gets a "Today / Tomorrow / date" heading.
export default function MatchList({ matches }) {
  const { t } = useLang()
  const groups = matches.reduce((acc, m) => {
    const k = dayKey(m.utcDate)
    ;(acc[k] ||= []).push(m)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.keys(groups).sort().map((k) => (
        <section key={k}>
          <h2 className="mb-3 flex items-baseline gap-2">
            {relativeDay(groups[k][0].utcDate) ? (
              <>
                <span className="text-xl font-extrabold">{t(relativeDay(groups[k][0].utcDate))}</span>
                <span className="text-sm text-muted">{formatDate(groups[k][0].utcDate)}</span>
              </>
            ) : (
              <span className="text-xl font-extrabold">{formatDate(groups[k][0].utcDate)}</span>
            )}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groups[k].map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </div>
        </section>
      ))}
    </div>
  )
}

