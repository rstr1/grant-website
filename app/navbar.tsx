'use client';

import { useState } from 'react';
import Link from 'next/link';

const linkStyle = 'hover:text-blue-400 transition duration-200';
const linkStyleMobile = `${linkStyle} border rounded-full border-nav_border p-1`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full px-4 h-12 justify-between bg-nav_background text-nav_text p-3 fixed border border-nav_border z-50">
      <div className="max-w-screen-xl mx-auto flex items-center h-full gap-4">
        <div
          style={{ letterSpacing: '0.4em' }}
          className="font-bold whitespace-nowrap"
        >
          <Link href="/" className={linkStyle}>GRANT DONG</Link>
        </div>

        {/* Desktop Nav */}
        <div
          style={{ letterSpacing: '0.2em' }}
          className="hidden sm:flex gap-6 ml-auto text-xs items-center whitespace-nowrap scrollbar-hide [direction:rtl]"
        >
          <Link href="/resume" className={linkStyle}>RESUME</Link>
          <Link href="/articles" className={linkStyle}>ARTICLES</Link>
          <Link href="/photography" className={linkStyle}>PHOTOGRAPHY</Link>
          <Link href="/tierlist" className={linkStyle}>MUSIC</Link>
        </div>

        {/* Hamburger Button */}
        <button
          type="button"
          className="sm:hidden ml-auto text-xl font-bold"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(prev => !prev)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-sky_blue border border-nav_border flex flex-col gap-4 p-4 text-xs">
          <Link href="/resume" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>RESUME</Link>
          <Link href="/articles" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>ARTICLES</Link>
          <Link href="/photography" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>PHOTOGRAPHY</Link>
          <Link href="/tierlist" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>MUSIC</Link>
        </div>
      )}
    </nav>
  );
}
