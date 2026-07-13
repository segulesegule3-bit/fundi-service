/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7', // Sky Blue primary
          600: '#0369a1',
          700: '#035a85',
        },
        tanzanite: {
          500: '#1e3a8a', // Deep Blue secondary
          600: '#172554',
        },
        accent: {
          500: '#f59e0b', // Amber/gold details
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
