"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Skill = { name: string; level: number; category: string };

/**
 * Skills VM presents as **btop++** running in a terminal. Each category
 * renders as a bordered panel with skill bars; below, a process-list
 * style table shows all skills sorted by "CPU usage" (skill level).
 */
export function SkillsDesktop({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const totalAvg = Math.round(
    skills.reduce((s, x) => s + x.level, 0) / skills.length,
  );

  return (
    <div className="h-full w-full p-3 md:p-6 flex items-start justify-center overflow-auto">
      <TerminalWindow title="btop ── jsanchez@debian-skills-01 ── ~">
        <div className="font-mono text-[11.5px] leading-[16px] text-[#d0d7de] p-3 md:p-4">
          {/* Top stat strip */}
          <TopStrip avg={totalAvg} />

          {/* Category panels */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(grouped).map(([cat, items]) => (
              <CategoryPanel
                key={cat}
                title={cat}
                items={items}
                accent={colorForCategory(cat)}
              />
            ))}
          </div>

          {/* Process list */}
          <ProcessList skills={skills} />

          {/* Footer hint bar */}
          <FooterBar />
        </div>
      </TerminalWindow>
    </div>
  );
}

/* =================== Terminal window chrome =================== */

function TerminalWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full max-w-5xl rounded-lg overflow-hidden border border-black/60 shadow-2xl bg-[#0d1117]"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.65)" }}
    >
      <div className="h-10 flex items-center px-3 bg-[#161b22] border-b border-black/60">
        <div className="flex items-center gap-2">
          <Link
            href="/hypervisor"
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition"
            aria-label="Close"
          />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center text-[13px] text-white/70 truncate">
          {title}
        </div>
        <div className="w-16" />
      </div>
      {children}
    </div>
  );
}

/* =================== Top strip (CPU/MEM/NET/SESSIONS) =================== */

function TopStrip({ avg }: { avg: number }) {
  const [clock, setClock] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map((n) => String(n).padStart(2, "0"))
          .join(":"),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <PanelBox color="#51a2da" title="cpu" hint={`avg ${avg}%`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1">
        <MiniStat
          label="cpu"
          value={`${avg}%`}
          bar={avg}
          color="#51a2da"
        />
        <MiniStat label="mem" value="61%" bar={61} color="#e0af68" />
        <MiniStat label="net↑" value="2.3 MB/s" bar={42} color="#9ece6a" />
        <MiniStat label="up" value="512d 22h" bar={99} color="#bb9af7" />
      </div>
      <div className="mt-1.5 text-[10.5px] text-white/50">
        host: debian-skills-01 &nbsp;·&nbsp; kernel 6.1.0-28 &nbsp;·&nbsp;{" "}
        <span className="text-white/80">{clock}</span>
      </div>
    </PanelBox>
  );
}

function MiniStat({
  label,
  value,
  bar,
  color,
}: {
  label: string;
  value: string;
  bar: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/50 w-10">{label}</span>
      <BarLine pct={bar} color={color} width={60} />
      <span className="text-white/90">{value}</span>
    </div>
  );
}

/* =================== Category panels =================== */

function CategoryPanel({
  title,
  items,
  accent,
}: {
  title: string;
  items: Skill[];
  accent: string;
}) {
  return (
    <PanelBox title={title.toLowerCase()} color={accent}>
      <div className="space-y-1">
        {items.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-[1px] flex-none"
              style={{ background: accent }}
            />
            <span className="flex-1 text-white/85 truncate">{s.name}</span>
            <BarLine pct={s.level} color={accent} width={80} />
            <span className="text-white/95 w-9 text-right">
              {s.level}%
            </span>
          </div>
        ))}
      </div>
    </PanelBox>
  );
}

function PanelBox({
  title,
  hint,
  color,
  children,
}: {
  title: string;
  hint?: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded border bg-[#0f1620]/90 relative"
      style={{ borderColor: `${color}55` }}
    >
      {/* Titlebar */}
      <div
        className="absolute -top-[9px] left-3 px-1.5 text-[10.5px] font-semibold uppercase tracking-widest bg-[#0d1117]"
        style={{ color }}
      >
        ─ {title} ─
      </div>
      {hint && (
        <div className="absolute -top-[9px] right-3 px-1.5 text-[10px] text-white/50 bg-[#0d1117]">
          {hint}
        </div>
      )}
      <div className="p-3 pt-4">{children}</div>
    </div>
  );
}

/* =================== Process list =================== */

function ProcessList({ skills }: { skills: Skill[] }) {
  const sorted = [...skills].sort((a, b) => b.level - a.level);
  return (
    <PanelBox title="proc" color="#9ece6a" hint={`${skills.length} skills`}>
      <div className="text-[10.5px]">
        <div className="grid grid-cols-[44px_1fr_120px_70px_70px] gap-2 text-white/45 pb-1 border-b border-white/10">
          <span>pid</span>
          <span>name</span>
          <span>category</span>
          <span className="text-right">cpu%</span>
          <span className="text-right">mem%</span>
        </div>
        {sorted.map((s, i) => (
          <div
            key={s.name}
            className="grid grid-cols-[44px_1fr_120px_70px_70px] gap-2 py-[2px] hover:bg-white/5"
          >
            <span className="text-white/40">{String(1337 + i).padEnd(4)}</span>
            <span
              className="text-white/90 truncate"
              style={{ color: colorForCategory(s.category) }}
            >
              {s.name}
            </span>
            <span className="text-white/55 truncate">{s.category}</span>
            <span className="text-right text-white/90">{s.level}.0</span>
            <span className="text-right text-white/70">
              {Math.max(1, Math.round(s.level * 0.42))}.0
            </span>
          </div>
        ))}
      </div>
    </PanelBox>
  );
}

/* =================== Bar + footer =================== */

function BarLine({
  pct,
  color,
  width,
}: {
  pct: number;
  color: string;
  width: number;
}) {
  return (
    <div
      className="relative h-1.5 bg-white/10 rounded-sm overflow-hidden flex-none"
      style={{ width }}
    >
      <div
        className="h-full rounded-sm"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(to right, ${color}, ${color}aa)`,
          boxShadow: `0 0 6px ${color}88`,
        }}
      />
    </div>
  );
}

function FooterBar() {
  const keys: Array<[string, string]> = [
    ["F1", "help"],
    ["F2", "opts"],
    ["F3", "find"],
    ["F4", "filter"],
    ["F5", "tree"],
    ["F9", "kill"],
    ["F10", "quit"],
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-white/55 border-t border-white/10 pt-2">
      {keys.map(([k, v]) => (
        <span key={k}>
          <span className="text-[#51a2da]">{k}</span> {v}
        </span>
      ))}
      <span className="ml-auto text-white/40">
        btop++ v1.4.0 &middot; jsanchez@debian-skills-01
      </span>
    </div>
  );
}

/* =================== Colors =================== */

function colorForCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (c.startsWith("core")) return "#51a2da"; // blue
  if (c.includes("cloud")) return "#e0af68"; // amber
  if (c.includes("security")) return "#f7768e"; // rose
  if (c.includes("ai")) return "#bb9af7"; // violet
  return "#9ece6a"; // green fallback
}
