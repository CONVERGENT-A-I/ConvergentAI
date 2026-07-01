# 🧪 Testing Guide: Ailana Conversational Stages (1 through 3B)

This guide provides an exemplary conversation script and verification checklist to validate Ailana's conversational flow from **Stage 1 (Greeting)** to **Stage 3B (Mortgage Application Completion)**. Use this same script for both **Text Chat** and **Voice Call** channels to confirm consistent stage transitions and latency.

---

## 📋 Test Script & Dialogue Flow

### 🎬 Stage 1: Greeting & Intent Discovery
*Goal: Collect Borrower Name ➔ Mortgage Goal ➔ Timeline ➔ Property State.*

1.  **Ailana (Greeting)**:
    *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?"*
2.  **You say**:
    *"Hi, my name is Sohail and I want to buy a home."*
3.  **Ailana should respond**:
    *   Greet you by name: *"Nice to meet you, Sohail..."*
    *   Ask for your mortgage goal: *"Are you looking to buy a primary residence, a second home, or an investment property?"*
4.  **You say**:
    *"I want to buy a primary residence, please."*
5.  **Ailana should respond**:
    *   Acknowledge primary residence.
    *   Ask for timeline: *"What is your timeline for this purchase?"* (e.g., next few months, next year).
6.  **You say**:
    *"I want to buy in the next 3 months."*
7.  **Ailana should respond**:
    *   Acknowledge the 3-month timeline.
    *   Ask for location/state: *"In which state are you looking to purchase your new home?"*
8.  **You say**:
    *"California."*
9.  **Ailana should respond with the Stage 1 Bridge**:
    *   *Expected Bridge*: Ailana MUST transition by saying: *"That gives me a solid picture. I'd like to ask a few questions about your financial situation so I can point you toward the right options."*
    *   She should immediately proceed to ask for the first Stage 2 financial variable: **Gross Monthly Income**.

---

### 🎬 Stage 2: Pre-Qualification Discovery (Confirmations Check)
*Goal: Collect and Confirm Gross Income ➔ Monthly Debt ➔ Credit Score ➔ Down Payment ➔ Property Price.*

10. **Ailana asks**:
    *"What is your gross monthly income before taxes?"*
11. **You say**:
    *"I make about 9000 dollars a month."*
12. **Ailana should respond with Income Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $9,000 as your gross monthly income. Is that right?"*
13. **You say**:
    *"Yes."*
14. **Ailana should respond**:
    *   Acknowledge income confirmation.
    *   Ask for monthly debts: *"Can you tell me approximately how much you pay each month for debts such as credit cards, car loans, student loans, or other obligations?"*
15. **You say**:
    *"I pay 400 dollars a month for a car loan and 200 dollars a month for student loans."*
    *(💡 This tests the backend debt summation utility: $400 + $200 = $600)*
16. **Ailana should respond with Debt Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $600 as your monthly debt payments. Is that right?"*
17. **You say**:
    *"Yes."*
18. **Ailana should respond**:
    *   Acknowledge debt confirmation.
    *   Ask for credit score: *"What is your estimated credit score?"*
19. **You say**:
    *"My credit score is 740."*
20. **Ailana should respond with Credit Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned 740 as your credit score. Is that right?"*
21. **You say**:
    *"Yes."*
22. **Ailana should respond**:
    *   Acknowledge credit range confirmation.
    *   Ask for down payment available: *"How much cash do you have available for a down payment?"*
23. **You say**:
    *"I have 15% saved up."*
    *(💡 This tests the percentage down payment parsing utility: 15% of $450,000 = $67,500)*
24. **Ailana should respond with Down Payment Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned 15% as the amount you have available for a down payment. Is that right?"*
    *(Note: Depending on LLM formatting, she may confirm "$67,500" or "15%" – either is correct as long as the backend calculates it as $67,500).*
25. **You say**:
    *"Yes."*
26. **Ailana should respond**:
    *   Acknowledge down payment confirmation.
    *   Ask for purchase price: *"What is the estimated purchase price or property value of the home you are looking to buy?"*
27. **You say**:
    *"Around 450000 dollars."*
