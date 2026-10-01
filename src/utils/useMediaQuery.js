import { useSyncExternalStore } from 'react'

/** True while the CSS media query matches; re-renders when it changes (e.g. resizing past a breakpoint). */
export default function useMediaQuery(query) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
  )
}

/** The desktop master-detail layout (list | match | table) starts at Tailwind's `lg` breakpoint. */
export const WIDE = '(min-width: 1024px)'
