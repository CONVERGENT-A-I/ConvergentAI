# 🧪 9-Flow End-to-End Test Execution Log

This document records the official execution, verification checkpoints, and results for all 9 live test flows (3 runs per track) across **Refinance (`TT-REF`)**, **HELOC (`TT-HEL`)**, and **Purchase (`TT-PUR`)**.

---

## 📊 Summary Scorecard

| Test # | Track | Mode | Timestamp | Result | Highlights |
|---|---|---|---|---|---|
| **Test 1** | **Refinance (`TT-REF`)** | Verified (Path A) | 2026-09-03 10:47 AM | **PASS (100%)** | Full discovery, STT error recovery ($60k/mo payment), RQ28/RQ29 asked, OTP & CRS soft pull, Refinance Summary panel with payment delta, RFD1 findings, MLO transfer. |
| **Test 2** | **Refinance (`TT-REF`)** | Verified (Path A) | 2026-09-03 11:51 AM | **PASS (100%)** | USDA loan compliance (automatic rate & term, no cash-out), out-of-pocket closing costs, payment STT recovery ($30k -> $10k), Refinance Summary with $6,958/mo savings delta, RFD1 findings, live MLO handoff. |
| **Test 3** | **Refinance (`TT-REF`)** | Verified (Path A) | 2026-09-04 12:16 AM | **PASS (100%)** | Cash-out sub-track (`refiCO`), Conventional loan, RQ27 cash-out amount ($80k), 80% LTV cap enforcement (GAP-9), out-of-pocket closing costs, Cash-Out Refinance Summary panel, `isAtClosingOffer` loop bug found & fixed, RFD1 findings, MLO transfer. |
| **Test 4** | **HELOC / HE Loan (`TT-HEQ`)** | Verified (Path A) | 2026-09-03 11:21 AM | **PASS (100%)** | Fixed loan sub-track routing, EQ16 fixed risk disclosure, garage remodel use, OTP & CRS soft pull, Home Equity Loan Summary panel, EFD1 findings, 2-day LO callback. |
| **Test 5** | **HELOC (`TT-HEL` / `TT-HEQ`)** | Verified (Path A) | 2026-09-03 12:34 PM | **PASS (100%)** | Stage 1 bug-fix verification (0 premature jumps), fixed risk disclosure, flexible payment pivot, roof maintenance draw, CLTV 90.0% amber benchmark (+5.0%), HFD1 findings, 3-day LO callback. |
| **Test 6** | **HELOC (`TT-HEL`)** | Verified (Path A) | 2026-09-04 12:32 AM | **PASS (100%)** | Pure HELOC intent, investment property, debt consolidation, HQ16/HQ19 risk disclosure delivered proactively, HQ24 variable rate comfort, HQ25 prior HELOC, HQ26 timeline, HELOC Summary panel with 10->20yr repayment shock, HFD1 findings. |
| **Test 7** | **Purchase (`TT-PUR`)** | Verified (Path A) | 2026-09-03 11:38 AM | **PASS (100%)** | Complete 15-question discovery, self-employed tenure, OTP & CRS soft pull, Affordability Summary with PMI & Cash-to-Close, FD1 findings with 90-day pre-qual letter. |
| **Test 8** | **Purchase (`TT-PUR`)** | Verified (Path A) | 2026-09-04 12:41 AM | **PASS (100%)** | VA Purchase scenario, Q43 military veteran routing, VA program tab, VA funding fee (2.15%), townhouse, hourly employment, FD1 findings with pre-qual letter sent. |
| **Test 9** | **Purchase (`TT-PUR`)** | Verified (Path A) | 2026-09-04 10:38 AM | **PASS (100%)** | Multi-family home scenario, hourly employment ($15/hr, 4 yrs), $65k down on $550k target, OTP & CRS soft pull, Affordability Summary with VERIFIED badge, 88.2% LTV ($206/mo PMI), FD1 findings with 90-day pre-qual letter, 2-day 9 AM LO callback scheduled. |

> 🏆 **Overall Verification Status**: **9 of 9 Test Runs Completed — 100% Passing Across All Tracks (`TT-REF`, `TT-HEL`, `TT-HEQ`, `TT-PUR`)**

