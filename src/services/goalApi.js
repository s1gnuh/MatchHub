// Vietnamese competitions, from goal-api.com.
//
// football-data.org's free plan has no Vietnamese football at all — its /competitions lists 13, none of them
// Vietnam — so these come from a second provider. Everything in this file exists to hide that from the rest
// of the app: each function returns football-data v4 shapes, so MatchCard, Standings, Scorers, TeamSquad and
// the rest keep reading the one shape they already understand.
//
// Translating is not a field rename. The differences that actually bite, all confirmed against the API:
//   - ids are cuid strings ("cmu75jnq…"), not numbers
//   - every number is a string, so "10" > "9" is false and scores must be coerced before any comparison
//   - there is no score.winner; it has to be worked out, penalty shoot-outs included
//   - teams have no short name or three-letter code, and a badge may be null
//   - the stage is tacked onto the league name ("Cup - 1/8-finals", "V.League 1 - Relegation Round")
//   - a player's position is in `type` ("Goalkeepers"), and is null for about half the squad
//   - the top-scorers rows carry no team id and no player id at all, only the upstream's own keys

import axios from 'axios'

// Proxied like the football-data calls so the key stays server-side: /api/goal/<path> is forwarded to
// https://api.goal-api.com/v1/<path> with the Authorization header added by the proxy. api/proxy.js, the
// Cloudflare worker and the Vite dev server all do this.
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api') + '/goal'
const PAGE = 100 // the API rejects limit > 100 with a validation error
const MAX_PAGES = 6 // a season is ~91 matches; this is headroom, not a target

const client = axios.create({ baseURL: BASE, timeout: 10000 })

/** The four Vietnamese competitions, with what each actually has data for (checked against the API).
 * `has` drives which tabs the league page offers, so a competition is never given a tab that can only
 * ever render empty. */
export const GOAL_COMPETITIONS = [
  {
    code: 'VL1', name: 'V.League 1', country: 'Vietnam', provider: 'goal',
    leagueId: 'cmr77dx4r00qrrx06byb1ounj',
    emblem: 'https://media.goal-api.com/badges/logo_leagues/339_vleague-1.png',
    has: { standings: true, scorers: true },
  },
  {
    code: 'VL2', name: 'V.League 2', country: 'Vietnam', provider: 'goal',
    leagueId: 'cmr77dx4r00qsrx06quc9utgw',
    emblem: 'https://media.goal-api.com/badges/logo_leagues/338_vleague-2.png',
    // The provider has a table for the second division but lists no scorers for it.
    has: { standings: true, scorers: false },
  },
  {
    code: 'VNC', name: 'Vietnamese Cup', country: 'Vietnam', provider: 'goal',
    leagueId: 'cmr77dx4r00qprx0632ibc0vo',
    emblem: 'https://media.goal-api.com/badges/logo_leagues/401_cup.png',
    // A knockout cup has no league table, and no scorers are published for it.
    has: { standings: false, scorers: false },
    knockout: true, // its league page gets a Bracket tab instead (see utils/bracket.js)
  },
]

/**
 * Club crests from the league's own site, vpf.vn, keyed by the provider's team id.
 *
 * Two reasons to override what the provider sends: several of its badges are missing outright (a club
 * promoted this season often has none), and the ones it does have are scraped stand-ins rather than the
 * crest the club and the league actually use. VPF is the competition organiser, so these are the real thing.
 *
 * The 150x150 variant is deliberate: the full-size files average 370 KB each for a crest drawn at 24px, and
 * the whole set is 541 KB at this size against 9.2 MB at full size.
 *
 * A club renamed between seasons appears under both names in the provider's data, so two ids can share one
 * crest — PVF-CAND and Hưng Yên are the same club. Two clubs are deliberately absent: vpf.vn has since
 * reassigned their pages to different clubs, and a wrong crest is worse than none.
 */
