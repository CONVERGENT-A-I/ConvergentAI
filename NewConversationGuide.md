# Complete 3-Track Conversation & Testing Guide (v8.8)

This master testing guide provides exact word-for-word conversation scripts to verify all three transaction tracks supported by Ailana under the **v8.8 specification**:
1. **Track 1: Home Purchase Mortgage (`TT-PUR`)** — Includes Stage 1 discovery, Stage 2 financial qualification, Stage 3A secure account setup (First/Last name split, Contact Confirmation card, 4-field OTP modal, Soft-Pull consent, Prefill walkthrough), Stage 2.5 Affordability Panel (Verified vs Stated), Prequal Letter generation, and Stage 5 Closing handoff.
2. **Track 2: Refinance (`TT-REF`)** — Covers Rate-and-Term (`refiRT`), Cash-Out (`refiCO`), Sub-track routing (Conventional, FHA, VA, USDA), Stage 3A secure verification, Refinance Affordability Panel, `RFD1`/`RFD2` findings, and Stage 5 Closing handoff.
3. **Track 3: Home Equity Line of Credit (`TT-HEL`) & Home Equity Loan (`TT-HEQ`)** — Covers Equity Access, Variable vs Fixed preferences, Collateral Risk disclosure, Stage 3A secure verification, CLTV Draw Limits, `HFD1`/`HFD2` findings, and Stage 5 Closing handoff.

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
1. **Ailana:** *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you explore purchasing, refinancing, or home equity lines of credit (HELOCs). What questions do you have for me today?"*
   * **You:** `I want to buy a new home.`
2. **Ailana (Occupancy):** *"Will this be a home you'll be living in yourself, or are you looking at this as an investment property?"*
   * **You:** `This will be my primary residence.`
3. **Ailana (Relationship):** *"Have you worked with your lending institution before for a mortgage, or is this your first time exploring this with us?"*
   * **You:** `This is my first time.`
4. **Ailana (Timeline):** *"Roughly when are you hoping to be in your new home...?"*
   * **You:** `In the next 3 months.`
5. **Ailana (Co-borrower):** *"Will you be applying on your own, or with a co-borrower?"*
   * **You:** `I am applying on my own.`
6. **Ailana (Income):** *"...what's your gross annual household income before taxes?"*
   * **You:** `85000 dollars annually.`
7. **Ailana (Debts):** *"...could you tell me about your recurring monthly debt payments?"*
   * **You:** `1000 dollars only.`
8. **Ailana (Credit Score):** *"...how would you describe your credit score?"*
   * **You:** `700 is my credit score.`
9. **Ailana (Down Payment):** *"Now, how much do you have available for a down payment and your initial closing costs?"*
   * **You:** `20000 dollars.`
10. **Ailana (Rent vs Own):** *"Do you currently rent your home, or do you already own and plan to sell?"*
    * **You:** `I am currently renting.`
11. **Ailana (Realtor):** *"And have you already connected with a real estate agent, or are you still looking for one?"*
    * **You:** `No, I don't need any agents.`
12. **Ailana (Target Price):** *"Moving on — do you have a general target purchase price range in mind for your new home?"*
    * **You:** `300000 dollars.`
13. **Ailana (Property Type & Location):** *"What type of home are you looking for — such as a single-family home, condo, townhome, or multi-family — and what city or zip code are you looking in?"*
    * **You:** `Single family home in San Antonio, Texas, 78242.`
14. **Ailana (Military History):** *"Do you have any military service history...?"*
    * **You:** `No, I don't have any military background.`
15. **Ailana (Job Tenure & Income Type):** *"...could you tell me how long you've been with your current employer and whether your income is salary, hourly, or if you're self-employed?"*
    * **You:** `I am salaried and working since last 5 years.`
16. **Ailana (Stage 2 Closing Offer — Two-Path Choice):**
    * *"Great work exploring your numbers. You have two good ways to see your affordability picture: First, with your authorization, a soft credit review pulls your actual credit profile and debts... Alternatively, we can build your affordability summary right now using the estimates you've already shared... Which path would you prefer?"*

---

### Step 2: Choose Path A or Path B

#### Option A: Verified Soft-Pull Mode (v8.8 Flow)
1. **You:** `Let's run the soft credit review.`
2. **Ailana (`contact_first_name`):** *"Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your first name?"*
   * **You:** `David`
