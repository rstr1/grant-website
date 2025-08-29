import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Navbar from "./navbar";

import { Jost, Poppins, Playfair_Display, Inter } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Grant's Website",
  description: "Personal website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
    <html lang="en" className="
    overscroll-x-none
    overscroll-y-none
    overflow-auto
    bg-background
    dark:bg-dark_background  
    text-text  
    dark:text-dark_text
    scrollbar-hide
    
    ">
      {/* bg-[url('/photography/faded_flower_extended_sky.png')] */}
      <body className={`
          ${jost} 
          ${poppins} 
          ${playfair.variable} 
          ${inter.variable} 
          bg-background 
          dark:bg-dark_nav_background
          text-text  
          dark:text-dark_text
          font-jost
        `}>
        <div>
          <Navbar></Navbar>
        </div>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
