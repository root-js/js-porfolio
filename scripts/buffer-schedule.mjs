#!/usr/bin/env node
/**
 * Schedule a LinkedIn post via Buffer's GraphQL API.
 *
 * Usage:
 *   export BUFFER_TOKEN=$(security find-generic-password -s buffer-api-key -w)
 *   node scripts/buffer-schedule.mjs --text-file drafts/week-01.md --at 2026-04-27T13:00:00Z
 *   node scripts/buffer-schedule.mjs --text-file drafts/week-01.md --queue
 *   node scripts/buffer-schedule.mjs --text "Raw post body" --at 2026-04-27T13:00:00Z
 *
 * Flags:
 *   --text "..."          Inline post body
 *   --text-file PATH      Read post body from file (strips YAML frontmatter if present)
 *   --at ISO8601          Schedule for specific UTC time
 *   --queue               Add to Buffer queue (next open slot)
 *   --channel linkedin    Which service (default: linkedin)
 *   --dry-run             Validate + show what would be sent, don't submit
 */

import fs from "node:fs";
import { spawnSync } from "node:child_process";

const API = "https://api.buffer.com/";

function getToken() {
  if (process.env.BUFFER_TOKEN) return process.env.BUFFER_TOKEN;
  const r = spawnSync("security", ["find-generic-password", "-s", "buffer-api-key", "-w"], { encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error("No BUFFER_TOKEN env and keychain entry 'buffer-api-key' not found");
  }
  return r.stdout.trim();
}

function parseArgs(argv) {
  const out = { channel: "linkedin" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--text") out.text = argv[++i];
    else if (a === "--text-file") out.textFile = argv[++i];
    else if (a === "--at") out.at = argv[++i];
    else if (a === "--queue") out.queue = true;
    else if (a === "--channel") out.channel = argv[++i];
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") { printHelp(); process.exit(0); }
    else throw new Error(`Unknown arg: ${a}`);
  }
  return out;
}

function printHelp() {
  console.log(`buffer-schedule.mjs
  --text "..."          inline post body
  --text-file PATH      read post body from file
  --at ISO8601          schedule for specific UTC time
  --queue               add to Buffer queue (next open slot)
  --channel linkedin    which service (default: linkedin)
  --dry-run             validate + preview, don't submit`);
}

function loadText(args) {
  let text;
  if (args.textFile) {
    const raw = fs.readFileSync(args.textFile, "utf8");
    text = raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  } else if (args.text) {
    text = args.text;
  } else {
    throw new Error("Provide --text or --text-file");
  }

  const bad = text.match(/[\u2013\u2014]/);
  if (bad) {
    throw new Error(
      `Post contains em/en-dash (${JSON.stringify(bad[0])}). Voice rule says no. Fix and retry.`,
    );
  }
  if (text.length > 3000) {
    throw new Error(`Post is ${text.length} chars, LinkedIn max is 3000`);
  }
  return text;
}

async function gql(token, query, variables) {
  const r = await fetch(API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) {
    throw new Error(`Buffer GraphQL error: ${JSON.stringify(j.errors)}`);
  }
  return j.data;
}

async function resolveChannel(token, service) {
  const acct = await gql(token, `{ account { currentOrganization { id } } }`);
  const orgId = acct.account.currentOrganization.id;

  const ch = await gql(token, `
    query($input: ChannelsInput!) {
      channels(input: $input) { id name service displayName isDisconnected }
    }
  `, { input: { organizationId: orgId } });

  const match = ch.channels.find(
    (c) => c.service?.toLowerCase() === service.toLowerCase() && !c.isDisconnected,
  );
  if (!match) {
    throw new Error(
      `No connected ${service} channel. Connect one at publish.buffer.com first.`,
    );
  }
  return { orgId, channel: match };
}

async function main() {
  const args = parseArgs(process.argv);
  const token = getToken();
  const text = loadText(args);

  const { channel } = await resolveChannel(token, args.channel);

  let mode, dueAt;
  if (args.queue) {
    mode = "addToQueue";
    dueAt = null;
  } else if (args.at) {
    mode = "customScheduled";
    dueAt = new Date(args.at).toISOString();
    if (Number.isNaN(Date.parse(dueAt))) throw new Error(`Bad --at: ${args.at}`);
  } else {
    throw new Error("Provide --at ISO8601 or --queue");
  }

  const input = {
    channelId: channel.id,
    text,
    schedulingType: "automatic",
    mode,
    source: "shikamaru",
    aiAssisted: true,
    ...(dueAt ? { dueAt } : {}),
  };

  console.log(`→ Target: ${channel.service} / ${channel.displayName || channel.name} (${channel.id})`);
  console.log(`→ Mode:   ${mode}${dueAt ? ` @ ${dueAt}` : ""}`);
  console.log(`→ Chars:  ${text.length}`);
  console.log(`→ Body:\n${text.split("\n").map((l) => "    " + l).join("\n")}\n`);

  if (args.dryRun) {
    console.log("(dry-run, not submitted)");
    return;
  }

  const out = await gql(token, `
    mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess { post { id status dueAt } }
        ... on NotFoundError { message }
        ... on UnauthorizedError { message }
        ... on UnexpectedError { message }
        ... on RestProxyError { message }
        ... on LimitReachedError { message }
        ... on InvalidInputError { message }
      }
    }
  `, { input });

  const res = out.createPost;
  if (res.__typename !== "PostActionSuccess") {
    throw new Error(`Buffer rejected the post (${res.__typename}): ${res.message || "no message"}`);
  }
  console.log(`✓ Scheduled post ${res.post.id} (${res.post.status}) for ${res.post.dueAt}`);
}

main().catch((e) => {
  console.error(`✗ ${e.message}`);
  process.exit(1);
});
