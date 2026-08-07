/**
 * Groq client — fast, free-tier LLM (Llama) for NLU and Whisper for STT.
 * Routed through the same-origin proxy (api/_lib/handlers.js); the key is
 * server-side only. Gated by the public VITE_GROQ_ENABLED flag.
 */

import { fetchWithTimeout } from "../khaya/http.js";

const GROQ_BASE = "/api/groq";
const CHAT_MODEL = "llama-3.3-70b-versatile";
const STT_MODEL = "whisper-large-v3-turbo";

const GROQ_ENABLED = import.meta.env.VITE_GROQ_ENABLED === "true";

export function hasGroqKey() {
  return GROQ_ENABLED;
}

/** Chat completion constrained to a single JSON object. Returns the raw JSON string. */
export async function groqChatJSON(prompt, { temperature = 0.2, maxTokens = 300 } = {}) {
  const r = await fetchWithTimeout(
    `${GROQ_BASE}/openai/v1/chat/completions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    },
    15000,
  );
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Groq NLU failed: ${r.status} ${err.slice(0, 120)}`);
  }
  const body = await r.json();
  const out = body?.choices?.[0]?.message?.content;
  if (!out) throw new Error("Groq returned empty response");
  return out;
}

/** Whisper transcription. `blob` is recorded audio (webm/ogg/wav…). */
export async function groqTranscribe(blob, lang) {
  const form = new FormData();
  form.append("file", blob, "audio.webm");
  form.append("model", STT_MODEL);
  // Whisper reliably supports English here; leave others to auto-detect.
  if (lang === "en") form.append("language", "en");
  form.append("response_format", "json");
  form.append("temperature", "0");

  const r = await fetchWithTimeout(
    `${GROQ_BASE}/openai/v1/audio/transcriptions`,
    { method: "POST", body: form },
    20000,
  );
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Groq STT failed: ${r.status} ${err.slice(0, 120)}`);
  }
  const d = await r.json();
  return (d.text || "").trim();
}
