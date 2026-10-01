import LoadingSkeleton from './LoadingSkeleton.jsx'
import { useLang } from '../utils/i18n.jsx'

// Shared loading / error wrapper: renders children only when data is ready.
export default function AsyncBoundary({ loading, error, retry, children }) {
  const { t } = useLang()
  if (loading) return <LoadingSkeleton count={6} />
  if (error) {
    return (
      <div className="animate-fade-in rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-600 dark:text-red-300" role="alert">
        <p className="mb-3">{t('err.' + (error.code || 'http'), { status: error.status ?? '' })}</p>
        <button onClick={retry} className="rounded-full bg-red-600 px-5 py-2 text-white transition hover:bg-red-700 active:scale-95">
          {t('retry')}
        </button>
      </div>
    )
  }
  return children
}

