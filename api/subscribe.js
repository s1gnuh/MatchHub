// Push notification subscription management.
// GET  /api/subscribe  → { publicKey }
// POST /api/subscribe  → save subscription for a match
// DELETE /api/subscribe → remove subscription for a match
//
// Env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, BLOB_READ_WRITE_TOKEN (auto-set by Vercel Blob)

import { list, put, del } from '@vercel/blob'

const FOLDER = 'push-subscriptions'

// Stable numeric hash of a string, used as a filename-safe id for each push endpoint.
function hashEndpoint(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 33) ^ str.charCodeAt(i)) >>> 0
  return h.toString(36)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  // GET: return VAPID public key so the browser can create a push subscription
  if (req.method === 'GET') {
    return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? '' })
  }

  // POST: register a subscription for a specific match
  if (req.method === 'POST') {
    const { subscription, matchId, kickoff, homeTeam, awayTeam } = req.body ?? {}
    if (!subscription?.endpoint || !matchId || !kickoff) {
      return res.status(400).json({ message: 'subscription, matchId and kickoff are required' })
    }
    const id = hashEndpoint(subscription.endpoint)
    const blob = JSON.stringify({ subscription, matchId, kickoff, homeTeam, awayTeam, createdAt: new Date().toISOString() })
    await put(`${FOLDER}/${id}_${matchId}.json`, blob, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })
    return res.status(201).json({ ok: true })
  }

  // DELETE: remove a subscription for a specific match
  if (req.method === 'DELETE') {
    const { endpoint, matchId } = req.body ?? {}
    if (!endpoint || !matchId) return res.status(400).json({ message: 'endpoint and matchId are required' })
    const id = hashEndpoint(endpoint)
    try {
      const { blobs } = await list({ prefix: `${FOLDER}/${id}_${matchId}` })
      await Promise.all(blobs.map((b) => del(b.url)))
    } catch {}
    return res.json({ ok: true })
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
