import { useContext, useEffect, useRef, useState } from 'react'
import MatchList from './MatchList.jsx'
import { ListContext } from './ListContext.js'
import { useLang } from '../utils/i18n.jsx'
import { dayKey, formatDate } from '../utils/helpers.js'

const FIRST_ROUNDS = 2 // rounds rendered immediately: a whole season is up to ~550 cards, too heavy for phones
const MORE_ROUNDS = 3   // rounds added each time the visitor scrolls near the end

// Matches grouped by round: a "Matchday 6 · Sat 10 Oct – Tue 13 Oct" heading per round,
// with small day labels inside so the kickoff day is still visible. A whole season can be listed (up to ~550
// matches), so off-screen rounds skip rendering work via content-visibility.
export default function RoundList({ rounds }) {
  const { t } = useLang()
  const { dense } = useContext(ListContext)
  // Only the first rounds are rendered; the rest are added as the visitor scrolls near the bottom, so the page
  // paints ~20 cards instead of hundreds. Parents remount this list (key) when the mode / league / round changes.
  const [shown, setShown] = useState(FIRST_ROUNDS)
  const sentinel = useRef(null)
  const more = shown < rounds.length
  useEffect(() => {
    if (!more) return
    const el = sentinel.current
    if (!el || !('IntersectionObserver' in window)) { setShown(rounds.length); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setShown((n) => n + MORE_ROUNDS)
    }, { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [more, shown, rounds.length])

  return (
    <div className={dense ? 'space-y-6' : 'space-y-10'}>
      {rounds.slice(0, shown).map((r) => {
        const dates = r.matches.map((m) => m.utcDate).sort()
        const first = dates[0], last = dates[dates.length - 1]
        const range = dayKey(first) === dayKey(last) ? formatDate(first) : `${formatDate(first)} – ${formatDate(last)}`
        return (
          <section key={r.key} style={{ contentVisibility: 'auto', containIntrinsicSize: `auto ${dense ? 700 : 1200}px` }}>
            <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2 ${dense ? 'mb-3' : 'mb-4'}`}>
              <h2 className={dense ? 'text-base font-extrabold' : 'text-xl font-extrabold'}>{r.label}</h2>
              <span className="text-sm text-muted">{range}</span>
              {!dense && <span className="ml-auto text-xs text-muted">{t(r.matches.length === 1 ? 'm.one' : 'm.many', { n: r.matches.length })}</span>}
            </div>
            <MatchList matches={r.matches} compact />
          </section>
        )
      })}
      {more && <div ref={sentinel} className="h-px" aria-hidden="true" />}
    </div>
  )
}
