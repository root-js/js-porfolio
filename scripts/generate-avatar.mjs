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
(NOT a photo edit, NOT a stylized filter on the photo — a genuine anime
illustration in the same style as a Ghost in the Shell / Cowboy Bebop /
Psycho-Pass character portrait). Semi-realistic anime, cel-shaded,
mature proportions, refined line art.

The subject is Joaquin Sanchez, 45, fit. Preserve his core likeness —
face shape, nose, jaw, salt-and-pepper beard, warm light-olive skin
tone, friendly confident expression (subtle smile), posture — but use
PROPER ANIME HEAD PROPORTIONS (the head/face should feel naturally
sized, stylized, NOT oversized or photo-proportions on an anime body).
Redraw him; do not just trace or re-lit the reference.

CHANGES / DETAILS:
1. Bald scalp — smooth shaved head, stylized anime highlight on the
   crown, no hairline, no stubble on the head. Warm olive skin
   continuity from face to scalp.
2. Glasses: **Montblanc MB0089OK in TORTOISESHELL** — the actual
   colorway. These are thin-to-medium metal-and-acetate aviator-style
   rectangular frames where the brow bar and upper rim are a warm
   **tortoiseshell acetate** (amber/caramel/dark-brown mottled pattern
   with honey-gold speckles) and the lower rim is a very thin metal
   (gunmetal/bronze). Clear non-tinted lenses with a subtle
   highlight. Sitting naturally on the bridge of his nose. This is
   the HERO detail of the portrait — render the tortoiseshell pattern
   clearly.
3. Wardrobe — same navy blazer over a light blue dress shirt, top
   button open. Shoulders/upper chest visible.

COMPOSITION:
- Tight head-and-shoulders portrait, three-quarter front-facing.
- Soft neutral warm-grey studio background with a gentle vignette.
- Centered, circular crop friendly. Leave clean negative space at
  the top/sides so the image works inside a circular frame mask.

QUALITY:
- Sharp, clean anime line art + cel-shaded color blocks + subtle
  gradient highlights.
- Do not output a photo. Output an ANIME ILLUSTRATION of him.
- No text, no logos, no watermarks.
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
