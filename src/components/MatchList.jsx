import MatchCard from './MatchCard.jsx'
import { dayKey, formatDate } from '../utils/helpers.js'

// Groups matches by local day and renders each group as a titled grid.
export default function MatchList({ matches }) {
  const groups = matches.reduce((acc, m) => {
    const k = dayKey(m.utcDate)
    ;(acc[k] ||= []).push(m)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.keys(groups).sort().map((k) => (
        <section key={k}>
          <h2 className="mb-3 text-2xl font-bold text-gray-800">{formatDate(groups[k][0].utcDate)}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups[k].map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
