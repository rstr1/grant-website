import type { Metadata } from "next";
// import { Jost } from "next/font/google";
import "./globals.css";
import React from "react";
import Navbar from "./navbar";
// import Trail from "./trail";


// const jostFont = Jost({
//   variable: "--font-jost",
//   subsets: ["latin"],
// });

// const linkStyle = "hover:text-blue-400 transition duration-200";
// const linkStyle = "cursor-none hover:text-blue-400 transition duration-200";

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
    <html lang="en" className="">
      <body className="">

        <div className="">
          {/* <Trail /> */}
        </div>

        <Navbar></Navbar>

        {/* <div>
          <nav className="w-full px-4 h-12 justify-between bg-nav_background text-nav_text p-3 fixed border border-nav_border z-50">
            <div className="flex flex-nowrap pl-3 gap-4">
              <div
                style={{ letterSpacing: "0.4em" }}
                className="font-bold gap-4 whitespace-nowrap"
              >
                <Link href="/"className={`${linkStyle}`}>GRANT DONG</Link>
              </div>

              <div
                style={{ letterSpacing: "0.2em" }}
                className="hidden md:flex gap-6 ml-auto text-xs items-center overflow-x-auto whitespace-nowrap scrollbar-hide [direction:rtl]"
              >
                <Link href="/resume" className={`${linkStyle}`}>RESUME</Link>
                <Link href="/articles" className={`${linkStyle}`}>ARTICLES</Link>
                <Link href="/photography" className={`${linkStyle}`}>PHOTOGRAPHY</Link>
                <Link href="/tierlist" className={`${linkStyle}`}>MUSIC</Link>
              </div>
            
              <button
                type="button"
                className="md:hidden z-50 ml-auto [direction:rtl] font-bold text-2xl"
                aria-controls="mobile-menu"
                aria-label="Toggle Navigation"
                aria-expanded="false"
              >
                ☰
              </button>
            </div>
          </nav>
        </div> */}

        <div className="pt-12 flex-wrap">{children}</div>
      </body>
    </html>
  );
}
