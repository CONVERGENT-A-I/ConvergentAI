# SAFE Act & Regulatory Compliance Audit — Ailana Prompts

Scanned **10 prompt files**, **Layer 3 context engine**, and **frontend compliance gate** across the full Ailana prompt stack.

---

## ✅ What's Present & Strong

### 1. SAFE Act Core Prohibitions — [`ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts#L35-L46)
Layer 1 (global, all stages) includes a robust `SAFE ACT — ABSOLUTE PROHIBITIONS` block:

| Safeguard | Status |
|-----------|--------|
| No specific rate/APR/fee quoting | ✅ Lines 36 |
| No monthly payment calculation | ✅ Lines 37 |
| No product steering ("FHA is best for you") | ✅ Lines 38 |
| No approval/qualification/disqualification language | ✅ Lines 39 |
| Soft pull consent via conversational authorization | ✅ Lines 40 |
| Rate/pre-approval/credit requests → escalate to MLO | ✅ Lines 41 |
| AI disclosure at first contact + on demand | ✅ Lines 42 |
| Institution-neutral language mandate | ✅ Lines 43 |

### 2. TRID / Regulation Z — SSN & Property Address Gate
- **Q9-TRID-GATE** (Lines 44-46): Verbatim refusal scripts for SSN and property address volunteered by borrower. Ailana cannot acknowledge, record, or confirm either. ✅ Strong.