3. **Ailana (`contact_last_name`):** *"Thank you. And what's your last name?"*
   * **You:** `Miller`
4. **Ailana (`contact_email` & `contact_mobile`):** *"Great. Now, what email address and mobile number would you like to use for your account?"*
   * **You:** `david.miller@example.com and mobile is 555-0199`
5. **Contact Information Confirmation Display (New v8.8 Card):**
   * **UI Action:** A confirmation card displays with:
     * **First Name:** David
     * **Last Name:** Miller
     * **Email Address:** david.miller@example.com
     * **Phone Number:** 555-0199
   * **Ailana (`contact_confirm_display`):** *"I've captured your details. Please review the information displayed on your screen, and let me know if everything looks correct."*
   * **You:** Click **"This looks correct"** or say `Yes, everything looks correct.`
6. **OTP Verification Modal (Updated v8.8 Modal):**
   * **UI Action:** The OTP Modal opens displaying the 4 validated fields (First Name, Last Name, Email, Mobile).
   * **Ailana (`otp_verification`):** *"I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely when it arrives, and you're all set."*
   * **Action:** Enter the 6-digit verification code in the modal (e.g. `123456` from backend terminal console).
7. **Ailana (`soft_pull_authorization` — Verbatim Disclosure):**
   * *"Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"*
   * **You:** `Yes, I authorize.`
8. **Prefill Verification Walkthrough:**
   * **Ailana (Name & Address):** *"Thank you. I've processed that soft pull. First, I have your name and address listed as David Miller, 123 Elm Street, San Antonio, TX. Does that sound right, or is anything out of date?"* $\rightarrow$ **You:** `That's correct.`
   * **Ailana (Employer):** *"Great. Next, I have your employer listed as TechCorp for 5 years. Does that sound correct, or has anything changed?"* $\rightarrow$ **You:** `Yes, that's right.`
   * **Ailana (Accounts):** *"Perfect. For your accounts summary, I have 2 revolving credit lines and 1 auto installment loan. Does that match what you know, or is anything off?"* $\rightarrow$ **You:** `That matches.`
   * **Ailana (Credit Range):** *"Lastly, we retrieved your credit profile showing a category rating in the Good (670-739) range. Does that match what you expect or is anything out of date?"* $\rightarrow$ **You:** `Yes, that matches.`
9. **Stage 2.5 Verified Affordability Panel:**
   * Verified panel opens with `$300,000` target purchase price, `$20,000` down payment, and locked bureau debts.
   * **Reset Button:** Sliders reset to borrower-stated baseline values ($300k price, $20k down).

#### Option B: Stated-Data Mode (Explore First)
1. **You:** `Build my summary right now.`
2. **Stage 2.5 Stated Affordability Panel:** Opens immediately with zero contact collection required.
3. **Conversational Debt Edit:** Say `Actually my debts are 800 dollars.` $\rightarrow$ Watch panel recalculate in real-time.
4. **Upgrade to Verified:** Say `Upgrade me to verified mode.` or click **"Upgrade to Verified"** $\rightarrow$ Initiates Step 2 Option A OTP Gate above.

---

### Step 3: Track 1 Closing (Stage 4 AUS Findings Delivery & Stage 5 Loan Officer Handoff)
1. **Submit Review:** Click the **"Submit for review"** button on the panel or say `Submit my review`.
2. **Ailana (FD1 Conditional Approval & Pre-Qualification Letter):**
   > *"Wonderful news, David — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built! Your formal pre-qualification letter has been generated and emailed to you. Your assigned licensed loan officer will reach out to walk you through next steps — or I can connect you right now if you'd like. Which would you prefer?"*
3. **Prequal Letter Verification:** Backend console logs confirm PDF generation and email dispatch:
   `[Email-Service]: Pre-Qualification Letter successfully delivered to david.miller@example.com`
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
1. **Ailana:** *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you explore purchasing, refinancing, or home equity lines of credit (HELOCs). What questions do you have for me today?"*
   * **You:** `I want to refinance my mortgage.`
   * *Verify:* Ailana confirms: *"Got it — let's take a look at your refinance options."* Sets `transaction_type = 'TT-REF'`.
