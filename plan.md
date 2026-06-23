# Layer 2 & 3 Prompt Restructuring Plan

This plan details the stages to implement Layer 2 & Layer 3 prompts, ensuring clean data collection and removing legacy redundancies step-by-step. We leverage instructions and stages from [PromptMigrationPlan.md](file:///c:/Users/Sherry/Documents/Convergent_AI/PromptMigrationPlan.md) and establish strict architectural separation of concerns.

---

## Architectural Guardrails & Rules (System-Wide)

To guarantee compliance, prevent conversational looping, and ensure high reliability, the system strictly follows these 20 guardrails:

1. **State-Controlled Transitions**: Stage transitions are driven entirely by backend logic, not LLM completion signals.
2. **Explicit Confirmation Tracking**: Distinguish between extracted values and confirmed values (e.g., `borrower_name` vs `borrower_name_confirmed`).
3. **Structured Extraction Layer**: User transcripts are analyzed by a structured extraction routine rather than relying on the LLM conversational agent to manage data storage.
4. **Current Objective Tracking**: Inject the active pending field (e.g., `timeline`) into Layer 3 to prevent the model from jumping ahead or stacking questions.
5. **Corrections & Re-confirmation Handling**: Overwriting old values resets confirmation states, forcing the LLM to reconfirm the new input.
6. **Verbatim Compliance Delivery**: Legally sensitive scripts (like the soft pull consent) are served directly from backend buffers, bypassing LLM paraphrasing risks.
7. **Tool vs. LLM Authority Separation**: The backend owns State, Variables, and Handoffs. The LLM owns Tone, Explanations, and Conversational flow.
8. **Product Eligibility Rules Engine**: Run eligibility calculations in backend code; the LLM merely reads and explains the list of qualified options from the state block.
9. **No-Approval Guardrails**: Layer 1 strictly prohibits making credit decisions or stating "you are approved" or "you qualify".
10. **Explicit SAFE Act Escalation Triggers**: Define precise trigger rules for immediate MLO transfer (rate locks, manual underwriting request, binding terms).
11. **Confidence Validation**: Require high STT confidence; low-confidence inputs trigger confirmation prompts before saving.
12. **Contradiction Detection**: Compare inputs (e.g., changing purchase to refinance mid-conversation) and prompt the user to resolve conflicts.
13. **Retry Limits**: Track attempts to gather a field. If the user repeatedly declines or fails to provide an answer, mark it as "declined" and move on.
14. **Context Window Management**: Limit context sent to the model to: Layer 1 + Layer 2 + active profile variables + rolling summary + last 4 turns. Never send the full raw transcript.
15. **Handoff Package Construction**: Build a structured, machine-readable JSON package of all collected data when transferring to a human MLO.
16. **Explicit Consent State Machine**: Persist soft pull consent states (`pending | accepted | declined`) explicitly in the session state.
17. **Session Recovery**: Session states are persisted to support resuming conversation seamlessly from the last completed turn.
18. **Audit Logging**: Maintain a secure event trail of every question, answer, extraction result, confirmation, stage advance, and handoff.
19. **Security Boundaries (Secure Fields)**: Highly sensitive fields (e.g., SSN, account numbers) are entered via secure UI redirects. Voice capture is strictly forbidden.
20. **Regression Framework**: Build regression scripts to run automated sanity checks for happy path, compliance triggers, and exceptions.

---

## Stage 1: Legacy Prompt Cleanup & Greeting/Intent Discovery ✅ DONE

### Goal
- Clean up legacy files and establish Layer 1 (Static System Prompt) + Layer 2 (Stage 1 Greeting & Intent Discovery) + Layer 3 (Dynamic Turn Context) assembly structure.
- Remove redundant, monolithic developer-focused prompts.

### Stage 1 Prompts & Instruction Details
- **Registry / Code Entry**: `stage = '1'`
- **Target Instructions**:
  ```
  STAGE: Greeting and intent discovery.
  GOAL: Learn (1) borrower name, (2) mortgage goal, (3) timeline, (4) property state.
  Collect in that order. Do not skip ahead.

  RULES:
  - Ask ONE question per turn. Never stack questions.
  - Open by introducing yourself and asking for their name.
  - Use their name immediately once shared.
  - Do not ask about finances until Stage 2.

  COMPLETION: When all 4 fields collected, bridge to Stage 2:
  'That gives me a solid picture. I'd like to ask a few questions about your financial situation so I can point you toward the right options.'
  ```

### Tool Calling & Variables (Layer 3 Context Block)
- Track variables: `borrower_name` (plus `borrower_name_confirmed`), `mortgage_goal` (plus confirmed), `timeline`, `property_state`.
- Format variables dynamically into the turn context template:
  ```
  === BORROWER PROFILE ===
  Name:                  {{borrower_name | 'not yet collected'}} (Confirmed: {{borrower_name_confirmed}})
  Goal:                  {{mortgage_goal | 'not yet collected'}} (Confirmed: {{mortgage_goal_confirmed}})
  Timeline:              {{timeline | 'not yet collected'}}
  Property state:        {{property_state | 'not yet collected'}}
  === END PROFILE ===
  ```

### Redundancy & Hallucination Protection
- Explicit rules in Layer 1 to never guess or hallucinate the borrower's name if they have not explicitly stated it.
- Explicit instruction in Stage 1 to collect data in sequential order. Do not skip ahead or ask multiple questions at once.

### Verification & Testing Plan
- **Verification**: Ensure system compiles cleanly after removing legacy files:
  - `compliance-responses.ts`
  - `core-instructions.ts`
  - `mortgage-playbook.ts`
  - `mvp-scope.ts`
  - `qualification-ranges.ts`
  - `topic-guidance.ts`
- **Session Simulation**: Verify the context broker correctly builds the prompt prefix with Layer 1, Layer 2 (Greeting), and Layer 3 (Profile variables).

---

## Stage 2: Pre-Qualification Discovery ✅ DONE

### Goal
- Implement Stage 2 Pre-Qualification Discovery logic.
- Prompt the borrower for financial variables conversational-style and verify inputs turn-by-turn.

### Stage 2 Prompts & Instruction Details
- **Registry / Code Entry**: `stage = '2'`
- **Target Instructions**:
  ```
  STAGE: Pre-qualification discovery.
  GOAL: Collect gross monthly income, monthly debt total, credit range, down payment available, and property value or purchase price.
  Collect in that order. One field or logical group per turn.

  RULES:
  - Reference name, goal, and timeline from prior stage naturally.
  - If borrower is uncertain about a figure, offer a range to choose from.
  - If borrower declines to share a field, acknowledge and move on.
  - Confirm each financial figure immediately after it is shared.
    Say: 'Just to confirm — you mentioned [value] as your [field]. Is that right?'
  - Never interpret figures as a qualification decision.

  COMPLETION: When all 5 fields collected (or declined), bridge to Stage 3:
  'Let me walk you through the options that look like the strongest fit.'
  ```

### Tool Calling & Variables (Layer 3 Context Block)
- Variables to track: `gross_monthly_income` (confirmed), `monthly_debt` (confirmed), `credit_range` (confirmed), `down_payment` (confirmed), `property_value` (confirmed).
- Implement dynamic `confirmation_instruction` in Layer 3 when a new financial field is extracted:
  ```
  CONFIRM THIS TURN: You mentioned [value] as [field].
  Say: Just to confirm -- you mentioned [value] as your [field]. Is that right? Wait for confirmation before continuing.
  ```

### Verification & Testing Plan
- Test conversation flows to confirm financial figures.
- Check that Ailana prompts for confirmation of each parsed input and waits for confirmation before updating the session variables.
- Verify transition to Stage 3 when all 5 variables are collected or declined.

---

## Stage 3: Product Guidance & Soft Pull Consent

### Goal
- Implement Stage 3 (Product Guidance & Eligibility Education) and Stage 3A (Soft Pull Consent & Pre-Population).

### Stage 3 & 3A Prompts & Instruction Details
- **Stage 3 Instructions**:
  ```
  STAGE: Product guidance and eligibility education.
  GOAL: Present 2–3 loan products that fit the borrower's profile.
  Answer questions with loan officer confidence and specificity.

  RULES:
  - Open with a 2–3 sentence summary of what the borrower shared.
  - Present products strongest fit first. For each: name it, explain why it fits their specific situation, give one concrete benefit.
  - After each product: 'Does that make sense or do you have questions?'
  - Rates: give general market context only. Never quote a locked rate.
    Close with: 'Your actual rate comes from a formal application.'
  - DTI / LTV thresholds: give general guidelines only, not a decision.
    Say: 'This looks like it could be a good fit — a formal review confirms.'
  - If asked about a product not offered: acknowledge honestly, compare to your closest product.

  COMPLETION: 'The fastest way to get you exact numbers is a soft credit check. It takes 30 seconds, you authorize it yourself, and it has zero impact on your credit score. Want to go ahead?'
  ```
- **Stage 3A Instructions**:
  ```
  STAGE: Applicant-initiated soft pull and application pre-population.
  GOAL: Deliver verbatim consent disclosure. On authorization: confirm pull, walk through pre-populated fields, bridge to Stage 3B.

  CONSENT DISCLOSURE — SPEAK VERBATIM, DO NOT PARAPHRASE:
  'Before we proceed — this is a soft pull, not a hard inquiry. It will not affect your credit score in any way. You are the one authorizing it — not us pulling it on our behalf. Your data is used only to pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?'

  IF YES: Confirm pull, walk pre-populated fields in this order: name and address — employer — accounts summary — credit range bucket.
  After each group: 'Does that look right or is anything out of date?'
  Never read exact score. Never read account numbers.

  IF NO: 'Absolutely — we can enter everything manually instead.' Proceed to Stage 3B.
  ```

### Verification & Testing Plan
- Ensure that the Stage 3A consent text is spoken **verbatim** by the agent.
- Test both flows: where the user authorizes the soft pull (verifying pre-populated data points), and where the user declines authorization.

---

## Stage 4: Application Completion, Underwriting (AUS) & Next Steps

### Goal
- Implement Stage 3B (Mortgage Application Completion 1003), Stage 4A (AUS processing sub-prompts), Stage 4 (Application Guidance), and Stage 5 (SAFE Act Escalation Handoff).

### Prompts & Sub-Prompts
- **Stage 3B**: Collect remaining 1003 fields conversationally, protecting SSN/accounts via on-screen redirect.
- **Stage 4A**: Load appropriate sub-prompts dynamically depending on the mock AUS underwriting response:
  - `4A_waiting`: While processing.
  - `4A_approve`: Informing of positive review / conditional approval.
  - `4A_refer`: Manual review redirection with empathy.
  - `4A_timeout`: System processing delays.
- **Stage 4**: Overview of process steps and documentation check.
- **Stage 5**: Immediate MLO transfer rules under SAFE Act guidelines.

### Verification & Testing Plan
- Test mock API result branching for AUS (approve vs. refer vs. timeout) and verify the agent dynamically updates instructions.
- Validate MLO transfer triggers (Stage 5) when asking restricted rate-related questions.
