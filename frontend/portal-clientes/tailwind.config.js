/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  /* Royal Blue Principal */
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
          primary: '#2563eb',
          hover: '#1d4ed8',
          light: '#eff6ff',
        },
        surface: {
          base: '#ffffff',
          secondary: '#f8fafc',
          dark: '#0b0f17',
          darkCard: '#111827',
        },
        line: {
          DEFAULT: '#e2e8f0',
          dark: '#1e293b',
        },
        ink: {
          primary: '#0f172a',
          secondary: '#64748b',
          darkPrimary: '#f8fafc',
          darkSecondary: '#94a3b8',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
