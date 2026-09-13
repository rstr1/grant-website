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
        'reveal-line': {
          '0%': { transform: 'translateY(110%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'appearance-in': 'appearance-in 0.5s forwards ease-in-out 200ms',
        'show': 'show 0.5s forwards',
        'reveal-line': 'reveal-line 1.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'page-in': 'page-in 1s cubic-bezier(0.16, 1, 0.3, 1) both',
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
        dithered_background: 'rgb(16, 16, 16)',
        gradient_background: 'rgb(8, 8, 8)', // header and footer gradients

        forest: '#14240A',
        bone: '#DCE7E0',
        sage: '#8FA79A',
        mint: '#399E5A',

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
        geist: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
