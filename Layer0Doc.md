# CONVERGENTAI
## Ailana Master v8.7
# PART 1: Section 0 — Transaction Type Routing Architecture
### Specification, formulations, decision logic, and dev implementation

*ConvergentAI | October 2026 | Internal Use Only*  
*Source: Ailana Master v8.7 (Drive ID: 1ptQemq_qUZpH6-9b7PZ0vYEouuTfPZXI4djj38eUDhc)*

---

## 1. What Section 0 Is

Section 0 sits between the SAFE Act guardrails and Stage 1 in the Ailana master prompting document. It is the first thing that runs after the session opening greeting. Its sole purpose is to identify what the borrower wants to do and route them to the correct conversation track before Stage 1 begins.

Section 0 does not ask discovery questions. It does not collect financial information. It does not deliver compliance disclosures. It performs one function: determine the transaction type and set the session state flag that governs the rest of the conversation.

Section 0 is not a resilience layer component and not a Layer 1-4 runtime layer. It is a document section — a pre-stage routing block that executes once per session, at first contact, before any track-specific content loads.

---

## 2. Transaction Type Flags

On Q9 confirmation, Section 0 sets the `transaction_type` flag in Layer 4 (session state). Layer 2 then swaps to the matching track module. The flag governs which questions fire, which compliance rules apply, and which findings delivery formulation is used.

| Flag | Transaction type | Track activates | Stage 2 questions |
| :--- | :--- | :--- | :--- |
| **TT-PUR** | Purchase — new home acquisition | Purchase track | Q35–Q44 + Section 2A (Q14–Q34) |
| **TT-REF** | Refinance — rate/term, cash-out, or program-specific | Refinance track | RQ14–RQ65 with loan-type sub-tracks |
| **TT-HEL** | HELOC — Home Equity Line of Credit | HELOC track | HQ14–HQ55 |
| **TT-HEQ** | Home equity loan — fixed lump sum | Home equity loan track | EQ14–EQ50 |
| **TT-CON** | Construction or construction-to-permanent | Construction track | Reserved — future build |
| **TT-HECM** | Reverse mortgage (seniors) | HECM track | Deferred — not in current milestones |

`TT-CON` (construction) and `TT-HECM` (reverse mortgage) flags are reserved. If a borrower indicates interest in either, Ailana delivers a holding response and routes to a licensed loan officer — these tracks are not yet built.

The following stages and modules are shared across all tracks regardless of transaction type. They do not reload or swap when the track changes:
- Stage 1 — Greeting and Intent Discovery (Q1–Q13)
- Stage 2.5 — Affordability Scenario Review (Q46–Q58)
- Findings Delivery — FD1, FD1-alt, FD2 (purchase) / RFD1, RFD2 (refinance)
- Short Variants Reference — delivered_flags mechanism
- Compliance Reference Summary — Items 1–36
- VA Eligibility Detail Reference — background knowledge block

---

## 3. Routing Decision Logic

Section 0 routing follows a defined decision sequence. Each step is attempted in order. Routing stops at the first successful determination.

### Step 1 — Front-loading extraction (runs before Section 0)
The signal extraction layer runs on the borrower's first input before Section 0 executes. If transaction type is captured by extraction, it is stored in session state as a `pre_stated` signal. Section 0 confirms the extracted signal with the borrower rather than asking for it from scratch.

```text
IF signals_found includes TT-PUR / TT-REF / TT-HEL / TT-HEQ:
    → Section 0 confirms the extracted signal via Q9-MULTI
    → Does not ask the standard routing question
    → Sets transaction_type from the extracted signal on confirmation
```

*Reference: Ailana v8.7 Addendum — Front-Loading Signal Extraction (Drive).*

### Step 2 — Clear single-signal intent
If the borrower's opening message contains a single clear transaction type signal and the extraction layer sets it, Q9 fires as a confirmation of the extracted intent rather than an open-ended question.

- **Example — purchase intent extracted:**  
  > "It sounds like you're looking to purchase a home — is that right?"

- **Example — refinance intent extracted:**  
  > "It sounds like you're looking to refinance — is that right?"

### Step 3 — Q9 open routing question
If the extraction layer does not capture a transaction type — the borrower said something general like 'I have some mortgage questions' — Q9 fires as the standard open routing question:

- **Q9 standard:**  
  > "To make sure I take you in the right direction — are you looking to purchase a home, refinance an existing mortgage, or access the equity you've already built in your home?"

### Step 4 — Equity disambiguation
If the borrower's response indicates general equity access intent without specifying HELOC vs. home equity loan, the equity disambiguation question fires before routing:

- **Equity disambiguation:**  
  > "Great — accessing your home equity is a smart move. Before we dive in, one quick question: are you thinking of a Home Equity Line of Credit — sometimes called a HELOC — where you draw funds as needed over time? Or a home equity loan, which gives you a fixed lump sum at a fixed rate all at once? If you're not sure which fits your situation better, I can explain the difference and help you decide."

- Borrower chooses HELOC → Set `TT-HEL`, activate HELOC track
- Borrower chooses home equity loan → Set `TT-HEQ`, activate home equity loan track
- Borrower unsure → Deliver HQ18 educational comparison, then ask which better fits, then route

### Step 5 — Fallback routing question
If transaction type is still unclear after the equity disambiguation question — or if the borrower gave an ambiguous response to Q9 — Ailana asks the direct fallback routing question:

- **Fallback routing:**  
  > "Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"

Routes on the borrower's answer. If still unclear after the fallback, Ailana delivers SR-1 (clarifying question from the stall recovery layer) and does not proceed to Stage 1 until transaction type is confirmed.

### Step 6 — Mixed intent handling
If the borrower expresses two transaction types simultaneously — for example, 'I want to buy a house and also refinance my current one' — Section 0 acknowledges both goals and routes to the chosen track:

- **Mixed intent:**  
  > "It sounds like you have two things on your mind — [goal 1] and [goal 2]. Those are both worth exploring, and they're actually connected. Let's tackle them one at a time so we give each the attention it deserves. Which would you like to start with?"

The unchosen goal is stored in session state as `secondary_intent` for the licensed loan officer. The chosen track activates. After the first track completes its discovery flow, Ailana does not automatically offer the second goal — the MLO handles that conversation.

---

## 4. Section 0 Decision Flow

The following sequence governs every session from first input through track activation:

