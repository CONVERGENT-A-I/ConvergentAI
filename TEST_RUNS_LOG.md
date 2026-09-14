# 🧪 9-Flow End-to-End Test Execution Log

This document records the official execution, verification checkpoints, and results for all 9 live test runs (3 runs per track) across **Refinance (`TT-REF`)**, **HELOC / Home Equity (`TT-HEL` / `TT-HEQ`)**, and **Purchase (`TT-PUR`)**.

---

## 📊 Summary Scorecard

| Test # | Track | Scenario / Focus | Mode | Timestamp | Result | Highlights / Status |
|---|---|---|---|---|---|---|
| **Test 1** | **Refinance (`TT-REF`)** | Rate & Term (Conventional) | Path A (Verified) | Pending | **PENDING** | Run 1 of 3: Refinance Rate & Term discovery, RQ28/RQ29 compliance, OTP & soft pull, Refinance Summary panel with payment delta, RFD1 findings, SIP LO live transfer. |
| **Test 2** | **Refinance (`TT-REF`)** | Rate & Term (Government / FHA or USDA) | Path A (Verified) | Pending | **PENDING** | Run 2 of 3: Government refi compliance, closing cost preferences, payment delta, Refinance Summary, RFD1 findings, SIP LO live transfer. |
| **Test 3** | **Refinance (`TT-REF`)** | Cash-Out Refinance (`refiCO`) | Path A (Verified) | Pending | **PENDING** | Run 3 of 3: Cash-out sub-track (`refiCO`), RQ27 cash-out amount, 80% LTV cap enforcement, Cash-Out Refinance Summary panel, RFD1 findings, SIP LO live transfer. |
| **Test 4** | **HELOC / HE Loan (`TT-HEQ`)** | Fixed Home Equity Loan | Path A (Verified) | Pending | **PENDING** | Run 1 of 3: Fixed loan sub-track routing, EQ16 fixed risk disclosure, Home Equity Loan Summary panel, EFD1 findings, SIP LO transfer / callback. |
| **Test 5** | **HELOC (`TT-HEL`)** | Variable Line of Credit (Primary Residence) | Path A (Verified) | Pending | **PENDING** | Run 2 of 3: Pure HELOC intent, draw schedule, HQ16/HQ19 risk disclosure, CLTV calculation, HELOC Summary panel, HFD1 findings, SIP LO transfer / callback. |
| **Test 6** | **HELOC (`TT-HEL`)** | Debt Consolidation / Investment Property | Path A (Verified) | Pending | **PENDING** | Run 3 of 3: Investment/second home or debt consolidation draw, variable rate comfort, HELOC Summary panel with 10→20yr repayment shock, HFD1 findings. |
| **Test 7** | **Purchase (`TT-PUR`)** | Conventional Primary Residence | Path A (Verified) | Pending | **PENDING** | Run 1 of 3: Complete 15-question purchase discovery, full name modal/voice, OTP & CRS soft pull, Affordability Summary, FD1 findings with 90-day pre-qual letter, SIP LO transfer. |
| **Test 8** | **Purchase (`TT-PUR`)** | VA or FHA Government Program | Path A (Verified) | Pending | **PENDING** | Run 2 of 3: Military veteran / FHA routing, program tab pre-selection, funding fee / MIP handling, Affordability Summary, FD1 findings with pre-qual letter. |
| **Test 9** | **Purchase (`TT-PUR`)** | Multi-Family / First-Time Buyer with PMI | Path A (Verified) | Pending | **PENDING** | Run 3 of 3: Multi-family property, PMI calculation, closing cost breakdown, OTP & CRS soft pull, Affordability Summary with VERIFIED badge, FD1 findings. |

> 🕒 **Overall Verification Status**: **0 of 9 Completed — All Tracks Ready for Fresh Execution**

---

## 🔁 TRACK 1: REFINANCE (`TT-REF`) — 3 TEST RUNS

---

