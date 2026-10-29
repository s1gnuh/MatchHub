import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fetchUpcoming, fetchUpcomingGoal } from '../services/api.js'

const MIN_MS = 3500 // shown for at least this long, so the logo animation always reads as intentional
const MAX_MS = 4500 // ...but never longer than this, even if the API is slow or offline

/**
 * Full-screen cover shown over the app shell while the matches screen's data loads. It prefetches the
 * same two queries useUpcoming.js reads (['matches','upcoming'] and its '…,goal' companion) straight into
 * the shared QueryClient, so by the time this fades out Home already has its data in cache and renders
 * with nothing left to fetch — no spinner handoff between this screen and the app underneath.
 */
export default function Splash() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    let minDone = false
    let dataDone = false
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      setFading(true)
      setTimeout(() => setVisible(false), 450) // matches the opacity transition below
    }
    const tryFinish = () => { if (minDone && dataDone) finish() }

    const minTimer = setTimeout(() => { minDone = true; tryFinish() }, MIN_MS)
    const maxTimer = setTimeout(finish, MAX_MS)

    Promise.allSettled([
      queryClient.prefetchQuery({ queryKey: ['matches', 'upcoming'], queryFn: fetchUpcoming }),
      queryClient.prefetchQuery({ queryKey: ['matches', 'upcoming', 'goal'], queryFn: fetchUpcomingGoal }),
    ]).then(() => { dataDone = true; tryFinish() })

    return () => { clearTimeout(minTimer); clearTimeout(maxTimer) }
  }, [queryClient])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-app transition-opacity duration-[450ms] ease-out ${fading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute h-36 w-36 animate-splash-glow rounded-full bg-primary/30 blur-2xl" />
        <span className="relative -skew-x-6 rounded-xl bg-white px-5 py-2.5 font-logo text-3xl font-black italic leading-none tracking-tight shadow-lg shadow-primary/20">
          <span className="text-black">Match</span>
          <span className="text-[#f59e0b]">Hub</span>
        </span>
      </div>
      <div className="relative h-1 w-40 overflow-hidden rounded-full bg-subtle">
        <span className="absolute inset-y-0 w-2/5 animate-splash-shimmer rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>
    </div>
  )
}
