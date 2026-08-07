/**
 * Khaya voice pipeline — wires Translation, ASR, and TTS appropriately:
 *
 *  Mic in  → ASR v3 (tw/kus/en) → Translation (→ en for NLU)
 *  Reply   → Translation (en → tw/kus) → TTS v2 (twi/kus)
 */

import { hasKhayaKey } from "../khaya/config.js";
import { hasGeminiKey, hasGroqKey } from "./aiNlu.js";

export { hasKhayaKey };

function aiLabel() {
  if (hasGroqKey()) return "Groq NLU";
  if (hasGeminiKey()) return "Gemini NLU";
  return "";
}

/** User spoke in tw/kus — translate to English so intent matching works. */
export async function normalizeForNLU(transcript, lang = "en") {
  const raw = (transcript || "").trim();
  if (!raw || lang === "en" || !hasKhayaKey()) return raw;

  const { translateToEnglish } = await import("../khaya/client.js");
  return translateToEnglish(raw, lang);
}

/** Which voice/AI providers are active for this language choice. */
export function khayaApiStatus(lang = "en") {
  const ai = aiLabel();
  const withAi = (base) => (ai ? `${base} + ${ai}` : base);

  if (lang === "en") {
    // English STT: Groq Whisper > Khaya ASR > Web Speech.
    const asr = hasGroqKey() ? "Groq Whisper" : hasKhayaKey() ? "Khaya ASR" : "Web Speech";
    return { translation: false, asr: true, tts: false, label: withAi(asr) };
  }

  // Twi / Kusaal
  if (hasKhayaKey()) {
    return { translation: true, asr: true, tts: true, label: withAi("Khaya voice") };
  }
  if (hasGroqKey()) {
    return { translation: false, asr: true, tts: false, label: withAi("Groq Whisper (no Khaya)") };
  }
  return { translation: false, asr: false, tts: false, label: "Khaya key missing" };
}