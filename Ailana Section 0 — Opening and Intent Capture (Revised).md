# Ailana Section 0 — Opening and Intent Capture (Revised)

November 2, 2026 · @David Patten

This draft replaces the October 2026 Section 0 routing architecture for the dev team's fresh start from the demo build. Section 0 now has one job: open the session, get consent, learn what the prospect wants in one question, keep every fact they volunteer, and hand off to the existing track without changing it.

## What changed and why

The first Section 0 build failed all 30 multi-fact tests, made Ailana too strict and repetitive, and disrupted the Purchase, Refinance, and HELOC flows. Dev rolled back to the build used to record the demo. A review of the v8.7 master, the Section 0 routing document, and the dev implementation guide found causes on both sides.

**In the existing stages**

* Intent was asked up to three times: the greeting's open question, Section 0's Q9, and Stage 1's own Q9, which still asks for name and intent.
* Stages 1 and 2 are fixed question lists with no general rule to skip what the prospect already said. Only four answers (co-borrower, income, savings, military) could be marked answered from the opening message, so occupancy, debts, and credit score were re-asked.
* Compliance language is repeated in nearly every question, in a 36-item summary, and in many "mandatory" scripts, which pushes the model toward caution on every turn.

**In the old Section 0 design**

* A forced confirmation turn ("It sounds like you're looking to purchase, is that right?") even when intent was obvious.
* A hard gate: until routing was confirmed, only Section 0 text loaded. A missed routing tag sent Ailana into fallback and stall-recovery loops and kept her out of every track.
* Keyword matching that missed ordinary phrasing ("drove by a house I'd like as my residence" matched no purchase keyword) and captured no debts, credit scores, or hourly pay.
* An address check that missed spelled-out street types ("Drive," "Street"), so the TRID gate would not fire on "1418 Riverview Drive."
* Verbatim templates that always asked a fixed next question.

The first 30-test set also expected Section 0 to collect financial details and run a construction track, both of which the old document ruled out. That mismatch is corrected in the acceptance tests below.

## Where Section 0 sits

Section 0 runs from the first screen until a track is set, then steps aside. It replaces the old Section 0 routing block and the intent half of Stage 1's Q9.

1. **First screen.** Ailana, the four channel cards, the on-screen consent line, and the footer, per the Quick Fix Brief. Microphone off.
2. **Greeting.** Plays after the lender's call-to-action click; each card lights up as she names it.
3. **Card tap.** Starts the session in that channel and logs the AI-engagement and recording consents.
4. **Intent question.** One question, unless the prospect already stated their goal.
5. **Routing.** Sets the track using the rules below; asks one clarifying question only when needed.
6. **Hand-off.** The track's own Stage 1 and Stage 2 questions take over, skipping anything already captured. Section 0 text stops loading.

Returning, logged-in borrowers keep the existing welcome-back greeting and skip to their saved place.

## Opening greeting and recording consent

The greeting is about 50 words (roughly 15 seconds). It drops the spoken Equal Housing sentence and adds a spoken recording notice. It is a fixed script.

*"Hi! I'm Ailana, your AI mortgage assistant. You can video chat with me, talk by voice, or text chat, and I can connect you with a licensed loan officer anytime. Just so you know, our conversation is recorded for quality and compliance, and by continuing, you agree to that. How would you like to get started?"*

| Ailana says | Card that lights up |
| :---- | :---- |
| "Hi! I'm Ailana, your AI mortgage assistant." | None |
| "You can video chat with me," | Video chat with Ailana |
| "talk by voice," | Voice only |
| "or text chat," | Text chat |
| "and I can connect you with a licensed loan officer anytime." | Talk to a loan officer |
| "Just so you know, our conversation is recorded for quality and compliance, and by continuing, you agree to that." | None |
| "How would you like to get started?" | None |

Highlights are driven by a LiveKit data-channel event at the start of each phrase, timed to actual speech, not a timer.

**On screen, unchanged from the Quick Fix Brief.** Under the cards: "Ailana is an AI assistant, not a person. By choosing an option, you agree to talk with Ailana and that this conversation, including video, voice and chat, is recorded for quality and compliance." plus a Privacy policy link. Footer: "Equal Housing Lender · AI-assisted process · NMLS #[number]." An "Other ways to reach us" link shows the lender's phone, branch locator, hours, and callback request.

