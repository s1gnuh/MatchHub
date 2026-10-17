import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In dev (and `vite preview`), /api is proxied to football-data.org to avoid browser CORS issues. The proxy adds the
// key from .env itself, like the Vercel function and the Cloudflare Worker do in production.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'GOAL_'])
  const key = env.VITE_API_KEY
  const goalKey = env.GOAL_API_KEY
  const proxy = {
    // Order matters: the first matching prefix wins, so the Vietnamese provider's route has to be declared
    // before the catch-all '/api'. Both mirror what api/proxy.js and the Cloudflare worker do in production.
    '/api/goal': {
      target: 'https://api.goal-api.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/goal/, '/v1'),
      headers: goalKey ? { Authorization: `Bearer ${goalKey}` } : {},
    },
    '/api': {
      target: 'https://api.football-data.org',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/v4'),
      headers: key && key !== 'your_api_key_here' ? { 'X-Auth-Token': key } : {},
    },
  }
  return {
    // Relative base: the built site works from any sub-path (e.g. https://user.github.io/MatchHub/).
    base: './',
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
