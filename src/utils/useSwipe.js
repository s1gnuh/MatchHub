import { useRef } from 'react'

/**
 * Returns touch event handlers for a swipe gesture.
 * Only fires when the horizontal movement is dominant — vertical scrolling is ignored.
 */
export default function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 48, maxVertical = 80 } = {}) {
  const start = useRef(null)

  return {
    onTouchStart: (e) => {
      start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    },
    onTouchEnd: (e) => {
      if (!start.current) return
      const dx = e.changedTouches[0].clientX - start.current.x
      const dy = Math.abs(e.changedTouches[0].clientY - start.current.y)
      start.current = null
      if (dy > maxVertical || Math.abs(dx) < threshold) return
      if (dx < 0) onSwipeLeft?.()
      else onSwipeRight?.()
    },
  }
}
