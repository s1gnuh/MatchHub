import { useEffect, useRef, useState } from 'react'

// Renders `children` only once the placeholder scrolls into view, so data they load (and its API requests)
// is only fetched for content the visitor actually looks at.
export default function LazyMount({ children, placeholder = null }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (show) return
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setShow(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect() }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [show])

  return show ? children : <div ref={ref}>{placeholder}</div>
}
