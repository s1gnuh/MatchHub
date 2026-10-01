import { useNavigate, useParams } from 'react-router-dom'
import MatchPanel from '../components/MatchPanel.jsx'
import { useLang } from '../utils/i18n.jsx'

// Match page on phones and tablets. On desktop the same route shows the match inside the three-column layout.
export default function MatchDetail() {
  const { t } = useLang()
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate(window.history.state?.idx > 0 ? -1 : '/')} className="text-sm text-primary hover:underline">
        {t('md.back')}
      </button>
      <div className="mt-3"><MatchPanel id={id} /></div>
    </>
  )
}
