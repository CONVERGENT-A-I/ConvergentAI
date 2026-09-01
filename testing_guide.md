# Complete Manual Testing Guide — All 5 Phases, All 3 Tracks

> **Pre-requisite:** Both servers must be running before any test.

---

## 🖥️ Server Setup

Open **two terminals**:

```bash
# Terminal 1: Backend (Port 3001)
cd backend
npm run dev

# Terminal 2: Frontend (Port 3000)
cd ..
npm run dev
```

Open browser: **http://localhost:3000**

> [!TIP]
> Keep the **backend terminal visible** at all times — most verification checkpoints require reading backend console logs. You can use `Ctrl+F` in your terminal to search log output.

---

## 📋 Testing Checklist

Use this checklist to track your progress. Each section has a checkbox.

```
TRACK 1 — PURCHASE (TT-PUR)
  [ ] Phase 1: Intent routing → TT-PUR
  [ ] Phase 2: All 15 discovery questions asked in order
  [ ] Phase 3: Affordability Panel (Stated mode)
  [ ] Phase 3: Affordability Panel (Verified mode via upgrade)
  [ ] Phase 4: Submit → FD1 findings delivered
  [ ] Phase 4: LO handoff offered (live or callback)

TRACK 2 — REFINANCE RATE & TERM (TT-REF / refiRT)
  [ ] Phase 1: Intent routing → TT-REF
  [ ] Phase 2: All 12 refi questions in correct order
  [ ] Phase 3: Refi Panel shows Monthly Savings Delta
  [ ] Phase 4: Submit → RFD1 findings (NO pre-qual letter)
  [ ] Phase 4: LO handoff offered

TRACK 3 — REFINANCE CASH-OUT (TT-REF / refiCO)
  [ ] Phase 2: Cash-out amount question appears
  [ ] Phase 3: Cash-Out Panel shows 80% LTV cap
  [ ] Phase 4: Submit → RFD1 findings

TRACK 4 — HELOC (TT-HEL)
  [ ] Phase 1: Intent routing → TT-HEL
  [ ] Phase 2: Risk disclosure (HQ16/HQ19) delivered
  [ ] Phase 2: Rate comfort question (HQ24) asked
  [ ] Phase 2: All 10 HELOC questions in order
  [ ] Phase 3: HELOC Panel shows CLTV + Repayment Period
  [ ] Phase 4: Submit → HFD1 findings (NO pre-qual letter)
  [ ] Phase 4: LO handoff offered

REGRESSION
  [ ] Purchase flow still works after testing Refi/HELOC
  [ ] No cross-track question leakage
  [ ] TypeScript: 0 errors (both frontend + backend)
  [ ] npm test: All 10 suites pass
```

---

## 🏠 TEST 1: Purchase Track (TT-PUR)

### Phase 1 — Intent Routing

1. **Refresh the page** to start a new session
2. Ailana greets you: *"Hi! I'm Ailana..."*
3. **Say:** `I want to buy a new home.`
4. ✅ **VERIFY in backend logs:**
   ```
   🎯 Stage 1 Goal Classified: purchase -> transaction_type=TT-PUR
   ```
5. Continue Stage 1 questions:
   - *"Will this be a home you'll be living in?"* → `This will be my primary residence.`
   - *"Have you worked with your lending institution before?"* → `This is my first time.`
   - *"When are you hoping to be in your new home?"* → `In the next 3 months.`
   - *"Will you be applying on your own or with a co-borrower?"* → `I am applying on my own.`
6. ✅ **VERIFY:** Backend logs show transition:
   ```
   Transitioning to STAGE 2 Pre-Qualification Discovery!
   ```

### Phase 2 — Discovery Questions

Answer each question in order. After each answer, verify the backend log shows the field extracted correctly.

| # | Ailana Asks About | You Say | Log to Verify |
|---|---|---|---|
| 1 | Gross annual income | `85000 dollars annually` | `gross_annual_income=85000` |
| 2 | Monthly debts | `1000 dollars only` | `monthly_debt=1000` |
| 3 | Credit score | `700 is my credit score` | `credit_range=700` |
| 4 | Down payment | `20000 dollars` | `down_payment=20000` |
| 5 | Rent or own | `I am currently renting` | `rent_own=rent` |
| 6 | Real estate agent | `No, I don't need any agents` | `realtor_status=no` |
| 7 | Target purchase price | `300000 dollars` | `target_price=300000` |
| 8 | Property type + location | `Single family home in San Antonio, Texas, 78242` | `property_type=single_family` |
| 9 | Military service | `No military background` | `military_rural=neither` |
| 10 | Employer + tenure | `I am salaried and working since last 5 years` | `job_tenure_type=...` |