const VPF = 'https://vpf.vn/wp-content/uploads/'
const VPF_CRESTS = {
  'cmrjf0h6b90pkt507uthh2uf5': '2025/08/BacNinh-150x150.png', // Bắc Ninh
  'cmrjf0h6i90ppt5070grcxp8i': '2018/10/LOGO-BECAMEX-TP-HCM-FC-NEW-01-150x150.png', // Becamex Hồ Chí Minh
  'cmr7bfbnr16fwrx06c32l8u3m': '2018/10/cong-an-ha-noi-fc-150x150.png', // Công An Hà Nội
  'cmrjf0h6690pgt50700n0ltjm': '2018/10/CAHCM-150x150.png', // Công An Hồ Chí Minh
  'cmrjf0h6i90pot507awmpiprf': '2018/10/LOGO-SHB-DA-NANG-01-150x150.png', // Đà Nẵng
  'cmrjf0h9290r5t507n3nank0n': '2025/08/VanHien-150x150.png', // Đại Học Văn Hiến
  'cmrjf0h5z90pct507hbl6k7gv': '2018/10/HNFC-6-sao-150x150.png', // Hà Nội
  'cmrjf0h6g90pnt507bpfs0ao2': '2018/10/haiphongfc-150x150.jpg', // Hải Phòng
  'cmrjf0h6e90pmt507isciokm5': '2018/10/Logo-HAGL-150x150.jpg', // Hoàng Anh Gia Lai
  'cmrjf0h6d90plt5079q0mgjbu': '2018/10/HLHT-150x150.png', // Hồng Lĩnh Hà Tĩnh
  'cmsvaf0ka9mwqpg07i2w83alu': '2018/10/Logo-CLB-Bong-Da-Hue-150x150.png', // Huế
  'cmsvaf0ln9mwypg0776rep0d2': '2025/08/hung-yen-fc-150x150.png', // Hung Yen
  'cmrjf0h8f90qpt5075o1s4006': '2018/12/khatoco-khanhhoa-clb-2-150x150.png', // Khánh Hòa
  'cmsvaf0la9mwxpg07kinanssz': '2026/08/lam-dong-fc-150x150.png', // Lam Dong
  'cmril1uvug7rfs107sfm7wyok': '2018/10/LAFC-150x150.png', // Long An
  'cmr7bfbnv16fyrx06g32pw3cy': '2018/10/Logo-TXND-3-sao-150x150.png', // Nam Định
  'cmrjf0h6990pjt507uhzt5849': '2019/01/ninh_binh_2025-150x150.png', // Ninh Bình
  'cmrjf0h6490pft5078lwzt88e': '2025/08/hung-yen-fc-150x150.png', // PVF-CAND
  'cmrjf0h8g90qqt5077db42tfe': '2018/10/1J3TQ2EDO_46643K-150x150.jpeg', // Quy Nhon
  'cmrjf0h6390pet507ilf9c9jl': '2018/10/SLNA-1-150x150.png', // Sông Lam Nghệ An
  'cmsvaf0lq9mwzpg07g3l2b1nb': '2026/08/thai-nguyen-fc2_2026png-150x150.png', // Thai Nguyen
  'cmrjf0h6890pit507t7dwqgl8': '2018/10/Thanh-Hoa-FC_2027-150x150.png', // Thanh Hóa
  'cmrjf0h5y90pbt507vvjxz46n': '2018/10/TCVT-150x150.png', // Thể Công – Viettel
  'cmril1uvvg7rgs107wlypwg62': '2018/10/FILE-LOGO-THANH-PHO-DONG-NAI-01-150x150.png', // Trường Tươi Đồng Nai
  'cmrjf0h8x90r2t507ehailxty': '2025/08/Logo-XT-PHU-THO-150x150.png', // Xuan Thien Phu Tho
}

/** The official crest for a team, falling back to whatever the provider sent (which may be null). */
const crestFor = (id, fallback) => (VPF_CRESTS[id] ? VPF + VPF_CRESTS[id] : fallback || null)

const byCode = (code) => GOAL_COMPETITIONS.find((c) => c.code === code)

/** True for a goal-api id: theirs are cuids, football-data's are numeric. Lets the dispatchers in api.js
 * route a bare /matches/:id or /players/:id to the provider that owns it. */
export const isGoalId = (id) => id != null && !/^\d+$/.test(String(id))

/** The current season as the provider dates it, July to June. Asking for one season is the difference
 * between a single request and eight: unfiltered, V.League 1's fixtures endpoint returns ten seasons (766). */
