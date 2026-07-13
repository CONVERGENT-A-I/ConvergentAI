# 🧪 Testing Guide: Ailana Conversational Stages (1 through 4)

This guide provides an exemplary conversation script and verification checklist to validate Ailana's conversational flow under **Version 7.0** from **Stage 1 (Greeting)** to **Stage 4 (Underwriting Handoff)**. 

Use this script for both **Text Chat** and **Voice Call** channels to confirm consistent stage transitions, proper field confirmation behavior, and zero latency.

---

## 📋 Test Script & Dialogue Flow

### 🎬 Stage 1: Greeting & Intent Discovery
*Goal: Collect Name ➔ Mortgage Goal ➔ Occupancy ➔ Existing Relationship ➔ Timeline ➔ Co-borrower status.*

1.  **Ailana (Greeting)**:
    *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?"*
2.  **You say**:
    *"Hi, my name is Sohail and I want to buy a home."*
3.  **Ailana should respond**:
    *   Greet you by name: *"Nice to meet you, Sohail!"*
    *   Ask for occupancy: *"Will this home be your primary residence, meaning you’ll live in it as your main home?"*
4.  **You say**:
    *"Yes, I'll be living in it myself."*
5.  **Ailana should respond**:
    *   Ask for existing relationship: *"Do you currently have any existing relationship with your lending institution, such as an existing account or prior mortgage?"*
6.  **You say**:
    *"No, I don't have any accounts."*
7.  **Ailana should respond**:
    *   Ask for timeline: *"What’s your ideal timeline for purchasing the home — are you looking to move within the next few months, or do you have a longer timeframe in mind?"*
8.  **You say**:
    *"I want to buy within the next 3 months."*
9. **Ailana should respond**:
    *   Ask for co-borrower status: *"Will there be a co-borrower involved in this loan, such as a spouse or partner, or will you be applying on your own?"*
10. **You say**:
    *"I'm applying on my own."*
11. **Ailana should respond with the Stage 1 Bridge**:
    *   *Expected Bridge*: Ailana MUST transition by saying exactly: *"That gives me a great starting point. Now I would like to spend a few minutes exploring your financial picture — income, current debts, credit profile, and a few other details — so I can map out the loan programs that may be most relevant to your situation."*
    *   She should immediately proceed to ask for the first Stage 2 financial variable: **Gross Annual Income**.

---

### 🎬 Stage 2: Pre-Qualification Discovery (Confirmations Check)
*Goal: Collect Gross Annual Income ➔ Monthly Debt ➔ Credit Range ➔ Down Payment ➔ Rent/Own ➔ Realtor Status ➔ Target Price ➔ Property Type ➔ Military/Rural ➔ Job Tenure/Type.*

12. **Ailana asks**:
    *"To give you the most accurate picture, could you share a rough estimate of your gross annual household income — before taxes? A range is completely fine."*
13. **You say**:
    *"I make about 110,000 dollars a year."*
14. **Ailana should respond with Income Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $110,000 as your gross annual household income. Is that right?"*
15. **You say**:
    *"Yes."*
16. **Ailana should respond**:
    *   Ask for monthly debts: *"Do you have a sense of your current monthly debt payments? This would include car loans, student loans, credit card minimums, or other recurring obligations."*
17. **You say**:
    *"I pay 300 dollars a month for a car loan."*
18. **Ailana should respond with Debt Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $300 as your total monthly debt payments. Is that right?"*
19. **You say**:
    *"Yes."*
20. **Ailana should respond**:
    *   Ask for credit score: *"Do you have a general idea of your current credit score range? Excellent, good, fair — or I can note it as unknown and we will address it during the eligibility review."*
21. **You say**:
    *"My credit is around 720."*
22. **Ailana should respond**:
    *   *No confirmation script is used for non-numeric fields.* Acknowledge and ask for down payment: *"How much have you set aside — or are you hoping to save — for a down payment and initial closing costs?"*
23. **You say**:
    *"I have 20,000 dollars saved."*
24. **Ailana should respond with Down Payment Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $20,000 as your down payment. Is that right?"*
25. **You say**:
    *"Yes."*
26. **Ailana should respond**:
    *   Ask if they rent or own: *"Are you currently renting, or do you own a home? And if you own, are you planning to sell as part of this transaction?"*
27. **You say**:
    *"I currently rent."*
28. **Ailana should respond**:
    *   *No confirmation.* Ask about realtor connection: *"Have you already connected with a real estate agent, or are you still in the early stages of your search?"*
29. **You say**:
    *"No agent yet."*
30. **Ailana should respond**:
    *   *No confirmation.* Ask for target home price: *"Do you have a general target price range in mind for the home you'd like to purchase?"*