2. **Ailana (Occupancy):** *"Will this be for a home you live in, or is it an investment property?"*
   * **You:** `Primary residence.`
3. **Ailana (Relationship):** *"Have you worked with your lending institution before for a mortgage, or is this your first time exploring this with us?"*
   * **You:** `First time.`
4. **Ailana (Timeline):** *"Roughly when are you looking to get this refinance completed?"*
   * **You:** `Within 2 months.`
5. **Ailana (Co-borrower):** *"Will you be applying on your own, or with a co-borrower?"*
   * **You:** `Just me.`

---

### Step 2: Stage 2 Refinance Discovery (`RQ14`–`RQ29`)
1. **Ailana (Income):** *"To start, what is your gross annual household income before taxes?"*
   * **You:** `135000 dollars.`
2. **Ailana (Debts):** *"Next, do you have any recurring monthly debts, such as car payments, credit cards, or student loans?"*
   * **You:** `600 a month.`
3. **Ailana (Credit Score):** *"And how would you describe your current credit score, or which tier do you think it falls into?"*
   * **You:** `740.`
4. **Ailana (RQ-LOANTYPE - Loan Type):** *"Now, thinking about your current loan, is your present mortgage a Conventional, FHA, VA, or USDA loan?"*
   * **You:** `It is a Conventional mortgage.` *(or VA / FHA / USDA)*
5. **Ailana (Refinance Overview / Goal):**
   * *Ailana provides Conventional Sub-track overview:* *"Since you have a conventional loan, your two main refinance options are a Rate-and-Term Refinance — which changes your interest rate, loan term, or loan structure — or a Cash-Out Refinance, which lets you access your home's equity in a lump sum. Are you primarily looking to lower your rate or payment, shorten your term, or access cash from your equity?"*
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
11. **Ailana (RQ-CLOSINGCOSTS - Closing Costs Preference):** *"Do you wish to pay for the closing costs out of pocket, or would you prefer to have these costs rolled into and included in your new mortgage amount?"*
    * **You:** `I'd prefer to roll them into the new loan.`
12. *(If Cash-Out selected)* **Ailana (RQ27 - Cash-Out Amount):** *"If you are considering a cash-out refinance, roughly how much cash are you looking to access and what would you use it for?"*
    * **You:** `50000 dollars for home renovations.`
13. **Ailana (RQ28 - Prior Refinance):** *"Have you refinanced this property before?"*
    * **You:** `No, never.`
14. **Ailana (RQ29 - Stay Duration):** *"How long do you plan to stay in the home?"*
    * **You:** `At least 10 years.`
15. **Ailana (RQ-EMPLOYER - Employer & Tenure):**
    * *"You're giving me a really clear picture of your refinance goals — just a few more quick questions and we'll be ready to run your numbers. What is the name of your current employer and how long have you been with them?"*
    * **You:** `Acme Tech for 6 years as a software engineer.`
16. **Ailana (Stage 2 Closing Offer — Two-Path Choice):**
    * *"Great work exploring your numbers. You have two good ways to see your affordability picture: First, with your authorization, a soft credit review pulls your actual credit profile and debts... Alternatively, we can build your refinance summary right now using the estimates you've already shared... Which path would you prefer?"*

---

### Step 3: Choose Path A or Path B

#### Option A: Verified Soft-Pull Mode (v8.8 Flow)
1. **You:** `Let's do the soft credit review.`
2. **Ailana (`contact_first_name`):** *"Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your first name?"*
   * **You:** `Sarah`
3. **Ailana (`contact_last_name`):** *"Thank you. And what's your last name?"*
   * **You:** `Jenkins`
4. **Ailana (`contact_email` & `contact_mobile`):** *"Great. Now, what email address and mobile number would you like to use for your account?"*
   * **You:** `sarah.jenkins@example.com and mobile is 555-0144`
5. **Contact Information Confirmation Display (New v8.8 Card):**
   * **UI Action:** A confirmation card displays with:
     * **First Name:** Sarah
     * **Last Name:** Jenkins
     * **Email Address:** sarah.jenkins@example.com
     * **Phone Number:** 555-0144
   * **Ailana (`contact_confirm_display`):** *"I've captured your details. Please review the information displayed on your screen, and let me know if everything looks correct."*
   * **You:** Click **"This looks correct"** or say `Looks good to me.`
