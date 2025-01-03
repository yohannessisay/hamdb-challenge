/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './*.html'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        play: ['Play', 'sans-serif'],
      },
    },
  },
  mode: 'jit',
};
