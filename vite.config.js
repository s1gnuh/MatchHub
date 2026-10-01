import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In dev (and `vite preview`), /api is proxied to football-data.org to avoid browser CORS issues. The proxy adds the
// key from .env itself, like the Vercel function and the Cloudflare Worker do in production.
export default defineConfig(({ mode }) => {
  const key = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_KEY
  const proxy = {
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
