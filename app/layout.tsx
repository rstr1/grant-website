import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Navbar from "./navbar";


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
    <html lang="en" className="overflow-auto bg-background">
      <body className="">

        <div className="">
          <Navbar></Navbar>
        </div>
        

        <div className="">{children}</div>
      </body>
    </html>
  );
}