6. **OTP Verification Modal (Updated v8.8 Modal):**
   * **UI Action:** The OTP Modal opens displaying the 4 validated fields (First Name, Last Name, Email, Mobile).
   * **Ailana (`otp_verification`):** *"I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely when it arrives, and you're all set."*
   * **Action:** Enter the 6-digit code `123456` in the modal.
7. **Ailana (`soft_pull_authorization` — Verbatim Disclosure):**
   * *"Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"*
   * **You:** `Yes, I authorize.`
8. **Prefill Verification Walkthrough:**
   * **Ailana (Name & Address):** *"Thank you. I've processed that soft pull. First, I have your name and address listed as Sarah Jenkins, 456 Oak Lane, Dallas, TX. Does that sound right, or is anything out of date?"* $\rightarrow$ **You:** `That's correct.`
   * **Ailana (Employer):** *"Great. Next, I have your employer listed as Acme Tech for 6 years. Does that sound correct, or has anything changed?"* $\rightarrow$ **You:** `Yes, that's right.`
   * **Ailana (Accounts):** *"Perfect. For your accounts summary, I have 1 first mortgage and 2 credit cards. Does that match what you know, or is anything off?"* $\rightarrow$ **You:** `That matches.`
   * **Ailana (Credit Range):** *"Lastly, we retrieved your credit profile showing a category rating in the Very Good (740-799) range. Does that match what you expect or is anything out of date?"* $\rightarrow$ **You:** `Yes, that matches.`
9. **Stage 2.5 Verified Refinance Panel:**
   * **Rate & Term Mode:** Displays home value `$450k`, payoff `$280k`, monthly savings delta card (`Current: $2,400/mo ➔ New: ~$2,080/mo (Saves ~$320/mo)`).
   * **Cash-Out Mode:** Displays `$50,000` cash payout, total new loan `$330,000` (73.3% LTV), and cash-out slider.
   * **Reset Button:** Sliders reset to borrower-stated baseline values ($280k balance, 7.25% current rate).

#### Option B: Stated-Data Mode (Explore First)
1. **You:** `Build it with what I shared.`
2. **Stage 2.5 Stated Refinance Panel:** Opens immediately without collecting contact info.
3. **Interactive Exploration:** Adjust loan balance or interest rate sliders to model payment savings.
4. **Upgrade:** Say `Upgrade to verified mode` or click the upgrade button to run soft-pull OTP gate.

---

### Step 4: Track 2 Closing (Stage 4 AUS Findings & Stage 5 Loan Officer Handoff)
1. **Submit Review:** Click **"Submit for review"** on the panel or say `Submit for review`.
2. **Ailana (RFD1 Conditional Eligibility Script):**
   > *"Good news, Sarah — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for the refinance scenario you built. Your estimated payment comparison is on your screen now — it shows your estimated new payment alongside your current payment reference point. Your licensed loan officer will reach out to walk you through next steps and lock in your rate — or I can connect you right now if you'd like."*
   *(Note: Per SAFE Act compliance, refinances do not issue a pre-qualification letter; they deliver on-screen conditional findings and direct MLO connection).*
3. **Ailana (RFD2 Refer Script — Alternative Scenario if DTI/LTV exceeds limits):**
   > *"Thank you for your patience, Sarah — your review is back, and your refinance scenario warrants a closer look from a licensed loan officer rather than an automated decision. That is common in refinance situations, and it is often where the best solutions are found — your loan officer can evaluate options like streamline programs or specific equity structures the automated review does not fully cover. Can I connect you to a licensed loan officer now, or schedule a callback?"*
4. **Closing Choice A (Live SIP Transfer):**
   * **You:** `Connect me to a loan officer now.`
   * **Ailana:** *"Connecting you with a licensed loan officer now — one moment please."*
   * **UI Action:** Automatic SIP bridge to Queue $\rightarrow$ In-call screen $\rightarrow$ Centered Call Complete Screen $\rightarrow$ Return to Ailana.
5. **Closing Choice B (Scheduled Callback):**
   * **You:** `Schedule a callback for tomorrow at 3 PM.`
   * **Ailana:** *"Perfect, I've scheduled a callback with a licensed loan officer for tomorrow at 3 PM. Thank you for exploring your options with us today!"*

