# Affordability Panel — Step-by-Step Implementation Plan

Based on `Affordability_Panel.md` (v8.4 Master Prompt Spec) and `Affordability_Panel_Mobile.md` (v1.1 Build Spec).

Each step is structured as **Problem → Solution → Result** and maps to a concrete, testable unit of work.

---

## Stage 1: Backend Foundation — Rate Config, Profile Fields & Stage 2.5 State Machine

This stage wires up everything the backend needs before any UI renders — the representative rate config, the new `Stage 2.5` state in the session manager, and the `BorrowerProfile` fields the panel depends on.

---

### ✅ [DONE] Step 1.1 — Add Representative Rate to Config

**Problem:**
The affordability panel's PITIA calculation requires a single, centrally managed representative rate (e.g., `6.875%` for a 30-year fixed conventional loan). This rate is not in the codebase yet. There is no config entry, no env var, and no way for the calculation engine to know which rate to use. Without it, all payment estimates will be wrong or impossible to compute.

**Solution:**
In `backend/src/config/ailana-config.ts`, add the following to the exported config object:
```typescript
representativeRate: parseFloat(process.env.REPRESENTATIVE_RATE ?? '0.06875'),  // 6.875% default
representativeRateType: process.env.REPRESENTATIVE_RATE_TYPE ?? '30-year fixed conventional',
incomeBandThreshold: parseFloat(process.env.INCOME_BAND_THRESHOLD ?? '0.28'),   // 28% front-end DTI
dtiBandThreshold: parseFloat(process.env.DTI_BAND_THRESHOLD ?? '0.45'),         // 45% back-end DTI
dtiHardCeiling: parseFloat(process.env.DTI_HARD_CEILING ?? '0.50'),             // 50% FHLMC hard ceiling
propertyTaxRate: parseFloat(process.env.PROPERTY_TAX_RATE ?? '0.012'),          // 1.2% national avg
homeownersInsRate: parseFloat(process.env.HOMEOWNERS_INS_RATE ?? '0.005'),      // 0.5% national avg
conventionalPmiRate: parseFloat(process.env.CONVENTIONAL_PMI_RATE ?? '0.0085'),  // 0.85% national avg
fhaMipRate: parseFloat(process.env.FHA_MIP_RATE ?? '0.0055'),                   // 0.55% annual
usdaAnnualFeeRate: parseFloat(process.env.USDA_ANNUAL_FEE_RATE ?? '0.0035'),    // 0.35% annual
```
Also add corresponding env var entries (with current values) to `.env.local`.

**Result:**
All affordability panel calculations source from a single config object. Updating the representative rate is a one-line env var change followed by a redeploy — no code changes needed. The config is immediately available everywhere via `import { ailanaConfig } from '../config/ailana-config.js'`.

---

### ✅ [DONE] Step 1.2 — Add Stage 2.5 Profile Fields to `BorrowerProfile`

**Problem:**
The `BorrowerProfile` interface in `layer3-context.ts` has no fields tracking Stage 2.5 state. When the panel renders, the system needs to know: Has the panel been shown? What did the borrower last set the sliders to? What was the resulting income/DTI band status? Has the borrower submitted for AUS review? What did AUS return? None of these are tracked anywhere in the profile today.

**Solution:**
Add a new `// ── Stage 2.5 ──` section to `BorrowerProfile` in `backend/src/prompts/layer3-context.ts`:
```typescript
// ── Stage 2.5 (Affordability Panel) ──────────────────────────────────────
affordability_panel_rendered?: boolean;         // True once the panel has been displayed
affordability_purchase_price?: number | null;   // Slider value at last interaction
affordability_down_payment?: number | null;     // Slider value at last interaction
affordability_income_band?: 'within' | 'above' | null;  // Last computed income band status
affordability_dti_band?: 'within' | 'above' | null;     // Last computed DTI band status
affordability_submitted?: boolean;              // True after borrower clicks Submit for Review
affordability_aus_status?: 'pending' | 'approve_eligible' | 'refer' | null;
affordability_prequel_letter_sent?: boolean;    // True after FD1 pre-qual letter emailed

// ── Delivered Flags / Short Variants (Spec Section 8 / Redundancy) ───────────
eligibility_review_explained?: boolean;         // Tracks if eligibility review has been explained
credit_impact_stated?: boolean;                 // Tracks if credit impact has been explained
pmi_explained?: boolean;                        // Tracks if PMI has been explained
transition_pitch_delivered?: boolean;           // Tracks if transition pitch was delivered
dti_above_hard_ceiling?: boolean;               // Tracks if current DTI exceeds 50% hard ceiling
```
Also add field labels to `FIELD_LABELS`:
```typescript
affordability_purchase_price: 'target purchase price (affordability panel)',
affordability_down_payment: 'down payment (affordability panel)',
affordability_aus_status: 'AUS eligibility review result',
```

**Result:**
The session state machine can track every key affordability panel event. The LLM gets accurate `Stage 2.5` context on every turn, and Ailana can narrate correctly (e.g., knowing the last slider state when the borrower asks a follow-up question).

---

### ✅ [DONE] Step 1.3 — Add Stage 2.5 to the State Machine in `session-context-manager.ts`

**Problem:**
The current state machine in `session-context-manager.ts` has stages `'1' → '2' → '3' → '3A' → '3B' → '4' → '5'`. There is no `'2.5'` stage. When all Stage 2 fields are collected and the borrower accepts the eligibility review, the system jumps to `'3A'` (legal name + address + soft pull consent). Per the spec, the affordability panel (Stage 2.5) requires pre-populated credit and liability data which is only available *after* the soft pull is accepted and executed. Therefore, Stage 2.5 must be sequenced *after* Stage 3A's soft pull runs, but *before* Stage 3B (1003 manual completion). We must also collect contact capture (Q45) at the consent transition.

**Solution:**
In `session-context-manager.ts`:

1. Update the transition from `stage2_closing_offer` or `stage3_closing_offer` to transition to Stage `'3A'` and start with Q45 contact capture (`email` and `mobile` fields) before asking for name/address:
   ```typescript
   // Inside applyStage2ExtractionResults() under stage2_closing_offer:
   if (offerVal === 'yes') {
     this.activeStage = '3A';
     this.currentPendingField = 'email'; // Q45 contact capture starts first
     this.profile.transition_pitch_delivered = true;
     console.log('[context-manager]: Transitioning to STAGE 3A (Q45 Contact Capture)!');
   }
   ```
   Add extraction handlers in `runStage3AExtraction()` for `email` and `mobile` fields. If the borrower declines to provide contact information, set them as `null` but proceed with the flow (verbal-only findings).

2. Modify Stage `'3A'` completion logic. Once `soft_pull_consent === 'accepted'` and the credit review returns data:
   - Transition to `activeStage = '2.5'`.
   - Set `currentPendingField = 'affordability_panel_active'`.
   - Set `profile.affordability_panel_rendered = true`.
   - Seed defaults:
     ```typescript
     this.profile.affordability_purchase_price = this.profile.target_price ?? null;
     this.profile.affordability_down_payment = this.profile.down_payment ?? null;
     ```

