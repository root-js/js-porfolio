"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type Status = "idle" | "sending" | "sent" | "error";
type Folder = "inbox" | "sent" | "drafts";
type Mode = "compose" | "read";

type EmailRow = {
  id: string;
  folder: Folder;
  fromName: string;
  fromEmail: string;
  fromInitial: string;
  avatar: string; // css color
  to: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread?: boolean;
  important?: boolean;
};

const EMAILS: EmailRow[] = [
  {
    id: "azure-capacity-approved",
    folder: "inbox",
    fromName: "Azure Capacity Team",
    fromEmail: "azure-capacity@microsoft.com",
    fromInitial: "A",
    avatar: "#0078D4",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject:
      "[APPROVED] NVads-A10 capacity request — East US 2",
    preview:
      "Good news — your request for additional NVads-A10 v5 capacity in East US 2 has been approved and quota…",
    body: `Hi Joaquin,

Good news — your request for additional NVads-A10 v5 capacity in East US 2 has been approved.

Summary
  • SKU:             Standard_NV36ads_A10_v5
  • Region:          East US 2
  • Quota approved:  +48 vCPU (previously 24)
  • Effective:       Immediate
  • Request ID:      CAP-2026-04-0873

Please confirm your deployment plan with your allocation manager before provisioning. Utilization below 60% over a rolling 30-day window may trigger an automatic review.

If you need additional A10 capacity beyond this allocation, please submit a new request with updated business justification.

Best regards,
Azure Capacity Management`,
    time: "11:23 AM",
    unread: true,
    important: true,
  },
  {
    id: "marcus-disk-upgrade",
    folder: "inbox",
    fromName: "Marcus T.",
    fromEmail: "marcus.t@merck.com",
    fromInitial: "M",
    avatar: "#f77f00",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject:
      "[APPROVAL] Upgrade East-2 host-pool disks — Premium SSD → Premium SSD v2",
    preview:
      "Hey Joaquin, per the capacity review we need to upgrade the East-2 session-host OS disks from P30 Premium SSD…",
    body: `Hi Joaquin,

Per Tuesday's capacity review we need to upgrade the East-2 session-host OS disks from P30 Premium SSD to Premium SSD v2 to match the new GPU-pool I/O profile.

Scope
  • 42 session hosts in the avd-hp-e2-main host pool
  • Disk tier:   P30 Premium SSD (1 TiB, 5000 IOPS) → Premium SSD v2 (1 TiB, 8000 IOPS, 200 MB/s)
  • Cost delta:  +$314/mo across the pool (net of the previous Premium SSD cost)
  • Downtime:    None — hot-swap via Nerdio during the next maintenance window

Need your approval to proceed. If you're good I'll schedule the swap during the Sat 03:00 UTC window and roll the change ticket through CAB today.

Thanks,
Marcus

Marcus T.
AVD Operations Engineer`,
    time: "10:58 AM",
    unread: true,
    important: true,
  },
  {
    id: "kevin-cost-mgmt",
    folder: "inbox",
    fromName: "Kevin M.",
    fromEmail: "kevin.m@merck.com",
    fromInitial: "K",
    avatar: "#2aa160",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject:
      "Q2 VDI cost breakdown — need a first-cut before Thursday",
    preview:
      "The exec review lands next Tuesday and leadership asked us to come in with a full VDI cost breakdown…",
    body: `Hi Joaquin,

The exec review lands next Tuesday and leadership asked us to come in with a full VDI cost breakdown sorted by department. Focus areas:

  1) Top session-host SKUs by spend
  2) Idle / underutilized multi-session pools
  3) GPU pool run-rate — I want to quantify whether the molecule-sim workload justifies the current fleet size
  4) Reservation utilization vs on-demand

Can you get me a first-cut view by Thursday EOD? Don't polish it — raw numbers plus a few notes, I'll clean up for the deck.

Thanks,
Kevin

Kevin M.
Associate Director, Virtualization Engineering`,
    time: "9:47 AM",
    unread: true,
    important: true,
  },
  {
    id: "sn-inc-eu-access",
    folder: "inbox",
    fromName: "ServiceNow",
    fromEmail: "servicenow@merck.com",
    fromInitial: "S",
    avatar: "#81b29a",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject:
      "INC0781234 assigned to you — Users unable to launch AVD from EU region",
    preview:
      "Priority: P2 · Assignment group: Virtualization Engineering · Short description: Multiple users in AMS…",
    body: `Ticket: INC0781234
Priority: P2
Assignment group: Virtualization Engineering
Short description: Multiple users in AMS and FRA unable to launch AVD session (code 0x3000008)

Description
Six users across the EU region report AVD client errors when launching the multi-session host pool. Initial triage suggests the FSLogix container mount is timing out. Opened after the weekend patch cycle on avd-hp-eu-main.

Please acknowledge within SLA (15 minutes). Attachments: user list, client logs, host-pool diagnostics.

— ServiceNow (automated)`,
    time: "9:15 AM",
    unread: true,
  },
  {
    id: "ed-west2-cutover",
    folder: "inbox",
    fromName: "Ed R.",
    fromEmail: "ed.r@merck.com",
    fromInitial: "E",
    avatar: "#0a9396",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "West-2 cutover plan — need your eyes on the runbook",
    preview:
      "Hey — dropped the West-2 migration runbook in SharePoint. Can you review the failover section before…",
    body: `Hey Joaquin,

Dropped the West-2 migration runbook in SharePoint. Can you review the failover section before Thursday's capacity sync? Specifically:

  • Pre-cutover checks (DNS TTLs, host-pool drain order)
  • FSLogix container migration path
  • Rollback triggers — I set the threshold at >2% session drop in a 10-min window; you may want that tighter

I'd rather we argue about it now than Saturday morning.

Thanks,
Ed

Ed R.
Senior Engineer, Virtualization`,
    time: "Mon 2:14 PM",
    unread: true,
  },
  {
    id: "devops-pr-review",
    folder: "inbox",
    fromName: "Azure DevOps",
    fromEmail: "azuredevops@microsoft.com",
    fromInitial: "D",
    avatar: "#0078d4",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject:
      "[PR #247] avd-image-pipeline: add FSLogix 2.9.9 install step",
    preview:
      "Ed R. requested your review on pull request #247 in merck/avd-image-pipeline: add FSLogix 2.9.9…",
    body: `Pull request: #247
Repository: merck/avd-image-pipeline
Branch: feature/fslogix-2.9.9 → main
Author: Ed R.
Reviewers requested: Joaquin Sanchez (required)

Description
Adds the FSLogix 2.9.9 installer to the gold-image packer pipeline, replaces the previous 2.9.8 download URL, and bumps the associated health-check script version.

Files changed: 4
+64 / -38 lines

Checks: 3 of 3 passing (build, lint, smoke test).

View PR in Azure DevOps →`,
    time: "Mon 1:08 PM",
  },
  {
    id: "defender-recs",
    folder: "inbox",
    fromName: "Microsoft Defender for Cloud",
    fromEmail: "defender-noreply@microsoft.com",
    fromInitial: "D",
    avatar: "#0078d4",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "2 new security recommendations for subscription avd-prod-east",
    preview:
      "Weekly security posture summary. Secure Score: 82% (+1 WoW). 2 new recommendations require attention…",
    body: `Weekly security posture summary for subscription: avd-prod-east

Secure Score: 82% (+1 WoW)

New recommendations
  • [High]   Enable Microsoft Defender for Servers Plan 2 on 4 AVD host pools
  • [Medium] Restrict public network access on 2 Azure Key Vaults used by avd-image-pipeline

Resolved this week: 3

Review all recommendations in the Defender for Cloud portal.

— Microsoft Defender for Cloud`,
    time: "Mon 9:32 AM",
  },
  {
    id: "petr-capacity",
    folder: "inbox",
    fromName: "Petr N.",
    fromEmail: "petr.n@merck.com",
    fromInitial: "P",
    avatar: "#8a4fff",
    to: "Virtualization Eng <virt-eng-dl@merck.com>",
    subject: "Capacity review — Thursday agenda",
    preview:
      "Team, I've scoped Thursday's capacity sync around the East-2 autoscale drift we saw last week…",
    body: `Team,

I've scoped Thursday's capacity sync around the East-2 autoscale drift we saw last week. Agenda:

  1) East-2 session-host scaling anomaly (Joaquin)
  2) GPU pool utilization review (me)
  3) West-2 migration cutover plan (Ed)
  4) EU FSLogix profile storage growth (Marlon)
  5) FY27 capacity forecast — first draft (Jaya)

Please come with data, not opinions. If something is blocked, flag it ahead so we can resolve async.

Petr`,
    time: "Mon 8:47 AM",
  },
  {
    id: "rachel-kudos",
    folder: "inbox",
    fromName: "Rachel P.",
    fromEmail: "rachel.p@merck.com",
    fromInitial: "R",
    avatar: "#c43b5b",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Nice work on the AVD cost dashboard",
    preview:
      "Saw the demo in Kevin's 1:1 — the sortable-by-SKU plus department view is exactly what I was hoping for…",
    body: `Joaquin,

Saw the demo in Kevin's 1:1 — the sortable-by-SKU plus department view is exactly what I was hoping for. I'm going to pull it into the Q2 ops review deck on Tuesday.

If you can add a YoY comparison and flag the top 3 departments growing fastest, that would land well with finance.

— Rachel

Rachel P.
Senior Director, Infrastructure Engineering`,
    time: "Mon 8:12 AM",
    unread: true,
  },
  {
    id: "marlon-fslogix",
    folder: "inbox",
    fromName: "Marlon O.",
    fromEmail: "marlon.o@merck.com",
    fromInitial: "M",
    avatar: "#6d28d9",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "EU FSLogix profile storage growth — proposing cleanup",
    preview:
      "Joaquin — the AMS FSLogix share is at 78% full and projecting to hit 95% by end of Q2. Proposing a…",
    body: `Hey Joaquin,

The AMS FSLogix share is at 78% full and projecting to hit 95% by end of Q2. Proposing:

  1) Archive profiles not accessed in 90+ days (~180 containers, freeing ~2.4 TiB)
  2) Shrink quarantined/orphaned profiles first
  3) Bump the share quota +3 TiB if items 1+2 don't buy us enough headroom

Ticket drafted in ServiceNow — need your sign-off before I kick off the archive job.

Marlon`,
    time: "Mon 7:45 AM",
  },
  {
    id: "sharepoint-shared",
    folder: "inbox",
    fromName: "SharePoint",
    fromEmail: "no-reply@sharepointonline.com",
    fromInitial: "S",
    avatar: "#036c70",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Kevin M. shared a file with you",
    preview:
      "Kevin M. shared 'Q2-VDI-Cost-Report-Draft.xlsx' with you. You have edit access…",
    body: `Kevin M. shared a file with you.

File:    Q2-VDI-Cost-Report-Draft.xlsx
Access:  Can edit
Message: "Drop your first-cut numbers in the 'Raw' tab. I'll format the rest."

Open in SharePoint →

This message was sent to you because Kevin M. shared the file with you.`,
    time: "Sun 11:42 AM",
  },
  {
    id: "ms-security-signin",
    folder: "inbox",
    fromName: "Microsoft Security",
    fromEmail: "account-security-noreply@microsoft.com",
    fromInitial: "M",
    avatar: "#d62828",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Unusual sign-in activity — MFA prompt required",
    preview:
      "We detected a sign-in attempt to your Microsoft account from a new device in Newark, NJ at 14:22 UTC…",
    body: `Microsoft account: joaquin.s@merck.com

We detected a sign-in attempt to your Microsoft account from a new device:

  Device:    Windows 11 — Chrome
  Location:  Newark, NJ, USA
  IP:        73.x.x.x
  Time:      14:22 UTC

If this was you, no further action is required. If this was NOT you, please change your password immediately and report the activity.

— Microsoft Security`,
    time: "Sun",
  },
  {
    id: "azure-support",
    folder: "inbox",
    fromName: "Azure Support",
    fromEmail: "azuresupport@microsoft.com",
    fromInitial: "A",
    avatar: "#ff7a3d",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject:
      "[Ticket 2601428934] GPU SKU availability — East US 2",
    preview:
      "Hi Joaquin, we've escalated your request for A10 GPU capacity in East US 2 to the capacity team…",
    body: `Hi Joaquin,

We've escalated your request for A10 GPU capacity in East US 2 to the capacity team. Current queue is 4-6 business days. We'll update this ticket once we have a firm ETA.

If you have region flexibility, that SKU is currently available in East US (not East US 2) with no queue.

Best,
Azure Support`,
    time: "Sun",
  },
  {
    id: "loginvsi-results",
    folder: "inbox",
    fromName: "LoginVSI",
    fromEmail: "reports@loginvsi.com",
    fromInitial: "L",
    avatar: "#3d5a80",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Benchmark results — AVD East-2 · D16s_v5 · knowledge-worker",
    preview:
      "Your scheduled benchmark run completed. VSImax: 138 sessions (target 125). Median login time: 11.4s…",
    body: `Benchmark run complete.

Test profile:   knowledge-worker (Office + Edge + Teams)
Host pool:      avd-hp-e2-main (D16s_v5, Windows 11 Enterprise)
Launched:       Sat 2026-04-18 02:00 UTC
Duration:       1h 48m
Result:         PASS

Key metrics
  • VSImax baseline:    138 sessions (target 125 — +10.4%)
  • Median login time:  11.4s  (target <15s)
  • App response:       1.42s  (target <2s)
  • Resource saturation:  CPU 78%, RAM 61%

Regression vs. previous run: none (VSImax +2 sessions).

Open the full report →

— LoginVSI`,
    time: "Sat",
  },
  {
    id: "zscaler-policy",
    folder: "inbox",
    fromName: "Zscaler Admin",
    fromEmail: "zscaler-admin@merck.com",
    fromInitial: "Z",
    avatar: "#00ae42",
    to: "Virtualization Eng <virt-eng-dl@merck.com>",
    subject:
      "Policy update — new bypass rules applied for AVD traffic",
    preview:
      "Heads up: we've published a new ZIA policy version that moves Microsoft Teams, Outlook, and AVD WVD…",
    body: `Team,

We've published a new ZIA policy version (v26.04) that bypasses the SSL inspection engine for:

  • Microsoft Teams media traffic
  • Outlook (M365) client traffic
  • AVD / WVD gateway endpoints (wvd.microsoft.com, *.wvd.microsoft.com)

Effective:  Tonight 22:00 UTC (rollout is instant)
Impact:     Reduced latency on Teams calls and AVD session launches. No action required on your end.

If you see unexpected behavior, open a P2 and tag #zscaler.

— Zscaler Admin`,
    time: "Sat",
  },
  {
    id: "jaya-fy27-forecast",
    folder: "inbox",
    fromName: "Jaya R.",
    fromEmail: "jaya.r@merck.com",
    fromInitial: "J",
    avatar: "#e76f51",
    to: "Virtualization Eng <virt-eng-dl@merck.com>",
    subject: "FY27 capacity forecast — first draft attached",
    preview:
      "Team, first draft of the FY27 capacity forecast is up. Looking for feedback on the GPU pool assumptions…",
    body: `Team,

First draft of the FY27 capacity forecast is up. Looking for feedback specifically on:

  1) GPU pool growth assumptions — I modeled 18% YoY driven by Discovery + Manufacturing sim workloads. Is that conservative?
  2) Multi-session pool sizing — held flat; open to arguments for growth/shrink.
  3) Regional split — proposed adding a second EU region (Frankfurt) in H2.

Please drop comments directly in the doc by EOD Wednesday.

Jaya

Jayakumar R.
Capacity & Forecasting Lead`,
    time: "Fri 5:47 PM",
  },
  {
    id: "intune-compliance",
    folder: "inbox",
    fromName: "Microsoft Intune",
    fromEmail: "noreply@microsoft.com",
    fromInitial: "I",
    avatar: "#605e5c",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Endpoint compliance summary — 3 devices flagged",
    preview:
      "Weekly compliance summary for policy 'AVD-Session-Host-Baseline'. 97% compliant. 3 devices require attention…",
    body: `Weekly compliance summary for the policy AVD-Session-Host-Baseline.

Total devices: 118
Compliant: 115 (97%)
Non-compliant: 3

Flagged devices:
  • avd-sh-eu-04  — BitLocker key escrow missing
  • avd-sh-w2-07  — Defender signature older than 72h
  • avd-pd-e2-12  — Pending reboot after cumulative update

This is an automated summary. Review and remediate in the Intune admin center.

— Microsoft Intune`,
    time: "Fri 6:00 AM",
  },
  {
    id: "nerdio-maint",
    folder: "inbox",
    fromName: "Nerdio Manager",
    fromEmail: "support@getnerdio.com",
    fromInitial: "N",
    avatar: "#7c3aed",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Scheduled maintenance — Control Plane · Sat 03:00 UTC",
    preview:
      "Nerdio Manager will undergo a control-plane maintenance window this Saturday 03:00–04:00 UTC. Scale…",
    body: `Hi Joaquin,

Nerdio Manager for Enterprise will undergo a scheduled control-plane maintenance window this Saturday 03:00–04:00 UTC.

What's affected
  • Portal access      — brief (~5 min) unavailability at the start of the window
  • Scheduled jobs     — paused during the window, resume automatically after
  • Running scale jobs — not affected; host pools continue autoscaling normally

No action required on your end. Release notes will follow in Monday's product update.

— Nerdio Customer Success`,
    time: "Fri",
  },
  {
    id: "workday-recruiter",
    folder: "inbox",
    fromName: "Workday Talent",
    fromEmail: "noreply@workday.com",
    fromInitial: "W",
    avatar: "#3b7bd8",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Staff Cloud Engineer role — matched to your profile",
    preview:
      "Based on your experience with Azure Virtual Desktop and multi-region scaling, we think you'd be a great fit…",
    body: `Hi Joaquin,

Based on your experience with Azure Virtual Desktop and multi-region scaling, we think you'd be a great fit for the Staff Cloud Engineer role posted last week. Remote US with quarterly travel.

Let us know if you'd like to chat.

— Workday Talent`,
    time: "Fri",
  },
  {
    id: "concur-receipts",
    folder: "inbox",
    fromName: "Concur",
    fromEmail: "no-reply@concursolutions.com",
    fromInitial: "C",
    avatar: "#1e3a8a",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "Action required — 3 unfiled receipts for March",
    preview:
      "You have 3 unfiled receipts from March totaling $182.47. Please submit expense report by 4/30…",
    body: `Hi Joaquin,

You have 3 unfiled receipts from March that have not been attached to an expense report:

  • 3/12  Uber   — $47.82   (AVD offsite, Boston)
  • 3/18  Lunch  — $62.15   (team sync, NJ)
  • 3/24  Delta  — $72.50   (baggage fee)

Please submit an expense report by 4/30 to stay within corporate policy.

— Concur`,
    time: "Thu",
  },
  {
    id: "viva-anniversary",
    folder: "inbox",
    fromName: "Viva Engage",
    fromEmail: "viva-engage@microsoft.com",
    fromInitial: "V",
    avatar: "#b4befe",
    to: "Joaquin Sanchez <joaquin.s@merck.com>",
    subject: "🎉 Congratulations on 5 years at Merck!",
    preview:
      "Your colleagues are celebrating your 5-year work anniversary. Kevin M., Petr N., and 14 others posted…",
    body: `Congratulations Joaquin!

You're celebrating 5 years at Merck & Co., Inc today.

Your colleagues Kevin M., Petr N., Ed R., and 14 others have posted congratulations on your Viva Engage feed.

View your anniversary board →

— Viva Engage`,
    time: "Wed",
  },
  {
    id: "ops-maint-notice",
    folder: "sent",
    fromName: "Joaquin Sanchez (me)",
    fromEmail: "joaquin.s@merck.com",
    fromInitial: "J",
    avatar: "#0078D4",
    to: "AVD Operations <avd-ops-dl@merck.com>; NOC <noc-dl@merck.com>",
    subject:
      "[HEADS-UP] AVD East-2 maintenance window — Sat 03:00-05:00 UTC",
    preview:
      "Team, scheduling a maintenance window on the East-2 host pool this Saturday to roll out FSLogix + CU…",
    body: `Team,

Scheduling a maintenance window on the East-2 session-host pool this Saturday 03:00-05:00 UTC to roll out the latest FSLogix build and monthly cumulative.

Impact
  • Multi-session pool (avd-sh-e2-*) — drain-and-update rotation. At any given time at least 10 hosts remain available; user impact is near-zero.
  • Personal desktop pool — rebooted last. Users get a 15-minute warning toast.
  • FSLogix profile Azure Files share stays online throughout.

Rollback
  • Image version avd-img-gold-20260414 stays pinned on the host pool for 48h post-cutover.

Ops actions
  • NOC: please raise the maintenance banner in ServiceNow and hold P3-or-below paging during the window.
  • If you see anything off in session-host telemetry ahead of Saturday, ping me.

Thanks,
Joaquin

Joaquin Sanchez
Specialist Infrastructure Engineer, Virtualization
Merck & Co., Inc.`,
    time: "11:02 AM",
  },
  {
    id: "kevin-reply-cost",
    folder: "sent",
    fromName: "Joaquin Sanchez (me)",
    fromEmail: "joaquin.s@merck.com",
    fromInitial: "J",
    avatar: "#0078D4",
    to: "Kevin M. <kevin.m@merck.com>",
    subject: "RE: Q2 VDI cost breakdown — first-cut view",
    preview:
      "Kevin, attached is the first-cut cost view. Quick summary below so you can skim before the deck…",
    body: `Kevin,

Attached is the first-cut cost view. Quick summary below so you can skim before the deck.

Top spend by SKU (last 30d)
  1) A10 GPU pool — molecule sim workload, justified
  2) D16s_v5 multi-session — core VDI
  3) E16s_v5 personal desktops — power users

Dept breakdown — top 3 consumers
  1) Discovery (GPU-heavy)
  2) Manufacturing QA
  3) Commercial Analytics

Reservations ~78% utilized. Can push closer to 90% if we consolidate the West-2 personal pool.

Raw numbers in the spreadsheet. Let me know what you want me to polish for the deck.

Joaquin`,
    time: "Tue 10:31 AM",
  },
];

