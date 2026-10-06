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
        brand: {
          light: "#6FB370",
          medium: "#5FA361",
          base: "#4F9352",
          dark: "#3F8344",
          deep: "#2F7335",
        },
        neutral: {
          offwhite: "#F9FAF9",
          subtle: "#F4F6F4",
          graphite: "#0D150E",
          dark: "#121A13",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

