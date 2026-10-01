import axios from 'axios'
import { apiDate } from '../utils/helpers.js'

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

/** Matches for the next `days` days (free tier limits range to 10 days). */
export const fetchMatches = (days = 7) =>
  get('/matches', { dateFrom: apiDate(0), dateTo: apiDate(days) }).then((d) => d.matches)

/** Free-tier competitions (code + name) used for navigation. */
export const COMPETITIONS = [
  { code: 'PL', name: 'Premier League', country: 'England' },
  { code: 'PD', name: 'La Liga', country: 'Spain' },
  { code: 'SA', name: 'Serie A', country: 'Italy' },
  { code: 'BL1', name: 'Bundesliga', country: 'Germany' },
  { code: 'FL1', name: 'Ligue 1', country: 'France' },
  { code: 'CL', name: 'Champions League', country: 'Europe' },
  { code: 'DED', name: 'Eredivisie', country: 'Netherlands' },
  { code: 'PPL', name: 'Primeira Liga', country: 'Portugal' },
  { code: 'ELC', name: 'Championship', country: 'England' },
  { code: 'BSA', name: 'Série A', country: 'Brazil' },
]

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

