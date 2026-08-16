import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FBF6EC',
          soft: '#F7F0E2',
          deep: '#F0E6D3'
        },
        ink: {
          DEFAULT: '#2A2620',
          soft: '#4E4840',
          mute: '#80786B'
        },
        cambodia: {
          50: '#F0F7F2',
          100: '#DCECE2',
          200: '#BAD9C7',
          300: '#90BFA4',
          400: '#5FA07D',
          500: '#3D855F',
          600: '#2C6B4C',
          700: '#24553D',
          800: '#1E4433',
          900: '#19382B'
        },
        sand: {
          50: '#FBF6EC',
          100: '#F6EAD2',
          200: '#EDD6A6',
          300: '#E2BD76',
          400: '#D5A34C',
          500: '#C98F35',
          600: '#B1782B',
          700: '#8F5F24',
          800: '#744D21',
          900: '#5F3F1E'
        },
        clay: {
          100: '#FBEEE6',
          500: '#C9623F',
          600: '#A94D2E'
        }
      },
      fontFamily: {
        sans: ['Manrope', ...fontFamily.sans]
      },
      boxShadow: {
        soft: '0 1px 2px rgba(42,38,32,.04), 0 6px 20px rgba(42,38,32,.05)',
        lift: '0 2px 4px rgba(42,38,32,.05), 0 14px 34px rgba(42,38,32,.11)',
        glow: '0 0 0 1px rgba(44,107,76,.10), 0 10px 30px rgba(44,107,76,.18)',
        'glow-sand': '0 0 0 1px rgba(201,143,53,.16), 0 10px 30px rgba(201,143,53,.22)',
        emoji: '0 12px 24px -10px rgba(74,58,26,.38)',
        'emoji-sm': '0 6px 14px -6px rgba(74,58,26,.32)',
        'inner-soft': 'inset 0 2px 8px rgba(42,38,32,.06)',
        ring: '0 0 0 3px rgba(44,107,76,.16)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(2deg)' }
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'check-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(16px) scale(.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.55' }
        },
        'draw-line': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' }
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'fade-up': 'fade-up .55s cubic-bezier(.22,1,.36,1) both',
        'fade-in': 'fade-in .3s ease-out both',
        'pop-in': 'pop-in .28s cubic-bezier(.22,1,.36,1) both',
        'check-pop': 'check-pop .32s cubic-bezier(.22,1,.36,1) both',
        'toast-in': 'toast-in .32s cubic-bezier(.22,1,.36,1) both',
        'slide-down': 'slide-down .28s cubic-bezier(.22,1,.36,1) both',
        'slide-up': 'slide-up .4s cubic-bezier(.22,1,.36,1) both',
        'pulse-soft': 'pulse-soft 2.6s ease-in-out infinite',
        'draw-line': 'draw-line .5s cubic-bezier(.22,1,.36,1) both'
      }
    }
  },
  plugins: [],
}