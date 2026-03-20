import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        jf: {
          purple: '#775BF4',
          'purple-dark': '#5B42D4',
          'purple-light': '#9B8CF7',
          cyan: '#756FE2',
          'cyan-dark': '#5B55C8',
          'bg-dark': '#111827',
          'bg-mid': '#1d2635',
          'border': '#3a4a5c',
        }
      }
    }
  },
  plugins: []
} satisfies Config
