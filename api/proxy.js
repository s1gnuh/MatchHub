// Vercel serverless function (reached through the /api/* rewrite in vercel.json): proxies to football-data.org and adds the API key server-side,
// so the key never ships in the browser bundle and no build-time env var is needed.
//
// Env (Vercel > Settings > Environment Variables): FOOTBALL_DATA_KEY
// (VITE_API_KEY is accepted as a fallback so an existing variable keeps working.)

const UPSTREAM = 'https://api.football-data.org/v4'
const ALLOWED = /^(matches|competitions|teams)(\/|$)/

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  // vercel.json rewrites /api/<anything> to /api/proxy?path=<anything>
  const { path = '', ...query } = req.query
  const subPath = [].concat(path).join('/').replace(/^\/+/, '')
  if (!ALLOWED.test(subPath)) return res.status(404).json({ message: 'Not found' })

  const qs = new URLSearchParams(query).toString()
  const token = process.env.FOOTBALL_DATA_KEY || process.env.VITE_API_KEY || req.headers['x-auth-token'] || ''

  try {
    const upstream = await fetch(`${UPSTREAM}/${subPath}${qs ? `?${qs}` : ''}`, {
      headers: { 'X-Auth-Token': token },
    })
    // Share one upstream response between visitors (free tier: 10 requests/min).
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.status(upstream.status).send(await upstream.text())
  } catch {
    return res.status(502).json({ message: 'Upstream request failed' })
  }
}
