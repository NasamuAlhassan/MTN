// @ts-check
// Mock recent MoMo + telecom activity, most-recent first. Amounts in GHS.
// These are the source of truth for anything Zigi says about transactions — the
// numbers must never come from the language model.

/** @typedef {{id: string, kind: "send"|"receive"|"airtime"|"data"|"cashout"|"payment", party: string, amount: number, when: string}} Txn */

/** @type {Txn[]} */
export const TRANSACTIONS = [
  { id: "t1", kind: "send", party: "Prince", amount: 50, when: "yesterday" },
  { id: "t2", kind: "receive", party: "Ama Serwaa", amount: 120, when: "yesterday" },
  { id: "t3", kind: "airtime", party: "self", amount: 10, when: "2 days ago" },
  { id: "t4", kind: "data", party: "self", amount: 13, when: "3 days ago" },
  { id: "t5", kind: "cashout", party: "an agent", amount: 200, when: "5 days ago" },
  { id: "t6", kind: "payment", party: "Melcom", amount: 76.5, when: "last week" },
];

/**
 * @param {number} [n]
 * @returns {Txn[]}
 */
export function recentTransactions(n = 3) {
  return TRANSACTIONS.slice(0, Math.max(0, n));
}

/**
 * Natural-language description of one transaction (spoken + shown).
 * @param {Txn} t
 * @returns {string}
 */
export function describeTransaction(t) {
  const amt = `${Number(t.amount).toFixed(2)} cedis`;
  switch (t.kind) {
    case "send":
      return `sent ${amt} to ${t.party} ${t.when}`;
    case "receive":
      return `received ${amt} from ${t.party} ${t.when}`;
    case "airtime":
      return `bought ${amt} airtime ${t.when}`;
    case "data":
      return `bought a ${amt} data bundle ${t.when}`;
    case "cashout":
      return `cashed out ${amt} ${t.when}`;
    case "payment":
      return `paid ${amt} to ${t.party} ${t.when}`;
    default:
      return `${amt} ${t.when}`;
  }
}

/**
 * A spoken summary of the most recent transactions.
 * @param {number} [n]
 * @returns {string}
 */
export function transactionsSummary(n = 3) {
  const items = recentTransactions(n);
  if (!items.length) return "You have no recent transactions.";
  const sentences = items.map((t) => `You ${describeTransaction(t)}.`).join(" ");
  return `Here are your last ${items.length} transactions. ${sentences}`;
}
