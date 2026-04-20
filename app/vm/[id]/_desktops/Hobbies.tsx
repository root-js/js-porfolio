"use client";

import { GnomeWindow } from "./GnomeWindow";
import { hobbies } from "@/lib/content";

export function HobbiesDesktop() {
  return (
    <div className="h-full w-full p-4 md:p-8 flex items-start justify-center overflow-auto">
      <GnomeWindow
        title="~/hobbies — Fedora Workstation"
        className="w-full max-w-5xl"
        onClose="/hypervisor"
      >
        {/* Intro */}
        <div className="mb-5 pb-4 border-b border-white/10">
          <div className="text-[10px] tracking-[0.3em] text-[#51a2da] font-mono">
            /etc/joaquin.d/offline-hours
          </div>
          <h2 className="text-xl font-semibold text-white mt-1">
            Life outside the datacenter
          </h2>
          <p className="text-sm text-white/70 mt-1 leading-6">
            The stuff that recharges me. What you get when the alert pager is
            quiet.
          </p>
        </div>

        {/* Grid of hobby tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hobbies.map((h) => (
            <HobbyCard key={h.id} hobby={h} />
          ))}
        </div>

        {/* System-info footer (GNOME "About" row) */}
        <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-mono text-white/50 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <span className="text-white/40">OS:</span> Fedora Workstation 41
          </div>
          <div>
            <span className="text-white/40">Kernel:</span> 6.11.4-301.fc41
          </div>
          <div>
            <span className="text-white/40">DE:</span> GNOME 47
          </div>
        </div>
      </GnomeWindow>
    </div>
  );
}

function HobbyCard({ hobby }: { hobby: (typeof hobbies)[number] }) {
  return (
    <article
      className="relative rounded-lg overflow-hidden bg-[#1e1e1e] border border-white/5 hover:border-white/20 transition p-5 group"
      style={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {/* Color strip */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: hobby.accent }}
      />

      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center text-xl flex-none"
          style={{
            background: `${hobby.accent}1a`,
            border: `1px solid ${hobby.accent}55`,
          }}
        >
          {hobby.icon}
        </div>
        <div className="flex-1">
          <div
            className="text-[10px] tracking-[0.25em] font-mono"
            style={{ color: hobby.accent }}
          >
            {hobby.tag.toUpperCase()}
          </div>
          <h3 className="text-[15px] font-semibold text-white mt-0.5">
            {hobby.title}
          </h3>
        </div>
      </div>

      <p className="text-[13px] text-white/80 leading-6 mt-3">{hobby.body}</p>
    </article>
  );
}
