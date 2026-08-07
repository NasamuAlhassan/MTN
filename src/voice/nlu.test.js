import { describe, it, expect } from "vitest";
import {
  parseAmount,
  parsePhoneNumber,
  parseDuration,
  findContact,
  spaceDigits,
  isYes,
  isNo,
  isSkipReference,
  parseReference,
} from "./nlu.js";

describe("parseAmount", () => {
  it("reads currency-tagged amounts", () => {
    expect(parseAmount("send 20 cedis")).toBe(20);
    expect(parseAmount("ghs 5")).toBe(5);
    expect(parseAmount("5c please")).toBe(5);
  });

  it("reads bare short numbers", () => {
    expect(parseAmount("20")).toBe(20);
    expect(parseAmount("1.5")).toBe(1.5);
  });

  it("reads spelled-out numbers", () => {
    expect(parseAmount("twenty")).toBe(20);
    expect(parseAmount("five cedis")).toBe(5);
  });

  it("does NOT treat a phone number as an amount (H1 regression)", () => {
    expect(parseAmount("send to 0244000111")).toBeNull();
    expect(parseAmount("0244000111")).toBeNull();
  });

  it("keeps the amount when both an amount and a phone are present", () => {
    expect(parseAmount("send 200 to 0244000111")).toBe(200);
    expect(parseAmount("send 20 cedis to 0244000111")).toBe(20);
  });

  it("returns null when there is no amount", () => {
    expect(parseAmount("hello there")).toBeNull();
  });
});

describe("parsePhoneNumber", () => {
  it("extracts a contiguous phone token, not every digit", () => {
    expect(parsePhoneNumber("send 200 to 0244000111")).toBe("0244000111");
    expect(parsePhoneNumber("call +233 24 400 0111")).toBe("233244000111");
  });
  it("returns null when there is no phone-length run", () => {
    expect(parsePhoneNumber("send 200")).toBeNull();
  });
});

describe("parseDuration", () => {
  it("maps words to day/week/month", () => {
    expect(parseDuration("for a day")).toBe("day");
    expect(parseDuration("weekly bundle")).toBe("week");
    expect(parseDuration("30 day plan")).toBe("month");
    expect(parseDuration("no time here")).toBeNull();
  });
});

describe("findContact", () => {
  it("matches by short name", () => {
    expect(findContact("send to prince")?.name).toBe("Prince");
  });
  it("matches by surname token without colliding across contacts", () => {
    expect(findContact("pay yakubu")?.name).toBe("Nasamu");
    expect(findContact("to iddrisu")?.name).toBe("Alhassan");
  });
  it("treats a raw phone number as an ad-hoc contact", () => {
    const c = findContact("send to 0244000111");
    expect(c?.number).toBe("0244000111");
  });
});

describe("spaceDigits", () => {
  it("spaces digits for readback", () => {
    expect(spaceDigits("0244000111")).toBe("0 2 4 4 0 0 0 1 1 1");
  });
});

describe("isYes / isNo", () => {
  it("recognises affirmatives incl. local tokens", () => {
    expect(isYes("yes")).toBe(true);
    expect(isYes("ɛyɛ")).toBe(true);
    expect(isYes("nope")).toBe(false);
  });
  it("recognises negatives but not a bare 'n' (L2 regression)", () => {
    expect(isNo("no")).toBe(true);
    expect(isNo("cancel")).toBe(true);
    expect(isNo("n")).toBe(false);
  });
});

describe("references", () => {
  it("detects skip words", () => {
    expect(isSkipReference("skip")).toBe(true);
    expect(isSkipReference("no reference")).toBe(true);
    expect(isSkipReference("rent")).toBe(false);
  });
  it("extracts a reference phrase", () => {
    expect(parseReference("with reference rent")).toBe("rent");
    expect(parseReference("reference is school fees")).toBe("school fees");
    expect(parseReference("skip")).toBeNull();
  });
});
