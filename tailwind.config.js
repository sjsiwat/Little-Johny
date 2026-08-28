/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Every colour resolves to a token in src/styles/globals.css, so light
        // and dark are one system rather than two palettes. Names are kept from
        // the previous system to avoid churning 500+ class names.
        canvas: "rgb(var(--c-canvas) / <alpha-value>)",
        paper: "rgb(var(--c-surface) / <alpha-value>)",
        "paper-dim": "rgb(var(--c-surface-hover) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        "surface-hover": "rgb(var(--c-surface-hover) / <alpha-value>)",

        ink: "rgb(var(--c-text) / <alpha-value>)",
        "ink-secondary": "rgb(var(--c-text-secondary) / <alpha-value>)",
        "ink-muted": "rgb(var(--c-text-secondary) / <alpha-value>)",
        "ink-faint": "rgb(var(--c-text-muted) / <alpha-value>)",

        hairline: "rgb(var(--c-border) / <alpha-value>)",
        "hairline-strong": "rgb(var(--c-border-strong) / <alpha-value>)",

        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-dim": "rgb(var(--c-accent-hover) / <alpha-value>)",
        "accent-fg": "rgb(var(--c-accent-fg) / <alpha-value>)",

        success: "rgb(var(--c-success) / <alpha-value>)",
        warning: "rgb(var(--c-warning) / <alpha-value>)",
        amber: "rgb(var(--c-warning) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",

        // Categorical hues for labels, categories and chart bars
        "data-1": "rgb(var(--c-data-1) / <alpha-value>)",
        "data-2": "rgb(var(--c-data-2) / <alpha-value>)",
        "data-3": "rgb(var(--c-data-3) / <alpha-value>)",
        "data-4": "rgb(var(--c-data-4) / <alpha-value>)",
        "data-5": "rgb(var(--c-data-5) / <alpha-value>)",
        "data-6": "rgb(var(--c-data-6) / <alpha-value>)",
      },
      fontFamily: {
        // Mitr carries both scripts, so there is no separate Thai entry.
        grotesk: ["var(--font-grotesk)", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
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