3. Add a new private method `runStage25Extraction(text: string)`:
   ```typescript
   private async runStage25Extraction(text: string): Promise<void> {
     const field = this.currentPendingField;
     const lastQuestion = this.getLastAssistantUtterance();

     if (field === 'affordability_panel_active') {
       // Borrower exploring panel — listen for submit intent or questions
       const res = await extractProfileField(text, lastQuestion, 'affordability_action',
         'Extract "submit" if borrower says submit, continue, proceed, let\'s do it. ' +
         'Extract "update_profile" if borrower wants to correct income, timeline, or other details. ' +
         'Extract "delete_data" if borrower asks to delete their information. ' +
         'Extract "question" if borrower is asking a question about the panel. ' +
         'Extract "drop_off" if borrower wants to stop or come back later. null otherwise.');

       if (res.value === 'submit') {
         this.profile.affordability_submitted = true;
         this.profile.affordability_aus_status = 'pending';
         this.currentPendingField = 'affordability_aus_pending';
         // Trigger AUS submission (Step 3.1)
       } else if (res.value === 'update_profile') {
         this.currentPendingField = 'affordability_profile_correction';
       } else if (res.value === 'delete_data') {
         this.currentPendingField = 'affordability_data_deletion';
       } else if (res.value === 'drop_off') {
         this.currentPendingField = 'affordability_drop_off';
       }
       return;
     }

     if (field === 'affordability_profile_correction') {
       // Extract corrected details, update profile, return to panel_active
       const res = await extractProfileField(text, lastQuestion, 'corrected_details', 'any corrected profile information', 'string');
       if (res.value) {
         // Process and update profile fields accordingly
         this.currentPendingField = 'affordability_panel_active';
       }
       return;
     }

     if (field === 'affordability_data_deletion') {
       // Borrower requests data deletion
       const decision = await classifyConfirmation(text, lastQuestion, 'confirm_deletion', 'Would you like me to start that process for you now?');
       if (decision === 'yes') {
         this.currentPendingField = null;
         this.activeStage = '5'; // Flag session for deletion, stop flow
       } else {
         this.currentPendingField = 'affordability_panel_active';
       }
       return;
     }

     if (field === 'affordability_drop_off') {
       // Borrower declines — session save, offer summary via email/SMS
       const decision = await classifyConfirmation(text, lastQuestion, 'send_summary', 'Would that be helpful?');
       if (decision === 'yes') {
         this.currentPendingField = 'affordability_drop_off_delivery_method';
       } else {
         this.currentPendingField = null;
         this.activeStage = '5';
       }
       return;
     }

     if (field === 'affordability_drop_off_delivery_method') {
       // Extract delivery method preference
       const res = await extractProfileField(text, lastQuestion, 'delivery_method', 'email or mobile', 'string');
       // Trigger summary via chosen method (Step 6.2)
       this.currentPendingField = null;
       this.activeStage = '5'; // Escalation / Goodbye
       return;
     }

     if (field === 'fd1_delivery_acknowledged' || field === 'fd2_delivery_acknowledged') {
       // After findings are delivered, borrower decides to proceed to formal application (1003)
       const decision = await classifyConfirmation(text, lastQuestion, 'proceed_to_1003', 'Would you like to proceed with completing your formal application?');
       if (decision === 'yes') {
         // Return to Stage 3A prefill walkthrough to verify assets, employer, etc.
         this.activeStage = '3A';
         this.currentPendingField = 'prefill_name_address';
       } else {
         this.activeStage = '5'; // MLO Handoff / Escalation
         this.currentPendingField = null;
       }
       return;
     }
   }
   ```

4. In `extractAndApply()` (around line 300), add the branch:
   ```typescript
   } else if (this.activeStage === '2.5') {
     await this.runStage25Extraction(trimmed);
   }
   ```

**Result:**
The state machine properly sequences Stage 2.5. After the borrower authorizes the soft credit pull, the system runs the pull, transitions to Stage 2.5, displays the panel, and allows interactive scenario exploration. After findings delivery, the borrower can choose to hand off to an MLO or continue to the prefilled walkthrough and Stage 3B (1003 manual completion).

---

## Stage 2: Backend Calculation Engine & AUS Submission Service

This stage builds the server-side math and the AUS submission payload — the core logic the UI will call.

---

### ✅ [DONE] Step 2.1 — Build the Affordability Calculation Utility

**Problem:**
There is no server-side function that can compute PITIA + status bands given a purchase price, down payment, income, debts, and program type. The panel needs this calculation on every slider change (in `VOICE_MODE`) and on AUS submission (in both modes). Without it, neither the UI's real-time updates nor the server-side voice-only path can produce any numbers.

**Solution:**
Create a new file `backend/src/utils/affordability-calculator.ts`:
```typescript
import { ailanaConfig } from '../config/ailana-config.js';

export interface AffordabilityInput {
  purchasePrice: number;
  downPayment: number;
  grossAnnualIncome: number;
  totalMonthlyDebt: number;       // From soft pull tradeline minimums
  programType: 'conventional' | 'fha' | 'va' | 'usda';
}

export interface AffordabilityResult {
  loanAmount: number;
  ltv: number;
  monthlyPI: number;              // Principal & Interest
  monthlyTax: number;             // Property tax estimate
  monthlyInsurance: number;       // Homeowners insurance estimate
  monthlyMI: number;              // Mortgage insurance
  totalPITIA: number;             // Full monthly payment
  incomeBand: 'within' | 'above';
  dtiBand: 'within' | 'above';
  dtiAboveHardCeiling: boolean;   // True if back-end DTI > 50% (FHLMC hard ceiling)
  dti: number;                    // For internal use / audit log — NOT displayed to borrower
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const { purchasePrice, downPayment, grossAnnualIncome,
          totalMonthlyDebt, programType } = input;
  const cfg = ailanaConfig;

  // Core loan metrics
  const loanAmount = purchasePrice - downPayment;
  const ltv = loanAmount / purchasePrice;
  const monthlyIncome = grossAnnualIncome / 12;

  // P&I using standard amortization: M = P[r(1+r)^n]/[(1+r)^n-1]
  const monthlyRate = cfg.representativeRate / 12;
  const n = 360; // 30 years
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))
                    / (Math.pow(1 + monthlyRate, n) - 1);

  // Tax & Insurance (national average defaults)
  const monthlyTax = (purchasePrice * cfg.propertyTaxRate) / 12;
  const monthlyInsurance = (purchasePrice * cfg.homeownersInsRate) / 12;

  // Program-aware MI
  let monthlyMI = 0;
  if (programType === 'conventional') {
    monthlyMI = ltv > 0.80 ? (loanAmount * cfg.conventionalPmiRate) / 12 : 0;
  } else if (programType === 'fha') {
    monthlyMI = (loanAmount * cfg.fhaMipRate) / 12;
  } else if (programType === 'va') {
    monthlyMI = 0; // One-time funding fee at closing — not monthly
  } else if (programType === 'usda') {
    monthlyMI = (loanAmount * cfg.usdaAnnualFeeRate) / 12;
  }

  const totalPITIA = monthlyPI + monthlyTax + monthlyInsurance + monthlyMI;
  const dti = (totalMonthlyDebt + totalPITIA) / monthlyIncome;

  return {
    loanAmount,
    ltv,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    monthlyMI,
    totalPITIA,
    incomeBand: totalPITIA / monthlyIncome <= cfg.incomeBandThreshold ? 'within' : 'above',
    dtiBand: dti <= cfg.dtiBandThreshold ? 'within' : 'above',
    dtiAboveHardCeiling: dti > cfg.dtiHardCeiling,
    dti,
  };
}
```

**Result:**
Any part of the system (REST API endpoint, WebSocket handler, voice-mode narration path) can import `calculateAffordability()` and get a complete, spec-compliant PITIA breakdown and band statuses in one call. The function is pure and testable with no side effects.

---

### ✅ [DONE] Step 2.2 — Build the AUS Submission Payload Builder & Mock Endpoint

**Problem:**
When the borrower clicks "Submit for review," the system needs to package all collected profile data into a MISMO 3.4 format payload and send it to the AUS (Fannie Mae DU / Freddie Mac LPA via Encompass Developer Connect API). There is no payload builder, no AUS client, and no endpoint for this today. The spec defines exactly which fields go in the payload (Section 3.2 of `Affordability_Panel_Mobile.md`).

**Solution:**
Create `backend/src/utils/aus-submission.ts` with:
1. A `buildAusPayload(profile, sliderValues)` function that assembles all required MISMO 3.4 fields from the `BorrowerProfile` plus the current slider positions.
2. A `submitToAus(payload)` async function that, for now, returns a **mock AUS result** after 2–4 seconds (simulating real AUS latency). The mock returns `'approve_eligible'` 70% of the time and `'refer'` 30%.

```typescript
export interface AusPayload {
  // From soft credit pull
  creditScore: number;
  monthlyLiabilities: number;
  derogatoryFlags: boolean;
  // From conversational answers
  grossMonthlyIncome: number;
  employmentType: string;
  selfEmployed: boolean;
  coBorrowerIncome: number;
  downPayment: number;
  purchasePrice: number;
  occupancyType: string;
  propertyType: string;
  transactionType: string;
  // From system
  representativeRate: number;
  loanAmount: number;
  ltv: number;
  estimatedDti: number;
  estimatedPitia: number;
}

export async function submitToAus(payload: AusPayload): Promise<'approve_eligible' | 'refer'> {
  // TODO: Replace with real Encompass Developer Connect API call
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  return Math.random() < 0.70 ? 'approve_eligible' : 'refer';
}
```

