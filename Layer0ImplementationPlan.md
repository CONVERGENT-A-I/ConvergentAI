# Layer 0 — Section 0 Transaction Type Routing: Implementation Plan

**Project:** ConvergentAI | Ailana v8.7  
**Author:** Sohail-Ak  
**Last Updated:** October 10, 2026  
**Status:** 🟡 IN PROGRESS — Planning complete, implementation not yet started  
**Reference Doc:** [`Layer0Doc.md`](file:///c:/Users/SAL/Downloads/ConvergentAI/Layer0Doc.md)

---

> [!IMPORTANT]
> **Read Before Starting:** Section 0 is **purely additive** — it does not change, overwrite, or delete anything currently in the project. Every existing Stage 1–3 prompt, every Q-number, every compliance formulation, every stall recovery (SR-1 to SR-5) stays exactly as-is. Section 0 adds new fields, a new file, and a guard at the top of `buildLayer2()`. Nothing else changes.

> [!WARNING]
> **The One Critical Default:** `Q9_confirmed` MUST initialize to `false`. If it defaults to `true`, Section 0 never runs and the system appears to work correctly while being completely unwired. Verify this in **T2** and test it in **T15 (S0-1)** before anything else.

---

## 📊 Overall Layer 0 Progress

```
Layer 0 Completion:  ████░░░░░░░░░░░░░░░░  ~20% (baseline)
```

| Area | Status | Notes |
| :--- | :---: | :--- |
| Session State Schema (`BorrowerProfile`) | 🟡 Partial | `transaction_type`, `mortgage_goal` exist. 13 new Section 0 fields missing. |
| Front-Loading Extraction (`extractOpeningSignals`) | 🟡 Partial | Basic `mortgage_goal` extraction exists. No multi-signal / `signals_found` system. |
| Q9 Standard Routing Logic | 🔴 Missing | `mortgage_goal` extracted but no Q9 routing branching or Q9-MULTI path. |
| TRID Gate (`Q9-TRID-GATE`) | 🟡 Partial | SSN/address handled in `ailana-system.ts` lines 49–51. Missing Section 0 gate before Q9. |
| Equity Disambiguation Flow | 🟡 Partial | HELOC vs HEQ distinguished via `mortgage_goal` but no `equity_disambig_delivered` field or scripted flow. |
| Mixed Intent Handling | 🔴 Missing | No `secondary_intent` field or mixed-intent acknowledgment flow. |
| Fallback Routing Question | 🔴 Missing | No distinct fallback step — uses generic re-ask loop instead. |
| Stage 1 Gate (`Q9_confirmed`) | 🔴 Missing | Stage 1 fires immediately without `Q9_confirmed` guard. |
| Track Guard Rules | 🟡 Partial | Enforced in `buildLayer2()` by `transaction_type` but no guard at LLM prompt injection. |
| Q9-MULTI Templates (A–F + General) | 🔴 Missing | No multi-signal aggregation, no template selection, no prompt injection. |
| `TT-CON` / `TT-HECM` Holdout Routing | 🔴 Missing | Reserved flags defined in schema but no holdout response or MLO routing. |
| `stage0-routing.ts` Prompt File | 🔴 Missing | No `stage0-routing.ts` prompt file exists. |
| Layer 3 Context Block | 🔴 Missing | Section 0 routing state not exposed to LLM in Layer 3 context. |
| Test Suite (S0-1 to S0-15) | 🔴 Missing | No section0-routing.test.ts exists. |

---

## 🔍 What Currently Exists (Baseline — Do NOT Re-Implement)

### ✅ Already Done

1. **`BorrowerProfile.transaction_type`** — enum field in [`layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts) line 8. All 4 active TT flags (`TT-PUR`, `TT-REF`, `TT-HEL`, `TT-HEQ`) already defined.
2. **`BorrowerProfile.mortgage_goal`** + **`mortgage_goal_confirmed`** — set during Stage 1 extraction in [`session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) lines 2252–2270. **Keep as-is.**
3. **`buildLayer2()` track routing** — correctly switches Stage 2 prompt by `transaction_type` in [`ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts) lines 84–93. **Only a guard is being added at the top — the switch logic is untouched.**
4. **HELOC vs HEQ distinction** — `TT-HEL` / `TT-HEQ` switching via `heloc_rate_comfort` in `session-context-manager.ts` line 2693. **Keep as-is.**
5. **TRID compliance phrasing** — SSN and property address intercept text in [`ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts) lines 49–51. **Keep as-is; we are adding a pipeline gate before it, not replacing it.**
6. **Session opening greeting** — `GREETING_TEXT` defined in `ailana-system.ts` line 165. **Untouched.**
7. **Stage 1 extraction** — `runStage1Extraction()` extracts `mortgage_goal`, `occupancy`, `co_borrower`, `timeline`, `existing_relationship`. **The extraction function is being upgraded (T3), not replaced. Existing callers don't change.**
8. **Stall recovery SR-1 through SR-5** — Already exist in the stall recovery layer. **Untouched.** SR-6 through SR-10 are new additions (T14).

### 🔴 What Does NOT Exist Yet

1. **Section 0 session state fields** — 13 new fields for `signals_found`, `Q9_confirmed`, `Q9_MULTI_delivered`, `secondary_intent`, `trid_gate_fired`, `trid_gate_required`, `equity_disambig_delivered`, `fallback_routing_delivered`, `holdout_routed`, `pre_stated_income`, `pre_stated_savings`, `pre_stated_location`, `pre_stated_property_type`, `Q42_partial`, `context_current_rate` — none exist in `BorrowerProfile`.
2. **Multi-signal `signals_found` aggregation** — Current extraction sets `mortgage_goal` directly. No array aggregation.
3. **Q9-MULTI template selection logic** — No Template A–F or GENERAL selector.
4. **`stage0-routing.ts` prompt file** — Does not exist.
5. **Stage 1 gate** — `Q9_confirmed` guard missing from `buildLayer2()`. Stage 1 fires immediately.
6. **Equity disambiguation pending field + scripted flow** — No `equity_disambig_delivered` tracking.
7. **Fallback routing question as a distinct step** — No dedicated fallback step.
8. **Mixed intent handling** — No `secondary_intent` field or acknowledgment script.
9. **`TT-CON` / `TT-HECM` holdout** — Falls through to Stage 1 with no holdout response.
10. **Section 0 routing state block in Layer 3 context** — LLM cannot see routing state during Section 0.
11. **Test suite** — No `section0-routing.test.ts` exists.

---

## 📋 Implementation Plan — Task by Task

> **Rule:** Never skip a task group. Each group depends on the previous being complete. Mark status as work progresses.

---

### 🔵 PHASE 1 — Foundation: Schema & State
*Establish the data model so all downstream tasks build on correct types. Nothing can be built without this.*

---

#### TASK 1 — Add Section 0 Fields to BorrowerProfile `[CRITICAL]`
**File:** [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts)  
**Status:** 🔴 PENDING  
**Blocker for:** Every other task

**What to add:**  
Append these fields to the existing `BorrowerProfile` interface. The existing `transaction_type` and `mortgage_goal` fields stay exactly as-is — new fields sit alongside them.

```typescript
interface BorrowerProfile {
  // ── EXISTING FIELDS (keep exactly as-is) ──────────────────────────────
  transaction_type: 'TT-PUR' | 'TT-REF' | 'TT-HEL' | 'TT-HEQ' | 'TT-CON' | 'TT-HECM' | null;
  mortgage_goal: string | null;
  // ... all other existing fields ...

  // ── NEW: Section 0 Routing State Fields ───────────────────────────────
  Q9_confirmed: boolean;               // true = routing complete, Stage 1 can fire
  Q9_MULTI_delivered: boolean;         // prevents Q9-MULTI from re-firing
  secondary_intent: string | null;     // unchosen goal in mixed-intent case → passed to MLO
  trid_gate_fired: boolean;            // true = Q9-TRID-GATE already delivered
  trid_gate_required: boolean;         // true = SSN or property address detected in opening msg
  equity_disambig_delivered: boolean;  // true = HELOC vs HEQ disambiguation question delivered
  fallback_routing_delivered: boolean; // true = fallback routing question already delivered
  holdout_routed: boolean;             // true = TT-CON/TT-HECM MLO handoff completed

  // ── NEW: Front-Loading Extraction Fields ──────────────────────────────
  signals_found: string[];             // e.g. ['TT-PUR', 'veteran', 'co_borrower']
  pre_stated_income: number | null;    // annual income, from opening message
  pre_stated_savings: number | null;   // savings/down payment, from opening message
  pre_stated_location: string | null;  // city/state (NOT property address)
  pre_stated_property_type: string | null; // condo/townhome/single-family etc.
  Q42_partial: boolean;                // true if property type or location pre-stated
  context_current_rate: number | null; // refi context only — MLO reference, NEVER echoed to borrower
}
```

> [!CAUTION]
> `context_current_rate` is NOT added to `signals_found`. The LLM must never reference this value in a response. It is for MLO context only.

---

#### TASK 2 — Initialize Section 0 State in Context Manager `[CRITICAL]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING  
**Blocker for:** T3 through T17

**What to add:**  
In the session initialization function (wherever `BorrowerProfile` is first constructed), initialize all new fields to their zero-state defaults:

```typescript
function initBorrowerProfile(): BorrowerProfile {
  return {
    // ── Existing fields (keep exactly as-is) ──
    transaction_type: null,
    mortgage_goal: null,
    // ... all other existing fields with their current defaults ...

    // ── NEW: Section 0 routing state ──────────
    Q9_confirmed: false,              // CRITICAL: must be false — if true, Section 0 never runs
    Q9_MULTI_delivered: false,
    secondary_intent: null,
    trid_gate_fired: false,
    trid_gate_required: false,
    equity_disambig_delivered: false,
    fallback_routing_delivered: false,
    holdout_routed: false,

    // ── NEW: front-loading extraction ──────────
    signals_found: [],
    pre_stated_income: null,
    pre_stated_savings: null,
    pre_stated_location: null,
    pre_stated_property_type: null,
    Q42_partial: false,
    context_current_rate: null,
  };
}
```

> [!WARNING]
> `Q9_confirmed: false` is the most critical default in the entire implementation. Verify this is `false` — not `true` — before marking this task complete. The S0-1 test in Task 15 specifically tests this.

---

### 🔵 PHASE 2 — Extraction & TRID Gate
*Upgrade the first-turn extraction to produce `signals_found` and enforce TRID compliance before Q9.*

---

#### TASK 3 — Upgrade `extractOpeningSignals()` to Full Multi-Signal System `[CRITICAL]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) — in the first-turn extraction function  
**Status:** 🔴 PENDING  
**Blocker for:** T5, T6, T7, T8, T9, T12

**What to change:**  
The existing function captures `mortgage_goal`. Upgrade it to ALSO capture all signal types and populate `signals_found[]`. The existing `mortgage_goal` extraction logic is **preserved** — new signal types are added around it. The function signature does not change.

> [!IMPORTANT]
> This function runs **BEFORE** the LLM is invoked — pure string pattern matching only. Must complete in under 10ms. No API calls. No LLM calls.

```typescript
function extractOpeningSignals(input: string, profile: BorrowerProfile): void {
  const text = input.toLowerCase();
  const signals: string[] = [];

  // TRID GATE CHECK (runs first, before anything else)
  const ssnPattern = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/;
  const addrPattern = /\b\d+\s+[a-z]+\s+(st|ave|rd|blvd|dr|ln|way|ct)\b/i;
  if (ssnPattern.test(input) || addrPattern.test(input)) {
    profile.trid_gate_required = true;
    // Do NOT extract or store the SSN/address value — continue with other signals
  }

  // TRANSACTION TYPE
  if (/buy|purchase|first home|new home|find a home/.test(text)) {
    signals.push('TT-PUR');
  } else if (/refinanc|refi|lower my rate|lower my payment|cash.?out/.test(text)) {
    signals.push('TT-REF');
  } else if (/heloc|equity line|home equity line|line of credit/.test(text)) {
    signals.push('TT-HEL');
  } else if (/home equity loan|lump sum|equity loan/.test(text)) {
    signals.push('TT-HEQ');
  } else if (/build|construction|construct/.test(text)) {
    signals.push('TT-CON');   // holdout — routes to MLO
  } else if (/reverse mortgage|hecm/.test(text)) {
    signals.push('TT-HECM');  // holdout — routes to MLO
  }

  // VETERAN / MILITARY
  if (/veteran|military|army|navy|marines|air force|coast guard|active duty|served|service member/.test(text)) {
    profile.veteran_flagged = true;
    profile.Q43_answered = true;   // skip Q43 in Stage 2 purchase track
    signals.push('veteran');
  }

  // CO-BORROWER
  if (/my wife|my husband|my spouse|my partner|we are|we're|together|both of us|the two of us/.test(text)) {
    profile.co_borrower = true;
    profile.Q13_answered = true;   // skip Q13 in Stage 1
    signals.push('co_borrower');
  }

  // INCOME
  const incomeMatch = input.match(/\$?([\d,]+)\s*k?\s*(a year|annually|per year|income|salary)/i);
  if (incomeMatch) {
    const raw = incomeMatch[1].replace(/,/g, '');
    const hasK = text.slice(incomeMatch.index!, incomeMatch.index! + incomeMatch[0].length + 2).includes('k');
    profile.pre_stated_income = parseInt(raw) * (hasK ? 1000 : 1);
    profile.Q35_answered = true;
    signals.push('income');
  }

  // SAVINGS / DOWN PAYMENT
  const savingsMatch = input.match(/\$?([\d,]+)\s*k?\s*(saved|in savings|for.*down|available)/i);
  if (savingsMatch) {
    const raw = savingsMatch[1].replace(/,/g, '');
    const hasK = text.slice(savingsMatch.index!, savingsMatch.index! + savingsMatch[0].length + 2).includes('k');
    profile.pre_stated_savings = parseInt(raw) * (hasK ? 1000 : 1);
    profile.Q38_answered = true;
    signals.push('savings');
  }

  // PROPERTY TYPE
  const ptypes = ['condo','townhome','townhouse','single-family','multi-family','duplex','triplex'];
  for (const pt of ptypes) {
    if (text.includes(pt)) {
      profile.pre_stated_property_type = pt;
      profile.Q42_partial = true;
      signals.push('property_type');
      break;
    }
  }

  // LOCATION (city/state — NOT property address)
  const locMatch = input.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (locMatch && !addrPattern.test(input)) {
    profile.pre_stated_location = locMatch[1];
    profile.Q42_partial = true;
    if (!signals.includes('property_type')) signals.push('location');
  }

  // VOLUNTEERED RATE (refi context only — NEVER echoed back)
  const rateMatch = text.match(/(\d+\.?\d*)\s*%/);
  if (rateMatch && signals.includes('TT-REF')) {
    profile.context_current_rate = parseFloat(rateMatch[1]);
    // NOT added to signals_found — LLM must never reference this
  }

  profile.signals_found = signals;
}
```

**Key constraint:** The extraction layer sets `signals_found` — it does **NOT** set `transaction_type` directly. `transaction_type` is set only after Q9 is confirmed.

---

#### TASK 4 — Add TRID Gate Before Q9 Fires `[CRITICAL]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) — first-turn handler  
**Status:** 🔴 PENDING  
**Blocker for:** T5, T6–T9, T12

**What to add:**  
After `extractOpeningSignals()` runs, before any Q9 routing logic fires:

```typescript
// In the first-turn handler, BEFORE building the LLM prompt:
if (profile.trid_gate_required && !profile.trid_gate_fired) {
  profile.trid_gate_fired = true;
  injectForcedResponse(Q9_TRID_GATE_FORMULATION);
  // Then continue to Q9-MULTI or Q9 routing below
}
```

**Q9-TRID-GATE formulation (verbatim):**
> *"I want to make sure we handle your information correctly — for security and compliance purposes, I'm not able to collect that specific information through this channel at this point in our conversation. We'll have a secure way to gather it when we get to that step. For now, let's focus on getting your overall picture together."*

**TRID gate has the HIGHEST priority** — fires before Q9, Q9-MULTI, or any other routing. The volunteered SSN or address is **never** stored, echoed, or acknowledged.

---

### 🔵 PHASE 3 — Routing Logic & All Flows
*Implement the 6-step Section 0 decision sequence.*

---

#### TASK 5 — Implement Q9-MULTI Template Selection and Injection `[CRITICAL]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING  
**Blocker for:** T11, T12

**What to add:**  
`Q9-MULTI` fires when `signals_found.length >= 2`. Create a template selector and inject via the `bridge_to_say` (or equivalent forced-response) mechanism. Templates are **scripted** — the LLM fills `[bracketed]` fields from profile values but does not improvise the structure.

```typescript
function selectQ9MultiTemplate(signals: string[]): string {
  const s = new Set(signals);

  // Template F — full front-load (veteran + co-borrower + financials)
  if (s.has('TT-PUR') && s.has('veteran') && s.has('co_borrower') && (s.has('income') || s.has('savings'))) {
    return 'TEMPLATE_F';
  }
  // Template B — purchase + veteran + co-borrower
  if (s.has('TT-PUR') && s.has('veteran') && s.has('co_borrower')) {
    return 'TEMPLATE_B';
  }
  // Template A — purchase + veteran (no co-borrower)
  if (s.has('TT-PUR') && s.has('veteran')) {
    return 'TEMPLATE_A';
  }
  // Template C — purchase + co-borrower (no veteran)
  if (s.has('TT-PUR') && s.has('co_borrower')) {
    return 'TEMPLATE_C';
  }
  // Template D — purchase + income or savings
  if (s.has('TT-PUR') && (s.has('income') || s.has('savings'))) {
    return 'TEMPLATE_D';
  }
  // Template E — refinance + location
  if (s.has('TT-REF') && s.has('location')) {
    return 'TEMPLATE_E';
  }
  // GENERAL — any other multi-signal combination
  return 'TEMPLATE_GENERAL';
}
```

Mark `Q9_MULTI_delivered = true` after injection — prevents re-firing on subsequent turns.

**Template texts are verbatim from [`Layer0Doc.md` Section 7.7](file:///c:/Users/SAL/Downloads/ConvergentAI/Layer0Doc.md).** Do not paraphrase.

---

#### TASK 6 — Implement Q9 Standard Open Routing `[HIGH]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**  
When `signals_found` is empty after extraction (e.g., "I have some mortgage questions"):
- The LLM delivers Q9 using the `stage0-routing.ts` prompt block (Task 12).
- The pipeline reads the LLM's routing output signal and updates session state.
- Do **NOT** set `transaction_type` until the borrower explicitly confirms.

```typescript
// Pipeline reads LLM output after Q9:
if (llmOutput.includes('ROUTE: TT-PUR')) {
  profile.transaction_type = 'TT-PUR';
  profile.Q9_confirmed = true;
} else if (llmOutput.includes('ROUTE: TT-REF')) {
  profile.transaction_type = 'TT-REF';
  profile.Q9_confirmed = true;
} else if (llmOutput.includes('ROUTE: TT-HEL-AMBIG')) {
  // Equity disambiguation fires next turn
} else {
  // Unclear — fallback routing fires next turn
}
```

---

#### TASK 7 — Implement Equity Disambiguation Flow `[HIGH]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**  
When Q9 response returns `ROUTE: TT-HEL-AMBIG` (borrower said "equity" without specifying HELOC vs home equity loan):

```typescript
if (!profile.equity_disambig_delivered && llmOutput.includes('ROUTE: TT-HEL-AMBIG')) {
  profile.equity_disambig_delivered = true;
  // Inject verbatim equity disambiguation formulation
  // On next turn:
  //   ROUTE: TT-HEL → transaction_type = 'TT-HEL', Q9_confirmed = true
  //   ROUTE: TT-HEQ → transaction_type = 'TT-HEQ', Q9_confirmed = true
  //   ROUTE: UNSURE → inject HQ18 educational comparison, then re-ask
}
```

**Equity disambiguation formulation (verbatim):**
> *"Great — accessing your home equity is a smart move. Before we dive in, one quick question: are you thinking of a Home Equity Line of Credit — sometimes called a HELOC — where you draw funds as needed over time? Or a home equity loan, which gives you a fixed lump sum at a fixed rate all at once? If you're not sure which fits your situation better, I can explain the difference and help you decide."*

---

#### TASK 8 — Implement Fallback Routing Question `[HIGH]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**  
When Q9 fires but the borrower's response remains ambiguous:

```typescript
if (!profile.Q9_confirmed &&
    !profile.fallback_routing_delivered &&
    (profile.equity_disambig_delivered || turns_since_Q9 > 1)) {
  profile.fallback_routing_delivered = true;
  // Inject verbatim fallback formulation
}
// If still unclear after fallback → inject SR-1 (already exists)
// Do NOT advance to Stage 1 until Q9_confirmed = true
```

**Fallback formulation (verbatim):**
> *"Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"*

---

#### TASK 9 — Implement Mixed Intent Handling `[HIGH]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**  
When `signals_found` contains two distinct TT-* flags:

```typescript
// LLM outputs: ROUTE: MIXED | PRIMARY: TT-PUR | SECONDARY: TT-REF
if (llmOutput.includes('ROUTE: MIXED')) {
  const primary = extractRouteTag(llmOutput, 'PRIMARY');
  const secondary = extractRouteTag(llmOutput, 'SECONDARY');
  profile.secondary_intent = secondary;
  // Deliver mixed-intent acknowledgment formulation
  // On borrower's choice: set transaction_type and Q9_confirmed = true
}
```

**Mixed intent formulation (verbatim):**
> *"It sounds like you have two things on your mind — [goal 1] and [goal 2]. Those are both worth exploring, and they're actually connected. Let's tackle them one at a time so we give each the attention it deserves. Which would you like to start with?"*

`secondary_intent` is passed to MLO context summary only. Ailana does **not** revisit it.

---

#### TASK 10 — Implement `TT-CON` / `TT-HECM` Holdout Routing `[HIGH]`
**File:** [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts)  
**Status:** 🔴 PENDING

**What to add:**  

```typescript
const HOLDOUT_SIGNALS = ['TT-CON', 'TT-HECM'];

if (profile.signals_found.some(s => HOLDOUT_SIGNALS.includes(s)) && !profile.holdout_routed) {
  profile.holdout_routed = true;
  // Do NOT set transaction_type
  // Do NOT set Q9_confirmed
  // Inject holdout formulation + trigger MLO routing
}
```

**TT-CON holdout (verbatim):**
> *"Construction loans involve some specific requirements that I want to make sure we handle correctly with a licensed loan officer. Let me connect you with one of our specialists who can walk you through the construction financing process in detail. Can I get your best contact information?"*

**TT-HECM holdout (verbatim):**
> *"Reverse mortgages have some unique features that are best explained by a licensed loan officer. Let me connect you with a specialist who works with these programs every day. Can I get your best contact information?"*

These tracks must **never** activate Stage 1 or any discovery flow.

---

### 🔵 PHASE 4 — Stage Gate & Prompt Assembly
*Enforce that Stage 1 cannot fire without Q9 confirmed, and wire the Section 0 prompt into Layer 2.*

---

#### TASK 11 — Implement Stage 1 Gate (`Q9_confirmed` check) `[CRITICAL]`
**File:** [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts) — in `buildLayer2()`  
**Status:** 🔴 PENDING  
**Blocker for:** T12, T15

**What to add:**  
Add a guard at the **top** of `buildLayer2()`. The existing track-switching code is completely untouched — it is just unreachable until `Q9_confirmed = true`:

```typescript
function buildLayer2(profile: BorrowerProfile): string {
  // NEW: Section 0 gate — runs before any existing track logic
  if (!profile.Q9_confirmed) {
    return buildSection0Block(profile);  // load Section 0 routing block only
  }
  // EXISTING CODE (untouched) below this line
  switch (profile.transaction_type) {
    case 'TT-PUR': return buildPurchaseTrack(profile);
    case 'TT-REF': return buildRefinanceTrack(profile);
    case 'TT-HEL': return buildHELOCTrack(profile);
    case 'TT-HEQ': return buildHEQTrack(profile);
    default: return buildSection0Block(profile); // safety fallback
  }
}
```

The gate is the pipeline's responsibility — do not rely on the LLM to self-enforce this.

---

#### TASK 12 — Create `stage0-routing.ts` Prompt File `[HIGH]`
**File:** `backend/src/prompts/stage0-routing.ts` *(NEW FILE — does not replace any existing file)*  
**Status:** 🔴 PENDING  
**Blocker for:** T13, T15, T17

**What to create:**  
A new TypeScript string export containing the Section 0 prompt block — the text the LLM reads to understand routing. Pipeline logic stays in handler files.

```typescript
// stage0-routing.ts
export const SECTION_0_PROMPT = `
SECTION 0 — TRANSACTION TYPE ROUTING

You are in the routing phase. Your only job is to determine what
the borrower wants to do and output a routing signal. Do not ask
discovery questions. Do not collect financial information.

ROUTING OUTPUT FORMAT:
After delivering any formulation, output on a new line:
  ROUTE: [TT-PUR | TT-REF | TT-HEL | TT-HEQ | TT-HEL-AMBIG |
          MIXED | UNCLEAR | HOLDOUT-CON | HOLDOUT-HECM]
  (for mixed intent): PRIMARY: [flag] | SECONDARY: [flag]

ROUTING RULES:
1. If signals_found has 2+ signals, deliver the Q9-MULTI template
   selected by the pipeline. Do not re-ask for already-captured information.
2. If signals_found has exactly 1 transaction type signal, confirm it:
   "It sounds like you're looking to [X] — is that right?"
3. If signals_found is empty, ask Q9.
4. If borrower mentions construction or reverse mortgage, output
   ROUTE: HOLDOUT-CON or ROUTE: HOLDOUT-HECM.
5. NEVER output a Stage 1 question (Q1-Q13) until Q9_confirmed = true.
6. NEVER set transaction_type yourself — output the ROUTE signal and
   let the pipeline set it after borrower confirmation.
`;
```

The file also contains all verbatim formulations (Q9, Q9-TRID-GATE, equity disambiguation, fallback, mixed intent, Templates A–F, holdout texts). Full formulation text: [`Layer0Doc.md` Section 7](file:///c:/Users/SAL/Downloads/ConvergentAI/Layer0Doc.md).

---

#### TASK 13 — Wire `stage0-routing.ts` into `buildLayer2()` `[HIGH]`
**File:** [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts)  
**Status:** 🔴 PENDING

**What to add:**  
Import `SECTION_0_PROMPT` and implement `buildSection0Block()` — the function called by the Task 11 gate:

```typescript
import { SECTION_0_PROMPT } from './stage0-routing';

function buildSection0Block(profile: BorrowerProfile): string {
  let block = SECTION_0_PROMPT;

  // Append current routing state so LLM knows exactly where it is
  block += `\nCURRENT ROUTING STATE:`;
  block += `\nsignals_found: ${JSON.stringify(profile.signals_found)}`;
  block += `\ntrid_gate_fired: ${profile.trid_gate_fired}`;
  block += `\nequity_disambig_delivered: ${profile.equity_disambig_delivered}`;
  block += `\nfallback_routing_delivered: ${profile.fallback_routing_delivered}`;
  block += `\nQ9_confirmed: false`;

  return block;
}
```

---

#### TASK 14 — Add Section 0 Block to Layer 3 Context `[MEDIUM]`
**File:** [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts) — in `buildLayer3TurnContext()`  
**Status:** 🔴 PENDING

**What to add:**  
Two additions:

**1.** Add a Section 0 routing state block (only visible when `Q9_confirmed === false`):

```text
=== SECTION 0 — ROUTING STATE ===
Q9 Confirmed:               false
Signals Found:              [TT-PUR, veteran] (or empty)
Q9-MULTI Delivered:         false
Equity Disambig Delivered:  false
Fallback Delivered:         false
Secondary Intent:           (none)
```

**2.** Add SR-1 availability note to the stall recovery block header:

```typescript
// 'SR-1 (clarifying question) is available during Section 0 routing
// when transaction type cannot be determined after the fallback
// routing question. Output ROUTE: UNCLEAR to trigger SR-1.'
```

**Note:** SR-1 through SR-5 are untouched. SR-6 through SR-10 are new additions per spec.

---

### 🔵 PHASE 5 — Test Suite & Verification
*Write all 15 unit tests and 9 live E2E scenarios. All must pass before any deployment.*

---

#### TASK 15 — Create `section0-routing.test.ts` with 15 Tests `[HIGH]`
**File:** `backend/src/__tests__/section0-routing.test.ts` *(NEW FILE)*  
**Status:** 🔴 PENDING  
**Blocker for:** Deployment

| Test ID | Borrower Input | Expected Pipeline Output | Key Assertion |
| :--- | :--- | :--- | :--- |
| **S0-1** | `'I have some mortgage questions'` | Q9 fires. `signals_found = []`. `Q9_confirmed = false`. | Stage 1 does NOT fire. *(Critical default check.)* |
| **S0-2** | `'I want to buy a house'` | `signals_found = ['TT-PUR']`. Q9-MULTI confirmation fires. On confirm: `transaction_type = 'TT-PUR'`, `Q9_confirmed = true`. | Standard Q9 does NOT fire instead of Q9-MULTI. |
| **S0-3** | `'My SSN is 123-45-6789 and I want to buy a house'` | `trid_gate_required = true`. TRID gate fires FIRST. SSN NOT stored anywhere. | Profile contains no SSN value. |
| **S0-4** | `'I want to tap into my equity'` | Q9 fires. Equity disambiguation fires after response. Routes to TT-HEL or TT-HEQ on choice. | `equity_disambig_delivered = true` before routing confirmed. |
| **S0-5** | `'I want to buy a house and also refinance my current one'` | Mixed intent fires. `secondary_intent = 'TT-REF'`. On choice, `Q9_confirmed = true`. | Both tracks do NOT activate simultaneously. |
| **S0-6** | Ambiguous response to Q9 | Fallback routing fires. `fallback_routing_delivered = true`. | Stage 1 does NOT fire before fallback exhausted. |
| **S0-7** | `'I want to build a house'` | `signals_found = ['TT-CON']`. Holdout fires. MLO routing triggered. | `transaction_type` remains null. `Q9_confirmed` remains false. |
| **S0-8** | `'I want to buy a home and I am a veteran'` | `signals_found = ['TT-PUR', 'veteran']`. Template A selected. | `Q43_answered = true`. Q43 NOT re-asked in Stage 2. |
| **S0-9** | `'My wife and I make $110K and want to buy our first home'` | `signals_found = ['TT-PUR', 'co_borrower', 'income']`. Template D or F. | `Q13_answered = true`. `Q35_answered = true`. |
| **S0-10** | `'I want to refinance my condo in Orlando'` | `signals_found = ['TT-REF', 'property_type', 'location']`. Template E selected. | `pre_stated_location = 'Orlando'`. `Q42_partial = true`. |
| **S0-11** | Borrower confirms purchase on Q9-MULTI | `transaction_type = 'TT-PUR'`. `Q9_confirmed = true`. `buildLayer2()` returns purchase track. | Stage 1 fires immediately after confirmation. |
| **S0-12** | Borrower says `'HELOC'` to equity disambiguation | `transaction_type = 'TT-HEL'`. `Q9_confirmed = true`. | `TT-HEQ` NOT activated. |
| **S0-13** | `'I want a reverse mortgage'` | `signals_found = ['TT-HECM']`. Holdout fires. | `transaction_type` remains null. |
| **S0-14** | `'I currently pay 7.5% and want to refinance'` | `signals_found = ['TT-REF']`. `context_current_rate = 7.5`. Rate NOT in `signals_found`. | LLM prompt does NOT contain the rate figure. |
| **S0-15** | After Q9-MULTI, Stage 2 runs — veteran not re-asked | Profile has `Q43_answered = true` from extraction. | Q43 does NOT appear in Stage 2 question sequence. |

---

#### TASK 16 — Register Test Suite in `run-all-tests.ts` `[MEDIUM]`
**File:** [`backend/src/__tests__/run-all-tests.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/__tests__/run-all-tests.ts)  
**Status:** 🔴 PENDING

**What to add:**  
Register `section0-routing.test.ts` in the test runner alongside existing suites. Section 0 tests must pass before any build is considered ready for staging or production.

---

#### TASK 17 — Local E2E Testing — 9 Live Scenarios `[HIGH]`
**Status:** 🔴 PENDING  
**How to test:** Start backend dev server and frontend. Run each live conversation scenario — actual LLM calls with the full prompt stack, not unit tests.

| Scenario | Opening Message | What to Verify |
| :--- | :--- | :--- |
| **E2E-1** | `'I want to buy a home'` | Q9-MULTI confirmation fires. Track activates only on borrower yes. |
| **E2E-2** | `'I want to buy a home and I am a veteran'` | Template A fires. Q43 NOT re-asked in Stage 2. |
| **E2E-3** | `'My wife and I make $110K, we're veterans, $40K saved, want to buy in Florida'` | Template F fires. Q13, Q35, Q38, Q43 all skipped in Stage 2. |
| **E2E-4** | `'I have some mortgage questions'` | Q9 open routing. No track until borrower responds. |
| **E2E-5** | `'I want to access my home equity'` | Equity disambiguation fires. Routes correctly to HEL or HEQ. |
| **E2E-6** | `'My SSN is 123-45-6789 and I want to buy a house'` | TRID gate fires first. Q9-MULTI fires after. SSN NOT in any response. |
| **E2E-7** | `'I want to build a house'` | Holdout formulation fires. MLO routing. Stage 1 does NOT fire. |
| **E2E-8** | `'I want to buy a house and refinance my current one'` | Mixed intent acknowledgment. `secondary_intent` stored. One track activates. |
| **E2E-9** | `'I want a reverse mortgage'` | HECM holdout. MLO routing. Stage 1 does NOT fire. |

**Final acceptance gate:** David Patten acceptance test — 3+ realistic live conversations across different transaction types must complete correctly before staging deployment.

---

## 📁 Files To Create / Modify

| File | Action | Tasks |
| :--- | :--- | :--- |
| [`backend/src/prompts/layer3-context.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/layer3-context.ts) | **MODIFY** — Append 15 new `BorrowerProfile` fields + Section 0 context block in Layer 3 | T1, T14 |
| [`backend/src/context/session-context-manager.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/context/session-context-manager.ts) | **MODIFY** — Init defaults, upgrade extraction, all routing flows and gate | T2, T3, T4, T5, T6, T7, T8, T9, T10 |
| `backend/src/prompts/stage0-routing.ts` | **CREATE NEW** — Section 0 prompt block with all scripted formulations | T12 |
| [`backend/src/prompts/ailana-system.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/prompts/ailana-system.ts) | **MODIFY** — Add `Q9_confirmed` guard at top of `buildLayer2()` + `buildSection0Block()` | T11, T13 |
| `backend/src/__tests__/section0-routing.test.ts` | **CREATE NEW** — All 15 unit test cases (S0-1 to S0-15) | T15 |
| [`backend/src/__tests__/run-all-tests.ts`](file:///c:/Users/SAL/Downloads/ConvergentAI/backend/src/__tests__/run-all-tests.ts) | **MODIFY** — Register new test suite | T16 |

**Total: 2 new files, 4 modified files. No deletions.**

---

## 📐 Key Rules & Constraints (Non-Negotiable)

> These rules come directly from the spec and from David Patten's client guidance. Must be enforced throughout every task.

1. **`transaction_type` is NEVER set before `Q9_confirmed = true`.** Extraction populates `signals_found` only. `transaction_type` is assigned on borrower confirmation.
2. **Stage 1 CANNOT fire until `Q9_confirmed = true`.** The gate in `buildLayer2()` is the pipeline's responsibility — do not rely on the LLM to self-enforce this.
3. **TRID gate has HIGHEST priority.** Fires before Q9 or Q9-MULTI. SSN and property address are NEVER stored anywhere.
4. **Q9-MULTI fires only once per session.** `Q9_MULTI_delivered = true` prevents re-firing.
5. **`TT-CON` / `TT-HECM` always result in holdout + MLO routing.** These tracks are never activated.
6. **`secondary_intent` is stored but Ailana never acts on it.** The MLO handles the unchosen goal.
7. **Equity disambiguation is mandatory** before setting `TT-HEL` or `TT-HEQ`, unless the borrower named HELOC or home equity loan explicitly in their first message.
8. **Q43 (military service) is purchase-track ONLY.** `veteran_flagged` in other tracks is captured by extraction only — Q43 is never asked again.
9. **All Q9-MULTI template text is verbatim from the spec.** The LLM fills `[bracketed]` fields from profile values but does not improvise the template structure.
10. **`context_current_rate` is MLO context only.** It is NOT in `signals_found`. The LLM must never echo or reference this value.
11. **No existing prompts, Q-numbers, or formulations are modified.** Section 0 gates access to Stage 1 but changes nothing inside it. SR-1 through SR-5 are untouched.

---

## 🚦 Progress Tracker

*Update this table after completing each task.*

| Task | Phase | Description | Priority | Status | Completed By | Date |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| T1 | Phase 1 | Add Section 0 fields to `BorrowerProfile` | 🔴 CRITICAL | 🔴 PENDING | — | — |
| T2 | Phase 1 | Initialize Section 0 state in Context Manager | 🔴 CRITICAL | 🔴 PENDING | — | — |
| T3 | Phase 2 | Upgrade `extractOpeningSignals()` to multi-signal | 🔴 CRITICAL | 🔴 PENDING | — | — |
| T4 | Phase 2 | Add TRID Gate before Q9 fires | 🔴 CRITICAL | 🔴 PENDING | — | — |
| T5 | Phase 3 | Implement Q9-MULTI template selection | 🔴 CRITICAL | 🔴 PENDING | — | — |
| T6 | Phase 3 | Implement Q9 standard open routing | 🟡 HIGH | 🔴 PENDING | — | — |
| T7 | Phase 3 | Implement equity disambiguation flow | 🟡 HIGH | 🔴 PENDING | — | — |
| T8 | Phase 3 | Implement fallback routing question | 🟡 HIGH | 🔴 PENDING | — | — |
| T9 | Phase 3 | Implement mixed intent handling | 🟡 HIGH | 🔴 PENDING | — | — |
| T10 | Phase 3 | Implement TT-CON / TT-HECM holdout routing | 🟡 HIGH | 🔴 PENDING | — | — |
| T11 | Phase 4 | Implement Stage 1 gate (`Q9_confirmed` check) | 🔴 CRITICAL | 🔴 PENDING | — | — |
| T12 | Phase 4 | Create `stage0-routing.ts` prompt file | 🟡 HIGH | 🔴 PENDING | — | — |
| T13 | Phase 4 | Wire `stage0-routing.ts` into `buildLayer2()` | 🟡 HIGH | 🔴 PENDING | — | — |
| T14 | Phase 4 | Add Section 0 block to Layer 3 context | 🟢 MEDIUM | 🔴 PENDING | — | — |
| T15 | Phase 5 | Create `section0-routing.test.ts` (15 tests) | 🟡 HIGH | 🔴 PENDING | — | — |
| T16 | Phase 5 | Register test suite in `run-all-tests.ts` | 🟢 MEDIUM | 🔴 PENDING | — | — |
| T17 | Phase 5 | Local E2E testing (9 live scenarios) | 🟡 HIGH | 🔴 PENDING | — | — |

---

## 🗂️ Dependency Order (Safe Execution Sequence)

```
GROUP 1 — Foundation (T1, T2) ← Start here
  T1 (BorrowerProfile schema)
    └─→ T2 (Context Manager initialization defaults)

GROUP 2 — Extraction (T3, T4) ← Depends on Group 1
          └─→ T3 (extractOpeningSignals() upgrade)
                └─→ T4 (TRID Gate)

GROUP 3 — Routing Logic (T5–T10) ← Depends on Group 2
                └─→ T5 (Q9-MULTI template selection)
                    T6 (Q9 standard open routing)
                    T7 (equity disambiguation)
                    T8 (fallback routing question)
                    T9 (mixed intent handling)
                    T10 (TT-CON / TT-HECM holdout)

GROUP 4 — Gate & Prompt (T11–T14) ← Depends on Group 3
                          └─→ T11 (Stage 1 gate — Q9_confirmed guard in buildLayer2)
                                └─→ T12 (stage0-routing.ts prompt file — NEW)
                                      └─→ T13 (wire into buildLayer2)
                                            └─→ T14 (Layer 3 context block)

GROUP 5 — Tests (T15–T17) ← Depends on Group 4
                              └─→ T15 (section0-routing.test.ts — 15 unit tests)
                                    └─→ T16 (register in run-all-tests.ts)
                                          └─→ T17 (9 live E2E scenarios)
                                                └─→ David Patten acceptance test → STAGING
```

> [!CAUTION]
> Do NOT skip Group 1. Every other task depends on the `BorrowerProfile` fields being present. Attempting T3 (extraction) before T1 (schema) will cause runtime errors.

---

*ConvergentAI | Ailana v8.7 | Layer 0 — Section 0 Implementation Plan | October 2026 | Internal Use Only*  
*Reference: [`Layer0Doc.md`](file:///c:/Users/SAL/Downloads/ConvergentAI/Layer0Doc.md) (Parts 1, 2 & 3) | Client guidance: David Patten, October 10, 2026*
