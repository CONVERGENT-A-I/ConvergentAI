# Complete 3-Track Conversation & Testing Guide (v8.7)

This master testing guide provides exact word-for-word conversation scripts to verify all three transaction tracks supported by Ailana under the v8.7 specification:
1. **Track 1: Home Purchase Mortgage (`TT-PUR`)** — Includes Path A (Verified), Path B (Stated), Prequal Letter generation, and Closing.
2. **Track 2: Refinance (`TT-REF`)** — Covers Rate-and-Term (`refiRT`), Cash-Out (`refiCO`), `RFD1`/`RFD2` findings, and Closing.
3. **Track 3: Home Equity Line of Credit (`TT-HEL`)** — Covers Equity Access, CLTV Draw Limits, `HFD1`/`HFD2` findings, and Closing.

---

## Part 1: Local Server Setup

Ensure both servers are running:
```bash
# Terminal 1: Backend (Port 3001)
cd backend
npm run dev

# Terminal 2: Frontend (Port 3000)
cd ..
npm run dev
```
Open your browser at: `http://localhost:3000`

---

# 🏠 TRACK 1: Home Purchase Mortgage (`TT-PUR`)

### Step 1: Stage 1 & Stage 2 Discovery
1. **Ailana:** *"Hi! I'm Ailana, your AI mortgage assistant... To get started, what mortgage questions do you have for me today?"*
   * **You:** `I want to buy a new home.`
2. **Ailana:** *"Will this be a home you'll be living in yourself, or are you looking at this as an investment property?"*
   * **You:** `This will be my primary residence.`
3. **Ailana:** *"Have you worked with your lending institution before for a mortgage, or is this your first time exploring this with us?"*
   * **You:** `This is my first time.`
4. **Ailana:** *"Roughly when are you hoping to be in your new home...?"*
   * **You:** `In the next 3 months.`
5. **Ailana:** *"Will you be applying on your own, or with a co-borrower?"*
   * **You:** `I am applying on my own.`
6. **Ailana:** *"...what's your gross annual household income before taxes?"*
   * **You:** `85000 dollars annually.`
7. **Ailana:** *"...could you tell me about your recurring monthly debt payments?"*
   * **You:** `1000 dollars only.`
8. **Ailana:** *"...how would you describe your credit score?"*
   * **You:** `700 is my credit score.`
9. **Ailana:** *"Now, how much do you have available for a down payment and your initial closing costs?"*
   * **You:** `20000 dollars.`
10. **Ailana:** *"Do you currently rent your home, or do you already own and plan to sell?"*
    * **You:** `I am currently renting.`
11. **Ailana:** *"And have you already connected with a real estate agent, or are you still looking for one?"*
    * **You:** `No, I don't need any agents.`
12. **Ailana:** *"Moving on — do you have a general target purchase price range in mind for your new home?"*
    * **You:** `300000 dollars.`
13. **Ailana:** *"What type of home are you looking for... and what city or zip code are you looking in?"* (Q42)
    * **You:** `Single family home in San Antonio, Texas, 78242.`
14. **Ailana:** *"Do you have any military service history...?"* (Q43)
    * **You:** `No, I don't have any military background.`
15. **Ailana:** *"...could you tell me how long you've been with your current employer and whether your income is salary, hourly, or if you're self-employed?"*
    * **You:** `I am salaried and working since last 5 years.`
16. **Ailana:** *"Great work exploring your numbers. You have two good ways to see your affordability picture..."* (Two-Path Choice)

---

### Step 2: Choose Path A or Path B

#### Option A: Verified Soft-Pull Mode
1. **You:** `Let's run the soft credit review.`
2. **Ailana (Name):** *"First, what's your name?"* $\rightarrow$ **You:** `David`
3. **Ailana (Contact):** *"What email and mobile number would you like to use for your account?"* $\rightarrow$ **You:** `david@example.com and mobile is 555-0199`
4. **Ailana (OTP):** *"I've sent a one-time code to confirm your email and mobile number..."* $\rightarrow$ **You:** `123456` (from terminal)
5. **Ailana (Consent):** *"Do you authorize the soft credit inquiry on that basis?"* $\rightarrow$ **You:** `Yes, I authorize.`
6. **Prefill Verification:** Confirm prefilled items (*Name, Address, Employer, Credit*).
7. **Panel Displays:** Verified Affordability Panel opens with `$300k` target price, `$20k` down, and locked bureau debts.

