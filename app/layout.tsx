import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Navbar from "./navbar";

import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["400", "700"] });

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
    <html lang="en" className="overflow-auto bg-background dark:bg-dark_background  text-text  dark:text-dark_text  scrollbar-hide">
      <head>
        {/* <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap" rel="stylesheet"/> */}
      </head>
      <body className={`${jost.className} bg-background dark:bg-dark_background text-text  dark:text-dark_text`}>

        <div>
          <Navbar></Navbar>
        </div>
        <div className="min-h-screen p-20">
          {children}
        </div>
      </body>
    </html>
  );
}
