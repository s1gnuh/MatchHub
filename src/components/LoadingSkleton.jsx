// Pulse-animated placeholders shown while matches load.
export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading matches">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex justify-between">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-3 w-12 rounded bg-gray-200" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-16 w-1/4 rounded bg-gray-200" />
            <div className="h-6 w-12 rounded bg-gray-200" />
            <div className="h-16 w-1/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
