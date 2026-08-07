import { describe, it, expect } from "vitest";
import { TRANSACTIONS, recentTransactions, describeTransaction, transactionsSummary } from "./transactions.js";

describe("transactions data", () => {
  it("returns the N most recent, in order", () => {
    const r = recentTransactions(2);
    expect(r).toHaveLength(2);
    expect(r[0]).toBe(TRANSACTIONS[0]);
  });

  it("describes each kind naturally with a formatted amount", () => {
    expect(describeTransaction({ id: "x", kind: "send", party: "Prince", amount: 50, when: "today" })).toBe(
      "sent 50.00 cedis to Prince today",
    );
    expect(describeTransaction({ id: "x", kind: "receive", party: "Ama", amount: 120, when: "today" })).toContain(
      "received 120.00 cedis from Ama",
    );
    expect(describeTransaction({ id: "x", kind: "airtime", party: "self", amount: 10, when: "today" })).toContain(
      "bought 10.00 cedis airtime",
    );
  });

  it("builds a spoken summary naming the count", () => {
    const s = transactionsSummary(3);
    expect(s).toMatch(/last 3 transactions/);
    expect(s).toMatch(/Prince/);
  });
});
