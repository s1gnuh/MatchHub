import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchUpcomingFresh } from '../services/api.js'

// When live matches are in the upcoming list, fetch fresh data every 60 s and write it
// into the ['matches', 'upcoming'] cache so every subscribed component re-renders.
export default function useLivePoll(hasLive) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!hasLive) return
    const id = setInterval(async () => {
      try {
        const fresh = await fetchUpcomingFresh()
        qc.setQueryData(['matches', 'upcoming'], fresh)
      } catch {}
    }, 60_000)
    return () => clearInterval(id)
  }, [hasLive, qc])
}
