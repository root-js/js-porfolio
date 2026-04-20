import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only "N" Next.js badge that overlaps the hero.
  devIndicators: false,
  images: {
    // Shorter cache in dev so a regenerated hero picks up without a full rebuild.
    minimumCacheTTL: 60,
    remotePatterns: [
      // GitHub contribution SVG service
      { protocol: "https", hostname: "ghchart.rshah.org" },
      // github-readme-stats (stats card, top languages, streak)
      { protocol: "https", hostname: "github-readme-stats.vercel.app" },
      { protocol: "https", hostname: "streak-stats.demolab.com" },
      // Real TMDB posters (user can populate later)
      { protocol: "https", hostname: "image.tmdb.org" },
      // Open Library covers (used by the Books VM)
      { protocol: "https", hostname: "covers.openlibrary.org" },
      // GitHub profile avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
};

export default nextConfig;
