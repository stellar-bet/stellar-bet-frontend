import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // SportyBet exact palette
        'sp-green':   '#00a651',   // main brand green (header, buttons, active)
        'sp-green2':  '#007a3d',   // darker green (hover)
        'sp-green3':  '#e8f5ee',   // light green bg (selected row)
        'sp-header':  '#00a651',   // top header bg
        'sp-bg':      '#f5f5f5',   // page background (light grey)
        'sp-white':   '#ffffff',
        'sp-panel':   '#ffffff',   // card/panel bg
        'sp-border':  '#e0e0e0',   // borders
        'sp-text':    '#212121',   // primary text
        'sp-muted':   '#757575',   // secondary text
        'sp-faint':   '#9e9e9e',   // tertiary
        'sp-row':     '#fafafa',   // alternate row
        'sp-live':    '#d32f2f',   // live red
        'sp-odds':    '#1565c0',   // odds button blue
        'sp-odds-sel':'#00a651',   // selected odds
        'sp-yellow':  '#f9a825',   // featured/promo yellow
        'sp-navy':    '#1a237e',   // dark nav items
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        '3xs': ['0.55rem', { lineHeight: '0.9rem' }],
      },
      animation: {
        'live-pulse': 'livePulse 1.2s ease-in-out infinite',
        'fade-in':    'fadeIn 0.15s ease-out',
        'slide-up':   'slideUp 0.2s ease-out',
      },
      keyframes: {
        livePulse: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.4' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(6px)', opacity: '0' },
          to:   { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
