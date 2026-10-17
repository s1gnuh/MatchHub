// How big a match is, so the home screen can lead with the ties most people actually open the app for.
//
// Everything here is hard-coded on purpose. Ranking by the real league table would mean one /standings request
// per league (up to 10) on the very first screen, and the free football-data.org tier allows 10 requests a minute
// in total — exactly the cost this screen exists to avoid. A fixed table costs nothing and never changes between
// visits, at the price of needing a human to keep it current.
//
// Teams are keyed by football-data.org id, never by name or `tla`: the API reports "FCB" for both Barcelona and
// Bayern, and club names come in several spellings ("Barça", "FC Barcelona").

// Clubs almost any fan will stop and watch.
const ELITE = [
  86,   // Real Madrid
  81,   // Barcelona
  5,    // Bayern München
  65,   // Manchester City
  64,   // Liverpool
  524,  // Paris Saint-Germain
  108,  // Inter
  66,   // Manchester United
  57,   // Arsenal
  109,  // Juventus
  98,   // AC Milan
  61,   // Chelsea
  78,   // Atlético Madrid
  4,    // Borussia Dortmund
  113,  // Napoli
]

// Big names in their own country, and the usual European regulars.
const STRONG = [
  73,   // Tottenham
  67,   // Newcastle
  58,   // Aston Villa
  100,  // Roma
  110,  // Lazio
  102,  // Atalanta
  3,    // Bayer Leverkusen
  721,  // RB Leipzig
  516,  // Olympique Marseille
  523,  // Olympique Lyon
  548,  // AS Monaco
  77,   // Athletic Club
  559,  // Sevilla
  94,   // Villarreal
  503,  // FC Porto
  498,  // Sporting CP
  1903, // SL Benfica
  678,  // Ajax
  674,  // PSV
  610,  // Galatasaray
  613,  // Fenerbahçe
  851,  // Club Brugge
  1887, // Shakhtar Donetsk
  1783, // Flamengo
  1769, // Palmeiras
]

// Worth a mention: mid-table top-five clubs and the better-known clubs elsewhere.
const NOTABLE = [
  397, 354, 63, 62, 351, 402, 563, 341,            // Brighton, Crystal Palace, Fulham, Everton, Nottingham, Brentford, West Ham, Leeds
  92, 90, 95, 558,                                 // Real Sociedad, Real Betis, Valencia, Celta
  99, 586, 103,                                    // Fiorentina, Torino, Bologna
  10, 17, 18, 12, 19,                              // Stuttgart, Freiburg, M'gladbach, Werder Bremen, Eintracht Frankfurt
  521, 529, 546, 522,                              // Lille, Rennes, Lens, Nice
  675, 682,                                        // Feyenoord, AZ
  5613,                                            // SC Braga
  1779, 1776, 1770, 1771, 1766, 1767, 1765, 1780,  // Corinthians, São Paulo, Botafogo, Cruzeiro, Mineiro, Grêmio, Fluminense, Vasco
]

const FAME = new Map()
for (const id of NOTABLE) FAME.set(id, 3)
for (const id of STRONG) FAME.set(id, 6)
for (const id of ELITE) FAME.set(id, 10)

/** How well known a team is: 10 (elite), 6 (strong), 3 (notable) or 0. */
export const fame = (team) => FAME.get(team?.id) ?? 0

// A Champions League night outranks a league weekend; the Championship is here for completeness, not for drama.
const COMPETITION = { CL: 8, PL: 4, PD: 4, SA: 3, BL1: 3, FL1: 2, DED: 1, PPL: 1, BSA: 1, ELC: 0 }

// Knockout rounds matter more the later they are.
const STAGE = {
  FINAL: 12, SEMI_FINALS: 8, QUARTER_FINALS: 6, THIRD_PLACE: 4,
  LAST_16: 4, LAST_32: 2, PLAYOFFS: 2,
}

const LIVE = ['IN_PLAY', 'PAUSED']

/**
 * Score for sorting matches by how interesting they are. Only the order matters, not the number.
 * Two big names facing each other score more than the sum of their parts, because that is the match people look for.
 */
export function hotness(match) {
  const home = fame(match.homeTeam)
  const away = fame(match.awayTeam)
  let score = home + away
  if (Math.min(home, away) >= 6) score += 6 // a genuine headline tie, not a big club against a small one
  score += COMPETITION[match.competition?.code] ?? 0
  score += STAGE[match.stage] ?? 0
  if (LIVE.includes(match.status)) score += 25 // being played right now beats anything scheduled
  return score
}

/** Matches sorted by hotness, most interesting first; ties fall back to the earliest kickoff. */
export const byHotness = (matches) =>
  [...matches].sort((a, b) => hotness(b) - hotness(a) || a.utcDate.localeCompare(b.utcDate))
