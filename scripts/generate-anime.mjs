#!/usr/bin/env node
/**
 * Generates a wide-format (cinematic 16:9) anime illustration of Joaquin at
 * his workstation, using Gemini 3 Pro Image Preview. Uses two reference
 * images: his face photo + his EDC tray.
 *
 * Usage:
 *   export GEMINI_API_KEY=$(security find-generic-password -s "gemini-api-key" -w)
 *   node scripts/generate-anime.mjs
 *
 * Output: public/joaquin-anime.png
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error(
    "ERROR: set GEMINI_API_KEY (or GOOGLE_API_KEY). Tip: export GEMINI_API_KEY=$(security find-generic-password -s gemini-api-key -w)",
  );
  process.exit(1);
}

const MODEL = process.env.GEMINI_MODEL || "gemini-3-pro-image-preview";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// Prefer downscaled copies if present — saves ~10x on upload + upstream time.
const FACE_PATH = fs.existsSync("/tmp/face-small.jpg")
  ? "/tmp/face-small.jpg"
  : path.resolve("public/joaquin-side.jpg");
const EDC_PATH = fs.existsSync("/tmp/edc-small.jpg")
  ? "/tmp/edc-small.jpg"
  : path.resolve("public/edc.jpg");
const TATTOO_PATH = fs.existsSync("/tmp/tatto-small.jpg")
  ? "/tmp/tatto-small.jpg"
  : path.resolve("public/tatto.jpg");
const OUT_PATH = path.resolve("public/joaquin-anime.png");

for (const p of [FACE_PATH, EDC_PATH, TATTOO_PATH]) {
  if (!fs.existsSync(p)) {
    console.error(`ERROR: reference not found: ${p}`);
    process.exit(1);
  }
}

const faceB64 = fs.readFileSync(FACE_PATH).toString("base64");
const edcB64 = fs.readFileSync(EDC_PATH).toString("base64");
const tattooB64 = fs.readFileSync(TATTOO_PATH).toString("base64");

const PROMPT = `
Wide cinematic 16:9 anime illustration, 2K sharpness, modern
semi-realistic anime style (Ghost in the Shell: SAC / Psycho-Pass /
Cowboy Bebop — mature, grounded, detailed line art, cel-shaded). NOT
chibi, NOT Solo Leveling, NOT mystical fantasy. No glowing particles,
no rune effects, no cyberpunk neon city.

COMPOSITION — ZOOMED OUT WIDE:
Pull the camera way back so the viewer can see the ENTIRE desk, the
chair, the man, the floor beneath the desk, the wall behind, and a
LARGE bright home-office window on the right side of the frame. The
man and desk together should occupy roughly the left 55% of the frame;
the window and wall occupy the right 45%. We can see him from head to
hips, hands on keyboard, the whole desk surface with all items, the
chair back, a strip of floor. Think: establishing shot of a home
office, not a close-up portrait.

SUBJECT (reference image #1 is the face):
A 45-year-old fit Latino man with a **LIGHT OLIVE skin tone** — a
warm golden-tan complexion, neither pale nor dark, a Mediterranean /
Caribbean olive. Use this skin tone consistently on face, neck, hands,
and any exposed forearm. Three-quarter side view from the back-right —
we see his profile and over his shoulder into the monitors. Preserve
the bald head, salt-and-pepper short beard, nose bridge, jaw
silhouette. Age subtly for 45: crow's feet at the eye, a few forehead
lines, mature skin tone. Fit and lean: broad shoulders, defined
forearms, good posture. He is ACTIVELY TYPING — both hands on a
mechanical keyboard, fingers mid-motion, eyes on the center monitor,
focused, calm.

GLASSES (important): **Montblanc MB0089OK** — thin titanium/metal
rectangular frames, slightly slim modern aviator, dark gunmetal or
matte black, clear (non-tinted) lenses. Understated luxury. Visible
clearly on his face in profile.

WARDROBE: dark navy or charcoal fitted button-up shirt, **sleeves
rolled up to just below the elbow on BOTH arms** so the forearms are
fully visible. Top button open.

TATTOO (reference image #3 is the actual tattoo — render it on his
**RIGHT forearm ONLY** — the arm on his body's right side; his
dominant / writing hand side. This is critical: the LEFT forearm,
left hand, and left wrist must be completely CLEAN with NO tattoo,
NO ink, NO markings of any kind — just bare olive skin. Only the
right forearm has the sleeve.):
- Japanese Irezumi-style **koi fish** sleeve in **black-and-grey
  ink**, flowing up the RIGHT forearm from the wrist toward the
  elbow.
- At the RIGHT wrist: a **thick solid black rectangular band/cuff**
  with bold geometric cut-outs (matching reference image #3).
- Above the cuff: the koi fish body with clearly rendered scales
  (visible diamond-pattern scale work), fins, and tail curving up
  the right forearm.
- Ink style: grey shading with bold black linework. NOT color koi,
  black-and-grey only. Match the reference.
- The tattoo should be crisp and clearly readable. Scale it so both
  the wristband AND the koi are visible on the right forearm.
- IMPORTANT: LEFT forearm is 100% clean — no tattoo on the left side.

HOME OFFICE WINDOW (right side of frame — peaceful NIGHT scene):
A large rectangular home-office window with thin black mullions. The
view outside is a **calm summer night**:
- Deep navy / indigo sky with soft clouds and a scattering of stars
- A gentle warm moon glowing low in the sky, giving the yard soft
  blue-silver light
- The lush backyard: dark silhouettes of mature trees swaying slightly,
  a wooden privacy fence catching a hint of moonlight, a patio with a
  string of warm Edison bulbs (Edison string lights / fairy lights)
  glowing soft amber across the yard
- Maybe 1-2 low landscape uplights washing a tree trunk warmly
- Overall mood: beautiful, relaxing, peaceful night. Premium backyard
  lighting, NOT a pitch-black night, NOT a stormy night, NOT a
  cyberpunk city — this is a tranquil summer evening at home

Inside the room the ambient light should match: warm desk glow and
monitor spill become more prominent now that the daylight is gone.
Keep the office itself cozy and inviting — not dark and moody.

DESK (full length visible edge-to-edge):
A clean black or dark walnut wide desk. NO desk lamp. From LEFT to
RIGHT across the desk surface:
- A leather-wrapped **mate gourd** with a silver bombilla straw
  (small South American yerba mate cup), steam rising gently.
- An open walnut EDC organizer tray with: a silver Casio F-91W
  watch, a black Casio G-Shock DW-5600 PROTECTION watch, a green-G10
  folding pocket knife in its slot, a white AirPods Pro case, an
  Apple TV Siri Remote, two clear-barrel Burberry pens side by side.
- Center: a mechanical keyboard (he is TYPING on it, both hands on
  keys), a precision mouse to its right.
- His iPhone (black case) face-down beside the keyboard.
- Right: a **Leuchtturm1917 A5 hardcover notebook in NAVY BLUE** —
  lying flat OR stood slightly upright — NOT an iPad. Details:
  matte navy-blue hardcover, square-edged corners, rounded spine, a
  thin **elastic band closure** across the front cover, a small
  horizontal label area on the front, a thin **red/orange ribbon
  bookmark** peeking out from between the pages. Roughly A5 size.
  Classic bullet-journal look. Do NOT show a tablet, iPad, or any
  screen here.
- **NO coffee mug, NO Ember mug, NO tablet, NO iPad** — do not
  render any drinking mug or any tablet/iPad anywhere on the desk.
  The only beverage is the mate gourd. The only paper/device is
  the navy Leuchtturm1917 bullet journal.

MONITORS (behind the keyboard) — EXACTLY TWO MONITORS, not three:
A clean **dual-monitor** setup on slim black stands, side by side,
matching size.
- LEFT monitor shows a detailed **Proxmox VE dashboard**: the
  distinctive **orange Proxmox cube logo** top-left, sidebar tree
  with VM entries like "Datacenter > pve-east-01 > 101 (vm)", tabs
  across the top (Summary, Console, Hardware...), CPU/memory line
  graphs in the main pane. Dark gray PVE interface.
- RIGHT monitor shows the **Merck corporate website** — a modern
  pharma corporate page with the **Merck green "M" wordmark logo**
  at the top-left (Merck's logo is a bold uppercase "MERCK" in a
  specific green/teal color #00857c, often with a simple geometric
  mark). Clean white corporate layout, hero image of a modern lab,
  headline text, navigation bar. Professional, recognizable as
  Merck & Co.
- Do NOT include a third monitor, network topology, or terminal
  screen.

ROOM:
Clean modern home office. Light wood floor, neutral warm-gray or
off-white walls, a small indoor plant in the corner. Ergonomic
office chair (black, mesh back). Soft ambient daylight from the
window on the right. **NO desk lamp anywhere in the scene** — all
light comes from the window daylight and the ambient overhead.

WALL ART (single frame, centered on the wall behind/between the
monitors):
Exactly ONE large framed poster showing the cover of David Goggins'
book **"Can't Hurt Me: Master Your Mind and Defy the Odds"** —
iconic black background, a photograph portrait of David Goggins
(muscular Black man, bald, intense serious expression, chest up)
centered on the cover, with the title "CAN'T HURT ME" in bold
yellow/gold uppercase caps spanning the top, and the subtitle
"MASTER YOUR MIND AND DEFY THE ODDS" below the title in smaller
white/gold text. Thin black frame, hung on the wall at eye level.
This replaces ALL other wall decor — no other frames, no other
prints on the walls.

STYLE / QUALITY:
- Clean modern anime line art, subtle cel-shaded color, refined
  palette. Razor-sharp focus across the entire image — no DoF blur
  on the subject, the desk, or the window.
- Cinematic color grading: cool office ambient + warm daylight + warm
  desk lamp.
- Aspect ratio 16:9, 2048x1152 or higher.
- Composition leaves natural headroom at top and floor at bottom so
  the hero reads as an establishing shot. Ensure the viewer can
  clearly see ALL desk items, the keyboard his hands are on, the
  monitor content, his glasses and face in profile, and the window
  view simultaneously.
`.trim();

const body = {
  contents: [
    {
      parts: [
        { text: PROMPT },
        { text: "Reference #1: face geometry to preserve." },
        { inlineData: { mimeType: "image/jpeg", data: faceB64 } },
        { text: "Reference #2: actual EDC items to include on the desk." },
        { inlineData: { mimeType: "image/jpeg", data: edcB64 } },
        {
          text: "Reference #3: the subject's actual right-forearm tattoo — a Japanese black-and-grey koi fish sleeve with a thick solid black rectangular wristband. Render this exact tattoo on his right forearm.",
        },
        { inlineData: { mimeType: "image/jpeg", data: tattooB64 } },
      ],
    },
  ],
  generationConfig: {
    responseModalities: ["IMAGE"],
  },
};

console.log(`→ Generating cinematic workstation portrait via ${MODEL} ...`);

const payloadPath = path.join(os.tmpdir(), `gemini-payload-${Date.now()}.json`);
fs.writeFileSync(payloadPath, JSON.stringify(body));

function callApi() {
  const result = spawnSync(
    "curl",
    [
      "-sS",
      "--max-time",
      "900",
      "-H",
      "Content-Type: application/json",
      "-X",
      "POST",
      ENDPOINT,
      "--data-binary",
      `@${payloadPath}`,
    ],
    {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );

  if (result.status !== 0) {
    return { err: `curl exit ${result.status}: ${result.stderr}` };
  }
  try {
    return { data: JSON.parse(result.stdout) };
  } catch {
    return { err: `Bad JSON: ${result.stdout.slice(0, 400)}` };
  }
}

// Retry on 503 (model overloaded) and 429 (rate limit) with exponential backoff.
let data;
const MAX_ATTEMPTS = 5;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const { data: d, err } = callApi();
  if (err) {
    console.error(err);
    process.exit(1);
  }
  if (d?.error) {
    const code = d.error.code;
    const retryable = code === 503 || code === 429 || code === 500;
    if (retryable && attempt < MAX_ATTEMPTS) {
      const wait = Math.min(60, 2 ** attempt * 4);
      console.log(
        `  API ${code} (${d.error.status}) — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${wait}s`,
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
  console.error("No image returned. Full response:");
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

const b64 = imgPart.inline_data?.data ?? imgPart.inlineData?.data;
fs.writeFileSync(OUT_PATH, Buffer.from(b64, "base64"));
console.log(`✓ Wrote ${OUT_PATH}`);

const ENV_PATH = path.resolve(".env.local");
const envLine = "NEXT_PUBLIC_HERO_IS_ANIME=true";
let existing = "";
if (fs.existsSync(ENV_PATH)) existing = fs.readFileSync(ENV_PATH, "utf8");
if (!existing.includes("NEXT_PUBLIC_HERO_IS_ANIME=")) {
  fs.writeFileSync(
    ENV_PATH,
    (existing ? existing.replace(/\s*$/, "\n") : "") + envLine + "\n",
  );
} else {
  fs.writeFileSync(
    ENV_PATH,
    existing.replace(/NEXT_PUBLIC_HERO_IS_ANIME=.*/g, envLine),
  );
}
console.log(`✓ Flipped ${ENV_PATH}: ${envLine}`);