export function seasonWindow(now = new Date()) {
  const y = now.getUTCFullYear()
  const start = now.getUTCMonth() >= 6 ? y : y - 1 // getUTCMonth is 0-based, so 6 is July
  return { from: `${start}-07-01`, to: `${start + 1}-06-30` }
}

async function get(path, params) {
  const { data } = await client.get(path, { params })
  if (data?.success === false) throw new Error(data.message || data.error || 'goal-api error')
  return data
}

/** Pages through a list endpoint until the provider says there is no more. */
async function getAll(path, params = {}) {
  const out = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const d = await get(path, { ...params, limit: PAGE, offset: page * PAGE })
    out.push(...(d.data || []))
    if (!d.pagination?.hasMore) break
  }
  return out
}

// ---------------------------------------------------------------------------------------------------------
// Translation into football-data's v4 shapes
// ---------------------------------------------------------------------------------------------------------

/** A provider number as a real number. null, undefined and "" all mean "no value". */
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const int = (v) => num(v) ?? 0

// Settled statuses, mapped onto the enum the whole UI switches on. Live states come from the clock fields
// instead, because the provider reports those separately.
const STATUS = {
  SCHEDULED: 'TIMED',
  FINISHED: 'FINISHED',
  AFTER_PEN: 'FINISHED',
  AFTER_ET: 'FINISHED',
  CANCELLED: 'CANCELLED',
  POSTPONED: 'POSTPONED',
  ABANDONED: 'SUSPENDED',
  SUSPENDED: 'SUSPENDED',
}

function status(f) {
  const raw = String(f.matchStatus || '').toUpperCase()
  if (STATUS[raw]) return STATUS[raw]
  if (f.matchPeriod === 'HALF_TIME') return 'PAUSED'
  if (f.matchLive === '1') return 'IN_PLAY'
  return 'TIMED' // an unrecognised status with no clock is treated as a fixture still to come
}

/** How a finished match was decided, so the AET / Pens badge is right. */
function duration(f) {
  const raw = String(f.matchStatus || '').toUpperCase()
  if (raw === 'AFTER_PEN' || num(f.homeTeamPenaltyScore) !== null) return 'PENALTY_SHOOTOUT'
  if (raw === 'AFTER_ET' || num(f.homeTeamExtraScore) !== null) return 'EXTRA_TIME'
  return 'REGULAR'
}

/** The stage the provider hides in the league name: "Cup - 1/8-finals" becomes LAST_16. */
function stage(f, comp) {
  const tail = String(f.leagueName || '').split(' - ')[1]
  if (!tail) return 'REGULAR_SEASON'
  const s = tail.toLowerCase()
  if (s.includes('semi')) return 'SEMI_FINALS'
  if (s.includes('quarter') || s.includes('1/4')) return 'QUARTER_FINALS'
  if (s.includes('1/8')) return 'LAST_16'
  if (s.includes('1/16')) return 'LAST_32'
  if (s.includes('third')) return 'THIRD_PLACE'
  if (s.includes('final')) return 'FINAL'
  // "Championship Round" and "Relegation Round": V.League's end-of-season split, still league football.
  if (s.includes('round')) return 'REGULAR_SEASON'
  return comp?.has?.standings ? 'REGULAR_SEASON' : 'PLAYOFFS'
}

/** A team in football-data's shape. The provider has no short name or three-letter code, and its flat
 * `*TeamName` fields are stripped of diacritics, so the nested object wins: "Công An Hà Nội". */
const team = (nested, id, name, badge) => {
  const label = nested?.name || name || ''
  const tid = nested?.id ?? id ?? null
  return { id: tid, name: label, shortName: label, tla: null, crest: crestFor(tid, nested?.badge || badge) }
}

