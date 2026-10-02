import { useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaFacebookF, FaGithub, FaInstagram } from 'react-icons/fa'
import { useLang } from '../utils/i18n.jsx'

// Author's social profiles.
export const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/s1gnuh/?hl=en', Icon: FaInstagram },
  { name: 'Facebook', href: 'https://www.facebook.com/viet.hung.183615/', Icon: FaFacebookF },
  { name: 'GitHub', href: 'https://github.com/s1gnuh', Icon: FaGithub },
]

// Mobile: equal-width pills on their own row. Desktop: compact pills.
const link = ({ isActive }) =>
  `flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition duration-300 sm:flex-none sm:py-1.5 ${isActive ? 'bg-primary text-black' : 'text-main/70 hover:bg-subtle hover:text-main'}`

// EN | VI segmented switch.
function LanguageSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div role="group" aria-label={t('lang.label')} className="flex rounded-full border border-line bg-card p-0.5 text-xs font-bold">
      {['en', 'vi'].map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1.5 uppercase transition duration-300 sm:py-1 ${lang === l ? 'bg-primary text-black' : 'text-muted hover:text-main'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}

// Sticky black top bar. The logo sits on a light badge so "Match" can be black and "Hub" gold.
// Mobile: row 1 = logo + socials/language, row 2 = nav. Desktop (sm+): one row.
export default function Header() {
  const { t } = useLang()
  // "Matches" stays highlighted while a match is open (/matches/:id belongs to the matches screen).
  const { pathname } = useLocation()
  const onMatches = pathname === '/' || pathname.startsWith('/matches/')
  // Publish the header height as --hdr so the desktop layout can fill exactly the rest of the viewport.
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('ResizeObserver' in window)) return
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--hdr', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <header ref={ref} className="sticky top-0 z-20 border-b border-line bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1920px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:gap-x-4 sm:px-6 sm:py-3">
        <Link to="/" aria-label="MatchHub home" className="group order-1 flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="hidden h-9 w-9 transition duration-500 group-hover:rotate-[360deg] min-[400px]:block" />
          <span className="-skew-x-6 rounded-lg bg-white px-2.5 py-1 font-logo text-xl font-black italic leading-none tracking-tight shadow-lg shadow-primary/10 transition duration-300 group-hover:shadow-primary/40 sm:px-3 sm:text-2xl">
            <span className="text-black">Match</span>
            <span className="text-[#f59e0b]">Hub</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full gap-1 sm:order-2 sm:ml-auto sm:w-auto">
          <NavLink to="/" end className={() => link({ isActive: onMatches })}>{t('nav.matches')}</NavLink>
          <NavLink to="/leagues" className={link}>{t('nav.leagues')}</NavLink>
          <NavLink to="/about" className={link}>{t('nav.about')}</NavLink>
        </nav>

        <div className="order-2 ml-auto flex items-center gap-1 sm:order-3 sm:ml-0 sm:gap-1.5">
          {SOCIALS.map(({ name, href, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name}
              className="flex h-8 w-8 items-center justify-center rounded-full text-main/70 transition duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-black sm:h-9 sm:w-9">
              <Icon size={16} />
            </a>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
          <LanguageSwitch />
        </div>
      </div>
    </header>
  )
}