```text
BORROWER FIRST INPUT RECEIVED
    |
    v
[EXTRACTION LAYER] — runs before LLM invocation
    |-- Transaction type extracted → Q9-MULTI confirmation → transaction_type set → STAGE 1
    |-- No transaction type extracted → continue to Q9
    |
    v
[Q9] — Standard routing question
    |-- Clear single intent → confirm → transaction_type set → STAGE 1
    |-- Equity access intent → continue to equity disambiguation
    |-- Unclear intent → continue to fallback routing
    |-- Mixed intent → acknowledge both → borrower chooses → transaction_type set → STAGE 1
    |
    v
[EQUITY DISAMBIGUATION] — HELOC vs home equity loan
    |-- HELOC chosen → TT-HEL set → STAGE 1
    |-- Home equity loan chosen → TT-HEQ set → STAGE 1
    |-- Unsure → HQ18 comparison → choice → TT-HEL or TT-HEQ set → STAGE 1
    |
    v
[FALLBACK ROUTING QUESTION] — direct three-way choice
    |-- Purchase → TT-PUR set → STAGE 1
    |-- Refinance → TT-REF set → STAGE 1
    |-- Equity → equity disambiguation → STAGE 1
    |-- Still unclear → SR-1 stall recovery → loop
```

---

## 5. Track Guard Rules

Several formulations are track-specific and must never appear in the wrong track. These guards are enforced by the session state flag — once `transaction_type` is set, only the formulations for that track are available in Layer 2.

| Formulation | Appears in | Must NOT appear in |
| :--- | :--- | :--- |
| **Q40 — Real estate agent connected?** | Purchase track (TT-PUR) | Refinance, HELOC, home equity loan tracks |
| **Q43 — Military service?** | Purchase track (TT-PUR) only | All other tracks — veteran flag captured at extraction or Q43 only in purchase |
| **RQ27-MAXOUT — Maximum cash-out mandatory** | Refinance track (TT-REF) cash-out sub-track | Purchase, HELOC, home equity tracks |
| **VA-REF — VA refinance sub-track** | Refinance track (TT-REF) only | Purchase track — VA purchase questions differ from VA refi |
| **HQ18 — HELOC vs home equity education** | Section 0 disambiguation + HELOC track | Purchase, refinance tracks |
| **FD1 / FD2 — Purchase findings delivery** | Purchase track (TT-PUR) | Refinance track uses RFD1 / RFD2 |

Q43 (military service) is purchase-track only as of v8.7. In all other tracks, veteran status is captured by the front-loading extraction layer on the first borrower turn or by the licensed loan officer. Do not add Q43 to refinance, HELOC, or home equity loan discovery flows.

---

## 6. Session State — Section 0 Fields

Section 0 reads and sets the following Layer 4 session state fields. These must be present in the session state schema before Section 0 can execute correctly.

| Field | Type | Set by | Read by | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `transaction_type` | enum: `TT-PUR` / `TT-REF` / `TT-HEL` / `TT-HEQ` / `TT-CON` / `TT-HECM` | Section 0 on Q9 confirmation | Layer 2 — determines which track module loads | Core routing flag; never set before Q9 is confirmed |
| `signals_found` | `list[str]` | Front-loading extraction layer | Section 0 — determines Q9 vs Q9-MULTI path | If includes transaction type signal, Section 0 confirms rather than asks |
| `secondary_intent` | `str` or `null` | Section 0 — mixed intent handling | MLO context summary | Stores the unchosen goal when borrower expresses two intents; passed to MLO |
| `Q9_confirmed` | `bool` | Section 0 on track confirmation | Stage 1 gate | Must be true before Stage 1 begins; Stage 1 cannot fire without confirmed transaction type |
| `Q9_MULTI_delivered` | `bool` | Q9-MULTI formulation delivery | Section 0 / delivered_flags system | Prevents Q9-MULTI from re-firing on subsequent turns |
| `veteran_flagged` | `bool` | Extraction layer or Q43 | Stage 2 track — purchase only | If true at Section 0, veteran acknowledgment is included in Q9-MULTI Template A or B |
| `co_borrower` | `bool` | Extraction layer or Q13 | Stage 1 — Q13 skip if already set | If true at Section 0, co-borrower is acknowledged in Q9-MULTI and Q13 is skipped |

---

## 7. Formulations Reference

All Section 0 formulations are reproduced here verbatim from the v8.7 master. These are not generated responses — they are scripted formulations that the LLM delivers exactly as written.

### 7.1 Session Opening Greeting (fires before Section 0 routing)

- **First-time session:**  
  > "Hi! I'm Ailana, your AI mortgage assistant. Whether you are purchasing a home or refinancing an existing mortgage, I'm here to make your journey clearer and smoother. Your lending institution is an Equal Housing Lender, committed to fair lending practices for all borrowers. You can connect with me via text chat or AI-voice, and I can bridge you directly to a licensed loan officer whenever you're ready. To get started, what mortgage questions do you have for me today?"

- **Returning borrower (v8.5 — fires when `session_login_complete` is true for a recognized returning account):**  
  > "Welcome back, [Name]! Good to see you again — I've got your previous session right where you left off. Would you like to pick up from there, or start fresh on something new?"

*Compliance: Satisfies AI identity disclosure per FCC 2024 guidance and Equal Housing Opportunity disclosure (Compliance Item 8-EHO). Fixed script — not modified by LLM at runtime. The returning borrower variant is a defined branch, not a generated response.*

### 7.2 Q9 — Standard routing question

- **Q9:**  
  > "To make sure I take you in the right direction — are you looking to purchase a home, refinance an existing mortgage, or access the equity you've already built in your home?"

- **Fires when:** extraction layer did not capture transaction type on first turn.
- **Does not fire when:** Q9-MULTI fires instead (2+ signals extracted on first turn).

### 7.3 Q9-TRID-GATE — Mandatory TRID formulation

- **Q9-TRID-GATE:**  
  > "I want to make sure we handle your information correctly — for security and compliance purposes, I'm not able to collect that specific information through this channel at this point in our conversation. We'll have a secure way to gather it when we get to that step. For now, let's focus on getting your overall picture together. [Continue with Q9 or Q9-MULTI as appropriate.]"

- **Fires when:** borrower volunteers SSN or property address in any opening message. Fires before Q9 or Q9-MULTI. The volunteered item is not stored, repeated, or acknowledged by content.
- **Compliance:** TRID four-of-six posture maintained.

