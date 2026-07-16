import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core palette — identical to site/ (DESIGN.md source of truth)
        paper: "#f4f1ea",
        "paper-dim": "#ede9df",
        ink: "#15130f",
        "ink-secondary": "#31302e",
        "ink-muted": "#6b6459",
        "ink-faint": "#726b5c",
        hairline: "#dedace",
        "hairline-strong": "#c9c3b3",
        accent: "#c23b22",
        "accent-dim": "#a73119",
        danger: "#fb2c36",
        amber: "#edb200",
        // Dark theme surfaces (monochrome workspace, white-as-primary)
        "dark-bg": "#141414",
        "dark-surface": "#1e1e1e",
        "dark-surface-soft": "#292929",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "var(--font-thai)", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        thai: ["var(--font-thai)", "sans-serif"],
      },
      transitionTimingFunction: {
        swiss: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
