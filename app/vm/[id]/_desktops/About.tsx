"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Win11Window } from "./Window";
import { profile, strengths } from "@/lib/content";

export function AboutDesktop() {
  return (
    <div className="h-full w-full p-4 md:p-8 flex items-start justify-center overflow-auto">
      <Win11Window
        title="About — Joaquin Sanchez"
        className="w-full max-w-4xl"
        onClose="/hypervisor"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar — anime portrait, animated */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0 mx-auto md:mx-0">
            {/* Rotating conic ring */}
            <motion.div
              aria-hidden
              className="absolute -inset-2 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 22, ease: "linear", repeat: Infinity }}
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(77,214,255,0.6), transparent 30%, rgba(138,92,255,0.5) 55%, transparent 80%, rgba(77,214,255,0.6))",
                filter: "blur(8px)",
              }}
            />
            {/* Outer breathing halo */}
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{
                duration: 4.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              style={{
                background:
                  "radial-gradient(circle, rgba(77,214,255,0.32), rgba(77,214,255,0) 65%)",
                filter: "blur(6px)",
              }}
            />
            {/* Ring accent */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full ring-1 ring-white/10"
            />
            {/* Portrait — bob + subtle tilt so it feels alive */}
            <motion.div
              className="absolute inset-[4%] rounded-full overflow-hidden bg-zinc-900 shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
              animate={{
                scale: [1, 1.018, 1],
                y: [0, -2, 0],
                rotate: [-0.8, 0.8, -0.8],
              }}
              transition={{
                duration: 5.5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            >
              <Image
                src="/joaquin-avatar.png"
                alt={profile.name}
                fill
                sizes="224px"
                className="object-cover"
                priority
              />
              {/* Soft internal shine that sweeps occasionally */}
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0, 0.18, 0] }}
                transition={{
                  duration: 6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                style={{
                  background:
                    "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                }}
              />
            </motion.div>
            {/* Status dot with pulse */}
            <motion.span
              className="absolute bottom-[10%] right-[10%] w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-black"
              animate={{
                boxShadow: [
                  "0 0 8px rgba(52,211,153,0.8)",
                  "0 0 18px rgba(52,211,153,1)",
                  "0 0 8px rgba(52,211,153,0.8)",
                ],
              }}
              transition={{ duration: 2.2, repeat: Infinity }}
              aria-label="Available"
            />
          </div>

          {/* Details */}
          <div className="flex-1 font-sans text-sm">
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              {profile.name}
            </h1>
            <div className="text-white/60 text-sm mt-1 font-mono">
              {profile.title} · {profile.company}
            </div>

            <p className="mt-5 text-white/90 leading-7 text-[14px]">
              {profile.bio}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-2 text-xs font-mono">
              <Row k="Users supported" v="20,000+" />
              <Row k="Azure regions" v="4" />
              <Row k="Focus" v="Azure Virtual Desktop, AWS Workspaces" />
              <Row k="Status" v={`Employed at Merck, ${profile.site}`} />
              <Row k="Based in" v={profile.location} />
              <Row k="Drink of choice" v="Yerba mate" />
            </div>

            <div className="mt-6 text-[11px] font-mono tracking-[0.3em] text-cyan-300/80">
              WHAT I DO WELL
            </div>
            <ul className="mt-2 space-y-1 text-[14px]">
              {strengths.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </Win11Window>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-1">
      <span className="text-white/50">{k}</span>
      <span className="text-white/90">{v}</span>
    </div>
  );
}
