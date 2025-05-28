import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import React from "react";
import Link from "next/link";
import Trail from "./trail";

const jostFont = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const linkStyle = "cursor-none hover:text-blue-400 transition duration-200";

export const metadata: Metadata = {
  title: "Grant Dong",
  description: "Personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="cursor-none">
      <body className={`${jostFont.variable}`}>
        <div>
          <Trail />
        </div>
        {/* Navigation Toolbar */}
        <nav className="w-full px-4 h-12 justify-between bg-nav_background text-nav_text p-3 fixed border border-nav_border z-50">
          <div className="flex flex-nowrap pl-3 gap-4">
            {/* GRANT DONG */}
            <div
              style={{ letterSpacing: "0.4em" }}
              className="font-bold gap-4 whitespace-nowrap"
            >
              <Link href="/"className={`${linkStyle}`}>GRANT DONG</Link>
            </div>

            {/* NAVIGATION LINKS */}
            <div
              style={{ letterSpacing: "0.2em" }}
              className="flex gap-6 ml-auto text-xs items-center overflow-x-auto whitespace-nowrap scrollbar-hide [direction:rtl]"
            >
              <Link href="/resume" className={`${linkStyle}`}>RESUME</Link>
              <Link href="/articles" className={`${linkStyle}`}>ARTICLES</Link>
              <Link href="/photography" className={`${linkStyle}`}>PHOTOGRAPHY</Link>
              <Link href="/tierlist" className={`${linkStyle}`}>MUSIC</Link>
            </div>
          </div>
        </nav>

        {/* Main Page Content */}
        <div className="">{children}</div>
      </body>
    </html>
  );
}
