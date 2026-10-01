// Helper functions: date/time formatting, status labels and league colours.

// Locale used for dates; set by LangProvider.
let locale
export const setLocale = (l) => { locale = l }

// All match times are shown in Hanoi, Vietnam time (GMT+7, no DST) whatever the visitor's timezone.
export const TIME_ZONE = 'Asia/Ho_Chi_Minh'

/** "Sat, 3 Oct" in Hanoi time. */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(locale, {
    timeZone: TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

/** "20:00" in Hanoi time. */
export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString(locale, {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

/** Hanoi-time YYYY-MM-DD key, used to group matches by day. */
export const dayKey = (iso) =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone: TIME_ZONE })

/** YYYY-MM-DD (Hanoi date) for API date params, offset by N days from today. */
export const apiDate = (offsetDays = 0) => dayKey(new Date(Date.now() + offsetDays * 86400000))

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