✅ **VERIFY:** After employer question, Ailana delivers the **Two-Path Choice** (soft credit review vs. explore first).

### Phase 3 — Affordability Panel (Path B: Stated Mode)

1. **Say:** `Build my summary right now.`
2. ✅ **VERIFY in backend logs:**
   ```
   Path B chosen via LLM — Stated-Data Mode. Transitioning directly to Stage 2.5
   ```
3. ✅ **VERIFY on screen:**
   - Panel opens with header **"Affordability Summary"**
   - Shows target price `$300,000`, down payment `$20,000`
   - DTI ratio gauge is visible
   - Sliders are interactive (purchase price, down payment)
   - **"Submit for review"** button is visible

4. **Test slider interaction:** Adjust the purchase price slider up/down
   - ✅ **VERIFY:** Monthly payment and DTI update in real time

5. **Test conversational debt edit:** Say `Actually my debts are 800 dollars.`
   - ✅ **VERIFY:** Panel updates with new monthly debt

### Phase 4 — Findings Delivery (Purchase FD1)

1. **Say:** `Submit for review.`
2. ✅ **VERIFY:** Ailana delivers FD1 script containing:
   - *"Wonderful news"* + your name
   - Mentions *"pre-qualification letter"*
   - Mentions *"email on file"*
   - Offers loan officer connection or callback
3. ✅ **VERIFY:** Button text changes to **"Review Submitted ✓"**

4. **Test LO handoff — Option A:** Say `Connect me to a loan officer now.`
   - ✅ **VERIFY:** Ailana says *"Connecting you with a licensed loan officer now"*
   - ✅ **VERIFY:** MLO transfer popup appears on screen

5. **OR Test LO handoff — Option B:** Say `Schedule a callback for tomorrow at 2 PM.`
   - ✅ **VERIFY:** Ailana confirms the scheduled callback

---

## 🔄 TEST 2: Refinance — Rate & Term (TT-REF / refiRT)

### Phase 1 — Intent Routing

1. **Refresh the page** for a new session
2. **Say:** `I want to refinance my mortgage.`
3. ✅ **VERIFY in backend logs:**
   ```
   🎯 Stage 1 Goal Classified: refinance -> transaction_type=TT-REF
   ```
4. Ailana confirms: *"Got it — let's take a look at your refinance options."*
5. Complete Stage 1:
   - Occupancy → `Primary residence.`
   - Existing relationship → `First time.`
   - Timeline → `2 months.`
   - Co-borrower → `Just me.`

### Phase 2 — Refinance Discovery (RQ14–RQ29)

Answer in this exact order (matches GAP-3 corrected sequence):

| # | Field | You Say | Log to Verify |
|---|---|---|---|
| 1 | Income | `135000 dollars` | `gross_annual_income=135000` |
| 2 | Debts | `600 a month` | `monthly_debt=600` |
| 3 | Credit | `740` | `credit_range=740` |
| 4 | Current loan type (RQ-LOANTYPE) | `It is a Conventional mortgage` | `current_mortgage_type=conventional` |
| 5 | Refinance goal (RQ14) | `I want to lower my rate and monthly payment` | `refinance_type=rate_term` |
| 6 | Property value (RQ23) | `450000 dollars` | `property_value=450000` |
| 7 | Current balance (RQ22) | `280000 dollars` | `first_mortgage_balance=280000` |
| 8 | Current rate (RQ21) | `7.25 percent` | `current_mortgage_rate=7.25` |
| 9 | Monthly payment (RQ24) | `2400 dollars including taxes and insurance` | `current_mortgage_payment=2400` |
| 10 | Remaining term (RQ25) | `24 years left` | `remaining_term_years=24` |
| 11 | Closing costs (RQ-CLOSINGCOSTS) | `I'd prefer to roll them into the loan` | `closing_costs_preference=rolled_in` |
| 12 | Employer (RQ-EMPLOYER) | `Acme Tech for 6 years as a software engineer` | `job_tenure_type=...` |

