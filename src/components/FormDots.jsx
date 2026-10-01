import { Link } from 'react-router-dom'

const COLOR = { W: 'bg-green-500', D: 'bg-zinc-500', L: 'bg-red-500' }

// Last results as small coloured squares (oldest to newest); each links to that match and shows the score on hover.
export default function FormDots({ form }) {
  if (!form.length) return <span className="text-muted">–</span>
  return (
    <span className="inline-flex gap-1">
      {form.map(({ r, match: m }) => (
        <Link key={m.id} to={`/matches/${m.id}`}
          title={`${m.homeTeam.shortName || m.homeTeam.name} ${m.score.fullTime.home}–${m.score.fullTime.away} ${m.awayTeam.shortName || m.awayTeam.name}`}
          className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white transition hover:scale-110 ${COLOR[r]}`}>
          {r}
        </Link>
      ))}
    </span>
  )
}
