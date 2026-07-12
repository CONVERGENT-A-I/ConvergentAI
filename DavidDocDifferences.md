# Summary of Differences: DavidNEWDoc.md (v7.0) vs. DavidNEWDoc2.md (v8.3)

This document highlights the major structural, architectural, and content differences between the old document ([DavidNEWDoc.md](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/DavidNEWDoc.md) v7.0) and the new document ([DavidNEWDoc2.md](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/DavidNEWDoc2.md) v8.3).

---

## 1. Core Structural & Architectural Differences

*   **Multi-Track System (Transaction Type Routing)**:
    *   **v7.0**: Contained a single sequential flow of questions (Q1–Q64) focusing entirely on **Home Purchases**.
    *   **v8.3**: Introduces a dynamic routing architecture. On start, the system tracks a `transaction_type` flag in the session state (Layer 4). Based on the borrower's intent confirmed at Q9, it routes the conversation to one of five independent tracks:
        1.  **Purchase Track (TT-PUR)** (Stages 2, 2.5, 3)
        2.  **Refinance Track (TT-REF)** (Stages 2, 3)
        3.  **HELOC Track (TT-HEL)** (Stages 2, 3)
        4.  **Home Equity Loan Track (TT-HEQ)** (Stages 2, 3)
        5.  **Construction Track (TT-CON)** (Routes directly to a licensed loan officer)
*   **Stage 2.5 — Affordability Scenario Review (NEW)**:
    *   **v7.0**: Had no such stage.
    *   **v8.3**: Adds a new interactive stage (Stage 2.5) for the Purchase track, allowing users to adjust sliders (target purchase price and down payment) and see dynamic updates in an on-screen "affordability panel." This stage includes specific compliance rules (e.g., Ailana cannot recommend target values, must keep the submit button enabled, and must not vocalize numeric figures).
*   **Findings Delivery (FD) System (NEW)**:
    *   **v7.0**: Had no structured script for delivering findings.
    *   **v8.3**: Adds explicit findings delivery dialogs depending on the track:
        *   *Purchase (TT-PUR)*: **FD1** (Approve/Eligible - Auto-send), **FD1-alt** (Approve/Eligible - MLO review), and **FD2** (Refer findings).
        *   *Refinance (TT-REF)*: **RFD1** (Conditional eligibility), **RFD2** (Refer findings).
        *   *HELOC (TT-HEL)*: **HFD1** (Conditional credit line approval), **HFD2** (Refer findings).
        *   *Home Equity Loan (TT-HEQ)*: **EFD1** (Conditional approval), **EFD2** (Refer findings).
*   **Short Variants & Delivered Flags Mechanism (NEW)**:
    *   **v7.0**: Had no mechanism to shorten repeating responses.
    *   **v8.3**: Adds state flags (`eligibility_review_explained`, `credit_impact_stated`, `pmi_explained`, `transition_pitch_delivered`). If a block has already been delivered, Ailana automatically swaps to its "Short Variant" to avoid redundancy (e.g., shorter explanation of credit impact or mortgage insurance).

---

## 2. Terminology Updates

*   **Role Standardization**:
    *   Throughout **v8.3**, all occurrences of **"licensed advisor"** and **"licensed mortgage advisor"** have been replaced with **"licensed loan officer"** for consistent and regulatory precision.

---

## 3. Question-by-Question Content Changes

### Stage 1 (Shared across all tracks)
*   **Session Opening Greeting**:
    *   **v7.0**: `"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?"`
    *   **v8.3**: `"Hi!, I'm Ailana, your AI mortgage assistant. Whether you are purchasing a home or refinancing an existing mortgage, I'm here to make your journey clearer and smoother. You can connect with me via text chat or AI-voice, and I can bridge you directly to a licensed loan officer whenever you're ready. To get started, what mortgage questions do you have for me today?"`
*   **Q5 ("How does this process work?")**:
    *   **v8.3** updates the text to encompass both purchases and refinancing, framing the next step around validating scenarios and providing conditional eligibility feedback in minutes.
