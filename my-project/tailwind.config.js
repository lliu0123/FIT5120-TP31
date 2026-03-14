/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./awareness.html",
    "./profile.html",
    "./tools.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#FF8C00',
        'danger-red': '#FF4D4D',
        'bg-gray': '#fcfcfc',
        'text-main': '#1d1d1f',
        'text-sub': '#86868b',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}