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
        // Primary: Corporate Navy Blue (Your Choice)
        brand: {
          blue: "#1E3A8A", // Deep Navy
          light: "#3B82F6", // Lighter accent for hovers
          dark: "#172554",  // Almost black blue for text
        },
        // Urgency Scale
        urgency: {
          low: "#10B981",    // Green (Safe)
          medium: "#F59E0B", // Yellow (Warning)
          high: "#EF4444",   // Red (Critical)
        },
        // Text Colors
        text: {
          main: "#374151",      // Dark Gray (Your Choice)
          secondary: "#6B7280", // Muted Gray
        },
        // Backgrounds
        bg: {
          page: "#F8FAFC",  // Soft Slate Gray (Not Pure White)
          card: "#FFFFFF",  // Pure White for cards
          input: "#F3F4F6", // Filled Gray for inputs (Google Style)
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"], // Inter Font
      },
      boxShadow: {
        // Floating Effect (Your Choice)
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        hover: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      animation: {
        // Custom Animations
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;