import {heroui} from '@heroui/theme';
import type { Config } from "tailwindcss";



export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./node_modules/@heroui/theme/dist/components/(card|ripple).js",
  ],
  theme: {
    extend: {
      keyframes: {
        'appearance-in': {
          '0%': { opacity: '0', filter: 'blur(5px)' },
          '100%': { opacity: '1', filter: 'blur(0)'},
        },
      },
      animation: {
        'appearance-in': 'appearance-in 0.5s forwards ease-in-out 200ms',
        'show': 'show 0.5s forwards',
      },
      colors: {

        // MISC COLOURS / HIGHLIGHTS
        eggshell: "#F0EAD6",        // eggshell white
        cadmium_orange: "#F28C28",  // cadmium orange
        sky_blue: "#87CEEB",        // sky blue
        other_blue: "#69C3FF",      // other blue
        flower_background: 'rgba(174, 181, 168, 1)',
        test_background: 'rgba(255, 255, 255, 0)',

        // FINAL PALETTE W/ LIGHT AND DARK MODES
        background: "#ffffff",
        nav_background: "#dddddd",
        nav_border: "#444444",
        nav_text: "#333333",
        text: "#444444",

        dark_background: "#313131",
        dark_nav_background:'rgba(0, 0, 0, 0.1)',
        dark_nav_border: "#eeeeee",
        dark_nav_text: "#eeeeee",
        dark_text: "#eeeeee",

      
        // PALETTE 1 --> earthy tones
        // background: "#F0EAD6",     
        // nav_background: "#889063",  
        // nav_border: "#4C3D19",
        // nav_text: "#4C3D19",
        // text: "#845b43",

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
      blur: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      // This is where you need to include imported fonts in order to reference via tailwind.css
      fontFamily: {
        jost: ["jost", "sans-serif"],
        arial: "var(--font-arial)",
        poppins: ["poppins", "sans-serif"],
        playfair: "var(--font-playfair)",
        inter: "var(--font-inter)",
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
