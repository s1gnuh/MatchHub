import LoadingSkeleton from './LoadingSkleton.jsx'

// Shared loading / error wrapper: renders children only when data is ready.
export default function AsyncBoundary({ loading, error, retry, children }) {
  if (loading) return <LoadingSkeleton count={3} />
  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">
        <p className="mb-3">{error}</p>
        <button onClick={retry} className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">
          Try again
        </button>
      </div>
    )
  }
  return children
}