/** One fixture as a football-data v4 match. */
export function toMatch(f, comp) {
  const home = num(f.homeTeamFtScore ?? f.homeTeamScore)
  const away = num(f.awayTeamFtScore ?? f.awayTeamScore)
  const played = home !== null && away !== null
  const ph = num(f.homeTeamPenaltyScore)
  const pa = num(f.awayTeamPenaltyScore)
  // football-data reports the winner; this provider does not. The UI needs it to bold the winning side and
  // to read a shoot-out correctly, where the 90-minute score is level but someone still went through.
  const decide = (h, a) => (h > a ? 'HOME_TEAM' : a > h ? 'AWAY_TEAM' : 'DRAW')
  const winner = !played ? null
    : ph !== null && pa !== null && home === away ? decide(ph, pa)
    : decide(home, away)
  const round = num(f.matchRound)

  return {
    id: f.id,
    utcDate: f.kickoffUtc || `${f.matchDate}T${f.matchTime || '00:00'}:00.000Z`,
    status: status(f),
    matchday: Number.isFinite(round) ? round : null,
    stage: stage(f, comp),
    group: null,
    competition: {
      id: comp?.code ?? f.leagueId,
      code: comp?.code ?? null,
      name: comp?.name || String(f.leagueName || '').split(' - ')[0],
      type: comp?.has?.standings ? 'LEAGUE' : 'CUP',
      emblem: comp?.emblem || f.leagueLogo || null,
    },
    homeTeam: team(f.homeTeam, f.homeTeamId, f.homeTeamName, f.teamHomeBadge),
    awayTeam: team(f.awayTeam, f.awayTeamId, f.awayTeamName, f.teamAwayBadge),
    score: {
      winner,
      duration: played ? duration(f) : 'REGULAR',
      fullTime: { home, away },
      halfTime: { home: num(f.homeTeamHalftimeScore), away: num(f.awayTeamHalftimeScore) },
      ...(ph !== null ? { penalties: { home: ph, away: pa } } : {}),
    },
    venue: f.matchStadium || null,
    referees: f.matchReferee ? [{ name: f.matchReferee }] : [],
  }
}

/** One standings row as a football-data table row. Every figure arrives as a string. */
const toRow = (r) => ({
  position: int(r.overallLeaguePosition),
  team: {
    id: r.team?.id ?? r.teamId,
    name: r.team?.name || r.teamName || '',
    shortName: r.team?.name || r.teamName || '',
    tla: null,
    crest: crestFor(r.team?.id ?? r.teamId, r.team?.badge),
  },
  playedGames: int(r.overallLeaguePlayed),
  won: int(r.overallLeagueW),
  draw: int(r.overallLeagueD),
  lost: int(r.overallLeagueL),
  points: int(r.overallLeaguePTS),
  goalsFor: int(r.overallLeagueGF),
  goalsAgainst: int(r.overallLeagueGA),
  goalDifference: int(r.overallLeagueGF) - int(r.overallLeagueGA),
})

// The provider puts the position group in `type`, in the plural, and leaves it null for roughly half of a
// squad. TeamSquad files anything it does not recognise under "Other", which is already translated.
const POSITION = { Goalkeepers: 'Goalkeeper', Defenders: 'Defence', Midfielders: 'Midfield', Forwards: 'Offence', Attackers: 'Offence' }

const toPlayer = (p) => ({
  id: p.id,
  name: p.name || '',
  position: POSITION[p.type] || null,
  dateOfBirth: p.birthdate || null,
  nationality: p.country || null,
  shirtNumber: num(p.number),
})

/** A team as football-data's /teams/{id} reports one, as far as the provider has the data.
 * `players` is passed in separately because the provider serves a squad from its own endpoint. */
function toTeamDetail(t, players = []) {
  const season = seasonWindow().from.slice(0, 4)
  return {
    id: t.id,
    name: t.name || '',
    shortName: t.name || '',
    tla: null,
    crest: crestFor(t.id, t.badge),
    founded: num(t.founded),
    website: null,
    venue: t.venueName || null,
    area: { name: t.country || 'Vietnam' },
    coach: t.coaches?.length ? { name: t.coaches[0].name, nationality: t.coaches[0].country || null } : null,
    // The provider lists a row per team-season; keep this season's, newest first, and de-duplicate.
    runningCompetitions: [...new Map((t.leagues || [])
      .filter((l) => !l.season || l.season.startsWith(season))
      .map((l) => [l.league?.id, { id: l.league?.id, name: l.league?.name, code: null, emblem: l.league?.logo || null }])
      .filter(([id]) => id)).values()],
    squad: players.map(toPlayer),
  }
}

