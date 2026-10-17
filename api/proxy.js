// Vercel serverless function (reached through the /api/* rewrite in vercel.json): proxies to football-data.org and adds the API key server-side,
// so the key never ships in the browser bundle and no build-time env var is needed.
//
// Env (Vercel > Settings > Environment Variables): FOOTBALL_DATA_KEY
// (VITE_API_KEY is accepted as a fallback so an existing variable keeps working.)

const UPSTREAM = 'https://api.football-data.org/v4'
const ALLOWED = /^(matches|competitions|teams|persons)(\/|$)/

// Second provider, for the Vietnamese competitions football-data.org does not carry: /api/goal/<path> is
// forwarded to goal-api.com with its own key. It uses Bearer auth rather than a token header, and has its
// own daily quota, so it is kept separate from the football-data path rather than folded into it.
// Env: GOAL_API_KEY
const GOAL_UPSTREAM = 'https://api.goal-api.com/v1'
const GOAL_ALLOWED = /^(leagues|fixtures|standings|teams|players|countries)(\/|$)/

// Edge-cache lifetime in seconds: squads, players and competition info rarely change, tables only after a match.
// `players` is goal-api's name for what football-data calls `persons`.
const maxAge = (p) =>
  /(^|\/)(teams|persons|players)(\/|$)/.test(p) || /^\/?competitions\/[^/]+$/.test(p) ? 86400
    : /\/head2head$/.test(p) ? 21600
    : /\/(standings|scorers)$/.test(p) ? 900
    : 300
// How long a stale copy may still be served instantly while the edge refreshes it in the background. Visitors on a
// quiet site would otherwise often hit an expired entry and wait ~1-4 s for football-data.org.
const staleFor = (age) => (age >= 86400 ? 172800 : age >= 21600 ? 86400 : age >= 900 ? 21600 : 3600)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  // vercel.json rewrites /api/<anything> to /api/proxy?path=<anything>
  const { path = '', ...query } = req.query
  let subPath = [].concat(path).join('/').replace(/^\/+/, '')

  // "goal/<path>" picks the second provider; anything else is football-data.
  const goal = subPath === 'goal' || subPath.startsWith('goal/')
  if (goal) subPath = subPath.slice(5)

  const allowed = goal ? GOAL_ALLOWED : ALLOWED
  if (!allowed.test(subPath)) return res.status(404).json({ message: 'Not found' })

  const qs = new URLSearchParams(query).toString()
  const base = goal ? GOAL_UPSTREAM : UPSTREAM
  const headers = goal
    ? { Authorization: `Bearer ${process.env.GOAL_API_KEY || ''}` }
    : { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY || process.env.VITE_API_KEY || req.headers['x-auth-token'] || '' }

  try {
    const upstream = await fetch(`${base}/${subPath}${qs ? `?${qs}` : ''}`, { headers })
    // Share one upstream response between visitors (football-data's free tier allows 10 requests a minute,
    // goal-api's 1,000 a day, so both benefit).
    const age = maxAge(subPath)
    res.setHeader('Cache-Control', `public, s-maxage=${age}, stale-while-revalidate=${staleFor(age)}`)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.status(upstream.status).send(await upstream.text())
  } catch {
    return res.status(502).json({ message: 'Upstream request failed' })
  }
}
