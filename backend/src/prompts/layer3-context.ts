export interface BorrowerProfile {
  // ── Stage 1 ──────────────────────────────────────────────────────────────
  borrower_name?: string | null;
  borrower_name_confirmed?: boolean;

  mortgage_goal?: string | null;
  mortgage_goal_confirmed?: boolean;

  timeline?: string | null;
  timeline_confirmed?: boolean;

  property_state?: string | null;
  property_state_confirmed?: boolean;

  // ── Stage 2 ──────────────────────────────────────────────────────────────
  gross_monthly_income?: number | null;
  gross_monthly_income_confirmed?: boolean;

  monthly_debt?: number | null;
  monthly_debt_confirmed?: boolean;

  credit_range?: string | null;
  credit_range_confirmed?: boolean;

  down_payment?: number | null;
  down_payment_confirmed?: boolean;

  property_value?: number | null;
  property_value_confirmed?: boolean;

  // When a Stage 2 field is extracted but NOT yet confirmed by the borrower,
  // these hold the raw extracted values so the LLM can issue the confirmation ask.
  pending_confirm_field?: string | null;
  pending_confirm_value?: string | null;

  // Active transition bridge phrase to output next response
  bridge_to_say?: 'stage1_to_stage2' | 'stage2_to_stage3' | null;

  // ── Stage 3 / 3A ─────────────────────────────────────────────────────────
  eligible_products?: string[] | null;
  soft_pull_consent?: 'pending' | 'accepted' | 'declined' | null;
  prefilled_fields_confirmed?: {
    name_address?: boolean;
    employer?: boolean;
    accounts?: boolean;
    credit_range?: boolean;
  };
}

// Human-readable field labels used in the confirmation ask
const FIELD_LABELS: Record<string, string> = {
  gross_monthly_income: 'gross monthly income',
  monthly_debt: 'total monthly debt payments',
  credit_range: 'credit score',
  down_payment: 'down payment amount',
  property_value: 'estimated home purchase price',
};

export function buildLayer3TurnContext(
  profile: BorrowerProfile,
  pendingField: string | null
): string {
  // ── Property state display ────────────────────────────────────────────────
  const propertyStateDisplay =
    profile.property_state === 'not_specified'
      ? 'not specified (borrower is open to any state — do NOT invent a state name)'
      : (profile.property_state ?? 'not yet collected');

  // ── Stage 1 profile block ─────────────────────────────────────────────────
  const stage1Block = [
    '=== BORROWER PROFILE (Stage 1) ===',
    `Name:           ${profile.borrower_name ?? 'not yet collected'} (Confirmed: ${!!profile.borrower_name_confirmed})`,
    `Goal:           ${profile.mortgage_goal ?? 'not yet collected'} (Confirmed: ${!!profile.mortgage_goal_confirmed})`,
    `Timeline:       ${profile.timeline ?? 'not yet collected'} (Confirmed: ${!!profile.timeline_confirmed})`,
    `Property state: ${propertyStateDisplay} (Confirmed: ${!!profile.property_state_confirmed})`,
    '=== END STAGE 1 ===',
  ].join('\n');

  // ── Stage 2 financial profile block ──────────────────────────────────────
  const fmt = (v: number | null | undefined) =>
    v == null ? 'not yet collected' : `$${v.toLocaleString()}`;

  const stage2Block = [
    '=== BORROWER PROFILE (Stage 2 — Financial) ===',
    `Gross monthly income:  ${fmt(profile.gross_monthly_income)} (Confirmed: ${!!profile.gross_monthly_income_confirmed})`,
    `Monthly debt:          ${fmt(profile.monthly_debt)} (Confirmed: ${!!profile.monthly_debt_confirmed})`,
    `Credit score:          ${profile.credit_range ?? 'not yet collected'} (Confirmed: ${!!profile.credit_range_confirmed})`,
    `Down payment:          ${fmt(profile.down_payment)} (Confirmed: ${!!profile.down_payment_confirmed})`,
    `Property value:        ${fmt(profile.property_value)} (Confirmed: ${!!profile.property_value_confirmed})`,
    '=== END STAGE 2 ===',
  ].join('\n');

  // ── Stage 3 eligibility & consent block ──────────────────────────────────
  const productsList = profile.eligible_products && profile.eligible_products.length > 0
    ? profile.eligible_products.join(', ')
    : 'None / Not determined';

  const stage3Block = [
    '=== BORROWER PROFILE (Stage 3 — Eligibility & Consent) ===',
    `Eligible products: ${productsList}`,
    `Soft pull consent: ${profile.soft_pull_consent ?? 'not yet asked'}`,
    `Prefilled fields confirmed:`,
    `  - Name & Address: ${!!profile.prefilled_fields_confirmed?.name_address}`,
    `  - Employer:       ${!!profile.prefilled_fields_confirmed?.employer}`,
    `  - Accounts:       ${!!profile.prefilled_fields_confirmed?.accounts}`,
    `  - Credit range:   ${!!profile.prefilled_fields_confirmed?.credit_range} (Reference the user's numeric score and clarify if it is Excellent, Good, Fair, etc., for their understanding. Do NOT say a bucket name, use descriptive ranges.)`,
    '=== END STAGE 3 ===',
  ].join('\n');

  // ── Current task line ─────────────────────────────────────────────────────
  let taskLine = '';
  if (pendingField) {
    taskLine = `CURRENT TASK:\nCollect ${pendingField}\n\nDO NOT ASK FOR ANY OTHER FIELD.`;
  } else {
    taskLine = 'CURRENT TASK:\nAll fields for this stage collected.';
  }

  // ── Confirmation instruction (only when a field was just extracted) ────────
  let confirmBlock = '';
  if (profile.pending_confirm_field && profile.pending_confirm_value) {
    const label = FIELD_LABELS[profile.pending_confirm_field] ?? profile.pending_confirm_field;
    confirmBlock =
      `\nCONFIRM THIS TURN:\n` +
      `The borrower just mentioned "${profile.pending_confirm_value}" as their ${label}.\n` +
      `Say EXACTLY: "Just to confirm — you mentioned ${profile.pending_confirm_value} as your ${label}. Is that right?"\n` +
      `Do NOT ask for any other field. Wait for their yes/no before continuing.`;
  }

  // ── Stage transition bridge instruction ───────────────────────────────────
  let bridgeBlock = '';
  if (profile.bridge_to_say === 'stage1_to_stage2') {
    bridgeBlock = `\n\nBRIDGE INSTRUCTION:\nStart your response by saying EXACTLY: "That gives me a solid picture. I'd like to ask a few questions about your financial situation so I can point you toward the right options." then proceed to ask for ${pendingField}.`;
  } else if (profile.bridge_to_say === 'stage2_to_stage3') {
    bridgeBlock = `\n\nBRIDGE INSTRUCTION:\nStart your response by saying EXACTLY: "Let me walk you through the options that look like the strongest fit."`;
  }

  // ── Verbatim Consent Instruction ──────────────────────────────────────────
  let consentBlock = '';
  if (profile.soft_pull_consent === 'pending') {
    consentBlock = `\n\nCONSENT INSTRUCTION:\nYou MUST speak the following disclosure EXACTLY word-for-word, do NOT paraphrase or change anything:\n"Before we proceed — this is a soft pull, not a hard inquiry. It will not affect your credit score in any way. You are the one authorizing it — not us pulling it on our behalf. Your data is used only to pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"`;
  }

  return [stage1Block, stage2Block, stage3Block, taskLine + confirmBlock + bridgeBlock + consentBlock].join('\n\n');
}

