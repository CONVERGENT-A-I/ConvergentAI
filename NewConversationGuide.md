# Step-by-Step Affordability Panel Walkthrough & Testing Guide (v8.7 Two-Path Flow)

This guide describes the complete end-to-end conversation flows to verify Stage 2.5 under the v8.7 specification, covering both **Path A (Soft Credit Review / Verified Mode)** and **Path B (Stated-Data Mode / Explore First)**.

---

## Part 1: Start the Servers
Make sure both servers are running locally.
1. **Node.js Backend:** (Runs on port `3001`)
   ```bash
   cd backend
   npm run dev
   ```
2. **Next.js Frontend:** (Runs on port `3000`)
   ```bash
   npm run dev
   ```

Open your browser and navigate to: `http://localhost:3000`

---

## Part 2: Conversation Script Walkthrough

Type or say these exact messages to Ailana to progress the conversation:

### Phase 1: Pre-Qualification Discovery (Stage 1 & Stage 2)
1. **Ailana:** *"Hi! I am Ailana, an AI mortgage assistant... What questions do you have for me today?"*
   * **You:** `I want to buy a new home`
2. **Ailana:** *"Will this new home be your primary residence...?"*
   * **You:** `primary residence`
3. **Ailana:** *"Do you currently have an existing banking or loan relationship...?"*
   * **You:** `no i dont`
4. **Ailana:** *"Roughly when are you hoping to be in your new home?"*
   * **You:** `In the next 6 months.`
5. **Ailana:** *"Will you be applying for this mortgage on your own...?"*
   * **You:** `I am applying on my own.`
6. **Ailana:** *"Now I would like to spend a few minutes exploring your financial picture... what is your gross annual household income before taxes?"*
   * **You:** `It is 120000 dollars annually.`
7. **Ailana:** *"...what are your total recurring monthly debt payments...?"*
   * **You:** `500`
8. **Ailana:** *"Do you have an estimate of your current credit score...?"*
   * **You:** `It's 700.`
9. **Ailana:** *"Next, how much cash do you have available for a down payment...?"*
   * **You:** `50000 USD.`
10. **Ailana:** *"Do you currently rent your home or do you own one...?"*
    * **You:** `I am currently renting.`
11. **Ailana:** *"Have you already connected with a real estate agent...?"*
    * **You:** `No, I don't need any agents yet.`
12. **Ailana:** *"Roughly what is the target purchase price range...?"*
    * **You:** `It's 350000 dollars.`
13. **Ailana:** *"What type of home are you looking for — such as a single-family home, condo, townhome, or multi-family — and what city or zip code are you looking in?"* (Revised Q42)
    * **You:** `Single family home, and I am looking in San Antonio, Texas 78209.`
    * *Verify:* The system captures property type and zip code `78209`. Ailana may deliver the `Q42-USDA` conditional addendum if the zip matches an eligible area. The zip code is passed to the engine for property tax estimation.
14. **Ailana:** *"Now, do you have any military service history — such as being on active duty, a veteran, or in the Reserve or National Guard?"* (Revised Q43 - military only)
    * **You:** `I don't have any military background.`
15. **Ailana:** *"...could you tell me a bit about your current job tenure and how you're paid...?"*
    * **You:** `I am salaried and working since last 6 years.`
16. **Ailana:** *"Great work exploring your numbers. You have two good ways to see your affordability picture..."* (Two-Path Closing Transition)

At this point, choose either **Path A** or **Path B** below:

---

### OPTION A: Soft Credit Review (Verified Mode)

If you select Path A, you will run a credit review first and launch the panel with verified data.

#### Flow Steps:
1. **You:** `Let's run the soft credit review.`
2. **Ailana (Secure Login & One-Time OTP Gate):** *"Perfect. Before we run your review, I'll need a few details to set up your secure login. First, what's your name?"*
   * **You:** `David`
3. **Ailana:** *"Thank you. Now, what email and mobile number would you like to use for your account?"*
   * **You:** `My email is david@example.com and mobile is 555-0199.`
4. **Ailana:** *"I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set."*
   * *Verification:* Check your terminal console logs. The backend prints: `[OTP-Service]: Generated mock OTP code: 123456`.
   * **You:** `123456` (or enter in modal)
5. **Ailana (Soft Pull Consent):** *"Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way... Do you authorize the soft credit inquiry on that basis?"*
   * **You:** `Yes, I authorize.`
6. **Ailana (Prefill Walkthrough):** *"Thank you. I've processed that soft pull... First, I have your name and address listed as David Beckham, 123 Main Street... Does that look right?"*
   * **You:** `Yes, that looks correct.`
7. **Ailana:** *"Great. Next, I have your employer listed as Nexus Technologies LLC Corp. Does that look right?"*
   * **You:** `Yes, correct.`
8. **Ailana:** *"Perfect. For your accounts summary, I see two open active credit cards... Does that look right?"*
   * **You:** `Yes, correct.`
9. **Ailana:** *"Lastly, we retrieved your credit profile showing a category rating in the 700 range... Does that match what you expect?"*
   * **You:** `Yes, that correct.`

