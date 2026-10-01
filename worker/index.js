// Cloudflare Worker: CORS proxy for football-data.org.
//
// Why: football-data.org only allows browser requests from http://localhost, so a site on
// GitHub Pages cannot call it directly. This worker forwards GET requests, adds the API key
// from a secret (so it never ships in the browser bundle) and returns proper CORS headers.
//
// Config (see wrangler.toml / `wrangler secret put`):
//   FOOTBALL_DATA_KEY  secret  – your football-data.org API token
//   ALLOWED_ORIGINS    var     – comma-separated list of allowed origins

const UPSTREAM = 'https://api.football-data.org/v4'
const ALLOWED_PATHS = /^\/(matches|competitions|teams|persons)(\/|$)/

// Edge-cache lifetime in seconds: squads, players and competition info rarely change, tables only after a match.
const maxAge = (p) =>
  /(^|\/)(teams|persons)(\/|$)/.test(p) || /^\/?competitions\/[^/]+$/.test(p) ? 86400
    : /\/head2head$/.test(p) ? 21600
    : /\/(standings|scorers)$/.test(p) ? 900
    : 300

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
    const originOk = allowed.includes(origin)

    const cors = {
      'Access-Control-Allow-Origin': originOk ? origin : 'null',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Auth-Token',
      Vary: 'Origin',
    }
    const json = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'GET') return json(405, { message: 'Method not allowed' })
    // Only serve our own site, so other people cannot spend your API quota.
    if (!originOk) return json(403, { message: 'Origin not allowed' })

    const url = new URL(request.url)
    if (!ALLOWED_PATHS.test(url.pathname)) return json(404, { message: 'Not found' })

    const token = env.FOOTBALL_DATA_KEY || request.headers.get('X-Auth-Token') || ''
    const upstream = await fetch(UPSTREAM + url.pathname + url.search, {
      headers: { 'X-Auth-Token': token },
      // Edge-cache so many visitors share one upstream request (10 req/min limit).
      cf: { cacheTtl: maxAge(url.pathname), cacheEverything: true },
    })

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' },
    })
  },
}
