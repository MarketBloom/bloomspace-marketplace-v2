import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  prefix: "",
  safelist: [
    'delay-[var(--delay)]',
    'duration-[var(--duration)]',
    'ease-[var(--easing)]'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["SF Pro Display", "Inter", "sans-serif"],
        mono: ["SF Pro Display", "Inter", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#1D1D1F",
        primary: {
          DEFAULT: "#D73459",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#eed2d8",
          foreground: "#1D1D1F",
        },
        muted: {
          DEFAULT: "#F5F5F7",
          foreground: "#86868B",
        },
        accent: {
          DEFAULT: "#eed2d8",
          foreground: "#1D1D1F",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: {
        'apple': '0 2px 4px rgba(0, 0, 0, 0.08), 0 2px 12px rgba(0, 0, 0, 0.06)',
        'apple-hover': '0 4px 8px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.08)',
      },
      height: {
        'header': '60px',
      },
      minHeight: {
        'hero': '520px',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4))',
        'rainbow-gradient': 'linear-gradient(90deg, #D73459 0%, #eed2d8 50%, #D73459 100%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rainbow: {
          "0%": { "background-position": "0%" },
          "100%": { "background-position": "200%" },
        },
        shine: {
          "0%": { "background-position": "0% 0%" },
          "50%": { "background-position": "100% 100%" },
          to: { "background-position": "0% 0%" },
        },
        gooey: {
          "0%, 100%": { 
            transform: "translate(0, 0) scale(1)",
            filter: "blur(32px)"
          },
          "33%": { 
            transform: "translate(5px, -5px) scale(1.1)",
            filter: "blur(24px)"
          },
          "66%": { 
            transform: "translate(-5px, 5px) scale(0.95)",
            filter: "blur(40px)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        rainbow: "rainbow var(--speed, 2s) infinite linear",
        shine: "shine var(--duration, 14s) infinite linear",
        gooey: "gooey 8s ease-in-out infinite"
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
} satisfies Config;