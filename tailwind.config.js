/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      screens: {
        'custom-853': '853px',
      },
      fontFamily: {
        customFont:['Poppins'],
        oxygen:['Oxygen']
      }
    },
  },
  plugins: [],
}

