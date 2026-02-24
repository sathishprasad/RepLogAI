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
        primary: "#4F7CFF",
        "primary-hover": "#3B66E0",
        accent: "#8B9CFF",
        "bg-dark": "#0B0F17",
        "bg-light": "#F6F7FB",
        surface: "#FFFFFF",
        "muted-surface": "#F1F3F9",
        "text-primary": "#0F172A",
        "text-light": "#E5E7EB",
        "muted-text": "#6B7280",
        border: "#E5E7EB",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 1s ease-out forwards",
        "fade-up": "fade-up 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
