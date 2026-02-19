import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Design system colors from PRD Section 9.1 ───────────────
      colors: {
        primary: {
          DEFAULT: "#F97316",   // Warm orange-amber — main CTAs
          hover:   "#EA6C0A",
          light:   "#FFF7ED",
        },
        secondary: {
          DEFAULT: "#0EA5E9",   // Sky blue — secondary actions, links
        },
        background: "#FEFAF5", // Warm off-white — never pure white
        surface: {
          DEFAULT: "#FFFFFF",
          2:       "#F9F5F0",  // Slightly warmer card variant
        },
        border:  "#E8DDD4",     // Warm gray borders
        text: {
          primary:   "#1C1917", // Warm near-black
          secondary: "#78716C", // Warm gray — metadata / labels
          disabled:  "#C4B5AC",
        },
        success: "#16A34A",
        warning: "#D97706",
        error:   "#DC2626",
        credit:  "#7C3AED",    // Purple — always used for credit display
      },

      // ─── Typography from PRD Section 9.2 ─────────────────────────
      fontFamily: {
        heading: ["Nunito", "sans-serif"],
        body:    ["Inter", "sans-serif"],
        mono:    ["JetBrains Mono", "monospace"],
      },

      // ─── Border radius from PRD Section 9.3 ──────────────────────
      borderRadius: {
        sm:     "6px",    // badges, inputs
        DEFAULT:"8px",    // buttons
        md:     "12px",   // cards
        lg:     "16px",   // modals
        full:   "9999px", // pill badges
      },

      // ─── Box shadows from PRD Section 9.3 ────────────────────────
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 6px rgba(0,0,0,0.07)",
        lg: "0 10px 15px rgba(0,0,0,0.10)",
      },

      // ─── Layout constants ─────────────────────────────────────────
      maxWidth: {
        container: "1280px",
        "left-panel": "320px",
      },
      width: {
        sidebar: "240px",
        "left-panel": "320px",
      },

      // ─── Animations ───────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-credit": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.6" },
        },
        "slide-in": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in":     "fade-in 0.2s ease-out",
        "pulse-credit":"pulse-credit 1.5s ease-in-out infinite",
        "slide-in":    "slide-in 0.3s ease-out",
        "scale-in":    "scale-in 0.2s ease-out",
        "spin-slow":   "spin-slow 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
