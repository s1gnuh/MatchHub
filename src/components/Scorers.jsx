import { Link } from 'react-router-dom'

// Top scorers list with goals / assists / penalties.
export default function Scorers({ scorers }) {
  if (!scorers.length) return <p className="py-12 text-center text-gray-500">No scorer data available.</p>
  return (
    <div className="animate-fade-in overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[420px] text-sm">
        <thead className="text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-3 py-3">#</th><th className="py-3">Player</th><th className="py-3">Team</th>
            <th className="px-2 py-3 text-center">Played</th>
            <th className="px-2 py-3 text-center">Assists</th>
            <th className="px-3 py-3 text-center">Goals</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={s.player.id} className="border-t border-gray-100 transition hover:bg-blue-50">
              <td className="px-3 py-2 font-semibold">{i + 1}</td>
              <td className="py-2 font-medium">{s.player.name}</td>
              <td className="py-2">
                <Link to={`/teams/${s.team.id}`} className="hover:text-primary">{s.team.shortName || s.team.name}</Link>
              </td>
              <td className="px-2 text-center">{s.playedMatches ?? '–'}</td>
              <td className="px-2 text-center">{s.assists ?? '–'}</td>
              <td className="px-3 text-center font-bold text-primary">{s.goals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
