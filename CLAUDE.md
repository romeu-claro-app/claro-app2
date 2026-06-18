# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claro-app is a PWA and Android app that helps Portuguese immigrants in Switzerland understand Swiss official documents using AI analysis. The UI and all user-facing text is in Portuguese.

## Build & Deployment

No local build step — the frontend is a single static HTML file.

**Mobile (Android):**
```
npx cap sync android        # sync web assets to Android
npx cap open android        # open in Android Studio
npx cap build android       # build APK
```

**Backend (Vercel):**
```
vercel dev                  # local serverless dev server
vercel --prod               # deploy to production
```

**Cron jobs** (configured in `vercel.json`):
- `0 8 * * *` — daily deadline push notifications (`/api/notify-deadlines`)
- `0 9 * * 1` — Monday conversion emails (`/api/notify-conversion`)

## Architecture

### Frontend (`www/index.html`)
A single 2000+ line HTML file containing all markup, inline CSS, and inline JS. There is no build pipeline, bundler, or JS framework — everything is vanilla JS. State is managed via a client-side `state` object persisted in `localStorage`. The app targets a 430px mobile viewport and follows a PWA-first design.

UI navigation is done by showing/hiding `<div class="screen">` sections and modal overlays. The service worker (`sw.js`) handles offline caching.

### Backend (`api/`)
Serverless Vercel functions — one file per endpoint. Each function exports a default `handler(req, res)`. All endpoints include permissive CORS headers.

| Endpoint | Purpose |
|----------|---------|
| `analyse.js` | Calls Anthropic Claude API to analyze documents |
| `checkout.js` | Creates Stripe checkout sessions |
| `webhook.js` | Handles Stripe events (verifies signature with `crypto`) |
| `cancel.js` | Cancels Stripe subscriptions |
| `create-profile.js` | Creates user profile in Supabase after signup |
| `send-welcome.js` | Sends welcome email via Brevo API |
| `send-upgrade.js` | Sends subscription upgrade email |
| `send-email.js` | General email sending |
| `notify-deadlines.js` | Firebase FCM push notifications for upcoming deadlines |
| `notify-conversion.js` | Reminder emails to free users |
| `unsubscribe.js` | Handles marketing opt-outs |

### External Services
- **Supabase** — PostgreSQL database (tables: `profiles`, `documentos`, `consultas`)
- **Anthropic Claude Sonnet 4.6** — AI document analysis (Portuguese/German/French/Italian)
- **Stripe** — Subscription billing (CHF 12/month or CHF 144/year, freemium model)
- **Firebase Cloud Messaging** — Push notifications (Android + web)
- **Brevo** — Transactional and marketing emails
- **Calendly** — Consultation booking (embedded widget)
- **Capacitor** — Bridge layer for Android deployment

### Capacitor Mobile
`capacitor.config.json` points to `https://app.claro-app.ch` as the server URL (live remote content, not bundled assets). The Android app ID is `ch.claro_app.app`.

## Key Conventions

- All user-facing copy is in **Portuguese** (pt-PT/pt-CH).
- Brand primary color: `#1D9E75` (green). CSS variables defined at `:root` in `index.html`.
- Dark mode is supported via `prefers-color-scheme: dark`.
- API keys and secrets are in Vercel environment variables (`process.env.*`); never commit them.
- Stripe webhook endpoint uses HMAC signature verification — do not remove that check.
- The `analyse.js` endpoint currently calls Claude via raw `fetch` to the Anthropic API (not the SDK).
