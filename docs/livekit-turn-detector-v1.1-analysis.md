# LiveKit Turn Detector v1.1 — Analysis & Upgrade Plan

**Project:** ConvergentAI / Ailana
**Date:** 2026-11-28

---

## Background

LiveKit recently announced Turn Detector v1.1 and v1.1-mini. The key improvements cited are:

- Ends turns 15–34% sooner at the same false-interruption budget
- 23–32% latency reduction on short replies (one-word and brief answers)
- Better handling of non-native / accented speech — waits through mid-sentence pauses instead of cutting in
- Now reads the agent's last message as input alongside user audio, reducing ambiguity on short replies

This report covers what we are currently running, whether an upgrade is needed, and when/how to act.

---

## Current Setup

Ailana uses `@livekit/agents` v1.6.4 with `inference.TurnDetector()` called in two places in `backend/src/agent.ts` (lines 2200 and 2272). Neither call pins a version, so the SDK auto-selects:

- **LiveKit Cloud / dev environment:** `turn-detector-v1` (cloud-hosted)
- **Self-hosted / fallback:** `turn-detector-v1-mini` (local in-process)

Endpointing is configured at `mode: dynamic`, `minDelay: 100ms`, `maxDelay: 500ms` — already aggressively tightened.

The latest available version of `@livekit/agents` on npm is **v1.11.0** — we are 5 minor versions behind.

---

## Is v1.1 Available Right Now?

**No.** The announcement describes a LiveKit Cloud-side model rollout. As of 2026-11-28, the Node.js (`agents-js`) SDK has not been updated to include v1.1. The installed type system (v1.6.4) and the latest npm release (v1.11.0) both only expose `v1` and `v1-mini` as valid version options. Attempting to pass `version: 'v1.1'` would throw at runtime.

There is no action to take in the codebase today.

---

## Why v1.1 Matters for Section 0

The improvements directly address patterns that come up repeatedly in the Section 0 mortgage fact-extraction flow:

**Short answers.** Prospects frequently give one-word or one-number replies: "yes", "no", "350k", "5 percent", "Army". With v1, there is a noticeable pause after these before Ailana responds because the turn detector waits unnecessarily. v1.1 reduces latency on short replies by 23–32% at the same false-interruption rate.

**Accented speakers.** Mortgage prospects are a diverse population. v1 can mis-fire on natural mid-sentence pauses from non-native English speakers, cutting into a reply before it is finished. v1.1 was specifically trained on non-native accent data to wait through those pauses.

**Context awareness.** v1.1 reads Ailana's previous question alongside the user's audio. When Ailana asks "what is your estimated down payment?" and the user says "80k", the model now has the question as context, making the short reply unambiguous.

---

## Risks

**Package upgrade gap.** Going from v1.6.4 to whatever version first includes v1.1 (expected to be ≥ v1.11.0) is a meaningful jump. The full Section 0 scenario suite (`section0.yaml`) must pass at 95% before this goes to staging.

**Endpointing interaction.** The current `minDelay: 100ms` is already very aggressive. Faster turn detection on top of that could occasionally cut off slower-pacing or pausing prospects. This should be monitored during post-upgrade testing and `minDelay` tuned up slightly if needed.

**Documentation lag.** LiveKit published the announcement before updating their reference docs. Constructor options for v1.1 in the Node.js SDK are not yet documented. Do not speculate on options until the type definitions ship.

---

## Action Plan

**Right now:** No code changes. Current configuration is correct.

**Watch:** Monitor the [livekit/agents-js releases page](https://github.com/livekit/agents-js/releases) for a release that adds `v1.1` to the `TurnDetectorVersion` type.

**When v1.1 lands in the SDK:**

1. Upgrade `@livekit/agents` and all `@livekit/agents-plugin-*` packages to the version that includes v1.1.
2. Update both `TurnDetector()` calls in `backend/src/agent.ts` (lines 2200 and 2272):
   ```ts
   // Change this:
   turnDetection: new inference.TurnDetector()
   // To this:
   turnDetection: new inference.TurnDetector({ version: 'v1.1' })
   ```
3. Run the full `section0.yaml` scenario suite and the `section0_stress.yaml` stress set.
4. Confirm 95% pass rate before merging to staging.

**Separately — plan the broader upgrade (1.6.4 → 1.11.0).** Even without v1.1, the upgrade brings an updated local `v1-mini` model (turn-length input), new config options, and several minor releases of bug fixes. This should be treated as its own task, not rushed alongside the active Section 0 sprint.

---

## Summary

| Question | Answer |
|---|---|
| Is v1.1 available in the Node.js SDK today? | No |
| Does our code need to change right now? | No |
| Will a code change be needed when it ships? | Yes — two lines in `agent.ts` |
| Will a package upgrade be needed? | Yes |
| Is v1.1 worth adopting? | Yes — short-answer latency and accent handling are directly relevant to Section 0 |
| When should we act? | When LiveKit publishes the Node.js SDK release containing v1.1 |
