import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setLocale } from './helpers.js'

const KEY = 'matchhub-lang'

const DICT = {
  en: {
    'nav.matches': 'Matches', 'nav.leagues': 'Leagues',
    'home.sub': '{country} · fixtures & results',
    'home.tz': 'All times are Hanoi time (GMT+7)',
    'search.ph': 'Search team or league…', 'search.label': 'Search by team or league', 'search.clear': 'Clear search',
    'm.upcoming': 'Upcoming', 'm.results': 'Results',
    'm.one': '{n} match', 'm.many': '{n} matches', 'm.none': 'No matches found.',
    today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday',
    'status.SCHEDULED': 'Scheduled', 'status.TIMED': 'Upcoming', 'status.IN_PLAY': 'Live', 'status.PAUSED': 'Half-time',
    'status.FINISHED': 'FT', 'status.POSTPONED': 'Postponed', 'status.CANCELLED': 'Cancelled', 'status.SUSPENDED': 'Suspended',
    'err.noKey': 'No API key configured. Copy .env.example to .env and add your Football-Data.org key.',
    'err.rate': 'Easy there, champ! You are sending too many requests. Please wait a minute and try again.',
    'err.auth': 'Invalid or missing API key. Check VITE_API_KEY in your .env file.',
    'err.timeout': 'The request timed out. Please try again.',
    'err.network': 'Network error – check your connection and retry.',
    'err.http': 'Could not load data (error {status}). Please try again later.',
    retry: 'Try again', loading: 'Loading', 'cd.in': 'in {t}', 'scroll.top': 'Back to top',
    'mi.form': 'Recent form', 'mi.formNote': 'Last 5 finished matches in this competition, oldest to newest.',
    'mi.h2h': 'Head to head', 'mi.noH2h': 'No earlier meetings this season in this competition.', 'mi.draws': 'Draws',
    'st.GF': 'GF', 'st.GA': 'GA', 'st.Form': 'Form', 'mc.rank': 'Position {n} in the table', 'mi.loadAll': 'Show earlier seasons', 'md.showSquads': 'Show squads',
    'feat.live': 'Live now', 'feat.next': 'Next match', 'feat.last': 'Latest result', 'sm.full': 'Full table',
    'shell.none': 'No match to show.',
    'stage.GROUP_STAGE': 'Group stage', 'stage.LEAGUE_STAGE': 'League stage', 'stage.PLAYOFFS': 'Play-offs',
    'stage.LAST_32': 'Round of 32', 'stage.LAST_16': 'Round of 16', 'stage.QUARTER_FINALS': 'Quarter-finals',
    'stage.SEMI_FINALS': 'Semi-finals', 'stage.FINAL': 'Final', 'stage.THIRD_PLACE': 'Third place',
    'dur.EXTRA_TIME': 'AET', 'dur.PENALTY_SHOOTOUT': 'Pens',
    'md.aet': 'After extra time', 'md.pens': 'Penalties {h} – {a}', 'md.penShort': 'Decided on penalties',
    'm.rounds': 'Rounds', 'round.label': 'Round', 'round.prev': 'Previous round', 'round.next': 'Next round',
    'season.label': 'Season', 'err.restricted': 'This data is not available on the free plan.',
    'mi.h2hLast': 'Last {n} meetings', 'mi.h2hSeason': 'This season only',
    'sc.age': 'Age', 'sc.pens': 'Pens',
    'pl.back': '← Back', 'pl.born': 'Born {d}', 'pl.age': '{n} years old', 'pl.shirt': 'Shirt number',
    'pl.nation': 'Nationality', 'pl.position': 'Position', 'pl.team': 'Current team', 'age': 'Age {n}',
    'pos1.Goalkeeper': 'Goalkeeper', 'pos1.Defence': 'Defender', 'pos1.Midfield': 'Midfielder', 'pos1.Offence': 'Forward',
    'footer.data': 'Data by', 'footer.by': 'Made by',
    'nf.text': 'That page is offside.', 'nf.back': 'Back to matches',
    'leagues.title': 'Leagues', 'comp.back': '← All leagues',
    'tab.Matches': 'Matches', 'tab.Standings': 'Standings', 'tab.Scorers': 'Scorers', 'tab.Teams': 'Teams',
    'st.none': 'No standings available.', 'st.team': 'Team',
    'st.P': 'P', 'st.W': 'W', 'st.D': 'D', 'st.L': 'L', 'st.GD': 'GD', 'st.Pts': 'Pts',
    'sc.none': 'No scorer data available.', 'sc.player': 'Player', 'sc.team': 'Team',
    'sc.played': 'Played', 'sc.assists': 'Assists', 'sc.goals': 'Goals',
    'md.back': '← Back to matches', 'md.matchday': 'Matchday {n}', 'md.venue': 'Venue', 'md.referee': 'Referee', 'md.ht': 'HT {h} – {a}',
    'md.squads': 'Squads', 'md.noSquad': 'Squad not available.',
    'td.back': '← Back', 'td.founded': 'Founded {y}', 'td.coach': 'Coach', 'td.website': 'Website',
    'pos.Goalkeeper': 'Goalkeepers', 'pos.Defence': 'Defenders', 'pos.Midfield': 'Midfielders', 'pos.Offence': 'Forwards', 'pos.Other': 'Other',
    'lang.label': 'Language',
    'country.England': 'England', 'country.Spain': 'Spain', 'country.Italy': 'Italy', 'country.Germany': 'Germany',
    'country.France': 'France', 'country.Europe': 'Europe', 'country.Netherlands': 'Netherlands',
    'country.Portugal': 'Portugal', 'country.Brazil': 'Brazil',
  },
  vi: {
    'nav.matches': 'Trận đấu', 'nav.leagues': 'Giải đấu',
    'home.sub': '{country} · lịch thi đấu & kết quả',
    'home.tz': 'Tất cả giờ theo giờ Hà Nội (GMT+7)',
    'search.ph': 'Tìm đội bóng hoặc giải đấu…', 'search.label': 'Tìm theo đội bóng hoặc giải đấu', 'search.clear': 'Xoá tìm kiếm',
    'm.upcoming': 'Sắp diễn ra', 'm.results': 'Kết quả',
    'm.one': '{n} trận', 'm.many': '{n} trận', 'm.none': 'Không tìm thấy trận đấu nào.',
    today: 'Hôm nay', tomorrow: 'Ngày mai', yesterday: 'Hôm qua',
    'status.SCHEDULED': 'Đã lên lịch', 'status.TIMED': 'Sắp đá', 'status.IN_PLAY': 'Trực tiếp', 'status.PAUSED': 'Nghỉ giữa hiệp',
    'status.FINISHED': 'Kết thúc', 'status.POSTPONED': 'Hoãn', 'status.CANCELLED': 'Huỷ', 'status.SUSPENDED': 'Tạm dừng',
    'err.noKey': 'Chưa cấu hình API key. Hãy sao chép .env.example thành .env và thêm key Football-Data.org của bạn.',
    'err.rate': 'Từ từ thôi bạn ơi! Bạn gửi quá nhiều yêu cầu rồi, hãy đợi một phút rồi thử lại nhé.',
    'err.auth': 'API key sai hoặc bị thiếu. Hãy kiểm tra VITE_API_KEY trong file .env.',
    'err.timeout': 'Yêu cầu bị quá thời gian. Vui lòng thử lại.',
    'err.network': 'Lỗi mạng – hãy kiểm tra kết nối rồi thử lại.',
    'err.http': 'Không tải được dữ liệu (lỗi {status}). Vui lòng thử lại sau.',
    retry: 'Thử lại', loading: 'Đang tải', 'cd.in': 'sau {t}', 'scroll.top': 'Lên đầu trang',
    'mi.form': 'Phong độ gần đây', 'mi.formNote': '5 trận gần nhất đã kết thúc trong giải này, từ cũ đến mới.',
    'mi.h2h': 'Đối đầu', 'mi.noH2h': 'Mùa này chưa có lần gặp nhau nào ở giải đấu này.', 'mi.draws': 'Hòa',
    'st.GF': 'BT', 'st.GA': 'BB', 'st.Form': 'Phong độ', 'mc.rank': 'Hạng {n} trên bảng xếp hạng', 'mi.loadAll': 'Xem các mùa trước', 'md.showSquads': 'Xem đội hình',
    'feat.live': 'Đang diễn ra', 'feat.next': 'Trận sắp tới', 'feat.last': 'Kết quả mới nhất', 'sm.full': 'Xem đầy đủ',
    'shell.none': 'Không có trận để hiển thị.',
    'stage.GROUP_STAGE': 'Vòng bảng', 'stage.LEAGUE_STAGE': 'Vòng league', 'stage.PLAYOFFS': 'Play-off',
    'stage.LAST_32': 'Vòng 1/16', 'stage.LAST_16': 'Vòng 1/8', 'stage.QUARTER_FINALS': 'Tứ kết',
    'stage.SEMI_FINALS': 'Bán kết', 'stage.FINAL': 'Chung kết', 'stage.THIRD_PLACE': 'Tranh hạng ba',
    'dur.EXTRA_TIME': 'Hiệp phụ', 'dur.PENALTY_SHOOTOUT': 'Luân lưu',
    'md.aet': 'Sau hiệp phụ', 'md.pens': 'Luân lưu {h} – {a}', 'md.penShort': 'Phân định bằng luân lưu',
    'm.rounds': 'Vòng đấu', 'round.label': 'Vòng', 'round.prev': 'Vòng trước', 'round.next': 'Vòng sau',
    'season.label': 'Mùa giải', 'err.restricted': 'Dữ liệu này không có trong gói miễn phí.',
    'mi.h2hLast': '{n} lần gặp gần nhất', 'mi.h2hSeason': 'Chỉ tính mùa này',
    'sc.age': 'Tuổi', 'sc.pens': 'Pen',
    'pl.back': '← Quay lại', 'pl.born': 'Sinh {d}', 'pl.age': '{n} tuổi', 'pl.shirt': 'Số áo',
    'pl.nation': 'Quốc tịch', 'pl.position': 'Vị trí', 'pl.team': 'Đội hiện tại', 'age': '{n} tuổi',
    'pos1.Goalkeeper': 'Thủ môn', 'pos1.Defence': 'Hậu vệ', 'pos1.Midfield': 'Tiền vệ', 'pos1.Offence': 'Tiền đạo',
    'footer.data': 'Dữ liệu từ', 'footer.by': 'Tạo bởi',
    'nf.text': 'Trang này bị việt vị.', 'nf.back': 'Về trang trận đấu',
    'leagues.title': 'Giải đấu', 'comp.back': '← Tất cả giải đấu',
    'tab.Matches': 'Trận đấu', 'tab.Standings': 'Bảng xếp hạng', 'tab.Scorers': 'Vua phá lưới', 'tab.Teams': 'Đội bóng',
    'st.none': 'Chưa có bảng xếp hạng.', 'st.team': 'Đội',
    'st.P': 'Trận', 'st.W': 'Thắng', 'st.D': 'Hòa', 'st.L': 'Thua', 'st.GD': 'HS', 'st.Pts': 'Điểm',
    'sc.none': 'Chưa có dữ liệu ghi bàn.', 'sc.player': 'Cầu thủ', 'sc.team': 'Đội',
    'sc.played': 'Số trận', 'sc.assists': 'Kiến tạo', 'sc.goals': 'Bàn thắng',
    'md.back': '← Về trang trận đấu', 'md.matchday': 'Vòng {n}', 'md.venue': 'Sân vận động', 'md.referee': 'Trọng tài', 'md.ht': 'Hiệp 1: {h} – {a}',
    'md.squads': 'Danh sách cầu thủ', 'md.noSquad': 'Chưa có danh sách cầu thủ.',
    'td.back': '← Quay lại', 'td.founded': 'Thành lập {y}', 'td.coach': 'HLV', 'td.website': 'Trang web',
    'pos.Goalkeeper': 'Thủ môn', 'pos.Defence': 'Hậu vệ', 'pos.Midfield': 'Tiền vệ', 'pos.Offence': 'Tiền đạo', 'pos.Other': 'Khác',
    'lang.label': 'Ngôn ngữ',
    'country.England': 'Anh', 'country.Spain': 'Tây Ban Nha', 'country.Italy': 'Ý', 'country.Germany': 'Đức',
    'country.France': 'Pháp', 'country.Europe': 'Châu Âu', 'country.Netherlands': 'Hà Lan',
    'country.Portugal': 'Bồ Đào Nha', 'country.Brazil': 'Brazil',
  },
}

const LOCALES = { en: 'en-GB', vi: 'vi-VN' }
const LangContext = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'vi') return saved
  } catch { /* storage unavailable */ }
  return navigator.language?.startsWith('vi') ? 'vi' : 'en'
}

/** Provides { lang, setLang, t }. Missing keys fall back to English, then to the key's last segment. */
export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  setLocale(LOCALES[lang]) // date helpers read this synchronously during render

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem(KEY, l) } catch { /* ignore */ }
  }, [])

  const t = useCallback((key, vars) => {
    let s = DICT[lang][key] ?? DICT.en[key] ?? key.split('.').pop()
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
    return s
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
