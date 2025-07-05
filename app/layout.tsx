import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Navbar from "./navbar";

// import { Jost } from "next/font/google";

// const jost = Jost({})

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
    <html lang="en" className="overflow-auto bg-background scrollbar-hide">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap" rel="stylesheet"/>
      </head>
      <body className="">

        <div className="">
          <Navbar></Navbar>
        </div>
        

        <div className="">{children}</div>
      </body>
    </html>
  );
}