**Result:**
The AUS submission has a clean, typed interface. When real Encompass API credentials are available, the `submitToAus()` function body is swapped out — nothing else changes. The mock lets the entire UI and narration flow be fully tested end-to-end before production AUS access is set up.

---

### ✅ [DONE] Step 2.3 — Add REST API Endpoint for Panel Calculations

**Problem:**
The browser-rendered affordability panel needs to call the backend on every slider change to get updated PITIA and band status. Currently, there is no REST endpoint for this. Without it, the frontend either has to duplicate all the calculation logic (bad — would diverge from backend math) or it cannot update the panel in real time.

**Solution:**
In the Next.js app, create `src/app/api/affordability/calculate/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { calculateAffordability } from '../../../../backend/src/utils/affordability-calculator';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { purchasePrice, downPayment, grossAnnualIncome,
          totalMonthlyDebt, programType } = body;

  const result = calculateAffordability({
    purchasePrice, downPayment, grossAnnualIncome,
    totalMonthlyDebt, programType: programType ?? 'conventional',
  });

  // IMPORTANT: Never return the raw `dti` or `loanAmount` to the client —
  // only return what the UI is allowed to display per compliance rules.
  return NextResponse.json({
    totalPITIA: result.totalPITIA,
    monthlyMI: result.monthlyMI,
    incomeBand: result.incomeBand,
    dtiBand: result.dtiBand,
    dtiAboveHardCeiling: result.dtiAboveHardCeiling,
    // dti is intentionally excluded — never displayed to borrower
  });
}
```

Also create `src/app/api/affordability/submit/route.ts` for the AUS submission trigger:
```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Build payload, call submitToAus, return result
  ...
}
```

**Result:**
The frontend panel calls `/api/affordability/calculate` on every slider change (debounced to 300ms) and gets back PITIA, MI, and band statuses. The backend remains the single source of truth for all math. Calling `/api/affordability/submit` triggers AUS processing asynchronously.

---

## Stage 3: AUS Findings Delivery & Ailana Narration Scripts (Stage 2.5 Prompts)

This stage wires up findings delivery (FD1/FD2) back to the conversational layer and adds the Stage 2.5 narration formulations to Ailana's prompt instructions.

---

### ✅ [DONE] Step 3.1 — AUS Findings Handling & State Transition

**Problem:**
After the borrower submits from the affordability panel, the AUS call is async. The state machine sets `affordability_aus_status = 'pending'` but then has no mechanism to receive the AUS result and advance the conversation. The LLM also has no instruction on what to say while AUS is processing (the spec requires the `RFD-LOADING` formulation if > 10 seconds elapse).

**Solution:**
1. When `submitToAus()` resolves, call a new method `applyAusResult(result: 'approve_eligible' | 'refer')` on the `SessionContextManager`:
   ```typescript
   applyAusResult(result: 'approve_eligible' | 'refer') {
     this.profile.affordability_aus_status = result === 'approve_eligible' ? 'approve_eligible' : 'refer';
     this.activeStage = '2.5';
     this.currentPendingField = result === 'approve_eligible' ? 'fd1_delivery_acknowledged' : 'fd2_delivery_acknowledged';
   }
   ```
2. In the `agent.ts` response loop, after triggering the AUS call, set a 10-second timer. If the AUS has not returned, inject the `RFD-LOADING` narration as a proactive Ailana utterance:
   ```
   "Your eligibility review is processing right now — these reviews typically take just a moment, but occasionally take a little longer depending on system volume. Please hold on — I'll have your results for you shortly."
   ```
3. In `runStage25Extraction()`, handle `fd1_delivery` and `fd2_delivery` as terminal pending fields that trigger the appropriate verbatim narration from the prompt layer.

**Result:**
The AUS flow is complete: submit → loading state → result arrives → Ailana speaks FD1 or FD2 → pre-qual letter is emailed (FD1) or MLO routing begins (FD2). No dead air during AUS processing. No borrower is left hanging.

---

### ✅ [DONE] Step 3.2 — Add Stage 2.5 Prompt Instructions File

**Problem:**
Ailana has no instruction layer for Stage 2.5. There is no `stage2.5-affordability.ts` prompt file. Without it, the LLM will not know the mandatory formulations (`Q46`–`Q58`), will not know that it must **never** vocalize dollar figures, and will not know the difference between `FD1`, `FD1-alt`, and `FD2` findings delivery scripts. This means Ailana will either go off-script or say nothing useful when the panel is open.

**Solution:**
Create `backend/src/prompts/stage25-affordability.ts` with `buildStage25Instructions()`:
```typescript
export function buildStage25Instructions(profile: BorrowerProfile): string {
  return `
STAGE: Affordability Scenario Review (Stage 2.5).
GOAL: Guide the borrower through their affordability summary on screen, support exploration, carry them to a formal eligibility review submission or a licensed loan officer handoff.

PANEL BEHAVIOR RULES (MANDATORY — NEVER DEVIATE):
- All dollar figures, ratios, and scores are computed by the system and displayed on screen.
  You MUST NEVER vocalize specific dollar amounts, DTI percentages, or credit scores.
  Narrate DIRECTION only (e.g., "moved into the typical guideline range").
- Status bands are always "within typical range" or "above typical range."
  NEVER use: pass, fail, approved, denied, rejected, red flag.
- The "Submit for review" button is always available to the borrower.
  Every narration that describes an above-range result MUST reaffirm that submission is available.
- You cannot recommend a specific purchase price or down payment value. This is a mandatory SAFE Act boundary.
  If asked "Just tell me what price to qualify," deliver Q55 verbatim and offer to connect with a loan officer.

FORMULATIONS — DELIVER EXACTLY AS WRITTEN:

Q46 — When panel first appears:
"Thank you for your patience, [Name] — your initial results are in, and I've placed your affordability summary on your screen. It brings together the income and savings targets you shared with me and the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?"

Q47 — Inviting exploration:
"I've opened your scenario explorer. You are in full control here — you can adjust the target purchase price or your down payment amount, and the summary on your screen will update as you go. I'll describe what changes as you explore. Take your time — there's no wrong way to do this."

Q48 — Narrating a slider change (use the correct variant):
  WITHIN RANGE: "With that change, your total debt ratio moved into the typical guideline range shown on your screen, and your estimated monthly payment came down as well. These targets are yours to set — keep exploring as long as you like, or let me know when the picture feels right to you."
  ABOVE RANGE: "With that change, your total debt ratio moved above the typical guideline range shown on your screen. [If dti_above_hard_ceiling set: Note that this scenario falls outside typical program guidelines, but the submit option is still fully available to you.] That is simply information for your planning — you're welcome to keep exploring, and you can submit for the formal review at any point either way."
  MI CHANGE: "You'll notice the mortgage insurance line on your screen responded to your down payment change — on conventional scenarios, that line appears when the down payment is under twenty percent and drops off at twenty percent or more."

Q49 — Proactive submission invitation (deliver once when scenario is within range and borrower pauses):
"Your scenario has been sitting comfortably within the typical guideline ranges for the targets you've chosen. Whenever you feel ready, you can submit this for the formal eligibility review — that returns your conditional eligibility result along with an estimated payment range, and it does not affect your credit score. There's no obligation, and you're welcome to keep exploring first. Would you like to submit now?"

Q50 — Proactive check-in when above range:
"I want to check in — the summary on your screen reflects the targets you've set so far. From here you have three good options, and the choice is entirely yours: you can keep adjusting your targets, you can submit for the formal eligibility review exactly as things stand, or I can connect you with a licensed loan officer who can look at possibilities an automated summary doesn't capture — things like down payment assistance programs and specialized loan structures. Which would you prefer?"

Q51 — Routing out-of-scope profiles (NO denial language):
"Based on your profile, the strongest next step is a conversation with one of our licensed loan officers. Some situations are best reviewed by a person who can consider specialized program options and credit-strengthening strategies that our automated review doesn't cover. I can connect you right now, or schedule a callback at a time that works for you — which do you prefer?"

Q52 — Drop-off / borrower declines:
"I completely understand — this is one of the biggest financial decisions there is, and pausing to think it through is a perfectly good choice. Your session is securely saved, so whenever you're ready, you can pick up right where you left off. If you'd like, I can send you a summary of the scenarios you explored today so you have it on hand. Would that be helpful?"
If borrower accepts: "I can send that to the email or mobile number on your account — which would you prefer?"
If borrower declines: "No problem at all. Thank you for spending time with me today..."

