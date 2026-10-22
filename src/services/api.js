import axios from 'axios'
import { dayKey } from '../utils/helpers.js'
import {
  GOAL_COMPETITIONS, isGoalId,
  fetchGoalCompetitionMatches, fetchGoalMatch, fetchGoalPerson, fetchGoalScorers,
  fetchGoalStandings, fetchGoalTeam, fetchGoalTeams, fetchGoalWindow,
} from './goalApi.js'

// Default "/api": proxied by Vite in dev and by the serverless function in /api on Vercel.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const rawKey = import.meta.env.VITE_API_KEY
const API_KEY = rawKey && rawKey !== 'your_api_key_here' ? rawKey : ''
// A browser key is only mandatory when calling football-data.org directly. Behind a proxy
// (Vercel function / Cloudflare Worker) the key lives on the server and is not exposed.
const DIRECT = BASE_URL.includes('api.football-data.org')
const hasKey = !DIRECT || Boolean(API_KEY)

// Free tier allows 10 requests/min, so responses are cached. Rarely-changing data lives longer.
const MIN = 60 * 1000
function cacheTtl(path) {
  if (/(^|\/)(teams|persons)(\/|$)/.test(path)) return 24 * 60 * MIN // squads, coaches, club and player info
  if (/^\/?competitions\/[^/]+$/.test(path)) return 24 * 60 * MIN     // competition info and season list
  if (/\/head2head$/.test(path)) return 6 * 60 * MIN                   // all-time record barely changes
  if (/\/(standings|scorers)$/.test(path)) return 30 * MIN            // change only after a match ends
  return 10 * MIN                                                      // fixtures, results, match detail
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  // Sent only when a key is configured (local dev); the server-side proxies add their own otherwise.
  headers: API_KEY ? { 'X-Auth-Token': API_KEY } : {},
})

const PREFIX = 'matchhub:'

/** Read an entry from localStorage (survives reloads and offline starts). Pass ttl = Infinity to accept stale data. */
function readCache(key, ttl) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { time, data } = JSON.parse(raw)
    return Date.now() - time < ttl ? data : null
  } catch {
    return null
  }
}

function writeCache(key, data) {
  const value = JSON.stringify({ time: Date.now(), data })
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage full (day-stamped keys pile up): drop our old entries and retry once. Caching is best-effort.
    try {
      Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k))
      localStorage.setItem(key, value)
    } catch { /* storage unavailable */ }
  }
}

/** Error with a machine-readable code ("noKey" | "rate" | "auth" | "restricted" | "timeout" | "network" | "http"); the UI translates it. */
export class ApiError extends Error {
  constructor(code, status) {
    super(code)
    this.code = code
    this.status = status
  }
}

function toApiError(err) {
  const status = err.response?.status
  if (status === 429) return new ApiError('rate', status)
  // 403 = resource outside the free plan (e.g. old seasons); bad keys answer 400 "API token is invalid"
  if (status === 403) return new ApiError('restricted', status)
  if (status === 400 || status === 401) return new ApiError('auth', status)
  if (err.code === 'ECONNABORTED') return new ApiError('timeout')
  if (!err.response) return new ApiError('network')
  return new ApiError('http', status)
}
// Client-side throttle: the free tier allows 10 requests/min, so stop earlier than the API does
// (cache hits don't count). The UI then shows the "slow down" message instead of an API error.
const MAX_PER_MINUTE = 9
const sent = []
function allowRequest() {
  const now = Date.now()
  while (sent.length && now - sent[0] > 60000) sent.shift()
  if (sent.length >= MAX_PER_MINUTE) return false
  sent.push(now)
  return true
}

/** How index.html and this module agree on a request: "/matches?competitions=PL,PD,…&dateFrom=…". */
const earlyKey = (path, params) => {
  const qs = params ? new URLSearchParams(params).toString() : ''
  return qs ? `${path}?${qs}` : path
}

/** A request the page already started from index.html (see the inline script there), or null. Used once. */
function takeEarly(path, params) {
  const early = typeof window !== 'undefined' ? window.__early : null
  const key = earlyKey(path, params)
  const p = early?.[key]
  if (p) delete early[key]
  return p || null
}

