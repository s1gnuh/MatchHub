import { useState } from 'react'
import AsyncBoundary from './AsyncBoundary.jsx'
import MatchList from './MatchList.jsx'
import { useLang } from '../utils/i18n.jsx'
import useApi from '../utils/useApi.js'
import { fetchMatches, fetchCompetitionMatches } from '../services/api.js'

const UPCOMING = ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED']

// Matches of one competition (or code "ALL" = next 7 days across leagues),
// with an Upcoming / Results toggle, optional text search and a result count.
export default function LeagueMatches({ code, search = '' }) {
  const { t } = useLang()
  const [mode, setMode] = useState('upcoming')
  // Slide direction of the last Upcoming/Results toggle; reset when the league changes (plain fade then).
  const [nav, setNav] = useState({ dir: null, code })
  const dir = nav.code === code ? nav.dir : null
  const enter = dir === 'right' ? 'animate-slide-in-right' : dir === 'left' ? 'animate-slide-in-left' : 'animate-fade-in'
  const switchMode = (m) => {
    if (m === mode) return
    setNav({ dir: m === 'results' ? 'right' : 'left', code })
    setMode(m)
  }
  const r = useApi(['matches', code], () => (code === 'ALL' ? fetchMatches() : fetchCompetitionMatches(code)))

  return (
    <AsyncBoundary {...r}>
      {r.data && (() => {
        const q = search.trim().toLowerCase()
        const sorted = [...r.data].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
        const match = (m) =>
          !q || [m.homeTeam?.name, m.awayTeam?.name, m.homeTeam?.shortName, m.awayTeam?.shortName, m.competition?.name]
            .some((s) => s?.toLowerCase().includes(q))
        // Without a search, cap the list so the page stays light.
        let upcoming = sorted.filter((m) => UPCOMING.includes(m.status) && match(m))
        let results = sorted.filter((m) => m.status === 'FINISHED' && match(m))
        if (!q) { upcoming = upcoming.slice(0, 30); results = results.slice(-30) }
        const list = mode === 'upcoming' ? upcoming : results

        return (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex gap-1 rounded-full bg-subtle p-1">
                {['upcoming', 'results'].map((m) => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition duration-300 ${mode === m ? 'bg-card text-primary shadow' : 'text-muted hover:text-main'}`}>
                    {t('m.' + m)}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted" aria-live="polite">{t(list.length === 1 ? 'm.one' : 'm.many', { n: list.length })}</p>
            </div>
            {/* key restarts the fade animation when the mode or league changes */}
            <div key={`${code}-${mode}`} className={enter}>
              {list.length
                ? <MatchList matches={list} />
                : <p className="py-16 text-center text-muted">{t('m.none')}</p>}
            </div>
          </>
        )
      })()}
    </AsyncBoundary>
  )
}