31. **You say**:
    *"About 350,000 dollars."*
32. **Ailana should respond with Target Price Confirmation**:
    *   *Verbatim Ask*: *"Just to confirm — you mentioned $350,000 as the estimated purchase price. Is that right?"*
33. **You say**:
    *"Yes."*
34. **Ailana should respond**:
    *   Ask for property type: *"What type of property are you considering — a single-family home, a condo, a townhome, a multi-family property, or something else?"*
35. **You say**:
    *"A single-family home."*
36. **Ailana should respond**:
    *   *No confirmation.* Ask for military service/location: *"Are you — or is your co-borrower — a current or former member of the U.S. military, or are you purchasing in a rural or suburban area?"*
37. **You say**:
    *"No military service and it is in a suburban area."*
38. **Ailana should respond**:
    *   *No confirmation.* Ask for job tenure/income type: *"How long have you been with your current employer, and is your income primarily salary or wages, or something like commissions, self-employment, or another source?"*
39. **You say**:
    *"I've been at my job for 3 years, paid on salary."*
40. **Ailana should respond with the Stage 2 to Stage 3 Closing Transition Offer**:
    *   *Verbatim Ask*: *"We have covered a lot of great ground together, and I now have a solid picture of your financial starting point. Based on what you have shared, I can begin walking you through the loan programs that may be most relevant to your situation. Before we do that — when you are ready, the natural next step is to submit your information for an initial eligibility review. This gives you real, meaningful feedback on your conditional eligibility — including an estimated payment range — before connecting with a licensed mortgage advisor. The payment estimate is generated by the eligibility review using a current representative rate from our rate sheet — so it reflects actual market conditions, not a rough guess. Would you like to move forward with that now, or would you prefer to continue exploring your options first?"*

---

### 🎬 Stage 3 & 3A: Soft Pull Consent & Prefill Walkthrough
*Goal: Speak verbatim disclosure ➔ Consent ➔ Walkthrough name, employer, accounts, rating.*

41. **You say**:
    *"Yes, let's move forward."*
42. **Ailana MUST speak the verbatim disclosure exactly**:
    *   *Verbatim script*: *"Before we proceed — this is a soft pull, not a hard inquiry. It will not affect your credit score in any way. You are the one authorizing it — not us pulling it on our behalf. Your data is used only to pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"*
43. **You say**:
    *"Yes, I authorize it."*
44. **Ailana should run the mock soft pull and walk through pre-filled fields**:
    *   *Verify Name/Address*: *"The system is running a simulated soft pull... Let's review the pre-filled information. Your name and address have been pre-filled... Does that look right or is anything out of date?"*
45. **You say**:
    *"Yes, it's correct."*
46. **Ailana should verify Employer**:
    *   *Verify Employer*: *"The employer information has also been pre-filled. It shows your current employer. Does that look right or is anything out of date?"*
47. **You say**:
    *"Yes, it's correct."*
48. **Ailana should verify Account Summary & Credit range category**:
    *   *Verify Accounts*: *"The system has also retrieved a summary of your accounts... Additionally, your credit profile shows a category rating in the Good range of 670 to 739, based on the credit score of 720. Does that match what you expect or is anything out of date?"*
49. **You say**:
    *"Yes, it's correct."*
50. **Ailana should bridge to Stage 3B**:
    *   Acknowledge completion of the prefill check.
    *   Bridge and ask: *"Now that we've reviewed the pre-filled information, I'd like to guide you through completing the remaining fields of your mortgage application. Would you like to proceed with that now, or continue exploring your options first?"*

---

### 🎬 Stage 3B: Mortgage Application Completion (1003)
*Goal: Collect Marital Status ➔ Dependents ➔ Employment details ➔ checking/savings ➔ Declarations ➔ HMDA Demographics ➔ Submit Confirmation. **DO NOT COLLECT SSN OR DOB**.*

51. **You say**:
    *"Yes, let's proceed with the application."*
52. **Ailana should respond**:
    *   Ask marital status: *"Can you please tell me about your marital status?"*
53. **You say**:
    *"I am married."*
54. **Ailana should respond**:
    *   **Co-borrower status was already collected in Stage 1, so it is skipped here.**
    *   Ask dependents: *"How many dependents do you have?"*
55. **You say**:
    *"I have no dependents."*
56. **Ailana should respond**:
    *   **SSN / DOB is skipped entirely.**
    *   Acknowledge dependents and ask for employment details (job title, years, self-employed): *"Can you tell me your current job title, how many years you've been working there, and if you are self-employed?"*
57. **You say**:
    *"I am a developer, have worked there for 3 years, and I am not self-employed."*
