/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F59E0B',
        'brand-dark': '#D97706',
        positive: '#22C55E',
        danger: '#EF4444',
        card: '#111111',
        'card-hover': '#1a1a1a',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
    },
  },
  plugins: [],
}