Q53 — Mortgage insurance question:
[If pmi_explained is true: "Like we covered earlier — the mortgage insurance line updates in real time based on your program type. On conventional scenarios it drops off once your down payment reaches twenty percent, whereas FHA and VA follow their respective monthly premium or funding fee rules."]
[If pmi_explained is false: "That line shows the estimated mortgage insurance for the scenario you're exploring, and it depends on the program type. On conventional scenarios, private mortgage insurance appears when the down payment is under twenty percent — and it isn't permanent; once your equity reaches twenty percent, you can request cancellation. On FHA scenarios, it appears as a mortgage insurance premium, which follows different rules. And on VA scenarios, there's no monthly mortgage insurance at all — you'll see a one-time funding fee instead. As you adjust your down payment, watch that line — it responds in real time."]

Q54 — "Does this mean I'm approved?":
"Not yet — and I want to be really clear about what this summary is and isn't. It's an educational comparison of the scenario you've built against typical program guideline ranges. It is not an approval, a denial, or any kind of loan decision. The formal eligibility review is the step that returns your actual conditional eligibility result — and you can submit for that whenever you're ready. Would you like to?"

Q55 — "Just tell me what price to put in so I qualify" (MANDATORY FORMULATION — never substitute):
"That's the one thing I have to leave entirely in your hands — mortgage regulations require that these targets stay your choice, so I'm not able to recommend a specific price or down payment amount. What I can do is keep sharing the general program guidelines and describe how your summary responds as you explore. And if you'd like personalized guidance on structuring this, that's exactly what a licensed loan officer is for — I can connect you with one anytime you'd like."

Q56 — Credit score difference from banking app:
"Great catch — and it's completely normal. Credit scoring uses different models, and the score in your summary comes from the soft credit review, which may use a different model than your banking app. Both may also differ slightly from the score model used in formal mortgage underwriting. Small differences between them are expected and not a cause for concern. Mortgage lenders typically pull your credit from all three major bureaus — Equifax, Experian, and TransUnion — in what's called a tri-merge report, and then use the middle of those three scores for qualifying. That's different from most consumer credit apps or banking apps, which usually show you just one score from one bureau, often using a different scoring model too. That's why the number you see day-to-day rarely matches exactly what a lender sees."

Q57 — "What happens when I click Submit for review?":
"Your information is packaged and sent through the automated eligibility review. The system applies a current representative rate from our rate sheet and returns your conditional eligibility result along with an estimated payment range — it usually comes back within moments, and it does not affect your credit score. Once the result is in, I'll walk you through what it means, and a licensed loan officer takes you through everything from there."

Q58 — "Can I change the income or debt numbers?":
"The debt figures come directly from your credit review, so those stay as reported — though if something on that side looks wrong to you, that's absolutely worth flagging, and your licensed loan officer can help you look into it. Your income, on the other hand, is based on what you shared with me — so if it needs updating, just tell me the corrected figure. One tip: we work with your gross income, before taxes, which is often higher than what lands in your bank account each month. And if anything else you've shared today needs updating — your timeline, occupancy plans, co-borrower details, or anything else — just tell me, and I'll update it before we move forward."

Data Deletion Request — "Can you delete my information?":
"Absolutely, that's your right. I can pause here and flag your session for deletion, or you can reach out to your lending institution's privacy or member services team directly to formally request your data be removed in accordance with their privacy policy. Would you like me to start that process for you now?"

FINDINGS DELIVERY:
FD1 (Approve/Eligible — auto-send):
"Wonderful news, [Name] — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range is on your screen now. I've sent your pre-qualification letter to [email] — would you also like it by text? It's issued by your lending institution, it's valid for ninety days, and it's exactly what real estate agents like to see with an offer. Your licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like."

FD1-alt (Approve/Eligible — MLO-review mode):
"Wonderful news, [Name] — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range is on your screen now. Your licensed loan officer is putting the final review on your pre-qualification letter right now — it will be in your inbox shortly, issued by your lending institution and valid for ninety days. Would you like me to connect you with them now, or have them reach out at a good time for you?"

FD2 (Refer findings):
"Thank you for your patience, [Name] — your review is back, and your scenario needs a closer look from a person rather than an automated decision. That's genuinely common, and it's often where a licensed loan officer finds the best path — they can consider options the automated review can't. Can I connect you to a licensed loan officer now, or schedule a callback?"

FD-LOADING (deliver if AUS takes > 10 seconds):
"Your eligibility review is processing right now — these reviews typically take just a moment, but occasionally take a little longer depending on system volume. Please hold on — I'll have your results for you shortly and we'll go through everything together."
If additional time passes (30+ seconds): "Still processing — thank you for your patience. The review is running through the automated underwriting system and will be back any moment. I'll walk you through the results as soon as they arrive."
`.trim();
}
```

Also update `buildLayer3TurnContext()` in `layer3-context.ts` to include a Stage 2.5 block showing slider state and AUS status when `stage === '2.5'`.

**Result:**
Ailana has a complete, mandatory-formulation instruction layer for Stage 2.5. The LLM will deliver the exact scripted responses with zero improvisation on any compliance-critical formulation. The findings delivery scripts match the spec verbatim.

---

## Stage 4: Frontend — Affordability Panel UI Component

This stage builds the interactive affordability panel as a React component that renders alongside the Ailana avatar/chat interface.

---

### ✅ [DONE] Step 4.1 — Create the `AffordabilityPanel` React Component

**Problem:**
There is no affordability panel UI component anywhere in the codebase. Without it, the interactive screen panel described in the spec cannot render. The panel is the primary visual interface for Stage 2.5 — the borrower uses it to explore scenarios and submit for AUS review. Ailana's narration is meaningless without the on-screen numbers the narration refers to.

**Solution:**
Create `src/components/affordability-panel.tsx`. The component must include:

1. **Permanent Disclosure Banner** (`Section 2.2`) at the top:
   ```tsx
   <div className="disclosure-bar">
     This is an educational estimate, not a loan decision or offer of credit.
   </div>
   ```
   Styled as a muted but legible label — never hidden, never dismissible.

2. **Status Band Rows** (`Section 2.3 & 2.4`) for INCOME and DTI:
   ```tsx
   <BandRow label="INCOME" status={incomeBand} />
   <BandRow label="DTI (Debt-to-Income)" status={dtiBand} />
   ```
   `status='within'` → green left border/badge.
   `status='above'` → amber left border/badge.
   No red. No numbers. No pass/fail text.

3. **Estimated Payment Display** (`Section 2.5`):
   ```tsx
   <div className="payment-display">
     <span className="payment-label">ESTIMATED PAYMENT</span>
     <span className="payment-amount">${totalPITIA.toLocaleString()}/mo</span>
   </div>
   <div className="mi-display">
     <span className="mi-label">MORTGAGE INSURANCE</span>
     <span className="mi-amount">{miDisplay}</span>
   </div>
   ```
   Payment in `24px bold`. MI in `16px regular`. Both update with `200ms CSS transition`.

4. **Scenario Explorer Sliders** (`Section 2.6`) with paired numeric inputs:
   ```tsx
   <SliderWithInput
     label="Target Purchase Price"
     value={purchasePrice}
     min={100000}
     max={2000000}
     step={5000}
     onChange={handlePurchasePriceChange}
   />
   <SliderWithInput
     label="Down Payment"
     value={downPayment}
     min={0}
     step={1000}
     onChange={handleDownPaymentChange}
   />
   ```
   Each `SliderWithInput` has: a large editable dollar input field on top (`inputmode="numeric"`) + the slider below. Changes to either keep the other in sync.

5. **Submit Button** (`Section 2.7`):
   ```tsx
   <button
     id="affordability-submit-btn"
     className="submit-btn"
     onClick={handleSubmit}
     disabled={false}  // NEVER disabled — Regulation B non-discouragement
   >
     {isSubmitting ? 'Reviewing...' : 'Submit for review'}
   </button>
   ```
   **Critical**: `disabled` is hardcoded to `false`. The button must never be conditionally disabled based on band status.

6. **State management**: On every slider change, call `/api/affordability/calculate` (debounced to 300ms) and update `totalPITIA`, `monthlyMI`, `incomeBand`, and `dtiBand`. On submit, call `/api/affordability/submit` and show a spinner.

