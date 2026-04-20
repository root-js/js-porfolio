import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the dev-only "N" Next.js badge that overlaps the hero.
  devIndicators: false,
  // If someone lands on a *.vercel.app preview / deployment URL, bounce
  // them to s.com.do so the canonical host is always visible.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "^(?<sub>.+)\\.vercel\\.app$",
          },
        ],
        destination: "https://s.com.do/:path*",
        permanent: true,
      },
    ];
  },
  // Scrub the default "x-powered-by: Next.js" header.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Generic server label so the fingerprint doesn't scream Vercel.
          { key: "x-server", value: "s.com.do" },
          // Small security / privacy hygiene add-ons at no extra cost.
          { key: "x-content-type-options", value: "nosniff" },
          { key: "referrer-policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
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
