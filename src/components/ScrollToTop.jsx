import { useEffect, useState } from 'react'
import { FiArrowUp } from 'react-icons/fi'
import { useLang } from '../utils/i18n.jsx'

// Floating gold button that appears after scrolling down and smooth-scrolls back to the top.
export default function ScrollToTop() {
  const { t } = useLang()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      onClick={goTop}
      aria-label={t('scroll.top')}
      title={t('scroll.top')}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 active:scale-90 ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
    >
      <FiArrowUp size={20} />
    </button>
  )
}
