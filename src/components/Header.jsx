import { Link } from 'react-router-dom'

// Sticky top bar with logo and tagline.
export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-primary text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          Match<span className="text-accent">Hub</span>
        </Link>
        <span className="hidden text-sm text-blue-100 sm:block">Your football fixtures, simplified</span>
      </div>
    </header>
  )
}