**Result:**
The affordability panel renders with all spec-compliant display fields. The borrower can drag sliders or type numbers and see PITIA + band status update in real time. The submit button is always visible and always clickable. No dollar ratios or raw percentages are ever displayed.

---

### Step 4.2 — Integrate the Panel into the Chat/Video Interface

**Problem:**
Even with the `AffordabilityPanel` component built, it has no mounting point in the existing UI. The panel needs to appear alongside the Ailana chat/video interface at the correct moment (when `activeStage === '2.5'`). Currently, `live-chat-panel.tsx` and `video-stage.tsx` have no awareness of Stage 2.5.

**Solution:**
1. Expose the current `activeStage` and `affordability_panel_rendered` flag from the backend to the frontend via the existing WebSocket/LiveKit session message channel (add a `stage_update` message type that the backend sends whenever `activeStage` changes).
2. In `live-chat-panel.tsx`, listen for `stage_update` messages. When `stage === '2.5'` and `panel_rendered === true`, conditionally render `<AffordabilityPanel>` in a side-panel column next to the chat thread:
   ```tsx
   {activeStage === '2.5' && panelRendered && (
     <AffordabilityPanel
       initialPurchasePrice={affordabilityData.purchasePrice}
       initialDownPayment={affordabilityData.downPayment}
       grossAnnualIncome={affordabilityData.grossAnnualIncome}
       totalMonthlyDebt={affordabilityData.totalMonthlyDebt}
       programType={affordabilityData.programType}
       onSubmit={handleAffordabilitySubmit}
     />
   )}
   ```
3. In `video-stage.tsx`, apply the same conditional. Additionally, implement the Picture-in-Picture avatar behavior for mobile (`Section 10.2`): when Stage 2.5 activates, set a CSS class on the avatar element that triggers a transition from full-screen to an `80x80px` fixed corner position.

**Result:**
When Ailana transitions to Stage 2.5 and delivers Q46, the affordability panel appears automatically on the borrower's screen alongside the chat or video interface. No manual action is needed. The panel and chat remain in sync — the borrower can interact with sliders while still hearing/reading Ailana.

---

### Step 4.3 — Mobile Layout Adaptations (`Section 10`)

**Problem:**
On mobile viewports (`375px` minimum), displaying both the Ailana video avatar and the interactive panel simultaneously is physically impossible — each requires the full screen width. The spec defines three explicit modality paths (`PANEL_MODE` with PiP, `PANEL_MODE` chat-only, `VOICE_MODE`) that must be handled differently. Without this, the mobile experience will be either broken (overlapping UI) or useless (panel too small to interact with).

**Solution:**
1. **Modality detection**: Read `session.modality` (set by the backend at session start — `PANEL_MODE` for web/mobile browser, `VOICE_MODE` for telephony) and expose it to the frontend via the `stage_update` message.

2. **Modality 1 — Avatar Video + Panel** (`Section 10.2`): When `modality = PANEL_MODE` and the avatar is visible:
   - When Stage 2.5 triggers, show a *"Review my options"* button below the avatar.
   - On tap, apply CSS transitions: avatar shrinks to `80x80px` PiP overlay (`position: fixed; bottom: 16px; right: 16px`), panel expands to `100vw × 100vh`.
   - PiP is draggable. On tap, restores full avatar; panel minimizes to a bottom sheet handle.
   - Animated speaking indicator on PiP when Ailana is speaking.
   - Accessibility label: `"Ailana — tap to restore"`.

3. **Modality 2 — Text/Chat** (`Section 10.3`): Panel renders as an inline card in the chat thread immediately below Ailana's Q46 message. Chat scrolls up above it. No PiP needed.

4. **Modality 3 — Voice/Phone Only** (`Section 10.4`): Panel does not render. Backend `VOICE_MODE` path collects purchase price and down payment conversationally, runs `calculateAffordability()` server-side, and Ailana verbally narrates band status only (no dollar figures). Submit is a verbal confirmation. Results delivered via voice + email.

5. **Touch targets** (`Section 10.5`): Slider thumbs must have a minimum `44×44px` hit area. Submit button minimum `52px` height, full width minus `32px` margins, sticky to bottom of viewport.

**Result:**
The affordability panel works correctly on every viewport and in every engagement modality. Avatar video sessions on mobile use PiP. Chat sessions embed the panel inline. Phone-only sessions skip the UI and use server-side narration. All touch targets meet WCAG 2.1 AA requirements.

---

## Stage 5: Audit Logging

### ✅ [DONE] Step 5.1 — Implement Affordability Panel Audit Log

**Problem:**
Per `Section 5` of the spec and `Compliance Item` in the compliance reference, every affordability panel interaction must be written to a server-side immutable audit log for fair lending monitoring. This is required by ECOA/Regulation B. There is currently no affordability-specific audit logging anywhere in the codebase. Without it, every interaction is unaudited and the system is non-compliant.

**Solution:**
Create `backend/src/utils/affordability-audit.ts` with an `logAffordabilityEvent()` function:
```typescript
export type AffordabilityEventType =
  | 'panel_rendered'
  | 'slider_changed'
  | 'band_status_change'
  | 'submit_clicked'
  | 'aus_result_received'
  | 'prequal_letter_issued'
  | 'drop_off'
  | 'scenario_summary_email_sent';

export interface AffordabilityAuditEvent {
  eventType: AffordabilityEventType;
  sessionId: string;
  timestamp: string;          // ISO 8601
  // Panel rendered
  borrowerName?: string;
  transactionType?: string;
  initialPurchasePrice?: number;
  initialDownPayment?: number;
  initialDtiBand?: string;
  initialIncomeBand?: string;
  // Slider changed
  sliderType?: 'purchase_price' | 'down_payment';
  previousValue?: number;
  newValue?: number;
  resultingDtiBand?: string;
  resultingIncomeBand?: string;
  resultingEstimatedPayment?: number;
  // Band status change
  band?: 'income' | 'dti';
  previousStatus?: string;
  newStatus?: string;
  // Submit & AUS
  purchasePriceAtSubmission?: number;
  downPaymentAtSubmission?: number;
  loanAmountAtSubmission?: number;
  ltvAtSubmission?: number;
  estimatedDtiAtSubmission?: number;
  findingType?: 'Approve/Eligible' | 'Refer';
  timeToResultMs?: number;
  // Letter
  letterId?: string;
  mloName?: string;
  mloNmls?: string;
  deliveryMethod?: string;
  // Drop-off
  lastPanelState?: string;
  dropOffStage?: string;
}

export async function logAffordabilityEvent(event: AffordabilityAuditEvent): Promise<void> {
  // Write to persistent server-side log (database table or append-only log file)
  // Minimum 3-year retention per ECOA/Regulation B
  console.log('[AUDIT]', JSON.stringify(event));
  // TODO: Replace with actual database write via Prisma
}
```

Call `logAffordabilityEvent()` at every relevant point: when the panel renders, on every slider change, on every band status change, on submit, on AUS result, on letter issued, on drop-off.

**Result:**
Every affordability panel interaction has an immutable, timestamped audit trail. The log records the minimum fields required for fair lending monitoring as specified in `Section 5.1`. The system is ECOA/Regulation B compliant for audit purposes.

---

## Stage 6: Pre-Qualification Letter Generation

### ✅ [DONE] Step 6.1 — Implement Pre-Qualification Letter Generator

**Problem:**
When AUS returns `Approve/Eligible` (`FD1`), the spec requires that a pre-qualification letter be generated and emailed to the borrower immediately (auto-send mode) or held for MLO review (MLO-review mode). There is no letter generator, no email sender, and no letter template in the codebase. Without this, the FD1 flow is incomplete — Ailana says the letter has been emailed but nothing actually gets sent.

**Solution:**
1. Create `backend/src/utils/prequal-letter.ts` with a `generatePrequalLetter()` function that produces an HTML/PDF letter containing exactly the required fields per `Section 7`:
   - **Title**: `"Pre-Qualification Letter"` (never "Pre-Approval").
   - **Conditioned language**: *"Based on the information provided, [Borrower Name] appears conditionally eligible for a mortgage up to..."*
   - **Maximum qualified amount**: From AUS findings.
   - **Expiration date**: `90 days` from issuance (configurable via `LETTER_VALIDITY` env var).
   - **Lending institution name and address**: From env config.
   - **Assigned MLO full name + NMLS number**: From tenant config.
   - **Date of issuance**.
   - **What must NOT appear**: No interest rate, no monthly payment estimate, no approval language, no mention of Ailana as issuer.

