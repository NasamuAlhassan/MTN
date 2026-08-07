import { describe, it, expect } from "vitest";
import { matchIntent } from "./intents.js";

describe("matchIntent", () => {
  const cases = [
    ["I want data for the night", "night"],
    ["send 20 cedis to prince", "send"],
    ["I want small data for whatsapp", "social"],
    ["buy me airtime", "airtime"],
    ["how much data do I have", "balance"],
    ["I want data", "data"],
    ["give me a mashup", "mashup"],
    ["data that won't finish", "lasting"],
    ["show me my recent transactions", "transactions"],
    ["what did i send last week", "transactions"],
    ["what is my number", "account"],
    ["how many loyalty points do i have", "account"],
    ["what can you do", "help"],
    ["who are you", "help"],
  ];

  it.each(cases)("maps %j -> %s", (text, expected) => {
    expect(matchIntent(text)).toBe(expected);
  });

  it("returns null for unrelated text", () => {
    expect(matchIntent("what is the weather")).toBeNull();
    expect(matchIntent("")).toBeNull();
  });
});