✅ **VERIFY:** Two-Path Choice is delivered after employer question.
✅ **VERIFY:** No purchase-only questions were asked (no rent/own, no realtor, no down payment, no property type, no military).

### Phase 3 — Refinance Panel (refiRT)

1. **Say:** `Build it with what I shared.`
2. ✅ **VERIFY in backend logs:**
   ```
   Path B chosen via LLM — Stated-Data Mode
   ```
3. ✅ **VERIFY on screen:**
   - Header says **"Refinance Summary"** (NOT "Affordability Summary")
   - Shows Home Value: `$450,000`
   - Shows Current Balance: `$280,000`
   - Shows LTV ≈ 62.2%
   - Shows **Monthly Savings Delta** (Current vs. New payment comparison)
   - Sliders work (payoff balance, rate, term)

### Phase 4 — Refinance Findings (RFD1)

1. **Say:** `Submit for review.`
2. ✅ **VERIFY:** Ailana delivers **RFD1** script:
   - *"Good news"* + your name
   - *"conditionally eligible for the refinance scenario"*
   - *"payment comparison is on your screen"*
   - Does **NOT** mention pre-qualification letter
   - Offers loan officer connection
3. **Say:** `Connect me to a loan officer.`
4. ✅ **VERIFY:** LO handoff triggered

---

## 💰 TEST 3: Refinance — Cash-Out (TT-REF / refiCO)

> You can combine this with Test 2 by choosing cash-out instead of rate & term at step 5.

1. **Refresh the page**, complete Stage 1 as refinance
2. At the refinance goal question, **say:** `I want to take cash out for home improvements.`
3. ✅ **VERIFY:** `refinance_type=cash_out`
4. Continue through property value, balance, rate, payment, term, closing costs
5. **When asked cash-out amount:** `50000 dollars.`
   - ✅ **VERIFY:** `cash_out_amount=50000`
6. Complete employer → Two-Path → `Build it with what I shared.`

### Phase 3 — Cash-Out Panel (refiCO)

✅ **VERIFY on screen:**
- Header says **"Cash-Out Refinance Summary"**
- Shows New Total Loan: `$280,000 + $50,000 = $330,000`
- Shows LTV ≈ 73.3% (within 80% limit)
- Shows estimated cash to borrower
- **80% LTV cap test:** Try increasing cash-out via slider beyond 80% LTV
  - ✅ **VERIFY:** Warning appears: *"Cash-out capped at 80% LTV limit"*

---

## 💳 TEST 4: HELOC Track (TT-HEL)

### Phase 1 — Intent Routing

1. **Refresh the page** for a new session
2. **Say:** `I want to tap my home equity with a HELOC.`
3. ✅ **VERIFY in backend logs:**
   ```
   🎯 Stage 1 Goal Classified: heloc -> transaction_type=TT-HEL
   ```
4. Ailana confirms: *"A home equity line of credit is a great way to put your equity to work."*
5. Complete Stage 1:
   - Occupancy → `Primary residence.`
   - Existing relationship → `First time.`
   - Timeline → `As soon as possible.`
   - Co-borrower → `Just me.`

### Phase 2 — HELOC Discovery (HQ14–HQ26)

| # | Field | You Say | Log to Verify |
|---|---|---|---|
| 1 | Income | `140000 dollars a year` | `gross_annual_income=140000` |
| 2 | Debts | `500 a month` | `monthly_debt=500` |
| 3 | Credit | `760` | `credit_range=760` |
| 4 | **Risk Disclosure (HQ16/HQ19)** | *(Ailana delivers mandatory disclosure about variable rates, foreclosure risk, and 10→20yr transition)* → `Yes, that makes sense.` | `heloc_risk_acknowledged=true` |
| 5 | Rate comfort (HQ24) | `I'm comfortable with a variable rate` | `heloc_rate_comfort=variable` |
| 6 | Property value (HQ20) | `500000 dollars` | `property_value=500000` |
| 7 | 1st mortgage balance (HQ21) | `250000 dollars` | `first_mortgage_balance=250000` |
| 8 | Credit line amount (HQ22) | `75000 dollars` | `heloc_line_amount=75000` |
| 9 | Use of funds (HQ23) | `Kitchen and bath remodel` | `heloc_draw_use=...` |
| 10 | Employer | `Global Logistics for 4 years` | `job_tenure_type=...` |

