/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ff',
          100: '#feeaff',
          200: '#fdd4ff',
          300: '#fbb1ff',
          400: '#f77fff',
          500: '#f04cff',
          600: '#e01fd6',
          700: '#bc0db0',
          800: '#9a0e8f',
          900: '#7d1074',
        },
        accent: {
          50: '#fff8f0',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      fontFamily: {
        'japanese': ['Hiragino Sans', 'Yu Gothic', 'Meiryo', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}

