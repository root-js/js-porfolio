"use client";

import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Adwaita-style GNOME window chrome — dark, rounded, with a
 * headerbar, window title centered, and close/max/min on the right.
 */
export function GnomeWindow({
  title,
  children,
  className = "",
  onClose,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  onClose?: string;
}) {
  return (
    <div
      className={
        "rounded-xl overflow-hidden border border-black/60 shadow-2xl bg-[#1e1e1e]/95 backdrop-blur " +
        className
      }
      style={{
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      {/* Headerbar */}
      <div className="h-11 flex items-center px-2 bg-[#242424] border-b border-black/60">
        {/* Hamburger / nav */}
        <div className="flex items-center gap-1 text-white/70">
          <GnomeIconBtn label="☰" />
          <GnomeIconBtn label="⋯" />
        </div>

        {/* Centered title */}
        <div className="flex-1 flex justify-center">
          <span className="text-[13px] text-white/90 font-medium truncate px-4">
            {title}
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1.5">
          <CircleBtn color="bg-[#3a3a3a]" label="—" />
          <CircleBtn color="bg-[#3a3a3a]" label="□" />
          {onClose ? (
            <Link
              href={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/80 bg-[#3a3a3a] hover:bg-red-600 transition text-xs"
              aria-label="Close"
            >
              ✕
            </Link>
          ) : (
            <CircleBtn color="bg-[#3a3a3a]" label="✕" />
          )}
        </div>
      </div>

      <div className="p-5 text-white/90">{children}</div>
    </div>
  );
}

function CircleBtn({ color, label }: { color: string; label: string }) {
  return (
    <div
      className={`${color} w-7 h-7 rounded-full flex items-center justify-center text-white/80 hover:brightness-125 text-xs`}
    >
      {label}
    </div>
  );
}

function GnomeIconBtn({ label }: { label: string }) {
  return (
    <div className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center text-[14px]">
      {label}
    </div>
  );
}
