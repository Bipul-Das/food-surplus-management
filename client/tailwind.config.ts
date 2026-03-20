import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. TYPOGRAPHY: Enforcing Roboto
      fontFamily: {
        sans: ['var(--font-roboto)', 'sans-serif'],
      },
      // 2. THE ENTERPRISE COLOR PALETTE
      colors: {
        brand: {
          blue: "#4a86e8",   // Primary actions & highlights
          green: "#6aa84f",  // Success & Brand marks
          dark: "#0a192f",   // Typography & deeply contrasted elements
          light: "#7ba7f0",  // Hover states for blue
        },
        semantic: {
          warning: "#f59e0b", // Amber: Pending, Awaiting
          danger: "#ef4444",  // Soft Red: Errors, Deletions, Expirations
          success: "#10b981", // Emerald: Completed, Verified
        },
        surface: {
          background: "#f8fafc", // High-contrast clean SaaS background
          card: "#ffffff",       // Pure white for spacious data cards
        }
      },
      // 3. CINEMATIC SHADOWS: Replacing the brutalist blocks with smooth, diffused depth
      boxShadow: {
        'sm': '0 2px 4px rgba(0,0,0,0.02)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'cinematic': '0 25px 50px -12px rgba(0, 0, 0, 0.08)', // For modals and heavy lifts
      },
      // 4. SMOOTH ANIMATIONS: 300ms ease-in-out global standard
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth ease-in-out
      }
    },
  },
  plugins: [],
};
export default config;