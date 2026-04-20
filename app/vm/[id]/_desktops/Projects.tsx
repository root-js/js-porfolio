"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Project = {
  name: string;
  summary: string;
  outcomes: string[];
};

/**
 * Projects "desktop" is now an Azure Cloud Shell terminal. The user
 * appears to be typing `az` commands that list their resource groups
 * (projects) and describe them.
 */
export function ProjectsDesktop({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState(0);
  const active = projects[selected];

  return (
    <div className="h-full w-full p-4 md:p-8 flex items-start justify-center overflow-auto">
      <div
        className="w-full max-w-5xl rounded-lg overflow-hidden border border-black/60 shadow-2xl"
        style={{
          background: "#1f1f1f",
          boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
        }}
      >
        {/* Title bar — Ubuntu terminal style */}
        <div className="h-10 flex items-center px-3 bg-[#2b2b2b] border-b border-black/60">
          <div className="flex items-center gap-2">
            <CloseDot color="#ff5f57" href="/hypervisor" />
            <CircleDot color="#febc2e" />
            <CircleDot color="#28c840" />
          </div>
          <div className="flex-1 text-center text-[13px] text-white/70">
            joaquin@azcli-projects-01: ~/projects
          </div>
          <div className="w-16" />
        </div>

        {/* Split: terminal + detail pane */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
          <TerminalPane
            projects={projects}
            selected={selected}
            onSelect={setSelected}
          />
          <ProjectDetail
            project={active}
            index={selected}
            total={projects.length}
            onPrev={() =>
              setSelected((i) => (i - 1 + projects.length) % projects.length)
            }
            onNext={() => setSelected((i) => (i + 1) % projects.length)}
          />
        </div>
      </div>
    </div>
  );
}

function TerminalPane({
  projects,
  selected,
  onSelect,
}: {
  projects: Project[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const lines = useMemo(
    () => buildBootLines(projects, selected),
    [projects, selected],
  );
  return (
    <div className="p-4 font-mono text-[12px] text-white/85 bg-[#111]">
      {/* Ubuntu MOTD banner — shows the farm's scale */}
      <Motd />

      {lines.map((l, i) => (
        <Line key={i} {...l} />
      ))}

      {/* Interactive row: select a project */}
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="text-white/50 mb-1">
          <span className="text-emerald-400">$</span>{" "}
          <span className="text-blue-400">az</span> group show --name{" "}
          <span className="text-yellow-300">
            &lt;pick-one&gt;
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {projects.map((p, i) => (
            <button
              key={p.name}
              onClick={() => onSelect(i)}
              className={`px-3 py-1 text-[11px] rounded border transition ${
                i === selected
                  ? "bg-[#0078d4] border-[#0078d4] text-white"
                  : "bg-white/5 border-white/20 text-white/80 hover:border-[#0078d4]/70 hover:text-white"
              }`}
            >
              rg-{slug(p.name)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectDetail({
  project,
  index,
  total,
  onPrev,
  onNext,
}: {
  project: Project;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <aside className="border-l border-white/10 bg-[#1a1a1a] p-5 text-white/90 font-sans">
      <div className="text-[10px] tracking-[0.3em] text-[#4db0ff] font-mono">
        PROJECT {String(index + 1).padStart(2, "0")} /{" "}
        {String(total).padStart(2, "0")}
      </div>
      <h2 className="text-xl font-semibold mt-1 text-white">
        {project.name}
      </h2>
      <p className="text-[13px] text-white/80 mt-3 leading-6">
        {project.summary}
      </p>

      <div className="mt-5 text-[10px] tracking-[0.3em] text-[#4db0ff] font-mono">
        OUTCOMES
      </div>
      <ul className="mt-2 space-y-1.5 text-[13px]">
        {project.outcomes.map((o) => (
          <li key={o} className="flex gap-2">
            <span className="text-[#4db0ff] mt-0.5">▸</span>
            <span className="text-white/90">{o}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between text-xs font-mono">
        <button
          onClick={onPrev}
          className="px-3 py-1.5 border border-white/20 hover:border-[#4db0ff]/70 hover:text-[#4db0ff] transition"
        >
          ◀ PREV
        </button>
        <div className="text-white/50">
          {index + 1} / {total}
        </div>
        <button
          onClick={onNext}
          className="px-3 py-1.5 border border-white/20 hover:border-[#4db0ff]/70 hover:text-[#4db0ff] transition"
        >
          NEXT ▶
        </button>
      </div>
    </aside>
  );
}

type Line =
  | { kind: "prompt"; cmd: string }
  | { kind: "out"; text: string; color?: string }
  | { kind: "spacer" };

function buildBootLines(projects: Project[], selected: number): Line[] {
  const p = projects[selected];
  const rgName = `rg-${slug(p.name)}`;
  const out: Line[] = [
    {
      kind: "prompt",
      cmd: "az login --identity",
    },
    { kind: "out", text: "[" },
    {
      kind: "out",
      text: '  {\n    "cloudName": "AzureCloud",\n    "user": { "name": "jsanchez", "type": "user" }\n  }',
    },
    { kind: "out", text: "]" },
    { kind: "spacer" },
    { kind: "prompt", cmd: "az account show --query name -o tsv" },
    { kind: "out", text: "MRK-AVD-PROD-01" },
    { kind: "spacer" },
    {
      kind: "prompt",
      cmd: "az group list --query \"[].{name:name, location:location}\" -o table",
    },
    { kind: "out", text: "Name                        Location" },
    { kind: "out", text: "--------------------------  ----------" },
    ...projects.map((pp) => ({
      kind: "out" as const,
      text: `rg-${slug(pp.name).padEnd(24, " ")}  ${region(pp.name)}`,
    })),
    { kind: "spacer" },
    {
      kind: "prompt",
      cmd: `az group show --name ${rgName} --query "properties" -o jsonc`,
    },
    { kind: "out", text: `{` },
    {
      kind: "out",
      text: `  "project":        "${p.name}",`,
    },
    {
      kind: "out",
      text: `  "status":         "completed",`,
    },
    {
      kind: "out",
      text: `  "users_impacted": "20000+",`,
    },
    {
      kind: "out",
      text: `  "owner":          "jsanchez"`,
    },
    { kind: "out", text: `}` },
    { kind: "spacer" },
  ];
  return out;
}

function Motd() {
  return (
    <div className="mb-3 pb-3 border-b border-white/10 text-white/80 leading-[18px]">
      <div className="text-white">
        Welcome to Ubuntu 22.04.3 LTS{" "}
        <span className="text-white/50">
          (GNU/Linux 6.1.0-28-cloud-amd64 x86_64)
        </span>
      </div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <div>
          <span className="text-white/50">System load:</span>{" "}
          <span className="text-emerald-300">0.42</span>
          <span className="ml-4 text-white/50">Users supported:</span>{" "}
          <span className="text-white">20,142</span>
        </div>
        <div>
          <span className="text-white/50">Memory usage:</span>{" "}
          <span className="text-white">61%</span>
          <span className="ml-4 text-white/50">Azure regions:</span>{" "}
          <span className="text-white">4</span>
        </div>
        <div>
          <span className="text-white/50">Disk usage:</span>{" "}
          <span className="text-white">28%</span>
          <span className="ml-4 text-white/50">VDI host pools:</span>{" "}
          <span className="text-white">38</span>
        </div>
        <div>
          <span className="text-white/50">Processes:</span>{" "}
          <span className="text-white">214</span>
          <span className="ml-4 text-white/50">Tenant:</span>{" "}
          <span className="text-white">Merck &amp; Co., Inc</span>
        </div>
      </div>
      <div className="mt-2 text-white/50">
        Last login:{" "}
        {new Date().toLocaleString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        from 10.20.0.47
      </div>
    </div>
  );
}

function Line(l: Line) {
  if (l.kind === "spacer") return <div className="h-2" />;
  if (l.kind === "prompt")
    return (
      <div className="whitespace-pre-wrap">
        <span className="text-emerald-400">joaquin@azcli</span>
        <span className="text-white/50">:</span>
        <span className="text-blue-400">~/projects</span>
        <span className="text-white/50">$</span>{" "}
        <span className="text-white">{highlightCmd(l.cmd)}</span>
      </div>
    );
  return (
    <div
      className="whitespace-pre-wrap text-white/75"
      style={{ color: l.color }}
    >
      {l.text}
    </div>
  );
}

function highlightCmd(cmd: string) {
  // Simple highlight: `az` blue, flags dim, quoted strings yellow.
  const parts = cmd.split(/(\s+)/);
  return parts.map((part, i) => {
    if (part === "az") return <span key={i} className="text-blue-400">az</span>;
    if (part.startsWith("--")) return <span key={i} className="text-white/55">{part}</span>;
    if (part.startsWith('"') && part.endsWith('"'))
      return <span key={i} className="text-yellow-300">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function region(s: string) {
  const h = [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = ["eastus2", "westus2", "northeurope", "eastasia"];
  return r[h % r.length];
}

function CircleDot({ color }: { color: string }) {
  return (
    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
  );
}

function CloseDot({ color, href }: { color: string; href: string }) {
  return (
    <Link
      href={href}
      className="w-3 h-3 rounded-full hover:brightness-125 transition"
      style={{ background: color }}
      aria-label="Close"
    />
  );
}
