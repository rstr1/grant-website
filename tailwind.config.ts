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
        foreground: "#000000",      // black
        dark_background: "#1e1d18", // dark grey
        nav_border: "#AB9B94",      // brown/grey
        eggshell: "#F0EAD6",        // eggshell white
        cadmium_orange: "#F28C28",  // cadmium orange
        sky_blue: "#87CEEB",        // sky blue
        other_blue: "#69C3FF",      // other blue

        background: "#1e1d18",      // dark background
        nav_background: "#1e1d18",  // dark background
        nav_text: "#ffffff",

        // absolutely: "#c7b69c",
        // dawn: "#4f5b48",
        // eusexua: "#b8c2c1",
        // forever_howlong: "#da3331",
        // heaven_or_las_vegas: "#4a4871",
        // in_rainbows: "#030305",

      },
      // This is where you need to include imported fonts in order to reference via tailwind.css
      fontFamily: {
        jost: ['Jost', 'sans-serif'],
        arial: ['Arial', 'sans-serif'],
      },
    },
    screens: {
      'xs': '480px',
      'sm': '649px', // navbar collapse relies on 'sm'
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  },
  plugins: [require('tailwind-scrollbar-hide'),heroui()],
} satisfies Config;
