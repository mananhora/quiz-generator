/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        background: '#FAF9F6',
        textColor: '#2C1810',
        success: '#7C9082',
        review: '#D4AC2B',
        progress: '#6B7F94',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'source': ['"Source Serif Pro"', 'serif'],
      },
      animation: {
        'fade-in': 'fade-in 500ms ease-out forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}