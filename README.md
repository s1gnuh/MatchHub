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

## Deploy to Vercel

Import the repo, then add `VITE_API_BASE_URL=/api` (proxied by `vercel.json`) and `VITE_API_KEY` as environment variables. Build command `npm run build`, output `dist`. `vercel.json` handles SPA routing.

> Note: the API key is embedded in the client bundle. This is fine for the free tier, but use a serverless proxy if you need to keep it private.

