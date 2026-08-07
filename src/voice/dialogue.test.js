import { describe, it, expect } from "vitest";
import { createConvo, processUtterance, confirmYes, confirmNo } from "./dialogue.js";
import { SCREENS } from "../navigation/screens.js";

describe("send flow", () => {
  it("collects inline slots, reads back, and confirms to a PIN handoff", () => {
    const r1 = processUtterance(createConvo(), "send 20 cedis to prince reference rent");
    expect(r1.convo.flow).toBe("send");
    expect(r1.convo.readback).toBeTruthy();
    expect(r1.convo.slots.amount).toBe(20);
    expect(r1.convo.slots.recipient.name).toBe("Prince");

    const r2 = confirmYes(r1.convo);
    expect(r2.needsPin).toBe(true);
    expect(r2.dispatch?.sub).toBe(SCREENS.SEND);
  });

  it("does not misread a phone number as the amount (H1 regression)", () => {
    const r = processUtterance(createConvo(), "send 200 to 0244000111");
    expect(r.convo.flow).toBe("send");
    expect(r.convo.slots.amount).toBe(200);
    expect(r.convo.slots.recipient.number).toBe("0244000111");
  });

  it("cancels cleanly on 'no'", () => {
    const r1 = processUtterance(createConvo(), "send 20 to prince reference rent");
    const r2 = confirmNo(r1.convo);
    expect(r2.needsPin).toBe(false);
    expect(r2.convo.flow).toBeNull();
  });
});

describe("airtime flow", () => {
  it("asks who, then amount, then reads back", () => {
    let r = processUtterance(createConvo(), "buy airtime");
    expect(r.convo.flow).toBe("airtime");
    expect(r.convo.step).toBe("who");

    r = processUtterance(r.convo, "for myself");
    expect(r.convo.step).toBe("amount");

    r = processUtterance(r.convo, "5 cedis");
    expect(r.convo.readback).toMatch(/5 cedis/i);
  });

  it("treats 'buy me airtime' as for self (the word airtime contains 'me')", () => {
    const r = processUtterance(createConvo(), "buy me airtime");
    expect(r.convo.flow).toBe("airtime");
    // "me" is a standalone word here → self; should advance past "who".
    expect(r.convo.step).toBe("amount");
  });
});

describe("data flow", () => {
  it("reads back a week bundle when a duration is given", () => {
    const r = processUtterance(createConvo(), "I want data for a week");
    expect(r.convo.readback).toMatch(/week/i);
  });

  it("asks for a duration when none is given", () => {
    const r = processUtterance(createConvo(), "I want data");
    expect(r.convo.flow).toBe("data-generic");
    expect(r.convo.step).toBe("duration");
    expect(r.convo.readback).toBeFalsy();
  });
});

describe("balance + fallback", () => {
  it("answers balance without a readback", () => {
    const r = processUtterance(createConvo(), "how much data do I have");
    expect(r.convo.readback).toBeFalsy();
    expect(r.replies.length).toBeGreaterThan(0);
  });

  it("falls back to not_understood", () => {
    const r = processUtterance(createConvo(), "zxcvb qwerty");
    expect(r.replies[0].lineId).toBe("not_understood");
  });
});

describe("info intents (accurate, no readback, no PIN)", () => {
  it("reports recent transactions from real data", () => {
    const r = processUtterance(createConvo(), "show me my recent transactions");
    expect(r.convo.readback).toBeFalsy();
    expect(r.needsPin).toBe(false);
    expect(r.replies[0].text).toMatch(/last 3 transactions/i);
    expect(r.replies[0].text).toMatch(/Prince/);
  });

  it("answers a MoMo-specific balance question", () => {
    const r = processUtterance(createConvo(), "what is my momo balance");
    expect(r.replies[0].text).toMatch(/MoMo balance is GHS 428\.50/);
  });

  it("gives a full balance when unspecified", () => {
    const r = processUtterance(createConvo(), "what is my balance");
    expect(r.replies[0].text).toMatch(/data/i);
    expect(r.replies[0].text).toMatch(/airtime/i);
    expect(r.replies[0].text).toMatch(/MoMo/i);
  });

  it("reads the phone number digit by digit", () => {
    const r = processUtterance(createConvo(), "what is my number");
    expect(r.replies[0].text).toMatch(/0 5 5 2 0 9/);
  });

  it("reports loyalty points", () => {
    const r = processUtterance(createConvo(), "how many loyalty points do I have");
    expect(r.replies[0].text).toMatch(/2,223 loyalty points/);
  });

  it("explains its capabilities on a help question", () => {
    const r = processUtterance(createConvo(), "what can you do");
    expect(r.replies[0].text).toMatch(/buy data|send mobile money|recent transactions/i);
  });

  it("answers a general question via the AI reply (chat)", () => {
    const r = processUtterance(createConvo(), "what is the capital of Ghana", "en", {
      ai: { intent: "chat", reply: "The capital of Ghana is Accra." },
    });
    expect(r.replies[0].text).toBe("The capital of Ghana is Accra.");
    expect(r.needsPin).toBe(false);
  });

  it("is honest when the AI was needed but unreachable", () => {
    const r = processUtterance(createConvo(), "what is the time in the USA right now", "en", { aiFailed: true });
    expect(r.replies[0].text).toMatch(/couldn't reach my assistant/i);
    expect(r.replies[0].text).not.toMatch(/didn't understand/i);
  });
});

describe("bundle intents", () => {
  it("night data reads back the Midnight bundle immediately", () => {
    const r = processUtterance(createConvo(), "I want data for the night");
    expect(r.convo.flow).toBe("data-night");
    expect(r.convo.readback).toMatch(/Midnight/i);
    expect(confirmYes(r.convo).needsPin).toBe(true);
  });

  it("mashup with an amount snaps to the nearest tier and reads back", () => {
    const r = processUtterance(createConvo(), "I want mashup for 7 cedis");
    expect(r.convo.flow).toBe("mashup");
    // Nearest tier to 7 is 5.
    expect(r.convo.slots.bundle).toBe(5);
    expect(r.convo.readback).toMatch(/Mashup/i);
  });

  it("mashup without an amount asks how much", () => {
    const r = processUtterance(createConvo(), "mashup");
    expect(r.convo.step).toBe("amount");
    expect(r.convo.readback).toBeFalsy();
  });

  it("lasting/flexi asks how much to spend", () => {
    const r = processUtterance(createConvo(), "I want data that won't finish");
    expect(r.convo.flow).toBe("lasting");
    expect(r.replies[0].lineId).toBe("ask_spend_flexi");
  });

  it("social starts a duration question", () => {
    const r = processUtterance(createConvo(), "small data for whatsapp");
    expect(r.convo.flow).toBe("social");
    expect(r.convo.step).toBe("duration");
  });
});

describe("multi-step send", () => {
  it("collects recipient, then amount, then reference across turns", () => {
    let r = processUtterance(createConvo(), "I want to send money");
    expect(r.convo.step).toBe("recipient");

    r = processUtterance(r.convo, "to prince");
    expect(r.convo.step).toBe("amount");

    r = processUtterance(r.convo, "twenty cedis");
    expect(r.convo.step).toBe("reference");

    r = processUtterance(r.convo, "skip");
    expect(r.convo.readback).toBeTruthy();
    expect(r.convo.slots.ref).toBe("");
  });
});
