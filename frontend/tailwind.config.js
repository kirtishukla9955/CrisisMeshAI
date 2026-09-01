/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./authority/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0a0e17",
          800: "#0f2337",
          700: "#17324A",
          600: "#1e4060",
        },
        urgent: {
          red: "#C0392B",
          orange: "#E67E22",
          yellow: "#F1C40F",
        },
      },
    },
  },
  plugins: [],
};