*   **Q9 (Intent Discovery & Router)**:
    *   **v7.0**: A simple question asking what brings the borrower in today (purchase, refinance, or home equity).
    *   **v8.3**: Adds **First Name Capture** (`"Before we dive in, may I ask your first name?"`) and turns Q9 into a full transaction-type router. It listens for specific keywords (triggers) for Purchase, Refinance, HELOC, Home Equity Loan, and Construction, confirms the choice, and sets the `transaction_type` flag.
*   **Q10–Q13**: Retained in both, but formatted to follow the new label style (`Borrower → Ailana` and `Ailana → Borrower`).

---

## 4. Detailed Differences by Track

### A. Purchase Track (TT-PUR)
*   **Stage 2 (Q14–Q44)**:
    *   Mostly identical to v7.0 Stage 2, with the following modifications:
        *   **Q14**: Mentions that the borrower can use the new "Affordability tool" to compare options.
        *   **Q17**: The credit impact response is updated to highlight the benefit of credit checks (pre-filling application data and building the affordability summary).
        *   **Q22**: Adds a delivery note setting the `pmi_explained` flag to enable the short variant for future questions (like Q53).
        *   **Q35**: Adds context reminder to emphasize gross (pre-tax) income rather than take-home pay.
        *   **Q38 & Q41**: Adds context that these figures seed the starting positions in the Stage 2.5 affordability panel.
        *   **Stage 2 Closing Transition Prompt**: Rewritten to pitches the soft credit pull, application pre-population, and Stage 2.5 affordability explorer benefits.
        *   **Q45 (NEW)**: Captures contact information (email and mobile phone) at the consent transition. Explains that this is used to securely save findings and documents. Maps E-SIGN and TCPA consent rules.
*   **Stage 2.5 (Q46–Q58) (NEW)**:
    *   Completely new section detailing how Ailana interacts with the affordability panel:
        *   **Q46**: Presents the affordability summary.
        *   **Q47**: Invites scenario adjustment.
        *   **Q48**: Narrates slider changes (directional only, no exact figures vocalized).
        *   **Q49**: Proactive submission invitation (under typical range).
        *   **Q50**: Proactive check-in (when scenario is above typical range).
        *   **Q51**: Routes complex/out-of-scope profiles to a licensed loan officer.
        *   **Q52**: Handles drop-offs gracefully (saves progress, offers summary email).
        *   **Q53**: Explains mortgage insurance (PMI vs. MIP vs. VA funding fee) relative to the screen.
        *   **Q54**: Clarifies that the summary is not an approval.
        *   **Q55**: Strictly refuses to recommend specific purchase price numbers (SAFE Act boundary).
        *   **Q56**: Explains credit score source/variance.
        *   **Q57**: Explains what "Submit for review" does.
        *   **Q58**: Explains correctable income/debts vs credit-bureau verified debts.
*   **Stage 3 (Q59–Q78)**:
    *   corresponds to Q45–Q64 in v7.0 (renumbered).
    *   **Q60, Q61**: Updated to utilize short variants if `eligibility_review_explained` is set.
    *   **Stage 3 Closing Transition Prompt (Purchase)**: Rewritten around the pre-population benefits and includes both a short variant and a full version.

### B. Refinance Track (TT-REF) (NEW)
*   **RQ14–RQ65**: Entirely new track focusing on refinancing.
    *   **Stage 2 (RQ14–RQ29)**: Discovers borrower's refinance goals (rate reduction, cash out, term change, ARM to fixed). Asks for existing mortgage rate, outstanding balance, estimated home value, current payment, remaining years, and cash-out details.
    *   **Stage 2 Closing Transition Prompt**: Invites soft pull credit check and eligibility review for refinancing.
    *   **Stage 3 (RQ30–RQ35)**: Educates on refinance rates, closing costs, break-even analysis (with a hypothetical example), appraisal waivers (Property Inspection Waivers / Automated Collateral Evaluations), rate-and-term vs cash-out, and term options.
    *   **Findings Delivery**: **RFD1** (Conditional eligibility, displays payment comparison on screen, no pre-qual letter) and **RFD2** (Refer findings to a licensed loan officer).

