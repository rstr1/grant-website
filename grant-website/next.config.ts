import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: "/grant-website", // this could need to be rstr1.github.io
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
