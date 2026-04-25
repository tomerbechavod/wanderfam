import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        forest: {
          50:  '#f0f7f4',
          100: '#dceee7',
          200: '#b9ddd0',
          300: '#8dc5b1',
          400: '#5fa68e',
          500: '#3d8872',
          600: '#2a6049',  // primary
          700: '#235040',
          800: '#1c3f33',
          900: '#173328',
        },
        sand: {
          50:  '#faf8f4',
          100: '#f2ede3',
          200: '#e4d9c5',
          300: '#d2bfa0',
          400: '#bea077',
          500: '#aa8557',
          600: '#8f6a3f',
          700: '#745335',
          800: '#5e422d',
          900: '#4a3425',
        },
        terracotta: {
          50:  '#fdf4ef',
          100: '#fae5d5',
          200: '#f5caa9',
          300: '#eda97a',
          400: '#e8885a', // accent
          500: '#d96a36',
          600: '#bc522a',
          700: '#964127',
          800: '#793526',
          900: '#622e23',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        'bottom-nav': '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 16px rgba(0,0,0,0.04)',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}
export default config
