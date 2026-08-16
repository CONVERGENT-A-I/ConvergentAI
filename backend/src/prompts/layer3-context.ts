export interface BorrowerProfile {
  current_pending_field?: string | null;

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

  rent_own?: 'rent' | 'own' | 'own_selling' | 'other' | null;
  rent_own_confirmed?: boolean;

  realtor_status?: 'yes' | 'no' | 'other' | null;
  realtor_status_confirmed?: boolean;

  refinance_type?: 'cash_out' | 'rate_term' | 'other' | null;
  refinance_type_confirmed?: boolean;

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
  bridge_to_say?: 'stage1_to_stage2' | 'stage2_to_stage3' | 'stage3A_to_stage3B' | null;

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

  // ── Stage 2.5 (Affordability Panel) ──────────────────────────────────────
  affordability_panel_rendered?: boolean;
  affordability_mode?: 'stated' | 'verified' | null;
  affordability_purchase_price?: number | null;
  affordability_down_payment?: number | null;
  affordability_income_band?: 'within' | 'above' | null;
  affordability_dti_band?: 'within' | 'above' | null;
  affordability_submitted?: boolean;
  affordability_aus_status?: 'pending' | 'approve_eligible' | 'refer' | null;
  affordability_prequel_letter_sent?: boolean;
  session_login_complete?: boolean;
  contact_on_file?: boolean;
  contact_email?: string | null;
  contact_mobile?: string | null;
  otp_verified?: boolean;
  zip_code?: string | null;

  // ── Stage 2.5 Compliance Disclosures & Flags ──────────────────────────────
  eligibility_review_explained?: boolean;
  credit_impact_stated?: boolean;
  pmi_explained?: boolean;
  transition_pitch_delivered?: boolean;
  dti_above_hard_ceiling?: boolean;

  // ── Stage 4 ──────────────────────────────────────────────────────────────
  aus_status?: 'waiting' | 'approve' | 'approve_with_conditions' | 'refer' | 'suspend' | 'timeout' | null;
  aus_confirmed?: boolean;
  checklist_discussed?: boolean;

  // ── Stage 5 (Escalation) ─────────────────────────────────────────────────
  escalation_preference?: 'live_transfer' | 'scheduled_call' | 'declined' | null;
  scheduled_call_time?: string | null;
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
  refinance_type: 'refinance type',
  physical_address: 'physical address',
  down_payment: 'down payment amount',
  rent_own: 'housing status',
  realtor_status: 'real estate agent connection status',
  target_price: 'target purchase price',
  property_type: 'property type',
  military_rural: 'military service history (VA loan eligibility check)',
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
  affordability_purchase_price: 'target purchase price (affordability panel)',
  affordability_down_payment: 'down payment (affordability panel)',
  affordability_aus_status: 'AUS eligibility review result',
  contact_email: 'email address for secure login',
  contact_mobile: 'mobile phone number for OTP verification',
  otp_verification: 'one-time verification code',
  escalation_preference: 'preference for live transfer or scheduled callback',
  scheduled_call_time: 'preferred date and time for the callback',
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

  const isRefinanceGoal = profile.mortgage_goal === 'refinance';

  const stage2Block = isRefinanceGoal ? [
    '=== BORROWER PROFILE (Stage 2 — Pre-Qualification Discovery) ===',
    `Gross annual income:   ${fmt(profile.gross_annual_income)} (Confirmed: ${!!profile.gross_annual_income_confirmed})`,
    `Monthly debt:          ${fmt(profile.monthly_debt)} (Confirmed: ${!!profile.monthly_debt_confirmed})`,
    `Credit score:          ${profile.credit_range ?? 'not yet collected'} (Confirmed: ${!!profile.credit_range_confirmed})`,
    `Refinance type:        ${profile.refinance_type ?? 'not yet collected'} (Confirmed: ${!!profile.refinance_type_confirmed})`,
    `Est property value:    ${fmt(profile.target_price)} (Confirmed: ${!!profile.target_price_confirmed})`,
    `Property type:         ${profile.property_type ?? 'not yet collected'} (Confirmed: ${!!profile.property_type_confirmed})`,
    `Military/Rural status: ${profile.military_rural ?? 'not yet collected'} (Confirmed: ${!!profile.military_rural_confirmed})`,
    `Job tenure/type:       ${profile.job_tenure_type ?? 'not yet collected'} (Confirmed: ${!!profile.job_tenure_type_confirmed})`,
    '=== END STAGE 2 ===',
  ].join('\n') : [
    '=== BORROWER PROFILE (Stage 2 — Pre-Qualification Discovery) ===',
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
    `Contact Email:               ${profile.contact_email ?? 'not yet collected'}`,
    `Contact Mobile:              ${profile.contact_mobile ?? 'not yet collected'}`,
    `OTP Verified:                ${!!profile.otp_verified}`,
    `Legal Name:                  ${profile.legal_name ?? 'not yet collected'} (Confirmed: ${!!profile.legal_name_confirmed})`,
    `Physical Address:            ${profile.physical_address ?? 'not yet collected'} (Confirmed: ${!!profile.physical_address_confirmed})`,
    `Soft pull consent:           ${profile.soft_pull_consent ?? 'not yet asked'}`,
    profile.soft_pull_consent === 'accepted' ? [
      `PRE-FILLED DATA RETRIEVED VIA SOFT PULL (CRS API):`,
      `  - Full Name & Address to confirm: ${profile.legal_name || profile.borrower_name || 'Valued Borrower'}, ${profile.physical_address || (profile.zip_code ? ('address on file in zip code ' + profile.zip_code) : 'address on file')}`,
      `  - Employer to confirm: ${profile.employer || 'information on file'}`,
      `  - Accounts Summary to confirm: ${(profile as any).crs_open_accounts !== undefined ? `${(profile as any).crs_open_accounts} open account(s), ${(profile as any).crs_late_payments === 0 ? 'no late payments' : (profile as any).crs_late_payments + ' late payment(s)'} in the last 24 months` : '2 open active credit cards, 1 auto loan, no negative accounts'}`,
      `  - Credit Range Category to confirm: ${profile.credit_range ? (creditRangeCategory + ' range (' + profile.credit_range + ')') : (creditRangeCategory + ' range (' + creditRangeLimits + ')')}`,
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

  // ── Stage 5 escalation block ──────────────────────────────────────────────
  const stage5Block = [
    '=== BORROWER PROFILE (Stage 5 — Escalation & Handoff) ===',
    `Escalation Pref:     ${profile.escalation_preference ?? 'not yet collected'}`,
    `Scheduled Time:      ${profile.scheduled_call_time ?? 'not yet collected'}`,
    '=== END STAGE 5 ===',
  ].join('\n');

  // ── Current task line ─────────────────────────────────────────────────────
  const isRef = profile.mortgage_goal === 'refinance';
  let taskLine = '';

  // Only generate the generic CURRENT TASK line when there is no specific override block.
  // If stage2_closing_offer, OTP, or consent instructions take over, skip the generic task.
  const hasSpecificOverride =
    pendingField === 'stage2_closing_offer' ||
    pendingField === 'contact_email' ||
    pendingField === 'contact_mobile' ||
    pendingField === 'otp_verification' ||
    profile.soft_pull_consent === 'pending';

  if (!hasSpecificOverride) {
    if (profile.pending_confirm_field && profile.pending_confirm_value) {
      let label = FIELD_LABELS[profile.pending_confirm_field] ?? profile.pending_confirm_field;
      if (isRef && profile.pending_confirm_field === 'target_price') {
        label = 'estimated property value';
      }
      taskLine = `CURRENT TASK:\nConfirm the value of "${profile.pending_confirm_value}" for ${label}. Do NOT ask for the next field yet.`;
    } else if (pendingField === 'property_type') {
      taskLine = `CURRENT TASK:\nCollect property_type and zip_code\n\nAsk EXACTLY this: "What type of home are you looking for — such as a single-family home, condo, townhome, or multi-family — and what city or zip code are you looking in?"\nDO NOT ASK FOR ANY OTHER FIELD.`;
    } else if (pendingField === 'military_rural') {
      const hasCoBorrower = profile.co_borrower === 'yes';
      const coBorrowerPhrase = hasCoBorrower ? 'you or a co-borrower' : 'you';
      taskLine = `CURRENT TASK:\nCollect military_rural\n\nAsk EXACTLY this: "Now, do ${coBorrowerPhrase} have any military service history — such as being on active duty, a veteran, or in the Reserve or National Guard?"\nDO NOT ASK FOR ANY OTHER FIELD.`;
    } else if (pendingField === 'escalation_preference') {
      taskLine = `CURRENT TASK:\nDetermine if the borrower wants a live transfer to a loan officer right now or to schedule a callback for later. If they want to schedule a callback, ask for their preferred day and time. If they want a live transfer, direct them to click the 'Loan Officer' button.`;
    } else if (pendingField === 'scheduled_call_time') {
      taskLine = `CURRENT TASK:\nCollect the borrower's preferred date and time for the scheduled callback. Once they provide it, confirm it warmly.`;
    } else if (pendingField) {
      taskLine = `CURRENT TASK:\nCollect ${pendingField}\n\nDO NOT ASK FOR ANY OTHER FIELD.`;
    } else {
      taskLine = 'CURRENT TASK:\nAll fields for this stage collected.';
    }
  }

  // ── Stage transition bridge instruction ───────────────────────────────────
  let bridgeBlock = '';
  if (profile.bridge_to_say === 'stage1_to_stage2') {
    bridgeBlock = `\n\n*** MANDATORY TRANSITION — DO NOT SKIP ***\nYour response for this turn MUST follow this exact structure:\n1. One brief sentence acknowledging what the borrower just said (e.g. "Got it." or "Understood, thank you.").\n2. Then say the following transition phrase VERBATIM, word-for-word:\n"That gives me a great starting point. Now I would like to spend a few minutes exploring your financial picture — income, current debts, credit profile, and a few other details — so I can map out the loan programs that may be most relevant to your situation."\n3. Then immediately ask for ${pendingField}.\nDo NOT skip this transition regardless of what the borrower just said. Do NOT replace the verbatim phrase with your own words.`;
  } else if (profile.bridge_to_say === 'stage2_to_stage3') {
    bridgeBlock = `\n\n*** MANDATORY TRANSITION — DO NOT SKIP ***\nYour response for this turn MUST follow this exact structure:\n1. One brief sentence acknowledging what the borrower just said.\n2. Then say the following transition phrase VERBATIM, word-for-word:\n"Based on what you have shared, I can walk you through the loan programs that may be most relevant to your situation and answer any questions you have about the process."\nDo NOT skip this transition regardless of what the borrower just said. Do NOT replace the verbatim phrase with your own words.`;
  } else if (profile.bridge_to_say === 'stage3A_to_stage3B') {
    bridgeBlock = `\n\n*** MANDATORY TRANSITION — DO NOT SKIP ***\nYour response for this turn MUST follow this exact structure:\n1. One brief sentence acknowledging what the borrower just confirmed (e.g. "Great, your soft pull details are confirmed!").\n2. Then say the following transition phrase VERBATIM, word-for-word:\n"To finalize the remaining application questions for our underwriting check, I just have a few quick questions."\n3. Then immediately ask for their marital status: "First, what is your current marital status?"\nDo NOT skip this transition regardless of what the borrower just said. Do NOT replace the verbatim phrase with your own words.`;
  }

  // ── Stage 2 Closing Offer Instruction ──────────────────────────────────────
  let stage2ClosingBlock = '';
  if (pendingField === 'stage2_closing_offer') {
    stage2ClosingBlock = `
================================================================================
CRITICAL OVERRIDE: STAGE 2 CLOSING OFFER (v8.7 TWO-PATH CHOICE)
================================================================================
STOP. Do NOT generate any loan program information, estimated payments, or rate discussions.
Do NOT say "based on your profile" or explain FHA/conventional/VA options.
Do NOT ask for contact information or anything else.
The two-path offer text has already been delivered to the borrower via the system.
Your ONLY job right now is to LISTEN for which path the borrower chooses:
  PATH A = soft credit review (they say "yes", "review", "eligibility review", etc.)
  PATH B = explore without review (they say "no review", "explore first", etc.)
If they ask what the review involves, explain briefly and ONLY that.
If you absolutely must speak, say ONLY:
"Which would you prefer — the soft credit review, or building the summary from what you shared?"
NEVER quote payment amounts. NEVER mention loan programs. NEVER say "FHA" or "conventional".
================================================================================`;
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

  // ── OTP Gate Instruction Blocks (v8.7) ────────────────────────────────────
  let otpBlock = '';
  if (pendingField === 'contact_email') {
    otpBlock = `\n\n*** CRITICAL TURN INSTRUCTION: COLLECT EMAIL AND MOBILE ***
You MUST ask for the borrower's email and mobile number together in ONE question.
Say EXACTLY: "I'll just need the email and mobile number you'd like to use — I'll send a one-time code to confirm it's you. What are those for you?"
Do NOT ask for anything else. Do NOT mention the soft pull until after OTP is verified.`;
  } else if (pendingField === 'contact_mobile') {
    otpBlock = `\n\n*** CRITICAL TURN INSTRUCTION: COLLECT MOBILE ***
The email was captured. Now ask for their mobile number.
Say EXACTLY: "And what mobile number should I send your verification code to?"
Do NOT ask for anything else.`;
  } else if (pendingField === 'otp_verification') {
    otpBlock = `\n\n*** CRITICAL TURN INSTRUCTION: VERIFY CODE VIA MODAL ***
A one-time verification code has been sent to the borrower's email and mobile. You must instruct them to use the secure popup modal.
Say EXACTLY: "I've sent a one-time code to confirm your email and mobile number — please go ahead and enter it securely on your screen when it arrives, and you're all set."
Do NOT ask them to read the code out loud. Do NOT ask for anything else. Wait for the borrower to enter the code in the modal.`;
  }


  // ── Stage 2.5 affordability panel block ───────────────────────────────────
  const stage25Block = [
    '=== BORROWER PROFILE (Stage 2.5 — Affordability Panel) ===',
    `Panel Rendered:            ${!!profile.affordability_panel_rendered}`,
    `Purchase Price (Slider):   ${profile.affordability_purchase_price ? `$${profile.affordability_purchase_price.toLocaleString()}` : 'not set'}`,
    `Down Payment (Slider):     ${profile.affordability_down_payment ? `$${profile.affordability_down_payment.toLocaleString()}` : 'not set'}`,
    `Income Band Status:        ${profile.affordability_income_band ?? 'not computed'}`,
    `DTI Band Status:           ${profile.affordability_dti_band ?? 'not computed'}`,
    `Submitted for Review:      ${!!profile.affordability_submitted}`,
    `AUS Review Result:         ${profile.affordability_aus_status ?? 'not yet submitted'}`,
    `Pre-Qual Letter Emailed:   ${!!profile.affordability_prequel_letter_sent}`,
    '=== END STAGE 2.5 ===',
  ].join('\n');

  const blocks: string[] = [];
  blocks.push(stage1Block);
  if (stage === '2' || stage === '2.5' || stage === '3' || stage === '3A' || stage === '3B' || stage === '4' || stage === '5') {
    blocks.push(stage2Block);
  }
  if (stage === '2.5' || stage === '3' || stage === '3A' || stage === '3B' || stage === '4' || stage === '5') {
    blocks.push(stage25Block);
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
  if (stage === '5') {
    blocks.push(stage5Block);
  }
  blocks.push(taskLine + bridgeBlock + stage2ClosingBlock + consentBlock + otpBlock + lowConfidenceBlock);

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
