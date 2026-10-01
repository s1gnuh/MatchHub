import useNow from '../utils/useNow.js'
import { useLang } from '../utils/i18n.jsx'

const DAY = 86400000

/** True when kickoff is in the future but less than 24 h away. */
export const startsSoon = (utcDate, at = Date.now()) => {
  const diff = new Date(utcDate) - at
  return diff > 0 && diff < DAY
}

const format = (diff) => {
  const m = Math.max(1, Math.ceil(diff / 60000))
  const h = Math.floor(m / 60)
  return h ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`
}

// "in 2h 15m" until kickoff; renders nothing once the match is more than 24 h away or has started.
export default function Countdown({ utcDate, className = '' }) {
  const { t } = useLang()
  const now = useNow()
  if (!startsSoon(utcDate, now)) return null
  return <span className={className}>{t('cd.in', { t: format(new Date(utcDate) - now) })}</span>
}
