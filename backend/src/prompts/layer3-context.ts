export interface BorrowerProfile {
  borrower_name?: string | null;
  mortgage_goal?: string | null;
  timeline?: string | null;
  property_state?: string | null;
  // Placeholder for future financial fields in Stage 2/3
  gross_monthly_income?: number | null;
  monthly_debt?: number | null;
  credit_range?: string | null;
  down_payment?: number | null;
  property_value?: number | null;
}

export function buildLayer3TurnContext(profile: BorrowerProfile, outstandingFields: string[]): string {
  const profileBlock = [
    '=== BORROWER PROFILE ===',
    `Name:                  ${profile.borrower_name ?? 'not yet collected'}`,
    `Goal:                  ${profile.mortgage_goal ?? 'not yet collected'}`,
    `Timeline:              ${profile.timeline ?? 'not yet collected'}`,
    `Property state:        ${profile.property_state ?? 'not yet collected'}`,
    '=== END PROFILE ==='
  ].join('\n');

  const outstandingLine = outstandingFields.length > 0
    ? `STILL NEEDED THIS STAGE: ${outstandingFields.join(', ')}`
    : 'STILL NEEDED THIS STAGE: all collected';

  return `${profileBlock}\n\n${outstandingLine}`;
}
