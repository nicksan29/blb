/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blb: {
          black: '#0A0A0A',
          gold: '#D4AF37',
          purple: '#6A0D91',
        }
      }
    },
  },
  plugins: [],
}