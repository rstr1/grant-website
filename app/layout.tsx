import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import Navbar from "./navbar";
// import Trail from "./trail";


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
    <html lang="en" className="overflow-hidden">
      <body className="">

        <div className="">
          {/* <Trail /> */}
        </div>

        <div className="">
          <Navbar></Navbar>
        </div>
        

        <div className="">{children}</div>
      </body>
    </html>
  );
}
