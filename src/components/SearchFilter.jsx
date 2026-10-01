import { FiSearch, FiX } from 'react-icons/fi'
import { useLang } from '../utils/i18n.jsx'

// Live team/league search box with an inline clear button.
export default function SearchFilter({ search, onSearch }) {
  const { t } = useLang()
  return (
    <label className="relative block">
      <span className="sr-only">{t('search.label')}</span>
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={t('search.ph')}
        className="h-12 w-full rounded-full border border-line bg-card pl-11 pr-11 text-base text-main outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20"
      />
      {search && (
        <button type="button" onClick={() => onSearch('')} aria-label={t('search.clear')}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-subtle hover:text-main">
          <FiX />
        </button>
      )}
    </label>
  )
}


