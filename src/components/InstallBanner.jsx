import { IoClose, IoShareOutline, IoAddCircleOutline } from 'react-icons/io5'
import useInstallPrompt from '../utils/useInstallPrompt.js'
import { useLang } from '../utils/i18n.jsx'

export default function InstallBanner() {
  const { show, platform, dismiss, install } = useInstallPrompt()
  const { t } = useLang()

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-safe animate-slide-up">
      <div className="relative mx-auto max-w-lg rounded-2xl bg-card shadow-xl ring-1 ring-line p-4">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-muted hover:text-main"
          aria-label="Đóng"
        >
          <IoClose size={20} />
        </button>

        <div className="flex items-start gap-3 pr-8">
          <img src="/icons/icon-192.png" alt="" className="h-12 w-12 flex-shrink-0 rounded-xl" />
          <div>
            <p className="font-semibold leading-tight">{t('install.title')}</p>
            <p className="mt-0.5 text-sm text-muted">{t('install.subtitle')}</p>
          </div>
        </div>

        {platform === 'ios' && (
          <ol className="mt-3 space-y-1.5 text-sm">
            <li className="flex items-center gap-2">
              <IoShareOutline size={18} className="flex-shrink-0 text-accent" />
              <span>{t('install.ios1')}</span>
            </li>
            <li className="flex items-center gap-2">
              <IoAddCircleOutline size={18} className="flex-shrink-0 text-accent" />
              <span>{t('install.ios2')}</span>
            </li>
          </ol>
        )}

        {platform === 'android' && (
          <button
            onClick={install}
            className="mt-3 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white active:opacity-80"
          >
            {t('install.cta')}
          </button>
        )}

        <button onClick={dismiss} className="mt-2 w-full py-1.5 text-xs text-muted">
          {t('install.skip')}
        </button>
      </div>
    </div>
  )
}
