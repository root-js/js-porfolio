// Toggles automatically when scripts/generate-anime.mjs writes the PNG
// and sets NEXT_PUBLIC_HERO_IS_ANIME=true in .env.local.
export const HERO_IS_ANIME =
  process.env.NEXT_PUBLIC_HERO_IS_ANIME === "true";

export const HERO_IMAGE = HERO_IS_ANIME
  ? "/joaquin-anime.png"
  : "/joaquin-side.jpg";
