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
  employer?: string | null;
  prefilled_fields_confirmed?: {
    name_address?: boolean;
    employer?: boolean;
    accounts?: boolean;
    credit_range?: boolean;
  };

  // ── Stage 3B ──────────────────────────────────────────────────────────────
  marital_status?: 'married' | 'separated' | 'unmarried' | null;
  marital_status_confirmed?: boolean;
  co_borrower?: 'yes' | 'no' | null;
  co_borrower_confirmed?: boolean;
  dependents?: number | null;
  dependents_confirmed?: boolean;
  ssn_confirmed?: boolean;
  employment_position?: string | null;
  employment_years?: number | null;
  self_employed?: boolean | null;
  employment_confirmed?: boolean;
  checking_savings_balance?: number | null;
  checking_savings_confirmed?: boolean;
  declarations_bankruptcy?: boolean | null;
  declarations_foreclosure?: boolean | null;
  declarations_confirmed?: boolean;
  hmda_completed?: boolean;
  ready_to_submit?: boolean;

  // ── Stage 4 ──────────────────────────────────────────────────────────────
  aus_status?: 'waiting' | 'approve' | 'refer' | 'timeout' | null;
  aus_confirmed?: boolean;
  checklist_discussed?: boolean;
}

// Human-readable field labels used in the confirmation ask
const FIELD_LABELS: Record<string, string> = {
  gross_monthly_income: 'gross monthly income',
  monthly_debt: 'total monthly debt payments',
  credit_range: 'credit score',
  down_payment: 'down payment amount',
  property_value: 'estimated home purchase price',
  marital_status: 'marital status',
  co_borrower: 'co-borrower status',
  dependents: 'number of dependents',
  ssn_confirm: 'Social Security Number',
  employment_details: 'employment details',
  checking_savings: 'checking and savings balance',
  declarations: 'declarations',
  hmda: 'voluntary HMDA questions',
  submit_confirmation: 'submission confirmation',
  aus_status: 'automated underwriting status',
  checklist_discussed: 'documentation checklist confirmation',
};