2. Create `backend/src/utils/email-sender.ts` (and a corresponding `backend/src/utils/sms-sender.ts`) with a `sendPrequalLetter()` function that emails or texts the letter PDF to the borrower's `Q45` contact information after E-SIGN consent is confirmed, per their requested delivery method (v8.5 additions).

3. Log every letter issuance to the affordability audit log (`prequal_letter_issued` event) with `letter_id`, `mlo_name`, `mlo_nmls`, `delivery_method` (email vs SMS), and `timestamp`.

**Result:**
When AUS returns `Approve/Eligible`, a compliant pre-qualification letter is generated and sent via email (and optionally SMS) automatically. The letter is titled correctly ("Pre-Qualification Letter"), contains all required fields, omits all prohibited fields (no rate, no monthly payment, no approval claims), and is logged to the audit trail.

---

## Stage 7: End-to-End Testing & Verification

### ✅ [DONE] Step 7.1 — Backend Unit Tests

**Problem:**
The calculation engine, AUS payload builder, and audit logger are pure functions that can be unit-tested independently. Without tests, calculation regressions (e.g., a wrong PMI formula) could silently break payment estimates shown to every borrower.

**Solution:**
Create `backend/src/__tests__/affordability-calculator.test.ts` with test cases covering:
- Conventional loan, LTV > 80% → PMI appears correctly.
- Conventional loan, LTV ≤ 80% → MI = $0.
- FHA loan → MIP at 0.55% regardless of LTV.
- VA loan → Monthly MI = $0.
- USDA loan → Annual fee at 0.35%.
- Income band threshold: verify `within` when PITIA ≤ 28% of monthly income.
- DTI band threshold: verify `within` when total DTI ≤ 45%, `above` when > 45%.
- Verify that `dti` is computed correctly and NOT included in the REST API response.

Run: `npm run test` from the project root.

**Result:**
All calculation paths are verified by automated tests. Any regression in a formula immediately fails the test suite before deployment.

---

### ✅ [DONE] Step 7.2 — Full Conversational Flow Test

**Problem:**
The Stage 2.5 state machine, narration scripts, and panel integration need to be validated end-to-end with a real session to confirm that all moving parts connect correctly — state transitions, panel rendering, slider updates, AUS mock, findings delivery, and letter generation.

**Solution:**
Run a complete test session in the browser following this sequence:

1. **Stage 1 → 2 → Stage 2 Closing Offer**: Complete all Stage 1 and Stage 2 fields, reach the `stage2_closing_offer` prompt, say "Yes."
2. **Panel Appearance**: Verify the affordability panel renders with pre-seeded slider values from Q38 (down payment) and Q41 (target price). Verify Q46 is spoken.
3. **Slider Interaction**: Move the purchase price slider up. Verify:
   - PITIA updates within 300ms.
   - Band status updates correctly.
   - Ailana delivers Q48 (correct variant — above or within range).
   - No dollar figures are vocalized by Ailana.
4. **Submit Button**: Verify the button is always enabled regardless of band status (test with a DTI > 50% scenario).
5. **Submit Flow**: Click "Submit for review." Verify spinner appears, `RFD-LOADING` fires after 10s if needed, and AUS mock result arrives within 4s.
6. **FD1 / FD2**: Verify FD1 narration is delivered verbatim when mock returns `approve_eligible`. Verify the pre-qual letter email is triggered (check email or mock output). Verify FD2 narration when mock returns `refer`.
7. **SAFE Act Boundary (Q55)**: Type "Just tell me what price puts me in range." Verify Ailana delivers the Q55 mandatory formulation without suggesting a price.
8. **Drop-off / Q52**: Say "I need to think about this." Verify Q52 drop-off handling and session save confirmation.
9. **Voice Mode**: Test the session in a voice-only context (Modality 3). Verify the panel does not render, Ailana collects price and down payment verbally, narrates band status only, and offers verbal submission.

**Result:**
End-to-end validation that the entire Stage 2.5 flow — from panel render to AUS findings delivery — works correctly across all compliance boundaries (no vocalized figures, always-enabled submit button, mandatory Q55 refusal, FD1/FD2 verbatim delivery) and across all modalities (chat, video + PiP, voice-only).

---

## File Change Summary

| File | Change Type | What Changes |
|:---|:---|:---|
| `backend/src/config/ailana-config.ts` | **MODIFY** | Add `representativeRate`, band thresholds, tax/insurance/MI rate defaults |
| `.env.local` | **MODIFY** | Add `REPRESENTATIVE_RATE` and all related env vars with current values |
| `backend/src/prompts/layer3-context.ts` | **MODIFY** | Add Stage 2.5 `BorrowerProfile` fields and Stage 2.5 display block in `buildLayer3TurnContext()` |
| `backend/src/context/session-context-manager.ts` | **MODIFY** | Add `Stage 2.5` state, `runStage25Extraction()`, AUS result handler, stage transition from `stage2_closing_offer → 'yes'` |
3. In `video-stage.tsx`, apply the same conditional. Additionally, implement the Picture-in-Picture avatar behavior for mobile (`Section 10.2`): when Stage 2.5 activates, set a CSS class on the avatar element that triggers a transition from full-screen to an `80x80px` fixed corner position.

**Result:**
When Ailana transitions to Stage 2.5 and delivers Q46, the affordability panel appears automatically on the borrower's screen alongside the chat or video interface. No manual action is needed. The panel and chat remain in sync — the borrower can interact with sliders while still hearing/reading Ailana.

---

### Step 4.3 — Mobile Layout Adaptations (`Section 10`)

**Problem:**
On mobile viewports (`375px` minimum), displaying both the Ailana video avatar and the interactive panel simultaneously is physically impossible — each requires the full screen width. The spec defines three explicit modality paths (`PANEL_MODE` with PiP, `PANEL_MODE` chat-only, `VOICE_MODE`) that must be handled differently. Without this, the mobile experience will be either broken (overlapping UI) or useless (panel too small to interact with).

**Solution:**
1. **Modality detection**: Read `session.modality` (set by the backend at session start — `PANEL_MODE` for web/mobile browser, `VOICE_MODE` for telephony) and expose it to the frontend via the `stage_update` message.

2. **Modality 1 — Avatar Video + Panel** (`Section 10.2`): When `modality = PANEL_MODE` and the avatar is visible:
   - When Stage 2.5 triggers, show a *"Review my options"* button below the avatar.
   - On tap, apply CSS transitions: avatar shrinks to `80x80px` PiP overlay (`position: fixed; bottom: 16px; right: 16px`), panel expands to `100vw × 100vh`.
   - PiP is draggable. On tap, restores full avatar; panel minimizes to a bottom sheet handle.
   - Animated speaking indicator on PiP when Ailana is speaking.
   - Accessibility label: `"Ailana — tap to restore"`.

3. **Modality 2 — Text/Chat** (`Section 10.3`): Panel renders as an inline card in the chat thread immediately below Ailana's Q46 message. Chat scrolls up above it. No PiP needed.

4. **Modality 3 — Voice/Phone Only** (`Section 10.4`): Panel does not render. Backend `VOICE_MODE` path collects purchase price and down payment conversationally, runs `calculateAffordability()` server-side, and Ailana verbally narrates band status only (no dollar figures). Submit is a verbal confirmation. Results delivered via voice + email.

5. **Touch targets** (`Section 10.5`): Slider thumbs must have a minimum `44×44px` hit area. Submit button minimum `52px` height, full width minus `32px` margins, sticky to bottom of viewport.

**Result:**
The affordability panel works correctly on every viewport and in every engagement modality. Avatar video sessions on mobile use PiP. Chat sessions embed the panel inline. Phone-only sessions skip the UI and use server-side narration. All touch targets meet WCAG 2.1 AA requirements.

---

## Stage 5: Audit Logging

### ✅ [DONE] Step 5.1 — Implement Affordability Panel Audit Log

**Problem:**
Per `Section 5` of the spec and `Compliance Item` in the compliance reference, every affordability panel interaction must be written to a server-side immutable audit log for fair lending monitoring. This is required by ECOA/Regulation B. There is currently no affordability-specific audit logging anywhere in the codebase. Without it, every interaction is unaudited and the system is non-compliant.

