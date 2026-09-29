/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aevum: {
          dark: "#0b0f19",
          card: "#131c2e",
          accent: "#38bdf8",
          muted: "#94a3b8",
        },
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
      },
      animation: {
        "slow-drift": "drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};