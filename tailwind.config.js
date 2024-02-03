/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        'left':'-114px -60px 0px -40px #14181F,5px 0px 0px #1a1a1a;'
      },
    },
  },
  plugins: [],
}

