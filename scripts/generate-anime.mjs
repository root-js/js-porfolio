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
const MATE_PATH = fs.existsSync("/tmp/mate-small.jpg")
  ? "/tmp/mate-small.jpg"
  : path.resolve("public/mate.jpg");
const MERCK_PATH = fs.existsSync("/tmp/merck-small.png")
  ? "/tmp/merck-small.png"
  : path.resolve("public/merck-logo.png");
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
const mateB64 = fs.readFileSync(MATE_PATH).toString("base64");
const merckB64 = fs.readFileSync(MERCK_PATH).toString("base64");

const PROMPT = `
Wide cinematic 16:9 anime illustration, 2K sharpness, modern
semi-realistic anime style (Ghost in the Shell: SAC / Psycho-Pass /
Cowboy Bebop — mature, grounded, detailed line art, cel-shaded). NOT
chibi, NOT Solo Leveling, NOT mystical fantasy. No glowing particles,
no rune effects, no cyberpunk neon city.

COMPOSITION — ZOOMED OUT WIDE:
Pull the camera way back so the viewer can see the ENTIRE desk, the
chair, the man, the floor beneath the desk, and the wall behind.

**CHARACTER PLACEMENT — CRITICAL:**
- The **man is seated on the RIGHT side of the frame**, occupying
  roughly the right 35-40% of the width, facing **LEFT** toward the
  monitors. We see him from the back-right three-quarter angle —
  over his right shoulder into the monitors.
- The **two monitors are in the CENTER / CENTER-LEFT** of the frame.
- The **home-office window with the night-time backyard view is on
  the FAR RIGHT**, behind / to the right of the man (visible over
  his right shoulder / above his chair back, not blocked by the
  monitors).
- **Do NOT place the man on the left side of the frame.** The
  character always sits on the right, facing left at the monitors.

We see him from head to hips, hands on keyboard, the whole desk
surface with all items, the chair back, a strip of floor.

SUBJECT (reference image #1 is the face):
A 45-year-old fit Latino man with a **MEDIUM OLIVE skin tone** —
warm golden-tan complexion, a touch darker than light olive
(noticeably sun-kissed but not dark), Caribbean / Mediterranean
olive with a warm undertone. Use this skin tone consistently on
face, neck, hands, and any exposed forearm. Three-quarter side view from the back-right —
we see his profile and over his shoulder into the monitors. Preserve
the bald head, salt-and-pepper short beard, nose bridge, jaw
silhouette. Age subtly for 45: crow's feet at the eye, a few forehead
lines, mature skin tone. Fit and lean: broad shoulders, defined
forearms, good posture. He is ACTIVELY TYPING — both hands on a
mechanical keyboard, fingers mid-motion, eyes on the center monitor,
focused, calm.

**WRIST — LEFT wrist wears a WHITE Garmin Forerunner 965.** On his
**LEFT wrist only** (the arm WITHOUT the koi tattoo) render a
**Garmin Forerunner 965 in the white colorway**: white silicone
band on both sides, titanium bezel, round AMOLED screen face-up
(a simple running data face or clean dark watch face visible),
worn snug at the wrist. Clearly recognizable as a Garmin Forerunner
965. The **RIGHT wrist stays BARE** — no watch, no band, only the
solid black rectangular tattoo cuff from reference #3.

GLASSES (CRITICAL — must match the avatar portrait):
**Montblanc MB0089OK in TORTOISESHELL** — warm amber/caramel
acetate brow bar with dark-brown mottling and honey-gold speckles.
Thin metal lower rim (gunmetal/bronze). Clear non-tinted lenses.
**NOT plain black, NOT gunmetal, NOT clear frames** — the hero
detail is the tortoiseshell pattern on the brow bar. Render it
clearly and identically to the tortoise frames on the avatar
portrait already live on the About VM.

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
A clean dark walnut wide desk. NO desk lamp. NO coffee/Ember mug.
NO iPad, NO tablet, NO Burberry pens. Items, LEFT to RIGHT:

1. **Mate gourd** (left side of the desk) — this is Joaquin's actual
   gourd (reference #4): burgundy-purple leather-wrapped rounded
   body, polished stainless-steel rim at the top, silver bombilla
   (metal straw) curving up, a faint handwritten "Joaquin" signature
   etched/burned into the leather on the front, three small leather
   feet at the base. A thin wisp of steam rising. Do NOT draw a
   generic cup.

2. **Navy Leuchtturm1917 A5 bullet journal** — matte navy-blue
   hardcover, square corners, rounded spine, elastic-band closure
   across the front, a small horizontal label area, a red/orange
   ribbon bookmark peeking from the pages. Lying closed on the desk
   to the left of the keyboard, near the mate gourd.

3. **Mechanical keyboard** center, both of his hands actively TYPING
   on it, precision black mouse to the right.

4. **Merck employee ID badge — EXACTLY ONE, lying flat on the
   desk** between the keyboard and the Pixel phone, partly in the
   light. **Do NOT render a second badge, do NOT render the same
   badge duplicated or mirrored, do NOT render a badge hanging
   from a lanyard around his neck.** Only one badge in the entire
   scene, sitting flat on the desk surface. Credit-card-sized
   vertical orientation, matte-white plastic:
   - Top: the **MERCK wordmark** in the specific green/teal
     (#00857C) exactly as reference #5 shows it
   - Below the logo: a small square anime portrait of the SAME
     character (bald head, short salt-and-pepper beard, tortoiseshell
     Montblanc glasses, navy blazer on a light-blue shirt, front-
     facing, confident subtle smile) — tiny, badge-photo scale
   - Below the photo: "JOAQUIN SANCHEZ" in small bold black caps and
     "Virtualization & Cloud Architect" on a second line
   - A thin black lanyard clip at the top of the badge
   Position the badge visibly but not center-stage — accent detail.

5. **Pixel 9 Pro** (NOT an iPhone) face-up beside the keyboard:
   - Obsidian-black Pixel 9 Pro with its signature **horizontal
     camera bar** running across the back (three lenses + flash in a
     metallic raised bar). If face-up, show the screen dark; if face-
     down, show the distinctive camera bar. Clearly a Pixel, NOT an
     iPhone. Google's "G" logo faint on the back.

6. **Walnut EDC organizer tray** — **NOT on the main desk.** The
   tray sits on a **small secondary side table** (a narrow accent
   table / low end-table) placed to the **RIGHT of the main desk**,
   next to the man's chair at roughly chair-arm height. The side
   table is a separate surface — not the same wood as the desk,
   slightly lower, small footprint (just wide enough to hold the
   tray). The EDC tray rests flat on that side table, fully
   visible and UNOBSTRUCTED by the man's arm or chair, tilted
   slightly so ALL of its contents are clearly readable from the
   viewer's angle. Every item below MUST be visible.

   Open walnut tray, shallow, black felt lining.

   **NO TABLET, NO iPad, NO secondary screen anywhere in this
   scene.** The side table holds the EDC tray only — nothing
   propped up behind it. The only screens in the scene are the
   TWO monitors above the keyboard — nothing else.

   CRITICAL — NO duplicates. Draw exactly these SIX distinct items,
   ONE of each, arranged neatly side by side:

   a. **Casio F-91W — SILVER metal version**: stainless-steel
      bracelet and silver metal case, small rectangular digital
      face. Looks like the vintage metal F-91W variant.
   b. **Casio F-91W — CLASSIC black plastic version**: black resin
      case AND black resin strap, same small rectangular digital
      face. The iconic $15 plastic watch.
   c. **Casio G-Shock DW-5600 PROTECTION**: black square/octagonal
      face, much larger than the F-91W, red accent on the bezel,
      "G-SHOCK" + "PROTECTION" text.
   d. **Civivi Elementum folding pocket knife** — green G10 scales,
      **FOLDED SHUT / CLOSED** (blade fully hidden inside the
      handle, just a compact green knife body resting flat). NOT
      open, NOT deployed. **ONLY ONE KNIFE. Draw exactly one. Do
      not draw a second or mirror-image knife.**
   e. **White AirPods Pro case** — closed, rounded Apple pebble.
   f. **Nothing Ear earbuds case** — transparent/clear plastic with
      visible internal components, white accents.

   DO NOT render two of any item. DO NOT include Burberry pens.
   DO NOT include the Apple TV Siri Remote. Six items, all unique.

MONITORS (behind the keyboard) — EXACTLY TWO MONITORS, not three:
A clean **dual-monitor** setup on slim black stands, side by side,
matching size. **Both monitors in DARK MODE** — no bright white UIs.

- LEFT monitor: **Proxmox VE 9 · DARK MODE dashboard**. Dark gray
  chrome (#1a1d22), orange accents (#E57000 for the Proxmox cube
  logo top-left). Left sidebar shows the **"Datacenter (Merck
  Environment)"** tree FULLY EXPANDED and prominent, with the
  "Datacenter (Homelab)" tree shown collapsed below it. Render the
  expanded tree like this (each row readable):
    📁 Datacenter (Merck Environment)       ← expanded, highlighted
       └─ 🖥 pve-east-01  (us-east-2)
            ├─ 🟢 101 (jsanchez-about-01)
            ├─ 🟢 102 (azcli-projects-01)
            ├─ 🟢 103 (debian-skills-01)
            ├─ 🟢 104 (fedora-hobbies-01)
            └─ 🟢 105 (manjaro-contact-01)
       └─ 💾 local (pve-east-01)
       └─ 💾 local-zfs (pve-east-01)
       └─ 🖥 pve-west-02  (us-west-2)
       └─ 🖥 pve-eu-03    (eu-north-1)
       └─ 🖥 pve-apac-04  (apac-southeast-1)
    📁 Datacenter (Homelab)                 ← collapsed below

  Main pane on the right of the Proxmox UI shows VM 101 Summary
  with CPU/memory line graphs and a small VM info panel. Tabs
  across the top: Summary, Console, Hardware, Options. Proxmox
  orange Start/Shutdown buttons visible. Make the sidebar text
  legible enough to read the datacenter names.

- RIGHT monitor: **Microsoft Azure Portal · DARK MODE** (black
  #0b0b0e background, Azure blue #0078d4 accents). At the top, the
  Azure logo (cube-like blue chevron) and the search bar "Search
  resources, services, and docs". Left vertical nav with small
  icons for Home, Dashboard, All services, Favorites, Resource
  groups, Virtual machines (highlighted). Main pane is titled
  **"Virtual machines"** and shows a large table with MANY rows of
  VMs (10-15 visible) — columns: Name, Resource group, Location,
  Status, Size, OS. Some rows show "Running" with a green dot,
  others "Stopped" with gray. VM names look like AVD session hosts:
  "avd-sh-e2-01", "avd-sh-e2-02", "avd-sh-w2-01", "avd-img-gold",
  "mgmt-jump-01", etc. Rows alternate subtle dark-gray shading.
  Top shows "+ Create", "Start", "Restart", "Stop", "Delete"
  toolbar buttons in Azure style.

- Do NOT show a terminal, a Merck corporate website, or a third
  monitor. Both monitors are DARK.

ROOM (wall palette picked to complement the subject's light-olive
skin tone + warm undertones):
- Primary walls: **warm greige** — muted taupe-gray with a cream
  undertone (BM "Revere Pewter" territory, roughly #B6AB9A).
  Brightens the olive skin without washing it out.
- **Accent wall directly behind the two monitors**: a **deep inky
  teal** (roughly #134E4A / #1F4D4B). Rich, editorial, frames the
  dark-mode Proxmox + Azure Portal panels and makes the skin pop.
- Light wood floor, small indoor plant in the corner, ergonomic
  black mesh office chair. **NO desk lamp** — lighting comes from
  the window and the ambient interior.

WALL ART (single SMALL frame, centered on the wall behind/between
the monitors — NOT large, roughly 8x10 inches, modest):
Exactly ONE small framed piece showing the cover of **"Atomic
Habits" by James Clear** — the iconic pale turquoise / light-teal
cover (#A8D5D0-ish) with a minimalist white paper airplane design
across the middle, bold black "Atomic Habits" wordmark stacked in
the center, "James Clear" in smaller black type below, subtitle
"An Easy & Proven Way to Build Good Habits & Break Bad Ones". Thin
black frame, hung at eye level. Keep the frame proportionally
small — it should NOT dominate the wall like a poster. Just a
modest accent.

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
        { text: "Reference #2: the ACTUAL EDC items I own — render these on the desk (F-91W, G-Shock, green pocket knife, AirPods, Apple TV remote). Do NOT render the Burberry pens." },
        { inlineData: { mimeType: "image/jpeg", data: edcB64 } },
        {
          text: "Reference #3: the subject's actual right-forearm tattoo — a Japanese black-and-grey koi fish sleeve with a thick solid black rectangular wristband. Render this exact tattoo on his right forearm.",
        },
        { inlineData: { mimeType: "image/jpeg", data: tattooB64 } },
        {
          text: "Reference #4: the ACTUAL mate gourd I drink from — burgundy-purple leather-wrapped body, stainless-steel rim, silver bombilla straw, a handwritten 'Joaquin' signature etched on the front, three small decorative feet at the base. Replace any generic mate cup with this specific one.",
        },
        { inlineData: { mimeType: "image/jpeg", data: mateB64 } },
        {
          text: "Reference #5: the Merck wordmark logo — a specific green/teal color (#00857C). Use this exact logo on the employee badge described below.",
        },
        { inlineData: { mimeType: "image/png", data: merckB64 } },
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
