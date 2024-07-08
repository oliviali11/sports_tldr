/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'anton': ['Anton']
      },
      boxShadow: {
        'text-red': '4px 4px 6px rgba(255, 0, 0, 0.75)',
      },
    },
  },
  plugins: [],
}

