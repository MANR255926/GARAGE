import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lime:   "var(--lime)",
        ink:    "var(--ink)",
        "ink-2":  "var(--ink-2)",
        page:   "var(--page)",
        card:   "var(--card)",
        chip:   "var(--chip)",
        slate:  "var(--slate)",
        fill:   "var(--fill)",
        border: "var(--border)",
        warn:   "var(--warn)",
      },
      fontFamily: {
        oswald: ["var(--font-oswald)", "sans-serif"],
        inter:  ["var(--font-inter)", "sans-serif"],
        mono:   ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
