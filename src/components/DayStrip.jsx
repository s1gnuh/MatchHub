import { useEffect, useRef } from 'react'
import { useLang } from '../utils/i18n.jsx'
import { formatWeekday, formatDayMonth, relativeDay } from '../utils/helpers.js'

/**
 * The days the home screen covers, as a horizontal strip: "Today / Tomorrow / Thu 20…" with how many
 * matches each one holds. A day with nothing on stays in the strip, dimmed rather than removed, so a quiet
 * Tuesday is never a dead end — the way out is always on screen.
 *
 * `days` is [{ key, iso, count }] in date order; `value` is the selected day key.
 */
export default function DayStrip({ days, value, onChange }) {
  const { t } = useLang()
  const wrap = useRef(null)

  // Keep the selected day in view: on a phone the strip is wider than the screen, and the automatic
  // choice may be several days along if today has no matches.
  useEffect(() => {
    const el = wrap.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [value])

  return (
    <div ref={wrap} role="tablist" aria-label={t('day.label')}
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {days.map((d) => {
        const rel = relativeDay(d.iso)
        const active = d.key === value
        const empty = !d.count
        return (
          <button key={d.key} type="button" role="tab" aria-selected={active} data-active={active}
            onClick={() => onChange(d.key)}
            // Lifts and fills gold when chosen; an empty day is faded but still reachable.
            className={`flex w-[4.75rem] shrink-0 flex-col items-center gap-0.5 rounded-xl border px-2 py-2 transition-all duration-300 active:scale-95
              ${active
                ? 'border-primary bg-primary text-black shadow-lg shadow-primary/25 -translate-y-0.5'
                : `border-line bg-card hover:border-primary/50 hover:bg-subtle ${empty ? 'opacity-45' : ''}`}`}>
            <span className={`text-[11px] font-bold uppercase leading-none ${active ? '' : rel === 'today' ? 'text-primary' : 'text-muted'}`}>
              {rel ? t(rel) : formatWeekday(d.iso)}
            </span>
            <span className="text-sm font-extrabold leading-none tabular-nums">{formatDayMonth(d.iso)}</span>
            <span className={`text-[10px] font-semibold leading-none tabular-nums ${active ? 'text-black/60' : 'text-muted'}`}>
              {d.count || '–'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