---

# 💳 TRACK 3: Home Equity Line of Credit (`TT-HEL`) & Loan (`TT-HEQ`)

### Step 1: Stage 1 Intent Routing
1. **Ailana:** *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you explore purchasing, refinancing, or home equity lines of credit (HELOCs). What questions do you have for me today?"*
   * **You:** `I want to tap my home equity with a HELOC.`
   * *Verify:* Ailana recognizes HELOC immediately:
     *"A home equity line of credit is a great way to put your equity to work. Just to make sure we explore the right options — are you looking for a flexible line of credit you can draw from as needed, or a fixed loan amount with a set monthly payment?"*
   * **You:** `A flexible line of credit I can draw from as needed.` *(routes to `TT-HEL`; choosing fixed loan routes to `TT-HEQ`)*
2. **Ailana (Occupancy):** *"Will this be for your primary home, a secondary home, or perhaps an investment property?"*
   * **You:** `Primary residence.`
3. **Ailana (Relationship):** *"Have you worked with your lending institution before for a mortgage, or is this your first time exploring this with us?"*
   * **You:** `First time.`
4. **Ailana (Timeline):** *"Roughly when are you hoping to access the equity?"*
   * **You:** `As soon as possible.`
5. **Ailana (Co-borrower):** *"Will you be applying on your own, or with a co-borrower?"*
   * **You:** `Applying on my own.`

---

### Step 2: Stage 2 HELOC Discovery (`HQ14`–`HQ26`)
1. **Ailana (Income):** *"To start, what is your gross annual household income before taxes?"*
   * **You:** `140000 dollars a year.`
2. **Ailana (Debts):** *"Next, could you tell me about your total recurring monthly debts?"*
   * **You:** `500 a month.`
3. **Ailana (Credit Score):** *"And how about your credit score?"*
   * **You:** `760.`
4. **Ailana (HQ16/HQ19 - Mandatory Collateral Risk & Repayment Disclosure):**
   * *"Before we look at numbers, there are three key things to keep in mind with a HELOC: first, your home secures the line of credit; second, rates are typically variable; and third, after the 10-year draw period ends, payments increase during the 20-year repayment period to include principal and interest. Does that structure make sense for what you have in mind?"*
   * **You:** `Yes, that structure makes sense.`
5. **Ailana (HQ24 - Rate Comfort):**
   * *"Are you comfortable with a variable interest rate that can adjust with the market, or is fixed payment predictability more important to you?"*
   * **You:** `I'm comfortable with a variable rate.`
6. **Ailana (HQ20 - Property Value):** *"Do you have a sense of what your home is currently worth? An estimate is fine."*
   * **You:** `500000 dollars.`
7. **Ailana (HQ21 - First Mortgage Balance):** *"And roughly how much do you still owe on your current first mortgage, or any other loans on the home?"*
   * **You:** `250000 dollars.`
8. **Ailana (HQ22 - Desired Credit Line):** *"How much of a credit line are you hoping to access?"*
   * **You:** `75000 dollars.`
9. **Ailana (HQ23 - Use of Funds):** *"What are you planning to use the funds for — such as home improvements, debt consolidation, or an emergency reserve?"*
   * **You:** `Kitchen and bath remodel.`
10. **Ailana (HQ25 - Prior HELOC):** *"Have you had a HELOC on this property before?"*
    * **You:** `No, never.`
11. **Ailana (HQ26 - Access Timeline):** *"How quickly are you hoping to access the funds?"*
    * **You:** `Within the next month.`
12. **Ailana (HQ-EMPLOYER - Employer & Tenure):** *"What is the name of your current employer and how long have you been with them?"*
    * **You:** `Global Logistics for 4 years.`
13. **Ailana (Stage 2 Closing Offer — Two-Path Choice):**
    * *"Great work exploring your numbers. You have two good ways to see your affordability picture: First, with your authorization, a soft credit review pulls your actual credit profile and debts... Alternatively, we can build your home equity summary right now using the estimates you've already shared... Which path would you prefer?"*

---

### Step 3: Choose Path A or Path B

