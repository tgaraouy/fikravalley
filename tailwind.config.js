/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        terracotta: {
          50: '#fff8f6',
          100: '#fff1ed',
          200: '#ffe0d5',
          300: '#ffc5b0',
          400: '#ff9e80',
          500: '#ff704d',
          600: '#f04f26',
          700: '#c93a15',
          800: '#a63014',
          900: '#872a12',
          950: '#4a1305',
        },
        sand: {
          50: '#fdfcfb',
          100: '#fbf9f6',
          200: '#f5f0e8',
          300: '#ede4d4',
          400: '#e2d1b3',
          500: '#d4b98c',
          600: '#c2a06e',
          700: '#a18255',
          800: '#856a48',
          900: '#6d573e',
          950: '#3d2f20',
        },
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(238,242,255,1) 0%, rgba(224,231,255,1) 40%, rgba(199,210,254,1) 100%)',
        'moroccan-gradient':
          'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(79,70,229,0.4)',
        warm: '0 20px 45px -20px rgba(166, 48, 20, 0.2)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};
