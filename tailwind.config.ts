import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        surface2: "rgb(var(--c-surface2) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        blue: "#0A84FF",
        sky: "#4FA9FF",
        indigo: "#2F5BFB",
        violet: "#6C2BFB",
        deep: "#4B18B8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-arabic)", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-arabic)",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 24px rgba(47,91,251,0.25), 0 0 64px rgba(108,43,251,0.15)",
        "glow-sm": "0 0 14px rgba(10,132,255,0.35)",
        card: "0 8px 32px rgba(2,6,18,0.45)",
      },
      backgroundImage: {
        brand: "linear-gradient(90deg,#0A84FF 0%,#2F5BFB 45%,#6C2BFB 100%)",
        "brand-soft": "linear-gradient(135deg,rgba(10,132,255,0.14),rgba(108,43,251,0.14))",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        dash: {
          to: { strokeDashoffset: "-240" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        pulseDot: "pulseDot 2.2s ease-in-out infinite",
        dash: "dash 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
