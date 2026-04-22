#!/usr/bin/env node
/**
 * Gemini image-to-image edit: takes the existing hero and regenerates it
 * with the Pixel 9 Pro flipped face-up (screen visible) with Microsoft
 * Outlook Mobile rendered on the phone's screen. Everything else in the
 * scene is preserved identically.
 *
 * Usage:
 *   export GEMINI_API_KEY=$(security find-generic-password -s "gemini-api-key" -w)
 *   node scripts/flip-pixel-outlook.mjs
 *
 * Output: public/joaquin-anime-v2.png  (review before swapping the hero)
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

const HERO_PATH = path.resolve("public/joaquin-anime.png");
const OUT_PATH = path.resolve("public/joaquin-anime-v2.png");

if (!fs.existsSync(HERO_PATH)) {
  console.error(`ERROR: hero image not found: ${HERO_PATH}`);
  process.exit(1);
}

const heroB64 = fs.readFileSync(HERO_PATH).toString("base64");

const PROMPT = `
This reference image is the CURRENT state of a wide cinematic 16:9
anime illustration of a man at his workstation. You must produce a
**near-identical regenerated version** of this same scene, preserving
**100% of the composition** — same character pose, same face, same
glasses, same wardrobe, same tattoo, same watch, same monitors and
their on-screen UIs (Proxmox on the left, Azure Portal on the right,
both dark mode), same keyboard and mouse, same mate gourd, same
bullet journal, same Merck badge, same EDC side table with all six
items, same wall color / accent wall / Atomic Habits frame, same
window with the peaceful night backyard + string lights + moon, same
lighting, same anime art style, same 16:9 aspect ratio, same
2048x1152 (or higher) resolution.

The ONLY change from the reference is the **Pixel 9 Pro on the desk
beside the keyboard**. In the reference it is lying flat face-DOWN
(camera bar visible on the back). In your output, the phone must be:

1. Lying flat on the desk **face-UP** (screen facing the camera / ceiling,
   so the viewer can see the display). Keep the phone in the same
   position and at the same angle as the reference — same place on
   the desk, same portrait orientation, same size, same realistic
   perspective as if viewed from the man's three-quarter back angle.
   The phone body is still obsidian-black with rounded corners and
   slim bezels.

2. The screen is **powered on**, lit up, with **Microsoft Outlook
   Mobile** displayed on it. The Outlook UI must be recognizable and
   fill the entire phone screen:

   - Top status bar: small time (e.g. "9:41") on the left, tiny
     battery indicator on the right, dark text on the white Outlook
     background.
   - **Outlook header band** below the status bar in the signature
     **Microsoft Outlook blue (#0078D4 / #0a58a8)**, about 10-12% of
     the phone screen tall. On the left of this header: the small
     white **Outlook "O" logo** (a white outlined O with a small
     envelope flap peek). Next to it, white bold text "Inbox".
   - Below the header: a thin grey rounded search bar with a
     magnifying-glass icon and faint "Search mail" placeholder.
   - Below the search bar: the **Today** section label in small blue
     bold text.
   - Then a **vertical list of 4-5 email rows** stacked down the
     screen. Each row has:
       • a small colored circular avatar with a white single-letter
         initial (J, M, A, K, R — varied colors: blue, purple,
         orange, green, red)
       • to the right of the avatar: a bold sender name in dark text
         (e.g. "Joaquin Sanchez", "Merck AVD Team", "Azure Support",
         "Kevin Metz", "Recruiter · Workday")
       • a subject line in slightly lighter text (e.g. "Let's
         connect", "Capacity review agenda", "Subscription cost
         report", "1:1 notes", "Staff Cloud Engineer role")
       • a short preview snippet in grey text below
       • a small right-aligned timestamp (e.g. "9:12", "8:47", "Mon",
         "Sun", "Fri")
     The TOP email row must be highlighted as **UNREAD** with a small
     blue dot at the left margin and slightly bolder text. Rows are
     separated by thin grey hairline dividers.
   - Near the bottom-right of the screen, a floating circular
     **compose button** in Outlook blue with a white "+" icon (FAB).
   - At the very bottom, a thin white nav bar with four small icons
     (mail — highlighted blue, calendar, feed, apps) and a tiny grey
     horizontal home-indicator bar below.

3. The screen content must be **clearly visible and readable at the
   phone's on-desk size in the final image** — do NOT render the UI
   as a blurry smudge. Even though the phone is small in the scene,
   make the blue Outlook header band, the list of email rows with
   avatar circles, and the FAB compose button crisp enough to
   recognize instantly. The screen emits a soft glow that subtly
   lights the surrounding desk area where the phone sits.

4. It must still look like a Pixel 9 Pro: slim rounded chassis,
   centered punch-hole camera at the top of the screen, thin uniform
   bezels. **Not an iPhone, not a generic phone.**

**Everything else in the scene stays EXACTLY the same** — do not
change the character, do not change any of the monitor UIs, do not
change the desk items, do not change the window view, do not change
the room, do not change the lighting. This is a surgical edit that
only flips the phone and lights up its screen with the Outlook app.

Output a single image, 16:9, 2048x1152 or higher, anime semi-realistic
style matching the reference exactly.
`.trim();

const body = {
  contents: [
    {
      parts: [
        { text: PROMPT },
        {
          text:
            "Reference image: CURRENT hero scene. Preserve 100% of composition. Only change the Pixel 9 Pro to face-up + lit screen with Outlook Mobile, as described.",
        },
        { inlineData: { mimeType: "image/png", data: heroB64 } },
      ],
    },
  ],
  generationConfig: {
    responseModalities: ["IMAGE"],
  },
};

console.log(`→ Regenerating hero (phone flip + Outlook) via ${MODEL} ...`);

const payloadPath = path.join(os.tmpdir(), `gemini-flip-${Date.now()}.json`);
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
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
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
console.log(`  Review it, then if happy:`);
console.log(`    cp ${OUT_PATH} ${HERO_PATH}`);
