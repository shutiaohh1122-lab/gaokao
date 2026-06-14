import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#f4f7fb",
        brand: {
          50: "#eef4ff",
          100: "#d7e4ff",
          200: "#b4cbff",
          300: "#89adff",
          400: "#5a88f5",
          500: "#3568db",
          600: "#254fb6",
          700: "#203f90",
          800: "#213775",
          900: "#20305d"
        },
        accent: {
          50: "#eefcf9",
          100: "#d5f6ef",
          200: "#acecdF",
          300: "#78ddcb",
          400: "#4dc7b0",
          500: "#2fae97",
          600: "#248e7d",
          700: "#227164",
          800: "#215b52",
          900: "#204b45"
        },
        gold: {
          100: "#fff0c9",
          200: "#ffd98f",
          300: "#f4b95e"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(23, 32, 51, 0.12)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(53, 104, 219, 0.16) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