28. **Ailana should respond with Property Value Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $450,000 as the estimated property value. Is that right?"*
29. **You say**:
    *"Yes, that's it."*

---

### 🎬 Stage 3: Product Guidance & Match Matching
*Goal: Summarize inputs ➔ Present loan products ➔ Prompt to proceed to soft pull.*

30. **Ailana should respond with the Stage 2 to Stage 3 Bridge**:
    *   *Expected Bridge*: She MUST start by saying exactly: *"Let me walk you through the options that look like the strongest fit."*
    *   She should provide a 2–3 sentence summary of your financial data (Income $9k, Debt $600, Credit 740, Down Payment 15%, Value $450k).
    *   She should present matched programs based on eligibility (e.g. Conventional 30-Year Fixed and FHA Loan).
    *   She MUST close by asking: *"Does that make sense or do you have questions?"*
31. **You say**:
    *"That makes sense, please move on."*
32. **Ailana should respond with the Soft Pull prompt**:
    *   *Expected prompt*: *"The fastest way to get you exact numbers is a soft credit check. It takes 30 seconds, you authorize it yourself, and it has zero impact on your credit score. Want to go ahead?"*
33. **You say**:
    *"Yes, let's do it."*

---

### 🎬 Stage 3A: Soft Pull Consent & Prefill Walkthrough
*Goal: Speak verbatim disclosure ➔ Consent ➔ Walkthrough name, employer, accounts, rating.*

34. **Ailana MUST speak the verbatim disclosure exactly**:
    *   *Verbatim script*: *"Before we proceed — this is a soft pull, not a hard inquiry. It will not affect your credit score in any way. You are the one authorizing it — not us pulling it on our behalf. Your data is used only to pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"*
35. **You say**:
    *"Yes, I authorize it."*
36. **Ailana should run the mock soft pull and walk through pre-filled fields**:
    *   *Verify Name/Address*: *"The system is running a simulated soft pull... Let's review the pre-filled information. Your name and address have been pre-filled as 'Sohail' and a corresponding address. Does that look right or is anything out of date?"*
37. **You say**:
    *"Yes, it's correct."*
38. **Ailana should verify Employer**:
    *   *Verify Employer*: *"The employer information has also been pre-filled. It shows your current employer. Does that look right or is anything out of date?"*
39. **You say**:
    *"Yes, it's correct."*
40. **Ailana should verify Account Summary & Credit range category**:
    *   *Verify Accounts*: *"The system has also retrieved a summary of your accounts, which includes bank accounts, credit cards, and loans. Additionally, your credit profile shows a category rating in the Good range of 670 to 739, based on the credit score of 740. Does that match what you expect or is anything out of date?"*
41. **You say**:
    *"Yes, it's correct."*
42. **Ailana should bridge to Stage 3B**:
    *   Acknowledge completion of the prefill check.
    *   Bridge: *"Now that we've reviewed the pre-filled information, I'll guide you through the next steps in the mortgage application process..."*

---

### 🎬 Stage 3B: Mortgage Application Completion (1003)
*Goal: Collect Marital Status ➔ Co-borrower status ➔ Dependents ➔ SSN redirect ➔ Employment title/years/self-employed ➔ Checking/Savings balance ➔ Bankruptcy/Foreclosure declaration ➔ HMDA demographic check ➔ Submit Authorization.*

43. **Ailana asks**:
    *"Would you like to proceed with the application or would you like me to connect you with a licensed mortgage advisor to discuss further?"*
44. **You say**:
    *"I want to proceed with the application."*
45. **Ailana should respond**:
    *   Acknowledge choice and ask marital status: *"Can you please tell me about your marital status?"*
46. **You say**:
    *"I am married."*
47. **Ailana should respond**:
    *   Acknowledge and ask if spouse is co-borrower: *"Will your spouse be a co-borrower on this mortgage loan?"*
48. **You say**:
    *"No, my spouse will not be a co-borrower."*
49. **Ailana should respond**:
    *   Acknowledge and ask dependents: *"How many dependents do you have?"*
50. **You say**:
    *"I have no dependents."*
51. **Ailana should respond**:
    *   Acknowledge and ask for employment title, years, self-employed status: *"Can you tell me your current job title, how many years you've been working there, and if you are self-employed?"*
