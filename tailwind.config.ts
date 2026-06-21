import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
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
        light_orange: "#ffbf00",
        orangey: "#ee8432",
        sky_blue: "#87CEEB",        // sky blue
        other_blue: "#69C3FF",      // other blue
        flower_background: 'rgba(174, 181, 168, 1)',
        test_background: 'rgba(255, 255, 255, 0)',
        dithered_background: 'rgba(49, 43, 29, 1)', // image background believes its 49, 42, 28
        gradient_background: 'rgb(25, 19, 13)', // header and footer gradients

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
        jacquard_12: "var(--font-jacquard)",
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
  plugins: [require('tailwind-scrollbar-hide')],
} satisfies Config;
