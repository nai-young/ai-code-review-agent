import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#f0f0f5',
        card: 'rgba(18, 18, 26, 0.8)',
        border: 'rgba(255,255,255,0.08)',
        muted: '#6b7280',
        accent: {
          purple: '#8b5cf6',
          pink: '#ec4899',
          cyan: '#06b6d4',
          orange: '#f59e0b',
          emerald: '#10b981',
          red: '#ef4444',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        gray: {
          400: '#a0a0b0',
          500: '#6b7280',
        }
      },
    },
  },
  plugins: [],
}

export default config