✅ **CRITICAL PHASE 2 CHECKS:**
- [ ] Risk disclosure (HQ16/HQ19) was delivered **proactively** by Ailana (not only if you ask)
- [ ] Risk disclosure mentions **3 things**: variable rate, foreclosure/lien, and 10→20yr repayment transition
- [ ] Rate comfort question (HQ24) was asked
- [ ] No purchase-only questions appeared (no rent/own, realtor, down payment, property type, military)
- [ ] No refi-only questions appeared (no current rate, current payment, remaining term, closing costs)

### Phase 3 — HELOC Panel

1. **Say:** `Build it with what I shared.`
2. ✅ **VERIFY on screen:**
   - Header says **"HELOC Summary"**
   - Home Value: `$500,000`
   - 1st Mortgage: `$250,000` (50% LTV)
   - Shows max available line at 85% CLTV: `($500K × 85%) − $250K = $175,000`
   - Requested credit line: `$75,000`
   - Combined CLTV ≈ 65.0%
   - **Draw Period Payment (Interest-Only)** shown (e.g., ~$531/mo at 8.5%)
   - **Repayment Period Payment (P&I)** shown with label *"After 10-yr draw period (yr 11-30)"*
   - Sliders work (credit line amount, draw rate)

### Phase 4 — HELOC Findings (HFD1)

1. **Say:** `Submit for review.`
2. ✅ **VERIFY:** Ailana delivers **HFD1** script:
   - *"Good news"* + your name
   - *"conditionally eligible for a home equity line of credit"*
   - *"available credit line is on your screen"*
   - Mentions *"formal application, appraisal scheduling, and the terms"*
   - Does **NOT** mention pre-qualification letter
   - Offers loan officer connection
3. **Say:** `Schedule a callback for Friday at 10 AM.`
4. ✅ **VERIFY:** Callback confirmed

---

## 🔁 TEST 5: Regression Verification

After completing all track tests above, verify nothing broke:

### 5A — Cross-Track Isolation
- [ ] Purchase flow did NOT ask refinance questions (current rate, loan type, closing costs)
- [ ] Refinance flow did NOT ask purchase questions (rent/own, realtor, down payment, military)
- [ ] HELOC flow did NOT ask purchase or refinance questions
- [ ] Each panel showed the correct header (Affordability Summary / Refinance Summary / Cash-Out Refinance Summary / HELOC Summary)

### 5B — Automated Verification

Run these commands and verify all pass:

```bash
# Terminal — Backend TypeScript check (expect 0 errors)
cd backend
npx tsc --noEmit

# Terminal — Frontend TypeScript check (expect 0 errors)
cd ..
npx tsc --noEmit

# Terminal — Full test suite (expect ALL 10 PASSED)
cd backend
npm test
```

✅ **Expected output:**
```
======================================================
✨ ALL 10 CONVERGENTAI UNIT & INTEGRATION TEST SUITES PASSED!
======================================================
```

### 5C — Findings Script Isolation Check

| Track | Findings Type | Pre-Qual Letter? | Mentions Payment Comparison? | Mentions Credit Line? |
|-------|--------------|-------------------|------------------------------|----------------------|
| Purchase (TT-PUR) | FD1 | ✅ YES — emailed | ❌ No | ❌ No |
| Refinance (TT-REF) | RFD1 | ❌ NO | ✅ YES — on screen | ❌ No |
| HELOC (TT-HEL) | HFD1 | ❌ NO | ❌ No | ✅ YES — on screen |

---

## ⚠️ Known Issues (Deferred)

These are documented issues found during Phase 5 QA that do not block testing:

1. **HQ25 & HQ26 missing** — HELOC flow does not ask about prior HELOC history or fund access timeline
2. **TT-HEQ dead-end** — "Fixed home equity loan" intent routes to HELOC questions
3. **Pre-qual letter email not invoked** — `sendPrequalLetterEmail()` is imported but not called at runtime
4. **VA subsequent-use fee** — No question asks first-time vs. subsequent VA use (defaults to 2.15%)
