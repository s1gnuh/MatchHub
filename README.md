<div align="center">

# ⚽ MatchHub

**A fast, responsive football schedule app: fixtures, results, standings, top scorers and squads for the top football leagues.**

[**Live demo →**](https://match-hub-xi.vercel.app/)

React 18 · Vite · Tailwind CSS · TanStack Query · PWA

</div>

---

## About the app

I watch a lot of football, and every week I found myself asking the same question: *who plays when, and at what time in Vietnam?*

Answering it was always more work than it should be. I had to open a big sports website, close a pop-up or two, scroll past news, ads and betting banners, and then convert kickoff times from some other timezone in my head. Do that a few times a day, every day, and the small annoyance adds up.

MatchHub is the app I wanted instead: one clean page that opens fast, shows only fixtures and results, and already uses **Hanoi time**. Pick a league, glance at the schedule, done. No clutter, no mental maths.

### The pain points it solves

| The annoyance | How MatchHub handles it |
| --- | --- |
| Heavy pages full of ads, news and pop-ups just to see one fixture | A lightweight page with only fixtures, results, standings, scorers and squads |
| Kickoff times shown in the wrong timezone | Every time and date is shown in Hanoi time (GMT+7), wherever you open it |
| Digging through menus to reach your favourite league | Premier League opens by default, and one tap on the chip bar switches league |
| Not remembering a team's league or exact name | Live search by team or league |
| Having to open several sites for the table, top scorers and squads | One league page with Matches, Standings, Scorers and Teams tabs |
| Slow loading every time you come back | Cached responses, so revisiting a tab is instant and does not hit the API again |
| English-only interfaces | English / Vietnamese switch, remembered between visits |

### Why I built it

It started as a small personal tool to save myself a few clicks a day. It was also a good excuse to practise building a real product end to end: React and Tailwind for the UI, TanStack Query for caching, and a serverless proxy that keeps the API key off the client. If it saves you the same daily detour, it has done its job.

---

## Screenshots

### Matches (desktop)
One full-width screen: the match list, the selected match (form, head to head, squads) and the league table, each column scrolling on its own.

![Matches](app%20picture/v2-matches-desktop.png)

### Leagues
All supported competitions with their logos.

![Leagues](app%20picture/v2-leagues.png)

### Standings
Goals for / against, goal difference, recent form and a season picker.

![Standings](app%20picture/v2-standings.png)

### Top scorers
Age, matches, assists, penalties and goals; names open a player page.

![Top scorers](app%20picture/v2-scorers.png)

### Team page
Club info, competitions and the full squad grouped by position, with ages and links to player pages.

![Team page](app%20picture/v2-team.png)

### Phone
Phones keep the simple flow: list first, tap a match to open it.

<img src="app%20picture/v2-mobile-list.png" alt="Matches on a phone" width="320" />

---

## Features

- **Fixtures & results** for 10 competitions, with **Premier League** selected by default. Switch league from the chip bar (with league logos); **Upcoming** and **Results** are grouped by matchday (or knockout round) and cover the **whole season**, results newest first.
- **Rounds view:** step through any matchday or knockout round with prev/next buttons or a dropdown.
- **Table position on match cards:** each team's current league position (`#3`) is shown until the match is finished.
- **Live search** by team or league name, with a result count.
- **Full-width desktop layout** (≥1024px): match list, the selected match and the league table (from 1360px) side by side, each column scrolling on its own. Opening a match from the list costs no API request. Phones and tablets keep the list → match page flow.
- **Standings** with goals for / against, goal difference and a **recent-form** column (last 5 results), plus a **season picker** for the last few seasons (the free plan limits how far back it goes). Top three get gold / silver / bronze badges.
- **Top scorers** with age, matches, assists and penalties; names open a **player page** (shirt number, position, nationality, age, current team). Squads show ages and link to player pages too.
- **Match insights:** recent form of both teams and **head to head** (this season, or earlier seasons on request), with **AET / Pens** badges and stage names (Quarter-finals, Final…) for cup matches.
- **Match page** with score, kickoff countdown, referee and the **squads of both teams** (players grouped by position, plus the coach).
- **League pages** with four tabs: Matches, Standings, Top Scorers and Teams. **Team pages** with club info, running competitions and the full squad.
- **Live feel:** pulsing LIVE dot, kickoff countdown, today's matches highlighted, and a back-to-top button.
- **Hanoi time (GMT+7)** for every kickoff time and date, whatever the visitor's timezone.
- **English / Vietnamese** language switch (remembered between visits), including localised league names (e.g. *Ngoại hạng Anh*, *VĐQG Tây Ban Nha (La Liga)*).
- **Installable (PWA):** add it to your home screen; the app shell opens offline and the last loaded data is still shown.
- **Black & gold dark UI** inspired by SofaScore, with page transitions, hover effects and skeleton loaders. Animations respect `prefers-reduced-motion`.
- **Smart caching** with TanStack Query (in memory) and `localStorage`, so revisiting a tab does not call the API again, and the last known data is still shown when you are offline or rate-limited.
- **Rate-limit friendly:** a client-side throttle stops requests before the API's limit and shows a friendly "slow down" message instead of an error; heavier data (squads, earlier-season head to head) loads only when needed.
- Friendly error states with a retry button.

### Supported competitions

Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League, Eredivisie, Primeira Liga, Championship and Campeonato Brasileiro Série A.

## Tech stack

| Area | Choice |
|---|---|
| Build tool | [Vite](https://vitejs.dev) 5 |
| UI | React 18, React Router 6 (`HashRouter`) |
| Styling | Tailwind CSS 3 (CSS-variable design tokens) |
| Data fetching | [TanStack Query](https://tanstack.com/query) 5 + Axios |
| Icons | React Icons |
| Data source | [football-data.org](https://www.football-data.org) v4 (free tier) |
| PWA | Hand-written service worker (`public/sw.js`) + web manifest |
| Hosting | Vercel (recommended) or GitHub Pages |

## Getting started

### 1. Get an API key

Register for free at <https://www.football-data.org/client/register>. The key is sent to your email.

### 2. Install and run

```bash
git clone https://github.com/s1gnuh/MatchHub.git
cd MatchHub
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Edit `.env` and put your key in `VITE_API_KEY`, then:

```bash
npm run dev               # http://localhost:5173
```

> **Windows PowerShell** may block `npm` scripts. Use `npm.cmd run dev`, or run  
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` once.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (proxies `/api` to football-data.org) |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |

### Environment variables

| Variable | Where | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `.env` | API base URL. Default `/api` (proxied). |
| `VITE_API_KEY` | `.env` (local dev only) | Your football-data.org token, sent by the dev server proxy. |
| `FOOTBALL_DATA_KEY` | Vercel / Cloudflare **server** env | Token used by the production proxy. Never exposed to the browser. |

## How the API proxy works

football-data.org only allows browser requests from `http://localhost`, so a deployed site cannot call it directly. MatchHub always calls a relative `/api/...` path and a proxy forwards it:

| Environment | Proxy | Adds the API key from |
|---|---|---|
| `npm run dev` | Vite dev server (`vite.config.js`) | `VITE_API_KEY` in `.env` |
| Vercel | Serverless function [`api/proxy.js`](api/proxy.js), reached through the rewrite in [`vercel.json`](vercel.json) | `FOOTBALL_DATA_KEY` env var |
| GitHub Pages | Cloudflare Worker in [`worker/`](worker) | `FOOTBALL_DATA_KEY` worker secret |

Only `matches`, `competitions`, `teams` and `persons` paths are forwarded. Responses are edge-cached so many visitors share one upstream request: 5 minutes for fixtures and matches, 15 minutes for standings and scorers, 6 hours for head to head, 24 hours for teams, players and competition info.

Endpoints used: `/competitions/{code}` (season list), `/competitions/{code}/matches`, `/competitions/{code}/standings`, `/competitions/{code}/scorers`, `/competitions/{code}/teams` (also carries every squad), `/matches/{id}`, `/matches/{id}/head2head`, `/teams/{id}`, `/persons/{id}`.

## Deployment

### Vercel (recommended)

1. Import the repository on [Vercel](https://vercel.com) (framework preset: **Vite**).
2. Add the environment variable **`FOOTBALL_DATA_KEY`** with your football-data.org token (all environments).
3. Deploy. Redeploy after adding or changing environment variables.

### GitHub Pages

GitHub Pages is static, so it needs the Cloudflare Worker proxy:

1. Deploy the worker (free Cloudflare account):
   ```bash
   cd worker
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put FOOTBALL_DATA_KEY
   ```
   Make sure `ALLOWED_ORIGINS` in `worker/wrangler.toml` contains your Pages origin. After pulling updates that touch `worker/`, run `npx wrangler deploy` again.
2. In the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Under **Settings → Secrets and variables → Actions → Variables** add `VITE_API_BASE_URL` (the worker URL, no trailing slash).
4. Push to `main`. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes the site.

The app uses a relative Vite `base` and `HashRouter` (URLs look like `/#/leagues/PL`), so it works from any sub-path without server-side fallbacks.

## Project structure

```
MatchHub/
├── api/proxy.js            # Vercel serverless proxy (adds the API key server-side)
├── worker/                 # Cloudflare Worker proxy (for GitHub Pages)
├── public/                 # Static assets: logo, PWA manifest, icons, service worker (sw.js)
├── src/
│   ├── components/         # MatchCard, MatchList, RoundList, LeagueMatches, MatchPanel, MatchInsights,
│   │                       # Standings, StandingsMini, Scorers, TeamSquad, TeamGrid, Header, SearchFilter…
│   ├── pages/              # Home (also serves /matches/:id), Leagues, Competition, MatchDetail,
│   │                       # TeamDetail, PlayerDetail, NotFound
│   ├── services/api.js     # Axios client, cache, throttle, competitions list, endpoint functions
│   ├── utils/
│   │   ├── helpers.js      # Hanoi-time formatting, status badges, league names and colours
│   │   ├── i18n.jsx        # EN / VI dictionary and language provider
│   │   ├── form.js         # Recent form and head to head from a match list
│   │   ├── useApi.js       # TanStack Query wrapper used by every page
│   │   └── useMatch.js …   # cache-first match lookup, table positions, media query, shared clock
│   ├── styles/global.css   # Design tokens (black & gold palette)
│   ├── App.jsx             # Layout + routes + page transition
│   └── main.jsx            # Providers (Query, Language, Router) + service worker registration
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

## Rate limits and caching

The free football-data.org tier allows **10 requests per minute**. MatchHub stays within it by:

1. Keeping fetched data fresh in memory (TanStack Query) and in `localStorage`: 10 minutes for fixtures, 30 minutes for tables and scorers, 6 hours for head to head, 24 hours for squads, players and competition info. If a request fails, the last stored copy is shown.
2. Not refetching when the window regains focus.
3. Skipping retries on key / rate-limit errors.
4. Blocking the 10th uncached request within a minute on the client, with a friendly message.
5. Caching proxy responses at the edge (5 minutes to 24 hours, see above).
6. Reusing data already loaded: opening a match reads it from the competition's match list, the side table and the position badges share one standings request, and one `/teams` request covers every squad of a league.
7. Loading heavy extras only on demand: squads when scrolled into view (or on a click for the default match on desktop) and earlier-season head to head on a click.

Because all visitors of a deployed site share one API key, a very busy site can still hit the limit. In that case users see the same "slow down" message.

## Customising

- **Colours:** edit the CSS variables in `src/styles/global.css`.
- **Languages / wording:** edit `src/utils/i18n.jsx`.
- **Leagues:** edit the `COMPETITIONS` list in `src/services/api.js` (code, name, country and emblem URL) and add a `league.<code>` string per language in `src/utils/i18n.jsx` for the localised name. The free tier only covers the competitions listed on football-data.org.
- **Default league:** change `DEFAULT_LEAGUE` in `src/pages/Home.jsx`.

## Credits

- Football data from [football-data.org](https://www.football-data.org).
- Built by **s1gnuh** · [GitHub](https://github.com/s1gnuh) · [Instagram](https://www.instagram.com/s1gnuh/) · [Facebook](https://www.facebook.com/viet.hung.183615/)
