"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HERO_IMAGE, HERO_IS_ANIME } from "@/lib/hero";

export default function LandingPage() {
  const [booting, setBooting] = useState(false);
  const [zoomDone, setZoomDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setZoomDone(true), 3100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex-1 min-h-screen w-full overflow-hidden bg-[#020617]">
      {HERO_IS_ANIME ? (
        <AnimatedHero
          onEnterHypervisor={() => setBooting(true)}
          zoomDone={zoomDone}
        />
      ) : (
        <FallbackSilhouette />
      )}

      {/* Top status bar */}
      <TopStatusBar visible={zoomDone && !booting} />

      {/* Lofi Girl ambient player — subtle volume, 3 tracks to swap */}
      <LofiPlayer visible={zoomDone && !booting} />

      {/* Overlays */}
      <AnimatePresence>
        {zoomDone && !booting && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-5 left-5 md:bottom-10 md:left-10 z-30 text-white max-w-[88vw]"
          >
            {/* Prompt tag */}
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-mono tracking-[0.3em] text-cyan-300/85">
              <span className="text-emerald-400">$</span>
              <span>WHOAMI</span>
            </div>

            {/* Name — all white, letters bounce on hover then spring back */}
            <BouncyName text="Joaquin Sanchez" />
            {/* On mobile, push the info upward so the tap hint stays readable */}


            {/* Role */}
            <div className="mt-2 text-base md:text-lg font-light text-zinc-300">
              Virtualization &amp; Cloud Architect
            </div>

            {/* Live "currently @ Merck" status */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm font-mono">
              <span className="relative inline-flex items-center">
                <span className="absolute -left-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-70" />
                <span className="relative inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </span>
              <span className="text-zinc-300 ml-3">
                currently @{" "}
                <span className="text-white">Merck &amp; Co., Inc</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{booting && <BootOverlay />}</AnimatePresence>
    </div>
  );
}

/* ============ Top status bar (WiFi + load + clock) ============ */

function TopStatusBar({ visible }: { visible: boolean }) {
  const [clock, setClock] = useState("--:--");
  const [load, setLoad] = useState<[number, number, number]>([
    0.42, 1.08, 0.95,
  ]);

  useEffect(() => {
    const tickClock = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes(),
        ).padStart(2, "0")}`,
      );
    };
    tickClock();
    const c = setInterval(tickClock, 30_000);

    const drift = () => {
      setLoad(([a, b, c]) => {
        const jitter = () => (Math.random() - 0.5) * 0.1;
        return [
          Math.max(0.05, Math.min(2.5, a + jitter())),
          Math.max(0.05, Math.min(2.5, b + jitter())),
          Math.max(0.05, Math.min(2.5, c + jitter())),
        ];
      });
    };
    const l = setInterval(drift, 2500);

    return () => {
      clearInterval(c);
      clearInterval(l);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 inset-x-0 z-40 h-9 flex items-center justify-end px-4 md:px-6 gap-4 font-mono text-[11px] text-white/90"
      style={{
        background:
          "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 60%, transparent)",
      }}
    >
      <LoadIndicator values={load} />

      <span className="text-white/40 hidden sm:inline">·</span>

      <WifiIndicator ssid="Sanchez-SSDI5GHZ" />

      <span className="text-white/40 hidden sm:inline">·</span>

      <span className="text-white/90">{clock}</span>
    </motion.div>
  );
}

function LoadIndicator({ values }: { values: [number, number, number] }) {
  const [a, b, c] = values;
  const high = a > 1.5 || b > 1.5;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white/50">load</span>
      <span className={high ? "text-amber-300" : "text-emerald-300"}>
        {a.toFixed(2)}
      </span>
      <span className="text-white/50">{b.toFixed(2)}</span>
      <span className="text-white/50">{c.toFixed(2)}</span>
    </div>
  );
}

/* ============ Lofi Girl ambient player ============ */

type LofiTrack = { id: string; label: string; sub: string };

// The three most popular work/coding streams on YouTube.
const LOFI_TRACKS: LofiTrack[] = [
  {
    id: "jfKfPfyJRdk",
    label: "Lofi Girl · study",
    sub: "beats to relax/study to",
  },
  {
    id: "5yx6BWlEVcY",
    label: "Chillhop · jazzy",
    sub: "jazzy & lofi hip hop beats",
  },
  {
    id: "MVPTGNAiHPg",
    label: "Lofi Girl · synthwave",
    sub: "beats to chill/game to",
  },
];

// Minimal YouTube Iframe API typings (avoids pulling in @types/youtube).
type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (v: number) => void;
  loadVideoById: (id: string) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  /** -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued. */
  getPlayerState: () => number;
};
type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      height?: string;
      width?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
      };
    },
  ) => YTPlayer;
};

function LofiPlayer({ visible }: { visible: boolean }) {
  const [playing, setPlaying] = useState(false);
  // Start UNMUTED. Browsers may block unmuted autoplay on first visit; if
  // so, `autoFell` goes true and we silently fall back to muted autoplay
  // + unmute-on-first-gesture.
  const [muted, setMuted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function boot() {
      const YT = (window as unknown as { YT?: YTNamespace }).YT;
      if (!YT || !containerRef.current) return;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId: LOFI_TRACKS[0].id,
        height: "0",
        width: "0",
        playerVars: {
          // Try unmuted autoplay first. If the browser blocks it (very
          // likely on first visit), we downgrade in onStateChange below.
          autoplay: 1,
          mute: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(15);
            e.target.playVideo();
            // If we're still not playing after a second, the browser
            // blocked unmuted autoplay. Downgrade to muted autoplay and
            // wait for the first user gesture to unmute.
            setTimeout(() => {
              const p = playerRef.current;
              if (!p) return;
              // Ask the player directly — avoids stale-closure on `playing`.
              if (p.getPlayerState() !== 1) {
                try {
                  p.mute();
                  p.playVideo();
                  setMuted(true);
                } catch {
                  /* ignore */
                }
              }
            }, 1200);
          },
          onStateChange: (e) => {
            if (e.data === 1) setPlaying(true);
            else if (e.data === 2 || e.data === 0) setPlaying(false);
          },
        },
      });
    }

    const existing = document.querySelector<HTMLScriptElement>(
      "#youtube-iframe-api",
    );
    const win = window as unknown as { onYouTubeIframeAPIReady?: () => void };
    if (!existing) {
      const s = document.createElement("script");
      s.id = "youtube-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
      win.onYouTubeIframeAPIReady = boot;
    } else if ((window as unknown as { YT?: YTNamespace }).YT) {
      boot();
    } else {
      win.onYouTubeIframeAPIReady = boot;
    }
  }, []);

  // On the first user interaction anywhere, unmute. (Browsers require a
  // user gesture to produce audio — this captures it silently.)
  useEffect(() => {
    if (!muted) return;
    const unmute = () => {
      const p = playerRef.current;
      if (!p) return;
      try {
        p.unMute();
        p.setVolume(15);
        setMuted(false);
      } catch {
        /* ignore */
      }
    };
    const opts = { once: true, passive: true } as AddEventListenerOptions;
    window.addEventListener("pointerdown", unmute, opts);
    window.addEventListener("keydown", unmute, opts);
    window.addEventListener("touchstart", unmute, opts);
    return () => {
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
      window.removeEventListener("touchstart", unmute);
    };
  }, [muted]);

  function toggle() {
    const p = playerRef.current;
    if (!p) return;
    // Clicking the button is itself a user gesture — unmute here too.
    if (muted) {
      p.unMute();
      p.setVolume(15);
      setMuted(false);
    }
    if (playing) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  }

  function pickTrack(i: number) {
    const p = playerRef.current;
    if (!p) return;
    setIdx(i);
    p.loadVideoById(LOFI_TRACKS[i].id);
    if (muted) {
      p.unMute();
      setMuted(false);
    }
    p.setVolume(15);
    setOpen(false);
  }

  const current = LOFI_TRACKS[idx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      transition={{ duration: 0.5 }}
      className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-40 font-mono text-[11px] text-white/90"
    >
      {/* Hidden YouTube iframe host */}
      <div
        ref={containerRef}
        className="absolute -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden"
        aria-hidden
      />

      <div className="relative">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur shadow-lg">
          <button
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            {playing ? (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <rect x="0" y="0" width="3" height="8" rx="0.5" />
                <rect x="5" y="0" width="3" height="8" rx="0.5" />
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 8 8" fill="currentColor">
                <path d="M1 0 L1 8 L7 4 Z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 pr-1 text-white/80 hover:text-white transition"
          >
            <span aria-hidden>{muted ? "🔇" : "♪"}</span>
            <span className="truncate max-w-[140px]">{current.label}</span>
            <span className="text-white/50">▾</span>
          </button>
        </div>

        {/* While muted, a tiny hint tells the user any click will turn it on */}
        {muted && playing && (
          <div className="mt-1 text-right text-[9.5px] text-white/50 tracking-wide">
            tap anywhere for sound
          </div>
        )}

        {open && (
          <div
            className="absolute bottom-11 right-0 w-56 rounded-lg border border-white/10 bg-black/85 backdrop-blur-xl shadow-2xl overflow-hidden"
            role="menu"
          >
            <div className="px-3 py-2 border-b border-white/10">
              <div className="text-[10px] tracking-[0.3em] text-cyan-300/80">
                LOFI GIRL · AMBIENT
              </div>
              <div className="text-white/60 text-[10px] mt-0.5">
                subtle volume · pick a vibe
              </div>
            </div>
            <ul className="py-1">
              {LOFI_TRACKS.map((t, i) => (
                <li key={t.id}>
                  <button
                    onClick={() => pickTrack(i)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/10 transition ${
                      i === idx ? "text-cyan-300" : "text-white/85"
                    }`}
                    role="menuitem"
                  >
                    <span className="w-3 text-center">
                      {i === idx && playing ? "♪" : i === idx ? "●" : ""}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] truncate">{t.label}</div>
                      <div className="text-[10px] text-white/50 truncate">
                        {t.sub}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-3 py-1.5 border-t border-white/10 text-[9.5px] text-white/45">
              via Lofi Girl · youtube embed
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function WifiIndicator({ ssid }: { ssid: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <path
          d="M7 2c2.5 0 4.7 1 6.3 2.5l-1.1 1.1A7.3 7.3 0 0 0 7 3.6 7.3 7.3 0 0 0 1.8 5.6L.7 4.5A8.9 8.9 0 0 1 7 2z"
          fill="currentColor"
        />
        <path
          d="M7 5c1.6 0 3 .6 4 1.6l-1.1 1.1A4 4 0 0 0 7 6.6a4 4 0 0 0-2.9 1.1L3 6.6A5.5 5.5 0 0 1 7 5z"
          fill="currentColor"
        />
        <circle cx="7" cy="10" r="1.3" fill="currentColor" />
      </svg>
      <span className="text-white/90">{ssid}</span>
    </div>
  );
}

/* ============ Animated Hero (zoom-out reveal) ============ */

function AnimatedHero({
  onEnterHypervisor,
  zoomDone,
}: {
  onEnterHypervisor: () => void;
  zoomDone: boolean;
}) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x: nx * 10, y: ny * 6 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Portrait-mobile nudge: image is landscape 16:9, looks best rotated. */}
      <RotateHint zoomDone={zoomDone} />

      <motion.div
        className="absolute inset-0"
        initial={{
          scale: 1.9,
          transformOrigin: "49% 30%",
        }}
        animate={{
          scale: 1,
          transformOrigin: "50% 50%",
        }}
        transition={{
          duration: 3.0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ x: parallax.x, y: parallax.y }}
          transition={{ type: "spring", stiffness: 40, damping: 20 }}
        >
          <Image
            src={HERO_IMAGE}
            alt="Joaquin at his workstation"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        </motion.div>
        {/* Very subtle feather around the edges */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 85% 100% at 50% 50%, transparent 60%, rgba(2,6,23,0.55) 100%)",
          }}
        />

        {/* Steam plume over the mate gourd (bottom-left) */}
        <Steam
          style={{ left: "6%", top: "55%", width: "4%", height: "18%" }}
          delay={0}
          zoomDone={zoomDone}
        />

        {/* Key-press micro-pulses over the keyboard region */}
        <KeyboardPulses zoomDone={zoomDone} />

        {/* Monitor flicker on center Proxmox screen */}
        <div
          aria-hidden
          className="absolute monitor-flicker mix-blend-screen"
          style={{
            left: "2%",
            top: "7%",
            width: "30%",
            height: "44%",
            opacity: zoomDone ? 0.7 : 0,
            transition: "opacity 1s",
          }}
        />
      </motion.div>

      {/* Soft breathing glow centered on the center monitor — no border, no label. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: zoomDone ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="pointer-events-none absolute z-10 monitor-breathe
                   left-[0%] top-[2%] w-[34%] h-[56%]
                   max-md:left-0 max-md:right-0 max-md:top-1/2 max-md:-translate-y-1/2
                   max-md:w-full max-md:h-1/3"
      />

      {/* LEFT monitor (Proxmox) click target */}
      <motion.button
        onClick={onEnterHypervisor}
        aria-label="Open Proxmox"
        initial={{ opacity: 0 }}
        animate={{ opacity: zoomDone ? 1 : 0 }}
        className="group absolute z-20 cursor-pointer
                   left-[0%] top-[2%] w-[34%] h-[56%]
                   max-md:left-0 max-md:right-0 max-md:top-1/2 max-md:-translate-y-1/2
                   max-md:w-full max-md:h-1/3"
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(77,214,255,0.35), transparent 65%)",
          }}
        />
        {/* Desktop hover label: "Portfolio" */}
        <span
          className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     px-4 py-2 text-xs font-mono tracking-[0.35em] uppercase
                     bg-black/85 text-cyan-200 border border-cyan-300/70 rounded
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     pointer-events-none shadow-xl whitespace-nowrap"
        >
          Portfolio ▶
        </span>
        {/* Mobile-only tap hint so users know where to tap */}
        <span className="md:hidden absolute left-1/2 -translate-x-1/2 top-2 px-3 py-1 text-[10px] font-mono tracking-[0.3em] bg-black/80 text-cyan-200 border border-cyan-300/60 rounded-full whitespace-nowrap">
          tap to enter ▶
        </span>
      </motion.button>

      {/* Two tiny Amazon link hotspots — sized to roughly half a credit card.
          Wrapped in an image-aspect container so percent positions track
          the image regardless of viewport. z-30 above monitor hotspots. */}
      <div
        className="hidden md:block absolute z-30 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, calc(100vh * 1376 / 768))",
          height: "max(100vh, calc(100vw * 768 / 1376))",
        }}
      >
        <ProductHotspot
          zoomDone={zoomDone}
          href="https://www.amazon.com/Atomic-Habits-James-Clear-Proven/dp/B0GJ4MWCMP"
          label="Atomic Habits · James Clear"
          style={{ left: "55.5%", top: "12%", width: "6%", height: "4%" }}
        />
        <ProductHotspot
          zoomDone={zoomDone}
          href="https://www.amazon.com/dp/B000LAKYW8"
          label="Casio F-91W · silver metal bracelet"
          style={{ left: "85%", top: "69%", width: "3%", height: "4%" }}
        />
        <ProductHotspot
          zoomDone={zoomDone}
          href="https://www.amazon.com/dp/B098D3TSYP"
          label="Casio G-Shock GW-M5610U"
          style={{ left: "88%", top: "69%", width: "3%", height: "4%" }}
        />
        <ProductHotspot
          zoomDone={zoomDone}
          href="https://www.amazon.com/dp/B0B8ZPLLGW"
          label="Leuchtturm1917 A5 · Navy"
          style={{ left: "20%", top: "70%", width: "8%", height: "12%" }}
        />
        <PhoneContactHotspot
          zoomDone={zoomDone}
          style={{ left: "38.25%", top: "79%", width: "4%", height: "8.5%" }}
        />
        <ProductHotspot
          zoomDone={zoomDone}
          href="https://www.amazon.com/dp/B0BS1XZY7T"
          label="Garmin Forerunner 965 · White"
          style={{ left: "43%", top: "70%", width: "3%", height: "4%" }}
        />
      </div>

      {/* RIGHT monitor (Azure Portal) click target — also goes to hypervisor.
          On desktop this covers the right monitor; on mobile the left
          hotspot already spans the middle band so we hide this one. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: zoomDone ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="hidden md:block pointer-events-none absolute z-10 monitor-breathe
                   left-[34%] top-[4.5%] w-[29%] h-[56%]"
      />
      <motion.button
        onClick={onEnterHypervisor}
        aria-label="Open Azure Portal"
        initial={{ opacity: 0 }}
        animate={{ opacity: zoomDone ? 1 : 0 }}
        className="hidden md:block group absolute z-20 cursor-pointer
                   left-[34%] top-[4.5%] w-[29%] h-[56%]"
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,120,212,0.35), transparent 65%)",
          }}
        />
        {/* Desktop hover label: "Portfolio" */}
        <span
          className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     px-4 py-2 text-xs font-mono tracking-[0.35em] uppercase
                     bg-black/85 text-sky-200 border border-sky-300/70 rounded
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     pointer-events-none shadow-xl whitespace-nowrap"
        >
          Portfolio ▶
        </span>
      </motion.button>
    </div>
  );
}

