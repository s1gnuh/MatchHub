import { BsStar, BsStarFill } from 'react-icons/bs'
import useFavourites from '../utils/useFavourites.js'
import { useLang } from '../utils/i18n.jsx'

/**
 * Star toggle for a team. Used on its own (TeamGrid, TeamDetail) and nested inside a Link (MatchPanel's
 * Side) — preventDefault + stopPropagation keep a tap from also following the link, the same trick
 * MatchCard's bell button uses.
 */
export default function FavouriteStar({ teamId, size = 15, className = '' }) {
  const { t } = useLang()
  const { isFavourite, toggle } = useFavourites()
  const on = isFavourite(teamId)
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(teamId) }}
      aria-label={on ? t('fav.remove') : t('fav.add')}
      title={on ? t('fav.remove') : t('fav.add')}
      className={`inline-flex items-center justify-center rounded-full bg-card/80 p-1.5 shadow-sm transition active:scale-90 ${on ? 'text-primary' : 'text-muted hover:text-primary'} ${className}`}
    >
      {on ? <BsStarFill size={size} /> : <BsStar size={size} />}
    </button>
  )
}
