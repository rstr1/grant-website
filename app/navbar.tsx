'use client';

import { useState } from 'react';
import Link from 'next/link';
import tailwindConfig from '@/tailwind.config'; 
import './globals.css';

const linkStyle = 'hover:text-cadmium_orange transition duration-200';
const linkStyleMobile = `${linkStyle} border rounded-full border-nav_border dark:border-dark_nav_border p-1`;
const navBackground = tailwindConfig.theme.extend.colors.nav_background;
const navBorder = tailwindConfig.theme.extend.colors.nav_border; 
const zebraStyle = `repeating-linear-gradient(170deg, ${navBorder} 0, ${navBorder} 10px, ${navBackground} 30px, ${navBackground} 40px)`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="">
      <div className="mx-auto flex items-center h-full">

        {/* Home Link */}
        <div
          style={{ letterSpacing: '0.4em' }}
          className="font-bold whitespace-nowrap px-6 py-3 border-r border-nav_border "
        >
          <Link href="/" className={linkStyle}>GRANT DONG</Link>
        </div>
        
        {/* Zebra Stripes */}
        <div
          className="flex-grow h-8 mx-2" // hidden sm:flex
          style={{ backgroundImage: zebraStyle }}
        ></div>


        {/* Desktop Nav */}
        <div
          style={{ letterSpacing: '0.2em' }}
          className="hidden sm:flex
          gap-6
          ml-auto 
          text-xs 
          items-center 
          whitespace-nowrap 
          scrollbar-hide 
          px-6 py-4 
          border-l 
          border-nav_border 
          dark:border-dark_nav_border
          [direction:rtl]"
        >
          <Link href="/resume" className={linkStyle}>RESUME</Link>
          <Link href="/articles" className={linkStyle}>ARTICLES</Link>
          <Link href="/photography" className={linkStyle}>PHOTOGRAPHY</Link>
          <Link href="/tierlist" className={linkStyle}>MUSIC</Link>
        </div>

        

        {/* Hamburger Button */}
        <div className="flex border-l border-nav_border items-center px-6 py-3 sm:hidden ml-auto text-xl font-bold transition-transform duration-300">
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(prev => !prev)}
          >
              <div className={`relative w-6 h-6 flex flex-col justify-center items-center`}>
                <span className={`absolute left-0 h-[2px] bg-nav_text transition-all duration-300 ${menuOpen ? 'top-3 left-2 w-2 opacity-0' : 'top-1 left-0 w-6 opacity-100'}`}></span>
                <span className={`absolute left-0 w-6 h-[2px] bg-nav_text transition-all duration-200 ${menuOpen ? 'top-3 rotate-45' : 'top-3'}`}></span>
                <span className={`absolute left-0 w-6 h-[2px] bg-nav_text transition-all duration-200 ${menuOpen ? 'top-3 -rotate-45' : 'top-3'}`}></span>
                <span className={`absolute left-0 h-[2px] bg-nav_text transition-all duration-300 ${menuOpen ? 'top-3 left-2 w-2 opacity-0' : 'top-5 left-0 w-6 opacity-100'}`}></span>
              </div>
          </button>
        </div>
        

      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`sm:hidden bg-sky_blue border border-nav_border flex flex-col gap-4 p-4 text-xs rounded-xl max-w-[200px] shadow-lg transition-all duration-300 mt-6 ml-auto`}>
          <Link href="/tierlist" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>MUSIC</Link>
          <Link href="/photography" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>PHOTOGRAPHY</Link>
          <Link href="/articles" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>ARTICLES</Link>
          <Link href="/resume" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>RESUME</Link>
        </div>
      )}
    </nav>
  );
}