/** Cached GET. Throws an ApiError. */
async function get(path, params, cacheKey = `${PREFIX}${path}:${JSON.stringify(params || {})}`) {
  if (!hasKey) {
    throw new ApiError('noKey')
  }
  const cached = readCache(cacheKey, cacheTtl(path))
  if (cached) return cached
  // Offline, timed out or throttled: showing the last known data beats an error screen.
  const stale = () => readCache(cacheKey, Infinity)
  if (!allowRequest()) {
    const old = stale()
    if (old) return old
    throw new ApiError('rate', 429)
  }
  try {
    const early = takeEarly(path, params)
    if (early) {
      try {
        const data = await early
        writeCache(cacheKey, data)
        return data
      } catch { /* the early request failed: fall through to a normal one */ }
    }
    const { data } = await client.get(path, { params })
    writeCache(cacheKey, data)
    return data
  } catch (err) {
    const apiErr = toApiError(err)
    const old = apiErr.code === 'auth' ? null : stale()
    if (old) return old
    throw apiErr
  }
}

/** Free-tier competitions used for navigation. `emblem` is the URL the API's /competitions endpoint reports
 * (not always "<code>.png"), stored here so showing it costs no request.
 * Adding or removing one: index.html prefetches the upcoming list and repeats these codes to build the same
 * request — update them there too, or that head start is quietly thrown away. */
const EMBLEM = 'https://crests.football-data.org/'
/** The ones football-data.org serves. Only these can go in the one multi-league request it offers. */
export const FD_COMPETITIONS = [
  { code: 'PL', name: 'Premier League', country: 'England', emblem: `${EMBLEM}PL.png` },
  { code: 'PD', name: 'La Liga', country: 'Spain', emblem: `${EMBLEM}laliga.png` },
  { code: 'SA', name: 'Serie A', country: 'Italy', emblem: `${EMBLEM}c111.png` },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany', emblem: `${EMBLEM}BL1.png` },
  { code: 'FL1', name: 'Ligue 1', country: 'France', emblem: `${EMBLEM}FL1.png` },
  { code: 'CL', name: 'Champions League', country: 'Europe', emblem: `${EMBLEM}CL.png` },
  { code: 'ELC', name: 'Championship', country: 'England', emblem: `${EMBLEM}ELC.png` },
  { code: 'BSA', name: 'Série A', country: 'Brazil', emblem: `${EMBLEM}bsa.png` },
]

/** Every competition the app navigates, whichever provider serves it. The Vietnamese ones carry
 * `provider: 'goal'` and a `has` map saying which tabs they have data for; see services/goalApi.js. */
export const COMPETITIONS = [...FD_COMPETITIONS, ...GOAL_COMPETITIONS]

/** Which provider owns a competition code, so each call reaches the right API. */
const isGoalCode = (code) => GOAL_COMPETITIONS.some((c) => c.code === code)

/**
 * localStorage cache around a loader that is not a football-data GET. The Vietnamese provider has its own
 * client, its own key and its own daily quota, so it deliberately skips `allowRequest()` — throttling it
 * against football-data's 10-a-minute would hold back requests that do not count towards that limit.
 * The store and the stale-on-failure behaviour are the same.
 */
async function cachedCall(cacheKey, ttl, load) {
  const key = PREFIX + cacheKey
  const hit = readCache(key, ttl)
  if (hit) return hit
  try {
    const data = await load()
    writeCache(key, data)
    return data
  } catch (err) {
    const old = readCache(key, Infinity)
    if (old) return old
    throw err
  }
}

// A stored match list: per competition ("/competitions/PL/matches:{}"), across them ("/matches:{…}") or from
// the Vietnamese provider ("goal/window:…", "goal/season/VL1"), but never a single stored match
// ("/matches/560603:{}"). football-data stores its lists under `matches`; the adapter stores plain arrays.
const MATCH_LIST = /^\/matches:|^\/competitions\/[^/]+\/matches:|^goal\/(window|season)/

/** A match taken from a stored, still-fresh match list, or null (lets match views skip a request).
 * Ids are compared as strings: football-data numbers them, the Vietnamese provider uses cuids. */
export function findStoredMatch(id) {
  const want = String(id)
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(PREFIX) || !MATCH_LIST.test(key.slice(PREFIX.length))) continue
      const stored = readCache(key, cacheTtl('/matches'))
      const list = Array.isArray(stored) ? stored : stored?.matches
      const m = list?.find((x) => String(x.id) === want)
      if (m) return m
    }
  } catch { /* storage unavailable */ }
  return null
}

