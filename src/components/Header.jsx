import { Link, NavLink } from 'react-router-dom'
import { FaFacebookF, FaGithub, FaInstagram } from 'react-icons/fa'
import { useLang } from '../utils/i18n.jsx'

// Author's social profiles.
const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/s1gnuh/?hl=en', Icon: FaInstagram },
  { name: 'Facebook', href: 'https://www.facebook.com/viet.hung.183615/', Icon: FaFacebookF },
  { name: 'GitHub', href: 'https://github.com/s1gnuh', Icon: FaGithub },
]

const link = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-sm font-semibold transition duration-300 ${isActive ? 'bg-primary text-black' : 'text-main/70 hover:bg-subtle hover:text-main'}`

// EN | VI segmented switch.
function LanguageSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div role="group" aria-label={t('lang.label')} className="flex rounded-full border border-line bg-card p-0.5 text-xs font-bold">
      {['en', 'vi'].map((l) => (
        <button key={l} onClick={() => setLang(l)} aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition duration-300 ${lang === l ? 'bg-primary text-black' : 'text-muted hover:text-main'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}

// Sticky black top bar. The logo sits on a light badge so "Match" can be black and "Hub" gold.
export default function Header() {
  const { t } = useLang()
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" aria-label="MatchHub home" className="group flex items-center gap-2.5">
          <img src="/logo.svg" alt="" className="h-9 w-9 transition duration-500 group-hover:rotate-[360deg]" />
          <span className="-skew-x-6 rounded-lg bg-white px-3 py-1 font-logo text-2xl font-black italic leading-none tracking-tight shadow-lg shadow-primary/10 transition duration-300 group-hover:shadow-primary/40">
            <span className="text-black">Match</span>
            <span className="text-[#f59e0b]">Hub</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex gap-1">
            <NavLink to="/" end className={link}>{t('nav.matches')}</NavLink>
            <NavLink to="/leagues" className={link}>{t('nav.leagues')}</NavLink>
          </nav>
          <span className="hidden h-6 w-px bg-line sm:block" />
          <div className="flex items-center gap-1">
            {SOCIALS.map(({ name, href, Icon }) => (
              <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name}
                className="flex h-9 w-9 items-center justify-center rounded-full text-main/70 transition duration-300 hover:-translate-y-0.5 hover:bg-primary hover:text-black">
                <Icon size={16} />
              </a>
            ))}
          </div>
          <LanguageSwitch />
        </div>
      </div>
    </header>
  )
}
