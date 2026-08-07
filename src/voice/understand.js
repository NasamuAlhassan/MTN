import { normalizeForNLU } from "./khayaPipeline.js";
import { matchIntent } from "./intents.js";
import { extractWithAI, hasAI } from "./aiNlu.js";
import { isNo, isYes } from "./nlu.js";

/** Khaya translate + optional Gemini understanding + rule fallback. */
export async function understandUtterance(transcript, lang, convo) {
  const displayText = (transcript || "").trim();
  let nluText = displayText;

  try {
    nluText = await normalizeForNLU(displayText, lang);
  } catch (err) {
    console.warn("[understand] Khaya translate failed, using raw text", err);
  }

  let ai = null;
  let aiFailed = false;
  if (hasAI()) {
    try {
      ai = await extractWithAI(nluText, convo);
    } catch (err) {
      aiFailed = true;
      console.warn("[understand] AI NLU failed, using rules", err);
    }
  }

  const ruleIntent = matchIntent(nluText);
  if (convo?.readback) {
    if (isYes(nluText) || isYes(displayText) || ai?.intent === "confirm_yes") {
      return { displayText, nluText, ai: { ...ai, intent: "confirm_yes" } };
    }
    if (isNo(nluText) || isNo(displayText) || ai?.intent === "confirm_no") {
      return { displayText, nluText, ai: { ...ai, intent: "confirm_no" } };
    }
  }

  const intent = ruleIntent || (ai?.confidence >= 0.55 ? ai.intent : null);

  return { displayText, nluText, aiFailed, ai: ai ? { ...ai, intent: intent || ai.intent } : { intent } };
}

export { hasAI };