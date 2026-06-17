/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ocean: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#b9ddff",
          300: "#7cc2ff",
          400: "#369fff",
          500: "#0c7ee8",
          600: "#0062c6",
          700: "#0A2463",
          800: "#071a4a",
          900: "#041030",
          950: "#020a1a",
        },
        alert: {
          orange: "#FF6B35",
          red: "#E63946",
          yellow: "#F4D35E",
          green: "#06D6A0",
          blue: "#3E92CC",
        },
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "spread": "spread 4s ease-out infinite",
      },
      scale: {
        '98': '0.98',
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spread: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
