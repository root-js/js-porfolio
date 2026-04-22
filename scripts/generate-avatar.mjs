#!/usr/bin/env node
/**
 * Edits Joaquin's real professional headshot: keeps the photorealistic
 * look, but removes the hair (bald like the site's hero) and adds
 * Montblanc MB0089OK style glasses. Preserves the rest: face, beard,
 * shirt, blazer, smile, background.
 *
 * Usage:
 *   export GEMINI_API_KEY=$(security find-generic-password -s gemini-api-key -w)
 *   node scripts/generate-avatar.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error(
    "ERROR: set GEMINI_API_KEY. Try: export GEMINI_API_KEY=$(security find-generic-password -s gemini-api-key -w)",
  );
  process.exit(1);
}

const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-image-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SRC_PATH = fs.existsSync("/tmp/avatar-small.jpg")
  ? "/tmp/avatar-small.jpg"
  : path.resolve("public/joaquin-avatar-real.jpg");
const OUT_PATH = path.resolve("public/joaquin-avatar.png");

const srcB64 = fs.readFileSync(SRC_PATH).toString("base64");

const PROMPT = `
Redraw this headshot as a clean **modern anime portrait illustration**
— semi-realistic anime, cel-shaded, refined line art, Ghost in the
Shell / Psycho-Pass / Cowboy Bebop stylistic family. It must match
the character already shown in the main site hero image at this
workstation. NOT a photo edit, NOT a filter — a genuine anime redraw.

SUBJECT is the SAME anime character from the site's main hero image:
a 45-year-old fit Latino man with warm **light-olive skin**, a
**salt-and-pepper short beard**, a bald head, strong jaw, confident
subtle smile, mature but athletic.

CRITICAL POSE CHANGE — this is the difference from prior attempts:
- **STRICTLY FRONT-FACING**. Head and shoulders directly facing the
  camera, eyes looking into the lens. NOT three-quarter, NOT in
  profile. Symmetrical composition.
- Both eyes fully visible behind the glasses.
- Shoulders squared to the camera.

BEARD — make sure it IS rendered:
- Short, neatly groomed salt-and-pepper beard covering the jawline
  and upper lip (mustache connected to the beard).
- NOT clean-shaven. NOT just stubble. A visible, intentional beard
  exactly like the main hero character's.

GLASSES: **Montblanc MB0089OK in tortoiseshell** — warm amber/caramel
acetate brow bar with dark-brown mottling and honey-gold speckles,
thin metal lower rim (gunmetal/bronze), clear non-tinted lenses.
Symmetric on his nose since he is directly front-facing.

HEAD PROPORTIONS: proper anime stylization — naturally sized head,
NOT a photo-proportioned head on an anime body. Clean anime crown
highlight on the bald scalp.

WARDROBE: navy blazer over a light blue dress shirt, top button
open. Shoulders visible.

COMPOSITION / CROP:
- Tight head-and-shoulders portrait.
- Centered, symmetrical so the image works inside a circular crop.
- Soft warm-grey studio background with a subtle vignette.
- Leave clean negative space at the corners of the square so the
  circular mask doesn't clip the head or shoulders.

STYLE TARGET: identical aesthetic to the main hero illustration
that shows this same character typing at a home-office workstation
at night. Anime line art, cel-shaded, refined color blocks.

Do NOT output a photo. Do NOT add text, logos, or watermarks.
`.trim();

const body = {
  contents: [
    {
      parts: [
        { text: PROMPT },
        { inlineData: { mimeType: "image/jpeg", data: srcB64 } },
      ],
    },
  ],
  generationConfig: { responseModalities: ["IMAGE"] },
};

console.log(`→ Editing avatar via ${MODEL} ...`);

const payloadPath = path.join(os.tmpdir(), `avatar-payload-${Date.now()}.json`);
fs.writeFileSync(payloadPath, JSON.stringify(body));

function callApi() {
  const r = spawnSync(
    "curl",
    [
      "-sS",
      "--max-time",
      "600",
      "-H",
      "Content-Type: application/json",
      "-X",
      "POST",
      ENDPOINT,
      "--data-binary",
      `@${payloadPath}`,
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (r.status !== 0) return { err: `curl exit ${r.status}: ${r.stderr}` };
  try {
    return { data: JSON.parse(r.stdout) };
  } catch {
    return { err: `Bad JSON: ${r.stdout.slice(0, 400)}` };
  }
}

let data;
for (let attempt = 1; attempt <= 5; attempt++) {
  const { data: d, err } = callApi();
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (d?.error) {
    const retryable =
      d.error.code === 503 || d.error.code === 429 || d.error.code === 500;
    if (retryable && attempt < 5) {
      const wait = Math.min(60, 2 ** attempt * 4);
      console.log(
        `  API ${d.error.code} (${d.error.status}) — retry ${attempt}/4 in ${wait}s`,
      );
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    console.error(`API error: ${JSON.stringify(d.error)}`);
    process.exit(1);
  }
  data = d;
  break;
}

try {
  fs.unlinkSync(payloadPath);
} catch {
  /* ignore */
}

const parts = data?.candidates?.[0]?.content?.parts ?? [];
const imgPart = parts.find((p) => p.inline_data?.data || p.inlineData?.data);
if (!imgPart) {
  console.error("No image returned. Response sample:");
  console.error(JSON.stringify(data).slice(0, 400));
  process.exit(1);
}
const b64 = imgPart.inline_data?.data ?? imgPart.inlineData?.data;
fs.writeFileSync(OUT_PATH, Buffer.from(b64, "base64"));
console.log(`✓ Wrote ${OUT_PATH}`);
