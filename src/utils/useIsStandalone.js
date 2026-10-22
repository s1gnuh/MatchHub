import { useState, useEffect } from 'react'

// True when the app runs as an installed PWA (home screen icon tap).
// navigator.standalone covers iOS; display-mode: standalone covers Android + desktop Chrome.
export default function useIsStandalone() {
  const [standalone, setStandalone] = useState(
    () => !!window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    const handler = (e) => setStandalone(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return standalone
}
