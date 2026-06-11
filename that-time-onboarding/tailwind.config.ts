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
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: "#0F1A2E",
        canvas: "#F5F5F7",
        surface: "#FFFFFF",
        border: "#E5E5E8",
        muted: "#9CA3AF",
        secondary: "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
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
