// Recent form and head-to-head, computed from a competition's match list that is already cached.

const finished = (m) => m.status === 'FINISHED' && m.score?.fullTime?.home != null

/** "W" | "D" | "L" for `teamId` in a finished match. */
export function resultFor(m, teamId) {
  const { winner } = m.score
  if (winner === 'DRAW') return 'D'
  const homeWon = winner === 'HOME_TEAM'
  return homeWon === (m.homeTeam.id === teamId) ? 'W' : 'L'
}

/** Last `n` finished matches of a team, oldest first: [{ r: 'W'|'D'|'L', match }]. */
export function recentForm(matches, teamId, n = 5) {
  return matches
    .filter((m) => finished(m) && (m.homeTeam.id === teamId || m.awayTeam.id === teamId))
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
    .slice(-n)
    .map((match) => ({ r: resultFor(match, teamId), match }))
}

/** Finished meetings of two teams (either venue), newest first, optionally leaving out one match id. */
export function headToHead(matches, idA, idB, excludeId) {
  return matches
    .filter((m) => finished(m) && m.id !== excludeId
      && [m.homeTeam.id, m.awayTeam.id].sort().join() === [idA, idB].sort().join())
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
}
