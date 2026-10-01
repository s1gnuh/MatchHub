import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api is proxied to football-data.org to avoid browser CORS issues.
export default defineConfig({
  // Relative base: the built site works from any sub-path (e.g. https://user.github.io/MatchHub/).
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v4'),
      },
    },
  },
})

