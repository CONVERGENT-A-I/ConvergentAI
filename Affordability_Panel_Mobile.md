Ailana — Affordability Tool: Complete Build Specification
ConvergentAI | Internal Use Only | Version 1.1 | July 2026 — Mobile section added

OVERVIEW
The Affordability Tool is a screen-displayed interactive panel that appears during Stage 2.5 of the Ailana borrower engagement flow. It is triggered after the borrower authorizes the soft credit review. The tool lets the borrower explore purchase price and down payment scenarios, see how their numbers compare against typical guideline ranges, and submit for a formal eligibility review.

The tool is a display panel — not a standalone app. It renders alongside the Ailana avatar/chat interface. The borrower interacts with sliders; Ailana narrates the changes by voice or text. All computed figures appear on screen. Ailana never vocalizes specific dollar amounts, ratios, or scores.


SECTION 1 — ENTRY FLOW
1.1 Trigger conditions
The tool renders when ALL of the following are true:

Borrower has accepted the eligibility review (Stage 2 or Stage 3 closing transition prompt)
Q45 contact capture is complete (email + mobile collected)
Formal soft pull consent disclosure has been presented and accepted
Soft credit review has returned data
Application prepopulation has completed
1.2 Prepopulation
The soft credit pull populates the following fields automatically. Ailana tells the borrower: "I've prefilled about 90% of your application automatically."

Fields prepopulated from soft credit pull:

Outstanding debt obligations (credit cards, auto loans, student loans, installment loans)
Estimated credit score tier (for band calculation — not displayed as a raw score)
Monthly minimum payments (pulled from tradeline data)

Fields seeded from borrower's conversational answers:

Target purchase price (from Q41 answer) → seeds the purchase price slider default
Down payment amount (from Q38 answer) → seeds the down payment slider default
Gross annual income (from Q35 answer) → converted to monthly for DTI calculation
Occupancy type (from Q10) → determines program context
Property type (from Q42) → affects program eligibility display
Co-borrower present (from Q13) → income and debt aggregation
Military/VA eligible (from Q43) → determines mortgage insurance line behavior
Transaction type (from Q9 TT flag) → determines which eligibility matrix rows apply

Fields the borrower provides conversationally if not already captured:

Income correction (Q58 — borrower can update stated income in conversation)
1.3 What Ailana says when the panel appears
Scripted formulation Q46 (mandatory — do not substitute):

"Thank you for your patience, [Name] — your initial results are in, and I've placed your affordability summary on your screen. It brings together the income and savings targets you shared with me and the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?"


SECTION 2 — PANEL LAYOUT AND DISPLAY FIELDS
2.1 Panel structure
┌─────────────────────────────────────────────────────┐
│  YOUR AFFORDABILITY SUMMARY                          │
│  [Permanent disclosure bar — always visible]        │
├─────────────────────────────────────────────────────┤
│  INCOME                    [within typical range]   │
│  DTI (Debt-to-Income)      [within typical range]   │
│  ESTIMATED PAYMENT         $X,XXX/mo                │
│  MORTGAGE INSURANCE        $XXX/mo (or $0)          │
├─────────────────────────────────────────────────────┤
│  SCENARIO EXPLORER                                   │
│  Target Purchase Price  [$________]  ◄──────────►  │
│  Down Payment           [$________]  ◄──────────►  │
├─────────────────────────────────────────────────────┤
│  [SUBMIT FOR REVIEW]  ← always enabled, never gated │
└─────────────────────────────────────────────────────┘
2.2 Permanent disclosure bar
Displayed at the top of the panel. Never hidden, collapsed, or removable.

Text (exact, non-negotiable):

"This is an educational estimate, not a loan decision or offer of credit."

Style: Muted but legible. Not alarming. Not buried. Treat as a permanent label, not a warning.
2.3 INCOME band
Label: INCOME Value: Not displayed as a dollar figure. Displayed as a status band only. Status bands (exactly two — no other options):

within typical range (green indicator)
above typical range (amber indicator)

Calculation logic:

Monthly gross income = Q35 answer ÷ 12
"Typical range" reference: monthly income sufficient to support the current scenario's estimated payment at a front-end DTI of 28% or lower
If monthly income / estimated PITIA payment ≥ 28% coverage → "within typical range"
If monthly income / estimated PITIA payment < 28% coverage → "above typical range"
Note: This is a directional indicator only — not a formal front-end DTI underwriting test

