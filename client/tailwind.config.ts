// client/tailwind.config.ts
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
        // Custom Brand Colors
        brand: {
          blue: "#2563EB", // The permanent blue for Active Nav states
          dark: "#1E293B", // For typography and deep UI elements
          light: "#F8FAFC", // For dashboard backgrounds
          error: "#EF4444", // For professional error states
          success: "#10B981" // For success Toasts
        }
      },
    },
  },
  plugins: [],
};
export default config;