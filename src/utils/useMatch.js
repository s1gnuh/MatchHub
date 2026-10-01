import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import useApi from './useApi.js'
import { fetchMatch, findStoredMatch } from '../services/api.js'

/**
 * One match, cache first: `initial` if given, else the match inside any competition list already loaded
 * (in memory or stored), and only otherwise GET /matches/{id}. Opening a match from a list costs no request.
 * Returns { data, loading, error, retry } like useApi.
 */
export default function useMatch(id, initial = null) {
  const qc = useQueryClient()
  const cached = useMemo(() => {
    if (initial) return initial
    if (!id) return null
    const n = Number(id)
    for (const [, data] of qc.getQueriesData({ queryKey: ['matches'] })) {
      const m = Array.isArray(data) ? data.find((x) => x.id === n) : null
      if (m) return m
    }
    return findStoredMatch(n)
  }, [id, initial, qc])
  const r = useApi(['match', String(id)], () => fetchMatch(id), { enabled: Boolean(id) && !cached })
  return cached ? { data: cached, loading: false, error: null, retry: () => {} } : r
}
