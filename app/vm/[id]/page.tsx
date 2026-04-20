"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { vms, profile, projects, skills, type VmId } from "@/lib/content";
import { AboutDesktop } from "./_desktops/About";
import { ProjectsDesktop } from "./_desktops/Projects";
import { SkillsDesktop } from "./_desktops/Skills";
import { HobbiesDesktop } from "./_desktops/Hobbies";
import { ContactDesktop } from "./_desktops/Contact";

type Phase = "bios" | "boot" | "login" | "desktop";

export default function VmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const vm = vms.find((v) => v.id === id);
  if (!vm) notFound();

  const [phase, setPhase] = useState<Phase>("bios");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("boot"), 1700);
    const t2 = setTimeout(() => setPhase("login"), 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const isLinux = /linux|debian|ubuntu|fedora|manjaro/i.test(vm!.os);

  return (
    <div className="relative min-h-screen w-full bg-black text-sl-ink overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "bios" &&
          (isLinux ? (
            <LinuxBootScreen key="bios" vmId={vm!.id as VmId} />
          ) : (
            <BiosScreen key="bios" vmId={vm!.id as VmId} />
          ))}
        {phase === "boot" &&
          (isLinux ? (
            <LinuxSystemdScreen key="boot" vmId={vm!.id as VmId} />
          ) : (
            <BootSpinner key="boot" />
          ))}
        {phase === "login" &&
          (isLinux ? (
            <GdmLoginScreen
              key="login"
              vmId={vm!.id as VmId}
              onUnlock={() => setPhase("desktop")}
            />
          ) : (
            <LoginScreen
              key="login"
              vmId={vm!.id as VmId}
              onUnlock={() => setPhase("desktop")}
            />
          ))}
        {phase === "desktop" && (
          <DesktopShell key="desktop" vmId={vm!.id as VmId} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ BIOS / POST ============ */

function BiosScreen({ vmId }: { vmId: VmId }) {
  const vm = vms.find((v) => v.id === vmId)!;
  const lines = [
    "SeaBIOS (version rel-1.16.3-0-ga6ed6b701f-prebuilt.qemu.org)",
    `Node: pve-east-01   Host: ${vm.name}`,
    "CPU: Intel Xeon Platinum 8480+ (24 vCPU assigned)",
    "Memory test: 32768 MB ... OK",
    "Loading PCI devices ... OK",
    "Detecting vNICs ... vnet0, vnet1 OK",
    "Detecting vDisks ... scsi0 (128G), scsi1 (512G) OK",
    `Booting ${vm.os} ...`,
  ];
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setShown((s) => (i < lines.length ? [...s, lines[i]] : s));
      i++;
      if (i > lines.length) clearInterval(t);
    }, 160);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-black font-mono text-[12px] text-sl-cyan/90 p-6"
    >
      {shown.map((l, i) => (
        <div key={i} className="leading-5">
          <span className="text-sl-violet">{"> "}</span>
          {l}
        </div>
      ))}
      <span className="caret">_</span>
    </motion.div>
  );
}

/* ============ Boot spinner (Win11) ============ */

function BootSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-8"
    >
      {/* Windows-ish quad logo in cyan */}
      <div className="grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-6 h-6 bg-sl-cyan/90"
            style={{ boxShadow: "0 0 10px rgba(77,214,255,0.8)" }}
          />
        ))}
      </div>
      {/* Dot ring spinner */}
      <div className="relative w-14 h-14">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-sl-cyan"
            style={{
              transform: `rotate(${i * 45}deg) translateY(-22px)`,
              opacity: 0.2 + (i / 8) * 0.8,
              animation: `spin 1s linear infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
      <div className="text-sl-muted text-xs tracking-[0.3em] font-mono">
        STARTING WINDOWS 11 ENTERPRISE
      </div>
      <style>{`
        @keyframes spin {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
}

/* ============ Login screen ============ */

function LoginScreen({
  vmId,
  onUnlock,
}: {
  vmId: VmId;
  onUnlock: () => void;
}) {
  const vm = vms.find((v) => v.id === vmId)!;
  useEffect(() => {
    const t = setTimeout(onUnlock, 1600);
    return () => clearTimeout(t);
  }, [onUnlock]);
  const now = timeNow();
  const hh = now[0];
  const mm = now[1];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #021026 0%, #01061a 50%, #060018 100%)",
      }}
    >
      {/* Faint aurora */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(77,214,255,0.18), transparent 60%), radial-gradient(ellipse 50% 60% at 70% 70%, rgba(138,92,255,0.18), transparent 60%)",
        }}
      />
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <div className="text-6xl md:text-7xl font-light text-white">
            {hh}:{mm}
          </div>
          <div className="text-lg text-white/80 mt-1">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sl-cyan/70 to-sl-violet/80 flex items-center justify-center text-3xl font-light text-white shadow-[0_0_30px_rgba(77,214,255,0.4)]">
            JS
          </div>
          <div className="text-white text-xl">{profile.name}</div>
          <div className="text-white/60 text-xs font-mono">
            MERCK\jsanchez &middot; {vm.name}
          </div>
        </div>

        <div className="mt-4 text-[11px] text-white/60 font-mono tracking-[0.3em]">
          SIGNED IN &middot; WINDOWS HELLO
        </div>
      </div>
    </motion.div>
  );
}

function timeNow() {
  const d = new Date();
  return [String(d.getHours()).padStart(2, "0"), String(d.getMinutes()).padStart(2, "0")] as const;
}

/* ============ Win11 Desktop Shell ============ */

function DesktopShell({ vmId }: { vmId: VmId }) {
  const vm = vms.find((v) => v.id === vmId)!;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(11,30,58,0.95), #020617 60%)",
      }}
    >
      {/* Wallpaper highlight */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 35%, rgba(77,214,255,0.12), transparent 60%), radial-gradient(ellipse 50% 60% at 70% 75%, rgba(138,92,255,0.10), transparent 60%)",
        }}
      />
      {/* Subtle grid */}
      <div className="absolute inset-0 hex-grid opacity-20" aria-hidden />

      {/* Content area */}
      <div className="relative z-10 h-full pb-12">
        {vmId === "about-me" && <AboutDesktop />}
        {vmId === "projects" && <ProjectsDesktop projects={projects} />}
        {vmId === "skills" && <SkillsDesktop skills={skills} />}
        {vmId === "hobbies" && <HobbiesDesktop />}
        {vmId === "contact" && (
          <ContactDesktop
            name={profile.name}
            email={profile.contact.email}
          />
        )}
      </div>

      {/* Taskbar */}
      <Taskbar vmName={vm.name} vmOs={vm.os} />
    </motion.div>
  );
}

/* =================================================================
   Linux boot path (GRUB → systemd → GDM)
   ================================================================= */

function LinuxBootScreen({ vmId }: { vmId: VmId }) {
  const vm = vms.find((v) => v.id === vmId)!;
  const lines = [
    "GNU GRUB  version 2.06",
    "",
    "   *Debian GNU/Linux",
    "    Advanced options for Debian GNU/Linux",
    "    Memory test (memtest86+, serial console)",
    "",
    "Loading Linux 6.1.0-28-amd64 ...",
    "Loading initial ramdisk ...",
    `[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.1.0-28-amd64 root=UUID=... ro quiet`,
    `[    0.000000] x86/fpu: Supporting XSAVE feature 0x002: 'SSE registers'`,
    `[    0.002131] Booting ${vm.os} on pve-east-01 (kvm)`,
  ];
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setShown((s) => (i < lines.length ? [...s, lines[i]] : s));
      i++;
      if (i > lines.length) clearInterval(t);
    }, 140);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-black font-mono text-[12px] text-white/85 p-6"
    >
      {shown.map((l, i) => (
        <div key={i} className="leading-5">
          {l}
        </div>
      ))}
      <span className="caret">_</span>
    </motion.div>
  );
}

