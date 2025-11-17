/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
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
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(238,242,255,1) 0%, rgba(224,231,255,1) 40%, rgba(199,210,254,1) 100%)',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(79,70,229,0.4)',
      },
    },
  },
  plugins: [],
};