### 🧪 Test 1: Refinance Track (`TT-REF`) — Rate & Term (Run 1 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Steve Miller]`
* **Transaction Goal**: Refinance (`TT-REF`) — Rate & Term
* **Property / Occupancy**: Primary Residence (Single Family)
* **Borrower Context**: Single applicant, 30-60 day timeline
* **Financial Profile**:
  * Gross Annual Income: `$120,000` (`$10,000/mo`)
  * Monthly Debts: `$500/mo`
  * Stated Credit Score: `740 - 760`
  * Current Loan Type: Conventional
  * Estimated Property Value: `$450,000`
  * Current Balance: `$280,000` (LTV $\approx 62.2\%$)
  * Current Note Rate: `7.25%`
  * Current Monthly Payment: `$2,400/mo`
  * Remaining Term: `25 years`
  * Closing Costs Preference: Roll into loan
  * Prior Refinance (`RQ28`): No
  * Stay Duration (`RQ29`): 5+ years
  * Current Employer: `[e.g., Tech Corp (5 yrs)]`
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Track Classification | ⏳ **PENDING** | Verify borrower stating "I want to refinance" routes cleanly to `TT-REF`. Occupancy, relationship, timeline, and co-borrower collected. |
| **Phase 2** | Discovery Sequence & Regulatory Compliance | ⏳ **PENDING** | Verify 12 core refi questions collected in order. Compliance questions **`RQ28`** (prior refi) and **`RQ29`** (stay duration) asked. Zero purchase leakage. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify exact two-path closing offer delivered. System correctly recognizes Path A selection without re-prompting. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name prompt, email/phone capture, OTP delivery & validation, and CRS soft credit pull execution. |
| **Phase 5** | Refinance Summary Panel & Findings Delivery (`RFD1`) | ⏳ **PENDING** | Verify `Refinance Summary` panel opens with `VERIFIED` badge, correct payoff, savings delta, and **`RFD1`** findings script delivered (no pre-qual letter offered). |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | When borrower says "connect me to loan officer", verify immediate live SIP call to LO queue (no affordability panel detour). |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

### 🧪 Test 2: Refinance Track (`TT-REF`) — Government / FHA or USDA Rate & Term (Run 2 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Maria Garcia]`
* **Transaction Goal**: Refinance (`TT-REF`) — Government Loan (FHA / USDA)
* **Property / Occupancy**: Primary Residence (Single Family)
* **Borrower Context**: Lower rate seeker, out-of-pocket closing costs
* **Financial Profile**:
  * Gross Annual Income: `$90,000` (`$7,500/mo`)
  * Monthly Debts: `$400/mo`
  * Stated Credit Score: `680`
  * Current Loan Type: FHA / USDA
  * Estimated Property Value: `$350,000`
  * Current Balance: `$240,000` (LTV $\approx 68.6\%$)
  * Current Note Rate: `7.50%`
  * Current Monthly Payment: `$2,100/mo`
  * Remaining Term: `27 years`
  * Closing Costs Preference: Pay out-of-pocket
  * Prior Refinance (`RQ28`): No
  * Stay Duration (`RQ29`): 7 years
  * Current Employer: `[e.g., Healthcare Services (4 yrs)]`
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Track Classification | ⏳ **PENDING** | Verify refi intent routed cleanly to `TT-REF`. Government loan type correctly captured. |
| **Phase 2** | Discovery Sequence & Out-of-Pocket Costs | ⏳ **PENDING** | Verify out-of-pocket closing cost preference preserved. `RQ28` and `RQ29` asked in proper sequence. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered smoothly. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name captured cleanly in modal/voice and soft pull executes. |
| **Phase 5** | Refinance Summary Panel & Findings Delivery (`RFD1`) | ⏳ **PENDING** | Verify Refinance Summary displays government rate comparison, payment delta, and **`RFD1`** script spoken. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify live SIP call initiation on handoff request or graceful callback scheduling. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