58. **Ailana should respond**:
    *   Ask checking/savings balance: *"How much cash balance do you have available in your checking and savings accounts?"*
59. **You say**:
    *"I have 25,000 dollars."*
60. **Ailana should respond**:
    *   Ask standard declarations (bankruptcy/foreclosure): *"These next few questions are standard on every mortgage application — they're not judgment calls, just accurate record-keeping. In the past seven years, have you had a bankruptcy, foreclosure, or short sale on any property? It's completely fine if the answer is yes — it's just important that we have it right."*
61. **You say**:
    *"No bankruptcy or foreclosure."*
62. **Ailana should respond with Stage Completion Submit query**:
    *   *Submission script*: *"Sohail, your application is complete. I am going to submit this to our underwriting system for review. This typically takes just a few moments. I will share the result with you as soon as it comes back, and one of our licensed loan officers will be in touch to walk you through the next steps. Ready to submit?"*
63. **You say**:
    *"Yes, submit it."*

---

### 🎬 Stage 4: Underwriting Handoff & Checklist
*Goal: Await simulated underwriting status ➔ Present Conditional Approval or Referral ➔ Walk through required checklist of income/asset documents.*

64. **Ailana should respond with Underwriting Wait status**:
    *   *Waiting script*: *"I've submitted your application. Now, we wait for the underwriting system to review it..."*
65. **You say**:
    *"What is the status of my review?"*
66. **Ailana should respond with Underwriting Decision & Document Checklist**:
    *   *If Approved*: *"Excellent news! The system has returned a conditional approval for your Conventional Fixed Rate loan. To move your application to the final underwriting review, we will need to gather a few documents: (1) your most recent 2 years of Tax Returns and W-2s, (2) your last 30 days of consecutive paystubs, and (3) your most recent 60 days of complete bank statements (checking and savings) showing source of down payment. Does that make sense, and do you have these documents available?"*

---

## 📋 Alternative Test Script: Refinance Flow

Use this script to validate Ailana's behavior when the borrower's goal is to **refinance** their existing mortgage.

### 🎬 Stage 1: Greeting & Intent Discovery
1.  **Ailana (Greeting)**:
    *"Hi! I am Ailana, an AI mortgage assistant. I can answer your mortgage questions, walk you through loan program information, and help you get started on the path to homeownership. What questions do you have for me today?"*
2.  **You say**:
    *"Hi, my name is Sohail and I want to refinance my current home."*
3.  **Ailana should respond**:
    *   Greet by name and ask for occupancy: *"Nice to meet you, Sohail! Refinancing is a great way to optimize your loan terms. Will this be for your primary residence — the home you live in — or is it a second home or investment property?"*
4.  **You say**:
    *"It is my primary residence."*
5.  **Ailana should respond**:
    *   Ask for existing relationship: *"Do you currently have an account or active services with your lending institution?"*
6.  **You say**:
    *"Yes, I have a checking account."*
7.  **Ailana should respond**:
    *   Ask for timeline: *"When are you hoping to complete this refinance?"*
8.  **You say**:
    *"Within the next 6 months."*
9. **Ailana should respond**:
    *   Ask for co-borrower: *"Will there be a co-borrower joining you on this application, or are you applying on your own?"*
10. **You say**:
    *"I am applying on my own."*
11. **Ailana should respond with the Stage 1 Bridge**:
    *   *Expected Bridge*: *"Understood, thank you. That gives me a great starting point. Now I would like to spend a few minutes exploring your financial picture -- income, current debts, credit profile, and a few other details -- so I can map out the loan programs that may be most relevant to your situation. To start, what is your gross annual household income before taxes?"*

---

### 🎬 Stage 2: Pre-Qualification Discovery (Refinance specific answers)
12. **You say**:
    *"I make about 180,000 dollars a year."*
13. **Ailana should confirm Gross Income**:
    *   *Verbatim Ask*: *"Just to confirm -- you mentioned $180,000 as your gross annual income. Is that right?"*
14. **You say**:
    *"Yes."*
15. **Ailana should respond**:
    *   Ask for monthly debt: *"Great, thanks for confirming. Next, could you tell me about your recurring monthly debt payments, such as car loans, student loans, or credit card minimums?"*
16. **You say**:
    *"I pay 500 dollars a month."*
17. **Ailana should confirm Debt**:
    *   *Verbatim Ask*: *"Just to confirm -- you mentioned $500 as your monthly debt. Is that right?"*
18. **You say**:
    *"Yes."*
19. **Ailana should respond**:
    *   Ask for credit score: *"Great, thanks for confirming. To help me get a better sense of your options, how would you describe your current credit score--either as a specific number or a general range?"*
