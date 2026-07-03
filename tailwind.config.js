/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans Myanmar', 'Padauk', 'Pyidaungsu', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
