"use client";

// Tailwind safelist — dynamic col-span values used by <PaneCard> / <SummaryTile>:
// md:col-span-3 md:col-span-4 md:col-span-5 md:col-span-6 md:col-span-7 md:col-span-8 md:col-span-12

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  vms,
  profile,
  homelab,
  plexLibrary,
  books,
  type VmId,
  type PlexItem,
  type BookItem,
} from "@/lib/content";

type Tab =
  | "Summary"
  | "Console"
  | "Hardware"
  | "Cloud-Init"
  | "Options"
  | "Task History"
  | "Monitor"
  | "Backup"
  | "Replication"
  | "Snapshots"
  | "Firewall"
  | "Permissions";

const VM_TABS: Tab[] = [
  "Summary",
  "Console",
  "Hardware",
  "Cloud-Init",
  "Options",
  "Task History",
  "Monitor",
  "Backup",
  "Replication",
  "Snapshots",
  "Firewall",
  "Permissions",
];

export default function HypervisorPage() {
  // selectedId is a string to accept either a VmId ("about-me") or a
  // homelab tag ("home-<vmid>").
  const [selectedId, setSelectedId] = useState<string>(vms[0].id);
  const [tab, setTab] = useState<Tab>("Summary");
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  // Mobile-only: sidebar is a drawer, hidden by default.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const [taskLogOpen, setTaskLogOpen] = useState(true);

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

  const selectedHomelab = homelab.find(
    (h) => `home-${h.vmid}` === selectedId,
  );
  const selectedVm = vms.find((v) => v.id === selectedId);
  // Fallback: always render against a VM for the Merck-env pane so the
  // existing markup never sees `undefined`. If a homelab item is selected,
  // we render HomelabDetail instead and short-circuit.
  const selected = selectedVm ?? vms[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="h-screen w-full flex flex-col bg-[#111418] text-zinc-200 font-sans text-[13px] overflow-hidden"
    >
      {/* ============ PVE Header Bar ============ */}
      <header className="h-[46px] flex items-center justify-between px-2 md:px-3 bg-[#1b1e23] border-b border-black/40 flex-none">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle server view"
            className="md:hidden w-8 h-8 flex flex-col items-center justify-center gap-[3px] rounded hover:bg-white/10"
          >
            <span className="block w-4 h-[2px] bg-zinc-200" />
            <span className="block w-4 h-[2px] bg-zinc-200" />
            <span className="block w-4 h-[2px] bg-zinc-200" />
          </button>
          <ProxmoxLogo />
          <div className="text-[13px] text-zinc-300 hidden md:block">
            Virtual Environment{" "}
            <span className="text-zinc-500">9.1-3</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[12px] text-zinc-400">
            <span>Search:</span>
            <span className="inline-block bg-black/40 px-3 py-[3px] rounded border border-zinc-700 min-w-[220px] text-zinc-500">
              type to search...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <HeaderBtn label="Documentation" hiddenOnMobile />
          <HeaderBtn label="Create VM" primary hiddenOnMobile />
          <HeaderBtn label="Create CT" hiddenOnMobile />
          <div className="hidden sm:block px-3 text-[12px] text-zinc-300 border-l border-zinc-700 ml-1">
            {profile.handle.toLowerCase()}@pam
          </div>
          <Link
            href="/"
            className="px-2 md:px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-black/40"
          >
            Logout
          </Link>
          <span className="hidden sm:inline px-2 text-[12px] text-zinc-500 font-mono">
            {clock}
          </span>
        </div>
      </header>

      {/* ============ Body ============ */}
      <div className="flex-1 min-h-0 flex relative">
        {/* Mobile backdrop when drawer is open */}
        {sidebarOpen && (
          <div
            className="md:hidden absolute inset-0 z-20 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar — static on desktop, drawer on mobile */}
        <aside
          className={`w-[280px] md:w-[320px] flex-none bg-[#171a1f] border-r border-black/40 flex flex-col min-h-0 absolute md:static inset-y-0 left-0 z-30 transition-transform md:transition-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="px-3 py-2 text-[12px] text-zinc-400 bg-[#1b1e23] border-b border-black/40 flex items-center justify-between">
            <span>Server View</span>
            <span className="text-zinc-600">▾</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            {/* =========== Datacenter 1: Merck Environment =========== */}
            <DatacenterHomeLink label="Datacenter (Merck Environment)" />
            <TreeRow
              icon={<IconNode active />}
              label="pve-east-01"
              depth={1}
              subLabel="us-east-2"
            />
            {vms.map((v, i) => (
              <TreeRow
                key={v.id}
                icon={<IconVM running />}
                label={`${100 + i + 1} (${v.name})`}
                depth={2}
                selected={v.id === selectedId}
                onClick={() => {
                  setSelectedId(v.id);
                  setTab("Summary");
                  setSidebarOpen(false);
                }}
              />
            ))}
            <TreeRow
              icon={<IconStorage />}
              label="local (pve-east-01)"
              depth={2}
              muted
            />
            <TreeRow
              icon={<IconStorage />}
              label="local-zfs (pve-east-01)"
              depth={2}
              muted
            />
            <TreeRow
              icon={<IconNode />}
              label="pve-west-02"
              depth={1}
              subLabel="us-west-2"
              muted
            />
            <TreeRow
              icon={<IconNode />}
              label="pve-eu-03"
              depth={1}
              subLabel="eu-north-1"
              muted
            />
            <TreeRow
              icon={<IconNode />}
              label="pve-apac-04"
              depth={1}
              subLabel="apac-southeast-1"
              muted
            />

            {/* =========== Datacenter 2: Homelab (mockup) =========== */}
            <div className="mt-4 mb-1">
              <DatacenterRow label="Datacenter (Homelab)" />
            </div>

            {/* pfSense VM sits at the network perimeter (above the node) */}
            {homelab
              .filter((h) => h.name === "pfsense")
              .map((h) => (
                <HomelabTreeRow
                  key={h.vmid}
                  item={h}
                  depth={1}
                  selected={selectedId === `home-${h.vmid}`}
                  onClick={() => {
                    setSelectedId(`home-${h.vmid}`);
                    setTab("Summary");
                    setSidebarOpen(false);
                  }}
                  onHover={setTooltip}
                />
              ))}

            <TreeRow
              icon={<IconNode active />}
              label="pve-homelab-01"
              depth={1}
              subLabel="home"
            />

            {/* LXC + other VM entries under the node */}
            {homelab
              .filter(
                (h) =>
                  (h.kind === "lxc" || h.kind === "vm") &&
                  h.name !== "pfsense",
              )
              .map((h) => (
                <HomelabTreeRow
                  key={h.vmid}
                  item={h}
                  depth={2}
                  selected={selectedId === `home-${h.vmid}`}
                  onClick={() => {
                    setSelectedId(`home-${h.vmid}`);
                    setTab("Summary");
                    setSidebarOpen(false);
                  }}
                  onHover={setTooltip}
                />
              ))}

            {/* Dockers nested under docker-host */}
            {homelab
              .filter((h) => h.kind === "docker")
              .map((h) => (
                <HomelabTreeRow
                  key={h.vmid}
                  item={h}
                  depth={3}
                  selected={selectedId === `home-${h.vmid}`}
                  onClick={() => {
                    setSelectedId(`home-${h.vmid}`);
                    setTab("Summary");
                    setSidebarOpen(false);
                  }}
                  onHover={setTooltip}
                />
              ))}

            <TreeRow
              icon={<IconStorage />}
              label="local-zfs (pve-homelab-01)"
              depth={2}
              muted
            />
          </div>

          {/* Floating tooltip rendered outside the sidebar to avoid clipping */}
          {tooltip && (
            <div
              className="fixed z-[1000] px-3 py-2 bg-[#0f1217]/95 border border-white/15 rounded text-[11.5px] text-zinc-100 shadow-2xl pointer-events-none max-w-[260px] leading-snug backdrop-blur"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.text}
            </div>
          )}
        </aside>

        {/* Detail pane */}
        <main className="flex-1 min-w-0 flex flex-col bg-[#1b1e23]">
          {/* Breadcrumb — differs when a homelab item is selected */}
          <div className="px-4 py-2 text-[12px] text-zinc-400 bg-[#171a1f] border-b border-black/40 flex items-center gap-2 flex-none">
            {selectedHomelab ? (
              <>
                <span className="text-zinc-500">Datacenter (Homelab)</span>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-500">pve-homelab-01</span>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-200 font-medium">
                  {selectedHomelab.kind === "lxc"
                    ? `Container ${selectedHomelab.vmid}`
                    : "Docker container"}{" "}
                  ({selectedHomelab.name})
                </span>
              </>
            ) : (
              <>
                <span className="text-zinc-500">
                  Datacenter (Merck Environment)
                </span>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-500">pve-east-01</span>
                <span className="text-zinc-600">›</span>
                <span className="text-zinc-200 font-medium">
                  Virtual Machine{" "}
                  {String(100 + vms.indexOf(selected) + 1)} ({selected.name})
                </span>
              </>
            )}
            <span className="ml-auto flex items-center gap-2">
              <BadgeRunning />
            </span>
          </div>

          {/* Actions */}
          <div className="px-4 py-2 flex items-center gap-1.5 border-b border-black/40 bg-[#14171c] flex-none">
            <ToolbarBtn label="Start" kind="green" disabled />
            <ToolbarBtn label="Shutdown" />
            <ToolbarBtn label="Reboot" />
            <Link
              href={`/vm/${selected.id}`}
              className="px-3 py-1.5 text-[12px] rounded border border-[#4a5058] bg-[#2a2f36] hover:bg-[#343a42] flex items-center gap-2"
            >
              <span className="inline-block w-2 h-2 rounded-sm bg-[#E57000]" />
              Console &gt;_
            </Link>
            <ToolbarBtn label="More ▾" />
            <div className="ml-auto flex items-center gap-2 text-[12px] text-zinc-400">
              <span>Help</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-2 flex border-b border-black/40 bg-[#1b1e23] flex-none overflow-x-auto">
            {VM_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-[12px] border-b-2 transition whitespace-nowrap ${
                  t === tab
                    ? "border-[#E57000] text-white bg-[#2a2f36]"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#22262c]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-auto p-4 bg-[#14171c]">
            {selectedHomelab ? (
              <HomelabDetail item={selectedHomelab} />
            ) : (
              <>
                {tab === "Summary" && (
                  <SummaryTab id={selectedId as VmId} />
                )}
                {tab === "Console" && (
                  <ConsoleTab id={selectedId as VmId} />
                )}
                {tab === "Hardware" && (
                  <HardwareTab id={selectedId as VmId} />
                )}
                {tab === "Options" && (
                  <OptionsTab id={selectedId as VmId} />
                )}
                {tab === "Task History" && <TaskHistoryTab />}
                {tab === "Firewall" && (
                  <FirewallTab id={selectedId as VmId} />
                )}
                {tab !== "Summary" &&
                  tab !== "Console" &&
                  tab !== "Hardware" &&
                  tab !== "Options" &&
                  tab !== "Task History" &&
                  tab !== "Firewall" && <EmptyTab name={tab} />}
              </>
            )}
          </div>

          <TaskLog
            open={taskLogOpen}
            onToggle={() => setTaskLogOpen((v) => !v)}
            selectedVm={selected.name}
          />
        </main>
      </div>
    </motion.div>
  );
}

/* =================== Header bits =================== */

function ProxmoxLogo() {
  return (
    <div className="flex items-center gap-2 pl-1">
      <div className="relative w-7 h-7 flex-none">
        <div
          className="absolute inset-0"
          style={{
            background: "#E57000",
            clipPath:
              "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />
        <div
          className="absolute inset-[5px]"
          style={{
            background: "#1b1e23",
            clipPath:
              "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />
        <div
          className="absolute inset-[8px]"
          style={{
            background: "#E57000",
            clipPath:
              "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
          }}
        />
      </div>
      <div className="text-[15px] font-semibold text-white tracking-tight">
        PROXMOX
      </div>
    </div>
  );
}

function HeaderBtn({
  label,
  primary,
  hiddenOnMobile,
}: {
  label: string;
  primary?: boolean;
  hiddenOnMobile?: boolean;
}) {
  return (
    <button
      className={`px-3 py-1.5 text-[12px] rounded border transition ${
        hiddenOnMobile ? "hidden md:inline-block" : ""
      } ${
        primary
          ? "bg-[#E57000] border-[#E57000] text-white hover:brightness-110"
          : "bg-[#2a2f36] border-[#4a5058] text-zinc-200 hover:bg-[#343a42]"
      }`}
    >
      {label}
    </button>
  );
}

function ToolbarBtn({
  label,
  kind,
  disabled,
}: {
  label: string;
  kind?: "green";
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`px-3 py-1.5 text-[12px] rounded border transition ${
        disabled
          ? "bg-[#1f232a] border-[#2a2f36] text-zinc-600 cursor-not-allowed"
          : "bg-[#2a2f36] border-[#4a5058] text-zinc-200 hover:bg-[#343a42]"
      }`}
    >
      {kind === "green" && (
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 align-middle" />
      )}
      {label}
    </button>
  );
}

function BadgeRunning() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px]">
      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
      running
    </span>
  );
}

/* =================== Sidebar tree =================== */

function DatacenterHomeLink({
  label = "Datacenter (Merck Environment)",
}: {
  label?: string;
}) {
  return (
    <Link
      href="/"
      title="Back to home"
      className="w-full text-left flex items-center gap-2 py-[5px] pr-3 text-[13px] font-medium text-zinc-200 hover:bg-[#22262c] hover:text-white transition"
      style={{ paddingLeft: "8px" }}
    >
      <span className="flex-none text-zinc-400">
        <IconDatacenter />
      </span>
      <span className="truncate">{label}</span>
      <span className="ml-auto text-[10px] text-zinc-500 tracking-widest">
        ← HOME
      </span>
    </Link>
  );
}

function DatacenterRow({ label }: { label: string }) {
  return (
    <div
      className="w-full flex items-center gap-2 py-[5px] pr-3 text-[13px] font-medium text-zinc-200"
      style={{ paddingLeft: "8px" }}
    >
      <span className="flex-none text-zinc-400">
        <IconDatacenter />
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}

function HomelabTreeRow({
  item,
  depth,
  selected,
  onClick,
  onHover,
}: {
  item: (typeof homelab)[number];
  depth: number;
  selected: boolean;
  onClick: () => void;
  onHover: (t: { text: string; x: number; y: number } | null) => void;
}) {
  const pad = { paddingLeft: `${8 + depth * 16}px` };
  const prefix =
    item.kind === "lxc"
      ? `CT ${item.vmid}`
      : item.kind === "vm"
        ? `VM ${item.vmid}`
        : item.kind === "appliance"
          ? "APP"
          : "DOC";
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onHover({
          text: item.tooltip,
          x: r.right + 10,
          y: r.top + r.height / 2 - 16,
        });
      }}
      onMouseLeave={() => onHover(null)}
      style={pad}
      className={`w-full text-left flex items-center gap-2 py-[4px] pr-3 transition text-[12.5px] ${
        selected
          ? "bg-[#2a3f5c] text-white"
          : "hover:bg-[#22262c] text-zinc-300"
      }`}
    >
      <span className="flex-none w-5 flex items-center justify-center">
        <ServiceIcon icon={item.icon} size={16} />
      </span>
      <span className="text-zinc-500 text-[11px] font-mono w-9 shrink-0">
        {prefix}
      </span>
      <span className="truncate">{item.name}</span>
      <span
        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-none"
        style={{ boxShadow: "0 0 4px rgba(52,211,153,0.8)" }}
      />
    </button>
  );
}

/* =================== ServiceIcon =================== */

function ServiceIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  // Named SVG brands for the ones the user cares about; everything else
  // falls back to the emoji stored on the item.
  switch (icon) {
    case "home-assistant":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#18BCF2" />
          <path
            d="M12 4 L20.5 11 L20.5 19.5 L14 19.5 L14 14 L10 14 L10 19.5 L3.5 19.5 L3.5 11 Z"
            fill="white"
          />
        </svg>
      );
    case "pfsense":
      // pfSense brand: dark navy with red-orange accent and "pf" wordmark
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#1f2d3d" />
          <text
            x="12"
            y="16.3"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fill="#ffffff"
            letterSpacing="-0.5"
          >
            pf
          </text>
          <circle cx="19.2" cy="5.4" r="2" fill="#e32400" />
          <circle cx="19.2" cy="5.4" r="0.9" fill="#ff9100" />
        </svg>
      );
    case "ollama":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#000" />
          <path d="M7 6.5 L8.2 9.5 L9.4 6.5 Z" fill="#fff" />
          <path d="M14.6 6.5 L15.8 9.5 L17 6.5 Z" fill="#fff" />
          <ellipse cx="12" cy="13.8" rx="4.2" ry="5" fill="#fff" />
          <circle cx="10.4" cy="12.7" r="0.55" fill="#000" />
          <circle cx="13.6" cy="12.7" r="0.55" fill="#000" />
          <ellipse cx="12" cy="16" rx="1.3" ry="0.9" fill="#2a2a2a" />
        </svg>
      );
    case "frigate":
      // Frigate NVR brand: dark teal background, yellow frigatebird
      // silhouette (characteristic long bent wings + forked tail + pointed bill).
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#1f3a52" />
          <path
            d="M3 13
               C5 10 7 10 9 12
               C10 10 11.5 9.5 12.5 11
               L14 10
               C15 8.5 16 8 17 9
               C18.5 8 19.5 8.8 20.5 10
               C19 10.8 17.5 11 15.5 11.5
               L13 13
               L12 16
               L10.5 14
               L11 12.5
               C9 13.5 6 14 3 13 Z"
            fill="#ffcb05"
          />
        </svg>
      );
    case "channels":
      // Real Channels DVR logo: six colored bars + darker accent below each,
      // inside a white TV frame with two little antenna curves on top.
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 241 165"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="241" height="165" rx="22" fill="#1a1a1a" />
          {/* Bars (top) */}
          <path d="M46.1 35.2H7.9v107.3H46.1z" fill="#EDDA6F" />
          <path d="M84.1 35.2H45.9v107.3H84.1z" fill="#A4C45E" />
          <path d="M122.1 35.2H83.9v107.3H122.1z" fill="#65BBC5" />
          <path d="M160.1 35.2H121.9v107.3H160.1z" fill="#C683A0" />
          <path d="M198.1 35.2H159.9v107.3H198.1z" fill="#E46D62" />
          <path d="M236.1 35.2H197.9v107.3H236.1z" fill="#7592CA" />
          {/* Darker bottom accent bar beneath each */}
          <path d="M46.1 142H7.9v14.8H46.1z" fill="#7592CA" />
          <path d="M84.1 142H45.9v14.8H84.1z" fill="#4851A3" />
          <path d="M122.1 142H83.9v14.8H122.1z" fill="#E46D62" />
          <path d="M160.1 142H121.9v14.8H160.1z" fill="#544A9E" />
          <path d="M198.1 142H159.9v14.8H198.1z" fill="#65BAC4" />
          <path d="M236.1 142H197.9v14.8H236.1z" fill="#60429A" />
          {/* White TV frame with curved antenna tops */}
          <path
            d="M236.9 27.6H135.8C142.3 20.8 155.6 6.9 157.3 5c1.3-1.5 0.9-3.1 -0.1-4.1c-1.1-1 -3 -1.4 -4.1 -0.3c-1.2 1.2 -26 24.3 -28.9 27H116.9c-2.9-2.7 -27.8 -25.8 -28.9 -27c-1.1 -1.1 -3 -0.7 -4.1 0.3c-1 1 -1.4 2.6 -0.1 4c1.7 1.8 15 15.8 21.5 22.6H4c-2.2 0 -4 1.8 -4 4v128.7c0 2.2 1.8 4 4 4h232.9c2.2 0 4 -1.8 4 -4V31.6c0 -2.2 -1.8 -4 -4 -4zM232.9 156.3H8V35.6h224.9V156.3z"
            fill="white"
          />
        </svg>
      );
    case "github":
      // GitHub mark (octocat silhouette)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#0d1117" />
          <path
            d="M12 4.5c-4.14 0 -7.5 3.36 -7.5 7.5 c0 3.31 2.15 6.12 5.13 7.11 c0.37 0.07 0.51 -0.16 0.51 -0.36 c0 -0.18 -0.01 -0.66 -0.01 -1.29 c-2.09 0.45 -2.53 -1.01 -2.53 -1.01 c-0.34 -0.87 -0.83 -1.1 -0.83 -1.1 c-0.68 -0.46 0.05 -0.45 0.05 -0.45 c0.75 0.05 1.14 0.77 1.14 0.77 c0.67 1.14 1.75 0.81 2.18 0.62 c0.07 -0.48 0.26 -0.81 0.47 -1 c-1.67 -0.19 -3.42 -0.83 -3.42 -3.71 c0 -0.82 0.29 -1.49 0.77 -2.02 c-0.08 -0.19 -0.33 -0.95 0.07 -1.98 c0 0 0.63 -0.2 2.06 0.77 c0.6 -0.17 1.24 -0.25 1.87 -0.25 c0.63 0 1.27 0.08 1.87 0.25 c1.43 -0.97 2.06 -0.77 2.06 -0.77 c0.41 1.03 0.15 1.79 0.07 1.98 c0.48 0.53 0.77 1.2 0.77 2.02 c0 2.89 -1.76 3.52 -3.43 3.71 c0.27 0.23 0.51 0.69 0.51 1.39 c0 1 -0.01 1.81 -0.01 2.06 c0 0.2 0.14 0.43 0.51 0.36 c2.98 -0.99 5.13 -3.8 5.13 -7.11 c0 -4.14 -3.36 -7.5 -7.5 -7.5 Z"
            fill="white"
          />
        </svg>
      );
    case "nest":
      // Google Nest: green circle with a subtle white swoosh evoking airflow.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#0f9d58" />
          <path
            d="M7 13 C9 10, 12 10, 14 13 C15.5 14.5, 16.5 14.5, 17.5 13.2"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="12" cy="8" r="1.2" fill="white" />
        </svg>
      );
    case "bosch":
      // Bosch: red ring with a dark "B"-like flame cross.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#ea0016" strokeWidth="2" />
          <path
            d="M11 4 L11 20 M13 4 L13 20 M5 12 L19 12"
            stroke="#ea0016"
            strokeWidth="1.4"
          />
          <circle cx="12" cy="12" r="3.5" fill="none" stroke="#ea0016" strokeWidth="1.6" />
          <text x="12" y="14.5" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#ea0016">
            B
          </text>
        </svg>
      );
    case "lg":
      // LG: dark red circle with stylized "LG" wordmark and face dots.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#a50034" />
          <text
            x="12"
            y="16.2"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily="ui-sans-serif, system-ui"
            fill="#fff"
          >
            LG
          </text>
          <circle cx="7" cy="8" r="0.8" fill="#fff" />
        </svg>
      );
    case "aqara":
      // Door / contact sensor: simple door hinge + open angle.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#0f172a" />
          <rect x="8" y="5" width="8" height="14" rx="1" fill="#94a3b8" />
          <rect x="6" y="5" width="2" height="14" fill="#64748b" />
          <circle cx="13.5" cy="12" r="0.7" fill="#0f172a" />
          <path d="M16 4 L20 8" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M16 10 L20 14" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "prometheus":
      // Prometheus brand: white flame/torch on orange background.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#e6522c" />
          {/* Flame */}
          <path
            d="M12 3 C13.2 5.2 14 6.8 14 8.4 C14 9.7 13.4 10.5 12.6 11 C13.9 10.6 15 9.4 15 7.7 C16.5 9.3 17 10.8 17 12.4 C17 15.5 14.8 18 12 18 C9.2 18 7 15.5 7 12.4 C7 10.5 8 9 9.5 7.8 C9.2 9 9.4 9.9 10 10.5 C10 8 11 5.6 12 3 Z"
            fill="white"
          />
          {/* Base pedestal */}
          <rect x="7.5" y="17.5" width="9" height="1.8" rx="0.4" fill="white" />
          <rect
            x="8.5"
            y="19.3"
            width="7"
            height="1.5"
            rx="0.35"
            fill="white"
          />
        </svg>
      );
    case "audiobookshelf":
      // Audiobookshelf — cream/amber open book with a sound wave at its heart.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#18191c" />
          {/* Open book halves */}
          <path
            d="M4 7 L11 9 L11 19 L4 17 Z"
            fill="#f9c784"
            stroke="#d69a4c"
            strokeWidth="0.6"
          />
          <path
            d="M20 7 L13 9 L13 19 L20 17 Z"
            fill="#f9c784"
            stroke="#d69a4c"
            strokeWidth="0.6"
          />
          {/* Sound wave between the pages */}
          <path
            d="M7 13 L8 13 M9.5 12 L9.5 14 M11.5 10.5 L11.5 15.5 M14.5 10.5 L14.5 15.5 M16.5 12 L16.5 14 M17.5 13 L18.5 13"
            stroke="#18191c"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "plex":
      // Plex wordmark chevron: orange/amber ">" on a dark rounded square.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#1f1f1f" />
          <path
            d="M7 5 L11 5 L17 12 L11 19 L7 19 L13 12 Z"
            fill="#e5a00d"
          />
        </svg>
      );
    case "pihole":
      // Pi-hole logo: red shield outline with a white π inside.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#0f0f0f" />
          {/* Shield */}
          <path
            d="M12 3 L20 6 L20 13 C20 17.5 16.5 20.2 12 21.4 C7.5 20.2 4 17.5 4 13 L4 6 Z"
            fill="#f60d1a"
            stroke="#9a070f"
            strokeWidth="0.6"
          />
          {/* Greek pi letter */}
          <path
            d="M8 10 H16 M9.5 10 V15.2 M14.5 10 V13.8 Q14.5 15 16 15"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "tailscale":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <rect width="24" height="24" rx="5" fill="#242424" />
          {[
            [6.5, 6.5, 0.45],
            [12, 6.5, 0.75],
            [17.5, 6.5, 0.3],
            [6.5, 12, 0.7],
            [12, 12, 1],
            [17.5, 12, 0.55],
            [6.5, 17.5, 0.3],
            [12, 17.5, 0.55],
            [17.5, 17.5, 0.85],
          ].map(([cx, cy, op], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="1.4"
              fill={op === 1 ? "#fff" : "#d280ff"}
              opacity={op}
            />
          ))}
        </svg>
      );
    default:
      // Emoji fallback
      return <span style={{ fontSize: size }}>{icon}</span>;
  }
}

function TreeRow({
  icon,
  label,
  depth,
  selected,
  bold,
  muted,
  subLabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  depth: number;
  selected?: boolean;
  bold?: boolean;
  muted?: boolean;
  subLabel?: string;
  onClick?: () => void;
}) {
  const pad = { paddingLeft: `${8 + depth * 16}px` };
  return (
    <button
      type="button"
      onClick={onClick}
      style={pad}
      className={`w-full text-left flex items-center gap-2 py-[5px] pr-3 transition text-[13px] ${
        selected
          ? "bg-[#2a3f5c] text-white"
          : "hover:bg-[#22262c] text-zinc-300"
      } ${bold ? "font-medium" : ""} ${muted ? "text-zinc-500" : ""}`}
    >
      <span className="flex-none text-zinc-400">{icon}</span>
      <span className="truncate">{label}</span>
      {subLabel && (
        <span className="ml-auto text-[11px] text-zinc-500">{subLabel}</span>
      )}
    </button>
  );
}

function IconDatacenter() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="1" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1" />
      <circle cx="3.5" cy="4.5" r="0.8" fill="#34d399" />
      <circle cx="3.5" cy="11.5" r="0.8" fill="#34d399" />
    </svg>
  );
}

function IconNode({ active }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="2" y="9" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1" />
      <circle cx="4" cy="5" r="0.7" fill={active ? "#34d399" : "#6b7280"} />
      <circle cx="4" cy="11" r="0.7" fill={active ? "#34d399" : "#6b7280"} />
    </svg>
  );
}

function IconVM({ running }: { running?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="4" y="12" width="8" height="1.5" fill="currentColor" />
      <circle cx="13" cy="4.3" r="1.4" fill={running ? "#34d399" : "#6b7280"} />
    </svg>
  );
}

function IconStorage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <ellipse cx="8" cy="4" rx="5" ry="1.6" stroke="currentColor" strokeWidth="1" />
      <path d="M3 4v8c0 .9 2.2 1.6 5 1.6s5-.7 5-1.6V4" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

/* =================== Tab contents =================== */

function SummaryTab({ id }: { id: VmId }) {
  const vm = vms.find((v) => v.id === id)!;
  return (
    <div className="grid grid-cols-12 gap-4">
      <SummaryTile label="Status" value="running" accent="emerald" colSpan={3} />
      <SummaryTile label="HA State" value="none" colSpan={3} />
      <SummaryTile label="Node" value="pve-east-01" colSpan={3} />
      <SummaryTile label="Uptime" value={vm.uptime} colSpan={3} />

      <PaneCard colSpan={6} title="Notes" icon="📝">
        <div className="text-[12px] text-zinc-400 leading-6">
          <div>
            <span className="text-zinc-500">Section:</span>{" "}
            <span className="text-zinc-200">{vm.label}</span>
          </div>
          <p className="mt-2 text-zinc-300">{vm.description}</p>
          <div className="mt-3 text-[11px] text-zinc-500">
            Open the console to view this VM&apos;s desktop.
          </div>
          <Link
            href={`/vm/${id}`}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-[12px] rounded bg-[#E57000] text-white hover:brightness-110"
          >
            Open Console ▶
          </Link>
        </div>
      </PaneCard>

      <PaneCard colSpan={6} title="Hardware summary" icon="⚙">
        <Kv k="OS" v={vm.os} />
        <Kv k="Machine" v="q35, v10.0, pc-q35-10.0+pve0" />
        <Kv k="BIOS" v="OVMF (UEFI)" />
        <Kv k="SCSI Controller" v="VirtIO SCSI single" />
        <Kv k="vCPU" v="24 (2 sockets, 12 cores, 1 thread)" />
        <Kv k="Memory" v="32.00 GiB" />
        <Kv k="BootDisk (scsi0)" v="local-zfs:vm-101-disk-0, 128G" />
        <Kv k="Network (net0)" v="virtio=BC:24:11:xx:xx:xx, bridge=vmbr0" />
      </PaneCard>

      <PaneCard colSpan={12} title="Resource usage (last hour)" icon="📈">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Graph title="CPU usage" unit="%" peak={vm.cpu} color="#E57000" />
          <Graph title="Memory usage" unit="%" peak={vm.mem} color="#3b82f6" />
          <Graph title="Disk IO" unit="KB/s" peak={56} color="#a855f7" />
          <Graph title="Network traffic" unit="KB/s" peak={74} color="#14b8a6" />
        </div>
      </PaneCard>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  colSpan,
}: {
  label: string;
  value: string;
  accent?: "emerald";
  colSpan: number;
}) {
  return (
    <div
      className={`col-span-12 md:col-span-${colSpan} bg-[#1b1e23] border border-black/40 rounded p-4`}
    >
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div
        className={`mt-1 text-[16px] ${
          accent === "emerald" ? "text-emerald-400" : "text-zinc-200"
        }`}
      >
        {accent === "emerald" && (
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 align-middle shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
        )}
        {value}
      </div>
    </div>
  );
}

function PaneCard({
  title,
  icon,
  children,
  colSpan,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
  colSpan: number;
}) {
  return (
    <section
      className={`col-span-12 md:col-span-${colSpan} bg-[#1b1e23] border border-black/40 rounded`}
    >
      <header className="px-4 py-2 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 py-1.5 text-[12px] border-b border-black/30 last:border-b-0">
      <div className="text-zinc-500">{k}</div>
      <div className="text-zinc-200 font-mono">{v}</div>
    </div>
  );
}

function Graph({
  title,
  unit,
  peak,
  color,
}: {
  title: string;
  unit: string;
  peak: number;
  color: string;
}) {
  const points = useMemo(() => {
    const n = 60;
    const out: number[] = [];
    let v = peak * 0.5;
    for (let i = 0; i < n; i++) {
      v += (Math.sin(i / 3 + peak) + Math.sin(i / 7 + 1)) * 3;
      v = Math.max(2, Math.min(peak + 8, v));
      out.push(v);
    }
    return out;
  }, [peak]);

  const max = Math.max(...points, peak + 5);
  const w = 320;
  const h = 96;
  const step = w / (points.length - 1);
  const poly = points
    .map((p, i) => `${i * step},${h - (p / max) * h}`)
    .join(" ");

  return (
    <div className="bg-[#14171c] border border-black/30 rounded p-3">
      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>{title}</span>
        <span className="text-zinc-500">
          max {Math.round(max)}
          {unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24 mt-1">
        <defs>
          <linearGradient
            id={`grad-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor={color} stopOpacity="0.5" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={poly} fill="none" stroke={color} strokeWidth="1.4" />
        <polygon
          points={`0,${h} ${poly} ${w},${h}`}
          fill={`url(#grad-${color.replace("#", "")})`}
        />
      </svg>
      <div className="text-[11px] text-zinc-400 mt-1">
        current:{" "}
        <span className="text-zinc-200">
          {Math.round(points[points.length - 1])}
          {unit}
        </span>
      </div>
    </div>
  );
}

function ConsoleTab({ id }: { id: VmId }) {
  return (
    <div className="bg-[#1b1e23] border border-black/40 rounded p-5">
      <div className="text-[12px] text-zinc-400 mb-3">
        noVNC — open the console to interact with this VM.
      </div>
      <div className="bg-black h-80 border border-black/50 rounded flex items-center justify-center">
        <Link
          href={`/vm/${id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] rounded bg-[#E57000] text-white hover:brightness-110"
        >
          ▶ Launch console
        </Link>
      </div>
    </div>
  );
}

function HardwareTab({ id }: { id: VmId }) {
  const vm = vms.find((v) => v.id === id)!;
  const rows: [string, string][] = [
    ["Memory", "32.00 GiB"],
    ["Processors", "24 (2 sockets, 12 cores) [host]"],
    ["BIOS", "OVMF (UEFI)"],
    ["Display", "Default"],
    ["Machine", "q35"],
    ["SCSI Controller", "VirtIO SCSI single"],
    ["CD/DVD Drive (ide2)", "none,media=cdrom"],
    ["Hard Disk (scsi0)", `local-zfs:vm-${100 + vms.indexOf(vm) + 1}-disk-0,128G`],
    ["Network Device (net0)", "virtio,bridge=vmbr0,firewall=1"],
    ["EFI Disk", "local-zfs:vm-disk-efi,efitype=4m,pre-enrolled-keys=1"],
    ["TPM State", "local-zfs:vm-disk-tpm,size=4M,version=v2.0"],
  ];
  return (
    <div className="bg-[#1b1e23] border border-black/40 rounded">
      <div className="text-[12px] text-zinc-400 px-4 py-2.5 border-b border-black/40 bg-[#22262c]">
        Add ▾ &nbsp; Remove &nbsp; Edit &nbsp; Resize disk &nbsp; Move disk
      </div>
      <table className="w-full text-[12px]">
        <thead className="text-zinc-500 bg-[#191c21]">
          <tr>
            <th className="text-left font-normal px-4 py-2 w-[240px]">Key</th>
            <th className="text-left font-normal px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-black/30 hover:bg-[#22262c]">
              <td className="px-4 py-2 text-zinc-400">{k}</td>
              <td className="px-4 py-2 text-zinc-200 font-mono">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OptionsTab({ id }: { id: VmId }) {
  const vm = vms.find((v) => v.id === id)!;
  const rows: [string, string][] = [
    ["Name", vm.name],
    ["Start at boot", "Yes"],
    ["Start/Shutdown order", "order=1, up=60"],
    ["OS Type", "Windows 11/2022"],
    ["Boot Order", "scsi0, ide2, net0"],
    ["Use tablet for pointer", "Yes"],
    ["Hotplug", "Disk, Network, USB"],
    ["ACPI support", "Enabled"],
    ["KVM hardware virtualization", "Enabled"],
    ["Freeze CPU at startup", "No"],
    ["Protection", "Disabled"],
    ["VM State storage", "Automatic"],
  ];
  return (
    <div className="bg-[#1b1e23] border border-black/40 rounded">
      <table className="w-full text-[12px]">
        <thead className="text-zinc-500 bg-[#191c21]">
          <tr>
            <th className="text-left font-normal px-4 py-2 w-[260px]">
              Option
            </th>
            <th className="text-left font-normal px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-black/30 hover:bg-[#22262c]">
              <td className="px-4 py-2 text-zinc-400">{k}</td>
              <td className="px-4 py-2 text-zinc-200 font-mono">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaskHistoryTab() {
  return <TaskLogTable />;
}

function HomelabDetail({
  item,
}: {
  item: (typeof homelab)[number];
}) {
  // Special dashboards:
  if (item.name === "pfsense") return <PfSensePanel item={item} />;
  if (item.name === "home-assistant") return <HomeAssistantPanel item={item} />;
  if (item.name === "channels-dvr") return <ChannelsDvrPanel item={item} />;
  if (item.name === "plex") return <PlexPanel item={item} />;
  if (item.name === "audiobookshelf") return <AudiobookshelfPanel item={item} />;
  if (item.name === "pihole") return <PiholePanel item={item} />;
  if (item.name === "prometheus") return <PrometheusPanel item={item} />;
  if (item.name === "github") return <GitHubPanel item={item} />;
  if (item.name === "tailscale") return <TailscalePanel item={item} />;
  if (item.name === "ollama") return <OllamaPanel item={item} />;
  if (item.name === "frigate") return <FrigatePanel item={item} />;

  const isLxc = item.kind === "lxc";
  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-[#1b1e23] border border-black/40 rounded p-5 flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-none">
          <ServiceIcon icon={item.icon} size={44} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] tracking-[0.3em] text-emerald-300 font-mono">
            {isLxc ? "LXC CONTAINER" : "DOCKER CONTAINER"} · RUNNING
          </div>
          <h2 className="text-xl font-semibold text-white mt-1">
            {item.service}
          </h2>
          <div className="text-[12px] text-zinc-400 font-mono mt-0.5">
            {isLxc ? `pct ${item.vmid}` : `docker ps`} · {item.name}
          </div>
          <p className="text-[13px] text-zinc-300 mt-2 leading-6">
            {item.purpose}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tags.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] font-mono tracking-wider rounded bg-white/5 border border-white/10 text-zinc-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile label="Kind" value={isLxc ? "LXC" : "Docker"} colSpan={3} />
        <SummaryTile
          label="Host"
          value={isLxc ? "pve-homelab-01" : "docker-host (CT 105)"}
          colSpan={3}
        />
        <SummaryTile label="CPU" value={`${item.cpu}%`} colSpan={3} />
        <SummaryTile label="Memory" value={`${item.mem}%`} colSpan={3} />
      </div>

      {/* Usage card */}
      <div className="bg-[#1b1e23] border border-black/40 rounded">
        <div className="px-4 py-2.5 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40">
          Resource usage (last hour)
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <MiniUsage label="CPU" value={item.cpu} color="#51a2da" unit="%" />
          <MiniUsage label="Memory" value={item.mem} color="#e0af68" unit="%" />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[#1b1e23] border border-black/40 rounded p-4 text-[12px] text-zinc-400">
        <div className="text-[11px] text-zinc-500 tracking-[0.3em] font-mono mb-2">
          NOTES
        </div>
        <p className="leading-6">
          Runs 24/7 on the homelab node. Managed via{" "}
          {isLxc ? "Proxmox pct + cloud-init templates" : "Portainer + Compose"}
          . Exposed behind Nginx Proxy Manager with automated certificates.
          Telemetry fed into the monitoring stack on CT 104.
        </p>
      </div>
    </div>
  );
}

/* =================== Home Assistant — Lovelace-style dashboard =================== */

function HomeAssistantPanel({ item }: { item: (typeof homelab)[number] }) {
  // Safe, generic family set — no real names or details.
  const family: Array<{
    label: string;
    location: string;
    state: "home" | "away" | "school";
    color: string;
    avatar?: string;
  }> = [
    {
      label: "Joaquin",
      location: "Home · Office",
      state: "home",
      color: "#18BCF2",
      avatar: `https://github.com/${profile.github}.png`,
    },
    { label: "Partner", location: "Work · NJ", state: "away", color: "#f46268" },
    { label: "Kid 1", location: "School", state: "school", color: "#ffcb05" },
    { label: "Kid 2", location: "School", state: "school", color: "#35bf5c" },
  ];

  const lights: Array<{ room: string; on: boolean; brightness: number }> = [
    { room: "Living Room", on: true, brightness: 72 },
    { room: "Kitchen", on: true, brightness: 100 },
    { room: "Office", on: true, brightness: 60 },
    { room: "Master Bedroom", on: false, brightness: 0 },
    { room: "Kids' Room", on: false, brightness: 0 },
    { room: "Hallway", on: true, brightness: 30 },
  ];

  const media: Array<{ name: string; state: string; app: string }> = [
    { name: "Living Room TV", state: "Playing · Channels DVR", app: "UFC 229" },
    { name: "Kitchen HomePod", state: "Playing", app: "Music Assistant" },
    { name: "Office Display", state: "Idle", app: "—" },
  ];

  const cameras = ["Front Door", "Backyard", "Driveway", "Garage"];

  return (
    <div className="space-y-4">
      {/* HA top bar */}
      <div className="rounded-lg overflow-hidden border border-black/40 bg-[#111b28]">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#18BCF2] to-[#0d6e9c]">
          <ServiceIcon icon="home-assistant" size={30} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              Home Assistant · Sanchez House
            </div>
            <div className="text-white/85 text-[11px] font-mono">
              2026.4.2 · 127 devices · 48 automations · status{" "}
              <span className="text-emerald-200">● connected</span>
            </div>
          </div>
          <div className="ml-auto text-white/85 text-[11px] font-mono">
            Overview
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-3">
          {/* Welcome card — me + weather */}
          <HaCard className="col-span-12 md:col-span-5" title="Welcome home">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/15 bg-[#0d6e9c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://github.com/${profile.github}.png`}
                  alt="Joaquin"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-white text-[15px]">Good evening, Joaquin</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  The house is quiet. 3 automations ran in the last hour.
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-white">
              <span className="text-3xl">🌤️</span>
              <div>
                <div className="text-xl font-semibold">64°F</div>
                <div className="text-[11px] text-zinc-400">
                  Partly cloudy · Rahway NJ · feels 62°
                </div>
              </div>
              <div className="ml-auto text-right text-[11px] font-mono text-zinc-400">
                H 68° · L 49° · 💧 32%
              </div>
            </div>
          </HaCard>

          {/* Family presence */}
          <HaCard
            className="col-span-12 md:col-span-7"
            title="Family presence"
            hint="Person entities"
          >
            <div className="grid grid-cols-2 gap-2">
              {family.map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-3 bg-[#0d1621] border border-white/5 rounded px-3 py-2"
                >
                  {p.avatar ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-[#0d1621] flex-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.avatar}
                        alt={p.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-none"
                      style={{ background: p.color }}
                    >
                      {p.label.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] truncate">
                      {p.label}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate font-mono">
                      {p.location}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest ${
                      p.state === "home"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {p.state.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </HaCard>

          {/* Climate */}
          <HaCard
            className="col-span-12 md:col-span-4"
            title="Climate · Ecobee"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full">
                  <path
                    d="M18 2 a16 16 0 1 1 0 32 a16 16 0 1 1 0 -32"
                    fill="none"
                    stroke="#1a2636"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2 a16 16 0 0 1 14 24"
                    fill="none"
                    stroke="#18BCF2"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-white">
                  70°
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-zinc-400">Set to</div>
                <div className="text-white text-[15px]">Auto · Cool</div>
                <div className="text-[11px] text-zinc-400 mt-2">Humidity</div>
                <div className="text-white">44%</div>
              </div>
            </div>
          </HaCard>

          {/* Lights */}
          <HaCard
            className="col-span-12 md:col-span-8"
            title="Lights"
            hint={`${lights.filter((l) => l.on).length} / ${lights.length} on`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {lights.map((l) => (
                <div
                  key={l.room}
                  className="flex items-center gap-3 bg-[#0d1621] border border-white/5 rounded px-3 py-2"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                      l.on
                        ? "bg-[#ffcb05]/20 text-[#ffcb05]"
                        : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    💡
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] truncate">
                      {l.room}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {l.on ? `${l.brightness}%` : "off"}
                    </div>
                  </div>
                  <span
                    className={`w-8 h-4 rounded-full flex items-center ${
                      l.on ? "bg-[#18BCF2] justify-end" : "bg-zinc-700 justify-start"
                    } px-0.5`}
                  >
                    <span className="w-3 h-3 rounded-full bg-white" />
                  </span>
                </div>
              ))}
            </div>
          </HaCard>

          {/* Media */}
          <HaCard
            className="col-span-12 md:col-span-7"
            title="Media players"
          >
            <ul className="divide-y divide-white/5">
              {media.map((m) => (
                <li key={m.name} className="py-2 flex items-center gap-3">
                  <span className="text-xl">🔊</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] truncate">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
                      {m.state}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#18BCF2] font-mono truncate">
                    {m.app}
                  </span>
                </li>
              ))}
            </ul>
          </HaCard>

          {/* Security */}
          <HaCard
            className="col-span-12 md:col-span-5"
            title="Security"
            hint="armed · home"
          >
            <div className="flex flex-wrap gap-1.5">
              {cameras.map((c) => (
                <span
                  key={c}
                  className="px-2 py-1 text-[11px] rounded bg-[#0d1621] border border-white/5 text-zinc-200"
                >
                  📹 {c}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 text-[12px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All locks · locked
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Garage · closed
              </span>
            </div>
          </HaCard>

          {/* Energy */}
          <HaCard
            className="col-span-12 md:col-span-6"
            title="Energy"
            hint="today"
          >
            <div className="flex items-end gap-1 h-20">
              {Array.from({ length: 24 }).map((_, i) => {
                const v = 0.4 + Math.sin((i / 24) * Math.PI * 2 + 1) * 0.35;
                const h = Math.max(4, v * 70);
                return (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-[#18BCF2] to-[#0d6e9c] opacity-85"
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono mt-1">
              <span>0h</span>
              <span>used 18.4 kWh</span>
              <span>24h</span>
            </div>
          </HaCard>

          {/* Automations */}
          <HaCard
            className="col-span-12 md:col-span-6"
            title="Recent automations"
          >
            <ul className="text-[12px] divide-y divide-white/5">
              {[
                ["Arrived home", "Unlocked front door · lights on", "5m ago"],
                ["Sunset", "Porch lights on at 30%", "1h ago"],
                ["Kid 1 left school", "Notification sent", "2h ago"],
                ["Good morning", "Coffee on · shades open", "today 07:12"],
              ].map(([t, d, ago]) => (
                <li key={t} className="py-1.5 flex items-center gap-3">
                  <span className="text-[#18BCF2]">▸</span>
                  <span className="flex-1 min-w-0 truncate text-white">
                    {t}
                    <span className="text-zinc-500 ml-2">{d}</span>
                  </span>
                  <span className="text-zinc-500 font-mono">{ago}</span>
                </li>
              ))}
            </ul>
          </HaCard>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ LXC {item.vmid} · pve-homelab-01 · HAOS 13.x · Zigbee2MQTT +
        Matter · local first, no cloud required
      </div>
    </div>
  );
}

function HaCard({
  title,
  hint,
  className = "",
  children,
}: {
  title: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`bg-[#101a27] border border-white/5 rounded-lg overflow-hidden ${className}`}
    >
      <header className="px-3 py-1.5 flex items-center gap-2 border-b border-white/5">
        <span className="text-[12px] text-white/90">{title}</span>
        {hint && (
          <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
            {hint}
          </span>
        )}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

/* =================== Audiobookshelf — books library =================== */

function AudiobookshelfPanel({ item }: { item: (typeof homelab)[number] }) {
  const byCat = books.reduce<Record<string, BookItem[]>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  // Joaquin's fav row — pinned, explicitly curated.
  const favoritesIds = [
    "cant-hurt-me",
    "atomic-habits",
    "how-to-win-friends",
    "never-finished",
    "extreme-ownership",
  ];
  const favorites = favoritesIds
    .map((id) => books.find((b) => b.id === id)!)
    .filter(Boolean);

  // Recently listened — pretend a realistic 6.
  const recent = [
    books.find((b) => b.id === "cant-hurt-me")!,
    books.find((b) => b.id === "atomic-habits")!,
    books.find((b) => b.id === "12-rules")!,
    books.find((b) => b.id === "meditations")!,
    books.find((b) => b.id === "phoenix-project")!,
    books.find((b) => b.id === "principles")!,
  ];

  return (
    <div className="space-y-4">
      {/* Audiobookshelf topbar */}
      <div className="rounded-lg overflow-hidden border border-black/50">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1a1f26] to-[#2a1f10] border-b border-[#f59e0b]/30">
          <ServiceIcon icon="audiobookshelf" size={30} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              Audiobookshelf
            </div>
            <div className="text-white/55 text-[10.5px] font-mono">
              books.lab.local · {books.length} titles ·{" "}
              {Object.keys(byCat).length} shelves ·{" "}
              <span className="text-emerald-300">● synced</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4 ml-6 text-[12px] text-white/60">
            <span className="text-[#f59e0b]">Library</span>
            <span>Latest</span>
            <span>Authors</span>
            <span>Series</span>
            <span>Collections</span>
          </nav>
          <div className="ml-auto text-[11px] font-mono text-zinc-400">
            v2.17
          </div>
        </div>

        <div className="p-4 bg-[#141414] space-y-6">
          <BookRow title="Joaquin's Favorites" books={favorites} accent />
          <BookRow title="Recently Listened" books={recent} />
          {Object.entries(byCat).map(([cat, items]) => (
            <BookRow key={cat} title={cat} books={items} />
          ))}
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ LXC {item.vmid} · pve-homelab-01 · covers sourced from Open Library
        · metadata cached locally · no external tracking
      </div>
    </div>
  );
}

function BookRow({
  title,
  books: items,
  accent,
}: {
  title: string;
  books: BookItem[];
  accent?: boolean;
}) {
  return (
    <section>
      <header className="flex items-center gap-3 mb-2.5">
        <h3
          className={`text-[14px] font-semibold ${accent ? "text-[#f59e0b]" : "text-white"}`}
        >
          {title}
          {accent && <span className="ml-2 text-[10px] align-middle">★</span>}
        </h3>
        <span className="text-[11px] text-zinc-500 font-mono">
          {items.length} titles
        </span>
        <span className="ml-auto text-[11px] text-[#f59e0b] cursor-pointer">
          See all →
        </span>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((b) => (
          <BookTile key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}

function BookTile({ book }: { book: BookItem }) {
  const coverUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
  return (
    <div
      className="relative rounded-md overflow-hidden border border-white/5 shadow-lg hover:ring-2 hover:ring-[#f59e0b]/70 transition cursor-pointer w-[130px] aspect-[2/3] flex-none"
      style={{ background: book.bg }}
      title={`${book.title} — ${book.author}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverUrl}
        alt={book.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Bottom gradient for title readability when the cover is light */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <div className="text-[11px] text-white font-semibold leading-tight line-clamp-2">
          {book.title}
        </div>
        <div className="text-[9.5px] text-white/70 font-mono mt-0.5 truncate">
          {book.author}
        </div>
      </div>
    </div>
  );
}

/* =================== Plex — library dashboard =================== */

function PlexPanel({ item }: { item: (typeof homelab)[number] }) {
  const shows = plexLibrary.filter((p) => p.kind === "show");
  const movies = plexLibrary.filter((p) => p.kind === "movie");
  const anime = plexLibrary.filter((p) => p.kind === "anime");
  const podcasts = plexLibrary.filter((p) => p.kind === "podcast");
  const byId = (id: string) => plexLibrary.find((p) => p.id === id)!;
  const onDeck = [
    byId("tucker"),
    byId("shapiro"),
    shows[0],
    anime[0],
    movies[0],
  ];
  const recentlyAdded = [
    anime[0], shows[2], movies[0], podcasts[0], shows[0], anime[1],
    movies[1], podcasts[1], shows[3], anime[2],
  ];

  return (
    <div className="space-y-6">
      {/* Plex topbar */}
      <div className="rounded-lg overflow-hidden border border-black/50">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1f1f1f] via-[#1a1a1a] to-[#1f1f1f] border-b border-[#e5a00d]/30">
          <ServiceIcon icon="plex" size={28} />
          <div className="leading-tight">
            <div className="text-white font-semibold text-[15px] flex items-center gap-2">
              plex
            </div>
            <div className="text-white/55 text-[10.5px] font-mono">
              Library · plex.lab.local · {plexLibrary.length} items ·{" "}
              {shows.length} shows · {movies.length} movies · {anime.length}{" "}
              anime
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4 ml-6 text-[12px] text-white/60">
            <span className="text-[#e5a00d]">Home</span>
            <span>Movies</span>
            <span>TV Shows</span>
            <span>Music</span>
            <span>Live TV</span>
          </nav>
          <div className="ml-auto flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            streaming to 2
          </div>
        </div>

        {/* On Deck */}
        <div className="p-4 bg-[#141414]">
          <PlexRow title="On Deck" items={onDeck} size="wide" />
          <PlexRow title="Recently Added" items={recentlyAdded} />
          <PlexRow title="Movies" items={movies} />
          <PlexRow title="TV Shows" items={shows} />
          <PlexRow title="Anime" items={anime} />
          <PlexRow title="Podcasts & Talk" items={podcasts} />
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ LXC {item.vmid} · pve-homelab-01 · hardware transcoding enabled ·
        library: 64G cache, media on NAS
      </div>
    </div>
  );
}

function PlexRow({
  title,
  items,
  size = "normal",
}: {
  title: string;
  items: PlexItem[];
  size?: "normal" | "wide";
}) {
  const cardClass =
    size === "wide"
      ? "w-[260px] aspect-[16/9] flex-none"
      : "w-[130px] aspect-[2/3] flex-none";
  return (
    <section className="mb-5 last:mb-0">
      <header className="flex items-center gap-3 mb-2.5">
        <h3 className="text-white text-[14px] font-semibold">{title}</h3>
        <span className="text-[11px] text-zinc-500 font-mono">
          {items.length} titles
        </span>
        <span className="ml-auto text-[11px] text-[#e5a00d] cursor-pointer">
          See all →
        </span>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((it) => (
          <PlexTile key={it.id} item={it} className={cardClass} wide={size === "wide"} />
        ))}
      </div>
    </section>
  );
}

function PlexTile({
  item,
  className,
  wide,
}: {
  item: PlexItem;
  className: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`relative rounded-md overflow-hidden border border-white/5 shadow-lg hover:ring-2 hover:ring-[#e5a00d]/70 transition cursor-pointer ${className}`}
      style={{ background: item.bg }}
      title={`${item.title} · ${item.year}`}
    >
      {/* Real poster if we pulled one; otherwise fall back to the mark/gradient */}
      {item.posterUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.posterUrl}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </>
      ) : (
        item.mark && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ color: item.accent ?? "#fff", opacity: 0.18 }}
          >
            <span
              className="font-black tracking-tighter"
              style={{ fontSize: wide ? 72 : 46 }}
            >
              {item.mark}
            </span>
          </div>
        )
      )}
      {/* Top kind + rating tag */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-widest rounded bg-black/60 text-white/90 border border-white/10 uppercase">
          {item.kind}
        </span>
        {item.rating && (
          <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-black/60 text-white/80 border border-white/10">
            {item.rating}
          </span>
        )}
      </div>
      {/* Gradient bottom for readability */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        }}
      />
      {/* Title block */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div
          className={`font-semibold leading-tight ${wide ? "text-[16px]" : "text-[13px]"}`}
          style={{ color: item.accent ?? "#fff" }}
        >
          {item.title}
        </div>
        <div className="text-[10px] text-white/60 font-mono mt-0.5 truncate">
          {item.year} · {item.genre}
        </div>
      </div>
      {/* Hover play indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#1f1f1f] flex items-center justify-center opacity-0 hover:opacity-100 transition shadow-xl">
        ▶
      </div>
    </div>
  );
}

/* =================== Frigate — NVR + LLM flow =================== */

function FrigatePanel({ item }: { item: (typeof homelab)[number] }) {
  type Cam = {
    name: string;
    model: string;
    kind: "Reolink PTZ" | "UniFi G4" | "UniFi G5" | "UniFi Pro";
    fps: number;
    detect: boolean;
  };

  const cameras: Cam[] = [
    { name: "Front Door", model: "Reolink TrackMix PoE", kind: "Reolink PTZ", fps: 15, detect: true },
    { name: "Driveway", model: "UniFi G5 Bullet", kind: "UniFi G5", fps: 15, detect: true },
    { name: "Backyard", model: "UniFi G5 Bullet", kind: "UniFi G5", fps: 15, detect: true },
    { name: "Garage", model: "UniFi G4 Instant", kind: "UniFi G4", fps: 10, detect: true },
    { name: "Living Room", model: "UniFi G4 Instant", kind: "UniFi G4", fps: 10, detect: false },
    { name: "Nursery", model: "UniFi G4 Instant", kind: "UniFi G4", fps: 10, detect: false },
  ];

  const detections = [
    {
      at: "14:32",
      cam: "Front Door",
      label: "person · package",
      desc: "Amazon delivery driver walking toward the mailbox with a package in hand",
    },
    {
      at: "13:55",
      cam: "Driveway",
      label: "car · person",
      desc: "White Lexus RX350 pulled in and parked; driver stepped out with groceries",
    },
    {
      at: "12:18",
      cam: "Backyard",
      label: "person · dog",
      desc: "Neighbor walking a golden retriever along the fence line, east to west",
    },
    {
      at: "11:42",
      cam: "Front Door",
      label: "person · mail",
      desc: "USPS carrier dropped mail and walked back to the truck",
    },
    {
      at: "10:07",
      cam: "Garage",
      label: "car · garage",
      desc: "Silver Toyota pulled in, door closed 41 seconds later",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Frigate topbar */}
      <div className="rounded-lg overflow-hidden border border-black/40 bg-[#0e1a26]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#13222e] border-b border-black/50">
          <ServiceIcon icon="frigate" size={30} />
          <div>
            <div className="text-white font-semibold text-[15px]">Frigate NVR</div>
            <div className="text-white/60 text-[11px] font-mono">
              v0.14.1 · Coral TPU + RTX A4000 · 6 cameras · status{" "}
              <span className="text-emerald-300">● running</span>
            </div>
          </div>
          <div className="ml-auto text-[11px] font-mono text-[#ffcb05]">
            2,814 events · today
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-black/40">
          <FrigateKpi accent="#ffcb05" label="FPS (total)" value="80" hint="across 6 cams" />
          <FrigateKpi accent="#ef4444" label="Events (24h)" value="2,814" hint="people/cars/pkg" />
          <FrigateKpi accent="#3b82f6" label="Detect latency" value="38 ms" hint="mean · Coral TPU" />
          <FrigateKpi accent="#22c55e" label="Storage" value="412 / 512 GB" hint="7d retention" />
        </div>

        {/* Cameras + flow diagram side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 bg-[#0b1520]">
          {/* Cameras grid */}
          <DashCard title="Cameras">
            <div className="grid grid-cols-2 gap-2">
              {cameras.map((c) => (
                <CamTile key={c.name} cam={c} />
              ))}
            </div>
          </DashCard>

          {/* Communication / LLM flow */}
          <DashCard
            title="Communication & LLM flow"
            hint="zero cloud · all local"
          >
            <FrigateFlow />
          </DashCard>
        </div>

        {/* AI detections feed */}
        <div className="p-3 bg-[#0b1520] border-t border-black/40">
          <DashCard
            title="Recent detections"
            hint="captions generated on-prem by Ollama vision"
          >
            <ul className="divide-y divide-white/5">
              {detections.map((d, i) => (
                <li
                  key={i}
                  className="py-2 flex gap-3 items-start hover:bg-white/5 -mx-3 px-3 rounded"
                >
                  <div className="flex flex-col items-center w-14 flex-none pt-0.5">
                    <span className="text-[11px] font-mono text-[#ffcb05]">
                      {d.at}
                    </span>
                    <span className="text-[10px] text-white/50 font-mono">
                      {d.cam}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-white/90 leading-snug">
                      {d.desc}
                    </div>
                    <div className="text-[10.5px] text-white/40 font-mono mt-0.5">
                      label: {d.label}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </DashCard>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ VM {item.vmid} · pve-homelab-01 · Coral TPU PCIe passthrough ·
        GPU shared with Ollama for vision captions
      </div>
    </div>
  );
}

function FrigateKpi({
  accent,
  label,
  value,
  hint,
}: {
  accent: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      className="px-4 py-3 border-l-4"
      style={{ borderLeftColor: accent, background: "#0e1a26" }}
    >
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-[22px] font-semibold text-white mt-0.5">
        {value}
      </div>
      <div className="text-[10.5px] text-zinc-500 mt-0.5">{hint}</div>
    </div>
  );
}

function CamTile({ cam }: { cam: { name: string; model: string; kind: string; fps: number; detect: boolean } }) {
  // Colored gradient stands in for a snapshot; crosshair icon + label overlay.
  const palette: Record<string, string> = {
    "Front Door": "linear-gradient(135deg, #1f3a52, #3f6b8a)",
    "Driveway": "linear-gradient(135deg, #2a1a1a, #5b2c2c)",
    "Backyard": "linear-gradient(135deg, #14301a, #2e5a3a)",
    "Garage": "linear-gradient(135deg, #201a14, #3e2f20)",
    "Living Room": "linear-gradient(135deg, #0f1a2b, #25365a)",
    "Nursery": "linear-gradient(135deg, #2a1b33, #4a2c5e)",
  };
  return (
    <div
      className="relative aspect-video rounded border border-white/10 overflow-hidden"
      style={{ background: palette[cam.name] ?? "#1a1a1a" }}
      title={`${cam.name} · ${cam.model}`}
    >
      {/* Faux grid to suggest video */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.04) 7px), repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.04) 7px)",
        }}
      />
      {/* Live indicator */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[10px] font-mono text-white">
        <span
          className={`w-1.5 h-1.5 rounded-full ${cam.detect ? "bg-red-500 animate-pulse" : "bg-emerald-400"}`}
        />
        <span>{cam.detect ? "DETECT" : "RECORD"}</span>
      </div>
      {/* FPS */}
      <div className="absolute top-1.5 right-1.5 text-[10px] font-mono text-white/80">
        {cam.fps}fps
      </div>
      {/* Name */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between">
        <div>
          <div className="text-[12px] text-white font-semibold leading-tight">
            {cam.name}
          </div>
          <div className="text-[9.5px] text-white/60 font-mono">
            {cam.kind}
          </div>
        </div>
      </div>
    </div>
  );
}

function FrigateFlow() {
  // A simple left→right flow diagram with 3 columns:
  //   1. Camera inputs (RTSP)
  //   2. Frigate processing stack
  //   3. Downstream (HA, Ollama, storage, Telegram)
  const w = 640;
  const h = 320;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffcb05" opacity="0.85" />
        </marker>
      </defs>

      {/* Column 1: Cameras */}
      <FlowNode x={10} y={20} w={150} h={34} title="Front Door" sub="Reolink PTZ · RTSP" color="#1f3a52" />
      <FlowNode x={10} y={64} w={150} h={34} title="Driveway" sub="UniFi G5 · RTSP" color="#1f3a52" />
      <FlowNode x={10} y={108} w={150} h={34} title="Backyard" sub="UniFi G5 · RTSP" color="#1f3a52" />
      <FlowNode x={10} y={152} w={150} h={34} title="Garage" sub="UniFi G4 · RTSP" color="#1f3a52" />
      <FlowNode x={10} y={196} w={150} h={34} title="Living Room" sub="UniFi G4 · RTSP" color="#1f3a52" />
      <FlowNode x={10} y={240} w={150} h={34} title="Nursery" sub="UniFi G4 · RTSP" color="#1f3a52" />

      {/* Column 2: Frigate */}
      <g>
        <rect
          x={220}
          y={60}
          width={200}
          height={200}
          rx={10}
          fill="#13222e"
          stroke="#ffcb05"
          strokeWidth="1.5"
        />
        <text x={320} y={80} textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffcb05">
          FRIGATE NVR
        </text>
        <text x={320} y={96} textAnchor="middle" fontSize="9" fill="#ffcb05" opacity="0.75">
          v0.14 · blakeblackshear/frigate
        </text>
        <FlowPill x={235} y={108} w={170} label="ffmpeg decode" />
        <FlowPill x={235} y={132} w={170} label="motion detection" />
        <FlowPill x={235} y={156} w={170} label="Coral TPU · object detection" />
        <FlowPill x={235} y={180} w={170} label="zones · masks · filters" />
        <FlowPill x={235} y={204} w={170} label="event recorder · thumbs" />
        <FlowPill x={235} y={228} w={170} label="MQTT + REST events" />
      </g>

      {/* Arrows cam → frigate */}
      {[37, 81, 125, 169, 213, 257].map((y, i) => (
        <line
          key={i}
          x1={160}
          y1={y}
          x2={220}
          y2={160}
          stroke="#ffcb05"
          strokeOpacity="0.55"
          strokeWidth="1.1"
          markerEnd="url(#arrow)"
        />
      ))}

      {/* Column 3: Downstream */}
      <FlowNode x={460} y={40} w={170} h={46} title="Ollama (local LLM)" sub="vision captions for events" color="#0a0a0a" accent="#d280ff" />
      <FlowNode x={460} y={96} w={170} h={46} title="Home Assistant" sub="MQTT · automations · push" color="#13222e" accent="#18BCF2" />
      <FlowNode x={460} y={152} w={170} h={46} title="Storage (NAS)" sub="7d retention · clips + thumbs" color="#1a1a1a" accent="#9ece6a" />
      <FlowNode x={460} y={208} w={170} h={46} title="Telegram bot" sub="person/car snapshots" color="#0a1a2a" accent="#7fc4ff" />
      <FlowNode x={460} y={264} w={170} h={46} title="Prometheus" sub="counters · FPS · latency" color="#2a1409" accent="#e6522c" />

      {/* Arrows frigate → downstream */}
      {[63, 119, 175, 231, 287].map((y, i) => (
        <line
          key={i}
          x1={420}
          y1={160}
          x2={460}
          y2={y}
          stroke="#ffcb05"
          strokeOpacity="0.7"
          strokeWidth="1.2"
          markerEnd="url(#arrow)"
        />
      ))}

      {/* Bi-directional label on LLM arrow */}
      <text x={442} y={35} fontSize="9" fill="#d280ff">
        snapshots → caption
      </text>
      <text x={442} y={47} fontSize="9" fill="#d280ff" opacity="0.7">
        ← JSON description
      </text>
      <line
        x1={460}
        y1={54}
        x2={420}
        y2={130}
        stroke="#d280ff"
        strokeOpacity="0.5"
        strokeDasharray="3 3"
        strokeWidth="1"
        markerEnd="url(#arrow)"
      />
    </svg>
  );
}

function FlowNode({
  x,
  y,
  w,
  h,
  title,
  sub,
  color,
  accent = "#ffcb05",
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  color: string;
  accent?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={color}
        stroke={accent}
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      <text
        x={x + 10}
        y={y + 15}
        fontSize="11"
        fontWeight="600"
        fill="#fff"
      >
        {title}
      </text>
      <text x={x + 10} y={y + 28} fontSize="9" fill={accent} opacity="0.85">
        {sub}
      </text>
    </g>
  );
}

function FlowPill({
  x,
  y,
  w,
  label,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={18}
        rx={4}
        fill="#0b1520"
        stroke="#ffcb05"
        strokeOpacity="0.25"
        strokeWidth="0.8"
      />
      <text x={x + 8} y={y + 12} fontSize="10" fill="#e6e6e6">
        {label}
      </text>
    </g>
  );
}

/* =================== Tailscale — tailnet devices =================== */

function TailscalePanel({ item }: { item: (typeof homelab)[number] }) {
  type Device = {
    name: string;
    ip: string;
    os: string;
    icon: string;
    online: boolean;
    lastSeen: string;
    tags: string[];
    owner: string;
    exitNode?: boolean;
    subnetRouter?: boolean;
  };

  const devices: Device[] = [
    {
      name: "pixel-9-pro",
      ip: "100.64.12.18",
      os: "Android 15 · arm64",
      icon: "📱",
      online: true,
      lastSeen: "now",
      tags: ["tag:mobile"],
      owner: "joaquin",
    },
    {
      name: "macbook-pro",
      ip: "100.64.12.22",
      os: "macOS 15.2 · arm64",
      icon: "💻",
      online: true,
      lastSeen: "2m ago",
      tags: ["tag:admin"],
      owner: "joaquin",
    },
    {
      name: "pfsense",
      ip: "100.64.12.1",
      os: "FreeBSD 14 · amd64",
      icon: "pfsense",
      online: true,
      lastSeen: "now",
      tags: ["tag:gateway"],
      owner: "joaquin",
      subnetRouter: true,
      exitNode: true,
    },
    {
      name: "home-assistant",
      ip: "100.64.12.31",
      os: "Alpine 3.19 · amd64",
      icon: "home-assistant",
      online: true,
      lastSeen: "1m ago",
      tags: ["tag:server", "tag:iot"],
      owner: "joaquin",
    },
    {
      name: "plex-media",
      ip: "100.64.12.32",
      os: "Debian 12 · amd64",
      icon: "plex",
      online: true,
      lastSeen: "5m ago",
      tags: ["tag:server", "tag:media"],
      owner: "joaquin",
    },
    {
      name: "ollama",
      ip: "100.64.12.36",
      os: "Ubuntu 24.04 · amd64",
      icon: "ollama",
      online: true,
      lastSeen: "10s ago",
      tags: ["tag:server", "tag:gpu"],
      owner: "joaquin",
    },
    {
      name: "prometheus",
      ip: "100.64.12.34",
      os: "Debian 12 · amd64",
      icon: "prometheus",
      online: true,
      lastSeen: "now",
      tags: ["tag:server", "tag:observability"],
      owner: "joaquin",
    },
    {
      name: "ipad-air",
      ip: "100.64.12.41",
      os: "iPadOS 18 · arm64",
      icon: "📟",
      online: false,
      lastSeen: "3h ago",
      tags: ["tag:mobile"],
      owner: "joaquin",
    },
  ];

  const onlineCount = devices.filter((d) => d.online).length;

  return (
    <div className="space-y-4">
      {/* Tailscale topbar */}
      <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0f0f14]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0f0f14]">
          <ServiceIcon icon="tailscale" size={28} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              Tailscale · joaquin.tailnet
            </div>
            <div className="text-white/60 text-[11px] font-mono">
              {onlineCount} / {devices.length} devices online ·{" "}
              <span className="text-emerald-300">● connected</span> ·
              WireGuard MTU 1280
            </div>
          </div>
          <nav className="ml-6 hidden md:flex items-center gap-3 text-[12px] text-white/60">
            <span className="text-white">Machines</span>
            <span>Users</span>
            <span>ACLs</span>
            <span>DNS</span>
            <span>Logs</span>
          </nav>
          <div className="ml-auto px-2.5 py-1 text-[11px] rounded border border-white/15 text-white/80">
            + Add device
          </div>
        </div>

        <table className="w-full text-[12px]">
          <thead className="text-zinc-500 bg-[#15151c]">
            <tr>
              <th className="text-left font-normal px-4 py-2">Machine</th>
              <th className="text-left font-normal px-4 py-2 w-40">
                Addresses
              </th>
              <th className="text-left font-normal px-4 py-2 w-48">OS</th>
              <th className="text-left font-normal px-4 py-2">Tags</th>
              <th className="text-right font-normal px-4 py-2 w-28">
                Last seen
              </th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr
                key={d.name}
                className="border-t border-white/5 hover:bg-white/5"
              >
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        background: d.online ? "#34d399" : "#52525b",
                        boxShadow: d.online
                          ? "0 0 6px rgba(52,211,153,0.9)"
                          : undefined,
                      }}
                    />
                    <ServiceIcon icon={d.icon} size={18} />
                    <div>
                      <div className="text-white leading-tight">{d.name}</div>
                      <div className="text-[10.5px] text-zinc-500 font-mono">
                        {d.owner}@joaquin.tailnet
                      </div>
                    </div>
                    {d.exitNode && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#d280ff]/15 text-[#d280ff] border border-[#d280ff]/40">
                        exit-node
                      </span>
                    )}
                    {d.subnetRouter && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#7b9fff]/15 text-[#9bb5ff] border border-[#7b9fff]/40">
                        subnet
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 font-mono text-zinc-300">{d.ip}</td>
                <td className="px-4 py-2 text-zinc-400 font-mono text-[11px]">
                  {d.os}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/5 border border-white/10 text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-zinc-400 font-mono text-[11px]">
                  {d.lastSeen}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ LXC {item.vmid} · pve-homelab-01 · WireGuard keys rotated every
        180d · MagicDNS enabled
      </div>
    </div>
  );
}

/* =================== Ollama — LLM fleet dashboard =================== */

function OllamaPanel({ item }: { item: (typeof homelab)[number] }) {
  const servers: Array<{
    name: string;
    purpose: string;
    model: string;
    params: string;
    quant: string;
    vram: string;
    gpu: string;
    ctx: string;
    tps: number;
    load: number;
  }> = [
    {
      name: "ollama-code",
      purpose: "Code + IDE assistant",
      model: "qwen2.5-coder",
      params: "14B",
      quant: "Q5_K_M",
      vram: "12.4 / 24 GB",
      gpu: "RTX 4090 · node-01",
      ctx: "32K",
      tps: 62,
      load: 38,
    },
    {
      name: "ollama-chat",
      purpose: "General chat + agents",
      model: "llama3.3",
      params: "70B",
      quant: "Q4_K_M",
      vram: "41.2 / 48 GB",
      gpu: "2× RTX 3090 · node-02",
      ctx: "128K",
      tps: 28,
      load: 72,
    },
    {
      name: "ollama-vision",
      purpose: "Vision + image captions (Frigate)",
      model: "llama3.2-vision",
      params: "11B",
      quant: "Q6_K",
      vram: "9.1 / 16 GB",
      gpu: "RTX A4000 · node-03",
      ctx: "8K",
      tps: 44,
      load: 21,
    },
  ];

  const topDownloads: Array<{ model: string; pulls: string; tag: string }> = [
    { model: "llama3.3", pulls: "14.2M", tag: "latest · 70B" },
    { model: "qwen2.5-coder", pulls: "9.8M", tag: "14B · coder" },
    { model: "deepseek-r1", pulls: "8.6M", tag: "latest · reasoning" },
    { model: "gemma3", pulls: "7.1M", tag: "12B · Google" },
    { model: "phi4", pulls: "6.4M", tag: "14B · Microsoft" },
    { model: "mistral", pulls: "6.1M", tag: "7B · instruct" },
    { model: "llama3.2-vision", pulls: "5.3M", tag: "11B · vision" },
    { model: "codellama", pulls: "4.8M", tag: "13B · code" },
    { model: "qwen3", pulls: "4.1M", tag: "32B · Alibaba" },
    { model: "nomic-embed-text", pulls: "3.9M", tag: "embeddings" },
  ];

  return (
    <div className="space-y-4">
      {/* Ollama topbar */}
      <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0a0a0a]">
          <ServiceIcon icon="ollama" size={30} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              Ollama Fleet
            </div>
            <div className="text-white/60 text-[11px] font-mono">
              3 servers · {servers.length} models loaded · GPU fleet online ·{" "}
              <span className="text-emerald-300">● healthy</span>
            </div>
          </div>
          <div className="ml-auto text-[11px] font-mono text-white/60">
            v0.6.8 · registry.ollama.ai
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-3 bg-[#0c0c0c]">
          {/* Running servers */}
          {servers.map((s) => (
            <section
              key={s.name}
              className="col-span-12 md:col-span-4 bg-[#111] border border-white/10 rounded overflow-hidden"
            >
              <header className="px-3 py-2 flex items-center gap-2 bg-[#151515] border-b border-white/10">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                <span className="text-white text-[12px] font-mono">
                  {s.name}
                </span>
                <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
                  {s.gpu}
                </span>
              </header>
              <div className="p-3 space-y-2">
                <div className="text-[11px] text-zinc-500 tracking-wider uppercase">
                  {s.purpose}
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-white text-[17px] font-semibold">
                    {s.model}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mb-0.5">
                    {s.params} · {s.quant}
                  </div>
                </div>
                <Kv k="Context" v={s.ctx} />
                <Kv k="Throughput" v={`${s.tps} tok/s`} />
                <Kv k="VRAM" v={s.vram} />
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-zinc-400">Load</span>
                    <span className="text-zinc-200 font-mono">{s.load}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7b68ee] to-[#d280ff]"
                      style={{ width: `${s.load}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* Top downloads */}
          <section className="col-span-12 md:col-span-8 bg-[#111] border border-white/10 rounded overflow-hidden">
            <header className="px-3 py-2 flex items-center gap-2 bg-[#151515] border-b border-white/10">
              <span className="text-[12px] text-white">
                Top downloaded models
              </span>
              <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
                registry.ollama.ai — 30d
              </span>
            </header>
            <table className="w-full text-[12px]">
              <thead className="text-zinc-500 bg-[#0d0d0d]">
                <tr>
                  <th className="text-left font-normal px-3 py-1.5 w-8">#</th>
                  <th className="text-left font-normal px-3 py-1.5">Model</th>
                  <th className="text-left font-normal px-3 py-1.5">Tag</th>
                  <th className="text-right font-normal px-3 py-1.5 w-28">
                    Pulls (30d)
                  </th>
                </tr>
              </thead>
              <tbody>
                {topDownloads.map((m, i) => (
                  <tr
                    key={m.model}
                    className="border-t border-white/5 hover:bg-white/5"
                  >
                    <td className="px-3 py-1.5 text-zinc-500 font-mono">
                      {i + 1}
                    </td>
                    <td className="px-3 py-1.5 text-white font-mono">
                      {m.model}
                    </td>
                    <td className="px-3 py-1.5 text-zinc-400">{m.tag}</td>
                    <td className="px-3 py-1.5 text-right text-white/90 font-mono">
                      {m.pulls}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* CLI footprint */}
          <section className="col-span-12 bg-[#111] border border-white/10 rounded overflow-hidden">
            <header className="px-3 py-2 flex items-center gap-2 bg-[#151515] border-b border-white/10">
              <span className="text-[12px] text-white">Recent requests</span>
              <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
                /v1/chat/completions
              </span>
            </header>
            <pre className="p-3 text-[11px] font-mono text-zinc-300 leading-5 overflow-x-auto">
              <span className="text-emerald-400">ollama-code</span>{" "}
              qwen2.5-coder · 32K ctx · prompt 1,847t · out 512t · 0.42s
              {"\n"}
              <span className="text-emerald-400">ollama-chat</span>{" "}
              llama3.3 · 128K ctx · prompt 9,102t · out 811t · 2.71s
              {"\n"}
              <span className="text-emerald-400">ollama-vision</span>{" "}
              llama3.2-vision · image 1080×720 · caption 142t · 0.98s
              {"\n"}
              <span className="text-emerald-400">ollama-chat</span>{" "}
              llama3.3 · 128K ctx · prompt 3,201t · out 612t · 1.84s
              {"\n"}
              <span className="text-zinc-500">
                └─ all requests served locally, zero egress to cloud LLM
                providers.
              </span>
            </pre>
          </section>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ VM {item.vmid} · pve-homelab-01 · GPU passthrough enabled ·
        OpenAI-compatible API exposed on Tailnet
      </div>
    </div>
  );
}

/* =================== GitHub — contributions panel =================== */

function GitHubPanel({ item }: { item: (typeof homelab)[number] }) {
  const u = profile.github;
  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-white/10 bg-[#0d1117]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0d1117] border-b border-white/10">
          <ServiceIcon icon="github" size={30} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              github.com/{u}
            </div>
            <div className="text-white/55 text-[11px] font-mono">
              Personal public profile · contribution activity
            </div>
          </div>
          <a
            href={`https://github.com/${u}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto px-3 py-1.5 text-[11px] font-medium rounded border border-white/15 text-white/90 hover:bg-white/10"
          >
            Open profile ↗
          </a>
        </div>

        <div className="p-4 space-y-4">
          {/* Contribution graph */}
          <div className="bg-[#161b22] border border-white/10 rounded p-4">
            <div className="text-[12px] text-white/70 mb-2">
              Contribution activity — last year
            </div>
            {/* ghchart returns a full SVG contribution grid without auth */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://ghchart.rshah.org/58a6ff/${u}`}
              alt={`${u} GitHub contribution chart`}
              className="w-full h-auto"
            />
          </div>

          {/* Stats + top languages side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#161b22] border border-white/10 rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://github-readme-stats.vercel.app/api?username=${u}&theme=github_dark_dimmed&show_icons=true&hide_border=true&count_private=true&include_all_commits=true`}
                alt="GitHub stats"
                className="w-full h-auto"
              />
            </div>
            <div className="bg-[#161b22] border border-white/10 rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&theme=github_dark_dimmed&hide_border=true&layout=compact&langs_count=8`}
                alt="Top languages"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Streak */}
          <div className="bg-[#161b22] border border-white/10 rounded overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://streak-stats.demolab.com/?user=${u}&theme=github-dark-dimmed&hide_border=true`}
              alt="GitHub streak"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ VM {item.vmid} · pve-homelab-01 · public identity, nothing private
        sync&apos;d here
      </div>
    </div>
  );
}

/* =================== Prometheus — scrape dashboard =================== */

function PrometheusPanel({ item }: { item: (typeof homelab)[number] }) {
  // Fake Frigate detections (pre-generated LLM-style captions).
  const detections = [
    {
      at: "14:32",
      cam: "Front Door",
      desc: "Amazon delivery driver walking toward the mailbox with a package in hand",
      tag: "person · package",
      severity: "info",
    },
    {
      at: "13:55",
      cam: "Driveway",
      desc: "White Lexus RX350 pulled in and parked; driver stepped out carrying groceries",
      tag: "vehicle · person",
      severity: "info",
    },
    {
      at: "12:18",
      cam: "Backyard",
      desc: "Neighbor walking a golden retriever along the fence line, east to west",
      tag: "person · dog",
      severity: "info",
    },
    {
      at: "11:42",
      cam: "Front Door",
      desc: "USPS carrier approached the porch, checked the mailbox, placed mail, left",
      tag: "person · mail",
      severity: "info",
    },
    {
      at: "10:07",
      cam: "Garage",
      desc: "Garage door opened, a silver Toyota pulled in, door closed 41 seconds later",
      tag: "vehicle · garage",
      severity: "info",
    },
    {
      at: "08:12",
      cam: "Driveway",
      desc: "School bus stopped at the corner, child boarded, bus continued west",
      tag: "vehicle · person",
      severity: "info",
    },
    {
      at: "02:48",
      cam: "Backyard",
      desc: "Raccoon briefly visible near the trash bins, moved on without interaction",
      tag: "animal",
      severity: "low",
    },
  ];

  const alerts: Array<{
    level: "firing" | "resolved";
    name: string;
    desc: string;
    icon: string;
    lastFor: string;
  }> = [
    {
      level: "firing",
      name: "KitchenDoorOpen",
      desc: "Kitchen door open for 7 minutes — forgotten?",
      icon: "aqara",
      lastFor: "7m",
    },
    {
      level: "firing",
      name: "DishwasherRunning",
      desc: "Bosch dishwasher — Auto 65°C cycle, 42 min remaining",
      icon: "bosch",
      lastFor: "18m",
    },
    {
      level: "firing",
      name: "NestCoolingActive",
      desc: "Google Nest cooling the Living Room zone to 70°F (at 74°F)",
      icon: "nest",
      lastFor: "3m",
    },
    {
      level: "firing",
      name: "DryerRunning",
      desc: "LG dryer — permanent-press cycle, 20 min remaining",
      icon: "lg",
      lastFor: "62m",
    },
    {
      level: "firing",
      name: "OllamaGpuUtilizationHigh",
      desc: "ollama-chat GPU at 72% sustained for 4 min",
      icon: "ollama",
      lastFor: "4m",
    },
    {
      level: "firing",
      name: "PlexTranscodeQueueDeep",
      desc: "Plex transcode backlog > 2 sessions",
      icon: "plex",
      lastFor: "9m",
    },
    {
      level: "resolved",
      name: "PfSenseWanJitter",
      desc: "WAN jitter recovered, back under 2ms",
      icon: "pfsense",
      lastFor: "2h",
    },
  ];

  // Build scrape targets from the homelab array itself.
  const targets = homelab
    .filter((h) => h.kind !== "docker" && h.name !== "prometheus")
    .map((h) => ({
      icon: h.icon,
      service: h.service,
      job: h.name,
      instance: `${h.name}.lab.local:9100`,
      up: true,
      lastScrapeMs: 120 + ((h.vmid * 17) % 180),
      cpu: h.cpu,
      mem: h.mem,
    }));

  return (
    <div className="space-y-4">
      {/* Prometheus topbar */}
      <div className="rounded-lg overflow-hidden border border-black/40">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#e6522c] to-[#b13b1c]">
          <ServiceIcon icon="prometheus" size={28} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              Prometheus
            </div>
            <div className="text-white/85 text-[11px] font-mono">
              prom.lab.local · v2.53 · status{" "}
              <span className="text-emerald-200">● running</span> ·{" "}
              {targets.length} targets up · 48.2M samples
            </div>
          </div>
          <div className="ml-auto text-white/85 text-[11px] font-mono">
            Graph / Alerts / Status / Help
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-3 bg-[#11131a]">
          {/* Scrape targets — pretty card grid */}
          <section className="col-span-12 bg-[#1b1e23] border border-black/40 rounded overflow-hidden">
            <header className="px-3 py-2 flex items-center gap-2 bg-[#22262c] border-b border-black/40">
              <span className="text-[12px] text-white">Scrape targets</span>
              <span className="text-[10.5px] text-zinc-500 font-mono">
                /targets
              </span>
              <span className="ml-auto text-[10.5px] font-mono">
                <span className="text-emerald-300">● {targets.length} up</span>
                <span className="text-zinc-600 mx-2">·</span>
                <span className="text-zinc-400">0 down</span>
              </span>
            </header>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {targets.map((t) => (
                <TargetCard key={t.job} t={t} />
              ))}
            </div>
          </section>

          {/* Frigate AI detection feed */}
          <section className="col-span-12 lg:col-span-6 bg-[#1b1e23] border border-black/40 rounded overflow-hidden">
            <header className="px-3 py-1.5 flex items-center gap-2 bg-[#22262c] border-b border-black/40">
              <ServiceIcon icon="frigate" size={16} />
              <span className="text-[12px] text-white/90">
                Frigate detections
              </span>
              <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
                last 12h · AI captions by local LLM
              </span>
            </header>
            <ul className="divide-y divide-black/30">
              {detections.map((d, i) => (
                <li key={i} className="px-3 py-2 hover:bg-[#22262c]">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span className="text-[#ffcb05]">●</span>
                    <span>{d.cam}</span>
                    <span className="text-zinc-600">·</span>
                    <span>{d.at}</span>
                    <span className="ml-auto text-zinc-500">{d.tag}</span>
                  </div>
                  <div className="text-[13px] text-white/90 leading-snug mt-0.5">
                    {d.desc}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Alerts */}
          <section className="col-span-12 lg:col-span-6 bg-[#1b1e23] border border-black/40 rounded overflow-hidden">
            <header className="px-3 py-1.5 flex items-center gap-2 bg-[#22262c] border-b border-black/40">
              <span className="text-[12px] text-white/90">Alerts</span>
              <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
                /alerts · {alerts.filter((a) => a.level === "firing").length}{" "}
                firing
              </span>
            </header>
            <ul className="divide-y divide-black/30">
              {alerts.map((a) => (
                <li
                  key={a.name}
                  className="px-3 py-2 flex items-start gap-3 hover:bg-[#22262c]"
                >
                  <div className="flex-none flex flex-col items-center gap-1 pt-0.5">
                    <ServiceIcon icon={a.icon} size={22} />
                    <span
                      className={`text-[9px] font-mono tracking-wider px-1 rounded ${
                        a.level === "firing"
                          ? "bg-red-500/15 text-red-300 border border-red-500/40"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {a.level === "firing" ? "FIRING" : "RESOLVED"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 font-mono text-[12px] truncate">
                      {a.name}
                    </div>
                    <div className="text-[11.5px] text-zinc-300 leading-snug mt-0.5">
                      {a.desc}
                    </div>
                  </div>
                  <span className="flex-none text-zinc-500 font-mono text-[11px]">
                    {a.lastFor}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Top CPU consumers */}
          <section className="col-span-12 bg-[#1b1e23] border border-black/40 rounded overflow-hidden">
            <header className="px-3 py-1.5 flex items-center gap-2 bg-[#22262c] border-b border-black/40">
              <span className="text-[12px] text-white/90">
                Top services by CPU
              </span>
              <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
                rate(process_cpu_seconds_total[5m])
              </span>
            </header>
            <div className="p-3 space-y-1.5">
              {[...homelab]
                .filter((h) => h.kind !== "docker")
                .sort((a, b) => b.cpu - a.cpu)
                .slice(0, 8)
                .map((h) => (
                  <div
                    key={h.vmid}
                    className="flex items-center gap-3 text-[12px]"
                  >
                    <ServiceIcon icon={h.icon} size={14} />
                    <span className="text-white/90 w-40 truncate">
                      {h.service}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#e6522c] to-[#ffb547]"
                        style={{ width: `${Math.min(100, h.cpu * 1.8)}%` }}
                      />
                    </div>
                    <span className="font-mono text-zinc-300 w-12 text-right">
                      {h.cpu.toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ LXC {item.vmid} · pve-homelab-01 · retention 30d · Alertmanager +
        Grafana datasource attached
      </div>
    </div>
  );
}

function TargetCard({
  t,
}: {
  t: {
    icon: string;
    service: string;
    job: string;
    instance: string;
    up: boolean;
    lastScrapeMs: number;
    cpu: number;
    mem: number;
  };
}) {
  return (
    <article
      className="relative bg-gradient-to-b from-[#181b22] to-[#13161c] border border-white/5 rounded-lg overflow-hidden hover:border-white/15 transition group"
      style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.35)" }}
    >
      {/* top accent bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background:
            "linear-gradient(to right, rgba(230,82,44,0.6), rgba(230,82,44,0))",
        }}
      />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-black/40 border border-white/10 flex items-center justify-center flex-none">
            <ServiceIcon icon={t.icon} size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white text-[13px] font-medium truncate">
                {t.service}
              </span>
              <span
                className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 text-[9.5px] font-mono rounded border bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
                UP
              </span>
            </div>
            <div className="text-[10.5px] text-zinc-500 font-mono truncate mt-0.5">
              {t.job} · {t.instance}
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Metric label="CPU" value={`${t.cpu.toFixed(0)}%`} pct={t.cpu} color="#e6522c" />
          <Metric
            label="MEM"
            value={`${t.mem.toFixed(0)}%`}
            pct={t.mem}
            color="#3b82f6"
          />
          <Metric
            label="SCRAPE"
            value={`${t.lastScrapeMs}ms`}
            pct={Math.min(100, t.lastScrapeMs / 4)}
            color="#9ece6a"
            mono
          />
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  pct,
  color,
  mono,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-[9.5px] font-mono">
        <span className="text-zinc-500">{label}</span>
        <span className={mono ? "text-zinc-300" : "text-zinc-200"}>
          {value}
        </span>
      </div>
      <div className="h-1 mt-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(4, Math.min(100, pct))}%`,
            background: `linear-gradient(to right, ${color}, ${color}aa)`,
            boxShadow: `0 0 4px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}

/* Deterministic helpers for the pfSense live-traffic graphs. */
function seed(n: number, fn: (i: number) => number): number[] {
  return Array.from({ length: n }, (_, i) => Math.max(0, fn(i)));
}
function wiggle(tick: number, salt: number, amplitude: number): number {
  // Hash-like sine mix produces smooth pseudo-random values without
  // calling Math.random during render.
  return (
    (Math.sin(tick * 0.37 + salt) +
      Math.sin(tick * 0.83 + salt * 2.1) +
      Math.sin(tick * 1.21 + salt * 3.7)) *
    (amplitude / 3)
  );
}
function shiftSeries(prev: number[], delta: number, floor: number): number[] {
  const next = prev[prev.length - 1] + delta;
  return [...prev.slice(1), Math.max(floor, next)];
}

/* =================== pfSense — live dashboard =================== */

function PfSensePanel({ item }: { item: (typeof homelab)[number] }) {
  // Live-ish rolling traffic series. Rerender every 1s, push new sample
  // in on each tick, shift oldest off. Mbps in/out per interface.
  const [tick, setTick] = useState(0);
  // Deterministic seed so SSR + client match. Sine waves look realistic.
  const [wan, setWan] = useState<{ in: number[]; out: number[] }>(() => ({
    in: seed(60, (i) => 80 + Math.sin(i / 6) * 28 + Math.sin(i / 2) * 10),
    out: seed(60, (i) => 22 + Math.sin(i / 4) * 10 + Math.sin(i / 9) * 5),
  }));
  const [lan, setLan] = useState<{ in: number[]; out: number[] }>(() => ({
    in: seed(60, (i) => 260 + Math.sin(i / 5) * 90 + Math.sin(i / 2) * 30),
    out: seed(60, (i) => 240 + Math.sin(i / 3) * 70 + Math.sin(i / 7) * 30),
  }));

  useEffect(() => {
    // Per-tick deltas use a mulberry32 PRNG seeded off the tick + series,
    // so we avoid raw Math.random (ESLint purity rule) while still getting
    // the live-wiggly look.
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setTick((n) => n + 1);
      setWan((prev) => ({
        in: shiftSeries(prev.in, wiggle(t, 1, 30), 8),
        out: shiftSeries(prev.out, wiggle(t, 2, 12), 2),
      }));
      setLan((prev) => ({
        in: shiftSeries(prev.in, wiggle(t, 3, 70), 40),
        out: shiftSeries(prev.out, wiggle(t, 4, 60), 30),
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const wanNow = wan.in[wan.in.length - 1];
  const lanNow = lan.in[lan.in.length - 1];

  return (
    <div className="space-y-4">
      {/* pfSense topbar */}
      <div className="rounded overflow-hidden border border-black/40">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1f2d3d] border-b border-black/50">
          <ServiceIcon icon="pfsense" size={30} />
          <div>
            <div className="text-white font-semibold text-[15px]">
              pfSense · gateway.lab.local
            </div>
            <div className="text-white/70 text-[11px] font-mono">
              2.7.2-RELEASE (amd64) · FreeBSD 14.0 · logged in as admin ·
              uptime 87d 14h
            </div>
          </div>
          <div className="ml-auto text-[11px] font-mono text-emerald-300">
            ● active · tick {tick}
          </div>
        </div>

        {/* Dashboard grid — widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 bg-[#14181f]">
          {/* System info */}
          <DashCard title="System Information">
            <Kv k="Hostname" v="gateway.lab.local" />
            <Kv k="System" v="Netgate pfSense VM (KVM, Proxmox)" />
            <Kv k="BIOS" v="SeaBIOS · OVMF (UEFI)" />
            <Kv k="CPU Type" v="Intel Xeon (4 vCPU, 2 sockets)" />
            <Kv k="CPU usage" v={`${8 + (tick % 5)}%`} />
            <Kv k="Memory usage" v={`${18 + (tick % 4)}%`} />
            <Kv
              k="Temperature"
              v={`${54 + ((tick * 3) % 6)} °C`}
            />
            <Kv k="Uptime" v="87 days, 14 hours" />
          </DashCard>

          {/* Interfaces */}
          <DashCard title="Interfaces">
            <IfRow
              name="WAN"
              state="1000baseT"
              v4="104.28.xx.xx"
              up
            />
            <IfRow
              name="LAN"
              state="10GbaseT"
              v4="10.10.0.1"
              up
            />
            <IfRow
              name="OPT1 (IoT)"
              state="1000baseT"
              v4="10.10.20.1"
              up
            />
            <IfRow
              name="OPT2 (DMZ)"
              state="1000baseT"
              v4="10.10.30.1"
              up
            />
            <IfRow
              name="OPT3 (Guest)"
              state="1000baseT"
              v4="10.10.40.1"
              up
            />
          </DashCard>

          {/* Gateway status */}
          <DashCard title="Gateways">
            <GwRow
              name="WAN_DHCP"
              ip="104.28.xx.1"
              rttMs={3.1 + Math.sin(tick / 5) * 0.8}
              loss={0}
            />
            <GwRow
              name="WAN_v6"
              ip="2606:4700:xxx::1"
              rttMs={5.2 + Math.cos(tick / 4) * 0.6}
              loss={0}
            />
            <GwRow
              name="VPN_WG"
              ip="100.64.0.1"
              rttMs={11.8 + Math.sin(tick / 3) * 1.2}
              loss={0}
            />
          </DashCard>

          {/* Live WAN traffic */}
          <div className="lg:col-span-2">
            <DashCard
              title="Traffic Graph — WAN"
              hint={`in ${wanNow.toFixed(0)} Mbps · out ${wan.out[wan.out.length - 1].toFixed(0)} Mbps`}
            >
              <TrafficGraph
                inSeries={wan.in}
                outSeries={wan.out}
                max={260}
                color="#f7941d"
              />
            </DashCard>
          </div>

          {/* Services */}
          <DashCard title="Services">
            {[
              ["unbound", "DNS resolver"],
              ["dhcpd", "DHCP server"],
              ["dpinger", "Gateway monitor"],
              ["openvpn", "VPN server"],
              ["wireguard", "VPN server"],
              ["ntpd", "Time sync"],
              ["haproxy", "Reverse proxy"],
            ].map(([svc, desc]) => (
              <div
                key={svc}
                className="flex items-center gap-2 py-0.5 text-[12px]"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
                <span className="text-zinc-200 font-mono w-24">{svc}</span>
                <span className="text-zinc-500">{desc}</span>
                <span className="ml-auto text-[10px] text-emerald-300 font-mono">
                  running
                </span>
              </div>
            ))}
          </DashCard>

          {/* Live LAN traffic */}
          <div className="lg:col-span-3">
            <DashCard
              title="Traffic Graph — LAN"
              hint={`in ${lanNow.toFixed(0)} Mbps · out ${lan.out[lan.out.length - 1].toFixed(0)} Mbps`}
            >
              <TrafficGraph
                inSeries={lan.in}
                outSeries={lan.out}
                max={500}
                color="#00a8e8"
              />
            </DashCard>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ VM {item.vmid} · pve-homelab-01 · virtio nic passthrough · pfSense
        kernel module ports: PPPoE, OpenVPN, WireGuard, IPsec
      </div>
    </div>
  );
}

function DashCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#1b1e23] border border-black/40 rounded overflow-hidden">
      <header className="px-3 py-1.5 flex items-center gap-2 bg-[#22262c] border-b border-black/40">
        <span className="text-[11.5px] text-zinc-200">{title}</span>
        {hint && (
          <span className="ml-auto text-[10.5px] text-zinc-500 font-mono">
            {hint}
          </span>
        )}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function IfRow({
  name,
  state,
  v4,
  up,
}: {
  name: string;
  state: string;
  v4: string;
  up: boolean;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_110px] items-center gap-2 py-0.5 text-[12px]">
      <span className="flex items-center gap-1.5 text-zinc-200 font-mono">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            up ? "bg-emerald-400" : "bg-zinc-600"
          }`}
          style={{
            boxShadow: up ? "0 0 4px rgba(52,211,153,0.9)" : undefined,
          }}
        />
        {name}
      </span>
      <span className="text-zinc-500 truncate">{state}</span>
      <span className="text-zinc-300 font-mono text-right">{v4}</span>
    </div>
  );
}

function GwRow({
  name,
  ip,
  rttMs,
  loss,
}: {
  name: string;
  ip: string;
  rttMs: number;
  loss: number;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr_60px_50px] items-center gap-2 py-0.5 text-[12px]">
      <span className="flex items-center gap-1.5 text-zinc-200 font-mono">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]" />
        {name}
      </span>
      <span className="text-zinc-500 font-mono truncate">{ip}</span>
      <span className="text-zinc-300 font-mono text-right">
        {rttMs.toFixed(1)} ms
      </span>
      <span className="text-emerald-300 font-mono text-right">
        {loss.toFixed(0)} %
      </span>
    </div>
  );
}

function TrafficGraph({
  inSeries,
  outSeries,
  max,
  color,
}: {
  inSeries: number[];
  outSeries: number[];
  max: number;
  color: string;
}) {
  const w = 720;
  const h = 140;
  const n = inSeries.length;
  const stepX = w / (n - 1);

  const toPoints = (arr: number[]) =>
    arr.map((v, i) => `${i * stepX},${h - (v / max) * h}`).join(" ");

  const inPoints = toPoints(inSeries);
  const outPoints = toPoints(outSeries);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="tg-in" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.5" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="tg-out" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7b9fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#7b9fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={w}
          y1={h * (1 - g)}
          y2={h * (1 - g)}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="3 4"
        />
      ))}
      {/* in area */}
      <polygon
        points={`0,${h} ${inPoints} ${w},${h}`}
        fill="url(#tg-in)"
      />
      <polyline
        points={inPoints}
        fill="none"
        stroke={color}
        strokeWidth="1.3"
      />
      {/* out line (no area) */}
      <polyline
        points={outPoints}
        fill="none"
        stroke="#7b9fff"
        strokeWidth="1.3"
        strokeDasharray="0"
      />
    </svg>
  );
}

/* =================== Channels DVR — UFC playback =================== */

function ChannelsDvrPanel({ item }: { item: (typeof homelab)[number] }) {
  return (
    <div className="space-y-4">
      {/* Channels DVR header strip */}
      <div
        className="rounded-lg overflow-hidden border border-black/50"
        style={{
          background: "linear-gradient(180deg, #14151B 0%, #0a0b0f 100%)",
        }}
      >
        {/* Channels-DVR branded title bar (looks like the real app chrome) */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#14151B]">
          <ServiceIcon icon="channels" size={34} />
          <div className="leading-tight">
            <div className="text-white text-[15px] font-semibold flex items-center gap-2">
              Channels
              <span className="px-1.5 py-[1px] text-[9px] font-bold tracking-widest rounded bg-gradient-to-r from-[#ffb547] to-[#ff7a18] text-black">
                DVR
              </span>
            </div>
            <div className="text-white/55 text-[10.5px] font-mono">
              Library · Live TV · Recordings · On Now
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[11px] font-mono text-[#ffb547]">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </div>
        </div>

        {/* Episode / recording metadata strip */}
        <div className="px-4 py-3 border-b border-white/10 bg-[#0f1016]">
          <div className="text-[10px] tracking-[0.3em] text-[#ffb547] font-mono">
            RECORDING · HIGHLIGHT EDIT
          </div>
          <div className="text-white text-xl font-semibold mt-0.5">
            Khabib Nurmagomedov vs Conor McGregor
          </div>
          <div className="text-white/60 text-[12px] mt-0.5">
            Skyfall Edit · Adele · UFC 229
          </div>
          <div className="text-white/40 text-[11px] font-mono mt-1">
            Channel 204 HD · captured from the UFC feed · 4K · H.265
          </div>
        </div>

        {/* Player — half-width, centered (per request) */}
        <div className="flex justify-center bg-black py-6">
          <div
            className="relative aspect-video bg-black border border-white/10 rounded overflow-hidden"
            style={{ width: "50%", minWidth: 320, maxWidth: 560 }}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/0nY2XhiTXg8?rel=0&modestbranding=1"
              title="Khabib vs McGregor · Skyfall — recorded on Channels DVR"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Channels DVR watermark top-left of the tile */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/65 border border-white/10 backdrop-blur pointer-events-none">
              <ServiceIcon icon="channels" size={14} />
              <span className="text-white/90 text-[10px] font-mono tracking-widest">
                CHANNELS DVR
              </span>
            </div>
          </div>
        </div>

        {/* Transport bar */}
        <div className="flex items-center gap-3 px-4 py-2 bg-black/60 border-t border-white/10 text-[11px] font-mono text-white/80">
          <span className="text-[#ffb547]">●</span>
          <span>RECORDING</span>
          <span className="text-white/40">·</span>
          <span>Highlight Reel</span>
          <span className="text-white/40">·</span>
          <span>CH 204 UFC</span>
          <span className="ml-auto text-white/50">
            storage: 1.32T / 2.00T
          </span>
        </div>
      </div>

      {/* Now + Next EPG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <EpgRow
          slot="NOW"
          title="UFC Fight Night — Main Card"
          time="22:00 – 01:00"
          badge="LIVE"
          badgeColor="#ef4444"
        />
        <EpgRow
          slot="NEXT"
          title="UFC Unfiltered"
          time="01:00 – 02:00"
          badge="REC"
          badgeColor="#ff6a00"
        />
      </div>

      {/* Upcoming recordings */}
      <div className="bg-[#1b1e23] border border-black/40 rounded">
        <div className="px-4 py-2.5 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40 flex items-center gap-2">
          <span>Upcoming recordings</span>
          <span className="ml-auto text-[10.5px] text-[#ffb547] font-mono">
            ● 8 scheduled
          </span>
        </div>
        <ul className="divide-y divide-black/30 text-[12px]">
          {[
            {
              icon: "⚾",
              league: "MLB",
              title: "NY Mets vs NY Yankees",
              sub: "Subway Series · Citi Field",
              ch: "SNY HD · CH 26",
              when: "Tonight 7:10 PM",
              status: "SCHEDULED",
            },
            {
              icon: "⚽",
              league: "La Liga",
              title: "FC Barcelona vs Real Madrid",
              sub: "El Clásico · Camp Nou",
              ch: "ESPN+ · CH 206",
              when: "Sat 3:00 PM",
              status: "SCHEDULED",
            },
            {
              icon: "⚽",
              league: "MLS",
              title: "Inter Miami CF vs LAFC",
              sub: "Messi expected to start",
              ch: "Apple TV · MLS Season Pass",
              when: "Sat 8:30 PM",
              status: "SCHEDULED",
            },
            {
              icon: "🥊",
              league: "UFC",
              title: "UFC Fight Night — Main Card",
              sub: "5 fights · Prelims 7 PM",
              ch: "ESPN+ · PPV 204",
              when: "Tomorrow 10:00 PM",
              status: "RECORDING",
            },
            {
              icon: "⚾",
              league: "MLB",
              title: "NY Mets @ Atlanta Braves",
              sub: "Division rivalry",
              ch: "SNY HD · CH 26",
              when: "Sun 1:35 PM",
              status: "SCHEDULED",
            },
            {
              icon: "⚽",
              league: "UCL",
              title: "FC Barcelona vs Bayern Munich",
              sub: "Champions League group stage",
              ch: "CBS Sports · CH 306",
              when: "Wed 3:00 PM",
              status: "SCHEDULED",
            },
            {
              icon: "🥊",
              league: "UFC",
              title: "UFC 311 — Makhachev vs Tsarukyan",
              sub: "Lightweight title · Main event",
              ch: "ESPN+ PPV",
              when: "Jan 18 · 10:00 PM",
              status: "SCHEDULED",
            },
            {
              icon: "🥊",
              league: "UFC",
              title: "UFC Embedded · Vlog Series",
              sub: "Fight week behind the scenes",
              ch: "UFC Fight Pass",
              when: "Weekly",
              status: "SERIES",
            },
          ].map((r) => (
            <li
              key={r.title}
              className="px-4 py-2 flex items-center gap-3 hover:bg-[#22262c]"
            >
              <span className="text-xl w-7 text-center">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 text-[9.5px] font-mono tracking-widest rounded bg-[#ff6a00]/15 text-[#ffb547] border border-[#ff6a00]/40"
                  >
                    {r.league}
                  </span>
                  <span className="text-white/90 truncate">{r.title}</span>
                </div>
                <div className="text-[10.5px] text-white/55 font-mono mt-0.5 truncate">
                  {r.sub} · {r.ch}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-white/90 font-mono">
                  {r.when}
                </div>
                <div
                  className={`text-[9.5px] font-mono mt-0.5 ${
                    r.status === "RECORDING"
                      ? "text-red-400"
                      : r.status === "SERIES"
                        ? "text-[#7b9fff]"
                        : "text-[#ffb547]"
                  }`}
                >
                  ●{" "}
                  {r.status}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Tiny node metadata */}
      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ {item.kind.toUpperCase()} {item.vmid} · pve-homelab-01 · storage
        2T · HDHomeRun tuner attached
      </div>
    </div>
  );
}

function EpgRow({
  slot,
  title,
  time,
  badge,
  badgeColor,
}: {
  slot: string;
  title: string;
  time: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="bg-[#1b1e23] border border-black/40 rounded p-4 flex items-center gap-3">
      <div className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 w-10">
        {slot}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white truncate">{title}</div>
        <div className="text-[11px] text-zinc-500 font-mono">{time}</div>
      </div>
      <span
        className="px-2 py-0.5 text-[10px] font-mono rounded"
        style={{
          background: `${badgeColor}22`,
          border: `1px solid ${badgeColor}66`,
          color: badgeColor,
        }}
      >
        {badge}
      </span>
    </div>
  );
}

/* =================== Pi-hole — real dashboard mockup =================== */

function PiholePanel({ item }: { item: (typeof homelab)[number] }) {
  // Deterministic "traffic" from each homelab VM, excluding pihole itself.
  const clients = homelab
    .filter((h) => h.vmid !== item.vmid)
    .map((h, i) => {
      const base = 1200 + (h.vmid % 37) * 180 + i * 90;
      const blocked = Math.round(base * (0.12 + (h.vmid % 11) * 0.018));
      return {
        name: h.name,
        icon: h.icon,
        host: `${h.name}.lab.local`,
        requests: base,
        blocked,
      };
    })
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  const totalQueries = clients.reduce((s, c) => s + c.requests, 0) + 3821;
  const totalBlocked = clients.reduce((s, c) => s + c.blocked, 0) + 612;
  const pctBlocked = ((totalBlocked / totalQueries) * 100).toFixed(1);
  const blocklistSize = 1_284_937;

  const topDomains: Array<[string, number]> = [
    ["doubleclick.net", 4821],
    ["googlesyndication.com", 3912],
    ["facebook.com", 2714],
    ["googleads.g.doubleclick.net", 2288],
    ["scorecardresearch.com", 1734],
    ["analytics.tiktok.com", 1409],
    ["adservice.google.com", 1211],
    ["criteo.com", 980],
  ];

  return (
    <div className="space-y-4">
      {/* Pi-hole header */}
      <div className="rounded overflow-hidden border border-[#96060C]/40 bg-[#14181f]">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#96060C] to-[#5a0307]">
          <div className="w-9 h-9 rounded flex items-center justify-center bg-black/30 border border-white/20 text-xl">
            🛡
          </div>
          <div>
            <div className="text-white font-semibold text-lg">
              Pi-hole Admin Console
            </div>
            <div className="text-white/70 text-[11px] font-mono">
              v5.18.3 · FTL v5.25 · pihole.lab.local · status{" "}
              <span className="text-emerald-300">● active</span>
            </div>
          </div>
          <div className="ml-auto text-[11px] font-mono text-white/70">
            Last 24 hours
          </div>
        </div>

        {/* Four big number tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-black/40">
          <PiholeTile
            accent="#00a8e8"
            label="Total queries"
            value={totalQueries.toLocaleString()}
            hint="from 14 clients"
          />
          <PiholeTile
            accent="#f7941d"
            label="Queries blocked"
            value={totalBlocked.toLocaleString()}
            hint="ads, trackers, telemetry"
          />
          <PiholeTile
            accent="#f14668"
            label="Percent blocked"
            value={`${pctBlocked}%`}
            hint="of all DNS requests"
          />
          <PiholeTile
            accent="#2bc48a"
            label="Domains on blocklist"
            value={blocklistSize.toLocaleString()}
            hint="7 blocklists subscribed"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1b1e23] border border-black/40 rounded">
        <div className="px-4 py-2.5 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40">
          Queries over last 24 hours
        </div>
        <div className="p-3">
          <PiholeChart />
          <div className="flex items-center gap-4 mt-1 text-[11px] font-mono text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#00a8e8]" /> permitted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#f7941d]" /> blocked
            </span>
          </div>
        </div>
      </div>

      {/* Top clients + top blocked side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top clients */}
        <div className="bg-[#1b1e23] border border-black/40 rounded">
          <div className="px-4 py-2.5 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40">
            Top clients (activity by homelab VM)
          </div>
          <table className="w-full text-[12px]">
            <thead className="text-zinc-500 bg-[#191c21]">
              <tr>
                <th className="text-left font-normal px-3 py-1.5">Client</th>
                <th className="text-right font-normal px-3 py-1.5">
                  Requests
                </th>
                <th className="text-right font-normal px-3 py-1.5 w-28">
                  % of total
                </th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const pct = (c.requests / totalQueries) * 100;
                return (
                  <tr
                    key={c.name}
                    className="border-t border-black/30 hover:bg-[#22262c]"
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2 text-white/90">
                        <ServiceIcon icon={c.icon} size={14} />
                        <span className="truncate">{c.name}</span>
                        <span className="text-zinc-500 text-[10.5px] font-mono truncate">
                          {c.host}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-zinc-200">
                      {c.requests.toLocaleString()}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative h-1.5 w-16 rounded-sm bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-sm bg-[#00a8e8]"
                            style={{ width: `${Math.min(100, pct * 3)}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 font-mono w-10 text-right">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top blocked */}
        <div className="bg-[#1b1e23] border border-black/40 rounded">
          <div className="px-4 py-2.5 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40">
            Top blocked domains
          </div>
          <ul className="divide-y divide-black/30 text-[12px]">
            {topDomains.map(([d, c]) => {
              const pct = (c / totalBlocked) * 100;
              return (
                <li
                  key={d}
                  className="px-3 py-1.5 flex items-center gap-3 hover:bg-[#22262c]"
                >
                  <span className="text-[#f7941d]">✕</span>
                  <span className="flex-1 font-mono truncate text-white/90">
                    {d}
                  </span>
                  <span className="text-zinc-400 font-mono">
                    {c.toLocaleString()}
                  </span>
                  <span className="text-zinc-500 font-mono w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ LXC {item.vmid} · pve-homelab-01 · upstream DNS 1.1.1.1 +
        9.9.9.9 · blocklists updated {new Date().toISOString().slice(0, 10)}
      </div>
    </div>
  );
}

function PiholeTile({
  accent,
  label,
  value,
  hint,
}: {
  accent: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      className="px-4 py-3 border-l-4"
      style={{ borderLeftColor: accent, background: "#14181f" }}
    >
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-2xl font-semibold text-white mt-0.5">{value}</div>
      <div className="text-[10.5px] text-zinc-500 mt-0.5">{hint}</div>
    </div>
  );
}

function PiholeChart() {
  // 24 hourly bars + a smooth area line for permitted requests.
  const hours = 24;
  const data = Array.from({ length: hours }).map((_, i) => {
    const phase = (i / hours) * Math.PI * 2;
    const base = 420 + Math.sin(phase - 1) * 140 + Math.sin(phase * 2) * 60;
    const total = Math.max(80, Math.round(base + (i % 5) * 22));
    const blocked = Math.round(total * (0.14 + Math.sin(phase / 2) * 0.06));
    return { total, blocked };
  });
  const maxV = Math.max(...data.map((d) => d.total));
  const w = 720;
  const h = 140;
  const barW = w / hours - 3;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      {/* grid lines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={w}
          y1={h * (1 - g)}
          y2={h * (1 - g)}
          stroke="rgba(255,255,255,0.06)"
          strokeDasharray="3 4"
        />
      ))}
      {data.map((d, i) => {
        const x = i * (w / hours) + 1.5;
        const th = (d.total / maxV) * h;
        const bh = (d.blocked / maxV) * h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={h - th}
              width={barW}
              height={th}
              fill="#00a8e8"
              opacity="0.75"
              rx="1.5"
            />
            <rect
              x={x}
              y={h - bh}
              width={barW}
              height={bh}
              fill="#f7941d"
              opacity="0.9"
              rx="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

function MiniUsage({
  label,
  value,
  color,
  unit,
}: {
  label: string;
  value: number;
  color: string;
  unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-mono">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(to right, ${color}, ${color}aa)`,
            boxShadow: `0 0 6px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}

function FirewallTab({ id }: { id: VmId }) {
  const vm = vms.find((v) => v.id === id)!;
  const rules: Array<{
    on: boolean;
    action: "ACCEPT" | "DROP" | "REJECT";
    type: "in" | "out";
    proto: string;
    dport: string;
    source: string;
    comment: string;
  }> = [
    {
      on: true,
      action: "DROP",
      type: "in",
      proto: "all",
      dport: "0-65535",
      source: "0.0.0.0/0",
      comment: "default-deny inbound (all ports secured)",
    },
    {
      on: true,
      action: "ACCEPT",
      type: "in",
      proto: "tcp",
      dport: "22",
      source: "10.0.0.0/8",
      comment: "SSH — admin subnet only",
    },
    {
      on: true,
      action: "ACCEPT",
      type: "in",
      proto: "tcp",
      dport: "443",
      source: "10.20.0.0/16",
      comment: "HTTPS — mgmt / cluster only",
    },
    {
      on: true,
      action: "ACCEPT",
      type: "out",
      proto: "all",
      dport: "any",
      source: "any",
      comment: "egress allowed",
    },
    {
      on: true,
      action: "DROP",
      type: "in",
      proto: "icmp",
      dport: "any",
      source: "0.0.0.0/0",
      comment: "block ICMP echo from public",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Headline status */}
      <div className="bg-emerald-950/30 border border-emerald-800/60 rounded p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2 L4 5 v6 c0 5 4 9 8 11 c4-2 8-6 8-11 V5 Z"
              stroke="#34d399"
              strokeWidth="1.8"
              fill="rgba(52,211,153,0.1)"
            />
            <path
              d="M8 12 l3 3 l5-6"
              stroke="#34d399"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-emerald-300 font-mono tracking-[0.3em]">
            FIREWALL STATUS
          </div>
          <div className="text-[15px] text-white font-medium mt-0.5">
            All ports secured
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
            Default-deny inbound · {vm.name} · last audit{" "}
            {new Date().toISOString().slice(0, 10)} — 0 drift
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
          <span className="text-emerald-300">ACTIVE</span>
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FirewallTile label="Enabled" value="Yes" emerald />
        <FirewallTile label="Input policy" value="DROP" />
        <FirewallTile label="Output policy" value="ACCEPT" />
        <FirewallTile label="Logging" value="info → /var/log/fw" />
      </div>

      {/* Rules table */}
      <div className="bg-[#1b1e23] border border-black/40 rounded">
        <div className="px-4 py-2.5 text-[12px] text-zinc-300 bg-[#22262c] border-b border-black/40 flex items-center gap-3">
          <span>Rules</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">
            {rules.length} active, 0 pending
          </span>
          <span className="ml-auto text-[11px] text-emerald-300 font-mono">
            ● rule set in sync across cluster
          </span>
        </div>
        <table className="w-full text-[12px]">
          <thead className="text-zinc-500 bg-[#191c21]">
            <tr>
              <th className="text-left font-normal px-3 py-1.5 w-16">On</th>
              <th className="text-left font-normal px-3 py-1.5 w-20">Type</th>
              <th className="text-left font-normal px-3 py-1.5 w-24">Action</th>
              <th className="text-left font-normal px-3 py-1.5 w-20">Proto</th>
              <th className="text-left font-normal px-3 py-1.5 w-28">Dest Port</th>
              <th className="text-left font-normal px-3 py-1.5 w-40">Source</th>
              <th className="text-left font-normal px-3 py-1.5">Comment</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr
                key={i}
                className="border-t border-black/30 hover:bg-[#22262c] text-zinc-300 font-mono"
              >
                <td className="px-3 py-1.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      r.on ? "bg-emerald-400" : "bg-zinc-600"
                    }`}
                  />
                </td>
                <td className="px-3 py-1.5 text-zinc-400">{r.type}</td>
                <td
                  className={`px-3 py-1.5 font-medium ${
                    r.action === "ACCEPT"
                      ? "text-emerald-300"
                      : r.action === "DROP"
                        ? "text-red-300"
                        : "text-amber-300"
                  }`}
                >
                  {r.action}
                </td>
                <td className="px-3 py-1.5">{r.proto}</td>
                <td className="px-3 py-1.5">{r.dport}</td>
                <td className="px-3 py-1.5">{r.source}</td>
                <td className="px-3 py-1.5 text-zinc-400 font-sans">
                  {r.comment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-zinc-500 font-mono">
        ▸ fail2ban: enabled · SSH bruteforce bans after 5 attempts / 10m
        <br />
        ▸ conntrack: 24 active flows · max 65,536
        <br />
        ▸ no open ports from the public internet
      </div>
    </div>
  );
}

function FirewallTile({
  label,
  value,
  emerald,
}: {
  label: string;
  value: string;
  emerald?: boolean;
}) {
  return (
    <div className="bg-[#1b1e23] border border-black/40 rounded p-3">
      <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
      <div
        className={`mt-1 text-[14px] font-mono ${
          emerald ? "text-emerald-400" : "text-zinc-200"
        }`}
      >
        {emerald && (
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 align-middle shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
        )}
        {value}
      </div>
    </div>
  );
}

function EmptyTab({ name }: { name: string }) {
  return (
    <div className="bg-[#1b1e23] border border-black/40 rounded p-8 text-center text-zinc-400 text-[13px]">
      No {name.toLowerCase()} configured.
    </div>
  );
}

/* =================== Task log =================== */

const TASKS = [
  ["2026-04-19 20:41:12", "2026-04-19 20:41:14", "pve-east-01", "jsanchez@pam", "VM 101 - Start", "OK"],
  ["2026-04-19 20:40:55", "2026-04-19 20:40:58", "pve-east-01", "jsanchez@pam", "VM 102 - Console", "OK"],
  ["2026-04-19 20:36:03", "2026-04-19 20:37:41", "pve-east-01", "jsanchez@pam", "VM 103 - Backup", "OK"],
  ["2026-04-19 20:18:47", "2026-04-19 20:19:02", "pve-east-01", "jsanchez@pam", "VM 104 - Start", "OK"],
  ["2026-04-19 19:55:22", "2026-04-19 19:58:10", "pve-east-01", "jsanchez@pam", "Cluster - Replication", "OK"],
  ["2026-04-19 19:40:11", "2026-04-19 19:41:09", "pve-west-02", "jsanchez@pam", "Storage - Scan", "OK"],
  ["2026-04-19 18:12:00", "2026-04-19 18:14:45", "pve-east-01", "jsanchez@pam", "VM 101 - Snapshot (pre-migration)", "OK"],
];

function TaskLog({
  open,
  onToggle,
  selectedVm,
}: {
  open: boolean;
  onToggle: () => void;
  selectedVm: string;
}) {
  return (
    <div className="flex-none border-t border-black/50 bg-[#171a1f]">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 flex items-center gap-2 text-[12px] text-zinc-400 hover:bg-[#22262c]"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Tasks</span>
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-500">cluster log</span>
        <span className="ml-auto text-zinc-500">
          last active: {selectedVm}
        </span>
      </button>
      {open && (
        <div className="max-h-56 overflow-auto border-t border-black/40">
          <TaskLogTable />
        </div>
      )}
    </div>
  );
}

function TaskLogTable() {
  return (
    <table className="w-full text-[12px]">
      <thead className="text-zinc-500 bg-[#191c21]">
        <tr>
          <th className="text-left font-normal px-4 py-2">Start Time</th>
          <th className="text-left font-normal px-4 py-2">End Time</th>
          <th className="text-left font-normal px-4 py-2">Node</th>
          <th className="text-left font-normal px-4 py-2">User name</th>
          <th className="text-left font-normal px-4 py-2">Description</th>
          <th className="text-left font-normal px-4 py-2 w-20">Status</th>
        </tr>
      </thead>
      <tbody>
        {TASKS.map((row, i) => (
          <tr
            key={i}
            className="border-t border-black/30 hover:bg-[#22262c] text-zinc-300"
          >
            {row.map((c, j) => (
              <td
                key={j}
                className={`px-4 py-1.5 font-mono ${
                  j === 5 ? "text-emerald-400" : "text-zinc-300"
                }`}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