// ---------------------------------------------------------------------------------------------------------
// The calls api.js makes for football-data, answered for a Vietnamese competition
// ---------------------------------------------------------------------------------------------------------

/** Every match of one competition this season. The season window keeps this to a single request. */
export async function fetchGoalCompetitionMatches(code) {
  const comp = byCode(code)
  if (!comp) return []
  const { from, to } = seasonWindow()
  const rows = await getAll(`/leagues/${comp.leagueId}/fixtures`, { from, to })
  return rows.map((f) => toMatch(f, comp))
}

/** Matches of every Vietnamese competition between two dates — the home screen's window. */
export async function fetchGoalWindow(from, to) {
  const lists = await Promise.all(GOAL_COMPETITIONS.map(async (comp) => {
    try {
      const rows = await getAll(`/leagues/${comp.leagueId}/fixtures`, { from, to })
      return rows.map((f) => toMatch(f, comp))
    } catch {
      return [] // one competition failing must not cost the others
    }
  }))
  return lists.flat()
}

export async function fetchGoalMatch(id) {
  const d = await get(`/fixtures/${id}`)
  const f = d.data || d
  return toMatch(f, GOAL_COMPETITIONS.find((c) => c.leagueId === f.leagueId))
}

/** Standings in football-data's shape: a list of groups, each holding a table. */
export async function fetchGoalStandings(code) {
  const comp = byCode(code)
  if (!comp?.has.standings) return []
  const rows = await getAll(`/leagues/${comp.leagueId}/standings`)
  const table = rows.map(toRow).sort((a, b) => a.position - b.position)
  return table.length ? [{ stage: 'REGULAR_SEASON', type: 'TOTAL', group: null, table }] : []
}

/**
 * Top scorers. The provider's rows name the player and the team but carry no id for either — only the
 * upstream's own keys. `teamKey` does match a team's `apiId`, so the teams list (cached for a day, and
 * usually already loaded) supplies the real team id and badge. There is no such bridge for players:
 * `playerKey` matches nothing, so the player id stays null and Scorers renders the name as plain text.
 */
export async function fetchGoalScorers(code) {
  const comp = byCode(code)
  if (!comp?.has.scorers) return []
  const [rows, teams] = await Promise.all([
    getAll(`/leagues/${comp.leagueId}/top-scorers`),
    getAll(`/leagues/${comp.leagueId}/teams`).catch(() => []),
  ])
  const byApiId = new Map(teams.map((t) => [String(t.apiId), t]))
  return rows.map((s) => {
    const t = byApiId.get(String(s.teamKey))
    return {
      player: { id: null, name: s.playerName || '', dateOfBirth: null, nationality: null, shirtNumber: null },
      team: {
        id: t?.id ?? null,
        name: t?.name || s.teamName || '',
        shortName: t?.name || s.teamName || '',
        crest: crestFor(t?.id, t?.badge),
      },
      playedMatches: null, // not reported on these rows
      goals: int(s.goals),
      assists: num(s.assists),
      penalties: num(s.penaltyGoals),
    }
  })
}

/** Teams of a competition. Squads are deliberately not included: the provider serves a roster per team, so
 * filling them here would be one request per club. TeamSquad already falls back to a per-team request for
 * exactly the two teams on screen. */
export async function fetchGoalTeams(code) {
  const comp = byCode(code)
  if (!comp) return []
  const rows = await getAll(`/leagues/${comp.leagueId}/teams`)
  return rows.map((t) => toTeamDetail(t))
}

/** One team with its squad: two requests, made only for a team actually being looked at. */
export async function fetchGoalTeam(id) {
  const [t, players] = await Promise.all([
    get(`/teams/${id}`).then((d) => d.data || d),
    getAll(`/teams/${id}/players`).catch(() => []),
  ])
  return toTeamDetail(t, players)
}

/** One player, as football-data's /persons/{id} reports one. */
export async function fetchGoalPerson(id) {
  const d = await get(`/players/${id}`)
  const p = d.data || d
  return {
    ...toPlayer(p),
    firstName: null,
    lastName: null,
    section: p.type || null,
    currentTeam: p.teamId ? { id: p.teamId, name: p.team?.name || '', crest: p.team?.badge || null } : null,
  }
}
