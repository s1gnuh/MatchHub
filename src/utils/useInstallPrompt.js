import { useEffect, useRef, useState } from 'react'

const DISMISSED_KEY = 'matchhub:install:dismissed'
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

function isDismissed() {
  try {
    const t = localStorage.getItem(DISMISSED_KEY)
    return t && Date.now() - Number(t) < DISMISS_TTL
  } catch {
    return false
  }
}

function isStandalone() {
  return !!window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches
}

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export default function useInstallPrompt() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState(null) // 'ios' | 'android'
  const deferredRef = useRef(null)

  useEffect(() => {
    if (isStandalone() || !isMobile() || isDismissed()) return

    if (isIOS()) {
      setPlatform('ios')
      setShow(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      deferredRef.current = e
      setPlatform('android')
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch {}
    setShow(false)
  }

  const install = async () => {
    if (!deferredRef.current) return
    deferredRef.current.prompt()
    const { outcome } = await deferredRef.current.userChoice
    deferredRef.current = null
    if (outcome === 'accepted') setShow(false)
    else dismiss()
  }

  return { show, platform, dismiss, install }
}
