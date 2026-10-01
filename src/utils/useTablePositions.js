import { useMemo } from 'react'
import useApi from './useApi.js'
import { fetchStandings } from '../services/api.js'

/**
 * Map of team id -> position in the league table, or null while unknown.
 * Uses the same cache entry as the Standings tab, so each league costs one request however many cards ask.
 */
export default function useTablePositions(code) {
  const r = useApi(['standings', code], () => fetchStandings(code), { enabled: Boolean(code) })
  const standings = r.data

  return useMemo(() => {
    if (!standings) return null
    const map = new Map()
    for (const g of standings.filter((s) => s.type === 'TOTAL')) {
      for (const row of g.table) map.set(row.team.id, row.position)
    }
    return map
  }, [standings])
}