#### Option A: Verified Soft-Pull Mode (v8.8 Flow)
1. **You:** `Let's do the soft credit review.`
2. **Ailana (`contact_first_name`):** *"Perfect. Before we run your review, I'll need a few details to set up your secure account. First — what's your first name?"*
   * **You:** `Michael`
3. **Ailana (`contact_last_name`):** *"Thank you. And what's your last name?"*
   * **You:** `Chang`
4. **Ailana (`contact_email` & `contact_mobile`):** *"Great. Now, what email address and mobile number would you like to use for your account?"*
   * **You:** `mchang@example.com and mobile is 555-0182`
5. **Contact Information Confirmation Display (New v8.8 Card):**
   * **UI Action:** A confirmation card displays with:
     * **First Name:** Michael
     * **Last Name:** Chang
     * **Email Address:** mchang@example.com
     * **Phone Number:** 555-0182
   * **Ailana (`contact_confirm_display`):** *"I've captured your details. Please review the information displayed on your screen, and let me know if everything looks correct."*
   * **You:** Click **"This looks correct"** or say `Yes, everything looks correct.`
6. **OTP Verification Modal (Updated v8.8 Modal):**
   * **UI Action:** The OTP Modal opens displaying the 4 validated fields (First Name, Last Name, Email, Mobile).
   * **Ailana (`otp_verification`):** *"I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely when it arrives, and you're all set."*
   * **Action:** Enter the 6-digit code `123456` in the modal.
7. **Ailana (`soft_pull_authorization` — Verbatim Disclosure):**
   * *"Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way. You are the one authorizing it, and your data is used only to process your initial eligibility review and pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"*
   * **You:** `Yes, I authorize.`
8. **Prefill Verification Walkthrough:**
   * **Ailana (Name & Address):** *"Thank you. I've processed that soft pull. First, I have your name and address listed as Michael Chang, 789 Pine Ridge, Austin, TX. Does that sound right, or is anything out of date?"* $\rightarrow$ **You:** `That's correct.`
   * **Ailana (Employer):** *"Great. Next, I have your employer listed as Global Logistics for 4 years. Does that sound correct, or has anything changed?"* $\rightarrow$ **You:** `Yes, that's right.`
   * **Ailana (Accounts):** *"Perfect. For your accounts summary, I have 1 mortgage loan and 1 credit card. Does that match what you know, or is anything off?"* $\rightarrow$ **You:** `That matches.`
   * **Ailana (Credit Range):** *"Lastly, we retrieved your credit profile showing a category rating in the Very Good (740-799) range. Does that match what you expect or is anything out of date?"* $\rightarrow$ **You:** `Yes, that matches.`
9. **Stage 2.5 Verified HELOC Affordability Panel:**
   * **Equity Position & CLTV:**
     * Home Value: `$500,000` | 1st Mortgage: `$250,000` (50% LTV)
     * Maximum Available Line at 85% CLTV: `($500,000 × 85%) - $250,000 = $175,000 max line`.
     * Requested Line: `$75,000` (Combined CLTV $\approx 65.0\%$).
   * **Payment Modeling Breakdown:**
     * **Draw Period Payment (Interest-Only):** e.g. `$531/mo` at 8.5% draw rate.
     * **Repayment Period Payment (Amortizing P&I):** e.g. `$738/mo`.
   * **Reset Button:** Sliders reset to borrower-stated baseline values ($75,000 line, $500k value, $250k balance).

#### Option B: Stated-Data Mode (Explore First)
1. **You:** `Build it with what I shared.`
2. **Stage 2.5 Stated HELOC Panel:** Opens immediately with zero contact collection required.
3. **Interactive Sliders:** Adjust Credit Line Amount slider and Draw Rate slider to view real-time payment changes.
4. **Upgrade:** Say `Upgrade to verified mode` or click the upgrade button to run soft-pull OTP gate.

---

### Step 4: Track 3 Closing (Stage 4 AUS Findings & Stage 5 Loan Officer Handoff)
1. **Submit Review:** Click **"Submit for review"** on the panel or say `Submit for review`.
2. **Ailana (HFD1 Conditional Credit Line Approval Script):**
   > *"Good news, Michael — your eligibility review came back, and based on the information you provided, you appear conditionally eligible for a home equity line of credit. Your estimated available credit line is on your screen now. Your licensed loan officer will reach out to walk you through the next steps — including the formal application, appraisal scheduling, and the terms of your line — or I can connect you right now if you'd like."*