52. **You say**:
    *"I am a software engineer, have worked here for 4 years, and I am not self-employed."*
53. **Ailana should respond**:
    *   Acknowledge and ask checking/savings balance: *"How much cash balance do you have available in your checking and savings accounts?"*
54. **You say**:
    *"I have 25,000 dollars."*
55. **Ailana should respond**:
    *   Acknowledge and ask standard declarations (bankruptcy/foreclosure): *"These next few questions are standard on every mortgage application... In the past seven years, have you had a bankruptcy, foreclosure, or short sale on any property?"*
56. **You say**:
    *"No bankruptcy or foreclosure."*
57. **Ailana should respond**:
    *   Acknowledge and explain voluntary nature of HMDA details: *"These last questions are required by federal law but entirely optional for you to answer... they are used for fair lending monitoring... Would you like to provide your race, sex, and ethnicity, or skip these?"*
58. **You say**:
    *"I prefer not to answer."*
59. **Ailana should respond with Stage Completion Submit query**:
    *   *Submission script*: *"Sohail, your application is complete. I am going to submit this to our underwriting system for review. This typically takes just a few minutes. I will share the result with you as soon as it comes back, and one of our licensed loan officers will be in touch to walk you through the next steps. Ready to submit?"*
60. **You say**:
    *"Yes, submit it."*

---

### 🎬 Stage 4: Underwriting Handoff & Checklist
*Goal: Await simulated underwriting system status ➔ Present Conditional Approval or Referral ➔ Walk through required checklist of income/asset documents.*

61. **Ailana should respond with Underwriting Wait status**:
    *   *Waiting script*: *"I've submitted your application. Now, we wait for the underwriting system to review it. This should only take a few minutes. Once the review is complete, one of our licensed loan officers will reach out to you to discuss the next steps. Would you like me to connect you with a licensed loan officer now, or would you prefer to wait for them to reach out to you after the review is complete?"*
62. **You say**:
    *"What is the status of my review?"*
63. **Ailana should respond with Underwriting Decision & Document Checklist**:
    *   *If Happy Path (Approved)*: *"Excellent news! The system has returned a conditional approval for your Conventional Fixed Rate loan. To move your application to the final underwriting review, we will need to gather a few documents: (1) your most recent 2 years of Tax Returns and W-2s, (2) your last 30 days of paystubs, and (3) your most recent 60 days of bank statements. Does that make sense, and do you have these documents available?"*
    *   *If Manual Review (Referred)*: *"Thank you for your patience. The system has indicated that your application requires a manual review by one of our licensed loan officers. This is very common and simply means we need a human eye to review your profile. To help speed this up, you can get a headstart by preparing the following documents: (1) your most recent 2 years of Tax Returns and W-2s, (2) your last 30 days of paystubs, and (3) your most recent 60 days of bank statements. Does that make sense, and do you have these documents available?"*
64. **You say**:
    *"Yes, I have these documents ready."*
65. **Ailana should respond**:
    *   Acknowledge and transition to next steps.

---

## 🔍 Validation Checklist (What to watch for)

*   [ ] **Zero Latency (Groq Check)**: Every voice response should begin speaking within **1.0 second** of you finishing your statement.
*   [ ] **Immediate Confirmation**: In Stage 2, Ailana should ask the *"Just to confirm — you mentioned..."* question *immediately* on the very next turn following a new numeric answer.
*   [ ] **DTI/LTV Calculations**: The down payment should be correctly registered as **$67,500** (15% of $450k) or calculated appropriately for percentages.
*   [ ] **Verbatim Scripting**: In Stage 3A, Ailana MUST read the consent disclosure word-for-word without any paraphrasing.
*   [ ] **SSN and DOB Exclusion**: Verify that the system does not collect or require the borrower's SSN or DOB at any stage of the pre-qualification or soft pull flow.
*   [ ] **AUS Processing & Sub-Prompts**: In Stage 4, Ailana must dynamically load the conditional approval or manual referral sub-prompts based on your financial ratios.
*   [ ] **Clean Stage transitions**: No "optional summary" prompts at the end of Stage 1 or Stage 2, and clean advancement into Stage 3B and Stage 4.
