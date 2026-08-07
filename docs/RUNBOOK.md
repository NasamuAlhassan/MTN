# Runbook

## Deploy (Vercel)

1. Import the repo (framework preset: **Vite**).
2. Set env vars in **Project Settings → Environment Variables**:
   - `KHAYA_API_KEY` (server secret)
   - `GEMINI_API_KEY` (server secret, optional)
   - `VITE_VOICE_ENABLED=true`
   - `VITE_AI_NLU_ENABLED=true` (only if a Gemini key is set)
3. Deploy. The functions in `api/` serve `/api/khaya/*` and `/api/gemini`.

## Rotate a leaked / expiring key

1. Generate a new key at the provider (GhanaNLP Khaya portal / Google AI Studio).
2. Update `KHAYA_API_KEY` / `GEMINI_API_KEY` in Vercel (all environments) and in
   your local `.env`.
3. Redeploy. No client rebuild logic depends on the key value — only the server
   functions read it.
4. Revoke the old key at the provider.

> The keys committed during early development were shipped in the client bundle
> and **must be treated as compromised** — rotate before any real launch.

## Khaya free-tier exhaustion (100 calls)

- Symptom: `/api/khaya/*` returns non-200; UI falls back to Web Speech (English)
  and rule-based intents.
- Mitigation: the client caches translations + TTS audio and dedupes in-flight
  requests; UI strings are translated in parallel and cached per language.
- If exhausted: upgrade the Khaya plan or wait for the quota reset; the app stays
  usable in English.

## Rate limiting

- `api/_lib/handlers.js` applies a best-effort in-memory per-IP limit.
- **Production:** replace with a durable store (Upstash/Redis) so limits survive
  cold starts and span instances.

## Incident: stuck "Preparing…/Speaking…"

- Client fetches time out at 20s (`src/khaya/http.js`) and Web-Speech TTS has a
  15s guard, so the assistant self-recovers. If not, reload — the ErrorBoundary
  offers a "Try again".
