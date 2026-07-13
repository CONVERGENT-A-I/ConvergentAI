export interface BorrowerProfile {
  // ── Stage 1 ──────────────────────────────────────────────────────────────
  borrower_name?: string | null;
  borrower_name_confirmed?: boolean;

  mortgage_goal?: string | null;
  mortgage_goal_confirmed?: boolean;

  occupancy?: 'primary' | 'secondary' | 'investment' | null;
  occupancy_confirmed?: boolean;

  existing_relationship?: 'yes' | 'no' | null;
  existing_relationship_confirmed?: boolean;

  timeline?: string | null;
  timeline_confirmed?: boolean;

  co_borrower?: 'yes' | 'no' | null;
  co_borrower_confirmed?: boolean;

  // ── Stage 2 ──────────────────────────────────────────────────────────────
  gross_annual_income?: number | null;
  gross_annual_income_confirmed?: boolean;

  monthly_debt?: number | null;
  monthly_debt_confirmed?: boolean;

  credit_range?: string | null;
  credit_range_confirmed?: boolean;

  down_payment?: number | null;
  down_payment_confirmed?: boolean;

  rent_own?: 'rent' | 'own' | 'own_selling' | null;
  rent_own_confirmed?: boolean;

  realtor_status?: 'yes' | 'no' | null;
  realtor_status_confirmed?: boolean;

  target_price?: number | null;
  target_price_confirmed?: boolean;

  property_type?: 'single_family' | 'condo' | 'townhome' | 'multi_family' | 'other' | null;
  property_type_confirmed?: boolean;

  military_rural?: 'military' | 'rural' | 'both' | 'neither' | null;
  military_rural_confirmed?: boolean;

  job_tenure_type?: string | null;
  job_tenure_type_confirmed?: boolean;

  // When a Stage 2 field is extracted but NOT yet confirmed by the borrower,
  // these hold the raw extracted values so the LLM can issue the confirmation ask.
  pending_confirm_field?: string | null;
  pending_confirm_value?: string | null;

  // Active transition bridge phrase to output next response
  bridge_to_say?: 'stage1_to_stage2' | 'stage2_to_stage3' | null;

  // ── Stage 3 / 3A ─────────────────────────────────────────────────────────
  eligible_products?: string[] | null;
  program_comparison_interest?: 'yes' | 'no' | null;
  program_comparison_interest_confirmed?: boolean;
  financial_priority?: 'low_payment' | 'faster_payoff' | 'balanced' | null;
  financial_priority_confirmed?: boolean;
  home_horizon?: 'long_term' | 'short_term' | null;
  home_horizon_confirmed?: boolean;
  legal_name?: string | null;
  legal_name_confirmed?: boolean;
  physical_address?: string | null;
  physical_address_confirmed?: boolean;
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
  dependents?: number | null;
  dependents_confirmed?: boolean;
  employment_position?: string | null;
  employment_years?: number | null;
  self_employed?: boolean | null;
  employment_confirmed?: boolean;
  checking_savings_balance?: number | null;
  checking_savings_confirmed?: boolean;
  declarations_bankruptcy?: boolean | null;
  declarations_foreclosure?: boolean | null;
  declarations_confirmed?: boolean;
  ready_to_submit?: boolean;

  // ── Stage 4 ──────────────────────────────────────────────────────────────
  aus_status?: 'waiting' | 'approve' | 'approve_with_conditions' | 'refer' | 'suspend' | 'timeout' | null;
  aus_confirmed?: boolean;
  checklist_discussed?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  borrower_name: 'name',
  mortgage_goal: 'mortgage goal',
  occupancy: 'occupancy type',
  existing_relationship: 'existing relationship status',
  timeline: 'timeline',
  co_borrower: 'co-borrower status',
  gross_annual_income: 'gross annual household income',
  monthly_debt: 'total monthly debt payments',
  credit_range: 'credit score',
  legal_name: 'full legal name',
  physical_address: 'physical address',
  down_payment: 'down payment amount',
  rent_own: 'housing status',
  realtor_status: 'real estate agent connection status',
  target_price: 'target purchase price',
  property_type: 'property type',
  military_rural: 'military service or rural property status',
  job_tenure_type: 'employment tenure and income type',
  marital_status: 'marital status',
  dependents: 'number of dependents',
  employment_details: 'employment details',
  checking_savings: 'checking and savings balance',
  declarations: 'declarations',
  submit_confirmation: 'submission confirmation',
  program_comparison_interest: 'program comparison interest',
  financial_priority: 'financial priority',
  home_horizon: 'home horizon status',
  aus_status: 'automated underwriting status',
  checklist_discussed: 'documentation checklist confirmation',
};

