import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        foreground: "var(--color-text)",
        muted: "var(--color-text-muted)",
        "fresh-mint": "var(--color-fresh-mint)",
        "slate-blue": "var(--color-slate-blue)",
        "forest-green": "var(--color-forest-green)",
        border: "var(--color-border)",
        surface: "var(--color-surface)",
        "surface-hover": "var(--color-surface-hover)",
      },
      fontFamily: {
        serif: ["var(--font-brawler)", "Georgia", "serif"],
        sans: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      spacing: {
        "s1": "var(--space-1)",
        "s2": "var(--space-2)",
        "s3": "var(--space-3)",
        "s4": "var(--space-4)",
        "s5": "var(--space-5)",
        "s6": "var(--space-6)",
        "s7": "var(--space-7)",
        "s8": "var(--space-8)",
        "s9": "var(--space-9)",
      },
    },
  },
  plugins: [],
};

export default config;
