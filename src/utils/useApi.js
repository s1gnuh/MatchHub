import { useQuery } from '@tanstack/react-query'

/**
 * Cached data loader built on TanStack Query.
 * `key` identifies the data (e.g. ['standings', 'PL']); the same key is served from memory
 * without calling the API again. Returns { data, loading, error, retry } for AsyncBoundary.
 */
export default function useApi(key, fetcher) {
  const q = useQuery({ queryKey: key, queryFn: fetcher })
  return {
    data: q.data ?? null,
    loading: q.isPending,
    error: q.error,
    retry: () => q.refetch(),
  }
}
