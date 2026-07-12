import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F1EA",
        "paper-dim": "#EDE9DF",
        ink: "#15130F",
        "ink-muted": "#6B6459",
        "ink-faint": "#726B5C",
        hairline: "#DEDACE",
        accent: "#C23B22",
        "accent-dim": "#A73119",
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "var(--font-thai)", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        thai: ["var(--font-thai)", "sans-serif"],
      },
      maxWidth: {
        edit: "1400px",
      },
      transitionTimingFunction: {
        swiss: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
