import axios from 'axios'

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

/** A request the page already started from index.html (see the inline script there), or null. Used once. */
function takeEarly(path, params) {
  const early = !params && typeof window !== 'undefined' ? window.__early : null
  const p = early?.[path]
  if (p) delete early[path]
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
 * (not always "<code>.png"), stored here so showing it costs no request. */
const EMBLEM = 'https://crests.football-data.org/'
export const COMPETITIONS = [
  { code: 'PL', name: 'Premier League', country: 'England', emblem: `${EMBLEM}PL.png` },
  { code: 'PD', name: 'La Liga', country: 'Spain', emblem: `${EMBLEM}laliga.png` },
  { code: 'SA', name: 'Serie A', country: 'Italy', emblem: `${EMBLEM}c111.png` },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany', emblem: `${EMBLEM}BL1.png` },
  { code: 'FL1', name: 'Ligue 1', country: 'France', emblem: `${EMBLEM}FL1.png` },
  { code: 'CL', name: 'Champions League', country: 'Europe', emblem: `${EMBLEM}CL.png` },
  { code: 'DED', name: 'Eredivisie', country: 'Netherlands', emblem: `${EMBLEM}ED.png` },
  { code: 'PPL', name: 'Primeira Liga', country: 'Portugal', emblem: `${EMBLEM}PPL.png` },
  { code: 'ELC', name: 'Championship', country: 'England', emblem: `${EMBLEM}ELC.png` },
  { code: 'BSA', name: 'Série A', country: 'Brazil', emblem: `${EMBLEM}bsa.png` },
]

/** A match taken from a stored, still-fresh competition match list, or null (lets match views skip a request). */
export function findStoredMatch(id) {
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(`${PREFIX}/competitions/`) || !key.endsWith('/matches:{}')) continue
      const m = readCache(key, cacheTtl('/matches'))?.matches?.find((x) => x.id === id)
      if (m) return m
    }
  } catch { /* storage unavailable */ }
  return null
}

export const fetchCompetitionMatches = (code) => get(`/competitions/${code}/matches`).then((d) => d.matches)
export const fetchMatch = (id) => get(`/matches/${id}`)
// `season` = start year (e.g. 2024); omit for the current season. The free plan only covers the last few seasons.
const seasonParam = (season) => (season ? { season } : undefined)
export const fetchStandings = (code, season) =>
  get(`/competitions/${code}/standings`, seasonParam(season)).then((d) => d.standings)
export const fetchScorers = (code, season) =>
  get(`/competitions/${code}/scorers`, seasonParam(season)).then((d) => d.scorers)
export const fetchCompetition = (code) => get(`/competitions/${code}`)
/** Earlier meetings of the two teams of a match: { aggregates, matches }. Aggregates cover the full history. */
export const fetchHead2Head = (matchId) => get(`/matches/${matchId}/head2head`, { limit: 10 })
export const fetchPerson = (id) => get(`/persons/${id}`)
export const fetchTeams = (code) => get(`/competitions/${code}/teams`).then((d) => d.teams)
export const fetchTeam = (id) => get(`/teams/${id}`)

