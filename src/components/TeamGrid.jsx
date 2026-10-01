import { Link } from 'react-router-dom'

// Grid of team crests linking to team detail pages.
export default function TeamGrid({ teams }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {teams.map((t) => (
        <Link key={t.id} to={`/teams/${t.id}`}
          className="animate-fade-in flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm transition duration-200 hover:scale-[1.02] hover:shadow-lg">
          {t.crest ? <img src={t.crest} alt="" loading="lazy" className="h-16 w-16 object-contain" /> : <div className="h-16 w-16 rounded-full bg-gray-100" />}
          <span className="text-sm font-semibold">{t.shortName || t.name}</span>
        </Link>
      ))}
    </div>
  )
}
