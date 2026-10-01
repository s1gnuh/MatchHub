import { useQuery } from '@tanstack/react-query'

/**
 * Cached data loader built on TanStack Query.
 * `key` identifies the data (e.g. ['standings', 'PL']); the same key is served from memory
 * without calling the API again. Returns { data, loading, error, retry } for AsyncBoundary.
 * Pass `{ enabled: false }` to hold the request back; `loading` is then false.
 */
export default function useApi(key, fetcher, { enabled = true } = {}) {
  const q = useQuery({ queryKey: key, queryFn: fetcher, enabled })
  return {
    data: q.data ?? null,
    loading: enabled && q.isPending,
    error: q.error,
    retry: () => q.refetch(),
  }
}
