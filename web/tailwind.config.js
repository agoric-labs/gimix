/* global require */

const sans = [
  "Roboto",
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Helvetica Neue",
  "Arial",
  "Noto Sans",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
  "Noto Color Emoji",
];

/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit", // update this line
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgba(var(--color-primary), <alpha-value>)",
        secondary: "rgba(var(--color-secondary), <alpha-value>)",
        alternative: "rgba(var(--color-alternative), <alpha-value>)",
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        "wild-sand": {
          50: "#f4f4f4",
          100: "#efefef",
          200: "#dcdcdc",
          300: "#bdbdbd",
          400: "#989898",
          500: "#7c7c7c",
          600: "#656565",
          700: "#525252",
          800: "#464646",
          900: "#3d3d3d",
          950: "#292929",
        },
        disabled: "rgba(var(--color-disabled), <alpha-value>)",
      },
      boxShadow: {
        card: "0 22px 34px rgba(116,116,116,0.25)",
      },
      borderRadius: {
        10: "10px",
        20: "20px",
      },
      fontFamily: {
        sans,
        serif: [
          "Roboto Slab",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
        altSans: ["Mulish", ...sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
