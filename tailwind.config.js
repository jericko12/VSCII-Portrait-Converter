/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-card': '#1E1E1E',
        'dark-border': '#2D2D2D',
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.9)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.9), 0 2px 4px -1px rgba(0, 0, 0, 0.9)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.9), 0 4px 6px -2px rgba(0, 0, 0, 0.9)',
      },
    },
  },
  plugins: [],
} 