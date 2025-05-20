import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import React from "react";
import Link from "next/link";

const jostFont = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

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
    <html lang="en">
      <body className={jostFont.variable}>
        {/* Navigation Toolbar */}
        <nav className="w-full px-4 h-12 justify-between bg-nav_background text-nav_text p-3 fixed border border-nav_border z-50">
          <div className="flex flex-nowrap pl-3 gap-4">
            {/* GRANT DONG */}
            <div
              style={{ letterSpacing: "0.4em" }}
              className="font-bold gap-4 whitespace-nowrap"
            >
              <Link href="/">GRANT DONG</Link>
            </div>

            {/* NAVIGATION LINKS */}
            <div
              style={{ letterSpacing: "0.2em" }}
              className="flex gap-6 ml-auto text-xs items-center overflow-x-auto whitespace-nowrap scrollbar-hide [direction:rtl]"
            >
              <Link href="/resume" className="hover:text-blue-400 transition duration-200">RESUME</Link>
              <Link href="/articles" className="hover:text-blue-400 transition duration-200">ARTICLES</Link>
              <Link href="/photography" className="hover:text-blue-400 transition duration-200">PHOTOGRAPHY</Link>
              <Link href="/testing" className="hover:text-blue-400 transition duration-200">TESTING</Link>
            </div>
          </div>
        </nav>

        {/* Main Page Content */}
        <div>{children}</div>
      </body>
    </html>
  );
}