export const fetchCompetitionMatches = (code) =>
  isGoalCode(code)
    ? cachedCall(`goal/season/${code}`, 10 * MIN, () => fetchGoalCompetitionMatches(code))
    : get(`/competitions/${code}/matches`).then((d) => d.matches)

/** One match. A cuid id belongs to the Vietnamese provider, a numeric one to football-data. */
export const fetchMatch = (id) =>
  isGoalId(id)
    ? cachedCall(`goal/match/${id}`, 10 * MIN, () => fetchGoalMatch(id))
    : get(`/matches/${id}`)

/** Days the upcoming list covers. football-data.org answers 400 for a period longer than this. */
export const UPCOMING_DAYS = 10
const dayFromNow = (n) => dayKey(new Date(Date.now() + n * 86400000).toISOString())

/** Query for the upcoming list. Only football-data competitions: it is that API's own multi-league request.
 * Key order matters — index.html builds the same string to prefetch it. */
export const upcomingParams = () => ({
  competitions: FD_COMPETITIONS.map((c) => c.code).join(','),
  dateFrom: dayFromNow(0),
  dateTo: dayFromNow(UPCOMING_DAYS - 1),
})

/** Every football-data match for the next UPCOMING_DAYS days, in a single request. The home screen runs on
 * this: switching league there filters this list instead of calling the API again. */
export const fetchUpcoming = () => get('/matches', upcomingParams()).then((d) => d.matches)

/** Same as fetchUpcoming but skips the localStorage read — used for live polling so each call
 *  hits the API and catches status/score changes without waiting for the 10-minute TTL. */
export const fetchUpcomingFresh = () => {
  const key = `${PREFIX}/matches:${JSON.stringify(upcomingParams())}`
  try { localStorage.removeItem(key) } catch {}
  return get('/matches', upcomingParams()).then((d) => d.matches)
}

/** The same window for the Vietnamese competitions, from the other provider. A separate request by
 * necessity — the two APIs cannot be asked together — so utils/useUpcoming.js keeps it off the critical
 * path and merges it in when it arrives. */
export const fetchUpcomingGoal = () => {
  const from = dayFromNow(0), to = dayFromNow(UPCOMING_DAYS - 1)
  return cachedCall(`goal/window:${from}:${to}`, 10 * MIN, () => fetchGoalWindow(from, to))
}

// `season` = start year (e.g. 2024); omit for the current season. The free plan only covers the last few
// seasons, and the Vietnamese provider is only asked for the current one.
const seasonParam = (season) => (season ? { season } : undefined)
export const fetchStandings = (code, season) =>
  isGoalCode(code)
    ? cachedCall(`goal/standings/${code}`, 30 * MIN, () => fetchGoalStandings(code))
    : get(`/competitions/${code}/standings`, seasonParam(season)).then((d) => d.standings)
export const fetchScorers = (code, season) =>
  isGoalCode(code)
    ? cachedCall(`goal/scorers/${code}`, 30 * MIN, () => fetchGoalScorers(code))
    : get(`/competitions/${code}/scorers`, seasonParam(season)).then((d) => d.scorers)
export const fetchCompetition = (code) => get(`/competitions/${code}`)
/** Earlier meetings of the two teams of a match: { aggregates, matches }. Aggregates cover the full history.
 * football-data only; the Vietnamese provider has no head-to-head endpoint, and MatchInsights falls back to
 * working the record out of the competition's own match list. */
export const fetchHead2Head = (matchId) => get(`/matches/${matchId}/head2head`, { limit: 10 })
export const fetchPerson = (id) =>
  isGoalId(id)
    ? cachedCall(`goal/person/${id}`, 24 * 60 * MIN, () => fetchGoalPerson(id))
    : get(`/persons/${id}`)
export const fetchTeams = (code) =>
  isGoalCode(code)
    ? cachedCall(`goal/teams/${code}`, 24 * 60 * MIN, () => fetchGoalTeams(code))
    : get(`/competitions/${code}/teams`).then((d) => d.teams)
export const fetchTeam = (id) =>
  isGoalId(id)
    ? cachedCall(`goal/team/${id}`, 24 * 60 * MIN, () => fetchGoalTeam(id))
    : get(`/teams/${id}`)