### 7.4 Equity disambiguation question

- **Equity disambiguation:**  
  > "Great — accessing your home equity is a smart move. Before we dive in, one quick question: are you thinking of a Home Equity Line of Credit — sometimes called a HELOC — where you draw funds as needed over time? Or a home equity loan, which gives you a fixed lump sum at a fixed rate all at once? If you're not sure which fits your situation better, I can explain the difference and help you decide."

- **Fires when:** borrower response to Q9 indicates equity access intent without specifying HELOC or home equity loan.

### 7.5 Fallback routing question

- **Fallback:**  
  > "Are you looking to purchase a new home, refinance an existing mortgage, or access the equity you've already built?"

- **Fires when:** transaction type is still unclear after Q9 and equity disambiguation (if applicable).

### 7.6 Mixed intent acknowledgment

- **Mixed intent:**  
  > "It sounds like you have two things on your mind — [goal 1] and [goal 2]. Those are both worth exploring, and they're actually connected. Let's tackle them one at a time so we give each the attention it deserves. Which would you like to start with?"

- **Fires when:** borrower expresses two distinct transaction type intents simultaneously. The unchosen goal is stored in `secondary_intent` for the licensed loan officer.

### 7.7 Q9-MULTI Templates (front-loading addendum — v8.7)

Q9-MULTI fires when the extraction layer captures two or more signals from the borrower's first input. Six templates cover common signal combinations. Select by matching the extracted `signals_found` set.

- **Template A — Purchase + veteran**  
  > "Thank you for that — sounds like you're looking to purchase a home, and I've noted your military service. That opens up some excellent loan options we'll want to explore together, including VA financing. To make sure I have the full picture before we dive in: will you be applying on your own, or will you have someone applying with you?"

- **Template B — Purchase + veteran + co-borrower**  
  > "Great — so you and your [spouse/partner] are looking to purchase a home together, and I've noted your military service. That's a strong combination and opens up VA financing options we'll definitely want to look at. To get started on the right track: do you have a target purchase price range in mind, or would you rather use our affordability tool to work that out together?"

- **Template C — Purchase + co-borrower (no veteran)**  
  > "It sounds like you and your [spouse/partner] are looking to purchase a home together — that's exciting. To make sure I'm building the right picture for both of you: what's your general timeline? Are you hoping to close within the next few months, or are you earlier in the planning stage?"

- **Template D — Purchase + income + savings stated**  
  > "Perfect — so you're looking to purchase a home, and I've noted that you have [pre_stated_savings] available and an income of around [pre_stated_income] annually. That gives us a great starting point. To build your full picture: will anyone else be applying with you on this loan?"

- **Template E — Refinance + location stated**  
  > "Got it — you're looking to explore refinancing your home in [pre_stated_location]. Let's take a look at your options. To point us in the right direction: are you primarily looking to lower your rate or payment, or were you thinking about taking some cash out?"

- **Template F — Full front-load (multiple signals)**  
  > "Thank you for sharing all of that — that gives me a great head start. So [name], you and your [spouse/partner] are looking to purchase a home. I've noted your military service, your income of around [income], and the [savings] you have available. That's a solid foundation. Just a couple of things I still need to build your complete picture: what type of home are you looking for — single-family, condo, townhome? And do you have a target price range in mind?"

- **GENERAL template — any multi-signal combination not covered above**  
  > "Thank you — I've picked up a few things from what you shared: [natural language summary of extracted signals]. Let me make sure I have everything I need to give you the most accurate picture. [Transition to first uncaptured question]."

**Instruction to LLM:** Summarize only what was explicitly stated. Do not infer or add information not present in the borrower's input. Move directly to the first uncaptured question — do not recap already-captured information a second time.

---

## 8. Compliance Notes

- **Compliance Item 8-EHO:** The session opening greeting includes 'Your lending institution is an Equal Housing Lender, committed to fair lending practices for all borrowers.' This satisfies ECOA / Fair Housing Act equal housing opportunity disclosure requirements. The statement is fixed — it is not modified by the LLM at runtime.

- **FCC 2024 AI disclosure:** The session opening greeting identifies Ailana as an AI mortgage assistant. This satisfies FCC 2024 guidance on AI disclosure in consumer communications. The disclosure fires on every session, including returning borrower sessions.

- **TRID four-of-six posture:** Q9-TRID-GATE fires if a borrower volunteers SSN or property address in the opening message. The volunteered item is not stored, repeated, or logged in session state. TRID posture is maintained — Ailana does not collect the six application items that would constitute a TRID application trigger.

- **Veteran acknowledgment — not a product recommendation:** Q9-MULTI Template A and B acknowledge veteran status as opening 'some excellent loan options including VA financing.' This is educational framing — it does not constitute a product recommendation or eligibility determination. The actual eligibility determination remains with the AUS and the licensed loan officer.

- **Track guard enforcement:** Once `transaction_type` is set, Layer 2 loads only the formulations for that track. Track-specific compliance rules (VA funding fee disclosure for TT-PUR, cash-out maximum formulations for TT-REF, right-of-rescission awareness for TT-HEL and TT-HEQ) are track-gated and cannot fire in the wrong track.

---

## 9. Dev Team Implementation Notes

### 9.1 Where Section 0 sits in the runtime prompt
Section 0 is not a Layer 1/2/3/4 component. It is document content that loads as part of Layer 2 before Stage 1 content. The correct prompt assembly order is:

- **Layer 1:** SAFE Act guardrails + graceful generation protocol (Layer B)
- **Layer 2:** [Intent map instruction] + [Semantic intent map] + [Section 0 routing] + [Stage content]
- **Layer 3:** Stall recovery formulations (SR-1 through SR-10) + conditional modules
- **Layer 4:** Session state (all fields including `transaction_type` and `signals_found`)

### 9.2 When transaction_type is set
`transaction_type` must not be set before Q9 is confirmed. The extraction layer sets `pre_stated_*` fields and `signals_found` — it does not set `transaction_type` directly. `transaction_type` is set by Section 0 only after the borrower confirms the routing question or Q9-MULTI acknowledgment.

```python
# CORRECT
session.signals_found = ['TT-PUR', 'veteran']  # extraction layer
# ... Q9-MULTI Template A delivered and borrower confirms ...
session.transaction_type = 'TT-PUR'            # set on confirmation
session.Q9_confirmed = True

# INCORRECT
session.transaction_type = 'TT-PUR'  # set before borrower confirms
```

