import { resolveSpokenLine } from "./speakLine.js";

/** English assistant line → tw/kus for on-screen display. */
export async function localizedLine(text, lineId, lang = "en") {
  const { display } = await resolveSpokenLine(text, lineId, lang);
  return display;
}