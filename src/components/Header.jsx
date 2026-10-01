import { Link, NavLink } from 'react-router-dom'

const link = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`

// Sticky top bar with logo and navigation.
export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-primary text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          Match<span className="text-accent">Hub</span>
        </Link>
        <nav className="flex gap-1">
          <NavLink to="/" end className={link}>Matches</NavLink>
          <NavLink to="/leagues" className={link}>Leagues</NavLink>
        </nav>
      </div>
    </header>
  )
}
