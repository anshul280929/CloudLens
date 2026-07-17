import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-subtle": "var(--ink-subtle)",
        hairline: "var(--hairline)",
        "hairline-soft": "var(--hairline-soft)",
        "accent-blue": "var(--accent-blue)",
        "inverse-canvas": "var(--inverse-canvas)",
        "inverse-ink": "var(--inverse-ink)",
        "product-terraform": "var(--product-terraform)",
        "product-terraform-bright": "var(--product-terraform-bright)",
        "product-vault": "var(--product-vault)",
        "product-consul": "var(--product-consul)",
        "product-waypoint": "var(--product-waypoint)",
        "product-waypoint-deep": "var(--product-waypoint-deep)",
        "product-vagrant": "var(--product-vagrant)",
        "product-nomad": "var(--product-nomad)",
        "product-boundary": "var(--product-boundary)",
        "semantic-success": "var(--semantic-success)",
        "semantic-warning": "var(--semantic-warning)",
        "semantic-error": "var(--semantic-error)",
      },
      spacing: {
        hair: "1px",
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        pill: "9999px",
        full: "9999px",
      },
      fontFamily: {
        sans: ["var(--ff-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
