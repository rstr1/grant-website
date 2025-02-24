import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne_Mono, Jost } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syneMono = Syne_Mono({
  variable: "--font-syne-mono",
  subsets: ["latin"],
  weight: "400"
});

const jostFont = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

// const libreBaskerville = Libre_Baskerville({
//   variable: "--font-libre-baskerville",
//   subsets: ["latin"],
//   weight: "400"
// });

// const montserratAlternates = Montserrat_Alternates({
//   variable: "--font-montserrat",
//   subsets: ["latin"],
//   weight: "400"
// });


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
      {/* edit the className below for any whole webpage formatting requirements */}
      <body className="">{children}</body>
    </html>
  );
}