const FOLDER_COUNTS = {
  inbox: EMAILS.filter((e) => e.folder === "inbox").length,
  unread: EMAILS.filter((e) => e.folder === "inbox" && e.unread).length,
  sent: EMAILS.filter((e) => e.folder === "sent").length,
  drafts: 1,
};

export function ContactDesktop({
  name: recipientName,
  email: recipientEmail,
}: {
  name: string;
  email: string;
}) {
  const [mode, setMode] = useState<Mode>("compose");
  const [folder, setFolder] = useState<Folder>("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Compose state (unchanged backend — still hits /api/contact → Resend)
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState(
    `Hello from your portfolio, ${recipientName.split(" ")[0]}`,
  );
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [via, setVia] = useState<string>("");

  const folderEmails = EMAILS.filter((e) => e.folder === folder);
  const selected = EMAILS.find((e) => e.id === selectedId) ?? null;

  function openEmail(id: string) {
    setSelectedId(id);
    setMode("read");
  }

  function openCompose() {
    setMode("compose");
  }

  function valid() {
    if (!fromName.trim()) return "Your name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail))
      return "Enter a valid email.";
    if (!body.trim()) return "Write a message first.";
    return null;
  }

  function resetCompose() {
    setFromName("");
    setFromEmail("");
    setSubject(`Hello from your portfolio, ${recipientName.split(" ")[0]}`);
    setBody("");
    setStatus("idle");
    setErrorMsg("");
    setVia("");
  }

  async function send() {
    const err = valid();
    if (err) {
      setStatus("error");
      setErrorMsg(err);
      return;
    }
    setStatus("sending");
    setErrorMsg("");

    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fromName,
          email: fromEmail,
          message: `Subject: ${subject}\n\n${body}`,
        }),
      });
      const data = (await r.json()) as {
        ok: boolean;
        via?: string;
        error?: string;
      };
      if (!r.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Send failed.");
        return;
      }
      setVia(data.via || "");
      if (data.via === "mailto") {
        const mailto =
          `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(
            `From: ${fromName} <${fromEmail}>\n\n${body}`,
          )}`;
        window.location.href = mailto;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Try again.");
    }
  }

  return (
    <div className="h-full w-full p-2 md:p-4 flex items-start justify-center overflow-auto">
      <div
        className="w-full max-w-[1400px] rounded-md overflow-hidden border border-black/50 shadow-2xl bg-[#faf9f8]"
        style={{ boxShadow: "0 24px 72px rgba(0,0,0,0.55)" }}
      >
        {/* ============ OUTLOOK TITLE BAR ============ */}
        <div className="h-9 flex items-center justify-between px-2 bg-[#0078D4]">
          <div className="flex items-center gap-2">
            <OutlookLogo />
            <span className="text-[13px] text-white font-semibold tracking-wide">
              Outlook
            </span>
            <span className="text-[12px] text-white/85">
              — {recipientEmail}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchBox />
            <UserAvatar initial="J" />
            <Link
              href="/hypervisor"
              className="w-7 h-6 flex items-center justify-center text-white/90 hover:bg-red-600 hover:text-white transition text-xs rounded-sm"
              aria-label="Close"
              title="Close (back to Hypervisor)"
            >
              ✕
            </Link>
          </div>
        </div>

        {/* ============ OUTLOOK RIBBON ============ */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#f3f2f1] border-b border-black/10 text-[12px] text-[#1b1b1b]">
          <RibbonBtn
            label="＋ New mail"
            primary
            onClick={openCompose}
            active={mode === "compose"}
          />
          <span className="w-px h-5 bg-black/15 mx-1" />
          <RibbonBtn label="📤 Send" onClick={send} disabled={status === "sending"} />
          <RibbonBtn label="🗑 Delete" />
          <RibbonBtn label="↩ Reply" />
          <RibbonBtn label="↪ Forward" />
          <RibbonBtn label="📎 Attach" />
          <RibbonBtn label="🚩 Flag" />
          <span className="ml-auto text-[11px] text-[#605e5c]">
            {status === "idle" && mode === "compose" && "New message"}
            {status === "idle" && mode === "read" && selected && (
              <>Reading — {selected.fromName}</>
            )}
            {status === "sending" && "Sending…"}
            {status === "sent" &&
              (via === "resend" ? (
                <span className="text-emerald-600">✓ Sent via smtp.s.com.do</span>
              ) : (
                <span className="text-emerald-600">✓ Opened mail client</span>
              ))}
            {status === "error" && (
              <span className="text-red-600">{errorMsg}</span>
            )}
          </span>
        </div>

        {/* ============ 3-COLUMN BODY (folder / main / calendar) ============ */}
        <div className="grid grid-cols-1 min-h-[640px] lg:grid-cols-[210px_1fr_300px]">
          {/* ========== LEFT — FOLDERS ========== */}
          <aside className="hidden lg:flex flex-col border-r border-black/10 bg-[#faf9f8] text-[13px] text-[#1b1b1b]">
            <div className="px-3 py-2">
              <button
                onClick={openCompose}
                className="w-full px-3 py-1.5 bg-[#0078D4] text-white rounded-sm text-[12px] font-semibold hover:brightness-110 transition"
              >
                ＋ New mail
              </button>
            </div>

            <div className="px-3 pt-1 pb-2">
              <div className="text-[10px] tracking-[0.24em] text-[#605e5c] mt-1 mb-1">
                FAVORITES
              </div>
              <FolderRow
                icon="📥"
                label="Inbox"
                count={FOLDER_COUNTS.unread}
                active={mode === "read" && folder === "inbox"}
                onClick={() => {
                  setFolder("inbox");
                  setMode("read");
                  setSelectedId(EMAILS.find((e) => e.folder === "inbox")?.id ?? null);
                }}
              />
              <FolderRow
                icon="✈"
                label="Sent Items"
                count={FOLDER_COUNTS.sent}
                active={mode === "read" && folder === "sent"}
                onClick={() => {
                  setFolder("sent");
                  setMode("read");
                  setSelectedId(EMAILS.find((e) => e.folder === "sent")?.id ?? null);
                }}
              />
              <FolderRow icon="📝" label="Drafts" count={FOLDER_COUNTS.drafts} />

              <div className="text-[10px] tracking-[0.24em] text-[#605e5c] mt-4 mb-1">
                FOLDERS
              </div>
              <FolderRow
                icon="📥"
                label="Inbox"
                count={FOLDER_COUNTS.unread}
                active={mode === "read" && folder === "inbox"}
                onClick={() => {
                  setFolder("inbox");
                  setMode("read");
                  setSelectedId(
                    EMAILS.find((e) => e.folder === "inbox")?.id ?? null,
                  );
                }}
              />
              <FolderRow icon="📝" label="Drafts" count={FOLDER_COUNTS.drafts} />
              <FolderRow
                icon="✈"
                label="Sent Items"
                count={FOLDER_COUNTS.sent}
                active={mode === "read" && folder === "sent"}
                onClick={() => {
                  setFolder("sent");
                  setMode("read");
                  setSelectedId(
                    EMAILS.find((e) => e.folder === "sent")?.id ?? null,
                  );
                }}
              />
              <FolderRow icon="🗑" label="Deleted Items" />
              <FolderRow icon="⚠" label="Junk Email" />
              <FolderRow icon="🗂" label="Archive" />
              <FolderRow icon="📌" label="Notes" />
              <FolderRow icon="💬" label="Conversation History" />
            </div>

            <div className="mt-auto p-3 border-t border-black/10 bg-[#f3f2f1]">
              <div className="text-[10px] tracking-[0.24em] text-[#605e5c] mb-1.5">
                ACCOUNT STATUS
              </div>
              <div className="text-[11px] leading-5 font-mono text-[#323130]">
                <div className="flex items-center gap-1.5">
                  <span className="relative inline-flex w-2 h-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-700 font-semibold">Connected</span>
                </div>
                <div className="mt-1 text-[#323130]">smtp.s.com.do</div>
                <div className="text-[#605e5c]">:587 · STARTTLS</div>
                <div className="mt-1 text-[#323130]">imap.s.com.do</div>
                <div className="text-[#605e5c]">:993 · SSL/TLS</div>
                <div className="mt-2 text-[10px] text-[#605e5c]">
                  Self-hosted on s.com.do
                </div>
              </div>
            </div>
          </aside>

          {/* ========== MIDDLE (varies by mode; sits in 1fr cell) ========== */}
          {mode === "compose" && (
            <section className="bg-white min-h-[640px]">
              <ComposePane
                recipientEmail={recipientEmail}
                recipientName={recipientName}
                fromName={fromName}
                setFromName={setFromName}
                fromEmail={fromEmail}
                setFromEmail={setFromEmail}
                subject={subject}
                setSubject={setSubject}
                body={body}
                setBody={setBody}
                status={status}
                errorMsg={errorMsg}
                send={send}
                via={via}
                reset={resetCompose}
              />
            </section>
          )}

          {mode === "read" && (
            <div className="hidden lg:grid lg:grid-cols-[320px_1fr] bg-white min-h-[640px]">
              {/* Email list */}
              <section className="flex flex-col border-r border-black/10 bg-white">
                <div className="px-3 py-2 border-b border-black/10 flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-semibold text-[#1b1b1b] capitalize">
                      {folder === "inbox"
                        ? "Inbox"
                        : folder === "sent"
                          ? "Sent Items"
                          : "Drafts"}
                    </div>
                    <div className="text-[11px] text-[#605e5c]">
                      {folderEmails.length}{" "}
                      {folder === "sent" ? "sent" : "messages"}
                      {folder === "inbox" && FOLDER_COUNTS.unread > 0 && (
                        <span className="ml-2 text-[#0078D4] font-semibold">
                          {FOLDER_COUNTS.unread} unread
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#0078D4] cursor-pointer hover:underline">
                    Filter ▾
                  </div>
                </div>

                <ul className="flex-1 overflow-auto max-h-[640px]">
                  {folderEmails.map((e) => (
                    <li
                      key={e.id}
                      onClick={() => openEmail(e.id)}
                      className={`flex gap-2 px-3 py-2 cursor-pointer border-b border-black/5 ${
                        selectedId === e.id
                          ? "bg-[#cfe4fb]"
                          : "hover:bg-[#f3f2f1]"
                      }`}
                    >
                      <Avatar color={e.avatar} initial={e.fromInitial} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`truncate text-[13px] ${
                              e.unread
                                ? "font-bold text-[#0078D4]"
                                : "font-semibold text-[#1b1b1b]"
                            }`}
                          >
                            {e.fromName}
                          </span>
                          <span className="text-[11px] text-[#605e5c] whitespace-nowrap">
                            {e.time}
                          </span>
                        </div>
                        <div
                          className={`truncate text-[12px] ${
                            e.unread
                              ? "text-[#1b1b1b] font-semibold"
                              : "text-[#323130]"
                          }`}
                        >
                          {e.important && (
                            <span className="text-red-600 mr-1">❗</span>
                          )}
                          {e.subject}
                        </div>
                        <div className="truncate text-[11px] text-[#605e5c]">
                          {e.preview}
                        </div>
                      </div>
                      {e.unread && (
                        <span className="self-center w-2 h-2 rounded-full bg-[#0078D4] flex-none" />
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Reading pane */}
              <section className="bg-white">
                {selected ? (
                  <ReadingPane email={selected} onReply={openCompose} />
                ) : (
                  <div className="p-10 text-center text-[#605e5c] text-sm">
                    Select a message to read.
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ========== FAR RIGHT — MY DAY / CALENDAR ========== */}
          <CalendarPane />
        </div>
      </div>
    </div>
  );
}

/* ========================= COMPOSE ========================= */

function ComposePane({
  recipientEmail,
  recipientName,
  fromName,
  setFromName,
  fromEmail,
  setFromEmail,
  subject,
  setSubject,
  body,
  setBody,
  status,
  errorMsg,
  send,
  via,
  reset,
}: {
  recipientEmail: string;
  recipientName: string;
  fromName: string;
  setFromName: (v: string) => void;
  fromEmail: string;
  setFromEmail: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  status: Status;
  errorMsg: string;
  send: () => void;
  via: string;
  reset: () => void;
}) {
  const showOverlay =
    status === "sending" || (status === "sent" && via === "resend");

  return (
    <div className="relative flex flex-col h-full">
      <AnimatePresence>
        {showOverlay && (
          <SendTransition
            key="send-transition"
            status={status}
            recipientName={recipientName}
            recipientEmail={recipientEmail}
            fromEmail={fromEmail}
            onReset={reset}
          />
        )}
      </AnimatePresence>
      {/* Compose header */}
      <div className="px-4 py-2 border-b border-black/10 bg-[#f3f2f1]">
        <div className="text-[13px] font-semibold text-[#1b1b1b]">
          New Message
        </div>
        <div className="text-[11px] text-[#605e5c]">
          Outgoing via <span className="font-mono">smtp.s.com.do</span>
        </div>
      </div>

      {/* Fields */}
      <div className="px-4 pt-3 space-y-0">
        <ComposeField label="From" readOnly>
          <input
            type="text"
            value={fromName}
            placeholder="Your name"
            onChange={(e) => setFromName(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-[13px] text-[#1b1b1b] focus:outline-none"
          />
          <input
            type="text"
            value={fromEmail}
            placeholder="you@example.com"
            onChange={(e) => setFromEmail(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-[13px] text-[#1b1b1b] font-mono focus:outline-none border-l border-black/10 pl-3 ml-3"
          />
        </ComposeField>

        <ComposeField label="To">
          <span className="flex items-center gap-2 px-2 py-0.5 bg-[#0078D4]/10 text-[#0078D4] rounded-full text-[12px]">
            <span className="w-4 h-4 rounded-full bg-[#0078D4] text-white inline-flex items-center justify-center text-[9px] font-bold">
              J
            </span>
            {recipientName} &lt;{recipientEmail}&gt;
          </span>
        </ComposeField>

        <ComposeField label="Cc">
          <span className="text-[12px] text-[#a19f9d]">
            Add recipients…
          </span>
        </ComposeField>

        <ComposeField label="Subject">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-[#1b1b1b] font-semibold focus:outline-none"
          />
        </ComposeField>
      </div>

      {/* Mini format ribbon */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-y border-black/10 bg-[#f3f2f1] text-[11px] text-[#605e5c]">
        <span className="font-semibold text-[#1b1b1b]">B</span>
        <span className="italic text-[#1b1b1b]">I</span>
        <span className="underline text-[#1b1b1b]">U</span>
        <span>·</span>
        <span>Calibri</span>
        <span>11</span>
        <span>·</span>
        <span>🔗 Link</span>
        <span>📎 Attach</span>
        <span className="ml-auto text-[10px]">Plain text mode</span>
      </div>

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={14}
        placeholder={`Hi ${recipientName.split(" ")[0]},\n\nI came across your portfolio and wanted to reach out about…`}
        className="flex-1 m-0 px-4 py-3 bg-white text-[14px] leading-6 text-[#1b1b1b] font-sans focus:outline-none resize-none min-h-[280px]"
      />

      {/* Footer actions */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-black/10 bg-[#faf9f8]">
        <div className="flex items-center gap-2">
          <button
            onClick={send}
            disabled={status === "sending"}
            className="px-5 py-1.5 bg-[#0078D4] text-white text-[13px] font-semibold rounded-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
          <button className="px-3 py-1.5 text-[13px] text-[#1b1b1b] hover:bg-black/5 rounded-sm">
            💾 Save draft
          </button>
          <button className="px-3 py-1.5 text-[13px] text-[#1b1b1b] hover:bg-black/5 rounded-sm">
            🗑 Discard
          </button>
        </div>
        <div className="text-[11px] text-[#605e5c] font-mono">
          {body.length} chars · relay via smtp.s.com.do
        </div>
      </div>

      {status === "sent" && via === "mailto" && (
        <div className="mx-4 mb-3 p-3 rounded border border-amber-500/50 bg-amber-500/10 text-[11px] text-amber-800">
          <b>Note:</b> No server-side SMTP is configured yet, so your native
          mail client was opened with the message pre-filled.
        </div>
      )}
    </div>
  );
}

/* ========================= READING PANE ========================= */

function ReadingPane({
  email,
  onReply,
}: {
  email: EmailRow;
  onReply: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Subject header */}
      <div className="px-5 py-3 border-b border-black/10 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[18px] font-semibold text-[#1b1b1b] truncate">
              {email.important && (
                <span className="text-red-600 mr-1">❗</span>
              )}
              {email.subject}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Avatar color={email.avatar} initial={email.fromInitial} size="lg" />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[#1b1b1b]">
                  {email.fromName}{" "}
                  <span className="text-[#605e5c] font-normal">
                    &lt;{email.fromEmail}&gt;
                  </span>
                </div>
                <div className="text-[11px] text-[#605e5c] truncate">
                  To: {email.to} · {email.time}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ReadBtn label="↩ Reply" onClick={onReply} />
            <ReadBtn label="↪ Forward" />
            <ReadBtn label="🗑" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-5 py-5 whitespace-pre-wrap text-[14px] leading-6 text-[#1b1b1b] font-sans">
        {email.body}
      </div>

      {/* Footer — quick-reply row */}
      <div className="px-5 py-3 border-t border-black/10 bg-[#faf9f8] flex items-center gap-2">
        <button
          onClick={onReply}
          className="px-4 py-1.5 bg-[#0078D4] text-white text-[13px] rounded-sm hover:brightness-110 transition"
        >
          ↩ Reply
        </button>
        <button className="px-3 py-1.5 text-[13px] text-[#1b1b1b] hover:bg-black/5 rounded-sm">
          ↪ Forward
        </button>
      </div>
    </div>
  );
}

/* ========================= UI BITS ========================= */

function RibbonBtn({
  label,
  primary,
  active,
  onClick,
  disabled,
}: {
  label: string;
  primary?: boolean;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 text-[12px] rounded-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
        primary
          ? "bg-[#0078D4] text-white hover:brightness-110 font-semibold"
          : active
            ? "bg-[#e1efff] text-[#0078D4]"
            : "text-[#1b1b1b] hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}

function FolderRow({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  count?: number | string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1 rounded-sm text-[12px] text-left transition ${
        active
          ? "bg-[#cfe4fb] text-[#0078D4] font-semibold"
          : "text-[#1b1b1b] hover:bg-black/5"
      }`}
    >
      <span className="w-4 text-center text-[13px]">{icon}</span>
      <span className="truncate">{label}</span>
      {count !== undefined && count !== 0 && (
        <span
          className={`ml-auto text-[10px] ${
            active ? "text-[#0078D4] font-semibold" : "text-[#605e5c]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Avatar({
  color,
  initial,
  size = "sm",
}: {
  color: string;
  initial: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-10 h-10 text-[15px]" : "w-8 h-8 text-[12px]";
  return (
    <span
      className={`flex-none inline-flex items-center justify-center rounded-full text-white font-bold ${dim}`}
      style={{ background: color }}
    >
      {initial}
    </span>
  );
}

function ComposeField({
  label,
  readOnly,
  children,
}: {
  label: string;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-3 py-1.5 border-b border-black/10 ${
        readOnly ? "bg-[#faf9f8]" : ""
      }`}
    >
      <span className="w-16 text-[11px] tracking-[0.12em] uppercase text-[#605e5c] flex-none">
        {label}
      </span>
      <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
        {children}
      </div>
    </div>
  );
}

function ReadBtn({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-[12px] text-[#1b1b1b] hover:bg-black/5 rounded-sm transition"
    >
      {label}
    </button>
  );
}

function SearchBox() {
  return (
    <div className="hidden md:flex items-center gap-1 px-2 h-6 rounded-sm bg-white/15 text-white/90 text-[11px] min-w-[260px]">
      <span>🔍</span>
      <span className="text-white/75">Search</span>
    </div>
  );
}

function UserAvatar({ initial }: { initial: string }) {
  return (
    <span className="w-6 h-6 rounded-full bg-white text-[#0078D4] text-[11px] font-bold inline-flex items-center justify-center">
      {initial}
    </span>
  );
}

function OutlookLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="3" fill="#ffffff" opacity="0.08" />
      {/* White O */}
      <ellipse
        cx="9"
        cy="12"
        rx="4"
        ry="5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      {/* Envelope peek */}
      <rect
        x="13.5"
        y="9"
        width="7"
        height="6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
      />
      <path
        d="M 13.5 9 L 17 12 L 20.5 9"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ========================= SEND TRANSITION ========================= */
/* Full-pane overlay that plays a realistic SMTP handshake log while
   sending, then swaps to an animated checkmark + "message sent"
   confirmation with a "Send another" reset button. */

function SendTransition({
  status,
  recipientName,
  recipientEmail,
  fromEmail,
  onReset,
}: {
  status: Status;
  recipientName: string;
  recipientEmail: string;
  fromEmail: string;
  onReset: () => void;
}) {
  const [visibleLines, setVisibleLines] = useState(0);

  const logLines = [
    "→ Connecting to smtp.s.com.do:587 …",
    "← 220 smtp.s.com.do ESMTP Postfix (Ubuntu) ready",
    "→ EHLO portfolio.s.com.do",
    "← 250-STARTTLS 250 AUTH PLAIN LOGIN",
    "→ STARTTLS",
    "← 220 2.0.0 Ready to start TLS",
    "🔒 TLS handshake complete (TLS 1.3, X25519, AES_256_GCM)",
    `→ MAIL FROM:<${fromEmail || "visitor@portfolio.s.com.do"}>`,
    "← 250 2.1.0 Ok",
    `→ RCPT TO:<${recipientEmail}>`,
    "← 250 2.1.5 Ok",
    "→ DATA",
    "← 354 End data with <CR><LF>.<CR><LF>",
    "… transmitting message body …",
    "← 250 2.0.0 Ok: queued as 7F3A2C1D9B",
    "→ QUIT",
    "← 221 2.0.0 Bye",
  ];

  // Reveal log lines one-by-one while status === "sending"
  useEffect(() => {
    if (status !== "sending") return;
    setVisibleLines(0);
    const id = setInterval(() => {
      setVisibleLines((n) => Math.min(n + 1, logLines.length));
    }, 90);
    return () => clearInterval(id);
  }, [status, logLines.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white"
    >
      {status === "sending" && (
        <motion.div
          key="sending"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-[580px] px-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-full border-2 border-[#0078D4] border-t-transparent animate-spin" />
            <div>
              <div className="text-[15px] font-semibold text-[#1b1b1b]">
                Sending message…
              </div>
              <div className="text-[12px] text-[#605e5c]">
                Relaying via <span className="font-mono">smtp.s.com.do</span>
              </div>
            </div>
          </div>

          {/* SMTP log ticker */}
          <div className="rounded-md border border-black/10 bg-[#0c0c0f] text-[#c5d2e0] font-mono text-[11.5px] leading-[1.55] p-3 h-[240px] overflow-hidden shadow-inner">
            <div className="text-[10px] text-[#6b7a8a] mb-1 tracking-[0.2em] uppercase">
              SMTP session — smtp.s.com.do:587
            </div>
            {logLines.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith("→")
                    ? "text-[#78b4ff]"
                    : line.startsWith("←")
                      ? "text-[#8dd58a]"
                      : line.startsWith("🔒")
                        ? "text-[#ffd27a]"
                        : "text-[#c5d2e0]/70"
                }
              >
                {line}
              </div>
            ))}
            {visibleLines < logLines.length && (
              <span className="inline-block w-2 h-[14px] bg-[#78b4ff] align-middle animate-pulse ml-0.5" />
            )}
          </div>

          {/* Thin progress bar */}
          <div className="mt-3 h-1 rounded-full bg-black/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(visibleLines / logLines.length) * 100}%`,
              }}
              transition={{ ease: "linear", duration: 0.15 }}
              className="h-full bg-[#0078D4]"
            />
          </div>
        </motion.div>
      )}

      {status === "sent" && (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center px-6"
        >
          {/* Animated check ring */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600
                       shadow-[0_8px_32px_rgba(16,185,129,0.45)]
                       flex items-center justify-center"
          >
            <svg width="54" height="54" viewBox="0 0 48 48" aria-hidden>
              <motion.path
                d="M 10 25 L 21 35 L 39 14"
                fill="none"
                stroke="#ffffff"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-5 text-[22px] font-semibold text-[#1b1b1b]"
          >
            Message sent
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-1 text-[13px] text-[#605e5c] max-w-sm mx-auto"
          >
            Your message is on its way to <b>{recipientName}</b>.
            <br />
            Relayed via <span className="font-mono">smtp.s.com.do</span> · queue
            id <span className="font-mono text-[#0078D4]">7F3A2C1D9B</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.3 }}
            className="mt-6 flex items-center justify-center gap-2"
          >
            <button
              onClick={onReset}
              className="px-5 py-2 bg-[#0078D4] text-white text-[13px] rounded-sm font-semibold
                         hover:brightness-110 transition shadow-sm"
            >
              ＋ Send another
            </button>
            <Link
              href="/hypervisor"
              className="px-4 py-2 text-[13px] text-[#1b1b1b] rounded-sm hover:bg-black/5 transition"
            >
              Back to Hypervisor
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ========================= MY DAY / CALENDAR PANE ========================= */
/* Outlook "My Day" style right pane — today's date header, mini month
   peek, and an agenda of meetings that fit Joaquin's Virtualization &
   Cloud Architect role. */

type Meeting = {
  time: string;
  durationMin: number;
  title: string;
  organizer: string;
  location?: string;
  tag: "standup" | "one-on-one" | "review" | "vendor" | "exec" | "focus";
  teams?: boolean;
};

const TAG_COLOR: Record<Meeting["tag"], string> = {
  standup: "#0078D4",
  "one-on-one": "#2aa160",
  review: "#8a4fff",
  vendor: "#ff7a3d",
  exec: "#c43b5b",
  focus: "#605e5c",
};

const TODAY_MEETINGS: Meeting[] = [
  {
    time: "8:30 AM",
    durationMin: 15,
    title: "AVD Daily Standup",
    organizer: "Virt-Eng DL",
    location: "MS Teams",
    tag: "standup",
    teams: true,
  },
  {
    time: "9:00 AM",
    durationMin: 30,
    title: "1:1 with Kevin M.",
    organizer: "Kevin M.",
    location: "MS Teams",
    tag: "one-on-one",
    teams: true,
  },
  {
    time: "10:00 AM",
    durationMin: 60,
    title: "AVD Capacity Review — weekly",
    organizer: "Petr N.",
    location: "MS Teams",
    tag: "review",
    teams: true,
  },
  {
    time: "11:30 AM",
    durationMin: 30,
    title: "Change Advisory Board — East-2 patch window",
    organizer: "CAB Coordinator",
    location: "MS Teams",
    tag: "review",
    teams: true,
  },
  {
    time: "12:30 PM",
    durationMin: 60,
    title: "Focus · Cost report for exec review",
    organizer: "Joaquin (self)",
    tag: "focus",
  },
  {
    time: "2:00 PM",
    durationMin: 60,
    title: "Nerdio Quarterly Business Review",
    organizer: "Nerdio CSM",
    location: "MS Teams",
    tag: "vendor",
    teams: true,
  },
  {
    time: "3:15 PM",
    durationMin: 45,
    title: "Azure Reservation Renewal · Finance sync",
    organizer: "Procurement",
    location: "MS Teams",
    tag: "review",
    teams: true,
  },
  {
    time: "4:30 PM",
    durationMin: 30,
    title: "Peer sync — West-2 cutover (Ed R.)",
    organizer: "Ed R.",
    location: "MS Teams",
    tag: "one-on-one",
    teams: true,
  },
  {
    time: "5:15 PM",
    durationMin: 30,
    title: "FY27 Capacity Forecast review",
    organizer: "Jaya R.",
    location: "MS Teams",
    tag: "exec",
    teams: true,
  },
];

function CalendarPane() {
  const now = new Date();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const weekday = dayLabels[now.getDay()];
  const day = now.getDate();
  const month = monthLabels[now.getMonth()];

  // Mini month grid (6 rows x 7 cols = 42 cells), starts on Sunday.
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  return (
    <aside className="hidden lg:flex flex-col border-l border-black/10 bg-[#faf9f8]">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-black/10">
        <div className="text-[11px] tracking-[0.2em] uppercase text-[#605e5c]">
          My Day
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <div className="text-[20px] font-semibold text-[#1b1b1b] leading-none">
            {weekday}, {month.slice(0, 3)} {day}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-[#605e5c]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {TODAY_MEETINGS.length} meetings
          </span>
          <span>·</span>
          <span>
            {TODAY_MEETINGS.filter((m) => m.teams).length} on Teams
          </span>
        </div>
      </div>

      {/* Mini month */}
      <div className="px-4 py-3 border-b border-black/10">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[12px] font-semibold text-[#1b1b1b]">
            {month} {now.getFullYear()}
          </div>
          <div className="flex items-center gap-1 text-[#605e5c] text-[11px]">
            <span className="cursor-pointer hover:text-[#0078D4]">‹</span>
            <span className="cursor-pointer hover:text-[#0078D4]">›</span>
          </div>
        </div>
        <div className="grid grid-cols-7 text-[9px] tracking-wider text-[#605e5c] mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 text-[10px]">
          {Array.from({ length: 42 }).map((_, i) => {
            const cellDay = i - startOffset + 1;
            const inMonth = cellDay >= 1 && cellDay <= daysInMonth;
            const isToday = inMonth && cellDay === day;
            return (
              <div
                key={i}
                className={`h-6 flex items-center justify-center rounded-full text-center ${
                  !inMonth
                    ? "text-[#c8c6c4]"
                    : isToday
                      ? "bg-[#0078D4] text-white font-semibold"
                      : "text-[#1b1b1b] hover:bg-black/5 cursor-default"
                }`}
              >
                {inMonth ? cellDay : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda */}
      <div className="px-4 pt-3 pb-4 flex-1 overflow-auto">
        <div className="text-[11px] tracking-[0.2em] uppercase text-[#605e5c] mb-2">
          Agenda
        </div>
        <ul className="space-y-1.5">
          {TODAY_MEETINGS.map((m, i) => (
            <li
              key={i}
              className="group flex gap-2 rounded-sm bg-white border border-black/10 hover:border-[#0078D4]/40 hover:shadow-sm transition p-2 cursor-default"
            >
              <span
                className="w-1 rounded-full flex-none"
                style={{ background: TAG_COLOR[m.tag] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#1b1b1b] tabular-nums">
                    {m.time}
                  </span>
                  <span className="text-[10px] text-[#605e5c] whitespace-nowrap">
                    {m.durationMin}m
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-[#1b1b1b] font-medium leading-snug truncate">
                  {m.title}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#605e5c]">
                  {m.teams && (
                    <span className="inline-flex items-center gap-1 text-[#6264A7] font-semibold">
                      <TeamsMark /> Teams
                    </span>
                  )}
                  {m.teams && <span>·</span>}
                  <span className="truncate">{m.organizer}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-black/10 text-[10px] text-[#605e5c] leading-5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Free/busy synced · exchange.s.com.do
          </div>
        </div>
      </div>
    </aside>
  );
}

function TeamsMark() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="3" fill="#6264A7" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
      >
        T
      </text>
    </svg>
  );
}
