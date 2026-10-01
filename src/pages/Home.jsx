import { useEffect, useMemo, useState } from 'react'
import SearchFilter from '../components/SearchFilter.jsx'
import MatchList from '../components/MatchList.jsx'
import LoadingSkeleton from '../components/LoadingSkleton.jsx'
import { fetchMatches } from '../services/api.js'

export default function Home() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState('')
  const [attempt, setAttempt] = useState(0) // bump to retry

  // Fetch on mount (and on retry).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMatches()
      .then((data) => !cancelled && setMatches(data))
      .catch((e) => !cancelled && setError(e.userMessage || 'Something went wrong.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [attempt])

  const leagues = useMemo(
    () => [...new Set(matches.map((m) => m.competition?.name).filter(Boolean))].sort(),
    [matches]
  )

  // Live filter: team name or league text, plus dropdown league.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return matches.filter((m) => {
      if (league && m.competition?.name !== league) return false
      if (!q) return true
      return [m.homeTeam?.name, m.awayTeam?.name, m.homeTeam?.shortName, m.awayTeam?.shortName, m.competition?.name]
        .some((s) => s?.toLowerCase().includes(q))
    })
  }, [matches, search, league])

  const clear = () => { setSearch(''); setLeague('') }

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold">Upcoming Matches</h1>
      <SearchFilter
        search={search} onSearch={setSearch}
        league={league} onLeague={setLeague}
        leagues={leagues} count={filtered.length} onClear={clear}
      />
      {loading && <LoadingSkeleton />}
      {error && (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-700" role="alert">
          <p className="mb-3">{error}</p>
          <button onClick={() => setAttempt((n) => n + 1)} className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">
            Try again
          </button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">No matches found. Try a different search.</p>
      )}
      {!loading && !error && filtered.length > 0 && <MatchList matches={filtered} />}
    </>
  )
}