function BouncyName({ text }: { text: string }) {
  const letters = text.split("");
  return (
    <motion.h1
      initial="rest"
      animate="rest"
      whileHover="bounce"
      className="text-amber-400 font-semibold leading-[0.95] tracking-tight mt-2 text-3xl md:text-4xl lg:text-5xl cursor-default select-none whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]"
    >
      {letters.map((ch, i) => {
        if (ch === " ") return <span key={i}>&nbsp;</span>;
        // Deterministic pseudo-random per-letter offsets (stable across SSR)
        const y = -(16 + ((i * 13) % 18));
        const x = ((i * 7) % 11) - 5;
        const rot = ((i * 47) % 30) - 15;
        return (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              rest: { y: 0, x: 0, rotate: 0 },
              bounce: { y, x, rotate: rot },
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 10,
              mass: 0.6,
              delay: i * 0.025,
            }}
          >
            {ch}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}

function ProductHotspot({
  href,
  label,
  style,
  zoomDone,
}: {
  href: string;
  label: string;
  style: React.CSSProperties;
  zoomDone: boolean;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={label}
      title={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: zoomDone ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="hidden md:block group absolute cursor-pointer pointer-events-auto"
      style={style}
    >
      {/* Subtle amber outline on hover so the clickable area is obvious */}
      <span
        className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          boxShadow:
            "inset 0 0 0 2px rgba(229,160,13,0.65), 0 0 12px rgba(229,160,13,0.35)",
        }}
      />
      {/* Full-label tooltip still appears on hover, below the item */}
      <span
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap
                   px-2 py-1 text-[10px] font-mono tracking-wide
                   bg-black/90 text-amber-200 border border-amber-300/50 rounded
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   pointer-events-none shadow-xl"
        style={{ top: "calc(100% + 6px)" }}
      >
        {label} ↗
      </span>
    </motion.a>
  );
}

/* Transparent click zone positioned over the Pixel 9 Pro in the hero
   image. Routes to the Contact VM (email client). Shows "Contact @me"
   tooltip on hover. The phone face-up + Outlook Mobile UI is rendered
   in the hero image itself (generated via Gemini). */
function PhoneContactHotspot({
  zoomDone,
  style,
}: {
  zoomDone: boolean;
  style: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: zoomDone ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="hidden md:block absolute pointer-events-auto"
      style={style}
    >
      <Link
        href="/vm/contact"
        aria-label="Contact me — opens email client"
        className="group relative block w-full h-full cursor-pointer"
      >
        {/* Soft blue outline on hover so the clickable area is obvious */}
        <span
          className="absolute inset-0 rounded-md opacity-0
                     group-hover:opacity-100 transition-opacity duration-200"
          style={{
            boxShadow:
              "inset 0 0 0 2px rgba(0,120,212,0.75), 0 0 16px rgba(0,120,212,0.55)",
          }}
        />
        {/* Hover tooltip */}
        <span
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap
                     px-2 py-1 text-[10px] font-mono tracking-wide
                     bg-black/90 text-sky-200 border border-sky-300/60 rounded
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200
                     pointer-events-none shadow-xl"
          style={{ top: "calc(100% + 6px)" }}
        >
          Contact @me ✉
        </span>
      </Link>
    </motion.div>
  );
}

/* Subtle portrait-mobile hint to rotate phone to landscape. Hidden on
   md+ viewports and on landscape phones. Tappable to dismiss. */
function RotateHint({ zoomDone }: { zoomDone: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <button
      type="button"
      onClick={() => setDismissed(true)}
      aria-label="Rotate phone for best view"
      className="rotate-hint md:hidden landscape:hidden
                 fixed z-50 left-1/2 -translate-x-1/2 top-3
                 flex items-center gap-2 px-3 py-2
                 text-[11px] font-mono tracking-[0.25em] uppercase
                 bg-black/85 text-cyan-200 border border-cyan-300/60 rounded-full
                 shadow-xl backdrop-blur-sm
                 transition-opacity duration-700"
      style={{ opacity: zoomDone ? 1 : 0 }}
    >
      <span className="rotate-hint-icon" aria-hidden>↻</span>
      <span>Rotate for best view</span>
    </button>
  );
}

function Steam({
  style,
  delay,
  zoomDone,
}: {
  style: React.CSSProperties;
  delay: number;
  zoomDone: boolean;
}) {
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none overflow-hidden"
      style={{ ...style, opacity: zoomDone ? 1 : 0, transition: "opacity 1s" }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="steam-puff"
          style={{
            animationDelay: `${delay + i * 1.1}s`,
            left: `${i * 30 - 10}%`,
          }}
        />
      ))}
    </div>
  );
}

