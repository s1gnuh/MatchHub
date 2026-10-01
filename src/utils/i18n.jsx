import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setLocale } from './helpers.js'

const KEY = 'matchhub-lang'

const DICT = {
  en: {
    'nav.matches': 'Matches', 'nav.leagues': 'Leagues',
    'home.all': 'All', 'home.allLeagues': 'All leagues',
    'home.sub': '{country} · fixtures & results', 'home.next7': 'Matches in the next 7 days',
    'search.ph': 'Search team or league…', 'search.label': 'Search by team or league', 'search.clear': 'Clear search',
    'm.upcoming': 'Upcoming', 'm.results': 'Results',
    'm.one': '{n} match', 'm.many': '{n} matches', 'm.none': 'No matches found.',
    today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday',
    'status.SCHEDULED': 'Scheduled', 'status.TIMED': 'Upcoming', 'status.IN_PLAY': 'Live', 'status.PAUSED': 'Half-time',
    'status.FINISHED': 'FT', 'status.POSTPONED': 'Postponed', 'status.CANCELLED': 'Cancelled', 'status.SUSPENDED': 'Suspended',
    'err.noKey': 'No API key configured. Copy .env.example to .env and add your Football-Data.org key.',
    'err.rate': 'Rate limit reached (10 requests/min). Please wait a minute and try again.',
    'err.auth': 'Invalid or missing API key. Check VITE_API_KEY in your .env file.',
    'err.timeout': 'The request timed out. Please try again.',
    'err.network': 'Network error – check your connection and retry.',
    'err.http': 'Could not load data (error {status}). Please try again later.',
    retry: 'Try again',
    'footer.data': 'Data by', 'footer.by': 'Made by',
    'nf.text': 'That page is offside.', 'nf.back': 'Back to matches',
    'leagues.title': 'Leagues', 'comp.back': '← All leagues',
    'tab.Matches': 'Matches', 'tab.Standings': 'Standings', 'tab.Scorers': 'Scorers', 'tab.Teams': 'Teams',
    'st.none': 'No standings available.', 'st.team': 'Team',
    'st.P': 'P', 'st.W': 'W', 'st.D': 'D', 'st.L': 'L', 'st.GD': 'GD', 'st.Pts': 'Pts',
    'sc.none': 'No scorer data available.', 'sc.player': 'Player', 'sc.team': 'Team',
    'sc.played': 'Played', 'sc.assists': 'Assists', 'sc.goals': 'Goals',
    'md.back': '← Back to matches', 'md.matchday': 'Matchday {n}', 'md.venue': 'Venue', 'md.referee': 'Referee', 'md.ht': 'HT {h} – {a}',
    'td.back': '← Back', 'td.founded': 'Founded {y}', 'td.coach': 'Coach', 'td.website': 'Website',
    'pos.Goalkeeper': 'Goalkeepers', 'pos.Defence': 'Defenders', 'pos.Midfield': 'Midfielders', 'pos.Offence': 'Forwards', 'pos.Other': 'Other',
    'lang.label': 'Language',
    'country.England': 'England', 'country.Spain': 'Spain', 'country.Italy': 'Italy', 'country.Germany': 'Germany',
    'country.France': 'France', 'country.Europe': 'Europe', 'country.Netherlands': 'Netherlands',
    'country.Portugal': 'Portugal', 'country.Brazil': 'Brazil',
  },
  vi: {
    'nav.matches': 'Trận đấu', 'nav.leagues': 'Giải đấu',
    'home.all': 'Tất cả', 'home.allLeagues': 'Tất cả giải đấu',
    'home.sub': '{country} · lịch thi đấu & kết quả', 'home.next7': 'Các trận trong 7 ngày tới',
    'search.ph': 'Tìm đội bóng hoặc giải đấu…', 'search.label': 'Tìm theo đội bóng hoặc giải đấu', 'search.clear': 'Xoá tìm kiếm',
    'm.upcoming': 'Sắp diễn ra', 'm.results': 'Kết quả',
    'm.one': '{n} trận', 'm.many': '{n} trận', 'm.none': 'Không tìm thấy trận đấu nào.',
    today: 'Hôm nay', tomorrow: 'Ngày mai', yesterday: 'Hôm qua',
    'status.SCHEDULED': 'Đã lên lịch', 'status.TIMED': 'Sắp đá', 'status.IN_PLAY': 'Trực tiếp', 'status.PAUSED': 'Nghỉ giữa hiệp',
    'status.FINISHED': 'Kết thúc', 'status.POSTPONED': 'Hoãn', 'status.CANCELLED': 'Huỷ', 'status.SUSPENDED': 'Tạm dừng',
    'err.noKey': 'Chưa cấu hình API key. Hãy sao chép .env.example thành .env và thêm key Football-Data.org của bạn.',
    'err.rate': 'Đã chạm giới hạn (10 yêu cầu/phút). Vui lòng đợi một phút rồi thử lại.',
    'err.auth': 'API key sai hoặc bị thiếu. Hãy kiểm tra VITE_API_KEY trong file .env.',
    'err.timeout': 'Yêu cầu bị quá thời gian. Vui lòng thử lại.',
    'err.network': 'Lỗi mạng – hãy kiểm tra kết nối rồi thử lại.',
    'err.http': 'Không tải được dữ liệu (lỗi {status}). Vui lòng thử lại sau.',
    retry: 'Thử lại',
    'footer.data': 'Dữ liệu từ', 'footer.by': 'Tạo bởi',
    'nf.text': 'Trang này bị việt vị.', 'nf.back': 'Về trang trận đấu',
    'leagues.title': 'Giải đấu', 'comp.back': '← Tất cả giải đấu',
    'tab.Matches': 'Trận đấu', 'tab.Standings': 'Bảng xếp hạng', 'tab.Scorers': 'Vua phá lưới', 'tab.Teams': 'Đội bóng',
    'st.none': 'Chưa có bảng xếp hạng.', 'st.team': 'Đội',
    'st.P': 'Trận', 'st.W': 'Thắng', 'st.D': 'Hòa', 'st.L': 'Thua', 'st.GD': 'HS', 'st.Pts': 'Điểm',
    'sc.none': 'Chưa có dữ liệu ghi bàn.', 'sc.player': 'Cầu thủ', 'sc.team': 'Đội',
    'sc.played': 'Số trận', 'sc.assists': 'Kiến tạo', 'sc.goals': 'Bàn thắng',
    'md.back': '← Về trang trận đấu', 'md.matchday': 'Vòng {n}', 'md.venue': 'Sân vận động', 'md.referee': 'Trọng tài', 'md.ht': 'Hiệp 1: {h} – {a}',
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