### 🧪 Test 3: Refinance Track (`TT-REF`) — Cash-Out Conventional (`refiCO`) (Run 3 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., David Chen]`
* **Transaction Goal**: Cash-Out Refinance (`refiCO`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: Home improvement / debt consolidation cash-out
* **Financial Profile**:
  * Gross Annual Income: `$150,000` (`$12,500/mo`)
  * Monthly Debts: `$800/mo`
  * Stated Credit Score: `740`
  * Current Loan Type: Conventional
  * Estimated Property Value: `$600,000`
  * Current Balance: `$320,000`
  * Desired Cash-Out (`RQ27`): `$80,000` (New balance: `$400,000`, LTV $\approx 66.7\% \le 80\%$ cap)
  * Current Note Rate: `6.85%`
  * Current Monthly Payment: `$2,800/mo`
  * Remaining Term: `22 years`
  * Closing Costs Preference: Rolled into loan
  * Prior Refinance (`RQ28`): Yes (2 years ago)
  * Stay Duration (`RQ29`): 10 years
  * Current Employer: `[e.g., Engineering Firm (8 yrs)]`
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Track Classification | ⏳ **PENDING** | Verify cash-out refi intent switches track to `refiCO`. |
| **Phase 2** | Discovery Sequence & 80% LTV Enforcement | ⏳ **PENDING** | Verify **`RQ27`** (cash-out amount) asked. Verify max 80% LTV cap enforced and compliant. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered without looping. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name, contact, OTP, and CRS soft pull. |
| **Phase 5** | Cash-Out Refinance Summary Panel & Findings (`RFD1`) | ⏳ **PENDING** | Verify Cash-Out Refinance Summary panel shows cash-in-hand `$80,000`, new total loan amount, and **`RFD1`** findings. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify direct SIP connection to LO queue upon borrower request. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

## 🔁 TRACK 2: HELOC & HOME EQUITY (`TT-HEL` / `TT-HEQ`) — 3 TEST RUNS

---

### 🧪 Test 4: HELOC Track (`TT-HEQ`) — Fixed Home Equity Loan (Run 1 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Robert Taylor]`
* **Transaction Goal**: Fixed Home Equity Loan (`TT-HEQ`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: Garage remodel / fixed monthly payment preference
* **Financial Profile**:
  * Gross Annual Income: `$130,000` (`$10,833/mo`)
  * Monthly Debts: `$600/mo`
  * Stated Credit Score: `750`
  * First Mortgage Balance: `$300,000`
  * First Mortgage Monthly Payment: `$2,100/mo`
  * Estimated Home Value: `$550,000`
  * Desired Loan Amount: `$60,000` (Combined balance: `$360,000`, CLTV $\approx 65.5\%$)
  * Draw / Loan Term: `15-year fixed`
  * Funds Use: Home improvement (Garage remodel)
  * Current Employer: `[e.g., Logistics Manager (6 yrs)]`
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Fixed Sub-Track | ⏳ **PENDING** | Borrower states fixed home equity loan preference $\rightarrow$ routes to `TT-HEQ`. |
| **Phase 2** | Discovery Sequence & Fixed Risk Disclosure | ⏳ **PENDING** | Verify **`EQ16`** fixed home equity risk disclosure delivered. Combined LTV checked. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered cleanly. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name, email, phone, OTP, and soft pull. |
| **Phase 5** | Home Equity Loan Summary Panel & Findings (`EFD1`) | ⏳ **PENDING** | Verify panel opens with Home Equity Loan title (1st Balance `$300,000`, New Loan `$60,000`) and **`EFD1`** script delivered. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify direct SIP connection to LO queue upon borrower request. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

### 🧪 Test 5: HELOC Track (`TT-HEL`) — Variable Line of Credit (Run 2 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Jennifer White]`
* **Transaction Goal**: Variable HELOC Line of Credit (`TT-HEL`)
* **Property / Occupancy**: Primary Residence
* **Borrower Context**: Ongoing roof maintenance / flexible draw comfort
* **Financial Profile**:
  * Gross Annual Income: `$110,000` (`$9,167/mo`)
  * Monthly Debts: `$450/mo`
  * Stated Credit Score: `720`
  * First Mortgage Balance: `$260,000`
  * Estimated Home Value: `$420,000`
  * Desired Credit Line: `$50,000` (Combined: `$310,000`, CLTV $\approx 73.8\%$)
  * Draw Schedule: As-needed over 10-year draw period
  * Variable Rate Comfort (`HQ24`): Comfortable with index adjustments
  * Prior HELOC Experience (`HQ25`): First time
  * Current Employer: `[e.g., Financial Analyst (3 yrs)]`
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Variable HELOC | ⏳ **PENDING** | Verify variable revolving line of credit intent routes cleanly to `TT-HEL`. |
| **Phase 2** | Discovery Sequence & Variable Risk Disclosure | ⏳ **PENDING** | Verify **`HQ16`** and **`HQ19`** variable rate & draw disclosures delivered proactively. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered smoothly. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name, contact info, OTP, and soft pull. |
| **Phase 5** | HELOC Summary Panel & Findings (`HFD1`) | ⏳ **PENDING** | Verify HELOC Summary panel opens with Line Amount, 10-year draw / 20-year repayment shock note, and **`HFD1`** script delivered. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify direct SIP connection to LO queue upon borrower request. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

### 🧪 Test 6: HELOC Track (`TT-HEL`) — Debt Consolidation / Investment Property (Run 3 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Michael Brown]`
* **Transaction Goal**: HELOC (`TT-HEL`) — High-interest debt payoff
* **Property / Occupancy**: Second Home / Investment or Primary with Debt Consolidation
* **Borrower Context**: Consolidating credit cards into lower-rate line
* **Financial Profile**:
  * Gross Annual Income: `$140,000` (`$11,667/mo`)
  * Monthly Debts: `$1,800/mo` (Credit cards & personal loan)
  * Stated Credit Score: `710`
  * First Mortgage Balance: `$350,000`
  * Estimated Home Value: `$580,000`
  * Desired Line Amount: `$75,000` (CLTV $\approx 73.3\%$)
  * Draw Timeline: Immediate lump-sum draw
  * Current Employer: `[e.g., Sales Director (5 yrs)]`
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Track Classification | ⏳ **PENDING** | Verify debt consolidation use-case routed to `TT-HEL`. |
| **Phase 2** | Discovery Sequence & Risk Disclosures | ⏳ **PENDING** | Verify debt payoff amount captured, variable rate disclosure delivered. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered without confusion. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name, contact capture, OTP verification, and CRS soft pull. |
| **Phase 5** | HELOC Summary Panel & Findings (`HFD1`) | ⏳ **PENDING** | Verify HELOC Summary panel displays interest-only draw payment vs full amortization, and **`HFD1`** script delivered. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify direct SIP connection to LO queue upon borrower request. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

## 🔁 TRACK 3: PURCHASE (`TT-PUR`) — 3 TEST RUNS

---

### 🧪 Test 7: Purchase Track (`TT-PUR`) — Conventional Primary Residence (Run 1 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Sarah Jenkins]`
* **Transaction Goal**: Purchase (`TT-PUR`) — Primary Residence
* **Property Type**: Single Family Home
* **Borrower Context**: First-time homebuyer, 60-day timeline
* **Financial Profile**:
  * Target Purchase Price: `$450,000`
  * Down Payment: `$90,000` (20% down, zero PMI)
  * Gross Annual Income: `$115,000` (`$9,583/mo`)
  * Monthly Debts: `$450/mo` (Car payment)
  * Stated Credit Score: `750`
  * Employment / Tenure: Salaried, 4 years with current employer
  * Working with Realtor: Yes
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Track Classification | ⏳ **PENDING** | Verify "I want to buy a home" routes cleanly to `TT-PUR`. Primary residence and timeline recorded. |
| **Phase 2** | 15-Question Discovery Sequence | ⏳ **PENDING** | Verify full purchase discovery sequence without refi/HELOC question contamination. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify exact two-path closing offer delivered. Handled Path A selection cleanly. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name captured cleanly in modal/voice, OTP delivered/verified, CRS soft credit pulled. |
| **Phase 5** | Affordability Panel & Findings (`FD1`) | ⏳ **PENDING** | Verify Affordability Summary opens with `VERIFIED` badge, pre-selected Conventional tab, and **`FD1`** findings script delivered with 90-day pre-qual letter offer. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | When borrower requests loan officer, verify immediate direct SIP live call bridge. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

### 🧪 Test 8: Purchase Track (`TT-PUR`) — VA or FHA Government Program (Run 2 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Marcus Vance]`
* **Transaction Goal**: Purchase (`TT-PUR`) — Military Veteran (VA Loan)
* **Property Type**: Townhouse / Single Family
* **Borrower Context**: Military Veteran, eligible for VA zero-down financing
* **Financial Profile**:
  * Target Purchase Price: `$400,000`
  * Down Payment: `$0` (0% down VA financing)
  * Gross Annual Income: `$95,000` (`$7,917/mo`)
  * Monthly Debts: `$350/mo`
  * Stated Credit Score: `700`
  * Military Veteran (`Q43`): Yes (Honorably discharged / eligible)
  * Employment / Tenure: Hourly / Salaried, 3 years
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Veteran Identification | ⏳ **PENDING** | Verify purchase intent routed to `TT-PUR`. Military veteran status identified. |
| **Phase 2** | Discovery Sequence & Program Qualification | ⏳ **PENDING** | Verify zero down payment accepted for VA, zero monthly PMI applied, VA funding fee calculated. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered cleanly. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name captured, OTP verified, soft credit pulled. |
| **Phase 5** | Affordability Panel & Findings (`FD1`) | ⏳ **PENDING** | Verify Affordability Summary opens with VA program tab active and **`FD1`** findings script delivered. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify direct SIP connection to LO queue upon borrower request. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

### 🧪 Test 9: Purchase Track (`TT-PUR`) — Multi-Family / First-Time Buyer with PMI (Run 3 of 3)

#### 📋 Session Profile & Scenario Inputs
* **Borrower Full Name**: `[e.g., Alex Rivera]`
* **Transaction Goal**: Purchase (`TT-PUR`) — Multi-Family Home (2-4 Units)
* **Property Type**: Multi-Family (Duplex)
* **Borrower Context**: First-time investor/buyer occupying one unit
* **Financial Profile**:
  * Target Purchase Price: `$550,000`
  * Down Payment: `$55,000` (10% down, PMI applies)
  * Gross Annual Income: `$135,000` (`$11,250/mo`)
  * Monthly Debts: `$650/mo`
  * Stated Credit Score: `720`
  * Employment / Tenure: Salaried, 5 years
  * Working with Realtor: Yes
* **Closing Choice**: Path A (Soft Credit Review / Verified Mode)
* **Soft Pull Credentials**:
  * Contact: `[Email]` | `[Phone]`
  * Verified Address: `[Street, City, State, ZIP]`
  * Full Name on ID: `[First Last]`

#### 🔍 Phase-by-Phase Verification

| Phase | Checkpoint | Status | Details & Observations |
|---|---|---|---|
| **Phase 1** | Intent Routing & Multi-Family Type | ⏳ **PENDING** | Verify purchase intent routed to `TT-PUR`. Multi-family occupancy confirmed. |
| **Phase 2** | Discovery Sequence & PMI Calculation | ⏳ **PENDING** | Verify 10% down payment accepted. Accurate monthly PMI estimated for $\approx 90\%$ LTV. |
| **Phase 3** | Stage 2 Closing Offer (Path A vs Path B) | ⏳ **PENDING** | Verify two-path closing offer delivered smoothly. |
| **Phase 4** | Contact, Full Name & OTP Soft Pull | ⏳ **PENDING** | Verify Full Name captured, OTP verified, soft pull completed. |
| **Phase 5** | Affordability Panel & Findings (`FD1`) | ⏳ **PENDING** | Verify Affordability Summary opens with `VERIFIED` badge, cash-to-close breakdown, and **`FD1`** script delivered. |
| **Phase 6** | Direct SIP Live Call to Loan Officer | ⏳ **PENDING** | Verify direct SIP live call connection to LO queue upon borrower request. |

#### ⚡ Latency & Telemetry
* STT Processing: `___ ms`
* LLM TTFT: `___ ms`
* TTS TTFB: `___ ms`
* LemonSlice Render: `___ ms`
* E2E Latency: `___ ms`

#### 📝 Verdict & Notes
* **Verdict**: `[ ] PASS  |  [ ] FAIL  |  [X] PENDING`
* **Notes**: `[To be recorded during execution]`

---

## 🛠️ Post-Test Reference & Verification Guidelines

When executing these 9 tests, ensure the following core requirements are verified on each run:

1. **Full Name Field**: In the contact capture modal and voice dialogue, ensure Ailana requests **Full Name** (not separate first and last name), matching the latest unified profile sync.
2. **Track Integrity**:
   - Refinance (`TT-REF`): Verify Refinance Summary panel with payment delta and **`RFD1`** findings script (no pre-qual letter).
   - HELOC / Home Equity (`TT-HEL` / `TT-HEQ`): Verify Home Equity / HELOC Summary panel and **`EFD1`** (fixed loan) or **`HFD1`** (variable HELOC) findings script.
   - Purchase (`TT-PUR`): Verify Affordability Summary panel with **`FD1`** findings script and 90-day pre-qualification letter offer.
3. **Direct SIP Live Call**: When the borrower requests "connect me to a loan officer" at the end of any flow, Ailana must initiate the direct live SIP bridge to the loan officer queue immediately.
