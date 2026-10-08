# CONVERGENTAI
## Ailana Master v8.7
### Section 0 — Transaction Type Routing Architecture
**Specification, formulations, decision logic, and dev implementation**

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
