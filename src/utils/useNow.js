import { useSyncExternalStore } from 'react'

// One shared 30 s ticker for every component that shows a countdown, instead of a timer per card.
const listeners = new Set()
let timer = null
let now = Date.now()

function subscribe(cb) {
  if (!timer) {
    now = Date.now()
    timer = setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 30000)
  }
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
    if (!listeners.size) { clearInterval(timer); timer = null }
  }
}

/** Current time in ms, refreshed every 30 s while at least one component is subscribed. */
export default function useNow() {
  return useSyncExternalStore(subscribe, () => now)
}
