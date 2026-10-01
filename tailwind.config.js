/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        logo: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        app: v('app'),        // page background
        card: v('card'),      // card / panel surface
        subtle: v('subtle'),  // hover + skeleton surface
        line: v('line'),      // borders
        main: v('main'),      // primary text
        muted: v('muted'),    // secondary text
        primary: { DEFAULT: v('brand'), dark: '#d99a06' },
        accent: '#fbbf24',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: 0, transform: 'translateX(28px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: 0, transform: 'translateX(-28px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        page: {
          '0%': { opacity: 0, transform: 'translateY(14px) scale(0.99)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s cubic-bezier(.2,.7,.2,1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(.2,.7,.2,1) both',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(.2,.7,.2,1) both',
        page: 'page 0.4s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
  plugins: [],
}

