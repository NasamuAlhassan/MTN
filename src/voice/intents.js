// @ts-check

/** @type {Array<{id: string, en: string[]}>} */
const INTENTS = [
  // Checked before "send" so past-tense questions ("what did I send") route to
  // history, not a new transfer.
  {
    id: "transactions",
    en: [
      "recent transaction", "recent transactions", "last transaction", "last transactions",
      "transaction history", "my transactions", "my history", "what did i send",
      "who did i send", "did i receive", "did i send", "did i receive money",
      "statement", "statements", "my activity", "what did i buy", "my spending",
    ],
  },
  {
    id: "night",
    en: [
      "night data", "midnight", "data for the night", "data at night", "night bundle",
      "data i can use at night", "cheap data for the night", "data for night",
    ],
  },
  {
    id: "lasting",
    en: [
      "won't finish", "wont finish", "will not finish", "data that lasts", "non expiry",
      "non-expiry", "flexi", "long data", "data that stays", "data that doesn't finish",
      "data that won't finish", "does not expire",
    ],
  },
  {
    id: "social",
    en: [
      "whatsapp", "facebook", "instagram", "tiktok", "social", "chat",
      "small data for whatsapp", "social bundle", "social data",
    ],
  },
  {
    id: "send",
    en: [
      "send money", "send momo", "send mobile money", "send cash", "give money",
      "transfer money", "send to", "sending money", "i want to send", "transfer to",
      "pay someone", "send cedis", "momo transfer", "send ", "transfer ",
    ],
  },
  {
    id: "mashup",
    en: [
      "mashup", "voice and data", "call and browse", "call and data", "minutes and data",
      "everything together", "data and calls", "calls and data",
    ],
  },
  {
    id: "airtime",
    en: [
      "airtime", "credit", "top up", "topup", "top-up", "recharge", "call credit",
      "units", "buy me airtime", "buy airtime", "want airtime", "need airtime",
      "purchase airtime", "get airtime",
    ],
  },
  {
    id: "account",
    en: [
      "my number", "my phone number", "what is my number", "my name", "who am i",
      "my loyalty", "loyalty points", "my points", "reward points", "my account",
      "my profile",
    ],
  },
  {
    id: "help",
    en: [
      "what can you do", "what can you help", "can you help", "how can you help",
      "what do you do", "who are you", "what are you", "how do you work",
    ],
  },
  {
    id: "balance",
    en: [
      "balance", "how much do i have", "my money", "check my", "how much money",
      "data left", "how much data", "what do i have", "momo balance", "my balance",
      "check balance", "remaining",
    ],
  },
  {
    id: "data",
    en: [
      "buy data", "want data", "need data", "purchase data", "get data", "i want data",
      "data bundle", "internet bundle", "buy bundle", "browse bundle", "internet",
      "megabytes", "gigabytes", "buy internet",
    ],
  },
];

/**
 * Match intents against normalized English NLU text.
 * @param {string} text
 * @returns {string|null}
 */
export function matchIntent(text) {
  const t = text.toLowerCase().trim();
  if (!t) return null;

  for (const intent of INTENTS) {
    if (intent.en.some((phrase) => t.includes(phrase.toLowerCase()))) return intent.id;
  }

  if (/\b(data|bundle|internet|browse|mb|gb)\b/.test(t)) return "data";
  if (/\b(momo|mobile money)\b/.test(t) && /\b(send|transfer|pay|give)\b/.test(t)) return "send";

  return null;
}