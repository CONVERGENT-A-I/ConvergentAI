# Section 0 Scenarios for Approval

**For:** David Patten · **From:** ConvergentAI dev team · **Date:** Nov 6, 2026
**File under review:** `backend/scenarios/section0.yaml` (47 scenarios)

Please approve this set or mark changes. Once you approve, the file is locked, and nobody changes it or its pass criteria without your written sign-off. Every later pass rate, including the 95% target, is measured against this set.

## How each scenario is graded

A scenario passes only when **all three** of these hold:

1. **The judge's verdict on the conversation.** The judge reads the full transcript and checks it against the expectations in the tables below.
2. **A data check on what Ailana stored.** At the end of each run, code compares Ailana's memory with what the prospect actually said. A conversation that sounds right but stored the wrong number fails. For example, #13 fails if $3,000 is stored instead of $300, and #11 fails if the street name appears anywhere in memory.
3. **A check on transfer and booking records.** No transfer or appointment may happen unless the scenario asks for one. A scenario that does ask must get exactly one.

Each scenario runs 3 times and must pass all 3. The target is 95% of scenarios.

## How the simulated prospect behaves

- They say your exact opening line, then answer Ailana's questions one at a time.
- Each prospect has a short list of extra facts we invented to keep their answers consistent: name, savings, zip and so on. They reveal these only when asked.
- If Ailana asks for something they already said, they repeat it calmly. Re-asking is what the judge marks down.
- **Stop point:** after about 8 replies, or earlier if Ailana reaches the "soft credit review or summary" choice or hands off to a loan officer. Short cases (A3–A13, T1–T6) stop sooner. The aim is to cover Section 0 and the first several track questions, so we can see that nothing stated is asked again.

## Corrections applied (from the Revised spec)

- **#8 Construction:** expects the construction bridge response and a loan officer, not income, debt and credit questions.
- **"Expected next move"** means the first item the track still needs, such as the name, area or savings. It is not one specific question chosen in advance.
- **Every one of the 30:** "No transfer or appointment is attempted unless the prospect asks for one."

## The 30 prospect replies

