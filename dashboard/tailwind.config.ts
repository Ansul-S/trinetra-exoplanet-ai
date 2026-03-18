import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#020408',
          900: '#040D1A',
          800: '#071525',
          700: '#0A1E33',
          600: '#0E2A47',
          500: '#1A3F6B',
        },
        star: {
          blue:  '#378ADD',
          teal:  '#1D9E75',
          green: '#639922',
          amber: '#EF9F27',
          coral: '#D85A30',
        },
        tier: {
          earthlike: { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459' },
          promising: { bg: '#E6F1FB', text: '#185FA5', border: '#85B7EB' },
          hot:       { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595' },
          cold:      { bg: '#E6F1FB', text: '#0C447C', border: '#85B7EB' },
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 20s linear infinite',
        'drift':      'drift 60s linear infinite',
        'scan':       'scan 4s ease-in-out infinite',
      },
      keyframes: {
        drift: {
          '0%':   { transform: 'translateY(0px)' },
          '50%':  { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        scan: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(55,138,221,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(55,138,221,0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}

export default config
