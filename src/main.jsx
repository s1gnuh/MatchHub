import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { LangProvider } from './utils/i18n.jsx'
import './styles/global.css'

// Football-Data's free tier allows 10 requests/min, so cache aggressively and never auto-refetch.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,        // data stays fresh for 10 min -> served from memory
      gcTime: 30 * 60 * 1000,           // kept in memory 30 min after the last component unmounts
      refetchOnWindowFocus: false,
      // Retrying a bad key / rate limit would only burn more requests.
      retry: (count, err) => !['noKey', 'auth', 'rate'].includes(err?.code) && count < 1,
    },
  },
})

// Installable PWA: the service worker only runs in production builds, so dev reloads never get stale files.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* optional enhancement */ })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <LangProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </LangProvider>
    </QueryClientProvider>
  </React.StrictMode>
)