**Solution:**
Create `backend/src/utils/affordability-audit.ts` with an `logAffordabilityEvent()` function:
```typescript
export type AffordabilityEventType =
  | 'panel_rendered'
  | 'slider_changed'
  | 'band_status_change'
  | 'submit_clicked'
  | 'aus_result_received'
  | 'prequal_letter_issued'
  | 'drop_off'
  | 'scenario_summary_email_sent';

export interface AffordabilityAuditEvent {
  eventType: AffordabilityEventType;
  sessionId: string;
  timestamp: string;          // ISO 8601
  // Panel rendered
  borrowerName?: string;
  transactionType?: string;
  initialPurchasePrice?: number;
  initialDownPayment?: number;
  initialDtiBand?: string;
  initialIncomeBand?: string;
  // Slider changed
  sliderType?: 'purchase_price' | 'down_payment';
  previousValue?: number;
  newValue?: number;
  resultingDtiBand?: string;
  resultingIncomeBand?: string;
  resultingEstimatedPayment?: number;
  // Band status change
  band?: 'income' | 'dti';
  previousStatus?: string;
  newStatus?: string;
  // Submit & AUS
  purchasePriceAtSubmission?: number;
  downPaymentAtSubmission?: number;
  loanAmountAtSubmission?: number;
  ltvAtSubmission?: number;
  estimatedDtiAtSubmission?: number;
  findingType?: 'Approve/Eligible' | 'Refer';
  timeToResultMs?: number;
  // Letter
  letterId?: string;
  mloName?: string;
  mloNmls?: string;
  deliveryMethod?: string;
  // Drop-off
  lastPanelState?: string;
  dropOffStage?: string;
}

export async function logAffordabilityEvent(event: AffordabilityAuditEvent): Promise<void> {
  // Write to persistent server-side log (database table or append-only log file)
  // Minimum 3-year retention per ECOA/Regulation B
  console.log('[AUDIT]', JSON.stringify(event));
  // TODO: Replace with actual database write via Prisma
}
```

Call `logAffordabilityEvent()` at every relevant point: when the panel renders, on every slider change, on every band status change, on submit, on AUS result, on letter issued, on drop-off.

**Result:**
Every affordability panel interaction has an immutable, timestamped audit trail. The log records the minimum fields required for fair lending monitoring as specified in `Section 5.1`. The system is ECOA/Regulation B compliant for audit purposes.

---

## Stage 6: Pre-Qualification Letter Generation

### ✅ [DONE] Step 6.1 — Implement Pre-Qualification Letter Generator

**Problem:**
When AUS returns `Approve/Eligible` (`FD1`), the spec requires that a pre-qualification letter be generated and emailed to the borrower immediately (auto-send mode) or held for MLO review (MLO-review mode). There is no letter generator, no email sender, and no letter template in the codebase. Without this, the FD1 flow is incomplete — Ailana says the letter has been emailed but nothing actually gets sent.

**Solution:**
1. Create `backend/src/utils/prequal-letter.ts` with a `generatePrequalLetter()` function that produces an HTML/PDF letter containing exactly the required fields per `Section 7`:
   - **Title**: `"Pre-Qualification Letter"` (never "Pre-Approval").
   - **Conditioned language**: *"Based on the information provided, [Borrower Name] appears conditionally eligible for a mortgage up to..."*
   - **Maximum qualified amount**: From AUS findings.
   - **Expiration date**: `90 days` from issuance (configurable via `LETTER_VALIDITY` env var).
   - **Lending institution name and address**: From env config.
   - **Assigned MLO full name + NMLS number**: From tenant config.
   - **Date of issuance**.
   - **What must NOT appear**: No interest rate, no monthly payment estimate, no approval language, no mention of Ailana as issuer.

2. Create `backend/src/utils/email-sender.ts` (and a corresponding `backend/src/utils/sms-sender.ts`) with a `sendPrequalLetter()` function that emails or texts the letter PDF to the borrower's `Q45` contact information after E-SIGN consent is confirmed, per their requested delivery method (v8.5 additions).

3. Log every letter issuance to the affordability audit log (`prequal_letter_issued` event) with `letter_id`, `mlo_name`, `mlo_nmls`, `delivery_method` (email vs SMS), and `timestamp`.

**Result:**
When AUS returns `Approve/Eligible`, a compliant pre-qualification letter is generated and sent via email (and optionally SMS) automatically. The letter is titled correctly ("Pre-Qualification Letter"), contains all required fields, omits all prohibited fields (no rate, no monthly payment, no approval claims), and is logged to the audit trail.

---

## Stage 7: End-to-End Testing & Verification

### ✅ [DONE] Step 7.1 — Backend Unit Tests

**Problem:**
The calculation engine, AUS payload builder, and audit logger are pure functions that can be unit-tested independently. Without tests, calculation regressions (e.g., a wrong PMI formula) could silently break payment estimates shown to every borrower.

**Solution:**
Create `backend/src/__tests__/affordability-calculator.test.ts` with test cases covering:
- Conventional loan, LTV > 80% → PMI appears correctly.
- Conventional loan, LTV ≤ 80% → MI = $0.
- FHA loan → MIP at 0.55% regardless of LTV.
- VA loan → Monthly MI = $0.
- USDA loan → Annual fee at 0.35%.
- Income band threshold: verify `within` when PITIA ≤ 28% of monthly income.
- DTI band threshold: verify `within` when total DTI ≤ 45%, `above` when > 45%.
- Verify that `dti` is computed correctly and NOT included in the REST API response.

Run: `npm run test` from the project root.

**Result:**
All calculation paths are verified by automated tests. Any regression in a formula immediately fails the test suite before deployment.

---

### ✅ [DONE] Step 7.2 — Full Conversational Flow Test

**Problem:**
The Stage 2.5 state machine, narration scripts, and panel integration need to be validated end-to-end with a real session to confirm that all moving parts connect correctly — state transitions, panel rendering, slider updates, AUS mock, findings delivery, and letter generation.

**Solution:**
Run a complete test session in the browser following this sequence:

1. **Stage 1 → 2 → Stage 2 Closing Offer**: Complete all Stage 1 and Stage 2 fields, reach the `stage2_closing_offer` prompt, say "Yes."
2. **Panel Appearance**: Verify the affordability panel renders with pre-seeded slider values from Q38 (down payment) and Q41 (target price). Verify Q46 is spoken.
3. **Slider Interaction**: Move the purchase price slider up. Verify:
   - PITIA updates within 300ms.
   - Band status updates correctly.
   - Ailana delivers Q48 (correct variant — above or within range).
   - No dollar figures are vocalized by Ailana.
4. **Submit Button**: Verify the button is always enabled regardless of band status (test with a DTI > 50% scenario).
5. **Submit Flow**: Click "Submit for review." Verify spinner appears, `RFD-LOADING` fires after 10s if needed, and AUS mock result arrives within 4s.
6. **FD1 / FD2**: Verify FD1 narration is delivered verbatim when mock returns `approve_eligible`. Verify the pre-qual letter email is triggered (check email or mock output). Verify FD2 narration when mock returns `refer`.
7. **SAFE Act Boundary (Q55)**: Type "Just tell me what price puts me in range." Verify Ailana delivers the Q55 mandatory formulation without suggesting a price.
8. **Drop-off / Q52**: Say "I need to think about this." Verify Q52 drop-off handling and session save confirmation.
9. **Voice Mode**: Test the session in a voice-only context (Modality 3). Verify the panel does not render, Ailana collects price and down payment verbally, narrates band status only, and offers verbal submission.

**Result:**
End-to-end validation that the entire Stage 2.5 flow — from panel render to AUS findings delivery — works correctly across all compliance boundaries (no vocalized figures, always-enabled submit button, mandatory Q55 refusal, FD1/FD2 verbatim delivery) and across all modalities (chat, video + PiP, voice-only).

---

## File Change Summary

