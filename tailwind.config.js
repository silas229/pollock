/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  content: ["./src/**/*.{html,js,hbs}"],
  safelist: ["fill-white-500", "fill-black-500", "fill-primary-500"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecf7ff",
          100: "#dcefff",
          200: "#bfe0ff",
          300: "#99caff",
          400: "#71a9ff",
          500: "#5087ff",
          600: "#3c6afb",
          700: "#244dde",
          800: "#2043b3",
          900: "#233f8c",
          950: "#142252",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
