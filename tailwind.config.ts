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
        void:         '#04040A',
        'bg-1':       '#080810',
        'bg-2':       '#0E0E1A',
        'bg-3':       '#151522',
        'bg-hover':   '#1C1C2E',
        // semantic aliases used across pages
        card:         '#0E0E1A',
        primary:      '#080810',
        elevated:     '#151522',
        'bg-card':    '#0E0E1A',
        gold: {
          DEFAULT: '#BF9B30',
          light:   '#E2BE6A',
          dim:     '#6B5420',
        },
        crimson: {
          DEFAULT: '#7B1F30',
          lit:     '#B83050',
        },
        ice: {
          DEFAULT: '#1A6B78',
          lit:     '#29A8B8',
        },
        cv: {
          text:      '#EDE8DF',
          secondary: '#B8B3AE',
          muted:     '#7A7672',
          gold:      '#BF9B30',
          text1:     '#EDE8DF',
          text2:     '#B8B3AE',
          text3:     '#7A7672',
        },
        'cv-text':      '#EDE8DF',
        'cv-secondary': '#B8B3AE',
        'cv-muted':     '#7A7672',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        sans:    ['var(--font-sans)', 'DM Sans', 'sans-serif'],
        accent:  ['var(--font-accent)', 'Cinzel', 'serif'],
        mono:    ['var(--font-mono)', 'DM Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(to bottom, transparent 0%, rgba(4,4,10,0.5) 50%, #04040A 100%)',
        'gradient-card': 'linear-gradient(to top, rgba(4,4,10,0.98) 0%, rgba(4,4,10,0.7) 40%, transparent 100%)',
        'gradient-side': 'linear-gradient(to right, #04040A 0%, transparent 100%)',
        'gradient-gold': 'linear-gradient(135deg, #BF9B30 0%, #E2BE6A 50%, #BF9B30 100%)',
      },
      borderColor: {
        1:              'rgba(255,255,255,0.06)',
        2:              'rgba(255,255,255,0.10)',
        gold:           'rgba(191,155,48,0.25)',
        subtle:         'rgba(255,255,255,0.08)',
        'border-subtle':'rgba(255,255,255,0.08)',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--rotate, 0deg))' },
          '50%':       { transform: 'translateY(-12px) rotate(var(--rotate, 0deg))' },
        },
        drift: {
          '0%':   { transform: 'translateY(100vh)' },
          '100%': { transform: 'translateY(-120%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        shimmer:  'shimmer 1.8s ease-in-out infinite',
        float:    'float 6s ease-in-out infinite',
        drift:    'drift 28s linear infinite',
        'fade-in':  'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
