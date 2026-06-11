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
        // ── Brand / surface (canonical, from the onboarding system) ──
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#0F1A2E", // primary brand / text
        canvas: "#F5F5F7", // app background
        surface: "#FFFFFF", // cards, sheets
        border: "#E5E5E8",
        muted: "#9CA3AF", // tertiary text
        secondary: "#6B7280", // secondary text
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        // ── Service-category palette (product data colours) ──
        // Colour-codes services/verticals; not brand chrome. Mirrored
        // in src/lib/tokens/categories.ts for runtime/data consumers.
        category: {
          hair: "#7C3AED",
          colour: "#EC4899",
          barbering: "#475569",
          beauty: "#F43F5E",
          nails: "#F59E0B",
          massage: "#0D9488",
          "brows-lashes": "#C026D3",
          fitness: "#10B981",
          wellness: "#0EA5E9",
        },
      },
      fontFamily: {
        // Canonical stack — the onboarding app renders the system font;
        // the bundled Geist files are intentionally unused.
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        phone: "28px", // mobile-frame outer radius
      },
      boxShadow: {
        phone: "0 28px 80px rgba(15, 26, 46, 0.18)",
        card: "0 12px 32px rgba(15, 26, 46, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
