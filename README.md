# MatchHub

Responsive football schedule app built with React 18, Vite, TailwindCSS and Axios. Data comes from [football-data.org](https://www.football-data.org).

## Setup

1. `npm install`
2. Get a free API key at https://www.football-data.org/client/register
3. `copy .env.example .env` and set `VITE_API_KEY`
4. `npm run dev` → http://localhost:5173

## Features

- Matches for the next 7 days, grouped by day, colour-coded by league
- Live search (team or league) and league filter, result count, clear button
- Leagues pages (`/leagues/:code`) with tabs: Matches (upcoming/results), Standings, Top Scorers, Teams
- Match detail (`/matches/:id`) and team detail with squad (`/teams/:id`)
- Skeleton loaders, friendly error messages with retry
- 10-minute `sessionStorage` cache to stay under the free-tier limit (10 req/min)

## Deploy to GitHub Pages

GitHub Pages is static hosting and football-data.org only allows browser requests from `http://localhost`, so the deployed site calls the API through a small free Cloudflare Worker (`worker/`) that adds CORS headers and keeps your API key secret.

1. **Deploy the worker** (needs a free Cloudflare account):
   ```
   cd worker
   npx wrangler login
   npx wrangler secret put FOOTBALL_DATA_KEY   # paste your football-data.org key
   npx wrangler deploy                          # prints https://matchhub-api.<you>.workers.dev
   ```
   `ALLOWED_ORIGINS` in `worker/wrangler.toml` must contain your Pages origin (default `https://s1gnuh.github.io`).
2. **Repo settings → Pages → Source: GitHub Actions.**
3. **Repo settings → Secrets and variables → Actions → Variables**, add:
   - `VITE_API_BASE_URL` = the worker URL (no trailing slash)
   - `VITE_KEYLESS` = `true`
4. Push to `main`: `.github/workflows/deploy.yml` builds and publishes to `https://<user>.github.io/MatchHub/`.

The app uses `HashRouter` (URLs look like `/#/leagues/PL`) because Pages has no SPA fallback, and a relative Vite `base`, so it works from any sub-path.

Without a worker you can instead add `VITE_API_KEY` as an Actions secret and leave `VITE_KEYLESS` unset, but the browser will be blocked by CORS and the key would be public in the bundle, so this is not recommended.
## Deploy to Vercel

1. Import the repo on Vercel (framework preset: Vite).
2. Add one environment variable: `FOOTBALL_DATA_KEY` = your football-data.org token (all environments), then deploy / redeploy.

`api/[...path].js` is a serverless function that proxies `/api/*` to football-data.org and adds the key on the server, so the key is never exposed in the browser and no `VITE_*` variables are needed. (Locally, `npm run dev` proxies `/api` via Vite and uses `VITE_API_KEY` from `.env`.)
