/**
 * Khaya API — routed through the same-origin server proxy (see api/_lib/handlers.js).
 * The subscription key lives ONLY on the server; the browser never sees it.
 */

/** Same-origin proxy prefix — the server injects the Ocp-Apim-Subscription-Key. */
export const KHAYA_BASE = "/api/khaya";

export const KHAYA_ROUTES = {
  translate: "/v1/translate",
  translateLanguages: "/v1/languages",
  asrLanguages: "/asr/v3/languages",
  asrTranscribe: "/asr/v3/transcribe",
  ttsV1: "/tts/v1/tts",
  ttsV1Languages: "/tts/v1/languages",
  ttsV2Synthesize: "/tts/v2/synthesize",
  ttsV2Languages: "/tts/v2/languages",
};

/**
 * Public build-time flag (safe to embed): set VITE_VOICE_ENABLED=true only when
 * the server has a KHAYA_API_KEY configured. Kept named hasKhayaKey() so the
 * many call sites that gate on "should we attempt Khaya?" stay unchanged.
 */
const VOICE_ENABLED = import.meta.env.VITE_VOICE_ENABLED === "true";

export function hasKhayaKey() {
  return VOICE_ENABLED;
}

/** Headers for proxied Khaya calls — no secret here; the proxy adds the key. */
export function khayaHeaders(json = true) {
  const h = { "Cache-Control": "no-cache" };
  if (json) h["Content-Type"] = "application/json";
  return h;
}
