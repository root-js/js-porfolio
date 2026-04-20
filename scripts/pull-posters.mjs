#!/usr/bin/env node
/**
 * Pulls poster artwork for the Plex library.
 *
 * Flow:
 *   1. For each PlexItem in lib/content.ts (via the exported rawPlexLibrary):
 *      - If TRAKT_CLIENT_ID is set, ask Trakt to resolve the title → TMDB id
 *      - Otherwise, search TMDB directly
 *      - Read TMDB `poster_path` → download the 500px JPG to public/posters/<id>.jpg
 *   2. Write lib/plex-posters.json as { [id]: "/posters/<id>.jpg", ... }
 *
 * Keys (either env vars or macOS keychain items):
 *   TMDB_API_KEY         (required)  — free at https://www.themoviedb.org/settings/api
 *   TRAKT_CLIENT_ID      (optional)  — https://trakt.tv/oauth/applications
 *
 * Keychain fallbacks:
 *   security find-generic-password -s "tmdb-api-key" -w
 *   security find-generic-password -s "trakt-client-id" -w
 *
 * Usage:
 *   export TMDB_API_KEY=$(security find-generic-password -s "tmdb-api-key" -w)
 *   # optional:
 *   export TRAKT_CLIENT_ID=$(security find-generic-password -s "trakt-client-id" -w)
 *   node scripts/pull-posters.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function fromKeychain(service) {
  const r = spawnSync(
    "security",
    ["find-generic-password", "-s", service, "-w"],
    { encoding: "utf8" },
  );
  if (r.status === 0) return r.stdout.trim();
  return null;
}

const TMDB_API_KEY =
  process.env.TMDB_API_KEY || fromKeychain("tmdb-api-key");
const TRAKT_CLIENT_ID =
  process.env.TRAKT_CLIENT_ID || fromKeychain("trakt-client-id");

if (!TMDB_API_KEY) {
  console.error(
    "ERROR: TMDB_API_KEY missing. Get a key at https://www.themoviedb.org/settings/api",
  );
  console.error(
    "Then: security add-generic-password -s tmdb-api-key -a $USER -w <KEY>",
  );
  process.exit(1);
}

console.log(
  `→ Pulling posters ${TRAKT_CLIENT_ID ? "(Trakt → TMDB)" : "(TMDB direct)"}`,
);

// Hand-parse rawPlexLibrary from content.ts. Small and robust enough here:
// we evaluate the file in a sandboxed regex pull of every {id,title,kind,year}.
const contentSrc = fs.readFileSync("lib/content.ts", "utf8");
const items = [];
const itemRe =
  /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*kind:\s*"(show|movie|anime|podcast)",\s*year:\s*"(\d{4})"/g;
let m;
while ((m = itemRe.exec(contentSrc))) {
  items.push({ id: m[1], title: m[2], kind: m[3], year: m[4] });
}
console.log(`  found ${items.length} items in the library`);

const OUT_DIR = path.resolve("public/posters");
fs.mkdirSync(OUT_DIR, { recursive: true });

const TRAKT_HEADERS = {
  "Content-Type": "application/json",
  "trakt-api-version": "2",
  "trakt-api-key": TRAKT_CLIENT_ID || "",
};

async function traktLookup(title, kind, year) {
  if (!TRAKT_CLIENT_ID) return null;
  const type = kind === "movie" ? "movie" : "show"; // anime/shows both → "show"
  const url = `https://api.trakt.tv/search/${type}?query=${encodeURIComponent(title)}&year=${year}&limit=1&extended=full`;
  const res = await fetch(url, { headers: TRAKT_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = Array.isArray(data) && data.length ? data[0] : null;
  if (!hit) return null;
  const ids = hit[type]?.ids ?? {};
  return {
    tmdbId: ids.tmdb,
    imdbId: ids.imdb,
  };
}

async function tmdbSearchByTitle(title, kind, year) {
  const type =
    kind === "movie" ? "movie" : "tv"; // shows + anime → tv
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    query: title,
    include_adult: "false",
    language: "en-US",
  });
  if (type === "tv") params.append("first_air_date_year", year);
  else params.append("year", year);
  const url = `https://api.themoviedb.org/3/search/${type}?${params}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] ?? null;
}

async function tmdbGetPosterPath(id, kind) {
  const type = kind === "movie" ? "movie" : "tv";
  const url = `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.poster_path ?? null;
}

async function downloadPoster(posterPath, id) {
  const src = `https://image.tmdb.org/t/p/w500${posterPath}`;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`TMDB CDN ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(OUT_DIR, `${id}.jpg`);
  fs.writeFileSync(out, buf);
  return `/posters/${id}.jpg`;
}

const resultMap = {};
let ok = 0;
let skipped = 0;

async function itunesPodcastLookup(title) {
  // Strip author suffixes so "Flagrant — Andrew Schulz" matches its entry.
  const clean = title.replace(/\s[—·-].+$/, "").trim();
  const url = `https://itunes.apple.com/search?media=podcast&limit=1&term=${encodeURIComponent(clean)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.results?.[0]?.artworkUrl600 ?? null;
}

async function downloadUrlTo(id, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CDN ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Upgrade iTunes' 600px URL to 1200px when pattern matches — sharper tiles.
  const out = path.join(OUT_DIR, `${id}.jpg`);
  fs.writeFileSync(out, buf);
  return `/posters/${id}.jpg`;
}

for (const it of items) {
  try {
    // ============ Podcasts: iTunes Search API (free, no auth) ============
    if (it.kind === "podcast") {
      let art = await itunesPodcastLookup(it.title);
      if (!art) {
        console.log(`  ✗ ${it.title} — no iTunes match`);
        skipped += 1;
        continue;
      }
      // Nudge to 1200px when iTunes served 600px.
      art = art.replace("/600x600", "/1200x1200");
      const local = await downloadUrlTo(it.id, art);
      resultMap[it.id] = local;
      ok += 1;
      console.log(`  ✓ ${it.title} → ${local}`);
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }

    // ============ Everything else: Trakt (optional) → TMDB ============
    let posterPath = null;

    if (TRAKT_CLIENT_ID) {
      const t = await traktLookup(it.title, it.kind, it.year);
      if (t?.tmdbId) {
        posterPath = await tmdbGetPosterPath(t.tmdbId, it.kind);
      }
    }

    if (!posterPath) {
      const tmdb = await tmdbSearchByTitle(it.title, it.kind, it.year);
      if (tmdb?.poster_path) posterPath = tmdb.poster_path;
      else if (tmdb?.id) posterPath = await tmdbGetPosterPath(tmdb.id, it.kind);
    }

    if (!posterPath) {
      console.log(`  ✗ ${it.title} — no TMDB match`);
      skipped += 1;
      continue;
    }

    const local = await downloadPoster(posterPath, it.id);
    resultMap[it.id] = local;
    ok += 1;
    console.log(`  ✓ ${it.title} → ${local}`);
    await new Promise((r) => setTimeout(r, 250));
  } catch (err) {
    console.log(`  ✗ ${it.title} — ${err.message}`);
    skipped += 1;
  }
}

fs.writeFileSync(
  "lib/plex-posters.json",
  JSON.stringify(resultMap, null, 2) + "\n",
);

console.log(`\n✓ ${ok} posters downloaded, ${skipped} skipped.`);
console.log(
  "Reload http://localhost:3000/hypervisor and click the Plex VM to see them.",
);
