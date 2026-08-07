import { describe, it, expect } from "vitest";
import { stripConfirmQuestion, buildSummaryFromScreen, buildPinHandoffText } from "./pinSummary.js";
import { SCREENS } from "../navigation/screens.js";

describe("stripConfirmQuestion", () => {
  it("removes a trailing confirm question", () => {
    expect(stripConfirmQuestion("Sending 20 cedis to Ama. Should I continue?")).toBe("Sending 20 cedis to Ama.");
  });
  it("is safe on empty input", () => {
    expect(stripConfirmQuestion("")).toBe("");
  });
});

describe("buildSummaryFromScreen", () => {
  it("summarises a MoMo send from prefill", () => {
    const s = buildSummaryFromScreen({ sub: SCREENS.SEND, prefill: { amount: 20, name: "Ama", ref: "rent" } });
    expect(s).toMatch(/20 cedis/);
    expect(s).toMatch(/Ama/);
    expect(s).toMatch(/rent/);
  });

  it("summarises airtime for self", () => {
    const s = buildSummaryFromScreen({ sub: SCREENS.AIRTIME, prefill: { recipient: "self", amount: 5 } });
    expect(s).toMatch(/5 cedis airtime/);
    expect(s).toMatch(/your own number/);
  });

  it("describes the midnight bundle", () => {
    const s = buildSummaryFromScreen({ sub: SCREENS.MIDNIGHT });
    expect(s).toMatch(/Midnight/i);
  });
});

describe("buildPinHandoffText", () => {
  it("prefers the read-back summary and appends the PIN prompt", () => {
    const out = buildPinHandoffText({ readback: "Sending 20 cedis to Ama. Should I continue?" });
    expect(out).toMatch(/Sending 20 cedis to Ama/);
    expect(out).toMatch(/enter your PIN/i);
    expect(out).not.toMatch(/Should I continue/i);
  });

  it("falls back to the bare PIN prompt when nothing is known", () => {
    expect(buildPinHandoffText({})).toMatch(/enter your PIN/i);
  });
});
