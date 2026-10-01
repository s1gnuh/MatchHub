import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <p className="mt-2 text-gray-600">That page is offside.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 text-white transition hover:bg-primary-dark">
        Back to matches
      </Link>
    </div>
  )
}
