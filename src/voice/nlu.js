// @ts-check
import { CONTACTS } from "../data/contacts.js";

/** @type {Record<string, number>} */
const NUMWORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  hundred: 100,
};

const MAX_AMOUNT = 100000;

/**
 * Parse a money amount (in cedis) from free text, ignoring phone/account numbers.
 * @param {string} text
 * @returns {number|null}
 */
export function parseAmount(text) {
  const t = (text || "").toLowerCase();

  // 1) Currency-tagged amounts win: "20 cedis", "ghs 5", "gh₵5", "5c".
  const tagged =
    t.match(/(?:ghs|gh₵|gh¢|₵|gh)\s*(\d+(?:\.\d+)?)/i) ||
    t.match(/(\d+(?:\.\d+)?)\s*(?:cedis?|pesewas?|ghs|gh₵|gh¢|₵|c)\b/i);
  if (tagged) return parseFloat(tagged[1]);

  // 2) A bare number — but only a *short*, standalone run. A 9+ digit run is a
  //    phone/account number, not money, so we require the match to be isolated
  //    (not adjacent to other digits) and at most 6 digits.
  const bare = t.match(/(?<!\d)(\d{1,6})(?:\.\d+)?(?!\d)/);
  if (bare) {
    const val = parseFloat(bare[0]);
    if (val > 0 && val <= MAX_AMOUNT) return val;
  }

  // 3) Spelled-out numbers.
  for (const word in NUMWORDS) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return NUMWORDS[word];
  }
  return null;
}

/**
 * @param {string} text
 * @returns {"day"|"week"|"month"|null}
 */
export function parseDuration(text) {
  const t = text.toLowerCase();
  // Check the more specific multi-word forms first: "30 day" / "7 day" contain
  // the word "day", so the month/week patterns must win before the day check.
  if (/\b(month|monthly|30\s*days?|thirty\s*days?)\b/.test(t)) return "month";
  if (/\b(week|weekly|7\s*days?|seven\s*days?)\b/.test(t)) return "week";
  if (/\b(day|daily|today|1\s*day|one\s*day)\b/.test(t)) return "day";
  return null;
}

/**
 * @param {string} text
 * @returns {string|null}
 */
export function parsePhoneNumber(text) {
  // Match a single contiguous phone-like token (optionally +233 / spaced /
  // hyphenated) — NOT every digit in the string, so "send 200 to 024..." keeps
  // the amount and the number separate.
  const m = (text || "").match(/\+?\d[\d\s-]{7,}\d/);
  if (!m) return null;
  const num = m[0].replace(/\D/g, "");
  return num.length >= 9 && num.length <= 15 ? num : null;
}

/**
 * @param {string} text
 * @returns {{name: string, number: string, full?: string}|null}
 */
export function findContact(text) {
  const t = (text || "").toLowerCase();
  for (const c of CONTACTS) {
    if (t.includes(c.name.toLowerCase())) return c;
    const tokens = [c.full, ...c.full.split(/\s+/)].map((x) => x.toLowerCase());
    if (tokens.some((token) => token.length > 2 && t.includes(token))) return c;
  }
  const num = parsePhoneNumber(text);
  if (num) return { name: num, number: num };
  return null;
}

/**
 * @param {string|number} n
 * @returns {string}
 */
export function spaceDigits(n) {
  return String(n).replace(/\D/g, "").split("").join(" ");
}

// Unicode letter boundaries (\p{L}) instead of ASCII \b so local-language
// tokens with non-ASCII characters (e.g. Twi "ɛyɛ") match correctly.
const YES_RE = /(?<!\p{L})(yes|yeah|yep|yup|ok|okay|correct|right|sure|go|continue|proceed|confirm|do it|that's all|thats all|that is all|that's it|thats it|that is it|all done|aho|yiw|ɛyɛ|eye|yaa|baa|ene|correcto)(?!\p{L})/iu;
const NO_RE = /(?<!\p{L})(no|nope|cancel|stop|wrong|don't|dont|never|daabi|da bi|mbaa|not)(?!\p{L})/iu;

/** @param {string} text @returns {boolean} */
export function isYes(text) {
  return YES_RE.test((text || "").toLowerCase());
}

/** @param {string} text @returns {boolean} */
export function isNo(text) {
  // Note: no bare "n" — a lone letter from noisy transcription must not cancel
  // a transaction. Ambiguity in a confirm still resolves to "don't proceed".
  return NO_RE.test((text || "").toLowerCase());
}

/** @param {string} text @returns {boolean} */
export function isSkipReference(text) {
  const t = (text || "").toLowerCase();
  return /\b(skip|none|no reference|nothing|n\/a|na|no ref)\b/i.test(t);
}

/**
 * Extract MoMo payment reference from free text, e.g. "with reference rent".
 * @param {string} text
 * @returns {string|null}
 */
export function parseReference(text) {
  const t = (text || "").trim();
  if (!t || isSkipReference(t)) return null;

  const patterns = [
    /(?:with\s+)?(?:reference|ref)\s*(?:is|:)?\s*["']?([^"'.]+?)["']?(?:\s*$|[.,])/i,
    /(?:with\s+)?(?:reference|ref)\s+(?:of\s+|as\s+)?(.+)/i,
  ];

  for (const p of patterns) {
    const m = t.match(p);
    if (m) {
      const val = m[1].trim();
      if (val.length > 0 && val.length <= 50) return val;
    }
  }
  return null;
}