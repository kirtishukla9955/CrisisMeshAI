/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sos-red': '#ef4444',
        'sos-red-hover': '#dc2626',
      }
    },
  },
  plugins: [],
}