20. **You say**:
    *"My credit score is 740."*
21. **Ailana should respond**:
    *   *No confirmation.* Ask for refinance type: *"Got it. Are you considering a 'cash-out' refinance, or are you wanting to reduce your monthly payment through a rate and term refinance?"*
22. **You say**:
    *"I want to do a rate and term refinance to lower my payment."*
23. **Ailana should respond**:
    *   *No confirmation.* Ask for estimated property value: *"Got it, rate and term. What is the estimated market value of your home you wish to refinance?"*
24. **You say**:
    *"About 450,000 dollars."*
25. **Ailana should confirm estimated property value**:
    *   *Verbatim Ask*: *"Ok, we will use the value of $450,000 as the value, correct?"*
26. **You say**:
    *"Yes."*
27. **Ailana should respond**:
    *   Ask for property type: *"Great. What type of property is this--would that be a single-family home, condo, townhome, multi-family, or something else?"*
28. **You say**:
    *"A single family home."*
29. **Ailana should respond**:
    *   Ask for military/rural: *"Got it, a single-family home. Do you have any military service history, or is the property in a rural area?"*
30. **You say**:
    *"No military service and it is in a suburban area."*
31. **Ailana should respond**:
    *   Ask for job tenure/income type: *"Thank you for clarifying. To wrap things up, could you tell me a bit about your current job tenure and the type of income you have, such as whether you're salaried, hourly, or self-employed?"*
32. **You say**:
    *"I've been at my job for 5 years salaried."*
33. **Ailana should respond with the Stage 2 to Stage 3 Closing Transition Offer**:
    *   *Ailana should ask verbatim whether they are ready to submit their information for eligibility review.*

---

## 💬 Generic Prompts & Educational Q&A Test Scenarios

Verify Ailana's conversational responses for out-of-sequence questions and generic topics:

### 🏠 Scenario A: Understanding PMI (Asked during Stage 2)
1. **You ask**: *"What is PMI?"*
2. **Ailana should respond with Educational Q&A guidance**:
   *"PMI stands for Private Mortgage Insurance. On conventional loans, lenders require it when your down payment is less than 20% — it is a protection policy for the lender, and the cost is included in your monthly payment. The good news is it is not permanent — once your equity reaches 20%, you can request cancellation. Would you like to know more about how it works or how to avoid it?"*
3. **Check**: Ensure she answers accurately and then steering-corrects back to the pending Stage 2 question.

### 🎖️ Scenario B: VA Loan Eligibility (Asked during Stage 2)
1. **You ask**: *"Can you tell me about VA loans? Am I eligible?"*
2. **Ailana should respond**:
   *"A VA loan is a mortgage benefit administered by the U.S. Department of Veterans Affairs, available exclusively to those who have served in the military. Its most significant advantages are no down payment required, no private mortgage insurance, and competitive interest rates... Do you or your co-borrower have military service history?"*

### 📉 Scenario C: Bankruptcy waiting periods (Asked during Stage 2)
1. **You ask**: *"Can I get a mortgage if I had a bankruptcy recently?"*
2. **Ailana should respond**:
   *"Yes, it is very possible. Most loan programs establish waiting periods after a significant credit event... Chapter 7 typically has a 2-year waiting period for FHA and 4 years for conventional from the discharge date..."*

### 💬 Scenario D: Non-mortgage or general chat (Chitchat guardrails)
1. **You say**: *"What is your favorite food?"* or *"Tell me a joke."*
2. **Ailana should respond**:
   *   Acknowledge the chitchat briefly, politely decline to elaborate, and steer immediately back to the pending mortgage field. 
   *   *Example*: *"I'm an AI mortgage assistant, so I don't eat food, but I'd love to help you get back to your home loan. We were discussing your down payment. How much cash do you have available?"*

---

## 🔍 Validation Checklist (Updated)

*   [x] **SSN and DOB Exclusion**: Verify that the system does not ask for or collect the borrower's SSN or DOB at any stage. It goes straight from dependents to employment details during Stage 3B.
*   [x] **Correct Stage 1 sequence**: Six variables collected in sequence before the Bridge activates.
*   [x] **Correct Stage 2 sequence**: Ten variables collected in sequence with confirmations active only for numeric inputs.
*   [x] **No Paraphrasing on Disclosures**: Verify verbatim consent scripts are delivered exactly.
*   [x] **Clean workflow compilation**: Build runs cleanly with zero types discrepancies.
*   [x] **Proactive Stage 4 AUS Result**: Verify Ailana proactively states the underwriting outcome (Approve, Approve with Conditions, Refer, or Suspend) immediately after application submission without waiting for a user nudge.