export function buildLayer3TurnContext(
  profile: BorrowerProfile,
  pendingField: string | null,
  stage: string = '1'
): string {
  // ── Property state display ────────────────────────────────────────────────
  const propertyStateDisplay =
    profile.property_state === 'not_specified'
      ? 'not specified (borrower is open to any state — do NOT invent a state name)'
      : (profile.property_state ?? 'not yet collected');

  // ── Stage 1 profile block ─────────────────────────────────────────────────
  const stage1Block = [
    '=== BORROWER PROFILE (Stage 1 — Discovery) ===',
    `Name:           ${profile.borrower_name ?? 'not yet collected'} (Confirmed: ${!!profile.borrower_name_confirmed})`,
    `Goal:           ${profile.mortgage_goal ?? 'not yet collected'} (Confirmed: ${!!profile.mortgage_goal_confirmed})`,
    `Timeline:       ${profile.timeline ?? 'not yet collected'} (Confirmed: ${!!profile.timeline_confirmed})`,
    `Property state: ${propertyStateDisplay} (Confirmed: ${!!profile.property_state_confirmed})`,
    '=== END STAGE 1 ===',
  ].join('\n');

  const fmt = (val?: number | null) =>
    val != null ? `$${val.toLocaleString()}` : 'not yet collected';

  // ── Stage 2 profile block ─────────────────────────────────────────────────
  const stage2Block = [
    '=== BORROWER PROFILE (Stage 2 — Pre-Qualification) ===',
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

  // Get credit score category text based on the numeric score confirmed in Stage 2
  let creditScoreNum = 700;
  if (profile.credit_range) {
    const m = profile.credit_range.match(/\d+/);
    if (m) creditScoreNum = parseInt(m[0], 10);
  }
  let creditRangeCategory = 'Good';
  let creditRangeLimits = '670 to 739';
  if (creditScoreNum >= 740) {
    creditRangeCategory = 'Excellent';
    creditRangeLimits = '740 to 850';
  } else if (creditScoreNum >= 670) {
    creditRangeCategory = 'Good';
    creditRangeLimits = '670 to 739';
  } else if (creditScoreNum >= 580) {
    creditRangeCategory = 'Fair';
    creditRangeLimits = '580 to 669';
  } else {
    creditRangeCategory = 'Poor';
    creditRangeLimits = '300 to 579';
  }

  const stage3Block = [
    '=== BORROWER PROFILE (Stage 3 — Eligibility & Consent) ===',
    `Eligible products: ${productsList}`,
    `Soft pull consent: ${profile.soft_pull_consent ?? 'not yet asked'}`,
    profile.soft_pull_consent === 'accepted' ? [
      `MOCK PRE-FILLED DATA RETRIEVED VIA SOFT PULL:`,
      `  - Full Name & Address to confirm: John Doe, 1234 Maple Avenue, Suite 100, Los Angeles, CA 90012`,
      `  - Employer to confirm: ${profile.employer || 'Nexus Technologies LLC Corp'}`,
      `  - Accounts Summary to confirm: 2 open active credit cards, 1 auto loan, and no negative accounts or late payments in the last 24 months`,
      `  - Credit Range Category to confirm: ${profile.credit_range ? (profile.credit_range + ' range') : (creditRangeCategory + ' range (' + creditRangeLimits + ')')}`,
    ].join('\n') : '',
    `Prefilled fields confirmed:`,
    `  - Name & Address: ${!!profile.prefilled_fields_confirmed?.name_address}`,
    `  - Employer:       ${!!profile.prefilled_fields_confirmed?.employer}`,
    `  - Accounts:       ${!!profile.prefilled_fields_confirmed?.accounts}`,
    `  - Credit range:   ${!!profile.prefilled_fields_confirmed?.credit_range}`,
    '=== END STAGE 3 ===',
  ].filter(Boolean).join('\n');

  // ── Stage 3B application completion block ─────────────────────────────────
  const stage3BBlock = [
    '=== BORROWER PROFILE (Stage 3B — Application Completion) ===',
    `Marital status:      ${profile.marital_status ?? 'not yet collected'}`,
    `Spouse co-borrower:  ${profile.co_borrower ?? 'not yet collected'}`,
    `Dependents count:    ${profile.dependents !== undefined && profile.dependents !== null ? profile.dependents : 'not yet collected'}`,
    `SSN typed on screen: ${profile.ssn_confirmed ? 'Yes' : 'No'}`,
    `Employment Title:    ${profile.employment_position ?? 'not yet collected'}`,
    `Employment Years:    ${profile.employment_years !== undefined && profile.employment_years !== null ? profile.employment_years : 'not yet collected'}`,
    `Self Employed:       ${profile.self_employed !== undefined && profile.self_employed !== null ? (profile.self_employed ? 'Yes' : 'No') : 'not yet collected'}`,
    `Checking/Savings:    ${profile.checking_savings_balance !== undefined && profile.checking_savings_balance !== null ? `$${profile.checking_savings_balance.toLocaleString()}` : 'not yet collected'}`,
    `Bankruptcy:          ${profile.declarations_bankruptcy !== undefined && profile.declarations_bankruptcy !== null ? (profile.declarations_bankruptcy ? 'Yes' : 'No') : 'not yet collected'}`,
    `Foreclosure:         ${profile.declarations_foreclosure !== undefined && profile.declarations_foreclosure !== null ? (profile.declarations_foreclosure ? 'Yes' : 'No') : 'not yet collected'}`,
    `HMDA Demographics:  ${profile.hmda_completed ? 'Completed' : 'Not yet collected'}`,
    `Ready to Submit:     ${profile.ready_to_submit ? 'Yes' : 'No'}`,
    '=== END STAGE 3B ===',
  ].join('\n');

  // ── Stage 4 automated underwriting block ──────────────────────────────────
  const stage4Block = [
    '=== BORROWER PROFILE (Stage 4 — Underwriting & Checklist) ===',
    `AUS Status:          ${profile.aus_status ?? 'not yet submitted'}`,
    `Checklist Discussed: ${profile.checklist_discussed ? 'Yes' : 'No'}`,
    '=== END STAGE 4 ===',
  ].join('\n');

  // ── Current task line ─────────────────────────────────────────────────────
  let taskLine = '';
  if (profile.pending_confirm_field && profile.pending_confirm_value) {
    const label = FIELD_LABELS[profile.pending_confirm_field] ?? profile.pending_confirm_field;
    taskLine = `CURRENT TASK:\nConfirm the value of "${profile.pending_confirm_value}" for ${label}. Do NOT ask for the next field yet.`;
  } else if (pendingField) {
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

  const blocks: string[] = [];
  blocks.push(stage1Block);
  if (stage === '2' || stage === '3' || stage === '3A' || stage === '3B' || stage === '4' || stage === '5') {
    blocks.push(stage2Block);
  }
  if (stage === '3' || stage === '3A' || stage === '3B' || stage === '4' || stage === '5') {
    blocks.push(stage3Block);
  }
  if (stage === '3B' || stage === '4' || stage === '5') {
    blocks.push(stage3BBlock);
  }
  if (stage === '4' || stage === '5') {
    blocks.push(stage4Block);
  }
  blocks.push(taskLine + confirmBlock + bridgeBlock + consentBlock);

  return blocks.filter(Boolean).join('\n\n');
}