function LinuxSystemdScreen({ vmId }: { vmId: VmId }) {
  const vm = vms.find((v) => v.id === vmId)!;
  const units = [
    "Started Load Kernel Modules.",
    "Mounted /sys/kernel/config.",
    "Mounted FUSE Control File System.",
    "Started Create System Users.",
    "Started Create Static Device Nodes in /dev.",
    "Started udev Kernel Device Manager.",
    "Started Remount Root and Kernel File Systems.",
    "Started Load/Save Random Seed.",
    "Reached target Local File Systems.",
    "Started Journal Service.",
    "Started Network Service.",
    "Started OpenSSH server daemon.",
    "Started Permit User Sessions.",
    `Reached target Graphical Interface on ${vm.name}.`,
  ];
  const [shown, setShown] = useState<number>(0);
  useEffect(() => {
    const t = setInterval(() => {
      setShown((n) => (n >= units.length ? units.length : n + 1));
    }, 120);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 bg-black font-mono text-[12px] text-white/85 p-6 overflow-hidden"
    >
      {units.slice(0, shown).map((u, i) => (
        <div key={i} className="leading-5">
          <span className="text-emerald-400">[  OK  ]</span>{" "}
          <span className="text-white/85">{u}</span>
        </div>
      ))}
      <span className="caret">_</span>
    </motion.div>
  );
}

function GdmLoginScreen({
  vmId,
  onUnlock,
}: {
  vmId: VmId;
  onUnlock: () => void;
}) {
  const vm = vms.find((v) => v.id === vmId)!;
  useEffect(() => {
    const t = setTimeout(onUnlock, 1500);
    return () => clearTimeout(t);
  }, [onUnlock]);
  const now = timeNow();
  const hh = now[0];
  const mm = now[1];

  const theme = themeForOs(vm.os);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 overflow-hidden"
      style={{ background: theme.bg }}
    >
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-5 text-white">
        <div className="text-center">
          <div className="text-6xl md:text-7xl font-light">
            {hh}:{mm}
          </div>
          <div className="text-base text-white/70 mt-1">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold"
            style={{
              background: theme.avatar,
              boxShadow: theme.avatarGlow,
            }}
          >
            <span className="tracking-tight">JS</span>
          </div>
          <div className="text-xl">{profile.name}</div>
          <div className="text-white/60 text-xs font-mono">
            jsanchez@{vm.name}
          </div>
          <div className="text-white/50 text-[10px] font-mono tracking-widest">
            {theme.label}
          </div>
        </div>

        <div className="mt-2 text-[11px] text-white/60 font-mono tracking-[0.3em]">
          {theme.dm} · Authenticating…
        </div>
      </div>
    </motion.div>
  );
}

function themeForOs(os: string) {
  const o = os.toLowerCase();
  if (o.includes("manjaro")) {
    return {
      label: "MANJARO LINUX",
      dm: "SDDM",
      bg: "linear-gradient(135deg, #0f3a2e 0%, #062319 45%, #020d0a 100%)",
      avatar: "radial-gradient(circle at 30% 30%, #35bf5c, #0d7a3a)",
      avatarGlow: "0 0 30px rgba(53,191,92,0.5)",
    };
  }
  if (o.includes("ubuntu") || o.includes("azure")) {
    return {
      label: "UBUNTU 22.04 LTS",
      dm: "GDM",
      bg: "linear-gradient(135deg, #2b0a2b 0%, #1a0614 45%, #0d0d14 100%)",
      avatar: "radial-gradient(circle at 30% 30%, #e95420, #772953)",
      avatarGlow: "0 0 30px rgba(233,84,32,0.5)",
    };
  }
  if (o.includes("fedora")) {
    return {
      label: "FEDORA WORKSTATION 41",
      dm: "GDM",
      bg: "linear-gradient(135deg, #0a1f3e 0%, #051530 45%, #020913 100%)",
      avatar: "radial-gradient(circle at 30% 30%, #51a2da, #294172)",
      avatarGlow: "0 0 30px rgba(81,162,218,0.55)",
    };
  }
  // default: Debian
  return {
    label: "DEBIAN GNU/LINUX",
    dm: "GDM",
    bg: "linear-gradient(135deg, #2c0b2f 0%, #1a0418 45%, #0d0d14 100%)",
    avatar: "radial-gradient(circle at 30% 30%, #d70a53, #8b0a3a)",
    avatarGlow: "0 0 30px rgba(215,10,83,0.45)",
  };
}