export function buildLayer3TurnContext(
  profile: BorrowerProfile,
  pendingField: string | null,
  stage: string = '1',
  isLowConfidence: boolean = false
): string {
  // ── Stage 1 profile block ─────────────────────────────────────────────────
  const stage1Block = [
    '=== BORROWER PROFILE (Stage 1 — Discovery) ===',
    `Name:                  ${profile.borrower_name ?? 'not yet collected'} (Confirmed: ${!!profile.borrower_name_confirmed})`,
    `Goal:                  ${profile.mortgage_goal ?? 'not yet collected'} (Confirmed: ${!!profile.mortgage_goal_confirmed})`,
    `Occupancy:             ${profile.occupancy ?? 'not yet collected'} (Confirmed: ${!!profile.occupancy_confirmed})`,
    `Existing Relationship: ${profile.existing_relationship ?? 'not yet collected'} (Confirmed: ${!!profile.existing_relationship_confirmed})`,
    `Timeline:              ${profile.timeline ?? 'not yet collected'} (Confirmed: ${!!profile.timeline_confirmed})`,
    `Co-Borrower:           ${profile.co_borrower ?? 'not yet collected'} (Confirmed: ${!!profile.co_borrower_confirmed})`,
    '=== END STAGE 1 ===',
  ].join('\n');

  const fmt = (val?: number | null) =>
    val != null ? `$${val.toLocaleString()}` : 'not yet collected';

  // ── Stage 2 profile block ─────────────────────────────────────────────────
  const stage2Block = [
    '=== BORROWER PROFILE (Stage 2 — Pre-Qualification) ===',
    `Gross annual income:   ${fmt(profile.gross_annual_income)} (Confirmed: ${!!profile.gross_annual_income_confirmed})`,
    `Monthly debt:          ${fmt(profile.monthly_debt)} (Confirmed: ${!!profile.monthly_debt_confirmed})`,
    `Credit score:          ${profile.credit_range ?? 'not yet collected'} (Confirmed: ${!!profile.credit_range_confirmed})`,
    `Down payment:          ${fmt(profile.down_payment)} (Confirmed: ${!!profile.down_payment_confirmed})`,
    `Rent/Own status:       ${profile.rent_own ?? 'not yet collected'} (Confirmed: ${!!profile.rent_own_confirmed})`,
    `Realtor status:        ${profile.realtor_status ?? 'not yet collected'} (Confirmed: ${!!profile.realtor_status_confirmed})`,
    `Target price:          ${fmt(profile.target_price)} (Confirmed: ${!!profile.target_price_confirmed})`,
    `Property type:         ${profile.property_type ?? 'not yet collected'} (Confirmed: ${!!profile.property_type_confirmed})`,
    `Military/Rural status: ${profile.military_rural ?? 'not yet collected'} (Confirmed: ${!!profile.military_rural_confirmed})`,
    `Job tenure/type:       ${profile.job_tenure_type ?? 'not yet collected'} (Confirmed: ${!!profile.job_tenure_type_confirmed})`,
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
    `Eligible products:           ${productsList}`,
    `Comparison Walkthrough:     ${profile.program_comparison_interest ?? 'not yet collected'}`,
    `Financial priority:          ${profile.financial_priority ?? 'not yet collected'}`,
    `Home horizon:                ${profile.home_horizon ?? 'not yet collected'}`,
    `Legal Name:                  ${profile.legal_name ?? 'not yet collected'} (Confirmed: ${!!profile.legal_name_confirmed})`,
    `Physical Address:            ${profile.physical_address ?? 'not yet collected'} (Confirmed: ${!!profile.physical_address_confirmed})`,
    `Soft pull consent:           ${profile.soft_pull_consent ?? 'not yet asked'}`,
    profile.soft_pull_consent === 'accepted' ? [
      `MOCK PRE-FILLED DATA RETRIEVED VIA SOFT PULL:`,
      `  - Full Name & Address to confirm: ${profile.legal_name || 'John Doe'}, ${profile.physical_address || '1234 Maple Avenue, Suite 100, Los Angeles, CA 90012'}`,
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
    `Employment Title:    ${profile.employment_position ?? 'not yet collected'}`,
    `Employment Years:    ${profile.employment_years !== undefined && profile.employment_years !== null ? profile.employment_years : 'not yet collected'}`,
    `Self Employed:       ${profile.self_employed !== undefined && profile.self_employed !== null ? (profile.self_employed ? 'Yes' : 'No') : 'not yet collected'}`,
    `Checking/Savings:    ${profile.checking_savings_balance !== undefined && profile.checking_savings_balance !== null ? `$${profile.checking_savings_balance.toLocaleString()}` : 'not yet collected'}`,
    `Bankruptcy:          ${profile.declarations_bankruptcy !== undefined && profile.declarations_bankruptcy !== null ? (profile.declarations_bankruptcy ? 'Yes' : 'No') : 'not yet collected'}`,
    `Foreclosure:         ${profile.declarations_foreclosure !== undefined && profile.declarations_foreclosure !== null ? (profile.declarations_foreclosure ? 'Yes' : 'No') : 'not yet collected'}`,
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
    bridgeBlock = `\n\n*** MANDATORY TRANSITION — DO NOT SKIP ***\nYour response for this turn MUST follow this exact structure:\n1. One brief sentence acknowledging what the borrower just said (e.g. "Got it." or "Understood, thank you.").\n2. Then say the following transition phrase VERBATIM, word-for-word:\n"That gives me a great starting point. Now I would like to spend a few minutes exploring your financial picture — income, current debts, credit profile, and a few other details — so I can map out the loan programs that may be most relevant to your situation."\n3. Then immediately ask for ${pendingField}.\nDo NOT skip this transition regardless of what the borrower just said. Do NOT replace the verbatim phrase with your own words.`;
  } else if (profile.bridge_to_say === 'stage2_to_stage3') {
    bridgeBlock = `\n\n*** MANDATORY TRANSITION — DO NOT SKIP ***\nYour response for this turn MUST follow this exact structure:\n1. One brief sentence acknowledging what the borrower just said.\n2. Then say the following transition phrase VERBATIM, word-for-word:\n"Based on what you have shared, I can walk you through the loan programs that may be most relevant to your situation and answer any questions you have about the process."\nDo NOT skip this transition regardless of what the borrower just said. Do NOT replace the verbatim phrase with your own words.`;
  }

  // ── Stage 2 Closing Offer Instruction ──────────────────────────────────────
  let stage2ClosingBlock = '';
  if (pendingField === 'stage2_closing_offer') {
    stage2ClosingBlock = `\n\nSTAGE 2 CLOSING OFFER INSTRUCTION:\nYou must deliver the following closing transition offer EXACTLY word-for-word:\n"We have covered a lot of great ground together, and I now have a solid picture of your financial starting point. Based on what you have shared, I can begin walking you through the loan programs that may be most relevant to your situation. Before we do that — when you are ready, the natural next step is to submit your information for an initial eligibility review. This gives you real, meaningful feedback on your conditional eligibility — including an estimated payment range — before connecting with a licensed mortgage advisor. The payment estimate is generated by the eligibility review using a current representative rate from our rate sheet — so it reflects actual market conditions, not a rough guess. Would you like to move forward with that now, or would you prefer to continue exploring your options first?"\n\nIf the borrower asks what it involves, say EXACTLY:\n"It is a brief review of the financial information you have shared today. The system will apply a current market rate from our rate sheet as part of the automated eligibility process, and return your conditional eligibility result along with an estimated payment range. Before we proceed, you will be presented with a short disclosure explaining exactly what is included and asked for your authorization. There is no obligation, and the initial review does not affect your credit score."`;
  }

  // ── Verbatim Consent Instruction ──────────────────────────────────────────
  let consentBlock = '';
  if (profile.soft_pull_consent === 'pending') {
    consentBlock = `\n\nCONSENT INSTRUCTION:\nYou MUST speak the following disclosure EXACTLY word-for-word, do NOT paraphrase or change anything:\n"Before we proceed — this is a soft pull, not a hard inquiry. It will not affect your credit score in any way. You are the one authorizing it — not us pulling it on our behalf. Your data is used only to pre-fill your mortgage application. Do you authorize the soft credit inquiry on that basis?"`;
  }

  // ── Low Confidence Instruction ────────────────────────────────────────────
  let lowConfidenceBlock = '';
  if (isLowConfidence) {
    lowConfidenceBlock = `\n\nLOW CONFIDENCE DETECTED:\nThe borrower's last speech was recorded with low audio recognition confidence and was likely garbled or misheard.\nSay EXACTLY: "I'm sorry, I didn't quite catch that. Could you please repeat?"\nDo NOT ask any other question, do NOT confirm fields, do NOT advance stages. Simply prompt for repeat and stop.`;
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
  blocks.push(taskLine + confirmBlock + bridgeBlock + stage2ClosingBlock + consentBlock + lowConfidenceBlock);

  const vaEligibilityReferenceBlock = `
=== VA ELIGIBILITY DETAIL — PROMPT REFERENCE ===
[This section is background knowledge for you. Draw from it conversationally only when the borrower asks a relevant follow-up after the default Q31 response.]
Active duty: 90 continuous days on active duty.
Veterans — wartime: 90 days active duty during a designated wartime period.
Veterans — peacetime: 181 days of continuous active duty.
Discharge character: Must be other than dishonorable. General, under honorable conditions, and other-than-honorable discharges may qualify through a VA character of discharge determination process.
Service-connected disability: Discharge due to service-connected disability qualifies regardless of time-in-service.
National Guard and Reserve: Six years of Selected Reserve or National Guard service, or federal active duty under Title 10 orders for 90+ days.
Surviving spouses: Unremarried surviving spouse of veteran who died in service or from a service-connected disability. Spouses of MIA/POW service members may also be eligible.
VA Funding Fee: Varies by down payment, first vs. subsequent use, and military category. Veterans with service-connected disability rating of 10%+ or active-duty Purple Heart recipients are exempt.
Entitlement: Full entitlement = no loan limit, no down payment required regardless of purchase price, subject to lender guidelines. Partial entitlement applies if prior VA loan is outstanding.
Certificate of Eligibility (COE): Confirmed electronically by licensed advisor during application or DD-214.
=== END VA ELIGIBILITY REFERENCE ===
`.trim();

  blocks.push(vaEligibilityReferenceBlock);

  return blocks.filter(Boolean).join('\n\n');
}
