import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 - Full Palette
        primary: {
          DEFAULT: "#003fb1",
          container: "#1a56db",
          fixed: "#dbe1ff",
          "fixed-dim": "#b5c4ff",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#d4dcff",
          fixed: "#00174d",
          "fixed-variant": "#003dab",
        },
        secondary: {
          DEFAULT: "#006c49",
          container: "#6cf8bb",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#00714d",
          fixed: "#002113",
          "fixed-variant": "#005236",
        },
        tertiary: {
          DEFAULT: "#3f4a5e",
          container: "#576276",
          fixed: "#d8e3fb",
          "fixed-dim": "#bcc7de",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#d3def6",
          fixed: "#111c2d",
          "fixed-variant": "#3c475a",
        },
        surface: {
          DEFAULT: "#f7f9fb",
          variant: "#e0e3e5",
          dim: "#d8dadc",
          bright: "#f7f9fb",
          "container-lowest": "#ffffff",
          "container-low": "#f2f4f6",
          "container": "#eceef0",
          "container-high": "#e6e8ea",
          "container-highest": "#e0e3e5",
        },
        "on-surface": {
          DEFAULT: "#191c1e",
          variant: "#434654",
        },
        background: {
          DEFAULT: "#f7f9fb",
        },
        "on-background": {
          DEFAULT: "#191c1e",
        },
        outline: {
          DEFAULT: "#737686",
          variant: "#c3c5d7",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": {
          DEFAULT: "#ffffff",
          container: "#93000a",
        },
        inverse: {
          surface: "#2d3133",
          "on-surface": "#eff1f3",
          primary: "#b5c4ff",
        },
        "surface-tint": "#1353d8",

        // Brand colors
        brand: {
          blue: "#1A56DB",
          "blue-dark": "#1648c2",
          green: "#10B981",
          "green-light": "#F0FDF4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        label: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px",
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "ambient": "0 8px 40px -6px rgba(25, 28, 30, 0.06)",
        "card": "0 4px 24px -4px rgba(25, 28, 30, 0.08)",
        "elevated": "0 8px 32px -8px rgba(25, 28, 30, 0.12)",
      },
    },
  },
  plugins: [],
}

export default config
