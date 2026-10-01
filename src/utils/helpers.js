// Helper functions: date/time formatting, status labels and league colours.

/** "Sat, 3 Oct" in the user's locale/timezone. */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

/** "20:00" in the user's local timezone. */
export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

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
  SCHEDULED: { label: 'Scheduled', cls: 'bg-gray-100 text-gray-600' },
  TIMED: { label: 'Upcoming', cls: 'bg-blue-50 text-blue-700' },
  IN_PLAY: { label: 'Live', cls: 'bg-red-100 text-red-700 animate-pulse' },
  PAUSED: { label: 'Half-time', cls: 'bg-amber-100 text-amber-700' },
  FINISHED: { label: 'Finished', cls: 'bg-green-100 text-green-700' },
  POSTPONED: { label: 'Postponed', cls: 'bg-orange-100 text-orange-700' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-gray-200 text-gray-500' },
  SUSPENDED: { label: 'Suspended', cls: 'bg-orange-100 text-orange-700' },
}
export const statusInfo = (s) => STATUS[s] || { label: s, cls: 'bg-gray-100 text-gray-600' }

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
