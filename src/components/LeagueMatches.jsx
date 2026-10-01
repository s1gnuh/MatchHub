import { useState } from 'react'
import AsyncBoundary from './AsyncBoundary.jsx'
import RoundList from './RoundList.jsx'
import { useLang } from '../utils/i18n.jsx'
import useApi from '../utils/useApi.js'
import { fetchCompetitionMatches } from '../services/api.js'
import { stageLabel } from '../utils/helpers.js'

// Every match lands in exactly one list: decided matches under Results, everything else (scheduled, live,
// postponed, suspended, cancelled) under Upcoming, so no fixture of the season goes missing.
const DECIDED = ['FINISHED', 'AWARDED']
const MODES = ['upcoming', 'results', 'rounds']
const LEAGUE_STAGES = ['REGULAR_SEASON', 'LEAGUE_STAGE', 'GROUP_STAGE'] // stages where "Matchday N" makes sense
const roundKey = (m) => `${m.stage}|${m.matchday ?? 0}`

/** Rounds of a competition ("Matchday 1", "Quarter-finals"…), in kickoff order, built from its match list. */
function buildRounds(matches, t) {
  const byKey = new Map()
  for (const m of matches) {
    const key = roundKey(m)
    if (!byKey.has(key)) byKey.set(key, { key, stage: m.stage, matchday: m.matchday, first: m.utcDate, matches: [] })
    const round = byKey.get(key)
    round.matches.push(m)
    if (m.utcDate < round.first) round.first = m.utcDate
  }
  const rounds = [...byKey.values()].sort((a, b) => a.first.localeCompare(b.first))
  // A knockout stage can have several rounds (two legs): number them so the labels stay distinct.
  const perStage = {}
  rounds.forEach((r) => { (perStage[r.stage] ||= []).push(r) })
  for (const r of rounds) {
    const league = LEAGUE_STAGES.includes(r.stage) && r.matchday
    const siblings = perStage[r.stage]
    r.label = league
      ? t('md.matchday', { n: r.matchday })
      : `${stageLabel(r.stage, t) || r.stage}${siblings.length > 1 ? ` · ${siblings.indexOf(r) + 1}/${siblings.length}` : ''}`
  }
  return rounds
}

/** Splits `list` into rounds (same order and labels as `rounds`), keeping only rounds with matches. */
function groupByRound(list, rounds) {
  const byKey = new Map(rounds.map((r) => [r.key, { key: r.key, label: r.label, matches: [] }]))
  for (const m of list) byKey.get(roundKey(m))?.matches.push(m)
  return [...byKey.values()].filter((r) => r.matches.length)
}

// Matches of one competition, grouped by round, with Upcoming / Results / Rounds views,
// optional text search and a match count.
export default function LeagueMatches({ code, search = '' }) {
  const { t } = useLang()
  const [mode, setMode] = useState('upcoming')
  // Slide direction of the last mode toggle; reset when the league changes (plain fade then).
  const [nav, setNav] = useState({ dir: null, code })
  const dir = nav.code === code ? nav.dir : null
  const enter = dir === 'right' ? 'animate-slide-in-right' : dir === 'left' ? 'animate-slide-in-left' : 'animate-fade-in'
  const switchMode = (m) => {
    if (m === mode) return
    setNav({ dir: MODES.indexOf(m) > MODES.indexOf(mode) ? 'right' : 'left', code })
    setMode(m)
  }
  // Round chosen in the Rounds view (per league); null means "the current round".
  const [pick, setPick] = useState({ code, key: null })
  const r = useApi(['matches', code], () => fetchCompetitionMatches(code))

  return (
    <AsyncBoundary {...r}>
      {r.data && (() => {
        const q = search.trim().toLowerCase()
        const sorted = [...r.data].sort((a, b) => a.utcDate.localeCompare(b.utcDate))
        const match = (m) =>
          !q || [m.homeTeam?.name, m.awayTeam?.name, m.homeTeam?.shortName, m.awayTeam?.shortName, m.competition?.name]
            .some((s) => s?.toLowerCase().includes(q))

        const rounds = buildRounds(sorted, t)
        let groups, roundBar = null, listKey = `${code}-${mode}`
        if (mode === 'rounds') {
          // Default to the first round that still has unplayed matches, else the last one.
          const current = rounds.find((x) => x.matches.some((m) => !DECIDED.includes(m.status))) || rounds[rounds.length - 1]
          const chosen = (pick.code === code && rounds.find((x) => x.key === pick.key)) || current
          const idx = rounds.indexOf(chosen)
          const go = (i) => setPick({ code, key: rounds[i].key })
          groups = chosen ? groupByRound(chosen.matches.filter(match), rounds) : []
          listKey += `-${chosen?.key}`
          roundBar = chosen && (
            <div className="mb-5 flex items-center gap-2">
              <button onClick={() => go(idx - 1)} disabled={idx <= 0} aria-label={t('round.prev')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-lg transition hover:border-primary/50 disabled:opacity-30">‹</button>
              <select value={chosen.key} onChange={(e) => setPick({ code, key: e.target.value })} aria-label={t('round.label')}
                className="h-10 min-w-0 flex-1 rounded-full border border-line bg-card px-4 text-center text-sm font-semibold text-main outline-none focus:border-primary sm:flex-none sm:min-w-[14rem]">
                {rounds.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
              <button onClick={() => go(idx + 1)} disabled={idx >= rounds.length - 1} aria-label={t('round.next')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card text-lg transition hover:border-primary/50 disabled:opacity-30">›</button>
            </div>
          )
        } else {
          // Every round of the season: Upcoming lists the remaining rounds (next first), Results the played ones
          // (latest first). A round still in progress shows its played matches under Results, the rest under Upcoming.
          groups = mode === 'upcoming'
            ? groupByRound(sorted.filter((m) => !DECIDED.includes(m.status) && match(m)), rounds)
            : groupByRound(sorted.filter((m) => DECIDED.includes(m.status) && match(m)), rounds).reverse()
        }
        const count = groups.reduce((n, g) => n + g.matches.length, 0)

        return (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex gap-1 rounded-full bg-subtle p-1">
                {MODES.map((m) => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition duration-300 ${mode === m ? 'bg-card text-primary shadow' : 'text-muted hover:text-main'}`}>
                    {t('m.' + m)}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted" aria-live="polite">{t(count === 1 ? 'm.one' : 'm.many', { n: count })}</p>
            </div>
            {roundBar}
            {/* key restarts the animation when the mode, league or round changes */}
            <div key={listKey} className={enter}>
              {count
                ? <RoundList rounds={groups} />
                : <p className="py-16 text-center text-muted">{t('m.none')}</p>}
            </div>
          </>
        )
      })()}
    </AsyncBoundary>
  )
}