| File | Change Type | What Changes |
|:---|:---|:---|
| `backend/src/config/ailana-config.ts` | **MODIFY** | Add `representativeRate`, band thresholds, tax/insurance/MI rate defaults |
| `.env.local` | **MODIFY** | Add `REPRESENTATIVE_RATE` and all related env vars with current values |
| `backend/src/prompts/layer3-context.ts` | **MODIFY** | Add Stage 2.5 `BorrowerProfile` fields and Stage 2.5 display block in `buildLayer3TurnContext()` |
| `backend/src/context/session-context-manager.ts` | **MODIFY** | Add `Stage 2.5` state, `runStage25Extraction()`, AUS result handler, stage transition from `stage2_closing_offer → 'yes'` |
| `backend/src/utils/affordability-calculator.ts` | **NEW** | PITIA calculation engine with program-aware MI and band status logic |
| `backend/src/utils/aus-submission.ts` | **NEW** | AUS payload builder and mock AUS client (to be replaced with Encompass API) |
| `backend/src/utils/affordability-audit.ts` | **NEW** | Affordability panel audit logger (all events → immutable log) |
| `backend/src/utils/prequal-letter.ts` | **NEW** | Pre-qualification letter generator (HTML/PDF, compliant template) |
| `backend/src/utils/email-sender.ts` | **NEW** | Email delivery utility for pre-qual letters |
| `backend/src/utils/sms-sender.ts` | **NEW** | SMS delivery utility for pre-qual letters and summaries |
| `src/app/api/affordability/submit/route.ts` | **NEW** | REST POST endpoint to trigger AUS submission |
| `src/components/affordability-panel.tsx` | **NEW** | Interactive affordability panel UI component (sliders, bands, PITIA, submit button) |
| `src/components/floating-cta/affordability-modal.tsx` | **NEW** | Minimizable glassmorphism modal for affordability exploration |
| `backend/src/utils/zip-lookup.ts` | **NEW** | Zip code lookup utility for property tax estimation and USDA rural checks |
| `backend/src/__tests__/stage1-foundation.test.ts` | **NEW** | Unit tests for Stage 1 config, profile fields, and state machine |
| `backend/src/__tests__/stage2-calculation-aus.test.ts` | **NEW** | Unit tests for Stage 2 calculation engine, MI formulas, and AUS payload |
| `backend/src/__tests__/stage3-prompts-findings.test.ts` | **NEW** | Unit tests for Stage 3 prompts, Q46-Q58 formulations, and findings delivery |
| `backend/src/__tests__/stage4-frontend-integration.test.ts` | **NEW** | Unit tests for Stage 4 REST API contracts and raw DTI exclusion |
| `backend/src/__tests__/stage5-audit-logging.test.ts` | **NEW** | Unit tests for Stage 5 ECOA/Regulation B audit logging |
| `backend/src/__tests__/stage6-prequal-letter.test.ts` | **NEW** | Unit tests for Stage 6 Pre-Qualification letter generation & email dispatch |
| `backend/src/__tests__/stage7-e2e-flow.test.ts` | **NEW** | End-to-end integration test simulating the entire Stage 2.5 flow |
| `backend/src/__tests__/stage8-v87-features.test.ts` | **NEW** | Unit tests for Stage 8 v8.7 zip lookup, stated mode, and prompt formulations |

---

## Stage 8: v8.7 Specification Updates — Two-Path Flow & One-Time OTP Gate

This stage implements the v8.7 changes: Property tax zip code lookup, USDA system-side eligibility check, the two-path affordability flow (stated-mode exploration vs soft-pull), the one-time OTP login gate, upgrade flows, and the accompanying prompt/dialog scripts.

---

### ✅ [DONE] Step 8.1 — Zip-code Area Capture (Q42), USDA determination, and Tax rate feed

**Problem:**
USDA eligibility is currently self-reported. We need the system to determine USDA eligibility based on the Q42 area zip code. Additionally, the zip code should drive property-tax estimations instead of using a static national default tax rate.

**Solution:**
1. In `session-context-manager.ts`, update `runStage2Extraction` and `runStage3AExtraction` to extract `zip_code` from Q42 (area capture).
2. Create a utility `backend/src/utils/zip-lookup.ts` that:
   - Evaluates USDA rural eligibility based on zip (e.g. mock check: zip codes ending in odd digits are USDA-eligible).
   - Maps zip prefixes to estimated property tax rates (e.g., California/Texas defaults vs national average).
3. Update the tax rate calculation in `calculateAffordability()` to use the tax rate lookup if a zip code is present.
4. If the zip code is USDA-eligible, set `profile.military_rural = 'rural'` (or similar) and append the `Q42-USDA` conditional addendum.

**Result:**
Property tax estimates dynamically update based on the borrower's stated area zip code, and USDA rural eligibility is automatically assigned by system logic.

---

### ✅ [DONE] Step 8.2 — Stated-Data Mode & Two-Path Flow in Session Manager

**Problem:**
Previously, Ailana offered only a single soft-pull prefill verification path, requiring email/mobile capture upfront. We must now support a two-path choice (explore immediately in Stated-Data Mode without contact info, or run a soft credit pull).

**Solution:**
1. In `BorrowerProfile`, add:
   - `affordability_mode?: 'stated' | 'verified' | null;`
   - `session_login_complete?: boolean;`
   - `contact_on_file?: boolean;`
2. Update the Stage 2 Closing Transition extraction:
   - If the borrower selects the soft-pull path, transition to Stage 3A contact capture & OTP verification (the one-time gate), then soft-pull consent, then set `affordability_mode = 'verified'` and transition to Stage 2.5.
   - If the borrower selects the stated-data (explore-first) path, transition immediately to Stage 2.5 with `affordability_mode = 'stated'`, bypassing all contact capture, OTP gates, and credit authorization.
3. In Stage 2.5 Stated-Data Mode, keep the submit action fully available. If they click submit or request an upgrade, trigger the OTP identity gate first.

**Result:**
Borrowers can choose to explore anonymously in Stated-Data Mode without giving contact info, or choose Path A for soft credit prefill.

---

### ✅ [DONE] Step 8.3 — Combined One-Time OTP Gate & Login Flow

**Problem:**
We need a combined identity gate (email, mobile, and 6-digit OTP verification) that fires once at the borrower's first commitment point (either credit pull or AUS submission) and never fires again.

**Solution:**
1. In `session-context-manager.ts`, check `session_login_complete`.
2. If `false` at the commitment point, set `currentPendingField = 'otp_verification'`.
3. Send a mock 6-digit OTP via console log (e.g., `123456`).
4. Once the borrower inputs/says the correct code, set `session_login_complete = true` and `contact_on_file = true`, then advance to the next step.

**Result:**
The identity gate fires exactly once at the first commitment point and persists across the session.

---

### ✅ [DONE] Step 8.4 — Prompt Formulations (Q46-S, Upgrade, Q58 stated, Q52 stated)

**Problem:**
We must update the LLM prompt packages to include the v8.7 stated-mode formulations.

**Solution:**
1. In `backend/src/prompts/stage25-affordability.ts`, add the `Q46-S` stated-mode presentation prompt, the upgrade narration prompt, the stated-mode `Q58` extension, and the `Q52` no-contact variant.
2. Integrate these prompts into `buildStage25Instructions()`.

**Result:**
Ailana delivers exact v8.7 compliant response scripts depending on whether the session is in Stated Mode or Verified Mode.

---

### ✅ [DONE] Step 8.5 — Frontend UI Adaptive Layout & OTP Verification

**Problem:**
The frontend `<AffordabilityPanel />` and `<FloatingCTA />` must render stated-data mode correctly (hidden credit score, `"Monthly debts (your estimate)"` label, and upgrade option) and support the OTP verification modal.

**Solution:**
1. Add `mode: 'stated' | 'verified'` prop to `<AffordabilityPanel />`.
2. Render an upgrade CTA in Stated mode that triggers `upgradeToVerified()`.
3. Implement an OTP verification input component in `<FloatingCTA />` that is displayed when `currentPendingField === 'otp_verification'`.

**Result:**
The panel UI seamlessly adjusts between Stated Mode and Verified Mode, and renders inside a minimizable glassmorphism modal (`<AffordabilityModal />`).

---

### ✅ [DONE] Step 8.6 — API Endpoint Updates

**Problem:**
The `/api/affordability/calculate` and `/api/affordability/submit` endpoints must be updated to accept zip codes and support stated mode calculations.

**Solution:**
1. Update Next.js endpoints to extract zip codes and pass them to the calculations.
2. Ensure stated mode submit triggers mock AUS review.

**Result:**
Both Next.js calculation and submission endpoints support zip code tax lookups and stated mode submission.
