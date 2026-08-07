import { NARRATION_EN } from "../content/narration.en.js";
import { hasKhayaKey } from "../khaya/config.js";

export function englishLine(text, lineId) {
  if (text) return text;
  if (lineId && NARRATION_EN[lineId]) return NARRATION_EN[lineId];
  return "";
}

/** One Khaya translate call — text for display and TTS. */
export async function resolveSpokenLine(text, lineId, lang = "en") {
  const en = englishLine(text, lineId);
  if (!en || lang === "en" || !hasKhayaKey()) {
    return { english: en, display: en, spoken: en };
  }

  try {
    const { translateForLang } = await import("../khaya/client.js");
    const translated = await translateForLang(en, lang);
    const display = (translated || "").trim() || en;
    return { english: en, display, spoken: display };
  } catch (err) {
    console.warn("[resolveSpokenLine] translate failed, using English", err);
    return { english: en, display: en, spoken: en };
  }
}