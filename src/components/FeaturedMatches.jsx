import { useContext, useState } from 'react'
import AsyncBoundary from './AsyncBoundary.jsx'
import MatchCard from './MatchCard.jsx'
import MatchList, { listClass } from './MatchList.jsx'
import { ListContext } from './ListContext.js'
import { useLang } from '../utils/i18n.jsx'
import useApi from '../utils/useApi.js'
import { fetchUpcoming, UPCOMING_DAYS } from '../services/api.js'
import { byHotness } from '../utils/hotness.js'
import { matchesQuery } from '../utils/helpers.js'

const MODES = ['hot', 'days']
const DECIDED = ['FINISHED', 'AWARDED']
const HOT_LIMIT = 30 // a highlights list, not a full fixture list: enough to scroll, not enough to get lost in

// The home screen: the matches worth knowing about across every supported competition, from the single
// /matches request that covers them all. Switching league on this screen filters the same list, so it is free;
// so is opening any of these matches, because the match data is already here.
//
// Two views: "Featured" ranks the undecided matches by how big they are (see utils/hotness.js), "By day"
// lists everything in the window in kickoff order, today's finished matches included.
export default function FeaturedMatches({ search = '' }) {
  const { t } = useLang()
  const ctx = useContext(ListContext)
  const [mode, setMode] = useState('hot')
  const r = useApi(['matches', 'upcoming'], fetchUpcoming)

  return (
    <AsyncBoundary {...r}>
      {r.data && (() => {
        const q = search.trim().toLowerCase()
        const found = r.data.filter((m) => matchesQuery(m, q, t))
        const hot = byHotness(found.filter((m) => !DECIDED.includes(m.status))).slice(0, HOT_LIMIT)
        const byDate = [...found].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
        const shown = mode === 'hot' ? hot : byDate

        return (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div className="flex gap-1 rounded-full bg-subtle p-1">
                {MODES.map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold sm:px-4 lg:px-3 2xl:px-4 transition duration-300 ${mode === m ? 'bg-card text-primary shadow' : 'text-muted hover:text-main'}`}>
                    {t('top.' + m)}
                  </button>
                ))}
              </div>
              <p className="shrink-0 whitespace-nowrap text-sm text-muted" aria-live="polite">
                {t(shown.length === 1 ? 'm.one' : 'm.many', { n: shown.length })}
              </p>
            </div>

            {/* key restarts the animation when the view changes */}
            <div key={mode} className="animate-fade-in">
              {!shown.length && <p className="py-16 text-center text-muted">{t('m.none')}</p>}
              {Boolean(shown.length) && mode === 'days' && <MatchList matches={byDate} />}
              {Boolean(shown.length) && mode === 'hot' && (
                // Ranked by interest, so the cards are not in day order and each one states its own day.
                <ListContext.Provider value={{ ...ctx, showDay: true }}>
                  <div className={listClass(ctx.dense)}>
                    {hot.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
                  </div>
                </ListContext.Provider>
              )}
            </div>

            {mode === 'hot' && hot.length >= HOT_LIMIT && (
              <p className="mt-4 text-center text-xs text-muted">{t('top.more', { n: UPCOMING_DAYS })}</p>
            )}
          </>
        )
      })()}
    </AsyncBoundary>
  )
}