function Taskbar({ vmName, vmOs }: { vmName: string; vmOs: string }) {
  const [open, setOpen] = useState(false);
  const [hh, mm] = timeNow();
  const t = taskbarThemeFor(vmOs);

  // Close the Start menu if user clicks anywhere else or hits Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Start menu overlay */}
      {open && (
        <StartMenu
          vmName={vmName}
          vmOs={vmOs}
          theme={t}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Click-outside backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        className="absolute bottom-0 inset-x-0 z-40 h-12 backdrop-blur-xl border-t flex items-center justify-between px-3 text-white/90 text-xs font-mono"
        style={{
          background: t.bg,
          borderTopColor: t.border,
        }}
      >
        {/* Left: start button + pinned apps */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Start"
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition ${
              open
                ? "bg-white/15 text-white"
                : "hover:bg-white/10 text-white/85"
            }`}
          >
            <StartIcon os={vmOs} color={t.accent} />
            <span className="hidden md:inline text-[11px]">{t.startLabel}</span>
          </button>

          {/* Pinned: Back to Proxmox */}
          <Link
            href="/hypervisor"
            title="Back to Proxmox (hypervisor)"
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition"
          >
            <span
              className="inline-block w-2 h-2 rounded-sm"
              style={{ background: "#E57000" }}
            />
            <span className="text-[11px]">Proxmox</span>
          </Link>

          {/* Pinned: Home */}
          <Link
            href="/"
            title="Back to home (landing)"
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition"
          >
            <span>🏠</span>
            <span className="text-[11px]">Home</span>
          </Link>
        </div>

        {/* Right: VM name + shutdown + clock */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline opacity-60">{vmName}</span>
          <Link
            href="/hypervisor"
            title="Shut down and return to Proxmox"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border transition hover:bg-white/10"
            style={{
              borderColor: `${t.accent}66`,
              color: t.accent,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3 v9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6.5 7.5 A8 8 0 1 0 17.5 7.5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <span className="tracking-widest">SHUTDOWN</span>
          </Link>
          <div className="text-right leading-tight pl-2 border-l border-white/10">
            <div>
              {hh}:{mm}
            </div>
            <div className="opacity-60 text-[10px]">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type TaskbarTheme = {
  bg: string;
  border: string;
  accent: string;
  startLabel: string;
  menuBg: string;
  menuAccent: string;
  distroLabel: string;
};

function taskbarThemeFor(os: string): TaskbarTheme {
  const o = os.toLowerCase();
  if (o.includes("manjaro"))
    return {
      bg: "rgba(10,24,19,0.85)",
      border: "rgba(53,191,92,0.25)",
      accent: "#35bf5c",
      startLabel: "Activities",
      menuBg: "linear-gradient(180deg, #0f3a2e 0%, #071a15 100%)",
      menuAccent: "#35bf5c",
      distroLabel: "Manjaro Linux · GNOME",
    };
  if (o.includes("ubuntu") || o.includes("azure"))
    return {
      bg: "rgba(20,8,20,0.85)",
      border: "rgba(233,84,32,0.3)",
      accent: "#e95420",
      startLabel: "Activities",
      menuBg: "linear-gradient(180deg, #2b0a2b 0%, #140714 100%)",
      menuAccent: "#e95420",
      distroLabel: "Ubuntu 22.04 LTS · GNOME",
    };
  if (o.includes("fedora"))
    return {
      bg: "rgba(8,20,40,0.85)",
      border: "rgba(81,162,218,0.3)",
      accent: "#51a2da",
      startLabel: "Activities",
      menuBg: "linear-gradient(180deg, #0a1f3e 0%, #040a17 100%)",
      menuAccent: "#51a2da",
      distroLabel: "Fedora Workstation 41 · GNOME",
    };
  if (o.includes("debian"))
    return {
      bg: "rgba(24,8,20,0.85)",
      border: "rgba(215,10,83,0.3)",
      accent: "#d70a53",
      startLabel: "Activities",
      menuBg: "linear-gradient(180deg, #2c0b2f 0%, #10040d 100%)",
      menuAccent: "#d70a53",
      distroLabel: "Debian 12 · GNOME",
    };
  // Windows default
  return {
    bg: "rgba(0,0,0,0.75)",
    border: "rgba(255,255,255,0.1)",
    accent: "#4db0ff",
    startLabel: "Start",
    menuBg: "linear-gradient(180deg, #0a1a2a 0%, #020617 100%)",
    menuAccent: "#4db0ff",
    distroLabel: "Windows 11 Enterprise",
  };
}

function StartIcon({ os, color }: { os: string; color: string }) {
  const o = os.toLowerCase();
  // Linux distros get a generic "activities" dot grid in the distro color.
  if (
    o.includes("linux") ||
    o.includes("debian") ||
    o.includes("ubuntu") ||
    o.includes("fedora") ||
    o.includes("manjaro") ||
    o.includes("azure")
  ) {
    return (
      <div className="w-5 h-5 grid grid-cols-3 gap-[2px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="block rounded-[1px]"
            style={{ background: color, opacity: 0.7 + (i % 3) * 0.1 }}
          />
        ))}
      </div>
    );
  }
  // Windows quad
  return (
    <div className="w-5 h-5 grid grid-cols-2 gap-[2px] p-[1px]">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ background: color, boxShadow: `0 0 4px ${color}88` }}
        />
      ))}
    </div>
  );
}

function StartMenu({
  vmName,
  vmOs,
  theme,
  onClose,
}: {
  vmName: string;
  vmOs: string;
  theme: TaskbarTheme;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute bottom-14 left-3 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] rounded-lg overflow-hidden border border-white/15 shadow-2xl"
      style={{ background: theme.menuBg }}
      role="menu"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <StartIcon os={vmOs} color={theme.menuAccent} />
          <div>
            <div className="text-white text-sm font-medium">
              {theme.distroLabel}
            </div>
            <div className="text-white/50 text-[11px] font-mono">
              jsanchez@{vmName}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned (navigation) */}
      <div className="px-2 py-3">
        <div className="text-[10px] text-white/50 tracking-[0.3em] px-2 mb-2">
          NAVIGATION
        </div>
        <MenuItem
          href="/hypervisor"
          icon={<span className="w-2 h-2 rounded-sm block" style={{ background: "#E57000" }} />}
          label="Back to Proxmox"
          hint="hypervisor view"
          onClose={onClose}
        />
        <MenuItem
          href="/"
          icon={<span>🏠</span>}
          label="Home"
          hint="landing page"
          onClose={onClose}
        />
      </div>

      {/* Jump to other VMs */}
      <div className="px-2 py-3 border-t border-white/10">
        <div className="text-[10px] text-white/50 tracking-[0.3em] px-2 mb-2">
          OTHER VMs
        </div>
        {vms.map((v) => (
          <MenuItem
            key={v.id}
            href={`/vm/${v.id}`}
            icon={<VmDot os={v.os} />}
            label={v.label}
            hint={v.os}
            onClose={onClose}
          />
        ))}
      </div>

      {/* Power actions */}
      <div className="px-2 py-3 border-t border-white/10">
        <div className="text-[10px] text-white/50 tracking-[0.3em] px-2 mb-2">
          POWER
        </div>
        <MenuItem
          href="/hypervisor"
          icon={<span>⏻</span>}
          label="Shut down"
          hint="return to Proxmox"
          onClose={onClose}
          accent={theme.menuAccent}
        />
      </div>
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  hint,
  onClose,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClose: () => void;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/10 transition"
      role="menuitem"
    >
      <div className="w-6 h-6 flex items-center justify-center text-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[13px]"
          style={accent ? { color: accent } : { color: "white" }}
        >
          {label}
        </div>
        <div className="text-[10.5px] text-white/50 font-mono truncate">
          {hint}
        </div>
      </div>
      <span className="text-white/40 text-xs">↵</span>
    </Link>
  );
}

function VmDot({ os }: { os: string }) {
  const o = os.toLowerCase();
  let color = "#4db0ff";
  if (o.includes("manjaro")) color = "#35bf5c";
  else if (o.includes("ubuntu") || o.includes("azure")) color = "#e95420";
  else if (o.includes("fedora")) color = "#51a2da";
  else if (o.includes("debian")) color = "#d70a53";
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 6px ${color}99`,
      }}
    />
  );
}
