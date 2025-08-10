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
        // foreground: "#000000",      // black
        // dark_background: "#1e1d18", // dark grey
        // nav_border: "#AB9B94",      // brown/grey
        eggshell: "#F0EAD6",        // eggshell white
        cadmium_orange: "#F28C28",  // cadmium orange
        sky_blue: "#87CEEB",        // sky blue
        other_blue: "#69C3FF",      // other blue

        // FINAL PALETTE W/ LIGHT AND DARK MODES
        background: "#ffffff",
        nav_background: "#AB9B94",
        nav_border: "#F0EAD6",
        nav_text: "#F0EAD6",
        text: "#1e1d18",

        dark_background: "#313131",
        dark_nav_background: "#000000",
        dark_nav_border: "#F0EAD6",
        dark_nav_text: "#F0EAD6",
        dark_text: "#F0EAD6",

        

        // PALETTE 1 --> earthy tones
        // background: "#F0EAD6",     
        // nav_background: "#889063",  
        // nav_border: "#4C3D19",
        // nav_text: "#4C3D19",
        // text: "#845b43",

        // PALETTE 2 --> cool greyscale
        // background: "#222831",
        // nav_background: "#393E46",
        // nav_border: "#ffffff",
        // nav_text: "#ffffff",
        // text: "#ffffff",
        

        // PALETTE 3 --> warm greyscale
        // background: "#2A2727",
        // nav_background: "#181716",  
        // nav_border: "#ffffff",
        // nav_text: "#ffffff",
        // text: "#ffffff",

        // PALETTE 4 --> green and light green
        // background: "#586b41",     
        // nav_background: "#90a16a",  
        // nav_border: "#ffffff",
        // nav_text: "#ffffff",
        // text: "#ffffff",

        // PALETTE 5 --> green & orange
        // background: "#0d0d0d",
        // background1: "#AE431E",  
        // background2: "#D08224",   
        // nav_background: "#8A8635",  
        // nav_border: "#E5D7C4",
        // nav_text: "#E5D7C4",
        // text: "#E5D7C4",
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