#### Option B: Stated-Data Mode (Explore First)
1. **You:** `Build my summary right now.`
2. **Panel Displays:** Stated Affordability Panel opens immediately with zero contact info required.
3. **Conversational Debt Edit:** Say `Actually my debts are 800 dollars.` $\rightarrow$ Watch panel update in real time.
4. **Upgrade:** Say `Upgrade me to verified mode.` $\rightarrow$ Completes OTP gate and upgrades summary.

---

### Step 3: Track 1 Closing (Findings Delivery & Loan Officer Handoff)
1. **Submit Review:** Click the **"Submit for review"** button on the panel or say `Submit my review`.
2. **Ailana (FD1 Findings Delivery):**
   > *"Wonderful news, David — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built! Your formal pre-qualification letter has been generated and emailed to you. Your assigned licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like. Which would you prefer?"*
3. **Prequal Letter Verification:** Backend console logs confirm PDF generation and email dispatch:
   `[Email-Service]: Pre-Qualification Letter successfully delivered to david@example.com`
4. **Closing Choice A (Live SIP Transfer):**
   * **You:** `Connect me to a loan officer now.`
   * **Ailana:** *"Connecting you with a licensed loan officer now — one moment please."*
   * **UI Action:** Transitions to Queue $\rightarrow$ In-Call SIP Bridge $\rightarrow$ Centered Call Complete Screen $\rightarrow$ "Return to Ailana" resumes session.
5. **Closing Choice B (Scheduled Callback):**
   * **You:** `I would prefer a callback tomorrow at 2 PM.`
   * **Ailana:** *"Perfect, I've scheduled a callback with a licensed loan officer for tomorrow at 2 PM. Thank you for exploring your options with us today!"*

---

# 🔄 TRACK 2: Refinance (`TT-REF`)

### Step 1: Stage 1 Intent Routing
1. **Ailana:** *"Hi! I'm Ailana, your AI mortgage assistant... To get started, what mortgage questions do you have for me today?"*
   * **You:** `I want to refinance my mortgage.`
   * *Verify:* Ailana confirms: *"Got it — let's take a look at your refinance options."* Sets `transaction_type = 'TT-REF'`.
2. **Ailana asks occupancy:** *"Will this be for a home you live in, or is it an investment property?"*
   * **You:** `Primary residence.`
3. **Ailana asks existing relationship:** *"Have you worked with your lending institution before for a mortgage?"*
   * **You:** `First time.`
4. **Ailana asks timeline:** *"Roughly when are you looking to get this refinance completed?"*
   * **You:** `2 months.`
5. **Ailana asks co-borrower:** *"Will you be applying on your own, or with a co-borrower?"*
   * **You:** `Just me.`

---

### Step 2: Stage 2 Refinance Discovery (`RQ14`–`RQ29`)
1. **Ailana (Income):** *"To start, what is your gross annual household income before taxes?"*
   * **You:** `135000 dollars.`
2. **Ailana (Debts):** *"Next, do you have any recurring monthly debts, such as car payments, credit cards, or student loans?"*
   * **You:** `600 a month.`
3. **Ailana (Credit):** *"And how would you describe your current credit score, or which tier do you think it falls into?"*
   * **You:** `740.`
4. **Ailana (RQ-LOANTYPE - Loan Type):** *"Now, thinking about your current loan, is your present mortgage a Conventional, FHA, VA, or USDA loan?"*
   * **You:** `It is a Conventional mortgage.` *(or VA / FHA / USDA)*
5. **Ailana (RQ14 - Refinance Goal):** *"What are you hoping to accomplish with a refinance — lowering your rate and monthly payment, paying the loan off faster, or taking cash out?"*
   * **For Rate & Term:** `I want to lower my rate and monthly payment.`
   * **For Cash-Out:** `I want to take cash out for home improvements.`
6. **Ailana (RQ23 - Property Value):** *"Do you have a sense of what your home is currently worth? An estimate is completely fine."*
   * **You:** `450000 dollars.`
7. **Ailana (RQ22 - Current Balance):** *"And roughly how much do you still owe on your current mortgage?"*
   * **You:** `280000 dollars.`
