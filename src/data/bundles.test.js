import { describe, it, expect } from "vitest";
import { bundleForDuration, DATA_BUNDLES, JUST4U } from "./bundles.js";

describe("bundleForDuration", () => {
  it("selects bundles by id, not array position (M2 regression)", () => {
    expect(bundleForDuration("day")).toBe(DATA_BUNDLES.find((b) => b.id === "d3"));
    expect(bundleForDuration("week")).toBe(JUST4U.find((b) => b.id === "j7"));
    expect(bundleForDuration("month")).toBe(JUST4U.find((b) => b.id === "j15"));
  });

  it("never returns the nonsensical 41MB 'day' bundle", () => {
    expect(bundleForDuration("day").data).not.toBe("41.46MB");
  });

  it("returns null for unknown durations", () => {
    expect(bundleForDuration("year")).toBeNull();
    expect(bundleForDuration(undefined)).toBeNull();
  });
});
