import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
       brand: {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E5E7EB",
  accent: "#E0007A",
  accentHover: "#C00068",
  text: "#111827",
  muted: "#6B7280",
  easy: "#16A34A",
  medium: "#CA8A04",
  hard: "#EA580C",
  expert: "#9333EA",
},
      },
      animation: {
        "bounce-in": "bounceIn 0.4s cubic-bezier(0.36,0.07,0.19,0.97)",
        shake: "shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97)",
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.4s ease",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
