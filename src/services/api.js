import axios from 'axios'
import { apiDate } from '../utils/helpers.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.football-data.org/v4'
const API_KEY = import.meta.env.VITE_API_KEY
const hasKey = API_KEY && API_KEY !== 'your_api_key_here'

// Free tier allows 10 requests/min, so responses are cached for 10 minutes.
const CACHE_TTL = 10 * 60 * 1000

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'X-Auth-Token': API_KEY || '' },
})

/** Read a non-expired entry from sessionStorage (survives reloads, not tabs). */
function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { time, data } = JSON.parse(raw)
    return Date.now() - time < CACHE_TTL ? data : null
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data }))
  } catch {
    /* storage full or unavailable – caching is best-effort */
  }
}

/** Error with a machine-readable code ("noKey" | "rate" | "auth" | "timeout" | "network" | "http"); the UI translates it. */
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
  // football-data.org answers 400 "API token is invalid" for bad keys
  if (status === 400 || status === 401 || status === 403) return new ApiError('auth', status)
  if (err.code === 'ECONNABORTED') return new ApiError('timeout')
  if (!err.response) return new ApiError('network')
  return new ApiError('http', status)
}
/** Cached GET. Throws an ApiError. */
async function get(path, params, cacheKey = `matchhub:${path}:${JSON.stringify(params || {})}`) {
  if (!hasKey) {
    throw new ApiError('noKey')
  }
  const cached = readCache(cacheKey)
  if (cached) return cached
  try {
    const { data } = await client.get(path, { params })
    writeCache(cacheKey, data)
    return data
  } catch (err) {
    throw toApiError(err)
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
export const fetchStandings = (code) => get(`/competitions/${code}/standings`).then((d) => d.standings)
export const fetchScorers = (code) => get(`/competitions/${code}/scorers`).then((d) => d.scorers)
export const fetchTeams = (code) => get(`/competitions/${code}/teams`).then((d) => d.teams)
export const fetchTeam = (id) => get(`/teams/${id}`)