### 3. Stage-Level Guardrails
| Stage | Key Safeguard | File |
|-------|--------------|------|
| Stage 1 | No MLO offer, no contact info collection | [`stage1-greeting.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage1-greeting.ts#L17-L18) |
| Stage 2 | No MLO offer (except closing transition), no contact info, never interpret figures as qualification | [`stage2-prequalification.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage2-prequalification.ts#L69-L74) |
| Stage 2.5 | Cannot recommend price/down payment (SAFE Act boundary), no denial language, no dollar vocalizing | [`stage25-affordability.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage25-affordability.ts#L9-L17) |
| Stage 3A | Word-for-word soft pull consent disclosure, OTP verification via UI modal (not voice) | [`stage3-guidance.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage3-guidance.ts#L69-L72) |
| Stage 4 | AUS results framed carefully — "conditional", "refer" ≠ denial, defer to licensed advisor | [`stage4-underwriting.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage4-underwriting.ts#L50-L67) |
| Stage 5 | Explicit SAFE Act gates for rate requests, pre-approval, and formal applications → MLO handoff | [`stage5-escalation.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage5-escalation.ts#L28-L35) |

### 4. Verbatim Consent Disclosures
- Soft pull consent in [`layer3-context.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/layer3-context.ts#L390) — exact wording enforced.
- Stage 3A consent in [`stage3-guidance.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/stage3-guidance.ts#L70-L71) — exact wording enforced.

### 5. Prohibited Phrases
- [`ailana-system.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/prompts/ailana-system.ts#L48-L53) blocks "I cannot provide financial advice", "consult a professional", "as an AI", and similar.

### 6. Frontend Compliance
- **Compliance gate** ([`compliance-gate.tsx`](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta/compliance-gate.tsx)) with AI disclosure, recording consent, and no-financial-advice disclaimer.
- **Terms & conditions** page references TILA, RESPA, SAFE Act, and CFPB by name.
- **Privacy policy** page covers protected classifications under state/federal law.
- **Affordability audit** utility ([`affordability-audit.ts`](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/utils/affordability-audit.ts)) has immutable audit logging for ECOA/Reg B.

---

## ⚠️ Gaps & Recommendations

### Gap 1: ECOA / Fair Lending (Regulation B) — **Medium Risk**
**Issue:** No explicit prompt instruction prevents Ailana from asking about or factoring in race, color, religion, national origin, sex, familial status, disability, or age (beyond what's legally required). While the AI likely won't spontaneously ask these, there's no hard guardrail if a borrower volunteers protected-class information.

> [!IMPORTANT]
> **Recommendation:** Add to Layer 1 prohibitions:
> ```
> ECOA / FAIR LENDING — ABSOLUTE PROHIBITIONS:
> - Never ask about, factor in, or reference race, color, religion, national origin,
>   sex, familial status, disability, or age in any eligibility assessment or guidance.
> - If a borrower volunteers protected-class information, do not acknowledge it as
>   relevant to their mortgage eligibility. Redirect to the next required field.
> - Marital status may be collected ONLY in Stage 3B as required for the 1003 application.
> ```

### Gap 2: HMDA Data Collection Boundaries — **Low Risk**
**Issue:** HMDA (Home Mortgage Disclosure Act) requires lenders to collect demographic data (race, ethnicity, sex) but this must happen at the formal application stage with specific regulatory framing. The prompts don't explicitly prohibit Ailana from pre-collecting this data in earlier stages.

> [!NOTE]
> **Recommendation:** Add a stage-level guard to stages 1–3:
> ```
> - ABSOLUTE: Do NOT collect demographic monitoring information (race, ethnicity, sex).
>   This data is collected ONLY during the formal application process as required by HMDA.
> ```

### Gap 3: Regulation Z — Credit Terms Advertising — **Low Risk**
**Issue:** The prompts prohibit quoting rates and payments, but don't explicitly address the "trigger term" rules from Reg Z. If Ailana mentions any specific credit term (e.g., "as little as 3% down"), it triggers disclosure requirements for all other terms.

> [!TIP]
> **Recommendation:** Add to Layer 1:
> ```
> REGULATION Z TRIGGER TERMS: Never state specific minimum down payment percentages,
> loan terms in months/years, or payment amounts. Use qualifiers like "some programs
> may allow lower down payments" instead of "FHA requires only 3.5% down."
> ```

### Gap 4: Dodd-Frank Anti-Steering — **Medium Risk**
**Issue:** Ailana presents eligible products and discusses program benefits (Stage 3 product guidance). While it doesn't "recommend" a specific product, the prompt says to present the "strongest fit first," which could be interpreted as steering.

> [!WARNING]
> **Recommendation:** Modify Stage 3 instructions:
> ```diff
> - * Present 2–3 eligible loan products from the borrower profile block,
> -   presenting the strongest fit first.
> + * Present all eligible loan products from the borrower profile block
> +   in neutral order (alphabetical by program name). For each: name it,
> +   explain eligibility criteria, and give one concrete benefit. Do NOT
> +   rank, recommend, or present any program as the "best" or "strongest" option.
> ```

### Gap 5: RESPA Section 8 — Referral Fees — **Low Risk**
**Issue:** When Ailana offers to connect borrowers with loan officers, there's no disclosure about the relationship between the AI platform and the lending institution. Under RESPA Section 8, referral arrangements must be disclosed.

> [!NOTE]
> **Recommendation:** Ensure the Terms & Conditions or a runtime disclosure covers the business relationship between ConvergentAI and the lending institution deploying Ailana.

### Gap 6: UDAAP (Unfair, Deceptive, Abusive Acts/Practices) — **Low Risk**
**Issue:** The eligibility review framing in Stage 2.5 (Q54: "Does this mean I'm approved?") is well-handled, but the affordability panel itself could create a "reasonable expectation" of approval if not carefully disclaimed. The opening narration (Q46) does disclaim, but only verbally.

> [!TIP]
> **Recommendation:** Ensure the affordability panel UI itself (not just Ailana's voice) displays a persistent visual disclaimer like: *"Educational estimate only — not a loan decision."*

### Gap 7: NMLS Identifier Disclosure — **Medium Risk**
**Issue:** Under SAFE Act §1503(e), loan originators must display their NMLS unique identifier. While Ailana is explicitly positioned as a non-originator, any session that transitions to a licensed MLO should surface the MLO's NMLS ID. This isn't addressed in any prompt.

> [!IMPORTANT]
> **Recommendation:** When Stage 5 escalation connects to a live loan officer, the system or prompt should instruct display/disclosure of the MLO's NMLS identifier.

---

## Summary

| Area | Coverage | Risk if Unaddressed |
|------|----------|-------------------|
| SAFE Act core (rates, payments, steering, licensing) | ✅ Comprehensive | — |
| TRID / SSN / Property Address gate | ✅ Strong | — |
| Soft pull consent disclosures | ✅ Verbatim-enforced | — |
| AI nature disclosure | ✅ Present | — |
| Recording/data consent | ✅ Frontend gate | — |
| ECOA / Fair Lending guardrails in prompts | ❌ Missing | Medium |
| HMDA pre-collection boundary | ❌ Missing | Low |
| Reg Z trigger term awareness | ⚠️ Partial | Low |
| Dodd-Frank anti-steering | ⚠️ Partial ("strongest fit first") | Medium |
| RESPA Section 8 disclosure | ⚠️ Not in prompts | Low |
| UDAAP panel disclaimer | ⚠️ Voice-only | Low |
| NMLS ID on MLO handoff | ❌ Missing | Medium |

The core SAFE Act compliance posture is **strong**. The gaps are mostly in adjacent regulations (ECOA, HMDA, Reg Z, Dodd-Frank) that would strengthen the overall compliance envelope.
