'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const linkStyle = 'hover:text-light_orange transition duration-200';
const linkStyleMobile = `${linkStyle} border rounded-full border-nav_border dark:border-dark_nav_border p-1`;

export default function Navbar() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Reset on every page change
        setScrolled(false);

        // Some pages use an inner #scroll-container for their scrolling; others
        // (like the home page) use the natural window scroll. Support both by
        // checking for the container first and falling back to window.
        const container = document.getElementById('scroll-container');

        const handleScroll = () => {
            const scrollPosition = container ? container.scrollTop : window.scrollY;
            setScrolled(scrollPosition > 100);
        };

        // Initial check on mount / pathname change.
        handleScroll();

        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
            return () => container.removeEventListener('scroll', handleScroll);
        } else {
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [pathname]);

    return (
        <div className={""}>
            <nav className={`
                backdrop-blur-sm
                transition-[padding,height] duration-300 ease-in-out
                ${scrolled ? 'h-12': 'h-12 lg:h-20'}
            `}>
                <div className="mx-auto flex items-center h-full">

                {/* Home Link */}
                <div
                    style={{ letterSpacing: '0.4em' }}
                    className={`
                    text-md lg:text-xl
                    font-bold
                    whitespace-nowrap
                    px-6 py-3
                    border-dark_nav_border
                `}>
                {/* border-r  */}
                    <Link href="/" className={linkStyle}>GRANT DONG</Link>
                </div>

                {/* Desktop Nav */}
                <div
                    style={{ letterSpacing: '0.2em' }}
                    className={`hidden sm:flex
                    gap-6
                    lg:gap-8
                    ml-auto 
                    text-xs
                    items-center 
                    whitespace-nowrap 
                    scrollbar-hide 
                    px-6 py-4
                    border-nav_border 
                    dark:border-dark_nav_border
                    [direction:rtl]
                    `}>
                    <Link href="/resume" className={linkStyle}>RESUME</Link>
                    {/* <Link href="/articles" className={linkStyle}>ARTICLES</Link>
                    <Link href="/photography" className={linkStyle}>PHOTOGRAPHY</Link> */}
                    <Link href="/tierlist" className={linkStyle}>FUN</Link>
                    <Link href="/projects" className={linkStyle}>PROJECTS</Link>
                </div>

                {/* Hamburger Button */}
                <div className="flex border-l border-nav_border dark:border-dark_nav_border items-center px-6 py-3 sm:hidden ml-auto text-xl font-bold transition-transform duration-300">
                    <button
                    type="button"
                    aria-label="Toggle navigation"
                    onClick={() => setMenuOpen(prev => !prev)}
                    >
                        <div className={`relative w-6 h-6 flex flex-col justify-center items-center`}>
                        <span className={`absolute left-0 h-[2px] bg-nav_text dark:bg-dark_nav_text transition-all duration-200 ${menuOpen ? 'top-3 left-2 w-2 opacity-0' : 'top-1 left-0 w-6 opacity-100'}`}></span>
                        <span className={`absolute left-0 w-6 h-[2px] bg-nav_text dark:bg-dark_nav_text transition-all duration-200 ${menuOpen ? 'top-3 rotate-45' : 'top-3'}`}></span>
                        <span className={`absolute left-0 w-6 h-[2px] bg-nav_text dark:bg-dark_nav_text transition-all duration-200 ${menuOpen ? 'top-3 -rotate-45' : 'top-3'}`}></span>
                        <span className={`absolute left-0 h-[2px] bg-nav_text dark:bg-dark_nav_text transition-all duration-200 ${menuOpen ? 'top-3 left-2 w-2 opacity-0' : 'top-5 left-0 w-6 opacity-100'}`}></span>
                        </div>
                    </button>
                </div>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                <div className={`sm:hidden bg-text border border-nav_border flex flex-col gap-4 p-4 text-xs rounded-xl max-w-[200px] shadow-lg transition-all duration-300 mt-6 ml-auto`}>
                    <Link href="/tierlist" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>MUSIC</Link>
                    <Link href="/photography" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>PHOTOGRAPHY</Link>
                    <Link href="/articles" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>ARTICLES</Link>
                    <Link href="/resume" className={linkStyleMobile} onClick={() => setMenuOpen(false)}>RESUME</Link>
                </div>
                )}
            </nav>
        </div>
    );
}
