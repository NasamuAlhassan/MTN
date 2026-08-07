# Security Policy

## Reporting a vulnerability

This is an unofficial concept prototype. If you find a security issue, please
open a private report to the maintainer rather than a public issue, and allow
reasonable time for a fix before any disclosure.

## How secrets are handled

- Provider API keys (`KHAYA_API_KEY`, `GEMINI_API_KEY`) are **server-only** — no
  `VITE_` prefix, so they are never inlined into the client bundle.
- The browser calls a same-origin proxy (`/api/khaya/*`, `/api/gemini`); the
  proxy (`api/_lib/handlers.js`) injects the key, rate-limits, validates the
  Gemini model id, and applies request timeouts.
- Only non-secret public flags (`VITE_VOICE_ENABLED`, `VITE_AI_NLU_ENABLED`)
  reach the client.
- `.env` is git-ignored. Never commit real keys.

## Known limitations (prototype)

- The in-memory rate limiter is best-effort and does not survive serverless cold
  starts — use a durable store (Upstash/Redis) before real traffic.
- The PIN gate is a **mock**. In a real integration, the "assistant never sees
  the PIN" guarantee must be enforced by the MoMo SDK, not this shared-DOM UI.
- No live MoMo/financial backend is integrated; all balances are mocked.

## Before any public launch

- [ ] Rotate the Khaya + Gemini keys (early builds shipped them client-side).
- [ ] Swap the rate limiter for a durable, distributed one.
- [ ] Run `npm audit` clean; enable Dependabot (configured).
- [ ] Commission an external security review / pen test.
