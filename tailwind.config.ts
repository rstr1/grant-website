import {heroui} from '@heroui/theme';
import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(card|ripple).js"
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
        eggshell: "#F0EAD6",
        cadmium_orange: "#F28C28",
        sky_blue: "#87CEEB",

      },
      // This is where you need to include imported fonts in order to reference via tailwind.css
      fontFamily: {
        jost: ["Jost", "sans-serif"],
        arial: ["Arial", "sans-serif"],
      },
    },
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  },
  plugins: [require('tailwind-scrollbar-hide'),heroui()],
} satisfies Config;