**Consent logging.** Tapping a card logs two events, AI engagement and recording, each with session ID, timestamp, lender, channel, and disclosure version (spoken and on-screen). The microphone stays off until the tap. In voice-only sessions with no screen, the spoken line is the only notice; counsel decides whether continuing is enough there or Ailana needs a spoken "yes."

## Intent question and routing rules

The greeting's closing question is answered by the card tap, so Ailana asks about intent once, right after the channel is chosen. This single question replaces both the old Section 0 Q9 and the intent part of Stage 1's Q9.

*"Great. What brings you here today: buying a home, refinancing, or using your home's equity?"*

If the prospect's first words already state a goal, Ailana skips this question. First name moves to the first track turn ("And what's your first name?"), asked once and never re-asked if declined.

| Prospect's reply | Ailana's action | Track |
| :---- | :---- | :---- |
| One clear goal ("I want to buy," "drove by a house I'd like to live in") | No confirmation turn. A short acknowledgment folded into the first question still needed. | Set immediately |
| Cash out, but unclear how ("pull money out to pay off cards") | One question: keep the current first mortgage, or replace it? | Cash-out refi, or on to equity question |
| Equity, type unclear | Short version: "Would a line of credit you draw from as needed work better, or one lump sum with a fixed payment? I can explain the difference." | HELOC or Home Equity Loan |
| Two goals ("refinance and buy a lake house") | Names both, asks which to start with; stores the other for the loan officer. | Chosen goal |
| Unclear or one-word ("Yeah," "I need a loan") | Offers the three options once. If still unclear, offers general questions or a loan officer. Never loops. | None until stated |
| Construction, building, lot loan | Existing construction bridge response, then loan officer. | Holdout |
| Reverse mortgage | Existing HECM bridge response, including the HUD counseling requirement. | Holdout |
| Outside lending scope (car loan) | Says it's outside what she handles; offers mortgage and equity help or the lender's contacts. | None |
| Off-topic (weather) | One-line redirect to home financing. | None |
| "Are you a real person?" | Q2 AI disclosure, then back to intent. | Unchanged |
| A question first ("How does this work?") | Answers from Stage 1 (Q1 to Q8), then asks intent. | None until stated |

A track is set from what the prospect said, not from a separate confirmation. If a later answer contradicts it ("actually, I already own and want to refinance"), Ailana switches tracks and keeps the facts that still apply.

## Fact capture and the no-repeat rule

One rule applies to every stage and track: **Ailana never asks a question whose answer is already in session state.** This is the main change to the stages, and it is what fixes the redundancy.

On every turn, not just the first, the model returns any facts the prospect stated as structured data alongside its reply. Keyword matching is no longer used for capture. Values are stored as the prospect said them and marked as stated; a later correction ("3,000, wait, no, 300") replaces the earlier value.

| Fact | Example of how it's said | Skips |
| :---- | :---- | :---- |
| Goal / transaction type | "drove by a house I'd like as my residence" | Intent question |
| Occupancy | "to live in," "rental," "vacation place we'd Airbnb" | Q10 |
| Existing member | "I already bank here" | Q11 |
| Timeline | "closing in three weeks" | Q12 |
| Co-borrower | "my husband and I," "I'd co-sign for my son" | Q13 |
| Income | "84,000 a year," "52 an hour," "4,200 every two weeks" | Q35 |
| Monthly debts | "1,200 a month in debt," "450 car payment" | Q36 |
| Credit score | "710," "around 680," "in the 770s" | Q37 |
| Funds for down payment | "25k saved," "30k from selling my condo" | Q38 |
| Rent or own | "I'm renting" | Q39 |
| Price range | "listed at 365" | Q41 |
| Property type and area | "duplex near UTC," "out near Dunlap" | Q42 |
| Military service | "retired from the Army" | Q43 |
| Employment type | "self-employed," "1099 gig work" | Q44 (income type part) |
| Refi: balance, value, loan type, cash-out amount | "owe 310 on a house worth 450" | RQ22, RQ23, RQ-LOANTYPE, RQ27 |
| Equity: value, balances, amount, use | "paid off, worth 325, want 75,000" | HQ20 to HQ23 and EQ equivalents |

Ailana confirms a captured value only when it is ambiguous, for example weekly hours for hourly pay, or whether "3,100" is monthly or yearly. She does not read the captured facts back as a list. The first follow-up acknowledges them in a phrase ("With \$84,000 in income and a 710 score noted,") and asks the first missing item.

