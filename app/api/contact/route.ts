import { NextResponse } from "next/server";

/**
 * POST /api/contact
 * Body: { name, email, message }
 *
 * Sends via Resend if RESEND_API_KEY is set; otherwise returns a
 * mailto-style response the client can fall back to (browser opens
 * the visitor's mail app pre-populated).
 */
export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "name, email, and message are required" },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 },
    );
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "Message too long" },
      { status: 400 },
    );
  }

  const TO = process.env.CONTACT_TO || "joaquin@s.com.do";
  const RESEND_KEY = process.env.RESEND_API_KEY;

  if (RESEND_KEY) {
    const subject = `Portfolio contact from ${name}`;
    const text = `From: ${name} <${email}>\n\n${message}`;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "portfolio@resend.dev",
        to: [TO],
        reply_to: email,
        subject,
        text,
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      return NextResponse.json(
        { ok: false, error: `Resend: ${err}`, fallback: "mailto" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, via: "resend" });
  }

  // No server-side sender configured — tell the client to fall back to mailto.
  return NextResponse.json({ ok: true, via: "mailto" });
}
