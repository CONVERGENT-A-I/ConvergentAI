# Step-by-Step Affordability Panel Walkthrough & Testing Guide

This guide describes the complete end-to-end conversation flow to verify Stage 2.5 (the interactive Affordability Panel, sliders, status bands, compliance disclaimers, and automated underwriting findings delivery).

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
13. **Ailana:** *"What type of property are you looking for...?"*
    * **You:** `Single family home.`
14. **Ailana:** *"Do you have any military service history...?"*
    * **You:** `I don't have any military background.`
15. **Ailana:** *"...could you tell me a bit about your current job tenure and how you're paid...?"*
    * **You:** `I am salaried and working since last 6 years.`
16. **Ailana:** *"We have covered a lot of great ground together... Would you like to move forward with the initial eligibility review?"*
    * **You:** `Yes, I like to move forward.`

---

### Phase 2: Credit Review Authorization & Prefill Walkthrough (Stage 3A)
1. **Ailana:** *"...could you please tell me your full legal name?"*
   * **You:** `It's David Beckham.`
2. **Ailana:** *"...what is your current physical address, including city, state, and zip code?"*
   * **You:** `123 Main Street, California, Texas, 43000.`
3. **Ailana:** *"Before we proceed, I want to be clear about what this involves. This is a soft credit inquiry — it will not affect your credit score in any way... Do you authorize the soft credit inquiry on that basis?"* (Verbatim Regulation B disclaimer)
   * **You:** `Yes, I authorize.`
4. **Ailana:** *"Thank you. I've processed that soft pull... First, I have your name and address listed as David Beckham, 123 Main Street... Does that look right?"*
   * **You:** `Yes, that looks correct.`
5. **Ailana:** *"Great. Next, I have your employer listed as Nexus Technologies LLC Corp. Does that look right?"*
   * **You:** `Yes, correct.`
6. **Ailana:** *"Perfect. For your accounts summary, I see two open active credit cards... Does that look right?"*
   * **You:** `Yes, correct.`
7. **Ailana:** *"Lastly, we retrieved your credit profile showing a category rating in the 700 range... Does that match what you expect?"*
   * **You:** `Yes, that correct.`

---

### Phase 3: Affordability Exploration (Stage 2.5)
Right after you confirm the credit range, Ailana will transition the session to **Stage 2.5** and speak **Q46**:
> *"Thank you for your patience, David — your initial results are in, and I've placed your affordability summary on your screen. It brings together the income and savings targets you shared with me and the details from your credit review, and shows how your numbers compare with typical program guideline ranges. One important note before we look at it together: this is an educational summary to help you explore — it is not a loan decision, and you can submit for the formal eligibility review at any time, no matter what these ranges show. Would you like to walk through it together?"*

#### Visual Verification Steps:
1. **Interactive Panel Mount:** Verify that the **Affordability Panel** has slid in next to the chat window (on mobile, the avatar will scale down into a PiP thumbnail in the corner).
2. **Disclaimer Banner:** Verify the permanent disclaimer banner is displayed at the top:
   `"This is an educational estimate, not a loan decision or offer of credit."`
3. **Status Badges:** Verify both indicators are green:
   * **INCOME BAND:** `"within typical range"`
   * **DTI BAND:** `"within typical range"`

#### Test Slider Interactions:
* **Conventional PMI Logic:**
  * Drag the **Down Payment** slider down to `$40,000` (less than 20% of `$350,000`).
  * Verify **Mortgage Insurance** updates to reflect Conventional PMI (~0.85% of loan amount).
  * Drag **Down Payment** back up to `$70,000` (exactly 20% of `$350,000`).
  * Verify **Mortgage Insurance** falls back to `$0/mo`.
* **Amber Band Transition (DTI Gating):**
  * Drag the **Target Purchase Price** up to `$750,000`.
  * Verify the **DTI BAND** badge changes to amber: `"above typical range"`.
  * Verify the **"Submit for review"** button **remains enabled** and clickable (required by Regulation B/ECOA).

---

### Phase 4: Underwriting Submission & Delivery
1. Make sure sliders are set to a reasonable scenario (e.g. `$350,000` Purchase Price, `$70,000` Down Payment).
2. Click the **"Submit for review"** button.
   * **Verify:** Spinner appears, button text changes to `"Reviewing..."`.
3. Wait 2–4 seconds for the mock Automated Underwriting System (AUS) to return.
4. **Verify Findings Delivery (FD1):**
   * Ailana will deliver the **FD1 script** verbatim:
     > *"Wonderful news, David — your eligibility review came back, and based on the information you provided, you're conditionally eligible for the scenario you built. Your estimated payment range is on your screen now. I've sent your pre-qualification letter to your email on file..."*
5. **Verify Letter Email Dispatch:**
   * Look at your backend console output. It must print:
     `"[Email-Service]: Pre-Qualification Letter successfully delivered to..."`
