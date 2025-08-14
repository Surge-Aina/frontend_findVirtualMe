/** @type {import('tailwindcss').Config} */
import aspectRatio from '@tailwindcss/aspect-ratio'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Prata', 'serif'],
        body: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: [aspectRatio],
}