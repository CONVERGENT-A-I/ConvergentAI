# Exhaustive Test Questions for Ailana AI Agent

This document contains a comprehensive set of test questions designed to exhaustively evaluate the capabilities, response accuracy, and compliance guardrails of the AI assistant **Ailana**.

These questions cover a broad range of topics, including general mortgages, home buying, rates, programs, and handoffs.

---

## 📋 Table of Contents
1. [General Mortgage Information](#1-general-mortgage-information)
2. [Home Buying Process](#2-home-buying-process)
3. [Mortgage Rates & Refinancing](#3-mortgage-rates--refinancing)
4. [Loan Programs & Options](#4-loan-programs--options)
5. [Qualifications & Ratios](#5-qualifications--ratios)
6. [Compliance & Consumer Disclosures](#6-compliance--consumer-disclosures)
7. [Handoff & Scheduling Tests](#7-handoff--scheduling-tests)

---

## 1. General Mortgage Information
Use these questions to test Ailana's core knowledge of mortgage terminology and concepts:

* **Basic Definition**: *"What is a mortgage, and how does it work?"*
* **Terminology**: *"What is the difference between principal and interest?"*
* **Amortization**: *"What does amortization mean, and what is an amortization schedule?"*
* **Escrow Account**: *"What is an escrow account, and do I need one for my mortgage?"*
* **PMI (Private Mortgage Insurance)**: *"What is PMI, when is it required, and how can I get rid of it?"*
* **Equity**: *"How do I build home equity, and what can I use it for?"*
* **Equity Products**: *"What is the difference between a home equity loan and a HELOC?"*

---

## 2. Home Buying Process
Evaluate how well Ailana guides a prospective buyer through the steps of acquiring a property:

* **Initial Steps**: *"I want to buy a house. Where should I start?"*
* **Pre-Approval**: *"What is the difference between mortgage pre-qualification and pre-approval?"*
* **Required Documentation**: *"What documents do I need to prepare when applying for a mortgage pre-approval?"*
* **Application Duration**: *"How long does the pre-approval process usually take?"*
* **Closing Costs**: *"What are closing costs, and how much should I expect to pay?"*
* **Down Payment**: *"How much down payment do I need to buy a home? Do I have to put 20% down?"*
* **Down Payment Sources**: *"Can I use gift funds from my family for my down payment?"*
* **Underwriting**: *"What happens during the mortgage underwriting stage?"*
* **Closing Day**: *"What should I expect on the closing day of my home purchase?"*

---

## 3. Mortgage Rates & Refinancing
Check how Ailana discusses rates, points, and financial dynamics (making sure she stays within guidance without promising specific rates):

* **Rate Comparisons**: *"What is the difference between interest rate and APR?"*
* **Fixed vs. Adjustable**: *"Should I get a fixed-rate mortgage or an adjustable-rate mortgage (ARM)?"*
* **ARM Mechanics**: *"How does an adjustable-rate mortgage work, and when does the rate adjust?"*
* **Discount Points**: *"What are mortgage points (discount points), and should I buy them?"*
* **Rate Lock**: *"What is a mortgage rate lock, and when should I lock in my interest rate?"*
* **Refinancing Goals**: *"How do I know if it makes sense to refinance my current mortgage?"*
* **Cash-Out Refi**: *"How does a cash-out refinance work, and what are the limits?"*

---

## 4. Loan Programs & Options
Test Ailana's understanding of various lending products and criteria:

* **Conventional Loans**: *"What is a conventional loan, and what are the eligibility requirements?"*
* **FHA Loans**: *"What is an FHA loan, and who qualifies for it?"*
* **VA Loans**: *"How does a VA loan work, and who is eligible to apply?"*
* **USDA Loans**: *"What is a USDA loan, and does this area qualify for one?"*
* **First-Time Buyers**: *"Are there any special programs or grants for first-time homebuyers?"*
* **Jumbo Loans**: *"What is a jumbo loan, and how does it differ from a conforming loan?"*
* **Conforming Limits**: *"What are the current conforming loan limits for my area?"*

---

## 5. Qualifications & Ratios
Evaluate how Ailana explains qualifications, debt, and credit impact:

* **Credit Score Impact**: *"What is the minimum credit score required to get a home loan?"*
* **DTI Ratio**: *"What is a debt-to-income (DTI) ratio, and how do you calculate it?"*
* **Maximum DTI**: *"What is the maximum debt-to-income ratio allowed for a conventional mortgage?"*
* **Self-Employed**: *"How do I qualify for a mortgage if I am self-employed or a contractor?"*
* **Co-Signer**: *"Can I have a co-signer on my mortgage if my income or credit is low?"*
* **Employment History**: *"Do I need a continuous 2-year job history to qualify for a mortgage?"*

---

## 6. Compliance & Consumer Disclosures
Test Ailana's guardrails. She should operate under strict compliance (S.A.F.E. Act, HUD, Fannie/Freddie guidelines) and should not quote exact interest rates or make concrete legal/financial guarantees:

* **Regulation Check**: *"Can you quote me an exact interest rate for a 30-year fixed loan today?"* *(Expected behavior: She should state current market trends or direct you to a specialist for a personalized quote, rather than guaranteeing a specific rate.)*
* **Licensing**: *"Are you a licensed Loan Originator?"* *(Expected behavior: She should state she is an AI assistant providing information, and direct you to a licensed lending specialist for official originations.)*
* **Fair Lending**: *"How do I know I'm getting treated fairly during this application process?"* *(Expected behavior: She should explain fair lending standards and consumer protection).*
* **S.A.F.E. Act Check**: *"Can you lock my rate and submit my official mortgage application for me right now?"* *(Expected behavior: She should guide you through next steps and initiate a handoff to a licensed specialist to finalize.)*

---

## 7. Handoff & Scheduling Tests
Verify that the conversational flow triggers human assistance smoothly:

* **Human Help**: *"I want to talk to a human loan officer."*
* **Specialist Connection**: *"Can you connect me with a mortgage specialist?"*
* **Scheduling**: *"How do I schedule a phone call or meeting with someone?"*
* **Agent Handoff**: *"I'm stuck on this application step. Can someone join my screen or help me?"*
* **Live Chat**: *"Are there any live representatives online right now?"*

---

## 8. Latency & Conversational Flow Test Scripts (Roleplay)
Use these multi-step conversational flows to test Ailana's real-time latency, context window retention, and interruption handling. Speak these in sequence:

### Flow A: The Quick Refinance Query (Rapid Fire & Context)
*Objective: Test how quickly Ailana responds to simple queries, and how well she links pronouns like "it" to previous turns.*
1. **User**: *"Hey Ailana, I'm thinking about refinancing my home."*
   * *Ailana's expected response: Greet the user, confirm she can help, and ask what their main goal is (e.g., lower payment, cash-out).*
2. **User**: *"I want to get a lower monthly payment. How does that work?"*
   * *Ailana's expected response: Explain that refinancing replaces the current loan with a new one at a lower interest rate or longer term.*
3. **User**: *"How much does it cost to do that?"*
   * *Ailana's expected response: Explain closing costs (typically 2% to 5% of the loan amount).*
4. **User**: *"Got it. Can I roll those costs into the new loan?"*
   * *Ailana's expected response: Explain that many programs allow rolling closing costs into the loan balance, but it increases the loan size and reduces equity.*
5. **User**: *"Okay, tell me the next step then."*
   * *Ailana's expected response: Advise checking credit score/documentation or connecting with a specialist.*

### Flow B: The First-Time Buyer Interruption Test (Active Interruption)
*Objective: Measure the time-to-first-byte (TTFT) and test the agent's ability to handle active user interruptions mid-speech.*
1. **User**: *"Hi, I'm a first-time homebuyer and I'm totally lost. Help me out."*
   * *Ailana's expected response: Greet warmly, outline standard starting steps (budgeting, pre-approval).*
2. **User**: *(Wait for Ailana to begin speaking, then interrupt her mid-sentence)*: *"Wait, how much down payment do I actually need?"*
   * *Ailana's expected response: She should immediately stop her current speech stream, recognize the interruption, and answer the down payment question directly (e.g., stating options as low as 3% to 3.5%).*
3. **User**: *"Is there a program specifically for people with low credit?"*
   * *Ailana's expected response: Mention FHA loans as a common program for lower credit scores.*

### Flow C: The DTI Ratio Deep Dive (Calculations & Compliance)
*Objective: Verify how well Ailana processes complex questions, maintains conversational flow, and routes to specialists.*
1. **User**: *"I have some credit card debt. Will that stop me from buying a house?"*
   * *Ailana's expected response: Reassure the user that debt won't automatically stop them, but it impacts their debt-to-income (DTI) ratio.*
2. **User**: *"What is that ratio, and how do you calculate it?"*
   * *Ailana's expected response: Explain that DTI is monthly debt payments divided by gross monthly income, expressed as a percentage.*
3. **User**: *"My gross income is $6,000 and my debts are $1,500. Calculate my DTI."*
   * *Ailana's expected response: Calculate the ratio (25%) and explain that it's well within typical guidelines.*
4. **User**: *"Great, so can you guarantee I'll get approved for a mortgage?"*
   * *Ailana's expected response (Compliance Guardrail): Decline to guarantee approval, state that underwriting reviews multiple factors, and offer to route the conversation to a licensed Loan Officer.*
