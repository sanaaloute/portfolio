import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090f',
        surface: '#0f111a',
        'surface-2': '#161925',
        border: 'rgba(148, 163, 184, 0.1)',
        'border-strong': 'rgba(148, 163, 184, 0.18)',
        text: '#f8fafc',
        'text-muted': '#94a3b8',
        accent: '#6366f1',
        'accent-2': '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 60px rgba(99, 102, 241, 0.15)',
        'glow-sm': '0 0 30px rgba(99, 102, 241, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [typography],
};

export default config;
