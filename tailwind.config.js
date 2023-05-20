/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  content: ["./src/**/*.{html,js,hbs}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e9fbfd",
          100: "#d3f6fc",
          200: "#a7edf8",
          300: "#7ae5f5",
          400: "#4edcf1",
          500: "#22d3ee",
          600: "#1ba9be",
          700: "#147f8f",
          800: "#0e545f",
          900: "#072a30",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