### 9.3 Stage 1 gate
Stage 1 cannot begin until `Q9_confirmed` is true. If `Q9_confirmed` is false and the LLM attempts to fire a Stage 1 question, the pipeline must block it and return to the Section 0 routing flow.

### 9.4 Verification tests

| Test | Input | Expected | Fail condition |
| :--- | :--- | :--- | :--- |
| **S0-1 — Standard routing** | 'I have some mortgage questions' | Q9 fires. No track activates until borrower responds. `transaction_type` not set. | Track activates before Q9 is confirmed. |
| **S0-2 — Purchase extraction** | 'I want to buy a house' | Extraction captures TT-PUR. Q9-MULTI fires as confirmation. On borrower confirmation, TT-PUR set. | Standard Q9 fires instead of Q9-MULTI. |
| **S0-3 — TRID gate priority** | 'My SSN is 123-45-6789 and I want to buy a house' | Q9-TRID-GATE fires first. SSN not stored. Then Q9-MULTI or Q9 fires. | SSN stored in session state. Q9 fires before TRID gate. |
| **S0-4 — Equity disambiguation** | 'I want to tap into my equity' | Q9 fires. Borrower responds. Equity disambiguation fires. Routes to TT-HEL or TT-HEQ on choice. | Routes to wrong track. Disambiguation not delivered. |
| **S0-5 — Mixed intent** | 'I want to buy a house and also refinance my current one' | Mixed intent formulation fires. Borrower chooses. Chosen track activates. Secondary_intent stored. | Both tracks activate simultaneously. Mixed intent not acknowledged. |
| **S0-6 — Fallback routing** | Borrower gives unclear response to Q9 | Fallback routing question fires. Route on answer. | Stage 1 fires before `transaction_type` is confirmed. |
| **S0-7 — Construction holdout** | 'I want to build a house' | Ailana delivers holding response. Routes to licensed loan officer. TT-CON not activated. | TT-CON activates and Stage 1 fires — track not built. |

---

*ConvergentAI | Ailana v8.7 Section 0 — Transaction Type Routing Architecture | October 2026 | Internal Use Only*

<br>

---
---

# PART 2: Client Architecture Clarification & Direct Guidance
### Direct Communication from Client (David Patten) Regarding Section 0 Placement & Scope

> [!NOTE]
> This section preserves the client's direct communications, architecture guidance, and clarifications provided to the development team on October 10, 2026.

### 1. Architectural Role: The "Traffic Cop" at First Contact

David provided the following direct clarification on where Section 0 fits and whether it runs at every stage:

> **David (4:48 PM):**  
> *"Lets work on this together step by step. To start, this is what Section 0 is. I think when you understand this statement it may answer your question. If not, provide your response.*  
>  
> *1. What Section 0 Is*  
> *Section 0 sits between the SAFE Act guardrails and Stage 1 in the Ailana master prompting document. It is the **first thing that runs after the session opening greeting**. Its sole purpose is to **identify what the borrower wants to do and route them to the correct conversation track before Stage 1 begins**.*  
>  
> *Section 0 does not ask discovery questions. It does not collect financial information. It does not deliver compliance disclosures. It performs one function: determine the transaction type and set the session state flag that governs the rest of the conversation.*  
>  
> *Section 0 is not a resilience layer component and not a Layer 1-4 runtime layer. It is a document section — a pre-stage routing block that executes once per session, at first contact, before any track-specific content loads."*

> **David (4:57 PM):**  
> *"The Section 0 should not change the prompting that has been established. The main goal of Section 0 is to better understand the users intent and route them to the correct stage before any track-specific content loads.*  
> ***Its like a traffic cop.***"

---

### 2. What Section 0 Implementation Touches (Purely Additive Scope)

David addressed the question of existing prompting changes in response to the flow and gaps analysis:

> *"This document specifically addresses the the two images that you shared regarding flow and and gaps.*  
> *I want to address your statement regarding the change of existing prompting. **There is no change to existing prompting.** Please review the following:*  
>  
> **What Section 0 implementation touches:**  
> *Section 0 adds new code and new state fields. It does not modify, overwrite, or delete anything that currently exists in the project. Specifically:*  
> - *The `BorrowerProfile` interface gets new fields appended — the existing `transaction_type` and `mortgage_goal` fields stay exactly as they are. The new fields sit alongside them.*  
> - *`extractOpeningSignals()` is an upgrade to an existing function — the existing `mortgage_goal` extraction logic is preserved and the new signal types are added around it. The function signature doesn't change. Callers don't change.*  
> - *`buildLayer2()` gets a guard added at the top — an `if (!profile.Q9_confirmed)` check that routes to the new Section 0 block. The existing track-building code (purchase track, refinance track, etc.) is untouched. When `Q9_confirmed` is true, `buildLayer2()` behaves exactly as it does today.*  
> - *`stage0-routing.ts` is a new file — it doesn't replace any existing file.*  
> - *The existing Stage 1 through Stage 3 prompt content — every Q-number, every formulation, every compliance note in the master v8.7 document — is not modified. Section 0 gates access to Stage 1 but doesn't change anything inside it.*  
> - *The existing stall recovery formulations SR-1 through SR-5 are untouched. SR-6 through SR-10 are new additions.*"

---

### 3. The One Risk to Flag (Critical Default Verification)

> [!WARNING]
> **The One Risk to Flag:**  
> *"The only place a regression could occur is if the dev team implements the Stage 1 gate in T11 incorrectly — specifically if `Q9_confirmed` defaults to `true` instead of `false` during testing. If it defaults to `true`, the gate never fires, Section 0 never runs, and the system behaves as it does today — which looks correct in testing but means Section 0 was never actually wired in. The initialization in T2 (`Q9_confirmed: false`) is the critical default. The dev team should verify this in T15 test S0-1 before anything else.*  
>  
> ***Everything else is purely additive.***"

<br>

---
---

# PART 3: Section 0 — Dev Team Implementation Response
### Addresses all 13 gap items and 17 tasks identified by the dev team

*ConvergentAI | October 2026 | Dev Team Internal*  
*Document reference: `Ailana_Section0_DevResponse`*

---

## 0. Read This First

The dev team's gap analysis (Image 1) is accurate. The task list (Image 2) is correctly sequenced. This document provides the implementation detail needed to complete all 17 tasks.