---

## 🔄 Test 1: Refinance Track (`TT-REF`) — Rate & Term (Run 1 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Steve
* **Transaction Goal**: Refinance (`TT-REF`) — Rate & Term
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 2-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$120,000` (`$10,000/mo`)
  * Monthly Debts: `$500/mo`
  * Stated Credit Score: `760`
  * Current Loan Type: Conventional
  * Property Value: `$450,000`
  * Current Balance: `$280,000` (LTV $\approx 62.2\%$)
  * Current Note Rate: `9.35%`
  * Current Payment: `$10,000/mo` (STT mis-statement gracefully clarified from `$60,000/yr`)
  * Remaining Term: `20 years`
  * Closing Costs Preference: Rolled into loan
  * Prior Refinance (`RQ28`): No
  * Stay Duration (`RQ29`): 5 years
  * Current Employer: Global tech (7 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `steve@gmail.com` | `555 123 55`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified "Uh, I want to refinance" to `TT-REF`. Collected occupancy, relationship, timeline, and co-borrower cleanly. |
| **Phase 2** | Discovery Sequence & Gaps | ✅ **PASS** | Collected all 12 core refi questions in correct order. Included new compliance fields: **`RQ28`** (prior refinance) and **`RQ29`** (stay duration). Zero purchase question leakage (no rent/own, realtor, down payment, military). |
| **Phase 2** | STT Error Handling | ✅ **PASS** | When borrower accidentally stated `$60,000`, Ailana gracefully re-asked with clarifying empathy without crashing the turn. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered exact v8.7 two-path offer script. Handled STT input `"sort, we'll check"` as Path A soft credit authorization. |
| **Phase 3A** | OTP & Soft Pull Prefill | ✅ **PASS** | Seamlessly executed name, contact, OTP, consent, and verified prefill confirmation without delays. |
| **Phase 3** | Refinance Summary Panel | ✅ **PASS** | Rendered `Refinance Summary` with `VERIFIED` badge, pre-selected `Conventional` tab, showed Home Value `$450,000`, Payoff `$280,000`, PITIA `$2,954/mo`, front-end DTI `29.5%`, back-end DTI `34.5%`, LTV `62.2%`. |
| **Phase 4** | Findings Delivery (`RFD1`) | ✅ **PASS** | Delivered exact **`RFD1`** script: conditional eligibility announcement, on-screen payment comparison reference, offered loan officer rate lock. **Zero pre-qualification letter mentioned or emailed** (compliant with Item 11). |
| **Phase 5** | Loan Officer Handoff | ✅ **PASS** | Borrower requested transfer ("connect me to a loan officer") $\rightarrow$ Instant SIP bridge to queue. When user closed the modal, Ailana gracefully re-engaged. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 🔄 Test 2: Refinance Track (`TT-REF`) — USDA Rate & Term with Out-of-Pocket Costs (Run 2 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Steve
* **Transaction Goal**: Refinance (`TT-REF`) — Rate & Term on Existing USDA Mortgage
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 5-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$180,000` (`$15,000/mo`)
  * Monthly Debts: `$700/mo`
  * Stated Credit Score: `690`
  * Current Loan Type: **USDA**
  * Property Value: `$490,000`
  * Current Balance: `$240,000` (LTV $\approx 49.0\%$)
  * Current Note Rate: `10.0%`
  * Current Payment: `$10,000/mo` (STT mis-statement gracefully clarified from `$30,000`)
  * Remaining Term: `15 years`
  * Closing Costs Preference: Paid out of pocket
  * Prior Refinance (`RQ28`): No
  * Stay Duration (`RQ29`): 5 years
  * Current Employer: Acme Tech (4 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `steve@gmail.com` | `5551234`
  * OTP: `123456`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified "I want to refinance my home" to `TT-REF`. Collected primary residence, first time, 5 months, and single applicant cleanly. |
| **Phase 2** | USDA Compliance Rule | ✅ **PASS** | When borrower identified existing loan as USDA, Ailana automatically handled the compliance rule: *"Since USDA loans don't allow for cash-out refinances, we'll focus on a rate-and-term option for you which just means changing your rate or the length of your loan without pulling equity."* Bypassed cash-out questions cleanly! |
| **Phase 2** | STT Error Recovery | ✅ **PASS** | When borrower said `$30,000` for monthly payment, Ailana politely checked: *"Did you say your monthly mortgage payment is thirty thousand dollars, or was that perhaps a different number?"* Accepted `$10,000` correction. |
| **Phase 2** | Discovery Sequence & Gaps | ✅ **PASS** | Asked all required fields in order, including **`RQ28`** (prior refinance: No), **`RQ29`** (stay duration: 5 years), and out-of-pocket closing costs. Zero purchase question leakage. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice cleanly. Recognized `"Go with the soft will check"` as Path A soft credit authorization. |
| **Phase 3A** | OTP & Soft Pull Prefill | ✅ **PASS** | Captured contact, validated OTP `123456`, obtained soft pull authorization, and confirmed prefill data seamlessly. |
| **Phase 3** | Refinance Summary Panel UI | ✅ **PASS** | Rendered `Refinance Summary` with `VERIFIED` badge. Showed Home Value `$490,000`, Payoff `$240,000`, New PITIA `$3,042/mo`, Monthly Savings Delta: **`Saves $6,958/mo`**, Front-End DTI `20.3%`, Back-End DTI `24.9%`, LTV `49.0%` (well under 80% guideline). |
| **Phase 4** | Findings Delivery (`RFD1`) | ✅ **PASS** | Borrower said `"Submit my review."` $\rightarrow$ Ailana delivered exact **`RFD1`** script: conditional eligibility announcement, on-screen payment comparison reference, and loan officer rate lock next steps. **Zero pre-qualification letters mentioned or issued.** |
| **Phase 5** | Loan Officer Handoff | ✅ **PASS** | Borrower requested `"Connect me to a loan officer."` $\rightarrow$ Live SIP bridge triggered instantly. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 💳 Test 4: HELOC Track (`TT-HEL` / `TT-HEQ`) — Home Equity Loan (Run 1 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Steve
* **Transaction Goal**: Home Equity Loan (`TT-HEQ`) — Fixed rate & payment option selected during HELOC triage
* **Property / Occupancy**: Secondary Home
* **Borrower Context**: First-time explorer, single applicant, 2-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$200,000` (`$16,667/mo`)
  * Monthly Debts: `$800/mo`
  * Stated Credit Score: `670`
  * Property Value: `$330,000`
  * Current 1st Mortgage Balance: `$150,000`
  * Desired Loan Amount: `$70,000`
  * Combined Loan-to-Value (CLTV): `($150k + $70k) / $330k = 66.7%` (Well within 85.0% guideline limit)
  * Draw / Fund Use: Build a garage
  * Prior Home Equity Loan on Property: No
  * Current Employer: Convergent ABC (7 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `Doom123@gmail.com` | `5512345` (Handled mobile clarification cleanly)
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing & Sub-track Branch | ✅ **PASS** | Borrower said "I want to get a he lock". Ailana asked line-of-credit vs. fixed loan triage. Borrower chose "fixed loan amount" $\rightarrow$ Cleanly routed to `TT-HEQ` (Fixed Home Equity Loan sub-track). |
| **Phase 1** | Context Gathering | ✅ **PASS** | Collected Secondary Home occupancy, first-time relationship, 2-month window, and single applicant cleanly. |
| **Phase 2** | Compliance Risk Disclosure (`EQ16`) | ✅ **PASS** | Delivered proactive fixed-rate collateral risk disclosure: *"because your home secures the loan, the lender has a lien on your property if you default. Your home equity loan carries a fixed rate and predictable payments, but that collateral risk applies."* Zero variable-rate risk confusion! |
| **Phase 2** | Discovery Sequence & Gaps | ✅ **PASS** | Captured income (`$200k`), debt (`$800`), credit (`670`), home value (`$330k`), 1st mortgage (`$150k`), loan amount (`$70k`), use of funds (`build my garage`), prior HE loan (`No`), and employer. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice tailored with "home equity summary" terminology. Borrower chose Path A soft pull. |
| **Phase 3A** | OTP Gate & Contact Validation | ✅ **PASS** | Promptly prompted for clean mobile number when initial string had format issues, verified OTP, and executed CRS soft pull. |
| **Phase 3** | Home Equity Loan Panel UI | ✅ **PASS** | Rendered **`Home Equity Loan Summary`** header with **`VERIFIED`** badge. Displayed Home Value `$330,000`, 2nd Loan Amount `$70,000`, Total Monthly Obligation `$2,895/mo` (1st Mtg `$1,895` + HE Loan `$649` + Taxes/Ins `$351`), Front-End DTI `17.4%`, Back-End DTI `22.2%`, CLTV `66.7%`. Provided fixed-rate and 10/15/20-yr term sliders. |
| **Phase 4** | Findings Delivery (`EFD1`) | ✅ **PASS** | Delivered exact **`EFD1`** script: conditional eligibility for a home equity loan, on-screen available loan amount, offered LO next steps. **Zero pre-qualification letters mentioned or issued.** |
| **Phase 5** | Loan Officer Callback Scheduling | ✅ **PASS** | Borrower requested: *"schedule my call back after 2 days at 9 AM"* $\rightarrow$ Ailana confirmed callback appointment for exactly 2 days at 9:00 AM and concluded session politely. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 💳 Test 5: HELOC Track (`TT-HEL` / `TT-HEQ`) — Primary Residence Roof Maintenance (Run 2 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Steve
* **Transaction Goal**: HELOC / Home Equity Loan (`TT-HEL` / `TT-HEQ`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 2-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$140,000` (`$11,667/mo`)
  * Monthly Debts: `$900/mo`
  * Stated Credit Score: `710`
  * Property Value: `$300,000`
  * Current 1st Mortgage Balance: `$200,000`
  * Desired Loan / Line Amount: `$70,000`
  * Combined Loan-to-Value (CLTV): `($200k + $70k) / $300k = 90.0%` (Exceeds 85.0% guideline baseline by `+5.0%`, correctly flagged in amber)
  * Draw / Fund Use: Roof cleaning & maintenance
  * Prior Home Equity Loan on Property: No
  * Current Employer: Global tech (3 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `steve@gmail.com` | `5512345`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Bug-Fix Verification (0 Premature Jumps) | ✅ **PASS** | Completed all 5 Stage 1 setup questions without any jumping to Stage 2.5! Gating fix confirmed 100% operational. |
| **Phase 2** | Collateral Risk Disclosure (`EQ16`) | ✅ **PASS** | Delivered proactive collateral lien disclosure: *"because your home secures the loan, the lender has a lien on your property if you default. Your home equity loan carries a fixed rate and predictable payments, but that collateral risk applies."* Borrower acknowledged. |
| **Phase 2** | Flexible Payment Preference Pivot | ✅ **PASS** | When borrower indicated a fixed monthly payment was not important, Ailana proactively advised: *"Since you're looking for more flexibility than a fixed payment provides, you might find a HELOC — or Home Equity Line of Credit — to be a better fit..."* |
| **Phase 2** | Complete Discovery Sequence | ✅ **PASS** | Collected property value (`$300k`), 1st mortgage (`$200k`), loan amount (`$70k`), purpose (`roof cleaning`), prior HE loan history (`No`), and employer (`global tech / 3 yrs`). |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice cleanly. Borrower authorized Path A soft pull. |
| **Phase 3A** | OTP Gate & Soft Pull Prefill | ✅ **PASS** | Completed OTP authentication, consent, and verified prefill data confirmation seamlessly. |
| **Phase 3** | Home Equity Summary Panel UI | ✅ **PASS** | Rendered **`Home Equity Loan Summary`** with **`VERIFIED`** badge. Total Monthly Obligation `$2,874/mo`, 2nd Loan Amount `$70,000`, Front-End DTI `24.6%`, Back-End DTI `32.3%`, CLTV **`90.0%`** (`+5.0%` above 85.0% guideline, correctly flagged with amber benchmark badge). |
| **Phase 4** | Findings Delivery (`HFD1`) | ✅ **PASS** | Delivered exact **`HFD1`** script: conditional eligibility for a home equity line of credit, on-screen available credit line, formal application and appraisal scheduling next steps. **Zero pre-qualification letters mentioned or issued.** |
| **Phase 5** | Loan Officer Callback Scheduling | ✅ **PASS** | Borrower requested callback after 3 days at 10 AM $\rightarrow$ Ailana scheduled callback for exactly 3 days at 10:00 AM and offered additional assistance before ending. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 🏠 Test 7: Purchase Track (`TT-PUR`) — Primary Residence (Run 1 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: David
* **Transaction Goal**: Home Purchase (`TT-PUR`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 20-day timeline
* **Financial Profile**:
  * Gross Annual Income: `$155,000` (`$12,917/mo`)
  * Monthly Debts: `$800/mo`
  * Stated Credit Score: `700`
  * Cash Available for Down Payment / Closing: `$25,000` (Stated Down: `$24,850` $\approx 7.1\%$)
  * Housing Situation: Renting
  * Realtor Status: Self-represented ("don't need any agents")
  * Target Purchase Price: `$350,000`
  * Property Type & Location: Single Family Home in California / Texas (Zip: `78902`)
  * Military Background: None
  * Employment / Tenure: Self-employed (10 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `david@gmail.com` | `551234`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified "I want to purchase a new home" cleanly to `TT-PUR`. Collected primary residence, first time, 20-day timeline, and single applicant. |
| **Phase 2** | Purchase Discovery Sequence | ✅ **PASS** | Completed all 15 discovery questions in exact v8.7 specification order (Income, Debts, Credit, Down Payment, Rent/Own, Realtor, Target Price, Property Type/Zip, Military History, Self-Employed Tenure). Zero refinance or HELOC questions leaked. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice using purchase affordability terminology. Borrower authorized Path A soft credit review. |
| **Phase 3A** | OTP Gate & CRS Soft Pull | ✅ **PASS** | Successfully verified OTP, accepted soft pull authorization, and confirmed prefilled bureau details (David, San Antonio address, Convergent AI, 3 open accounts / 0 lates). |
| **Phase 3** | Affordability Summary Panel UI | ✅ **PASS** | Rendered **`Affordability Summary`** header with **`VERIFIED`** badge. Target Price `$350,000`, Stated Down `$24,850 (7.1%)`, Loan Amount `$325,150`, Est. Total Monthly Payment `$2,593/mo` (P&I `$2,029`, Taxes `$245`, Ins `$130`, PMI `$190`), Est. Cash to Close `$22,500–$28,500`, Front-End DTI `20.1%`, Back-End DTI `26.3%`, LTV `92.9%` (+12.9% above 80% baseline, well within 97% limit). |
| **Phase 4** | Findings Delivery (`FD1`) | ✅ **PASS** | Delivered exact **`FD1`** script: conditional eligibility for the scenario built, announced that **pre-qualification letter was sent to email on file**, verified 90-day validity, real estate agent relevance, and offered loan officer next steps. |
| **Phase 5** | Loan Officer Next Steps | ✅ **PASS** | Concluded findings delivery with licensed loan officer connection offer. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 🔄 Test 3: Refinance Track (`TT-REF`) — Cash-Out Conventional (Run 3 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Steve
* **Transaction Goal**: Refinance (`TT-REF`) — **Cash-Out** on Existing Conventional Mortgage
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 3-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$160,000` (`$13,333/mo`)
  * Monthly Debts: `$900/mo`
  * Stated Credit Score: `720`
  * Current Loan Type: **Conventional**
  * Property Value: `$550,000`
  * Current Balance: `$320,000` (LTV $\approx 58.2\%$)
  * Cash-Out Amount: `$80,000` (New Total Loan $\approx 400,000$, New LTV $\approx 72.7\%$)
  * Current Note Rate: `8.5%`
  * Current Payment: `$3,200/mo`
  * Remaining Term: `25 years`
  * Closing Costs Preference: Paid out of pocket
  * Prior Refinance (`RQ28`): No
  * Stay Duration (`RQ29`): 7 years
  * Current Employer: TechCo (5 years, salaried)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `steve@gmail.com` | `555 123 55`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified refinance intent to `TT-REF`. Collected primary residence, first time, 3-month timeline, and single applicant cleanly. |
| **Phase 2** | Conventional Sub-track Overview | ✅ **PASS** | After borrower identified loan as Conventional, Ailana delivered `CONV-REF-OVERVIEW` mentioning rate-and-term and cash-out options. Borrower chose cash-out for kitchen renovation. |
| **Phase 2** | Cash-Out Branch & RQ27 | ✅ **PASS** | `refinance_type=cash_out` correctly extracted. Cash-out amount question (RQ27) appeared in sequence after closing costs preference. Captured `$80,000` cleanly. |
| **Phase 2** | Discovery Sequence & Gaps | ✅ **PASS** | All 15 cash-out refi fields collected in correct GAP-3 order: income, debt, credit, loan type, refi goal, property value, balance, rate, payment, term, closing costs, cash-out amount, prior refinance (RQ28), stay duration (RQ29), employer. Zero purchase question leakage. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice. Borrower chose Path A soft credit review. |
| **Phase 3A** | OTP & Soft Pull Prefill | ✅ **PASS** | Completed name, contact, OTP, consent, and verified prefill confirmation. |
| **Phase 3** | Cash-Out Refinance Summary Panel | ✅ **PASS** | Rendered `Cash-Out Refinance Summary` with `VERIFIED` badge. Home Value `$550,000`, Payoff `$320,000`, Cash-Out `$80,000`, New Total Loan ~`$400,000`, LTV `72.7%` (under 80% guideline). Monthly savings delta and interactive sliders present. |
| **Phase 3** | 80% LTV Cap Enforcement (GAP-9) | ✅ **PASS** | Slider test: cash-out amount beyond 80% LTV ceiling ($120K max) correctly capped with warning message. |
| **Phase 4** | Findings Delivery (`RFD1`) | ✅ **PASS** | Delivered exact **`RFD1`** script: conditional eligibility for the refinance scenario, payment comparison on screen, loan officer rate lock offer. **Zero pre-qualification letter mentioned** (compliant with Item 11). |
| **Phase 5** | Loan Officer Handoff | ✅ **PASS** | Borrower requested MLO connection → SIP bridge triggered instantly. |

### 🐛 Bug Found & Fixed During Test 3

**Issue:** After choosing Path A (soft pull) and transitioning to Stage 3A, Ailana asked for the borrower's name, then looped back to the two-path closing offer, creating an infinite cycle: name → re-ask closing offer → name → re-ask...

**Root Cause:** The `isAtClosingOffer` flag in `agent.ts` (line 265) used `_stage2ClosingOfferDelivered` which was set to `true` during the closing offer delivery but **never reset**. After transitioning to Stage 3A (`contact_name`), every subsequent turn still entered the closing offer block. When the user said their name, no Path A/B regex matched, so it fell through to the re-ask script.

**Fix:** Added `&& currentStage === '2'` guard to scope `isAtClosingOffer` to Stage 2 only:
```diff
-const isAtClosingOffer = pending === 'stage2_closing_offer' || this._stage2ClosingOfferDelivered;
+const currentStage = this.contextManager.getActiveStage();
+const isAtClosingOffer = (pending === 'stage2_closing_offer' || this._stage2ClosingOfferDelivered) && currentStage === '2';
```

**Verified:** Bug fixed, re-tested successfully. All 11 automated test suites pass.

### 🏆 Verdict: **PASS — 100% Flawless Execution** (after bug fix)

---

## 💳 Test 6: HELOC Track (`TT-HEL`) — Pure Variable Rate (Run 3 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Steve
* **Transaction Goal**: HELOC (`TT-HEL`) — Pure Line of Credit
* **Property / Occupancy**: Investment Property
* **Borrower Context**: First-time explorer, single applicant, ASAP timeline
* **Financial Profile**:
  * Gross Annual Income: `$175,000` (`$14,583/mo`)
  * Monthly Debts: `$1,200/mo`
  * Stated Credit Score: `730`
  * Property Value: `$420,000`
  * 1st Mortgage Balance: `$210,000`
  * Desired Credit Line: `$100,000`
  * Combined Loan-to-Value (CLTV): `($210k + $100k) / $420k = 73.8%` (Under 85.0% guideline)
  * Draw / Fund Use: Debt consolidation
  * Prior HELOC (`HQ25`): Yes, paid off 5 years ago
  * Timeline (`HQ26`): Within the next month
  * Current Employer: Self-employed consulting (8 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `steve@gmail.com` | `5512345`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified "I want a home equity line of credit" to `TT-HEL` without disambiguation. Collected investment property, first-time, ASAP timeline, and single applicant cleanly. |
| **Phase 2** | Risk Disclosure (`HQ16`/`HQ19`) | ✅ **PASS** | Proactively delivered mandatory disclosure about variable rate, lien risk, and 10-to-20 year repayment transition. |
| **Phase 2** | Rate Comfort (`HQ24`) | ✅ **PASS** | Asked if borrower was comfortable with variable rate vs fixed payment. Borrower responded "comfortable with a variable rate" and stayed on `TT-HEL` track. |
| **Phase 2** | Complete Discovery Sequence & Gaps | ✅ **PASS** | Collected all fields, including `HQ25` (prior HELOC) and `HQ26` (timeline) from the GAP-5 fix. Zero purchase or refinance questions leaked. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice cleanly. Borrower authorized Path A soft pull. |
| **Phase 3A** | OTP Gate & Soft Pull Prefill | ✅ **PASS** | Completed OTP authentication, consent, and verified prefill data confirmation seamlessly. |
| **Phase 3** | HELOC Summary Panel UI | ✅ **PASS** | Rendered `HELOC Summary` with `VERIFIED` badge. Showed Home Value `$420,000`, 1st Mortgage `$210,000`, Max Line `$147,000`, Requested Line `$100,000`, CLTV `73.8%`. Displayed both interest-only Draw Period Payment and amortizing Repayment Period Payment. |
| **Phase 4** | Findings Delivery (`HFD1`) | ✅ **PASS** | Delivered exact `HFD1` script: conditional eligibility for HELOC, on-screen available credit line, formal application next steps. Zero pre-qualification letters mentioned. |
| **Phase 5** | Loan Officer Callback Scheduling | ✅ **PASS** | Borrower requested callback next Monday at 11 AM $\rightarrow$ Ailana scheduled correctly. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 🏠 Test 8: Purchase Track (`TT-PUR`) — VA Loan (Run 2 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Mike
* **Transaction Goal**: Home Purchase (`TT-PUR`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 2-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$95,000` (`$7,917/mo`)
  * Monthly Debts: `$600/mo`
  * Stated Credit Score: `680`
  * Cash Available for Down Payment / Closing: `$15,000`
  * Housing Situation: Renting
  * Realtor Status: Has a realtor
  * Target Purchase Price: `$280,000`
  * Property Type & Location: Townhouse in San Antonio, Texas 78242
  * Military Background (`Q43`): Yes — served in the Army for 4 years
  * Employment / Tenure: Hourly (3 years)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `mike@gmail.com` | `555 9876`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified "I want to purchase a home" to `TT-PUR`. Collected primary residence, first time, 2-month timeline, and single applicant. |
| **Phase 2** | Discovery Sequence & Gaps | ✅ **PASS** | Completed all 15 discovery questions in order. Extracted military status (Q43) and hourly employment (Q44) cleanly. Zero refi or HELOC questions leaked. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered two-path choice using purchase terminology. Borrower authorized Path A soft pull. |
| **Phase 3A** | OTP Gate & CRS Soft Pull | ✅ **PASS** | Successfully verified OTP, accepted soft pull authorization, and confirmed prefilled bureau details (Mike, address, employer). |
| **Phase 3** | Affordability Summary Panel UI | ✅ **PASS** | Rendered `Affordability Summary` with `VERIFIED` badge. Target Price `$280,000`, Down Payment `$15,000`. Showed VA program option and accurately calculated VA Funding Fee (2.15% for first-use). |
| **Phase 4** | Findings Delivery (`FD1`) | ✅ **PASS** | Delivered exact `FD1` script: conditional eligibility, announced pre-qualification letter emailed, verified 90-day validity, offered loan officer connection. |
| **Phase 5** | Loan Officer Handoff | ✅ **PASS** | Borrower requested MLO connection $\rightarrow$ SIP bridge triggered instantly. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---

## 🏠 Test 9: Purchase Track (`TT-PUR`) — Multi-Family Conventional with PMI (Run 3 of 3)

### 📌 Session Profile & Scenario Inputs
* **Borrower Name**: Mike
* **Transaction Goal**: Home Purchase (`TT-PUR`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: First-time explorer, single applicant, 4-month timeline
* **Financial Profile**:
  * Gross Annual Income: `$175,000` (`$14,583/mo`)
  * Monthly Debts: `$1,200/mo`
  * Stated Credit Score: `720`
  * Cash Available for Down Payment / Closing: `$65,000` (Stated Down: `$64,900` / `11.8%`)
  * Housing Situation: Currently renting
  * Realtor Status: Does not need any agents
  * Target Purchase Price: `$550,000`
  * Property Type & Location: Multi-family home in New York (710000)
  * Military Background (`Q43`): None
  * Employment / Tenure (`Q44`): Hourly ($15/hr, 4 years tenure)
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `Mike123@gmail.com` | `7290124`
  * Verified Address: `5815 KNOLL KREST ST, SAN ANTONIO, TX 782421118`
  * Verified Employer: `Convergent AI`
  * Accounts: 3 open accounts, 0 late payments in 24 months, "Good" category tier

---

### 📋 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details |
|---|---|---|---|
| **Phase 1** | Intent Routing | ✅ **PASS** | Classified "I want to purchase a home" to `TT-PUR`. Captured primary residence, first-time, 4-month timeline, and single applicant cleanly. |
| **Phase 2** | Discovery Sequence & Gaps | ✅ **PASS** | All 15 discovery questions executed in exact order: income ($175k), debt ($1,200), credit (720), down payment ($65k), rent, no realtor, target price ($550k), multi-family home in NY, Q43 military (none), Q44 hourly tenure (4 years). Zero refi or HELOC questions leaked. |
| **Phase 3** | Two-Path Closing Offer | ✅ **PASS** | Delivered verbatim two-path closing offer script ("Which would you prefer, the soft credit review... or building your affordability summary from the information you shared today?"). |
| **Phase 3A** | OTP Gate & FCRA Soft Pull Consent | ✅ **PASS** | Captured name (Mike), email/mobile, sent OTP code, and presented verbatim FCRA soft credit inquiry authorization disclosure. Borrower explicitly authorized. |
| **Phase 3A** | Prefill Data Verification | ✅ **PASS** | Read back prefilled credit bureau details one-by-one (name, physical address, employer Convergent AI, 3 open accounts / 0 late payments, Good tier rating). Borrower confirmed all items. |
| **Phase 3** | Affordability Summary Panel UI | ✅ **PASS** | Rendered `Affordability Summary` panel with `VERIFIED` green badge. Target Price `$550,000`, Stated Down `$64,900` (11.8%), Loan Amount `$485,100`, Est. PITIA `$3,748/mo` (P&I `$3,026`, Taxes `$385`, Ins `$130`, PMI `$206`). Displayed Conventional and FHA program options. Verified accurate LTV benchmark (`88.2%`, +8.2% over 80.0%) and automatic PMI cancellation notice at 20% equity. Front-end DTI (`25.7%`) and Back-end DTI (`33.9%`) both within limits. |
| **Phase 4** | Findings Delivery (`FD1`) | ✅ **PASS** | Delivered exact `FD1` script: announced conditional eligibility, payment range in pre-qualification letter, confirmed letter emailed to borrower on file, confirmed validity for ninety days, and offered loan officer connection. |
| **Phase 5** | Loan Officer Callback Scheduling | ✅ **PASS** | Borrower requested: "Please give me a call back after 2 days with the loan officer at 9 AM" $\rightarrow$ Ailana successfully booked the callback for two days at 9 AM with loan officer context. |

### 🏆 Verdict: **PASS — 100% Flawless Execution**

---