8. **Ailana (RQ21 - Current Rate):** *"Do you know the approximate interest rate on your existing mortgage?"*
   * **You:** `7.25%.`
9. **Ailana (RQ24 - Monthly Payment):** *"What is your current monthly mortgage payment, and does that include taxes and insurance?"*
   * **You:** `2400 dollars a month including taxes and insurance.`
10. **Ailana (RQ25 - Remaining Term):** *"How many years are remaining on your current loan?"*
    * **You:** `24 years left.`
11. **Ailana (RQ-CLOSINGCOSTS - Closing Costs Preference):** *"Do you wish to pay for closing costs out of pocket, or would you prefer to have them rolled into and included in your new mortgage amount?"*
    * **You:** `I'd prefer to roll them into the loan.`
12. *(If Cash-Out selected)* **Ailana (RQ27 - Cash-Out Amount):** *"Roughly how much cash are you looking to access?"*
    * **You:** `50000 dollars.`
13. **Ailana (RQ-EMPLOYER - Employer & Tenure):** *"What is the name of your current employer and how long have you been with them?"*
    * **You:** `Acme Tech for 6 years as a software engineer.`
14. **Ailana (Two-Path Closing Offer):**
    * *"Great work exploring your numbers. You have two good ways to see your affordability picture... First, soft credit review... Alternatively, stated summary right now... Which path would you prefer?"*
    * **You:** `Build it with what I shared.` *(or Stated Mode)*

---

### Step 3: Stage 2.5 Refinance Affordability Panel Verification

#### A. Rate & Term Mode (`refiRT`):
* **Panel UI Elements**:
  * **Header**: Shows `Refinance Summary`.
  * **Home Value / Payoff**: Value `$450,000`, Current Balance `$280,000` (LTV $\approx 62.2\%$).
  * **Monthly Savings Delta Card**: Displays savings against current baseline (e.g. `Current: $2,400/mo ➔ New: $2,080/mo (Saves $320/mo)`).
  * **Interactive Sliders**: Payoff Balance, New Rate, Term (15 vs 30 yr).

#### B. Cash-Out Mode (`refiCO`):
* **Panel UI Elements**:
  * **Header**: Shows `Cash-Out Refinance Summary`.
  * **New Total Loan**: `$280,000 + $50,000 = $330,000` (LTV $\approx 73.3\% \le 80\%$ guideline).
  * **Cash-Out Payout**: Displays `$50,000` estimated cash to borrower.
  * **Interactive Sliders**: Cash-Out Amount slider, Interest Rate slider.

---

### Step 4: Track 2 Closing (Refinance Findings & Loan Officer Handoff)
1. **Submit Review:** Click **"Submit for review"** on the panel or say `Submit for review`.
2. **Ailana (RFD1 Conditional Eligibility Script):**
   > *"Good news, [Name] — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is on your screen now — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like."*
   *(Note: Per v8.7 compliance, refinances do not issue a pre-qualification letter; they provide on-screen conditional findings and direct MLO connection).*
3. **Ailana (RFD2 Refer Script - Alternative Scenario if DTI/LTV exceeds limits):**
   > *"Thank you for your patience, [Name] — your review is back, and your refinance scenario warrants a closer look from a licensed loan officer rather than an automated decision. That is common in refinance situations, and it is often where the best solutions are found — your loan officer can evaluate options like streamline programs or specific equity structures the automated review does not fully cover. Can I connect you to a licensed loan officer now, or schedule a callback?"*
4. **Closing Execution:**
   * **Live Transfer:** Say `Connect me to a loan officer.` $\rightarrow$ Automatic SIP bridge to Queue $\rightarrow$ In-call screen $\rightarrow$ Call Complete Screen $\rightarrow$ Return to Ailana.
   * **Scheduled Callback:** Say `Schedule a callback for tomorrow at 3 PM.` $\rightarrow$ Confirmed callback booking.

---

# 💳 TRACK 3: Home Equity Line of Credit (`TT-HEL`)

### Step 1: Stage 1 Intent Routing
1. **Ailana:** *"Hi! I'm Ailana, your AI mortgage assistant... To get started, what mortgage questions do you have for me today?"*
   * **You:** `I want to tap my home equity with a HELOC.`
   * *Verify:* Ailana confirms: *"A home equity line of credit is a great way to put your equity to work. Let's see what you may qualify for."* Sets `transaction_type = 'TT-HEL'`.
