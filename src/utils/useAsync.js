import { useEffect, useState } from 'react'

/** Runs an async loader whenever `deps` change; returns { data, loading, error, retry }. */
export default function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    loader()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e) => !cancelled && setState({ data: null, loading: false, error: e }))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}

