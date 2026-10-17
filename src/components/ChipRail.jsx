import { useCallback, useEffect, useRef, useState } from 'react'

// How fast the rail drifts, in pixels per second. Broadcast tickers sit around 40-60; this is the slow end
// of that, because these chips are buttons and a target moving faster than this is awkward to hit.
const SPEED = 45

/**
 * The league chip bar, drifting sideways on its own.
 *
 * A caveat worth knowing, since this is a row of buttons rather than a ticker: anything that moves is harder
 * to click, and a chip that slides out from under the cursor is a genuine annoyance. So the drift yields at
 * every point where it would get in the way — it stops while the pointer is over the rail, while a chip has
 * keyboard focus, during a touch, when the tab is in the background, and for good as soon as the visitor
 * scrolls the rail by hand, which says plainly that they would rather steer. `prefers-reduced-motion` turns
 * it off altogether.
 *
 * It works by duplicating the chips once and scrolling through the first copy; on reaching the seam the
 * scroll position jumps back by exactly one copy's width, which is invisible because the content there is
 * identical. The duplicate is hidden from assistive tech and from tab order, so the chips are announced and
 * reachable once each.
 */
export default function ChipRail({ children, label, className = '' }) {
  const rail = useRef(null)
  const [paused, setPaused] = useState(false)
  const [off, setOff] = useState(false) // switched off for good once the visitor scrolls by hand

  const stop = useCallback(() => setOff(true), [])

  useEffect(() => {
    const el = rail.current
    if (!el || off) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let last = 0
    const step = (now) => {
      raf = requestAnimationFrame(step)
      if (!last) { last = now; return }
      const dt = Math.min(now - last, 100) // a backgrounded tab resumes with one huge delta; ignore it
      last = now
      if (paused || document.hidden) return
      // One copy's width. The seam is invisible, so wrapping there is seamless.
      const span = el.scrollWidth / 2
      if (span < 8) return
      const next = el.scrollLeft + (SPEED * dt) / 1000
      el.scrollLeft = next >= span ? next - span : next
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [paused, off])

  // A hand-driven scroll (wheel, drag, swipe) ends the drift; a click on a chip does not.
  useEffect(() => {
    const el = rail.current
    if (!el) return
    const opts = { passive: true }
    el.addEventListener('wheel', stop, opts)
    el.addEventListener('touchmove', stop, opts)
    el.addEventListener('pointerdown', () => setPaused(true), opts)
    return () => {
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchmove', stop)
    }
  }, [stop])

  const hold = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false) }

  return (
    <div
      ref={rail}
      aria-label={label}
      className={`no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 ${className}`}
      {...hold}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
    >
      <div className="flex shrink-0 gap-2">{children}</div>
      {/* The second copy exists only to make the wrap seamless, so it is invisible to screen readers and
          skipped by the keyboard. `inert` is what does that: aria-hidden alone would still leave these
          duplicate buttons focusable, giving every league two tab stops. (React 18 needs it as a string
          attribute; a browser without `inert` support just gets the duplicate tab stops back.)
          `off` drops the copy entirely, since a hand-steered rail should end where the chips do. */}
      {!off && (
        <div className="flex shrink-0 gap-2" aria-hidden="true" {...{ inert: '' }}>{children}</div>
      )}
    </div>
  )
}