### C. HELOC Track (TT-HEL) (NEW)
*   **HQ14–HQ55**: Entirely new track focusing on Home Equity Lines of Credit.
    *   **Stage 2 (HQ14–HQ26)**: Discovers current home value, outstanding mortgage balance, desired credit line amount, draw purpose, variable rate comfort, and urgency timeline. Educates on variable rates, draw vs repayment periods (5-10 yr draw, 10-20 yr repayment), CLTV limits (typically 80-90%), and interest tax-deductibility guidelines.
    *   **Stage 2 Closing Transition Prompt**: Prompts for soft review to check conditional HELOC limits.
    *   **Stage 3 (HQ27–HQ30)**: Explains HELOC timelines (2-6 weeks), credit line freeze/reduction risks if home values drop, early payoff and termination fees, and calculates a CLTV example.
    *   **Findings Delivery**: **HFD1** (Conditional credit line approval on screen, no pre-qual letter) and **HFD2** (Refer findings to a licensed loan officer).

### D. Home Equity Loan Track (TT-HEQ) (NEW)
*   **EQ14–EQ50**: Entirely new track focusing on fixed lump-sum home equity loans.
    *   Shares Stage 2 questions (EQ14–EQ19 and EQ20–EQ26) with HELOC, but substitutes specific variants:
        *   **EQ15 (HE Loan vs HELOC)**: Educates on lump sum fixed rate/payment vs revolving variable line.
        *   **EQ17**: Explains fixed interest rate and payment mechanics.
        *   **EQ18**: Explains repayment in equal installments (no draw/interest-only phase).
        *   **EQ25**: Screens borrower's preference for fixed monthly payments.
    *   **Stage 3**: Explains how CLTV applies to a fixed lump sum (EQ30).
    *   **Findings Delivery**: **EFD1** (Conditional approval of lump sum, on-screen only) and **EFD2** (Refer findings).

### E. Construction Track (TT-CON) (NEW)
*   **Bridge Routing**: Reserved for v8.4. In v8.3, if a construction loan request is detected, Ailana outputs a mandatory scripted bridge response and routes the user directly to a specialized licensed loan officer.

---

## 5. Compliance Reference Summary Additions

The compliance section has been expanded from **8 rules** in v7.0 to **21 rules** in v8.3. The 13 new rules are:
*   **Rule 9 (On-screen figure display)**: Financial details (Stage 2.5) are displayed on the panel, never spoken by Ailana. Narration must remain directional.
*   **Rule 10 (Neutral band language)**: Affordability status must only use "within typical range" or "above typical range." Rejection/denial language is forbidden.
*   **Rule 11 (Consumer-driven exploration)**: Sliders must be moved by the borrower. Ailana must not suggest target figures (SAFE Act boundary).
*   **Rule 12 (Unconditional submission availability)**: Gating or disabling the "Submit for review" button is prohibited.
*   **Rule 13 (Out-of-scope routing & adverse action)**: Referrals to MLOs must use positive/neutral framing. Formal adverse action notices remain under lender responsibility.
*   **Rule 14 (Contact capture & consents)**: Capturing email/phone requires TCPA & E-SIGN consents inside the separate disclosure. Declining does not block the eligibility review.
*   **Rule 15 (Pre-qualification letter requirements)**: Applies *only* to the Purchase track. Must be issued under a licensed loan officer's name/NMLS and valid for a set time (default 90 days), with no interest rate.
*   **Rule 16 (Short variants)**: Compressed versions of text must still retain necessary compliance phrasing.
*   **Rule 17 (Transaction type routing)**: Ailana must confirm transaction type before activating a track.
*   **Rule 18 (HELOC/HE Loan rate prohibition)**: The rate prohibition holds across all new tracks; no rates or margins can be quoted.
*   **Rule 19 (HELOC consumer disclosures)**: Variable rate risk, repayment transition payment hikes, and line freeze risks must be proactively disclosed for UDAAP.
*   **Rule 20 (Non-purchase findings delivery)**: Refinance, HELOC, and HE Loans must not produce pre-qualification letters; results are display-only.
*   **Rule 21 (Construction track routing)**: ALL construction inquiries must bridge directly to an MLO.
