"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactDesktop({
  name: recipientName,
  email: recipientEmail,
}: {
  name: string;
  email: string;
}) {
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState(
    `Hello from your portfolio, ${recipientName.split(" ")[0]}`,
  );
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [via, setVia] = useState<string>("");

  function valid() {
    if (!fromName.trim()) return "Your name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail))
      return "Enter a valid email.";
    if (!body.trim()) return "Write a message first.";
    return null;
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
    <div className="h-full w-full p-3 md:p-6 flex items-start justify-center overflow-auto">
      <div
        className="w-full max-w-5xl rounded-lg overflow-hidden border border-black/60 shadow-2xl bg-[#2a2e32]"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
      >
        {/* Thunderbird-style titlebar */}
        <div className="h-10 flex items-center justify-between px-3 bg-[#1f2326] border-b border-black/60">
          <div className="flex items-center gap-2">
            <ThunderbirdIcon />
            <span className="text-[13px] text-white/90 font-medium">
              Write: {subject || "(no subject)"} — Mozilla Thunderbird
            </span>
          </div>
          <div className="flex items-center gap-1">
            <WinBtn label="—" />
            <WinBtn label="□" />
            <Link
              href="/hypervisor"
              className="w-7 h-6 flex items-center justify-center text-white/80 hover:bg-red-600 hover:text-white transition text-xs"
              aria-label="Close"
            >
              ✕
            </Link>
          </div>
        </div>

        {/* Thunderbird toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 bg-[#32363a] border-b border-black/40 text-white/90 text-[12px]">
          <ToolbarBtn
            label="Send"
            accent
            onClick={send}
            disabled={status === "sending"}
          />
          <span className="w-px h-5 bg-white/15 mx-1" />
          <ToolbarBtn label="Spelling" />
          <ToolbarBtn label="Attach ▾" />
          <ToolbarBtn label="Security ▾" />
          <ToolbarBtn label="Save ▾" />
          <span className="ml-auto text-white/50 text-[11px]">
            {status === "idle" && "Draft"}
            {status === "sending" && "Sending..."}
            {status === "sent" &&
              (via === "resend" ? (
                <span className="text-emerald-400">
                  ✓ Sent via Resend
                </span>
              ) : (
                <span className="text-emerald-400">
                  ✓ Opened mail client
                </span>
              ))}
            {status === "error" && (
              <span className="text-red-400">{errorMsg}</span>
            )}
          </span>
        </div>

        {/* Body: identity bar + fields + message */}
        <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr]">
          {/* Folder/account pane */}
          <aside className="hidden lg:block border-r border-black/40 bg-[#2a2e32] p-3 text-[12px] text-white/80">
            <div className="text-[10px] tracking-[0.3em] text-white/40 mb-2">
              ACCOUNTS
            </div>
            <div className="flex items-center gap-2 py-1 text-white">
              <span>📧</span>
              <span className="truncate">{recipientEmail}</span>
            </div>
            <ul className="mt-2 space-y-0.5">
              <FolderRow icon="📥" label="Inbox" count="12" />
              <FolderRow icon="📤" label="Drafts" count="1" active />
              <FolderRow icon="✈" label="Sent" />
              <FolderRow icon="🗑" label="Trash" />
              <FolderRow icon="🗃" label="Archive" />
            </ul>

            <div className="mt-5 text-[10px] tracking-[0.3em] text-white/40 mb-2">
              SMTP
            </div>
            <div className="text-[11px] font-mono text-white/70 leading-5">
              smtp.resend.com
              <br />
              <span className="text-white/50">:465 (TLS)</span>
              <br />
              <span className="text-emerald-400">● connected</span>
            </div>
          </aside>

          {/* Compose */}
          <section className="p-4 md:p-5 bg-[#1f2326]">
            <Field
              label="From"
              value={fromName}
              placeholder="Your name"
              onChange={setFromName}
            />
            <Field
              label=""
              value={fromEmail}
              placeholder="you@example.com"
              onChange={setFromEmail}
              spacing="tight"
            />
            <Field label="To" value={recipientEmail} readOnly />
            <Field label="Subject" value={subject} onChange={setSubject} />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder={`Hi ${recipientName.split(" ")[0]},\n\nI came across your portfolio and wanted to reach out about…`}
              className="mt-3 w-full bg-[#2a2e32] border border-black/40 rounded p-3 text-white/90 text-sm leading-6 font-sans focus:outline-none focus:border-[#3584e4] resize-y min-h-[220px]"
            />

            <div className="mt-3 flex items-center justify-between text-[11px] text-white/60">
              <span>
                Character count: {body.length}
                {body.length > 0 && (
                  <span className="text-white/40">
                    {" "}
                    · Format: plain text
                  </span>
                )}
              </span>
              <button
                onClick={send}
                disabled={status === "sending"}
                className="px-4 py-1.5 bg-[#3584e4] text-white text-[12px] rounded hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
            </div>

            {status === "sent" && via === "mailto" && (
              <div className="mt-3 p-3 rounded border border-amber-500/40 bg-amber-500/10 text-[11px] text-amber-200">
                <b>Note:</b> No server-side SMTP is configured yet, so your
                native mail client was opened with the message pre-filled. To
                send directly from the form without opening a client, add a
                Resend API key (see README).
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  accent,
  onClick,
  disabled,
}: {
  label: string;
  accent?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
        accent
          ? "bg-[#3584e4] text-white hover:brightness-110"
          : "text-white/90 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function WinBtn({ label }: { label: string }) {
  return (
    <div className="w-7 h-6 flex items-center justify-center text-white/60 hover:bg-white/10 transition text-xs">
      {label}
    </div>
  );
}

function FolderRow({
  icon,
  label,
  count,
  active,
}: {
  icon: string;
  label: string;
  count?: string;
  active?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-2 px-2 py-1 rounded text-[12px] ${
        active ? "bg-[#3584e4]/30 text-white" : "hover:bg-white/5"
      }`}
    >
      <span className="w-4 text-center">{icon}</span>
      <span className="truncate">{label}</span>
      {count && <span className="ml-auto text-white/50 text-[10px]">{count}</span>}
    </li>
  );
}

function Field({
  label,
  value,
  placeholder,
  readOnly,
  onChange,
  spacing = "normal",
}: {
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (v: string) => void;
  spacing?: "normal" | "tight";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${spacing === "tight" ? "mt-1" : "mt-2"}`}
    >
      <div className="w-16 text-white/55 text-[11px] tracking-[0.18em] uppercase">
        {label}
      </div>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`flex-1 bg-[#2a2e32] border border-black/40 rounded px-3 py-1.5 text-white/95 text-sm font-mono focus:outline-none focus:border-[#3584e4] ${
          readOnly ? "text-white/70 cursor-default" : ""
        }`}
      />
    </div>
  );
}

function ThunderbirdIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="tb-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A84FF" />
          <stop offset="1" stopColor="#00C8FF" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L22 6 L20 14 A10 10 0 0 1 4 14 L2 6 Z"
        fill="url(#tb-g)"
      />
      <path d="M6 9 L12 13 L18 9 L18 11 L12 15 L6 11 Z" fill="#ffffff" />
    </svg>
  );
}
