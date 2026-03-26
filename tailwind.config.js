/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'fade-up':     'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':     'fadeIn 0.25s ease-out both',
        'scale-in':    'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'cycle-pulse': 'cyclePulse 2s ease-in-out infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.93)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        cyclePulse: {
          '0%,100%': { boxShadow: '0 0 12px 2px rgba(239,68,68,0.4), inset 0 0 12px rgba(239,68,68,0.08)' },
          '50%':     { boxShadow: '0 0 36px 8px rgba(239,68,68,0.7), inset 0 0 24px rgba(239,68,68,0.18)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400% center' },
          '100%': { backgroundPosition: '400% center' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glass':      '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':   '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-indigo':'0 0 24px rgba(99,102,241,0.45)',
        'glow-red':   '0 0 28px rgba(239,68,68,0.55)',
        'glow-green': '0 0 24px rgba(16,185,129,0.45)',
      },
    },
  },
  plugins: [],
}
