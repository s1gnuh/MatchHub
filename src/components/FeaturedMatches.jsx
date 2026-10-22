import { useContext, useMemo, useState } from 'react'
import AsyncBoundary from './AsyncBoundary.jsx'
import DayStrip from './DayStrip.jsx'
import MatchCard from './MatchCard.jsx'
import MatchList, { listClass } from './MatchList.jsx'
import TabPills from './TabPills.jsx'
import { ListContext } from './ListContext.js'
import { useLang } from '../utils/i18n.jsx'
import useUpcoming from '../utils/useUpcoming.js'
import useSwipe from '../utils/useSwipe.js'
import { UPCOMING_DAYS } from '../services/api.js'
import { byHotness } from '../utils/hotness.js'
import { dayKey, matchesQuery } from '../utils/helpers.js'

const MODES = ['today', 'hot'] // "today" first: it is what the screen opens on
const DECIDED = ['FINISHED', 'AWARDED']
const HOT_LIMIT = 30 // a highlights list, not a full fixture list: enough to scroll, not enough to get lost in

/** The window's days in order, each with how many matches fall on it (Hanoi time). */
function buildDays(matches) {
  const counts = new Map()
  for (const m of matches) {
    const k = dayKey(m.utcDate)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return Array.from({ length: UPCOMING_DAYS }, (_, i) => {
    const iso = new Date(Date.now() + i * 86400000).toISOString()
    const key = dayKey(iso)
    return { key, iso, count: counts.get(key) ?? 0 }
  })
}

// The home screen, across every supported competition, from the single /matches request that covers them
// all. Switching league here filters the same list, so it is free; so is opening any of these matches,
// because their data is already here.
//
// Two views: "Today" is the schedule, one day at a time, with the day strip to move through the window;
// "Featured" ranks the undecided matches by how big they are (see utils/hotness.js).
export default function FeaturedMatches({ search = '' }) {
  const { t } = useLang()
  const ctx = useContext(ListContext)
  const [mode, setMode] = useState('today')
  const [day, setDay] = useState(null) // null until the visitor picks one; see `shownDay`
  // Which way the content should enter, from the direction the visitor moved along the tabs or the strip.
  const [dir, setDir] = useState(null)
  const enter = dir === 'left' ? 'animate-tab-in-left' : dir === 'right' ? 'animate-tab-in-right' : 'animate-fade-in'
  const r = useUpcoming()

  const all = r.data || []
  const days = useMemo(() => buildDays(all), [all])
  // Today when today has matches, otherwise the next day that does, so the screen never opens empty on a
  // quiet Tuesday. The strip shows which day this landed on, so it is visible rather than silent.
  const fallbackDay = (days.find((d) => d.count) ?? days[0])?.key
  const shownDay = (day && days.some((d) => d.key === day) ? day : null)
    ?? (days[0]?.count ? days[0].key : fallbackDay)

  const switchMode = (m) => {
    if (m === mode) return
    setDir(MODES.indexOf(m) > MODES.indexOf(mode) ? 'right' : 'left')
    setMode(m)
  }
  const switchDay = (k) => {
    if (k === shownDay) return
    setDir(days.findIndex((d) => d.key === k) > days.findIndex((d) => d.key === shownDay) ? 'right' : 'left')
    setDay(k)
  }

  return (
    <AsyncBoundary {...r}>
      {r.data && (() => {
        const q = search.trim().toLowerCase()
        const found = all.filter((m) => matchesQuery(m, q, t))
        const byDate = [...found].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
        // A search is about finding a team, not a date, so it looks across the whole window and the day
        // strip steps aside until the box is cleared.
        const searching = mode === 'today' && Boolean(q)
        const ofDay = byDate.filter((m) => dayKey(m.utcDate) === shownDay)
        const hot = byHotness(found.filter((m) => !DECIDED.includes(m.status))).slice(0, HOT_LIMIT)
        const dayIdx = days.findIndex((d) => d.key === shownDay)
        const swipe = useSwipe({
          onSwipeLeft: () => { if (dayIdx < days.length - 1) switchDay(days[dayIdx + 1].key) },
          onSwipeRight: () => { if (dayIdx > 0) switchDay(days[dayIdx - 1].key) },
        })
        const shown = mode === 'hot' ? hot : searching ? byDate : ofDay

        return (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <TabPills label={t('top.view')} value={mode} onChange={switchMode}
                tabs={MODES.map((m) => ({ key: m, label: t('top.' + m) }))} />
              <p className="shrink-0 whitespace-nowrap text-sm text-muted" aria-live="polite">
                {t(shown.length === 1 ? 'm.one' : 'm.many', { n: shown.length })}
              </p>
            </div>

            {mode === 'today' && !searching && (
              <div className="mb-5"><DayStrip days={days} value={shownDay} onChange={switchDay} /></div>
            )}

            {/* key restarts the entrance animation when the view, the day or the search changes */}
            <div key={`${mode}-${searching ? 'q' : shownDay}`} className={enter}
              {...(mode === 'today' && !searching ? swipe : {})}>
              {!shown.length && (
                <p className="py-16 text-center text-muted">{mode === 'today' && !searching ? t('day.none') : t('m.none')}</p>
              )}
              {Boolean(shown.length) && searching && <MatchList matches={byDate} />}
              {Boolean(shown.length) && !searching && (
                // One day, or the hot ranking: a flat list either way. The ranking is not in day order, so
                // those cards state their own day.
                <ListContext.Provider value={{ ...ctx, showDay: mode === 'hot' }}>
                  <div className={listClass(ctx.dense)}>
                    {shown.map((m, i) => <MatchCard key={m.id} match={m} index={i} today={mode === 'today' && shownDay === days[0]?.key} />)}
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
