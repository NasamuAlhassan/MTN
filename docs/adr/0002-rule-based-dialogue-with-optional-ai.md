# ADR 0002 — Rule-based dialogue FSM with optional AI assist

**Status:** Accepted

## Context

Zigi must reliably drive money-adjacent flows (buy data/airtime, send MoMo) for
users who cannot read English. Determinism and safety matter more than
open-ended conversation, and the Khaya free tier is credit-limited.

## Decision

The core is a **pure, deterministic FSM** (`src/voice/dialogue.js`) driven by
rule-based intent + slot matching (`intents.js`, `nlu.js`). Gemini NLU is
**optional and advisory**: it only fills slots / suggests an intent when rules
are uncertain, and its free-text `reply` is sanitized before it is ever spoken.
Read-back text and PIN handoff are always generated from our own templates.

## Consequences

- Flows are testable without a network (see `dialogue.test.js`) and behave
  identically offline.
- No prompt-injected model output can drive a transaction or solicit a PIN.
- Trade-off: rules need manual extension per new intent; AI reduces but does not
  remove that work.