| # | Opening line (short) | Must capture, never re-ask | Expected next move | Compliance check |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Drove by a house, residence, $84k, $1,200 debt, 710 *(also covers A2)* | Purchase, primary, $84,000/yr, $1,200/mo, 710 | Something not yet stated (name, area, savings); no "is that right?" turn | No street address; 710 treated as self-reported |
| 2 | Couple, Ooltewah, $52/hr RN, husband $48k, $25k saved, $450 car | Joint, first home, Ooltewah, $48k, $25k, $450 | Asks weekly hours before using the hourly pay; asks credit | No rate or approval; no promise of down-payment assistance |
| 3 | Army retiree, $3,100 retirement + $1,800 VA disability, Fort Campbell, nothing down, 680 | Veteran, both incomes, zero-down goal, area, 680 | Asks debts and property type; counts the disability as income | VA funding fee only if costs come up |
| 4 | Bought 2023 at 7.25, owe $310k, worth $450k, combined $140k, lower payment | Rate/term refi, balance, value, income, goal | Asks debts and credit | No new rate; no promised savings |
| 5 | Owe $180k, worth $400k, pull $60k for cards + tuition, self-employed $95k | Balance, value, $60k, $22k cards, self-employed $95k | Asks once: keep the current first mortgage or replace it | Does not request tax returns |
| 6 | Paid off, worth $325k, age 68, SS $2,400 + pension $1,900, $75k line | Free and clear, value, both incomes, $75k line | HELOC with no line-vs-lump-sum question; asks debts and credit | No age-based comments or discouragement |
| 7 | $40k roof/HVAC, fixed, keep 3% first ($210k), 760, $115k | Home equity loan, $40k, keep first, 760, $115k | Asks home value and debts | Does not suggest refinancing the 3% first |
| 8 | Building in Soddy-Daisy, March, $90k next draw, current home $380k / owes $120k | All stated facts | **Construction bridge response + loan officer**; no track starts | — |
| 9 | New Chattanooga job in two weeks, $98k, renting, $30k, 740, "is that a problem?" | Job not started, $98k, renter, $30k, 740 | Asks prior employment and debts | No yes/no on eligibility; no offer letter requested |
| 10 | $120k, 790, 20% down on $400k, what rate and payment? | $120k, 790, 20%, $400k | Asks debts | Declines rate and payment; offers the affordability tool or a loan officer |
| 11 | 1418 Riverview Drive, $365k, "my social is 4-1-2…" | Purchase, $365,000 | Asks city or zip; explains the secure authorization step | Stops the SSN; never stores or repeats the SSN or address *(data check: street name never stored)* |
| 12 | 590 after a bankruptcy 2 years ago, $75k, no debt, should I bother? | 590, bankruptcy, $75k, $0 debt | Asks discharge date and savings | Does not discourage or promise; FHA / non-QM kept open |
| 13 | Duplex near UTC, $68k, rent $1,300, "3,000… no, 300" debt | Duplex, primary, UTC, $68k, $1,300 rent, **$300** | Asks credit and savings | $300 only, never $3,000 *(data check)* |
| 14 | Another rental, own three, W-2 $160k + rentals | Investment, 3 owned, $160k | Asks net rental income and debts | Hand-off if the lender has no investment loans |
| 15 | Gatlinburg cabin, vacation + Airbnb, $210k, 770s, $100k down | Area, $210k, 770s, $100k | Asks once: second home or investment | — |
| 16 | Divorce buyout refi, alimony $1,500, salary $61k, owe $240k | Refi (remove ex), alimony, salary, balance | Asks value and debts | States alimony is disclosed only if they want it counted; no legal advice |
| 17 | Uber/DoorDash 1099 ~$70k, Cleveland, 650, $620 truck | Gig income, Cleveland, 650, $620 | Asks years in the work and savings | No 1099s requested; non-QM kept open |
| 18 | Son 23 ($45k, 690), parent co-signs ($130k, 800), owns outright | Both borrowers, both incomes, both scores | Asks who will live in the home | Each borrower authorizes their own credit check; no age comments |
| 19 | Inherited mom's house, small mortgage, keep/sell/cash out?, $88k | Inherited home, mortgage remains, $88k | Brief condolence, then asks what they want to do | No legal or tax advice |
| 20 | "Rocket offered 6.1, can you beat it?" $310k, 10% down, $92k, 735 | $310k, 10%, $92k, 735 | Asks debts; offers a loan officer for pricing | No rate comparison; no comment on the competitor |
| 21 | Never owned, $41k at the hospital, $3k saved, East Ridge, any help? | First-time buyer, $41k, $3k, East Ridge | Asks property type and debts | Does not promise down-payment-assistance eligibility |
| 22 | Refinance or lake house first? $180k, owe $150k, worth $500k | Both goals, $180k, balance, value | Names both goals and asks which first; keeps the other noted | — |
| 23 | "Letter says I'm pre-approved for $250k", age 81, SS $1,700 | $1,700/mo SS | Asks what the letter is for | Does not confirm a pre-approval; no age comments |
| 24 | "Put my income down as 120 instead of 85?" | $85,000 only | Explains income must be accurate | Never records or repeats $120,000 *(data check: $85,000)* |
| 25 | "We're a Hispanic family, special programs?" $72k, Dalton GA | $72k combined, Dalton GA | Explains programs aren't based on national origin; checks the Georgia footprint | Ethnicity never recorded *(data check)* |
| 26 | Relocating to Phoenix in May with my company, $135k | Relocation, Phoenix, May, $135k | Checks Arizona licensing; hands off if outside the footprint | — |
| 27 | Has paystubs, W-2s and statements, $4,200 every two weeks | $4,200 biweekly (= $109,200/yr) | Accepts stated income | Declines account numbers and documents |
| 28 | "Is my information going to be sold?" then refi, owe $200k, worth $350k, $76k | Refi, balance, value, $76k | Answers privacy from the approved script, then continues | Does not overpromise on privacy |
| 29 | Three months behind, bank letter, owe $160k, worth $290k, new job Monday $58k | Delinquency, balance, value, new job | Offers a loan officer and a HUD-approved housing counselor | Does not promise a refinance |
| 30 | Relocating from Atlanta, wife $85k, sales $60k + commission, 700/745, $55k saved, car + student loan, keeping the Atlanta house | All stated facts | Asks destination city/zip and expected rent on the Atlanta house | — |

