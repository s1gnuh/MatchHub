import { useContext } from 'react'
import MatchList from './MatchList.jsx'
import { ListContext } from './ListContext.js'
import { useLang } from '../utils/i18n.jsx'
import { dayKey, formatDate } from '../utils/helpers.js'

// Matches grouped by round: a "Matchday 6 · Sat 10 Oct – Tue 13 Oct" heading per round,
// with small day labels inside so the kickoff day is still visible. A whole season can be listed (up to ~550
// matches), so off-screen rounds skip rendering work via content-visibility.
export default function RoundList({ rounds }) {
  const { t } = useLang()
  const { dense } = useContext(ListContext)
  return (
    <div className={dense ? 'space-y-6' : 'space-y-10'}>
      {rounds.map((r) => {
        const dates = r.matches.map((m) => m.utcDate).sort()
        const first = dates[0], last = dates[dates.length - 1]
        const range = dayKey(first) === dayKey(last) ? formatDate(first) : `${formatDate(first)} – ${formatDate(last)}`
        return (
          <section key={r.key} style={{ contentVisibility: 'auto', containIntrinsicSize: `auto ${dense ? 700 : 1200}px` }}>
            <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2 ${dense ? 'mb-3' : 'mb-4'}`}>
              <h2 className={dense ? 'text-base font-extrabold' : 'text-xl font-extrabold'}>{r.label}</h2>
              <span className="text-sm text-muted">{range}</span>
              <span className="ml-auto text-xs text-muted">{t(r.matches.length === 1 ? 'm.one' : 'm.many', { n: r.matches.length })}</span>
            </div>
            <MatchList matches={r.matches} compact />
          </section>
        )
      })}
    </div>
  )
}
