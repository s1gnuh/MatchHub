// Send push notifications for matches starting soon.
// Called by an external cron (e.g. cron-job.org) every 15 minutes:
//   POST https://your-app.vercel.app/api/push
//   Authorization: Bearer <CRON_SECRET>
//
// Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, CRON_SECRET, BLOB_READ_WRITE_TOKEN

import { list } from '@vercel/blob'
import webPush from 'web-push'

const FOLDER = 'push-subscriptions'
const ADVANCE_MIN = 30  // notify this many minutes before kickoff
const WINDOW_MIN = 5    // ±5 min tolerance so a 15-min cron always covers the slot

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const vapidSubject = process.env.VAPID_SUBJECT
  const vapidPublic = process.env.VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  if (!vapidSubject || !vapidPublic || !vapidPrivate) {
    return res.status(500).json({ message: 'VAPID keys not configured' })
  }

  webPush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)

  const now = Date.now()
  const windowStart = now + (ADVANCE_MIN - WINDOW_MIN) * 60_000
  const windowEnd   = now + (ADVANCE_MIN + WINDOW_MIN) * 60_000

  // Read all stored subscriptions from Vercel Blob
  let blobs = []
  try {
    const result = await list({ prefix: FOLDER + '/' })
    blobs = result.blobs
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list subscriptions', error: String(err) })
  }

  const toNotify = []
  await Promise.all(blobs.map(async (blob) => {
    try {
      const resp = await fetch(blob.url)
      const entry = await resp.json()
      const kickoffMs = Date.parse(entry.kickoff)
      if (kickoffMs >= windowStart && kickoffMs <= windowEnd) toNotify.push(entry)
    } catch {}
  }))

  const results = await Promise.allSettled(
    toNotify.map(({ subscription, matchId, homeTeam, awayTeam }) => {
      const body = homeTeam && awayTeam
        ? `${homeTeam} vs ${awayTeam} — starts in ~${ADVANCE_MIN} min`
        : `Kickoff in ~${ADVANCE_MIN} minutes`
      return webPush.sendNotification(
        subscription,
        JSON.stringify({
          title: '⚽ Match starting soon',
          body,
          url: `/#/matches/${matchId}`,
          tag: `match-${matchId}`,
        }),
      )
    }),
  )

  const sent   = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  return res.json({ ok: true, checked: toNotify.length, sent, failed })
}
