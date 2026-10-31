import { useCallback, useEffect, useSyncExternalStore } from 'react'

const KEY = 'matchhub:favourites'
const listeners = new Set()

function read() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { return new Set() }
}
// Module-level, so every component reading it shares one Set and re-renders together on a change —
// the same shared-store shape as usePushNotification's subscribed-ids list, just with cross-instance sync.
let snapshot = read()

function write(ids) {
  snapshot = ids
  try { localStorage.setItem(KEY, JSON.stringify([...ids])) } catch { /* storage unavailable */ }
  listeners.forEach((l) => l())
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/**
 * Starred teams: a Set of ids, shared across every component and persisted in localStorage.
 * Ids pass straight through as strings, so football-data's numeric ids and the Vietnamese provider's
 * cuids never collide (same convention as findStoredMatch in services/api.js).
 *
 * Returns { favourites, isFavourite, toggle }.
 */
export default function useFavourites() {
  const favourites = useSyncExternalStore(subscribe, () => snapshot)

  // Starring a team in another tab updates this one too.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== KEY) return
      snapshot = read()
      listeners.forEach((l) => l())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isFavourite = useCallback((id) => favourites.has(String(id)), [favourites])
  // Reads the module-level value rather than the `favourites` snapshot above, so a toggle is always based
  // on the latest state even if called from a stale render.
  const toggle = useCallback((id) => {
    const key = String(id)
    const next = new Set(snapshot)
    next.has(key) ? next.delete(key) : next.add(key)
    write(next)
  }, [])

  return { favourites, isFavourite, toggle }
}
