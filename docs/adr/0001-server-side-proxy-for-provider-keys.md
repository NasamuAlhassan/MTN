# ADR 0001 — Server-side proxy for provider keys

**Status:** Accepted

## Context

The app calls GhanaNLP Khaya (translate/ASR/TTS) and optionally Google Gemini
(NLU). Both need API keys. Vite inlines any `VITE_`-prefixed env var into the
public client bundle, so an earlier build shipped both keys to every visitor —
a critical secret-leak and an uncapped-cost risk (especially the billable
Gemini key).

## Decision

Route all provider calls through a same-origin proxy (`/api/khaya/*`,
`/api/gemini`) that injects the key from **non-`VITE_`** server env vars. One set
of handlers (`api/_lib/handlers.js`) backs Vercel functions in prod and Vite
middleware in dev. The client is gated by non-secret public flags
(`VITE_VOICE_ENABLED`, `VITE_AI_NLU_ENABLED`).

## Consequences

- Secrets never reach the browser (verified: keys absent from `dist/`).
- The proxy is the natural place for rate limiting, timeouts, and a cost ceiling.
- Local dev needs the keys in `.env`; the Vite middleware reads them server-side.
- Trade-off: the in-memory rate limiter is best-effort; production should use a
  durable store (Upstash/Redis).
