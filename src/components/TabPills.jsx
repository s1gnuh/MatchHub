import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Segmented tab bar whose gold pill travels from the old tab to the new one.
 *
 * The pill is a single absolutely positioned element moved by `transform`, so a tab change animates the
 * indicator itself rather than swapping the background of two buttons. Its position and width are measured
 * from the DOM, which keeps it correct when the labels change width — switching language turns "Featured"
 * into "Nổi bật" — and when the container is resized.
 *
 * The buttons sit in an inner row that carries no padding of its own. That is deliberate: an absolutely
 * positioned `left: 0` resolves against its ancestor's padding box, while the measurements resolve against
 * the row itself, so giving the row no padding keeps the two in the same coordinate space. Putting the
 * padding on the outer pill-shaped track instead would offset the indicator by exactly that padding.
 *
 * `tabs` is [{ key, label }]; the active key is `value`.
 */
export default function TabPills({ tabs, value, onChange, label }) {
  const row = useRef(null)
  const [pill, setPill] = useState(null) // { x, w }, once measured

  const measure = useCallback(() => {
    const box = row.current
    const active = box?.querySelector('[data-active="true"]')
    if (!box || !active) return
    // Rects rather than offsetLeft/offsetWidth: those round to whole pixels, which shows as a shimmer on
    // the pill's edges when a label is a fraction of a pixel wide.
    const outer = box.getBoundingClientRect()
    const inner = active.getBoundingClientRect()
    setPill({ x: inner.left - outer.left, w: inner.width })
  }, [])

  // Before paint, so the pill is never briefly in the wrong place.
  useLayoutEffect(() => { measure() }, [measure, value, tabs])

  useEffect(() => {
    const box = row.current
    if (!box || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div className="rounded-full bg-subtle p-1">
      <div ref={row} role="tablist" aria-label={label} className="relative flex gap-1">
        {pill && (
          <span aria-hidden="true"
            // Slight overshoot on the way in: the pill arrives a touch past the target and settles back.
            className="absolute inset-y-0 left-0 rounded-full bg-card shadow transition-[transform,width] duration-[420ms] ease-[cubic-bezier(.34,1.4,.64,1)]"
            style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} />
        )}
        {tabs.map((t) => {
          const active = value === t.key
          return (
            <button key={t.key} type="button" role="tab" aria-selected={active} data-active={active}
              onClick={() => onChange(t.key)}
              // Until the pill has been measured the active tab carries the background itself, so the bar is
              // never briefly — or, if measuring somehow fails, permanently — left without one.
              className={`relative z-10 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-300 sm:px-4 lg:px-3 2xl:px-4
                ${active ? `text-primary ${pill ? '' : 'bg-card shadow'}` : 'text-muted hover:text-main'}`}>
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
