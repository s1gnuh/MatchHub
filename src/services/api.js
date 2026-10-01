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

/** Turn axios errors into messages that make sense to end users. */
function friendlyError(err) {
  const status = err.response?.status
  if (status === 429) return 'Rate limit reached (10 requests/min). Please wait a minute and try again.'
  if (status === 401 || status === 403) return 'Invalid or missing API key. Check VITE_API_KEY in your .env file.'
  if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (!err.response) return 'Network error – check your connection (or CORS settings) and retry.'
  return `Could not load matches (error ${status}). Please try again later.`
}

/**
 * Fetch matches for the next `days` days (free tier limits range to 10 days).
 * Returns the `matches` array from Football-Data.org.
 */
export async function fetchMatches(days = 7) {
  if (!hasKey) {
    const err = new Error('No API key configured. Copy .env.example to .env and add your Football-Data.org key.')
    err.userMessage = err.message
    throw err
  }
  const params = { dateFrom: apiDate(0), dateTo: apiDate(days) }
  const key = `matchhub:${params.dateFrom}:${params.dateTo}`

  const cached = readCache(key)
  if (cached) return cached

  try {
    const { data } = await client.get('/matches', { params })
    writeCache(key, data.matches)
    return data.matches
  } catch (err) {
    const wrapped = new Error(friendlyError(err))
    wrapped.userMessage = wrapped.message
    throw wrapped
  }
}
