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
        // Switching tab or day: the outgoing panel is replaced by one that slides in from the side the
        // visitor moved towards, resolving out of a short blur. The blur clears by 55% so the long tail of
        // the easing is a cheap transform instead of a full-layer filter on a list of thirty cards.
        'tab-in-right': {
          '0%': { opacity: 0, transform: 'translate3d(26px,0,0) scale(.985)', filter: 'blur(5px)' },
          '55%': { filter: 'blur(0)' },
          '100%': { opacity: 1, transform: 'translate3d(0,0,0) scale(1)', filter: 'blur(0)' },
        },
        'tab-in-left': {
          '0%': { opacity: 0, transform: 'translate3d(-26px,0,0) scale(.985)', filter: 'blur(5px)' },
          '55%': { filter: 'blur(0)' },
          '100%': { opacity: 1, transform: 'translate3d(0,0,0) scale(1)', filter: 'blur(0)' },
        },
        // Each card follows the panel a beat later (see MatchCard), so a list arrives as a wave.
        'card-in': {
          '0%': { opacity: 0, transform: 'translate3d(0,10px,0)' },
          '100%': { opacity: 1, transform: 'translate3d(0,0,0)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(100%)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        // Splash screen: a soft glow breathing behind the logo and an indeterminate shimmer sweeping the
        // loading bar. Both loop freely — they are not tied to how long the data actually takes.
        'splash-glow': {
          '0%, 100%': { opacity: .5, transform: 'scale(.9)' },
          '50%': { opacity: 1, transform: 'scale(1.08)' },
        },
        'splash-shimmer': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(350%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.45s cubic-bezier(.2,.7,.2,1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(.2,.7,.2,1) both',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(.2,.7,.2,1) both',
        page: 'page 0.4s cubic-bezier(.2,.7,.2,1) both',
        // Decelerating ease: fast off the mark, long soft landing.
        //
        // `backwards`, not `both`, on purpose. These are entrance animations, and a forwards fill keeps the
        // last keyframe's `transform` applied for good — which outranks the element's own classes and
        // silently kills `hover:-translate-y-1` on a card. Backwards still holds the first keyframe through
        // the stagger delay (cards wait their turn invisibly), then hands styling back to CSS. The last
        // keyframe equals the resting style, so nothing jumps.
        'tab-in-right': 'tab-in-right 0.42s cubic-bezier(.22,1,.36,1) backwards',
        'tab-in-left': 'tab-in-left 0.42s cubic-bezier(.22,1,.36,1) backwards',
        'card-in': 'card-in 0.42s cubic-bezier(.22,1,.36,1) backwards',
        'slide-up': 'slide-up 0.35s cubic-bezier(.22,1,.36,1) both',
        'splash-glow': 'splash-glow 1.8s ease-in-out infinite',
        'splash-shimmer': 'splash-shimmer 1.3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