Compliance: Ailana never vocalizes the dollar income figure or the computed ratio. She narrates direction only ("moved into the typical guideline range").
2.4 DTI (Debt-to-Income) band
Label: DTI (Debt-to-Income) Value: Not displayed as a percentage. Displayed as a status band only. Status bands: Same two-label system as INCOME band.

Calculation logic:

Total monthly debt = credit pull tradeline minimum payments + estimated new PITIA payment
Gross monthly income = Q35 answer ÷ 12
DTI = total monthly debt ÷ gross monthly income
"Within typical range" threshold: DTI ≤ 45% (covers most DU/LPA program guidelines)
"Above typical range": DTI > 45%
Hard ceiling reference: 50% (FHLMC hard ceiling from Table 1 — scenario above 50% should note in Ailana's narration that this is outside most program guidelines, but submit button remains enabled)

Compliance: Ailana narrates direction of change only ("your total debt ratio moved into/above the typical guideline range"). Never vocalizes the computed DTI percentage.
2.5 ESTIMATED MONTHLY PAYMENT
Label: ESTIMATED PAYMENT Value: Displayed as a dollar figure on screen. Ailana does not vocalize this figure. Format: $X,XXX/mo

Calculation logic:

Loan amount = purchase price slider value − down payment slider value
Monthly principal + interest = standard amortization formula using:
Loan amount
Representative rate (see Section 4 — Rate Configuration)
Term: 30-year fixed (default for all scenarios unless borrower has indicated otherwise)
Add estimated property tax: 1.2% of purchase price ÷ 12 (national average placeholder — lender configurable)
Add estimated homeowners insurance: 0.5% of purchase price ÷ 12 (national average placeholder — lender configurable)
Add mortgage insurance (see Section 2.6)
Total PITIA displayed as the estimated monthly payment

Updates: Recalculates in real time on every slider change. No debounce below 300ms (smooth slider feel).
2.6 MORTGAGE INSURANCE line
Label: MORTGAGE INSURANCE Value: Displayed as dollar figure per month, or $0. Ailana does not vocalize this figure.

Program-aware logic — determined by occupancy (Q10), military flag (Q43), and loan type context:

Scenario
MI line behavior
Conventional, LTV ≤ 80% (down payment ≥ 20%)
$0 — PMI not required
Conventional, LTV > 80%
PMI estimate: 0.85% of loan amount ÷ 12 (national average; lender configurable)
FHA
MIP: 0.55% of loan amount ÷ 12 (current annual MIP for most FHA loans 2026)
VA eligible (Q43 flagged veteran)
Funding Fee: one-time, not monthly — display as "$0/mo — one-time funding fee applies at closing"
USDA
Annual fee: 0.35% of loan amount ÷ 12
Conventional, LTV dropping through 80% as slider moves
Line drops to $0 in real time — Ailana narrates this change per Q48 MI variant


Program determination: Use the transaction type flag (TT-PUR, TT-REF etc.) and the Q43 veteran flag. Default to conventional PMI logic unless VA or FHA is specifically flagged. FHA flag is set if borrower indicated FHA in the loan-type sub-track (TT-REF flow) or if income/credit profile strongly suggests FHA is the relevant program — in ambiguous cases, default to conventional logic.
2.7 Submit for review button
Label: "Submit for review" Behavior:

Always enabled. Never disabled, grayed out, hidden, or gated by band status.
Displayed prominently at the bottom of the panel.
Clicking/tapping triggers the AUS submission flow (Section 3).

Compliance (mandatory): The submit button must remain enabled regardless of what the DTI or income bands show. This is a Regulation B non-discouragement requirement. Any implementation that disables or hides the button based on band status is a compliance violation.


SECTION 3 — SUBMIT AND AUS FLOW
3.1 What happens on submit
Borrower taps "Submit for review"
Panel enters loading state — submit button shows spinner, label changes to "Reviewing..."
If >10 seconds elapse, Ailana delivers RFD-LOADING formulation:

"Your eligibility review is processing right now — these reviews typically take just a moment, but occasionally take a little longer depending on system volume. Please hold on — I'll have your results for you shortly."

AUS submission package is sent (see 3.2)
AUS returns findings
Ailana delivers FD1, FD1-alt, or FD2 per tenant configuration
3.2 AUS submission package fields
The following fields are packaged and submitted to the AUS (DU or LPA via Encompass Developer Connect API — MISMO 3.4 format):

From soft credit pull:

Credit score (middle score of all borrowers)
Outstanding liabilities and monthly payments
Derogatory history flags

From borrower's conversational answers:

Gross monthly income (Q35)
Employment type (Q44)
Self-employed flag (Q20 or Q44)
Co-borrower income if applicable (Q13 + Q35)
Down payment amount (slider value at submission)
Target purchase price (slider value at submission)
Occupancy type (Q10)
Property type (Q42)
Transaction type (Q9 flag)

From system:

Representative rate (from rate configuration — see Section 4)
Loan amount (purchase price − down payment at submission)
LTV (loan amount ÷ purchase price)
Estimated DTI (calculated per Section 2.4 logic)
Estimated PITIA (calculated per Section 2.5 logic)
3.3 AUS findings delivery
FD1 — Approve/Eligible (auto-send mode, platform default):

Estimated payment range displayed on panel (updated with AUS-confirmed figures)
Pre-qualification letter emailed to borrower's Q45 email address
Ailana delivers FD1 formulation

FD1-alt — Approve/Eligible (MLO-review mode, tenant option):

Same as FD1 but letter held for MLO review before email send
Ailana delivers FD1-alt formulation

FD2 — Refer:

Panel does not update with a payment range
MLO routing initiated
Ailana delivers FD2 formulation
No denial language, no reason cited

All findings events logged to audit trail — see Section 5.


SECTION 4 — RATE CONFIGURATION
4.1 Representative rate
The affordability panel uses a single hardcoded representative rate to compute estimated payments. This rate is maintained manually by ConvergentAI and updated on a defined cadence.

Current rate configuration:

representative_rate: [TO BE SET BY CONVERGENTAI — insert current rate here]
rate_type: 30-year fixed conventional
effective_date: [date last updated]
next_review_date: [scheduled review]
update_owner: [designated ConvergentAI team member]

Update protocol:

Review weekly or when market rates move more than 50 basis points
Update requires: (1) change the rate value, (2) update effective_date, (3) set next_review_date, (4) deploy to production
No borrower-facing announcement needed — rate is presented as "a current representative rate from our rate sheet," not a locked or committed rate

Important: The rate is used for educational payment estimation only. It is not a rate quote, rate lock, or commitment. The AUS submission uses this rate to return an estimated payment range — the actual rate is set by the licensed loan officer at formal application.
4.2 Typical range thresholds
The "within typical range" / "above typical range" band thresholds are also configurable:

income_band_threshold_dti: 0.28 (front-end; scenario payment ≤ 28% of gross monthly income)
dti_band_threshold: 0.45 (total back-end DTI)
dti_hard_ceiling_reference: 0.50 (FHLMC hard ceiling; narration changes above this level)
update_owner: [designated ConvergentAI team member]


SECTION 5 — AUDIT LOG REQUIREMENTS
Every event in the affordability tool flow must be written to the audit log for fair lending monitoring. This is a compliance requirement, not optional.
5.1 Events that must be logged
Event
Fields to log
Panel rendered
session_id, timestamp, borrower_name, transaction_type, initial_purchase_price, initial_down_payment, initial_dti_band, initial_income_band
Slider changed
session_id, timestamp, slider_type (purchase_price or down_payment), previous_value, new_value, resulting_dti_band, resulting_income_band, resulting_estimated_payment
Band status change
session_id, timestamp, band (income or DTI), previous_status, new_status
Submit clicked
session_id, timestamp, purchase_price_at_submission, down_payment_at_submission, loan_amount_at_submission, ltv_at_submission, estimated_dti_at_submission
AUS result received
session_id, timestamp, finding_type (Approve/Eligible or Refer), time_to_result_ms
Pre-qual letter issued
session_id, timestamp, letter_id, mlo_name, mlo_nmls, expiration_date, delivery_method
Drop-off
session_id, timestamp, last_panel_state, drop_off_stage
Scenario summary email sent
session_id, timestamp, recipient_email

5.2 Log retention
Retain audit logs for a minimum of 3 years per ECOA/Regulation B record retention requirements. Consult legal counsel on jurisdiction-specific requirements.


SECTION 6 — SESSION PERSISTENCE
6.1 Session save behavior
Per Q52: "Your session is securely saved, so whenever you're ready, you can pick up right where you left off."

Implementation requirements:

Session state saved server-side (not client-side/localStorage — see note below)
Save triggered: on every slider change, on panel render, on submit, on drop-off
Session identified by: session_id linked to Q45 email and/or mobile
Session expiry: 30 days from last activity (configurable per tenant)
On return: panel restores to last saved slider positions and band states

Note on client-side storage: Do not use browser localStorage or sessionStorage for session persistence. These are cleared on browser close and are not appropriate for financial data. Use server-side session storage linked to the borrower's contact information captured at Q45.
6.2 Scenario summary email
When borrower declines to submit but accepts the email summary (Q52), send an email containing:

Borrower's name
Date of session
Purchase price explored (final slider value)
Down payment explored (final slider value)
Estimated monthly payment at that scenario (from panel calculation)
Band status at that scenario (income and DTI — text labels only, no figures)
Call-to-action: link to resume session or schedule MLO callback
Disclosure: "This is an educational summary, not a loan decision or offer of credit."
Lending institution name and contact

Do not include in the email: Credit score, specific DTI percentage, income figures, or any language implying a credit decision.


SECTION 7 — PRE-QUALIFICATION LETTER
7.1 Required template elements (per Compliance Item 15)
The pre-qualification letter must include:

Title: "Pre-Qualification Letter" (not "Pre-Approval" — mandatory)
Conditioned language: "Based on the information provided, [Borrower Name] appears conditionally eligible for a mortgage up to..."
Maximum qualified amount: based on AUS findings
Expiration date: 90 days from issuance (configurable per tenant as [LETTER_VALIDITY])
Lending institution name and address
Assigned licensed loan officer: full name + NMLS number
Date of issuance
7.2 What must NOT appear on the letter
Interest rate (any rate — even "approximately")
Monthly payment estimate
Any language implying final approval or commitment to lend
Language from Ailana as the issuing entity (Ailana delivers, the lending institution issues)
7.3 Delivery
Delivered via email to Q45 email address
Requires E-SIGN consent (captured in the soft pull consent disclosure flow)
PDF format preferred; HTML acceptable as fallback
Every issuance logged to audit trail (session_id, letter_id, MLO name, NMLS, timestamp, recipient)
7.4 Issuance modes (tenant-configurable)
Auto-send (platform default): Letter generated and emailed automatically on Approve/Eligible finding. Ailana delivers FD1.

MLO-review mode (tenant option): Letter generated but held. MLO receives notification to review before release. Ailana delivers FD1-alt: "Your licensed loan officer is putting the final review on your pre-qualification letter right now — it will be in your inbox shortly."


SECTION 8 — COMPLIANCE REQUIREMENTS SUMMARY
Requirement
Implementation
Permanent disclosure visible
"This is an educational estimate, not a loan decision or offer of credit" — always visible, never removable
Submit button always enabled
No gating by band status — Regulation B non-discouragement
No figures vocalized by Ailana
All dollar amounts, ratios, and scores on screen only — Ailana narrates direction only
Two-label band system only
"within typical range" / "above typical range" — no pass/fail/approved/denied
Credit data not consumer-adjustable
Debt figures from credit pull locked; income correctable conversationally only
AI identity
Ailana must identify as AI if asked during this flow — session opening greeting applies
Pre-qual letter title
Must say "Pre-Qualification" — never "Pre-Approval"
Pre-qual letter rate
No rate on the letter
Audit log
Every panel event logged — required for fair lending monitoring
E-SIGN consent
Required before pre-qual letter can be delivered by email
TRID posture
SSN and property address not collected in this flow — four-of-six maximum maintained
Q9-TRID-GATE
If borrower volunteers SSN or property address during this flow, mandatory formulation applies



SECTION 9 — OPEN ITEMS FOR PRODUCT DECISION
These items were not resolved in the design session and require a product decision before the dev team can finalize implementation:

Purchase price slider range and step: Recommended $100K–$2M in $5K increments. Confirm or adjust.

Property tax and homeowners insurance estimates: Currently set at national averages (1.2% and 0.5% of purchase price annually). Lenders in high-tax states (NJ, IL, TX) will produce materially understated payments with these defaults. Options: (a) use lender-configurable values per deployment, (b) use a zip-code-based lookup, (c) disclose clearly as estimates and leave as-is.

PMI rate: Currently 0.85% national average. Actual PMI varies by credit score, LTV, and PMI provider. Options: (a) use the 0.85% flat rate clearly labeled as an estimate, (b) use a tiered rate from the LLPA pricing tiers in Table 1.

FHA flag determination: When should the panel switch from conventional PMI logic to FHA MIP logic? Recommended: only when the borrower has explicitly identified an FHA loan intent in the conversation. Confirm.

Session expiry: Currently set at 30 days. Confirm with legal whether this aligns with data retention and privacy policy.

Q49 counsel review: The proactive submission invitation (Q49) is flagged for legal review before production. Confirm clearance before deploying this formulation in live sessions.



Document prepared for ConvergentAI | Ailana Platform — Affordability Tool Build Specification Version 1.0 — July 2026 Dev team reference: v8.4 Master formulations document (Drive ID: 1lZ_LseIYkgS8Y4cqvAkQm3TFLhVsN55ayYO_sniUi3g)


SECTION 10 — MOBILE WEB DESIGN
10.1 Overview
The affordability tool must work across three mobile engagement modalities: avatar video call, text/chat, and voice/phone only. Each requires a different screen configuration. A single layout cannot serve all three — the tool must detect the active modality and adapt accordingly.

Minimum supported viewport: 375px width (iPhone SE / standard Android small). All layouts must be responsive down to this minimum. All interactive elements must meet WCAG 2.1 AA touch target minimums (44x44px minimum hit area).


10.2 Modality 1 — Avatar video call (most constrained)
The problem: A 375px screen cannot show a full-size avatar and an interactive panel simultaneously. Attempting a split layout at this width produces unusable UI for both.

Solution: Picture-in-Picture (PiP) avatar when panel opens

When Stage 2.5 is reached and the affordability panel is ready to render:

Ailana delivers Q46 formulation by voice
A "Review my options" button appears below the avatar
Borrower taps the button
Avatar shrinks to a PiP overlay (~80x80px, draggable, positioned bottom-right by default)
Affordability panel takes 100% of screen width and height
Voice connection remains active — borrower can still hear and speak to Ailana while exploring the panel
Borrower taps PiP at any time to restore full avatar view (panel minimizes to a bottom sheet handle)

PiP overlay spec:

Size: 80x80px minimum
Position: bottom-right corner, 16px margin from edges, draggable by borrower
Contains: Ailana avatar thumbnail, animated speaking indicator when Ailana is speaking
Tap behavior: restores full avatar, panel transitions to bottom sheet (scrolls up from bottom, partial overlay)
Accessibility: labeled "Ailana — tap to restore" for screen readers

Restore behavior (panel → avatar):

Bottom sheet handle visible at bottom of screen when avatar is restored
Borrower taps handle or swipes up to re-open panel full screen
Panel state is preserved — sliders remain at last position


10.3 Modality 2 — Text/chat (simplest mobile layout)
No avatar competing for screen space. This is the least constrained mobile case.

Layout: Panel renders as an inline card embedded in the chat thread when Stage 2.5 is reached. The card appears after Ailana's Q46 message.

Behavior:

Chat thread scrolls up above the panel card
Borrower scrolls down to the panel card and interacts with sliders
Slider changes update the panel card in place (no page reload)
Ailana's next chat message narrates the result of the submitted review
Full 375px+ width available for the panel card

No special layout required beyond standard responsive panel design. This modality works with the base panel spec from Section 2.


10.4 Modality 3 — Voice/phone only (no screen)
The problem: The borrower is on a phone call with no screen interaction. The panel cannot be displayed.

Solution: Conversational Stage 2.5 — server-side computation, voice narration only

The panel never renders. All Stage 2.5 logic runs server-side and results are delivered by voice and optionally by email.

Conversational flow (replaces panel entirely for voice-only sessions):

Step 1 — Collect scenario inputs verbally: Ailana: "To give you a meaningful picture of what you may qualify for, let me ask you two quick questions. What purchase price range are you thinking — even a rough number is fine?" [Borrower answers — Ailana captures the figure] Ailana: "And how much are you thinking for a down payment?" [Borrower answers — Ailana captures the figure]

Step 2 — Compute server-side: Same calculation logic as the panel (Section 2.5 and 2.6):

Loan amount = stated purchase price − stated down payment
Estimated PITIA using representative rate + property tax/insurance estimates
DTI = (credit pull debts + estimated PITIA) ÷ gross monthly income
Mortgage insurance per program-aware logic

Step 3 — Narrate result (band status only — no dollar figures vocalized): Within range: "Based on what you've shared, that scenario sits within typical program guideline ranges. Would you like me to submit this for a formal eligibility review? It does not affect your credit score." Above range: "Based on what you've shared, that scenario is above typical program guideline ranges — but you can absolutely still submit for the formal eligibility review and see what comes back. Would you like to do that?"

Step 4 — Submit verbally: Borrower says yes → same AUS submission package as Section 3.2 → findings returned Ailana narrates finding: "Your review came back — [FD1 or FD2 formulation adapted for voice, no screen references]" Ailana offers: "I can send you the full results and your pre-qualification letter by email. What's the best email address for you?"

Key implementation requirement: The Stage 2.5 code must have two execution paths:

PANEL_MODE: renders the UI panel (avatar video + text/chat modalities)
VOICE_MODE: skips UI rendering, runs calculations server-side, returns narration strings

The session.modality flag (set at session start based on how the borrower connected) determines which path executes.


10.5 Mobile-specific component requirements
These requirements apply to all mobile layouts where the panel is rendered (Modalities 1 and 2):

Sliders:

Thumb (draggable handle): minimum 44x44px touch target — visually can be smaller but hit area must be 44px
Track height: minimum 4px visual, 44px touch area (extend above and below track)
Pair each slider with a large editable number input field above it (purchase price: dollar input; down payment: dollar input)
Input field allows direct keyboard entry as a precision fallback — updates slider position and panel values in sync
On mobile, tapping the input field opens the numeric keyboard automatically (inputmode="numeric")

Submit button:

Position: sticky footer, fixed to bottom of viewport
Always visible without scrolling — borrower never hunts for it
Height: minimum 52px (comfortable thumb target)
Full width minus 32px margins (16px each side)
Never disabled, never grayed out (Regulation B — same as desktop)
Label: "Submit for review" — does not change based on band status

Disclosure banner:

Position: top of panel, below any navigation chrome
Height: compact — one line preferred, two lines maximum
Font size: minimum 12px (legible but not dominant)
Never collapsible, never dismissible

Band indicators:

Render as full-width rows with clear label + status on one line
"within typical range" → green left border or green badge
"above typical range" → amber left border or amber badge
No red — red implies denial (compliance requirement)
Minimum row height: 48px (comfortable reading and tapping)

Panel scroll behavior:

Panel content must be fully scrollable vertically
Submit button remains sticky at bottom regardless of scroll position
On phones below 667px height, the panel will require scrolling to see all content — this is acceptable
Smooth scroll behavior; no abrupt jumps when sliders update values

Estimated payment and mortgage insurance:

Display as large, readable figures — these are the numbers borrowers care about most
Suggested size: 24px bold for payment amount, 16px regular for MI amount
Update smoothly on slider change (CSS transition 200ms)


10.6 Mobile layout summary by modality
Feature
Avatar video
Text/chat
Voice only
Panel rendered
Yes (full screen, avatar to PiP)
Yes (inline card in chat)
No
Avatar visible
PiP corner overlay
No
No
Sliders interactive
Yes
Yes
No — verbal input
Figures on screen
Yes
Yes
No — narrated band status only
Submit button
Sticky footer
Bottom of card
Verbal confirmation
Results delivery
On screen + email
Chat message + email
Voice narration + email
Session save
Yes
Yes
Yes (linked to email captured at Q45)



10.7 Addition to open items (Section 9)
Open item 7 — PiP avatar implementation: Confirm that LemonSlice Flash (current avatar provider) supports picture-in-picture or windowed avatar mode in a mobile web context. If PiP is not natively supported by the avatar SDK, the alternative is to pause the avatar video feed while the panel is open and resume on return — borrower hears Ailana's voice throughout, avatar video is paused rather than minimized.

Open item 8 — Voice modality detection: Define how session.modality is set at session start. Recommended: set to VOICE_MODE when the session is initiated via the telephony channel (FSPBX/FusionPBX); set to PANEL_MODE when initiated via web or mobile web browser. Confirm this logic with the dev team.