3. **Ailana (HFD2 Refer Script — Alternative Scenario if CLTV/DTI exceeds limits):**
   > *"Thank you for your patience, Michael — your review is back, and your HELOC scenario warrants a closer look from a licensed loan officer. Equity-based lending depends on several factors that an automated review can only partially assess, and a licensed loan officer may identify options or programs the initial review didn't capture. Can I connect you now, or schedule a callback?"*
4. **Closing Choice A (Live SIP Transfer):**
   * **You:** `Yes, connect me to a loan officer.`
   * **Ailana:** *"Connecting you with a licensed loan officer now — one moment please."*
   * **UI Action:** Automatic SIP bridge to Queue $\rightarrow$ In-call screen $\rightarrow$ Centered Call Complete Screen $\rightarrow$ Return to Ailana.
5. **Closing Choice B (Scheduled Callback):**
   * **You:** `Schedule a callback for Friday at 10 AM.`
   * **Ailana:** *"Perfect, I've scheduled a callback with a licensed loan officer for Friday at 10 AM. Thank you for exploring your options with us today!"*

---

## Part 3: Verification & Compliance Summary Table

| Stage | Feature / Flow | Purchase (`TT-PUR`) | Refinance (`TT-REF`) | HELOC (`TT-HEL`) |
|---|---|---|---|---|
| **Stage 1** | Intent Routing & Intake | Purchase intent + 4 profile questions | Refi intent + 4 profile questions | HELOC intent + Line vs Fixed question + 4 profile questions |
| **Stage 2** | Pre-Qual Discovery | 10 financial/property fields | 15 mortgage/equity fields | 12 equity/lien fields (includes mandatory risk disclosure) |
| **Stage 2 Closing** | Two-Path Choice Offer | Verbatim Path A (Soft pull) vs Path B (Stated) | Verbatim Path A (Soft pull) vs Path B (Stated) | Verbatim Path A (Soft pull) vs Path B (Stated) |
| **Stage 3A** | Step 1: First Name | `contact_first_name` | `contact_first_name` | `contact_first_name` |
| **Stage 3A** | Step 2: Last Name | `contact_last_name` | `contact_last_name` | `contact_last_name` |
| **Stage 3A** | Step 3: Email & Mobile | `contact_email` & `contact_mobile` | `contact_email` & `contact_mobile` | `contact_email` & `contact_mobile` |
| **Stage 3A** | Step 4: Contact Confirmation Card | Displays 4 fields + "This looks correct" button | Displays 4 fields + "This looks correct" button | Displays 4 fields + "This looks correct" button |
| **Stage 3A** | Step 5: OTP Verification Modal | Displays 4 validated fields + 6-digit input | Displays 4 validated fields + 6-digit input | Displays 4 validated fields + 6-digit input |
| **Stage 3A** | Step 6: Soft-Pull Consent | Verbatim statutory disclosure | Verbatim statutory disclosure | Verbatim statutory disclosure |
| **Stage 3A** | Step 7: Prefill Walkthrough | Name/Address $\rightarrow$ Employer $\rightarrow$ Accounts $\rightarrow$ Credit Tier | Name/Address $\rightarrow$ Employer $\rightarrow$ Accounts $\rightarrow$ Credit Tier | Name/Address $\rightarrow$ Employer $\rightarrow$ Accounts $\rightarrow$ Credit Tier |
| **Stage 2.5** | Affordability Panel | Purchase price, down payment, monthly payment | Refi Payoff, new rate, term, monthly savings delta | Equity position, CLTV $\le 85\%$, draw vs repayment payment |
| **Stage 2.5** | Reset Button Behavior | Resets sliders to borrower-stated values | Resets sliders to borrower-stated values | Resets sliders to borrower-stated values |
| **Stage 4** | AUS Findings Delivery | FD1 Conditional Approval + Pre-Qual PDF Letter | RFD1 Conditional Eligibility (on-screen, no letter) | HFD1 Conditional Line Approval (on-screen, no letter) |
| **Stage 5** | Loan Officer Handoff | Live SIP bridge or Scheduled callback | Live SIP bridge or Scheduled callback | Live SIP bridge or Scheduled callback |
