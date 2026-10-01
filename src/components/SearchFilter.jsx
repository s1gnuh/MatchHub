import { FiSearch, FiX } from 'react-icons/fi'

// Live search box + league dropdown + clear button + result count.
export default function SearchFilter({ search, onSearch, league, onLeague, leagues, count, onClear }) {
  const active = search || league
  return (
    <section className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search by team</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search team or league…"
            className="h-12 w-full rounded-lg border border-gray-200 pl-10 pr-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <select
          value={league}
          onChange={(e) => onLeague(e.target.value)}
          aria-label="Filter by league"
          className="h-12 rounded-lg border border-gray-200 bg-white px-3 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 md:w-64"
        >
          <option value="">All leagues</option>
          {leagues.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        {active && (
          <button
            onClick={onClear}
            className="flex h-12 items-center justify-center gap-1 rounded-lg bg-gray-100 px-4 text-gray-700 transition hover:bg-gray-200"
          >
            <FiX /> Clear
          </button>
        )}
      </div>
      <p className="mt-3 text-sm text-gray-500" aria-live="polite">
        {count} {count === 1 ? 'match' : 'matches'} found
      </p>
    </section>
  )
}
