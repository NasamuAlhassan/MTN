import { SCREENS } from "../navigation/screens.js";
import { DATA_BUNDLES, JUST4U, MIDNIGHT } from "../data/bundles.js";
import { spaceDigits } from "./nlu.js";

const PIN_PROMPT = "Please enter your PIN on the screen to confirm your transaction.";

export function stripConfirmQuestion(readback) {
  if (!readback) return "";
  return readback.replace(/\s*Should I continue\??\s*$/i, "").trim();
}

function findBundle(id) {
  if (!id) return null;
  return (
    DATA_BUNDLES.find((b) => b.id === id)
    || JUST4U.find((b) => b.id === id)
    || (MIDNIGHT.id === id ? MIDNIGHT : null)
  );
}

export function buildSummaryFromScreen({ sub, prefill = {}, highlight } = {}) {
  if (sub === SCREENS.SEND) {
    let summary = prefill.amount ? `Sending ${prefill.amount} cedis` : "Sending MoMo";
    if (prefill.name) summary += ` to ${prefill.name}`;
    else if (prefill.number) summary += ` to number ${spaceDigits(prefill.number)}`;
    if (prefill.ref) summary += `, reference ${prefill.ref}`;
    return summary;
  }

  if (sub === SCREENS.AIRTIME) {
    const who = prefill.recipient === "other"
      ? (prefill.number || prefill.name || "someone else")
      : "your own number";
    return prefill.amount
      ? `Buying ${prefill.amount} cedis airtime for ${who}`
      : "Buying airtime";
  }

  if (sub === SCREENS.MASHUP) {
    const amt = highlight || prefill.amount;
    return amt ? `Mashup package for GHS ${amt}` : "Buying a Mashup package";
  }

  if (sub === SCREENS.MIDNIGHT) {
    return `The Midnight bundle, ${MIDNIGHT.data} for night use, GHS ${MIDNIGHT.cost}`;
  }

  if (sub === SCREENS.SOCIAL) {
    return "A social bundle for WhatsApp and Facebook";
  }

  const bundle = findBundle(highlight);
  if (bundle) {
    const label = bundle.data || bundle.title;
    return `A data bundle: ${label} for GHS ${bundle.cost}`;
  }

  return "";
}

export function buildPinHandoffText({ readback, sub, prefill, highlight } = {}) {
  const summary = (stripConfirmQuestion(readback) || buildSummaryFromScreen({ sub, prefill, highlight }))
    .replace(/[.\s]+$/, "")
    .trim();
  if (!summary) return PIN_PROMPT;
  return `${summary}. ${PIN_PROMPT}`;
}