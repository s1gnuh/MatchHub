import { Link } from 'react-router-dom'
import { useLang } from '../utils/i18n.jsx'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t border-line bg-card py-5 text-center text-sm text-muted">
      © {new Date().getFullYear()} MatchHub · {t('footer.data')}{' '}
      <a href="https://www.football-data.org" target="_blank" rel="noreferrer" className="text-primary hover:underline">
        football-data.org
      </a>
      {' · '}{t('footer.by')}{' '}
      <a href="https://github.com/s1gnuh" target="_blank" rel="noreferrer" className="text-primary hover:underline">s1gnuh</a>
      {' · '}
      <Link to="/about" className="text-primary hover:underline">{t('footer.about')}</Link>
    </footer>
  )
}
