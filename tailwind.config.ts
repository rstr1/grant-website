import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#000000",
        dark_background: "#1e1d18",
        nav_background: "#FFBC59",
        nav_text: "#6A615C",
        nav_border: "#AB9B94",
      },
      // This is where you need to include imported fonts in order to reference via tailwind.css
      fontFamily: {
        jost: ["Jost", "sans-serif"],
        arial: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
} satisfies Config;
