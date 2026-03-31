/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6", // Tailwind teal-500
        secondary: "#10b981", // Tailwind emerald-500
        dark: "#0f172a", // Tailwind slate-900
        light: "#f8fafc", // Tailwind slate-50
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
