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
        background: "#E3D5CA",
        foreground: "#000000",
        // dark_background: "#E3D5CA",
        nav_background: "#F5EBE0",
        nav_text: "#6A615C",
        nav_border: "#AB9B94",
      },
      fontFamily: {
        jost: ["Jost", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
