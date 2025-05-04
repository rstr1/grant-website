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
        <nav className="w-full bg-nav_background text-nav_text p-3 fixed top-0 border border-nav_border z-50">
          <div className="flex flex-wrap pl-3 gap-4">
            {/* GRANT DONG */}
            <div
              style={{ letterSpacing: "0.4em" }}
              className="font-bold flex gap-4"
            >
              <Link href="/">GRANT DONG</Link>
            </div>

            {/* NAVIGATION LINKS */}
            <div
              style={{ letterSpacing: "0.2em" }}
              className="flex gap-6 ml-auto text-xs items-center"
            >
              <Link href="/testing" className="hover:text-blue-400 transition duration-200">TESTING</Link>
              <Link href="#" className="hover:text-blue-400 transition duration-200">RESUME</Link>
              <Link href="#" className="hover:text-blue-400 transition duration-200">ARTICLES</Link>
              <Link href="/photography" className="hover:text-blue-400 transition duration-200">PHOTOGRAPHY</Link>
            </div>
          </div>
        </nav>

        {/* Main Page Content */}
        <div className="">{children}</div>
      </body>
    </html>
  );
}
