// Helper functions: date/time formatting, status labels and league colours.

// Locale used for dates; set by LangProvider.
let locale
export const setLocale = (l) => { locale = l }

/** "Sat, 3 Oct" in the user's locale/timezone. */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

/** "20:00" in the user's local timezone. */
export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

/** Local YYYY-MM-DD key, used to group matches by day. */
export const dayKey = (iso) => {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** YYYY-MM-DD (UTC) for API date params, offset by N days from today. */
export const apiDate = (offsetDays = 0) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const STATUS = {
  SCHEDULED: { label: 'Scheduled', cls: 'bg-subtle text-muted' },
  TIMED: { label: 'Upcoming', cls: 'bg-primary/10 text-primary' },
  IN_PLAY: { label: 'Live', cls: 'bg-red-500/15 text-red-500 animate-pulse' },
  PAUSED: { label: 'Half-time', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  FINISHED: { label: 'FT', cls: 'bg-subtle text-muted' },
  POSTPONED: { label: 'Postponed', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-subtle text-muted' },
  SUSPENDED: { label: 'Suspended', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
}

/** Badge classes + label; pass the translate function `t` to localise the label. */
export const statusInfo = (s, t) => {
  const info = STATUS[s] || { label: s, cls: 'bg-subtle text-muted' }
  return { ...info, label: t && STATUS[s] ? t('status.' + s) : info.label }
}

// Stable colour per league code (falls back to blue).
const LEAGUE_COLORS = {
  PL: 'border-purple-500',
  PD: 'border-orange-500',
  SA: 'border-sky-500',
  BL1: 'border-red-500',
  FL1: 'border-indigo-500',
  CL: 'border-blue-800',
  DED: 'border-amber-500',
  PPL: 'border-green-600',
  ELC: 'border-pink-500',
  BSA: 'border-lime-500',
}
export const leagueColor = (code) => LEAGUE_COLORS[code] || 'border-primary'

/** Translation key ("today" | "tomorrow" | "yesterday") or null for other days. */
export const relativeDay = (iso) => {
  const diff = Math.round((new Date(dayKey(iso)) - new Date(dayKey(new Date().toISOString()))) / 86400000)
  return { 0: 'today', 1: 'tomorrow', '-1': 'yesterday' }[diff] || null
}