#### Transition to Stage 2.5 (Verified Mode):
* **The Affordability Panel slides open** next to the chat.
* **Credit details are displayed** (credit score is shown, monthly debts are locked to bureau data).
* Ailana speaks **Q46**:
  > *"Thank you for your patience — your initial results are in, and I've placed your affordability summary on your screen..."*
* Follow the **Phase 4 Underwriting Submission** below to complete.

---

### OPTION B: Explore First (Stated-Data Mode)

If you select Path B, you will open the panel immediately using only stated estimates, without providing contact info or running a credit pull.

#### Flow Steps:
1. **You:** `I'd like to explore first without credit review.`
2. **Transition to Stage 2.5 (Stated-Data Mode):**
   * **The Affordability Panel slides open immediately** next to the chat.
   * **No contact information or OTP code is requested.**
   * **Stated-Mode UI Presentation:**
     * The Debts card is labeled: **"Monthly debts (your estimate)"**.
     * **No credit score is displayed.**
     * An **"Upgrade to Verified Mode"** button is visible.
     * Math, bands, and permanent disclaimers remain identical.
   * Ailana speaks **Q46-S**:
     > *"Here it is — I've placed your affordability summary on your screen, built from everything you've shared with me..."*

#### Test Conversational Debt Corrections (Q58 Stated Extension):
* In Stated mode, both income and debts can be updated conversationally.
* **You:** `Actually, my monthly debts are 400 dollars.`
* **Verify:** The panel's Monthly debts card updates from `$500` to `$400`, recalculating PITIA/bands within 300ms. Ailana acknowledges.

#### Upgrade / Submit (Triggers OTP Identity Gate):
* When you click **"Upgrade to Verified Mode"** OR **"Submit for review"**:
  1. **OTP Gate Step 1:** Ailana asks for your name: *"Perfect. Before we run your review, I'll need a few details to set up your secure login. First, what's your name?"*
     * **You:** `David`
  2. **OTP Gate Step 2:** Ailana asks for email and mobile: *"Thank you. Now, what email and mobile number would you like to use for your account?"*
     * **You:** `My email is david@example.com and mobile is 555-0199.`
  3. **OTP verification:** Retrieve mock code from terminal (e.g. `123456`).
     * **You:** `123456`
  4. **Credit pull authorization:** Ailana presents the soft-pull disclosure.
     * **You:** `Yes, I authorize.`
  5. **Walkthrough:** Confirm the prefilled items (name, employer, credit score).
  6. **Upgrade Re-render:** The panel re-renders in **Verified Mode** (credit score displays, debts lock to credit bureau tradelines, and tax rate applies from zip code).
  7. **Ailana speaks Upgrade Narration:**
     > *"Your summary just updated — it now reflects your actual credit review..."*

---

### Phase 4: Underwriting Submission & Findings Delivery

Once in **Verified Mode** (either through Option A or Option B upgrade):
1. Make sure sliders are set to a reasonable scenario (e.g. `$350,000` Purchase Price, `$70,000` Down Payment).
2. Click the **"Submit for review"** button.
   * *Verify:* Spinner appears, button text changes to `"Reviewing..."`.
3. Wait 2–4 seconds for the mock Automated Underwriting System (AUS) to return.
4. **Verify Findings Delivery (FD1):**
   * Ailana will deliver the **FD1 script** verbatim:
     > *"Wonderful news — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built..."*
5. **Verify Letter Email Dispatch:**
   * Look at your backend console output. It must print:
     `"[Email-Service]: Pre-Qualification Letter successfully delivered to..."`

---

### Phase 5: Handoff & Escalation (Stage 5)

Immediately following the findings delivery, Ailana will transition to Stage 5 to handle SAFE Act compliance by escalating you to a licensed Loan Officer.

#### Option 1: Scheduled Callback
1. **You:** `I would like to schedule a callback with a loan officer.`
2. **Ailana:** *"I'd be glad to schedule that for you! What day and time works best for you?"*
3. **You:** `Tomorrow at 3 PM.`
4. **Ailana:** *"Perfect, I've got that noted for tomorrow at 3 PM. A licensed loan officer will reach out to you then. Is there anything else I can help you with today?"*
5. **Verify:** Check your backend terminal console logs. It should print:
   ```text
   [MLO-Routing]: Scheduling callback for David Beckham at Tomorrow at 3 PM.
   [Email-Service]: Sending calendar invite and profile summary to MLO Queue...
   [Email-Service]: Callback successfully scheduled for Tomorrow at 3 PM.
   ```

#### Option 2: Live Transfer
1. **You:** `I want to speak with a loan officer right now.`
2. **Ailana:** *"Great! Please click the 'Loan Officer' button on your screen and you'll be connected to the next available loan officer right away."*
3. **Verify:** Check your backend terminal console logs. It should print:
   ```text
   [MLO-Routing]: Live transfer initiated for David Beckham.
   [MLO-Routing]: Waiting for available Loan Officer...
   ```
