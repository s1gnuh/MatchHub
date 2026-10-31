import { stageLabel } from './helpers.js'

// Pairs knockout-stage matches into ties and orders the stages into bracket columns.
//
// Both data providers already agree on stage names (LAST_32, LAST_16, QUARTER_FINALS, SEMI_FINALS,
// THIRD_PLACE, FINAL, PLAYOFFS — see services/goalApi.js's `stage()`), so this file works from that
// vocabulary alone and needs no competition-specific knowledge.
//
// A tie is two clubs meeting once (most domestic cups) or twice, home and away (UEFA's modern knockout
// format). Two legs are found by the same unordered pair of team ids occurring twice within one stage;
// nothing in the data states which leg is first, so the earlier kickoff is taken to be leg 1.

// Left to right, the way a bracket reads. THIRD_PLACE plays no part in the tree — nobody's semi-final loss
// feeds into it from a fixed slot — so it is kept out of this list and shown on its own.
export const KO_ORDER = ['PLAYOFFS', 'LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']
export const KO_STAGES = new Set([...KO_ORDER, 'THIRD_PLACE'])

const DECIDED = ['FINISHED', 'AWARDED']

/** A team's goals in one match, or null before full time. */
function scoreFor(match, teamId) {
  const ft = match.score?.fullTime
  if (ft?.home == null) return null
  if (teamId === match.homeTeam.id) return ft.home
  if (teamId === match.awayTeam.id) return ft.away
  return null
}

/** One tie: 1 or 2 legs (earliest first), the two teams in a stable order, the aggregate once every leg is
 * decided, and the winner's id once the tie itself is. */
function buildTie(legs) {
  const [leg1] = legs
  const teamA = leg1.homeTeam
  const teamB = leg1.awayTeam
  const allPlayed = legs.every((m) => DECIDED.includes(m.status))
  let aggA = null, aggB = null, winnerId = null

  if (allPlayed) {
    aggA = legs.reduce((n, m) => n + (scoreFor(m, teamA.id) ?? 0), 0)
    aggB = legs.reduce((n, m) => n + (scoreFor(m, teamB.id) ?? 0), 0)
    if (aggA > aggB) winnerId = teamA.id
    else if (aggB > aggA) winnerId = teamB.id
    else {
      // Level on aggregate: the tie-breaker (extra time, then penalties) was played inside the last leg,
      // so that leg's own winner/penalty score is the tie's.
      const decider = legs[legs.length - 1]
      if (decider.score?.winner === 'HOME_TEAM') winnerId = decider.homeTeam.id
      else if (decider.score?.winner === 'AWAY_TEAM') winnerId = decider.awayTeam.id
      else if (decider.score?.penalties?.home != null) {
        winnerId = decider.score.penalties.home > decider.score.penalties.away ? decider.homeTeam.id : decider.awayTeam.id
      }
    }
  }

  return {
    key: `${teamA.id}-${teamB.id}-${leg1.utcDate}`,
    teamA, teamB, legs,
    aggA, aggB, winnerId,
    live: legs.some((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED'),
  }
}

/** Matches of one knockout stage, paired up by opponent into ties, earliest tie first. */
function buildStageTies(matches) {
  const byPair = new Map()
  for (const m of matches) {
    const key = [m.homeTeam.id, m.awayTeam.id].sort().join('|')
    if (!byPair.has(key)) byPair.set(key, [])
    byPair.get(key).push(m)
  }
  const ties = []
  for (const legs of byPair.values()) {
    legs.sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    // A pair meeting more than twice in the same stage would be a data oddity, not a real tie shape —
    // keep only the first two legs defensively rather than letting a three-way aggregate make no sense.
    ties.push(buildTie(legs.slice(0, 2)))
  }
  return ties.sort((a, b) => a.legs[0].utcDate.localeCompare(b.legs[0].utcDate))
}

/**
 * Knockout matches of a competition's season (already loaded — this reads a list, it never fetches one),
 * as `{ columns, thirdPlace }`. `columns` is `[{ stage, label, ties }]` in tournament order; `thirdPlace`
 * is that play-off's own tie, or null when the competition has none.
 */
export function buildBracket(matches, t) {
  const byStage = new Map()
  for (const m of matches) {
    if (!KO_STAGES.has(m.stage)) continue
    if (!byStage.has(m.stage)) byStage.set(m.stage, [])
    byStage.get(m.stage).push(m)
  }
  const columns = KO_ORDER
    .filter((stage) => byStage.has(stage))
    .map((stage) => ({ stage, label: stageLabel(stage, t), ties: buildStageTies(byStage.get(stage)) }))
  const thirdTies = byStage.has('THIRD_PLACE') ? buildStageTies(byStage.get('THIRD_PLACE')) : []
  return { columns, thirdPlace: thirdTies[0] ?? null }
}
