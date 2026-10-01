import { useLang } from '../utils/i18n.jsx'

// Pulse-animated placeholders shown while data loads.
export default function LoadingSkeleton({ count = 6 }) {
  const { t } = useLang()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label={t('loading')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ animationDelay: `${i * 80}ms` }} className="flex animate-pulse overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex w-20 items-center justify-center border-r border-line"><div className="h-4 w-10 rounded bg-subtle" /></div>
          <div className="flex-1 space-y-3 p-4">
            <div className="h-2.5 w-24 rounded bg-subtle" />
            <div className="flex items-center gap-3"><div className="h-6 w-6 rounded-full bg-subtle" /><div className="h-3 w-32 rounded bg-subtle" /></div>
            <div className="flex items-center gap-3"><div className="h-6 w-6 rounded-full bg-subtle" /><div className="h-3 w-28 rounded bg-subtle" /></div>
          </div>
        </div>
      ))}
    </div>
  )
}
