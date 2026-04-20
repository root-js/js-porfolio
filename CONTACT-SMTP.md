# Real email sending from the Contact form

**Short version:** Cloudflare alone cannot send outbound email. It only offers
inbound routing (Email Routing). For the contact form to deliver real email
to `joaquin@s.com.do` without opening the visitor's mail client, you need a
transactional email provider. **Resend** is the easiest fit because:

- Free tier: 100 emails/day, 3,000/month
- Uses your existing `s.com.do` domain (already on Cloudflare DNS)
- Works with the code that's already wired in `/app/api/contact/route.ts`

## One-time setup (≈10 minutes)

### 1. Create a Resend account and add your domain

1. Sign up at https://resend.com (free).
2. Go to **Domains → Add Domain** and enter `s.com.do`.
3. Resend will show 3 DNS records to add:
   - `MX  send  feedback-smtp.<region>.amazonses.com`  (priority 10)
   - `TXT send  "v=spf1 include:amazonses.com ~all"`
   - `TXT resend._domainkey  <long DKIM public key>`

### 2. Add the DNS records to Cloudflare

1. Log in to https://dash.cloudflare.com.
2. Pick the `s.com.do` zone.
3. Go to **DNS → Records → Add record** and create each of the 3 above.
4. Important: set the orange-cloud **Proxy status to DNS-only (grey cloud)**
   on all three records — Cloudflare's proxy breaks SMTP records.
5. Back in Resend, click **Verify DNS records**. Should flip to green within
   a couple of minutes; up to 30 min if Cloudflare is slow to propagate.

### 3. Create an API key

1. In Resend: **API Keys → Create API Key** → name it `portfolio`, permission
   `Sending access`.
2. Copy the key. You won't see it again.

### 4. Wire it into the app

Add a `.env.local` at the repo root (this file is already gitignored):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=portfolio@s.com.do
CONTACT_TO=joaquin@s.com.do
```

Restart `npm run dev`. The Thunderbird compose window's **Send** button will
now POST to `/api/contact`, the server will call Resend's REST API, and the
message will land in your inbox at `joaquin@s.com.do`. The visitor sees
"✓ Sent via Resend" in the Thunderbird status line.

If the key is NOT present, the form falls back to `mailto:` — it opens the
visitor's native mail client with the message pre-filled.

## If you prefer Cloudflare Workers instead

Cloudflare Workers can send email via **MailChannels** (historically free,
now requires allow-listing per domain) or via an external SMTP relay. The
code change would be minor — the `/api/contact` route's RESEND block becomes
a fetch to a Worker endpoint. But you still need an upstream email provider:
Workers do not run an SMTP server.

For the contact form, Resend + Cloudflare DNS is the simplest path and what
this project is already wired for.

## Alternative: Gmail SMTP (not recommended for production)

You could use your Gmail as the SMTP relay with an App Password, but:

- Gmail sending limits (~500/day) and strict spam heuristics
- App Password requires 2FA and a bit of setup
- Storing Gmail creds server-side is riskier than a narrow-scope Resend key

If you still want it, install `nodemailer` and swap the Resend fetch in
`route.ts` for a `nodemailer.createTransport({ service: 'gmail', auth: ... })`
call. Keep `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env.local`.
