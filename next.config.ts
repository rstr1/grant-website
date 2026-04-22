import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Allow fetching album covers from the MusicBrainz Cover Art Archive.
    // Their server 307-redirects to archive.org, so we allow both hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coverartarchive.org",
      },
      {
        protocol: "https",
        hostname: "archive.org",
      },
      {
        protocol: "https",
        hostname: "ia800000.us.archive.org", // the range of ia<N>00 mirrors
      },
      {
        protocol: "https",
        hostname: "**.archive.org",
      },
    ],
  },
};

export default nextConfig;
