import { useState, useCallback } from 'react'

const STORAGE_KEY = 'matchhub:push:matches'

function getSubscribed() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveSubscribed(ids) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch {}
}

function urlBase64ToUint8Array(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

// Module-level VAPID key cache — fetched once, shared across all hook instances.
let vapidKeyCache = null
let vapidKeyPromise = null
async function getVapidKey() {
  if (vapidKeyCache) return vapidKeyCache
  if (!vapidKeyPromise) {
    vapidKeyPromise = fetch('/api/subscribe')
      .then((r) => r.json())
      .then(({ publicKey }) => { vapidKeyCache = publicKey; return publicKey })
      .catch(() => null)
  }
  return vapidKeyPromise
}

/** Returns { isSubscribed, toggle, permission, supported }. */
export default function usePushNotification(matchId) {
  const [subscribedIds, setSubscribedIds] = useState(getSubscribed)
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  )

  const isSubscribed = subscribedIds.includes(String(matchId))

  const toggle = useCallback(async (kickoff, homeTeam, awayTeam) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    if (isSubscribed) {
      // Unsubscribe: remove from localStorage and tell the server
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        fetch('/api/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint, matchId: String(matchId) }),
        }).catch(() => {})
      }
      const updated = subscribedIds.filter((id) => id !== String(matchId))
      saveSubscribed(updated)
      setSubscribedIds(updated)
      return
    }

    // Subscribe: ask for permission → create push subscription → send to server
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') return

    const vapidKey = await getVapidKey()
    if (!vapidKey) return

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          matchId: String(matchId),
          kickoff,
          homeTeam,
          awayTeam,
        }),
      })
      const updated = [...subscribedIds, String(matchId)]
      saveSubscribed(updated)
      setSubscribedIds(updated)
    } catch {}
  }, [isSubscribed, matchId, subscribedIds])

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window

  return { isSubscribed, toggle, permission, supported }
}