The key concept to understand before writing any code: Section 0 is not a UI component and not a separate service. It is a block of prompt text that loads into the LLM's context at the start of every session, plus a set of pipeline rules that govern what happens before and after the LLM generates a response. The LLM reads Section 0 and uses it to decide what to say. The pipeline reads session state to decide what the LLM is allowed to do next.

**Mental model:** Section 0 is to transaction routing what a router component is to URL routing in a web app. It reads the incoming request (borrower's first message), determines the destination (transaction type), and activates the matching module (track). Nothing downstream fires until routing is confirmed.

### How the pieces connect

| Piece | What it is | Where it lives | When it runs |
| :--- | :--- | :--- | :--- |
| `BorrowerProfile` fields | Session state object — holds `transaction_type`, `signals_found`, `Q9_confirmed`, etc. | Pipeline — state management layer | Initialized at session start; updated throughout |
| `extractOpeningSignals()` | Pattern-match function — reads borrower's first message, returns signal dict | Pipeline — runs BEFORE LLM invocation | First borrower turn only |
| `stage0-routing.ts` prompt block | Text block injected into Layer 2 of the LLM prompt | Prompt assembly — `buildLayer2()` | Every turn until `Q9_confirmed = true` |
| Section 0 routing logic | Pipeline code that reads LLM output and updates session state | Pipeline — post-LLM handler | Every turn until `Q9_confirmed = true` |
| Stage 1 gate | Pipeline check — blocks Stage 1 content from loading | Prompt assembly — `buildLayer2()` | Every turn; gate releases when `Q9_confirmed = true` |

---

## Phase 1: Foundation (Tasks T1 + T2)

### T1 — Add Section 0 fields to BorrowerProfile `[CRITICAL]`

Add the following fields to the `BorrowerProfile` interface/type. These are in addition to the existing `transaction_type` and `mortgage_goal` fields already present.

```typescript
// Add to BorrowerProfile interface
interface BorrowerProfile {
  // Existing fields (keep as-is)
  transaction_type: 'TT-PUR' | 'TT-REF' | 'TT-HEL' | 'TT-HEQ' | 'TT-CON' | 'TT-HECM' | null;
  mortgage_goal: string | null;

  // NEW — Section 0 routing fields
  Q9_confirmed: boolean;               // true = routing complete, Stage 1 can fire
  Q9_MULTI_delivered: boolean;         // prevents Q9-MULTI re-firing
  secondary_intent: string | null;     // stores unchosen goal in mixed-intent case
  trid_gate_fired: boolean;            // true = Q9-TRID-GATE already delivered
  equity_disambig_delivered: boolean;  // true = HEQ vs HEL question delivered
  fallback_routing_delivered: boolean; // true = fallback question delivered
  holdout_routed: boolean;             // true = TT-CON/TT-HECM MLO handoff done

  // NEW — front-loading extraction fields
  signals_found: string[];             // e.g. ['TT-PUR', 'veteran', 'co_borrower']
  pre_stated_income: number | null;    // annual, from opening message
  pre_stated_savings: number | null;
  pre_stated_location: string | null;
  pre_stated_property_type: string | null;
  Q42_partial: boolean;
  context_current_rate: number | null; // refi only — MLO reference, never echoed
  trid_gate_required: boolean;
}
```

---

### T2 — Add Section 0 state to Context Manager `[CRITICAL]`

Initialize all new fields in the Context Manager when a new session starts. All fields default to their null/false/empty state.

```typescript
function initBorrowerProfile(): BorrowerProfile {
  return {
    // Existing
    transaction_type: null,
    mortgage_goal: null,

    // Section 0 routing
    Q9_confirmed: false,
    Q9_MULTI_delivered: false,
    secondary_intent: null,
    trid_gate_fired: false,
    equity_disambig_delivered: false,
    fallback_routing_delivered: false,
    holdout_routed: false,

    // Front-loading extraction
    signals_found: [],
    pre_stated_income: null,
    pre_stated_savings: null,
    pre_stated_location: null,
    pre_stated_property_type: null,
    Q42_partial: false,
    context_current_rate: null,
    trid_gate_required: false,
  };
}
```

---

## Phase 2: Extraction & Compliance (Tasks T3 + T4)

### T3 — Upgrade extractOpeningSignals() to full multi-signal system `[CRITICAL]`

The existing function captures `mortgage_goal` (transaction type). It needs to be extended to capture all seven additional signal types simultaneously and populate the `signals_found` array. This function runs **BEFORE** the LLM is invoked — it is a fast pattern match, not an LLM call.

> [!IMPORTANT]
> This function must complete in under 10ms. Do not make any API calls inside it. Do not call the LLM inside it. Pure string pattern matching only.

```typescript
function extractOpeningSignals(input: string, profile: BorrowerProfile): void {
  const text = input.toLowerCase();
  const signals: string[] = [];

  // TRID GATE — check first, before anything else
  const ssnPattern = /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/;
  const addrPattern = /\b\d+\s+[a-z]+\s+(st|ave|rd|blvd|dr|ln|way|ct)\b/i;
  if (ssnPattern.test(input) || addrPattern.test(input)) {
    profile.trid_gate_required = true;
    // Do NOT extract or store the volunteered item
    // Still continue extraction for other signals
  }

  // TRANSACTION TYPE
  if (/buy|purchase|first home|new home|find a home/.test(text)) {
    profile.transaction_type = null; // not set yet — confirmed on Q9
    signals.push('TT-PUR');
  } else if (/refinanc|refi|lower my rate|lower my payment|cash.?out/.test(text)) {
    signals.push('TT-REF');
  } else if (/heloc|equity line|home equity line|line of credit/.test(text)) {
    signals.push('TT-HEL');
  } else if (/home equity loan|lump sum|equity loan/.test(text)) {
    signals.push('TT-HEQ');
  } else if (/build|construction|construct/.test(text)) {
    signals.push('TT-CON'); // holdout — will route to MLO
  } else if (/reverse mortgage|hecm/.test(text)) {
    signals.push('TT-HECM'); // holdout — will route to MLO
  }

  // VETERAN / MILITARY
  if (/veteran|military|army|navy|marines|air force|coast guard|active duty|served|service member/.test(text)) {
    profile.veteran_flagged = true;
    profile.Q43_answered = true;
    signals.push('veteran');
  }

  // CO-BORROWER
  if (/my wife|my husband|my spouse|my partner|we are|we're|together|both of us|the two of us/.test(text)) {
    profile.co_borrower = true;
    profile.Q13_answered = true;
    signals.push('co_borrower');
  }

  // INCOME — e.g. 'I make $90K a year', '110 thousand annually'
  const incomeMatch = input.match(
    /\$?([\d,]+)\s*k?\s*(a year|annually|per year|income|salary)/i
  );
  if (incomeMatch) {
    const raw = incomeMatch[1].replace(/,/g, '');
    const hasK = text.slice(
      incomeMatch.index!, incomeMatch.index! + incomeMatch[0].length + 2
    ).includes('k');
    profile.pre_stated_income = parseInt(raw) * (hasK ? 1000 : 1);
    profile.Q35_answered = true;
    signals.push('income');
  }

  // SAVINGS / DOWN PAYMENT
  const savingsMatch = input.match(
    /\$?([\d,]+)\s*k?\s*(saved|in savings|for.*down|available)/i
  );
  if (savingsMatch) {
    const raw = savingsMatch[1].replace(/,/g, '');
    const hasK = text.slice(
      savingsMatch.index!, savingsMatch.index! + savingsMatch[0].length + 2
    ).includes('k');
    profile.pre_stated_savings = parseInt(raw) * (hasK ? 1000 : 1);
    profile.Q38_answered = true;
    signals.push('savings');
  }

  // PROPERTY TYPE
  const ptypes = ['condo','townhome','townhouse','single-family',
                  'multi-family','duplex','triplex'];
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

  // VOLUNTEERED RATE — refi context only, never echoed back
  const rateMatch = text.match(/(\d+\.?\d*)\s*%/);
  if (rateMatch && signals.includes('TT-REF')) {
    profile.context_current_rate = parseFloat(rateMatch[1]);
    // NOT added to signals_found — LLM must never reference this
  }

  profile.signals_found = signals;
}
```

---

### T4 — Add TRID Gate check before Q9 fires `[CRITICAL]`

The TRID gate must be the first thing that fires when the LLM is about to respond to the borrower's first message. If `trid_gate_required` is true, the pipeline injects the `Q9-TRID-GATE` formulation into the prompt context before any other routing logic executes.

```typescript
// In the first-turn handler, BEFORE building the LLM prompt:
if (profile.trid_gate_required && !profile.trid_gate_fired) {
  profile.trid_gate_fired = true;
  // Inject Q9-TRID-GATE as a forced system response
  // Then continue to Q9-MULTI or Q9 routing below
  injectForcedResponse(Q9_TRID_GATE_FORMULATION);
}
```

The `Q9-TRID-GATE` formulation text (from `stage0-routing.ts` — see T12):

```typescript
const Q9_TRID_GATE_FORMULATION = `I want to make sure we handle your
information correctly — for security and compliance purposes, I'm not
able to collect that specific information through this channel at this
point in our conversation. We'll have a secure way to gather it when
we get to that step. For now, let's focus on getting your overall
picture together. [Continue with Q9 or Q9-MULTI as appropriate.]`;
```

---

## Phase 3: Routing Logic & Flows (Tasks T5 to T10)

### T5 — Implement Q9-MULTI template selection and injection `[CRITICAL]`

`Q9-MULTI` fires when `signals_found.length >= 2` after extraction. The pipeline selects the correct template based on the signals present and injects it as a forced response — the LLM does not generate this. The LLM fills the bracketed fields from the profile.

```typescript
function selectQ9MultiTemplate(signals: string[]): string {
  const s = new Set(signals);

  // Template F — full front-load (veteran + co-borrower + financials)
  if (s.has('TT-PUR') && s.has('veteran') && s.has('co_borrower') &&
     (s.has('income') || s.has('savings'))) {
    return 'TEMPLATE_F';
  }
  // Template B — purchase + veteran + co-borrower
  if (s.has('TT-PUR') && s.has('veteran') && s.has('co_borrower')) {
    return 'TEMPLATE_B';
  }
  // Template A — purchase + veteran
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

`Q9-MULTI` is a scripted formulation — the LLM fills the `[bracketed]` fields using profile values, but the template structure is fixed. Instruct the LLM in the prompt:  
> *"Fill in [name], [income], [savings], [location] from the session state. Do not add information that was not explicitly stated by the borrower. Move directly to the first uncaptured question after filling the template."*

---

### T6 — Implement Q9 standard open routing `[HIGH]`

Fires when `signals_found` is empty (no transaction type extracted). The LLM delivers the Q9 formulation and waits for the borrower's response. The pipeline then reads the LLM's interpretation of the response and updates `transaction_type`. Do not set `transaction_type` until the borrower confirms.

```typescript
// In stage0-routing.ts prompt block:
// 'Ask the borrower: "To make sure I take you in the right direction
//  — are you looking to purchase a home, refinance an existing mortgage,
//  or access the equity you've already built in your home?"
//  After their response, output ONLY one of:
//  ROUTE: TT-PUR | ROUTE: TT-REF | ROUTE: TT-HEL-AMBIG | ROUTE: UNCLEAR'

// Pipeline reads LLM output:
if (llmOutput.includes('ROUTE: TT-PUR')) {
  profile.transaction_type = 'TT-PUR';
  profile.Q9_confirmed = true;
} else if (llmOutput.includes('ROUTE: TT-REF')) {
  profile.transaction_type = 'TT-REF';
  profile.Q9_confirmed = true;
} else if (llmOutput.includes('ROUTE: TT-HEL-AMBIG')) {
  // Fire equity disambiguation next turn — do not confirm yet
} else {
  // Fire fallback routing next turn
}
```

---

### T7 — Implement equity disambiguation flow `[HIGH]`

Fires when borrower indicates equity access intent without specifying HELOC vs home equity loan. The LLM delivers the equity disambiguation formulation. On the borrower's response, the pipeline sets `TT-HEL` or `TT-HEQ` and confirms routing.

```typescript
// Trigger condition:
if (!profile.equity_disambig_delivered &&
    llmOutput.includes('ROUTE: TT-HEL-AMBIG')) {
  profile.equity_disambig_delivered = true;
  // Inject equity disambiguation formulation
  // On next turn, LLM outputs: ROUTE: TT-HEL or ROUTE: TT-HEQ or ROUTE: UNSURE
}

// If ROUTE: UNSURE — inject HQ18 educational comparison
// Then re-ask and route on answer
```

---

### T8 — Implement fallback routing question `[HIGH]`

Fires when transaction type is still unclear after Q9 and equity disambiguation (if applicable). This is the last routing attempt before stall recovery.

```typescript
// Trigger condition:
if (!profile.Q9_confirmed &&
    !profile.fallback_routing_delivered &&
    (profile.equity_disambig_delivered || turns_since_Q9 > 1)) {
  profile.fallback_routing_delivered = true;
  // Inject: 'Are you looking to purchase a new home, refinance an
  // existing mortgage, or access the equity you've already built?'
}

// If still unclear after fallback: inject SR-1 stall recovery
// Do NOT advance to Stage 1 until Q9_confirmed = true
```

---

### T9 — Implement mixed intent handling `[HIGH]`

Fires when the LLM detects two distinct transaction type intents in the borrower's message. The pipeline stores the secondary intent and routes to the chosen track.

```typescript
// LLM outputs: ROUTE: MIXED | PRIMARY: TT-PUR | SECONDARY: TT-REF
if (llmOutput.includes('ROUTE: MIXED')) {
  const primary = extractRouteTag(llmOutput, 'PRIMARY');
  const secondary = extractRouteTag(llmOutput, 'SECONDARY');
  profile.secondary_intent = secondary;
  // Deliver mixed-intent acknowledgment formulation
  // On borrower choice, set transaction_type and Q9_confirmed = true
}
```

---

### T10 — Implement TT-CON and TT-HECM holdout responses `[HIGH]`

When `signals_found` contains `TT-CON` or `TT-HECM`, Ailana delivers a holding response and routes to the licensed loan officer. These tracks are not built. The pipeline must prevent any track activation.

```typescript
const HOLDOUT_SIGNALS = ['TT-CON', 'TT-HECM'];

if (profile.signals_found.some(s => HOLDOUT_SIGNALS.includes(s)) &&
    !profile.holdout_routed) {
  profile.holdout_routed = true;
  // Do NOT set transaction_type
  // Do NOT set Q9_confirmed
  // Inject holdout formulation and trigger MLO routing
}
```

Holdout formulations (inject as forced responses):

- **TT-CON:**  
  > "Construction loans involve some specific requirements that I want to make sure we handle correctly with a licensed loan officer. Let me connect you with one of our specialists who can walk you through the construction financing process in detail. Can I get your best contact information?"

- **TT-HECM:**  
  > "Reverse mortgages have some unique features that are best explained by a licensed loan officer. Let me connect you with a specialist who works with these programs every day. Can I get your best contact information?"

---

## Phase 4: Stage Gate & Prompt Assembly (Tasks T11 to T14)

### T11 — Implement Q9_confirmed gate before Stage 1 `[CRITICAL]`

Stage 1 questions (Q1–Q13) must not fire until `Q9_confirmed` is true. This gate is enforced in `buildLayer2()` — if `Q9_confirmed` is false, Stage 1 content is not included in the prompt. Section 0 content loads instead.

```typescript
function buildLayer2(profile: BorrowerProfile): string {
  if (!profile.Q9_confirmed) {
    // Load Section 0 routing block only
    return buildSection0Block(profile);
  }

  // Q9 confirmed — load the appropriate track
  switch (profile.transaction_type) {
    case 'TT-PUR': return buildPurchaseTrack(profile);
    case 'TT-REF': return buildRefinanceTrack(profile);
    case 'TT-HEL': return buildHELOCTrack(profile);
    case 'TT-HEQ': return buildHEQTrack(profile);
    default: return buildSection0Block(profile); // safety fallback
  }
}
```

Stage 1 content must not leak into the prompt while `Q9_confirmed` is false. If the LLM can see Stage 1 questions before routing is complete, it may fire them prematurely. The gate is the pipeline's responsibility — do not rely on the LLM to self-enforce this.

---

### T12 — Create stage0-routing.ts prompt file `[HIGH]`

Create a new file: `stage0-routing.ts`. This file contains the Section 0 prompt block as a TypeScript string export. It is the text the LLM reads to understand what to do during routing. It does not contain pipeline logic — that lives in the handler files.

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
1. If the session state shows signals_found with 2+ signals,
   deliver the Q9-MULTI template selected by the pipeline.
   Do not re-ask for information already in signals_found.
2. If signals_found has exactly 1 transaction type signal,
   confirm it: 'It sounds like you're looking to [X] — is that right?'
3. If signals_found is empty, ask Q9.
4. If the borrower mentions TT-CON or TT-HECM, output ROUTE: HOLDOUT-[TYPE].
5. NEVER output a Stage 1 question (Q1-Q13) until the pipeline
   confirms Q9_confirmed = true in session state.
6. NEVER set transaction_type yourself — output the ROUTE signal
   and let the pipeline set it after borrower confirmation.
`;
```

---

### T13 — Wire stage0-routing.ts into buildLayer2() `[HIGH]`

Import `SECTION_0_PROMPT` into `buildLayer2()` and inject it when `Q9_confirmed` is false. See T11 for the gate structure — the prompt block is what goes inside `buildSection0Block()`.

```typescript
import { SECTION_0_PROMPT } from './stage0-routing';

function buildSection0Block(profile: BorrowerProfile): string {
  let block = SECTION_0_PROMPT;

  // Append current routing state so LLM knows where it is
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

### T14 — Add Section 0 block to Layer 3 context `[MEDIUM]`

Layer 3 loads stall recovery formulations (SR-1 through SR-10). Add a note to the Layer 3 prompt that SR-1 is available during Section 0 routing if the borrower's intent remains unclear after the fallback routing question. No new formulations needed — SR-1 already covers this.

```typescript
// In buildLayer3():
// Add to the stall recovery block header:
// 'SR-1 (clarifying question) is available during Section 0 routing
// when transaction type cannot be determined after the fallback
// routing question. Output ROUTE: UNCLEAR to trigger SR-1.'
```

---

## Phase 5: Test Suite & Verification (Tasks T15 + T16 + T17)

### T15 — Create section0-routing.test.ts with 15 tests `[HIGH]`

Create a new test file with the following test cases. Tests S0-1 through S0-7 are from the Section 0 spec. Tests S0-8 through S0-15 are additional cases identified from the gap analysis.

| Test ID | Borrower input | Expected pipeline output | Key assertion |
| :--- | :--- | :--- | :--- |
| **S0-1** | `'I have some mortgage questions'` | Q9 fires. `signals_found = []`. `Q9_confirmed = false`. | Stage 1 does not fire. |
| **S0-2** | `'I want to buy a house'` | `extractOpeningSignals` sets `signals_found = ['TT-PUR']`. Q9-MULTI fires as purchase confirmation. | `transaction_type` not set until borrower confirms. |
| **S0-3** | `'My SSN is 123-45-6789 and I want to buy a house'` | `trid_gate_required = true`. Q9-TRID-GATE fires FIRST. SSN not stored anywhere in profile. | Profile contains no SSN value. |
| **S0-4** | `'I want to tap into my equity'` | Q9 fires. Borrower responds. Equity disambiguation fires. Routes to `TT-HEL` or `TT-HEQ`. | `equity_disambig_delivered = true` before routing confirmed. |
| **S0-5** | `'I want to buy a house and also refinance my current one'` | Mixed intent formulation fires. `secondary_intent = 'TT-REF'`. On borrower choice, `Q9_confirmed = true`. | Both tracks do not activate simultaneously. |
| **S0-6** | Ambiguous response to Q9 | Fallback routing question fires. `fallback_routing_delivered = true`. | Stage 1 does not fire before fallback. |
| **S0-7** | `'I want to build a house'` | `signals_found = ['TT-CON']`. Holdout formulation fires. MLO routing triggered. | `transaction_type` remains null. `Q9_confirmed` remains false. |
| **S0-8** | `'I want to buy a home and I am a veteran'` | `signals_found = ['TT-PUR', 'veteran']`. Q9-MULTI Template A selected. | `Q43_answered = true`. Q43 not asked again in Stage 2. |
| **S0-9** | `'My wife and I make $110K and want to buy our first home'` | `signals_found = ['TT-PUR', 'co_borrower', 'income']`. Q9-MULTI Template D (or F if savings too). | `Q13_answered = true`. `Q35_answered = true`. |
| **S0-10** | `'I want to refinance my condo in Orlando'` | `signals_found = ['TT-REF', 'property_type', 'location']`. Q9-MULTI Template E. | `pre_stated_location = 'Orlando'`. `Q42_partial = true`. |
| **S0-11** | Borrower confirms purchase on Q9-MULTI | `transaction_type = 'TT-PUR'`. `Q9_confirmed = true`. `buildLayer2()` returns purchase track. | Stage 1 fires immediately after confirmation. |
| **S0-12** | Borrower says `'HELOC'` to equity disambiguation | `transaction_type = 'TT-HEL'`. `Q9_confirmed = true`. | `TT-HEQ` not activated. |
| **S0-13** | `'I want a reverse mortgage'` | `signals_found = ['TT-HECM']`. Holdout formulation fires. | `transaction_type` remains null. |
| **S0-14** | `'I currently pay 7.5% and want to refinance'` | `signals_found = ['TT-REF']`. `context_current_rate = 7.5`. Rate NOT in `signals_found`. | LLM prompt does not contain the rate figure. |
| **S0-15** | After Q9-MULTI, Stage 2 runs — veteran not re-asked | Profile has `Q43_answered = true` from extraction. | Q43 does not appear in Stage 2 question sequence. |

---

### T16 — Register section0-routing.test.ts in run-all-tests.ts `[MEDIUM]`

Add the new test file to the test runner so it executes as part of every build verification. The Section 0 tests must pass before any build is considered ready for staging or production deployment.

---

### T17 — Local E2E testing — 9 live scenarios `[HIGH]`

Run nine live conversation scenarios against the full Ailana system (not unit tests — actual LLM calls with the full prompt stack). These test the integration of extraction + prompt + pipeline together, which unit tests cannot fully cover.

| Scenario | Opening message | Verify |
| :--- | :--- | :--- |
| **E2E-1** | `'I want to buy a home'` | Q9-MULTI confirmation. Track activates on borrower yes. |
| **E2E-2** | `'I want to buy a home and I am a veteran'` | Template A. Q43 not re-asked in Stage 2. |
| **E2E-3** | `'My wife and I make $110K, we're veterans, $40K saved, want to buy in Florida'` | Template F. Q13, Q35, Q38, Q43 all skipped in Stage 2. |
| **E2E-4** | `'I have some mortgage questions'` | Q9 open routing. No track until borrower responds. |
| **E2E-5** | `'I want to access my home equity'` | Equity disambiguation. Routes correctly to HEL or HEQ. |
| **E2E-6** | `'My SSN is 123-45-6789 and I want to buy a house'` | TRID gate fires first. Q9-MULTI fires after. SSN not in any response. |
| **E2E-7** | `'I want to build a house'` | Holdout formulation. MLO routing. No Stage 1. |
| **E2E-8** | `'I want to buy a house and refinance my current one'` | Mixed intent acknowledgment. `secondary_intent` stored. One track activates. |
| **E2E-9** | `'I want a reverse mortgage'` | HECM holdout. MLO routing. No Stage 1. |

---

## Implementation Order & Dependency Groups

Complete tasks in this sequence. Each group depends on the previous group being complete.

| Group | Tasks | Description | Blocker for |
| :--- | :--- | :--- | :--- |
| **Group 1 — Foundation** | T1, T2 | `BorrowerProfile` fields + Context Manager init | Everything else |
| **Group 2 — Extraction** | T3, T4 | `extractOpeningSignals()` upgrade + TRID gate | T5, T6–T9, T12 |
| **Group 3 — Routing Logic** | T5, T6, T7, T8, T9, T10 | Q9-MULTI + all routing flows + holdouts | T11, T12 |
| **Group 4 — Gate and Prompt** | T11, T12, T13, T14 | Stage 1 gate + prompt file + layer wiring | T15, T17 |
| **Group 5 — Tests** | T15, T16, T17 | Unit tests + E2E scenarios | Deployment |

> [!CAUTION]
> Do not skip Group 1. Every other task depends on the `BorrowerProfile` fields being present. Attempting to implement T3 (extraction) before T1 (schema) will cause runtime errors.

When all 17 tasks are complete and all 15 unit tests plus 9 E2E scenarios pass, Section 0 is fully implemented. The David Patten acceptance test (3+ realistic live conversations across different transaction types) is the final gate before staging deployment.

---

*ConvergentAI | Section 0 Dev Team Implementation Response | October 2026 | Dev Team Internal*