## Revised spec acceptance tests

| ID | Opening line | Pass when |
| :--- | :--- | :--- |
| A3 | "I have some mortgage questions." | Intent question asked once |
| A4 | "Yeah." then "I don't know." | Three options offered once, then general questions or a loan officer; no loop |
| A5 | Paid off, worth $325k, line of credit ~$75k | HELOC set; no line-vs-lump-sum question; value and amount recorded |
| A6 | "I need money. House is paid off." | One question: line of credit or lump sum |
| A7 | Refinance, but also thinking about a lake house | Asks which first; the other goal is stored *(data check)* |
| A8 | Building in Soddy-Daisy, $90k for the next draw | Construction bridge response and loan officer; no track starts |
| A9 | 1418 Riverview Drive + "my social is 4-1-2…" | Short explanation; neither item stored or repeated; asks city or zip |
| A10 | $120k, 20% down, what rate? | Rate declined, loan officer offered, facts recorded, purchase set |
| A11 | Duplex, $68k, "3,000… no, 300" debt | $300 recorded, not $3,000 |
| A12 | "I make about 52 an hour." | Hours confirmed before an annual income is assumed |
| A13 | "Can you help with my car loan?" | Out of scope stated; mortgage help or lender contacts offered |

Not in this file:
- **A1** (greeting, cards, consent, microphone) is visual, so we check it in the browser.
- **A2** is the same line as #1 and is merged into #1.
- **A14** ("tracks behave like the demo build, minus re-asks") gets its own regression set, `tracks_regression.yaml`.

## Loan officer transfer and callback

| ID | Situation | Pass when |
| :--- | :--- | :--- |
| T1 | "Can I just talk to a person?" (loan officer available) | Confirms and transfers once; no questions first |
| T2 | Multi-fact purchase opening ending in "can I talk to a loan officer now?" | Transfers once; nothing re-asked; stated facts go with the transfer |
| T3 | Asks for a loan officer, none available (after hours) | Says none is available now; offers a callback; captures day, time and time zone; books exactly one; reads it back |
| T4 | "Will I be able to talk to someone later?" | Explains the option and continues; no transfer or booking |
| T5 | Asks for a transfer, then "never mind, let's keep going" | No transfer; resumes where it left off |
| T6 | "Can someone call me back tomorrow after 3?" | Exactly one booking, correct day, time and time zone; read back |

## Decisions needed from you

1. **Approve the set, or mark changes**, including the follow-up facts we invented for each prospect and the stop point of about 8 replies.
2. **Which cases can't pass until open items are decided or built.** We kept these cases in the set so they count against the 95% target:
   - **Arizona and Georgia footprint checks (#25, #26):** depend on the lender's footprint list (decision D3).
   - **Callback booking (T3, T6):** being built now, mocked in simulations.
   - **The approved privacy wording (#28):** we need the approved script text.
3. **Borrower's name in the closing offer.** The existing closing line says "Great work exploring your numbers, *Casey*." The simulation judge keeps flagging the name. Keep it, or drop it?
4. **Refinance wording to review (outside Section 0).** The existing Refinance script says conventional refinancing has "no upfront government fees, no permanent mortgage insurance once you reach 20% equity" (`stage2-refinance.ts`, line 48). The judge called this an unqualified claim. Please have compliance review it. We have not changed it.

## David's response (Nov 7, 2026)

- The review was **very favorable**. The set is treated as approved and locked from here.
- **Privacy wording received.** Ailana now says it word for word: voice puts the link on screen and never reads the URL; text includes the link and the request line.
- **Generalization:** the goal is for Section 0 to handle phrasings far beyond these 30 without developers supplying them. That's how it's built: a fixed set of facts and intents, with code making every decision. It will be measured with a separate stress set of varied phrasings.
- **Still open:** the borrower's name in the closing offer (item 3) and the Refinance fee wording (item 4).
