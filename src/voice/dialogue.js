import { USER } from "../data/user.js";
import { CONTACTS } from "../data/contacts.js";
import { transactionsSummary } from "../data/transactions.js";
import { DATA_BUNDLES, MASHUP_TIERS, MIDNIGHT, bundleForDuration } from "../data/bundles.js";
import { SCREENS } from "../navigation/screens.js";
import { matchIntent } from "./intents.js";
import {
  parseAmount,
  parseDuration,
  parseReference,
  findContact,
  spaceDigits,
  isYes,
  isNo,
  isSkipReference,
} from "./nlu.js";
import { buildPinHandoffText } from "./pinSummary.js";
import { NARRATION_EN } from "../content/narration.en.js";

function prompt(lineId, text) {
  return { text: text ?? NARRATION_EN[lineId], lineId };
}

function capitalizeFirst(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Human list of known contact names, e.g. "Prince, Nasamu, Alhassan or Lydia". */
const CONTACT_NAMES = CONTACTS.map((c) => c.name);
const CONTACT_HINT =
  CONTACT_NAMES.length > 1
    ? `${CONTACT_NAMES.slice(0, -1).join(", ")} or ${CONTACT_NAMES[CONTACT_NAMES.length - 1]}`
    : CONTACT_NAMES[0] || "";

function sendReadback(slots) {
  const { recipient, amount, ref } = slots;
  let rb = `You are sending ${amount} cedis to ${recipient.name}, number ${spaceDigits(recipient.number)}`;
  if (ref) rb += `, reference ${ref}`;
  rb += ". Should I continue?";
  return rb;
}

function extractSendSlots(nluText, ai = {}, existing = {}) {
  const contact = findContact(nluText) || (ai.recipient ? findContact(ai.recipient) : null);
  const amount = parseAmount(nluText) ?? ai.amount ?? null;
  const parsedRef = parseReference(nluText);
  const ref = parsedRef ?? (ai.reference != null ? ai.reference : undefined);

  const merged = { ...existing };
  if (contact && !merged.recipient) merged.recipient = contact;
  if (amount != null && merged.amount == null) merged.amount = amount;
  if (ref !== undefined && merged.ref === undefined) merged.ref = ref;
  return merged;
}

function sendSlotsComplete(slots) {
  return !!(slots.recipient && slots.amount != null && slots.ref !== undefined);
}

const EMPTY_CONVO = {
  log: [],
  flow: null,
  step: null,
  slots: {},
  readback: null,
};

export function createConvo() {
  return { ...EMPTY_CONVO, log: [] };
}

/**
 * Process one user utterance. Returns { convo, replies[], dispatch?, needsPin? }
 * replies: strings to speak/show; readback flag marks confirm state
 */
function flowNavigate(flow, step, slots = {}) {
  if (flow === "send") {
    return {
      tab: "momo",
      sub: SCREENS.SEND,
      prefill: {
        number: slots.recipient?.number || slots.number || "",
        amount: slots.amount || "",
        name: slots.recipient?.name || "",
        ref: slots.ref || "",
      },
      highlight: null,
    };
  }
  if (flow === "airtime") {
    const forOther = slots.recipient && slots.recipient !== "self";
    return {
      tab: "buy",
      sub: SCREENS.AIRTIME,
      prefill: {
        recipient: forOther ? "other" : "self",
        number: slots.number || "",
        amount: slots.amount || "",
        name: forOther ? slots.recipient : "",
      },
      highlight: null,
    };
  }
  if (flow === "mashup") {
    return {
      tab: "buy",
      sub: SCREENS.MASHUP,
      prefill: {},
      highlight: slots.bundle ?? null,
    };
  }
  if (flow === "social") {
    return {
      tab: "buy",
      sub: SCREENS.SOCIAL,
      prefill: {},
      highlight: slots.bundle?.id ?? null,
    };
  }
  if (flow === "data-night") {
    return { tab: "buy", sub: SCREENS.MIDNIGHT, prefill: {}, highlight: MIDNIGHT.id };
  }
  if (flow === "lasting") {
    return { tab: "buy", sub: SCREENS.DATA, prefill: {}, highlight: slots.bundle?.id || "flexi" };
  }
  if (flow === "data-generic") {
    if (step === "duration" || !slots.duration) {
      return { tab: "buy", sub: SCREENS.DATA_CATEGORIES, prefill: {}, highlight: null };
    }
    const sub = slots.duration === "day" ? SCREENS.DATA : SCREENS.JUST4U;
    return { tab: "buy", sub, prefill: {}, highlight: slots.bundle?.id ?? null };
  }
  return null;
}

export function processUtterance(convo, raw, _lang = "en", opts = {}) {
  const displayText = opts.displayText ?? raw;
  const nluText = opts.nluText ?? raw;
  const replies = [];
  let dispatch = null;
  let navigate = null;
  let needsPin = false;
  let next = { ...convo, log: [...convo.log, { who: "you", text: displayText }] };
  const t = nluText.toLowerCase();

  const finish = (convoOut, extra = {}) => ({
    convo: convoOut,
    replies,
    dispatch,
    navigate,
    needsPin,
    ...extra,
  });

  if (next.readback) {
    if (isYes(nluText) || isYes(displayText)) {
      dispatch = buildDispatch(next);
      navigate = dispatch;
      needsPin = !!dispatch;
      const handoff = buildPinHandoffText({
        readback: next.readback,
        sub: dispatch?.sub,
        prefill: dispatch?.prefill,
        highlight: dispatch?.highlight,
      });
      next = {
        ...next,
        readback: null,
        flow: null,
        step: null,
        slots: {},
      };
      replies.push({ text: handoff, lineId: "enter_pin" });
      return finish(next);
    }
    if (isNo(nluText) || isNo(displayText)) {
      next = { ...EMPTY_CONVO, log: [...next.log] };
      replies.push(prompt("cancelled"));
      return finish(next, { dispatch: null, needsPin: false });
    }
    replies.push({ text: next.readback, readback: true });
    return finish(next, { dispatch: null, needsPin: false });
  }

  const { flow, step, slots } = next;

  if (flow === "send") {
    const ai = opts.ai || {};
    const merged = extractSendSlots(nluText, ai, slots);
    navigate = flowNavigate("send", step, merged);

    if (sendSlotsComplete(merged)) {
      const rb = sendReadback(merged);
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: merged, readback: rb });
    }

    if (step === "recipient") {
      if (!merged.recipient) {
        replies.push({ text: `I didn't catch the name. You can say ${CONTACT_HINT}.`, lineId: "ask_recipient" });
        return finish(next);
      }
      if (merged.amount != null) {
        replies.push(prompt("ask_reference"));
        return finish({ ...next, step: "reference", slots: merged });
      }
      replies.push(prompt("ask_amount_send"));
      return finish({ ...next, step: "amount", slots: merged });
    }
    if (step === "amount") {
      if (merged.amount == null) {
        replies.push({ text: "How much? For example, twenty cedis.", lineId: "ask_amount_send" });
        return finish({ ...next, slots: merged });
      }
      if (merged.ref === undefined) {
        replies.push(prompt("ask_reference"));
        return finish({ ...next, step: "reference", slots: merged });
      }
      const rb = sendReadback(merged);
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: merged, readback: rb });
    }
    if (step === "reference") {
      if (isSkipReference(nluText)) {
        const updated = { ...merged, ref: "" };
        navigate = flowNavigate("send", "reference", updated);
        const rb = sendReadback(updated);
        replies.push({ text: rb, readback: true });
        return finish({ ...next, step: "confirm", slots: updated, readback: rb });
      }
      const ref = merged.ref ?? parseReference(nluText) ?? nluText.trim();
      if (!ref || ref.length > 50) {
        replies.push(prompt("ask_reference"));
        return finish({ ...next, slots: merged });
      }
      const updated = { ...merged, ref };
      navigate = flowNavigate("send", "reference", updated);
      const rb = sendReadback(updated);
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: updated, readback: rb });
    }
  }

  if (flow === "airtime") {
    if (step === "who") {
      if (/\b(self|me|my own|myself|for me)\b/.test(t)) {
        const updated = { ...slots, recipient: "self" };
        replies.push({ text: "How much airtime do you want? For example five cedis.", lineId: "ask_amount_airtime" });
        navigate = flowNavigate("airtime", "who", updated);
        return finish({ ...next, step: "amount", slots: updated });
      }
      const contact = findContact(nluText);
      if (contact) {
        const updated = { ...slots, recipient: contact.name, number: contact.number };
        replies.push({ text: "How much airtime do you want? For example five cedis.", lineId: "ask_amount_airtime" });
        navigate = flowNavigate("airtime", "who", updated);
        return finish({ ...next, step: "amount", slots: updated });
      }
      replies.push({ text: "Is it for you, or for someone else? If someone else, say their name or number.", lineId: "ask_who_airtime" });
      return finish(next);
    }
    if (step === "amount") {
      const amt = parseAmount(nluText);
      if (!amt) {
        replies.push({ text: "How much airtime? For example five cedis.", lineId: "ask_amount_airtime" });
        return finish(next);
      }
      const updated = { ...slots, amount: amt };
      navigate = flowNavigate("airtime", "amount", updated);
      const who = slots.recipient === "self" ? "your own number" : slots.number || slots.recipient;
      const rb = `Buying ${amt} cedis airtime for ${who}. Should I continue?`;
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: updated, readback: rb });
    }
  }

  if (flow === "lasting") {
    if (step === "amount") {
      const amt = parseAmount(nluText);
      if (!amt) {
        replies.push({ text: "How much do you want to spend — one cedi, three cedis, or more?", lineId: "ask_spend_flexi" });
        return finish(next);
      }
      const bundle = DATA_BUNDLES.find((b) => b.id === "flexi") || DATA_BUNDLES[0];
      const updated = { ...slots, bundle, amount: amt, target: "data" };
      navigate = flowNavigate("lasting", "amount", updated);
      const rb = `A non-expiry Flexi bundle for ${amt} cedis. Should I continue?`;
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: updated, readback: rb });
    }
  }

  if (flow === "data-generic" || flow === "social") {
    if (step === "duration") {
      const duration = parseDuration(nluText);
      if (!duration) {
        replies.push({ text: "For how long — a day, a week, or a month?", lineId: "ask_duration" });
        return finish(next);
      }
      let pick;
      let rb;
      if (flow === "social") {
        pick = { id: "social-w", data: "1.95GB", cost: 13, days: 7 };
        rb = `A social bundle for WhatsApp and Facebook, ${duration}, ${pick.data} for GHS ${pick.cost}. Should I continue?`;
      } else {
        pick = bundleForDuration(duration) || DATA_BUNDLES[3];
        const label = pick.data + (pick.days ? ` for ${pick.days} days` : "");
        rb = `A ${duration} bundle: ${label} for GHS ${pick.cost}. Should I continue?`;
      }
      const updated = { ...slots, bundle: pick, target: "data", duration };
      navigate = flowNavigate(flow, "confirm", updated);
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: updated, readback: rb });
    }
  }

  if (flow === "mashup") {
    if (step === "amount") {
      const amt = parseAmount(nluText);
      if (!amt) {
        replies.push({ text: "How much? One, five, ten or thirty cedis?", lineId: "mashup_intro" });
        return finish(next);
      }
      const pick = MASHUP_TIERS.reduce((a, b) => (Math.abs(b - amt) < Math.abs(a - amt) ? b : a));
      const updated = { ...slots, bundle: pick, target: "mashup" };
      navigate = flowNavigate("mashup", "amount", updated);
      const rb = `Mashup for GHS ${pick} — voice, data and SMS together. Should I continue?`;
      replies.push({ text: rb, readback: true });
      return finish({ ...next, step: "confirm", slots: updated, readback: rb });
    }
  }

  const ai = opts.ai || {};
  const intent = matchIntent(nluText) || ai.intent || null;
  const aiAmount = ai.amount ?? null;
  const aiDuration = ai.duration ?? null;

  if (intent === "send") {
    const updated = extractSendSlots(nluText, ai, {});
    navigate = flowNavigate("send", "recipient", updated);

    if (sendSlotsComplete(updated)) {
      const rb = sendReadback(updated);
      replies.push({ text: rb, readback: true });
      return finish({ ...next, flow: "send", step: "confirm", slots: updated, readback: rb });
    }
    if (updated.recipient) {
      if (updated.amount == null) {
        replies.push(prompt("ask_amount_send"));
        return finish({ ...next, flow: "send", step: "amount", slots: updated });
      }
      replies.push(prompt("ask_reference"));
      return finish({ ...next, flow: "send", step: "reference", slots: updated });
    }
    replies.push(prompt("ask_recipient"));
    return finish({ ...next, flow: "send", step: "recipient", slots: {} });
  }

  if (intent === "airtime") {
    navigate = flowNavigate("airtime", "who", {});
    const amt = parseAmount(nluText) ?? aiAmount;
    if (/\b(self|me|my own|myself|for me)\b/.test(t) || ai.forSelf) {
      const updated = { recipient: "self", amount: amt || undefined };
      navigate = flowNavigate("airtime", "who", updated);
      if (amt) {
        const rb = `Buying ${amt} cedis airtime for your own number. Should I continue?`;
        replies.push({ text: rb, readback: true });
        return finish({ ...next, flow: "airtime", step: "confirm", slots: updated, readback: rb });
      }
      replies.push({ text: "How much airtime do you want? For example five cedis.", lineId: "ask_amount_airtime" });
      return finish({ ...next, flow: "airtime", step: "amount", slots: updated });
    }
    replies.push(prompt("ask_who_airtime"));
    return finish({ ...next, flow: "airtime", step: "who", slots: {} });
  }

  if (intent === "night") {
    const slotsNight = { bundle: MIDNIGHT, target: "data" };
    navigate = flowNavigate("data-night", "confirm", slotsNight);
    const rb = `The Midnight bundle gives you ${MIDNIGHT.data} to use at night (${MIDNIGHT.window}) for GHS ${MIDNIGHT.cost}. Should I continue?`;
    replies.push({ text: rb, readback: true });
    return finish({ ...next, flow: "data-night", step: "confirm", slots: slotsNight, readback: rb });
  }

  if (intent === "lasting") {
    navigate = flowNavigate("lasting", "amount", {});
    replies.push(prompt("ask_spend_flexi"));
    return finish({ ...next, flow: "lasting", step: "amount", slots: {} });
  }

  if (intent === "social") {
    navigate = flowNavigate("social", "duration", {});
    replies.push(prompt("social_intro"));
    return finish({ ...next, flow: "social", step: "duration", slots: {} });
  }

  if (intent === "mashup") {
    navigate = flowNavigate("mashup", "amount", {});
    const amt = parseAmount(nluText);
    if (amt) {
      const pick = MASHUP_TIERS.reduce((a, b) => (Math.abs(b - amt) < Math.abs(a - amt) ? b : a));
      const updated = { bundle: pick, target: "mashup" };
      navigate = flowNavigate("mashup", "amount", updated);
      const rb = `Mashup for GHS ${pick} — voice, data and SMS together. Should I continue?`;
      replies.push({ text: rb, readback: true });
      return finish({ ...next, flow: "mashup", step: "confirm", slots: updated, readback: rb });
    }
    replies.push(prompt("mashup_intro"));
    return finish({ ...next, flow: "mashup", step: "amount", slots: {} });
  }

  if (intent === "balance") {
    const wantMomo = /\b(momo|mobile money|wallet)\b/.test(t) || (/\bmoney\b/.test(t) && !/\b(airtime|data)\b/.test(t));
    const wantData = /\b(data|internet|mb|gb|bundle|browse|browsing)\b/.test(t);
    const wantAir = /\b(airtime|credit|units|recharge)\b/.test(t);
    const wantMin = /\b(minute|minutes|talktime|talk time|call time)\b/.test(t);
    const wantSms = /\b(sms|text|texts|message|messages)\b/.test(t);
    const specific = wantMomo || wantData || wantAir || wantMin || wantSms;

    let msg;
    if (!specific) {
      msg = `You have ${USER.data} of data, ${USER.airtime.toFixed(2)} cedis airtime, and GHS ${USER.momo.toFixed(2)} in MoMo. You also have ${USER.minutes} and ${USER.sms}.`;
    } else {
      const parts = [];
      if (wantMomo) parts.push(`your MoMo balance is GHS ${USER.momo.toFixed(2)}`);
      if (wantData) parts.push(`you have ${USER.data} of data`);
      if (wantAir) parts.push(`you have ${USER.airtime.toFixed(2)} cedis airtime`);
      if (wantMin) parts.push(`you have ${USER.minutes}`);
      if (wantSms) parts.push(`you have ${USER.sms}`);
      msg = capitalizeFirst(parts.join(", ")) + ".";
    }
    replies.push({ text: msg });
    replies.push({ text: "Anything else?" });
    return finish(next);
  }

  if (intent === "transactions") {
    replies.push({ text: transactionsSummary(3) });
    replies.push({ text: "Would you like your full statement, or anything else?" });
    return finish(next);
  }

  if (intent === "account") {
    const wantNumber = /\b(number|phone|line|sim|msisdn)\b/.test(t);
    const wantName = /\b(name|who am i)\b/.test(t);
    const wantLoyalty = /\b(loyalty|points|reward|rewards)\b/.test(t);
    const parts = [];
    if (wantNumber) parts.push(`your number is ${spaceDigits(USER.number)}`);
    if (wantName) parts.push(`your name is ${USER.fullName}`);
    if (wantLoyalty) parts.push(`you have ${USER.loyalty} loyalty points`);
    if (!parts.length) {
      parts.push(`you are ${USER.fullName}, your number is ${spaceDigits(USER.number)}, and you have ${USER.loyalty} loyalty points`);
    }
    replies.push({ text: capitalizeFirst(parts.join(", ")) + "." });
    replies.push({ text: "Anything else?" });
    return finish(next);
  }

  if (intent === "help") {
    replies.push({
      text: "I can help you buy data or airtime, send mobile money, check your balances, and go through your recent transactions. I can also answer general questions. Just tell me what you need.",
    });
    return finish(next);
  }

  if (intent === "data") {
    const duration = parseDuration(nluText) || aiDuration;
    navigate = flowNavigate("data-generic", duration ? "confirm" : "duration", duration ? { duration } : {});
    if (duration) {
      const pick = bundleForDuration(duration) || DATA_BUNDLES[3];
      const updated = { bundle: pick, target: "data", duration };
      navigate = flowNavigate("data-generic", "confirm", updated);
      const label = pick.data + (pick.days ? ` for ${pick.days} days` : "");
      const rb = `A ${duration} bundle: ${label} for GHS ${pick.cost}. Should I continue?`;
      replies.push({ text: rb, readback: true });
      return finish({ ...next, flow: "data-generic", step: "confirm", slots: updated, readback: rb });
    }
    replies.push({ text: "Sure. For how long do you need the data — a day, a week, or a month?", lineId: "ask_duration" });
    return finish({ ...next, flow: "data-generic", step: "duration", slots: {} });
  }

  if (ai.reply) {
    replies.push({ text: ai.reply });
    return finish(next);
  }

  // The AI was meant to field this (e.g. a general question) but the call
  // failed — be honest rather than pretending it was an unrecognised command.
  if (opts.aiFailed) {
    replies.push({ text: NARRATION_EN.ai_unavailable, lineId: "ai_unavailable" });
    return finish(next);
  }

  replies.push(prompt("not_understood"));
  return finish(next);
}

/** Never throw — keeps Zigi running when slots/screens mismatch. */
export function safeProcessUtterance(convo, raw, lang = "en", opts = {}) {
  try {
    return processUtterance(convo, raw, lang, opts);
  } catch (err) {
    console.error("[dialogue] safe fallback", err);
    const displayText = opts.displayText ?? raw;
    return {
      convo: {
        ...convo,
        log: [...convo.log, { who: "you", text: displayText }],
      },
      replies: [{
        text: "Something went wrong on my side. Try saying it again, or pick a suggestion below.",
        lineId: "not_understood",
      }],
      dispatch: null,
      navigate: null,
      needsPin: false,
    };
  }
}

function buildDispatch(convo) {
  return flowNavigate(convo.flow, convo.step, convo.slots);
}

export function confirmYes(convo) {
  return processUtterance({ ...convo, readback: convo.readback || "confirm" }, "yes");
}

export function confirmNo(convo) {
  return processUtterance({ ...convo, readback: convo.readback || "confirm" }, "no");
}