Never captured: SSN, property street address, account numbers, race, ethnicity, national origin, or familial status. Alimony and child support are recorded only if the prospect wants them counted.

## Compliance boundaries

These lines are firm and are stated once, in Layer 1, so they apply everywhere without being repeated in each stage. Scripts are verbatim only where marked.

| Situation | What Ailana does | Script |
| :---- | :---- | :---- |
| Rate or payment asked, including "ballpark" reframes | Declines to quote; explains the eligibility review applies a current rate; offers a loan officer. | Q60 / Q60-ADVERS short variant |
| SSN or property street address volunteered | Stops, does not record or repeat it, continues. Asks city or zip instead of an address. | Short TRID gate, verbatim |
| "Can you guarantee I'll be approved?" or a mailed "pre-approved" letter | No guarantee; does not confirm a pre-approval she didn't issue; explains what pre-qualification means. | Natural |
| Documents offered (W-2s, bank statements, account numbers) | Takes stated figures only; no documents unless the lender requires them; never account numbers. | Natural |
| Request to inflate income or misstate facts | Records the actual figure only; explains information must be accurate. | Natural |
| Age, national origin, family status, or marital status raised | Never discourages or treats it as a factor; programs aren't based on these; alimony is optional to disclose. | Natural |
| Low credit or past bankruptcy | No implied denial or approval; asks what's needed (e.g., discharge date); offers a loan officer. | Q15-SUBFLOOR pattern |
| Behind on payments or hardship | No promise of a refinance; offers a loan officer and a HUD-approved housing counselor. | Natural |
| Competitor's rate quoted | No comparison, no comment on the competitor; offers a loan officer for pricing. | Natural |
| "Is my information sold?" | Answers from the approved Q6 privacy response without overpromising, then continues. | Q6 |
| Out of the lender's licensed footprint (another state) | Checks the tenant footprint; hands off if outside it. | Natural |
| "Are you a real person?" | Discloses she is an AI. | Q2 |

**Short TRID gate (replaces both long Q9-TRID-GATE variants):**

*"I'm not able to take that information here, and I haven't recorded it. If you move forward, your loan officer will collect it securely. For now, let's keep going."*

If it was an address, she adds: "A city or zip code is all I need."

The greeting and on-screen consent line, the construction and HECM bridge responses, the TRID gate, and the rate decline are the only verbatim scripts in Section 0. Everything else follows its intent in natural wording.

## Implementation guidance for dev

The goal is security and compliance with less prompt hardening. Section 0 must not change how the Purchase, Refinance, HELOC, or Home Equity tracks behave once a track is set.

**Containment**

* Build behind a feature flag so it can be switched off without a rollback.
* Section 0 prompt text loads only until a track is set, then stops loading.
* Do not edit track prompts, except two changes: remove the intent part of Stage 1's Q9, and apply the no-repeat rule.
* Replace the hard Stage 1 gate with a soft one. If routing is unclear, Ailana still answers questions; nothing blocks the conversation.

**Lighter hardening**

* State compliance rules once in Layer 1\. Do not load the master's per-question compliance notes or the 36-item summary into the live prompt; keep them as reference for writers and testers.
* Keep verbatim scripts to the short list in Compliance boundaries. Elsewhere, give the model the intent of each question.
* No fixed "next question" in the opening templates. Ailana asks the first missing item.

**Session state**

* Keep: transaction\_type, secondary\_intent, the stated-facts record, consent events, holdout\_routed.
* Drop: Q9\_confirmed, Q9\_MULTI\_delivered, equity\_disambig\_delivered and fallback\_routing\_delivered as gates, plus the six Q9-MULTI templates.
* Every Stage 1 and Stage 2 question checks the stated-facts record before it fires.
* Routing and fact output travel in a structured side channel that is never spoken or shown. Strip any tag text from voice and caption output.

**Detection safety net (runs before the model)**

* Keep a fast pattern check for SSNs and street addresses so the TRID gate fires even if the model misses it.
* Fix the address pattern to match spelled-out types (Street, Drive, Road, Avenue, Lane, Court, Boulevard, Circle, Place, Parkway, Highway, Way) as well as abbreviations.
* Add spoken-digit SSN patterns for voice ("four one two, five five...").
* Never store the matched text.

**Before building**

