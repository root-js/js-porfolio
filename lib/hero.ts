// Toggles automatically when scripts/generate-anime.mjs writes the PNG
// and sets NEXT_PUBLIC_HERO_IS_ANIME=true in .env.local.
export const HERO_IS_ANIME =
  process.env.NEXT_PUBLIC_HERO_IS_ANIME === "true";

// Filename-based cache busting — bump this suffix whenever the hero
// PNG changes so browsers refetch. Next.js 16 rejects query strings
// in next/image unless images.localPatterns is configured, so we
// version via filename instead.
export const HERO_IMAGE = HERO_IS_ANIME
  ? "/joaquin-anime-v2.png"
  : "/joaquin-side.jpg";
