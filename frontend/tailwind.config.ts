import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material 3 Design System Colors
        surface: {
          DEFAULT: "#f7f9fb",
          bright: "#f7f9fb",
          dim: "#d8dadc",
          container: {
            DEFAULT: "#eceef0",
            low: "#f2f4f6",
            lowest: "#ffffff",
            high: "#e6e8ea",
            highest: "#e0e3e5",
          },
          variant: "#e0e3e5",
          tint: "#1353d8",
        },
        primary: {
          DEFAULT: "#003fb1",
          container: "#1a56db",
          fixed: "#dbe1ff",
          "fixed-dim": "#b5c4ff",
        },
        secondary: {
          DEFAULT: "#006c49",
          container: "#6cf8bb",
          fixed: "#6ffbbe",
          "fixed-dim": "#4edea3",
        },
        tertiary: {
          DEFAULT: "#3f4a5e",
          container: "#576276",
          fixed: "#d8e3fb",
          "fixed-dim": "#bcc7de",
        },
        // Text colors
        "on-surface": {
          DEFAULT: "#191c1e",
          variant: "#434654",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#d4dcff",
          fixed: "#00174d",
          "fixed-variant": "#003dab",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#00714d",
          fixed: "#002113",
          "fixed-variant": "#005236",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#d3def6",
          fixed: "#111c2d",
          "fixed-variant": "#3c475a",
        },
        // Supporting colors
        outline: {
          DEFAULT: "#737686",
          variant: "#c3c5d7",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        // Legacy CSS variables
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        label: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        ambient: "0 8px 32px -4px rgba(25, 28, 30, 0.06)",
        "ambient-lg": "0 8px 40px -4px rgba(25, 28, 30, 0.12)",
        glass: "0 8px 32px -4px rgba(25, 28, 30, 0.08)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