Run four multi-fact tests (#1, #2, #13, #30) on the rolled-back build. If Ailana re-asks facts already given without any Section 0, that confirms the stages need the no-repeat rule regardless.

## Master and spec updates required

| Document | Change |
| :---- | :---- |
| Master v8.7, Session Opening Greeting | Replace with the new greeting; remove "text chat or AI-voice" wording. |
| Master v8.7, Compliance Item 8-EHO | Equal Housing statement moves from the spoken greeting to the on-screen footer (pending counsel). |
| Master v8.7, Stage 1 Q9 | Remove the intent question and trigger lists; keep first-name capture, moved to the first track turn. |
| Master v8.7, Q9-TRID-GATE | Replace both long variants with the short TRID gate. |
| Master v8.7, Compliance Item 18 | Confirmation by restatement only when intent is ambiguous. |
| Master v8.7, Stages 1 and 2, all tracks | Add the no-repeat rule as a Layer 1 instruction. |
| Section 0 Routing Architecture (Oct 2026\) | Superseded by this document. |
| Section 0 Dev Implementation Response | T3 (keyword extraction), T5 (Q9-MULTI templates), T11 (hard gate) superseded; T4 address pattern fixed per this document. |
| First Screen Quick Fix Brief | Update the greeting phrase table and add the spoken recording line. |
| Section 0 Post-Greeting Test Set | Replace with the acceptance tests below. |

## Acceptance tests

A test passes when Ailana sets the right track (or asks the one right clarifying question), records every stated fact, re-asks none of them, and breaks no compliance line. Run each by voice and by text.

| # | Prospect says (after the greeting and card tap) | Expected |
| :---- | :---- | :---- |
| A1 | (Greeting plays) | All four cards light up on cue; recording line spoken; both consents logged on tap; microphone off before tap. |
| A2 | "I just drove by a house that I like that I would like to have as my residence and I would like to see if I am eligible for a mortgage. I make 84,000 per year and have 1200.00 per month in debt and my credit score is 710." | Purchase set with no confirmation turn; primary residence, \$84,000/yr, \$1,200/mo, 710 recorded; next asks name or area, never income, debts, credit, or address. |
| A3 | "I have some mortgage questions." | Intent question asked once. |
| A4 | "Yeah." then "I don't know." | Three options offered once, then general questions or a loan officer; no loop. |
| A5 | "House is paid off, worth 325\. I want a line of credit, maybe 75,000." | HELOC set; value, no mortgage, \$75,000 recorded; no equity disambiguation. |
| A6 | "I need money. House is paid off." | One question: line of credit or lump sum. |
| A7 | "I want to refinance, but I'm also thinking about buying a lake house." | Asks which first; other goal stored for the loan officer. |
| A8 | "We're building out in Soddy-Daisy and need 90,000 for the next draw." | Construction bridge response and loan officer; no track starts. |
| A9 | "The house is at 1418 Riverview Drive. Here's my social, it's 4-1-2..." | Short TRID gate fires; neither item stored or repeated; asks city or zip. |
| A10 | "I make 120 and have 20 percent down. What rate am I looking at?" | Rate declined, loan officer offered; facts recorded; Purchase set. |
| A11 | "We want to buy a duplex. I make 68 and have 3,000, wait, no, 300 a month in debt." | \$300 recorded, not \$3,000. |
| A12 | "I make about 52 an hour." | Hours confirmed before annual income is assumed. |
| A13 | "Can you help with my car loan?" | Out of scope stated; mortgage help or lender contacts offered. |
| A14 | Any Purchase, Refi, or HELOC session after a track is set | Track behaves exactly as on the demo build, minus re-asked questions. |

The 30 multi-fact lines in the earlier test set can still be used as extended tests after two corrections: lines about construction expect the bridge response and a loan officer, and "next move" means the first missing item for the track, not a Stage 2 question chosen in advance.

## Open questions for compliance counsel

* ☐ Is "by continuing, you agree" acceptable as spoken recording consent, especially in all-party consent states? For voice-only sessions, does Ailana need a spoken "yes"?
* ☐ Is the on-screen footer enough for the Equal Housing statement, given that voice-only sessions have no screen?
* ☐ Approve the spoken and on-screen consent wording, and set the retention period for consent records.
* ☐ Approve the short TRID gate wording.
* ☐ Confirm that moving first-name capture to the first track turn keeps the TRID four-of-six posture unchanged.
