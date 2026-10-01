import { Link } from 'react-router-dom'
import { useLang } from '../utils/i18n.jsx'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <p className="mt-2 text-muted">{t('nf.text')}</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 font-semibold text-black transition hover:bg-primary-dark">
        {t('nf.back')}
      </Link>
    </div>
  )
}