2. Complete Stage 1 (Primary residence, first time, ASAP, single applicant).

---

### Step 2: Stage 2 HELOC Discovery (`HQ14`–`HQ26`)
1. **Ailana (Income):** *"To start, what is your gross annual household income before taxes?"*
   * **You:** `140000 dollars a year.`
2. **Ailana (Debts):** *"Next, could you tell me about your total recurring monthly debts?"*
   * **You:** `500 a month.`
3. **Ailana (Credit):** *"And how about your credit score?"*
   * **You:** `760.`
4. **Ailana (HQ16 - Mandatory Risk Disclosure):**
   * *"There are two important risks to understand before moving forward: because your home secures the line of credit, a lender can foreclose if payments are not made, and most HELOCs carry a variable interest rate that changes with the market. Does this make sense for how you're thinking about a HELOC?"*
   * **You:** `Yes, that makes sense.`
5. **Ailana (HQ24 - Rate Comfort):** *"Are you comfortable with a variable interest rate, or is payment predictability important to you?"*
   * **You:** `I'm comfortable with a variable rate.` *(or `I prefer fixed predictability`)*
6. **Ailana (HQ20 - Property Value):** *"Do you have a sense of what your home is currently worth? An estimate is perfectly fine."*
   * **You:** `500000 dollars.`
7. **Ailana (HQ21 - First Mortgage Balance):** *"And roughly how much do you still owe on your current first mortgage?"*
   * **You:** `250000 dollars.`
8. **Ailana (HQ22 - Desired Credit Line):** *"Now, thinking about the credit line itself, how much are you hoping to access?"*
   * **You:** `75000 dollars.`
9. **Ailana (HQ23 - Use of Funds):** *"And what are you planning to use the funds for?"*
   * **You:** `Kitchen and bath remodel.`
10. **Ailana (Employer & Tenure):** *"What is the name of your current employer and how long have you been with them?"*
    * **You:** `Global Logistics for 4 years.`
11. **Ailana (Two-Path Closing Offer):**
    * *"Great work exploring your numbers. You have two good ways to see your affordability picture... Which path would you prefer?"*
    * **You:** `Build it with what I shared.` *(or Stated Mode)*

---

### Step 3: Stage 2.5 HELOC Affordability Panel Verification
* **Panel UI Elements (`heloc` Mode)**:
  * **Header**: Displays `HELOC Summary`.
  * **Equity Position & CLTV**:
    * Home Value: `$500,000` | 1st Mortgage: `$250,000` (50% LTV)
    * Maximum Available Line at 85% CLTV: `($500,000 × 85%) - $250,000 = $175,000 max line`.
  * **Requested Credit Line**: `$75,000` (Combined CLTV $\approx 65.0\%$).
  * **Payment Modeling Breakdown**:
    * **Draw Period Payment (Interest-Only)**: e.g. `$531/mo` at 8.5% draw rate.
    * **Repayment Period Payment (Amortizing P&I)**: e.g. `$738/mo`.
  * **Interactive Sliders**: Credit Line Amount slider, Draw Rate slider.

---

### Step 4: Track 3 Closing (HELOC Findings & Loan Officer Handoff)
1. **Submit Review:** Click **"Submit for review"** on the panel or say `Submit for review`.
2. **Ailana (HFD1 Conditional Credit Line Approval Script):**
   > *"Good news, [Name] — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your estimated available credit line is on your screen now. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like."*
3. **Ailana (HFD2 Refer Script - Alternative Scenario if CLTV/DTI exceeds limits):**
   > *"Thank you for your patience, [Name] — your review is back, and your HELOC scenario warrants a closer look from a licensed loan officer. Equity-based lending depends on several factors that an automated review can only partially assess, and a licensed loan officer may identify options or programs the initial review didn't capture. Can I connect you now, or schedule a callback?"*
4. **Closing Execution:**
   * **Live Transfer:** Say `Yes, connect me to a loan officer.` $\rightarrow$ Automatic SIP bridge to Queue $\rightarrow$ Live call $\rightarrow$ Call Complete Screen $\rightarrow$ Return to Ailana.
   * **Scheduled Callback:** Say `Schedule a callback for Friday at 10 AM.` $\rightarrow$ Confirmed callback booking.

