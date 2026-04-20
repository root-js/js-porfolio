"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function Win11Window({
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
        "rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-[#0b1224]/85 backdrop-blur-xl " +
        className
      }
      style={{
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(77,214,255,0.08)",
      }}
    >
      {/* Titlebar */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-2 text-white/80 text-xs">
          <div className="w-2 h-2 rounded-full bg-sl-cyan shadow-[0_0_6px_rgba(77,214,255,0.8)]" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <WinBtn label="—" />
          <WinBtn label="□" />
          {onClose ? (
            <Link
              href={onClose}
              className="w-7 h-6 flex items-center justify-center text-white/80 hover:bg-red-500/80 hover:text-white transition text-xs"
              aria-label="Close"
            >
              ✕
            </Link>
          ) : (
            <WinBtn label="✕" />
          )}
        </div>
      </div>
      <div className="p-5 text-white/90">{children}</div>
    </div>
  );
}

function WinBtn({ label }: { label: string }) {
  return (
    <div className="w-7 h-6 flex items-center justify-center text-white/60 hover:bg-white/10 transition text-xs">
      {label}
    </div>
  );
}