/* Random micro-pulses scattered across the keyboard region — suggests typing. */
function KeyboardPulses({ zoomDone }: { zoomDone: boolean }) {
  // Deterministic scatter so React hydration is stable and pulses feel
  // natural rather than uniform.
  const pulses = [
    { left: "34%", top: "62%", delay: 0.0 },
    { left: "38%", top: "64%", delay: 0.25 },
    { left: "42%", top: "63%", delay: 0.55 },
    { left: "46%", top: "65%", delay: 0.1 },
    { left: "40%", top: "61%", delay: 0.9 },
    { left: "36%", top: "66%", delay: 0.4 },
    { left: "48%", top: "62%", delay: 0.7 },
  ];
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: zoomDone ? 1 : 0, transition: "opacity 1s" }}
    >
      {pulses.map((p, i) => (
        <span
          key={i}
          className="key-press"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ============ Fallback (no anime image yet) ============ */

function FallbackSilhouette() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-mono text-sm px-6 text-center">
      <div>
        <div className="text-cyan-300 tracking-widest text-[10px]">
          [ GENERATING ]
        </div>
        <div className="mt-2">
          Run{" "}
          <code className="bg-black/50 px-2 py-0.5 rounded">
            node scripts/generate-anime.mjs
          </code>{" "}
          to produce the hero.
        </div>
      </div>
    </div>
  );
}

/* ============ Boot overlay (shared) ============ */

function BootOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="font-mono text-sm text-cyan-300 space-y-2 max-w-lg w-full px-6">
        <BootLines />
      </div>
    </motion.div>
  );
}

function BootLines() {
  const steps = [
    "Establishing TLS session to cluster API...",
    "Authenticating joaquin@pam...",
    "Loading datacenter topology...",
    "Resolving 4 regions, 4 nodes...",
    "Attaching VM inventory...",
    "Ready.",
  ];
  const [shown, setShown] = useState<string[]>([]);
  useEffect(() => {
    let i = 0;
    const tick = setInterval(() => {
      setShown((s) => [...s, steps[i]]);
      i++;
      if (i >= steps.length) {
        clearInterval(tick);
        setTimeout(() => {
          window.location.href = "/hypervisor";
        }, 400);
      }
    }, 240);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="text-left">
      <div className="text-[10px] tracking-[0.4em] text-cyan-300/70 mb-2">
        [ PVE SHELL ]
      </div>
      {shown.map((s, i) => (
        <div key={i}>
          <span className="text-cyan-500">{"$ "}</span>
          <span className="text-zinc-200">{s}</span>
        </div>
      ))}
      <span className="caret text-cyan-300">_</span>
      <Link href="/" className="hidden" aria-hidden />
    </div>
  );
}
