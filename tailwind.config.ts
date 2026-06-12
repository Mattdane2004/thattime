import type { Config } from "tailwindcss";
import { tokens } from "./src/styles/tokens.tailwind";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Figma design tokens (generated; themed via CSS vars in tokens.css) ──
        // Added additively — existing brand colours below are unchanged until the
        // navy→brand remap pass (pending real primitive hexes from Figma).
        fg: tokens.colors.fg, // Figma "Text" group → utilities read `text-fg-primary`
        brand: tokens.colors.brand,
        input: tokens.colors.input,
        // surface/border: keep existing scalar as DEFAULT, add the token scale
        surface: { ...tokens.colors.surface, DEFAULT: "#FFFFFF" },
        border: { ...tokens.colors.border, DEFAULT: "#E5E5E8" },
        // primitive hue scales (escape hatch)
        grey: tokens.colors.grey, amber: tokens.colors.amber, blue: tokens.colors.blue,
        cyan: tokens.colors.cyan, emerald: tokens.colors.emerald, fuchsia: tokens.colors.fuchsia,
        green: tokens.colors.green, orange: tokens.colors.orange, lime: tokens.colors.lime,
        pink: tokens.colors.pink, purple: tokens.colors.purple, red: tokens.colors.red,
        slate: tokens.colors.slate, sky: tokens.colors.sky, stone: tokens.colors.stone,
        teal: tokens.colors.teal, indigo: tokens.colors.indigo, violet: tokens.colors.violet,
        yellow: tokens.colors.yellow,
        // ── Brand / surface (canonical, from the onboarding system) ──
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#0F1A2E", // primary brand / text
        canvas: "#F5F5F7", // app background
        // (surface/border defined above as DEFAULT + token scale)
        muted: "#9CA3AF", // tertiary text
        secondary: "#6B7280", // secondary text
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        // ── New onboarding identity (Figma "🔴 Onbaording" flow) ──
        ink: "#1C1814", // warm near-black (headlines, black CTAs)
        coral: "#FF6641", // brand accent (logo colon, stats, selection)
        cream: "#F5F3EF", // value-reveal / marketing surfaces
        fog: "#F4F4F6", // form-screen canvas
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
        // New onboarding flow typography (Figma): Plus Jakarta Sans for
        // display/headlines, Inter for UI copy.
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Figma token: Plus Jakarta Sans (headings) — `font-heading`
        heading: tokens.fontFamily.heading,
      },
      borderRadius: {
        phone: "28px", // mobile-frame outer radius
        ...tokens.borderRadius, // Figma Radius scale (none/xs/sm/md/lg/xl/2xl/3xl/full)
      },
      boxShadow: {
        phone: "0 28px 80px rgba(15, 26, 46, 0.18)",
        card: "0 12px 32px rgba(15, 26, 46, 0.08)",
        ...tokens.boxShadow, // Figma Shadows (2xs→2xl), themed via tokens.css
      },
      // Figma type scale (heading-1..4, large/regular/small/mini/caption).
      // Cast: JSON arrays widen to loose arrays; Tailwind wants [size, config] tuples.
      fontSize: tokens.fontSize as unknown as Record<string, [string, { lineHeight: string; letterSpacing: string }]>,
    },
  },
  plugins: [],
};
export default config;
