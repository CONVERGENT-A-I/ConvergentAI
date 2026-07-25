export interface PrequalLetterInput {
  borrowerName: string;
  maxQualifiedAmount: number;
  issuanceDate?: Date;
  mloName?: string;
  mloNmls?: string;
  institutionName?: string;
}

export function generatePrequalLetter(input: PrequalLetterInput): string {
  const issuance = input.issuanceDate ?? new Date();
  const expiration = new Date(issuance.getTime() + 90 * 24 * 60 * 60 * 1000);
  const mloName = input.mloName ?? 'Sarah Jenkins';
  const mloNmls = input.mloNmls ?? 'NMLS #1849204';
  const instName = input.institutionName ?? 'Convergent Lending Institution';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
    .header { border-bottom: 2px solid #00b4d8; padding-bottom: 15px; margin-bottom: 25px; }
    .title { font-size: 24px; font-weight: bold; color: #0f172a; text-transform: uppercase; }
    .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .amount { font-size: 28px; font-weight: bold; color: #166534; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Pre-Qualification Letter</div>
    <div>${instName}</div>
    <div>Date: ${issuance.toLocaleDateString('en-US')}</div>
  </div>

  <p>Dear ${input.borrowerName},</p>

  <p>Based on the information provided and an initial automated eligibility review, <strong>${input.borrowerName}</strong> appears conditionally eligible for a mortgage up to:</p>

  <div class="amount-box">
    <div>MAXIMUM CONDITIONAL QUALIFIED AMOUNT</div>
    <div class="amount">$${input.maxQualifiedAmount.toLocaleString()}</div>
  </div>

  <p>This pre-qualification is issued by ${instName} and is valid for 90 days (Expires: <strong>${expiration.toLocaleDateString('en-US')}</strong>).</p>

  <p>Please note that this letter is based on unverified statements and soft credit data. Final loan approval remains subject to full document verification, underwriting review, property appraisal, and satisfactory title search.</p>

  <div style="margin-top: 30px;">
    <strong>Assigned Licensed Loan Officer:</strong><br />
    ${mloName}<br />
    ${mloNmls}
  </div>

  <div class="footer">
    This is a conditional pre-qualification letter, not a loan commitment, pre-approval, or guarantee of credit.
  </div>
</body>
</html>
  `.trim();
}
