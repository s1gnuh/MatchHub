import { useMemo } from 'react'
import useApi from './useApi.js'
import { fetchUpcoming, fetchUpcomingGoal } from '../services/api.js'

/**
 * The home screen's match list: the next ten days across every supported competition.
 *
 * It takes two requests rather than one, because the Vietnamese competitions come from a second provider
 * and the two APIs cannot be asked together. The screen is deliberately not made to wait for both:
 * `loading` and `error` follow football-data alone, so the page paints as soon as that answers and the
 * Vietnamese matches slot into the list when they arrive a moment later. If the second provider is down,
 * rate-limited or simply slow, the rest of the list still renders and no error is shown — the alternative
 * would be ten leagues held hostage by one.
 *
 * Both halves share their query keys with the rest of the app, so switching league or opening one of these
 * matches costs nothing.
 */
export default function useUpcoming(enabled = true) {
  const main = useApi(['matches', 'upcoming'], fetchUpcoming, { enabled })
  const extra = useApi(['matches', 'upcoming', 'goal'], fetchUpcomingGoal, { enabled })

  const data = useMemo(
    () => (main.data ? [...main.data, ...(extra.data || [])] : null),
    [main.data, extra.data],
  )

  return { data, loading: main.loading, error: main.error, retry: main.retry }
}
