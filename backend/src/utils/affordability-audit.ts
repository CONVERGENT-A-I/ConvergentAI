export type AffordabilityEventType =
  | 'panel_rendered'
  | 'slider_changed'
  | 'band_status_change'
  | 'submit_clicked'
  | 'aus_result_received'
  | 'prequal_letter_issued'
  | 'drop_off'
  | 'scenario_summary_email_sent';

export interface AffordabilityAuditEvent {
  eventType: AffordabilityEventType;
  sessionId: string;
  timestamp: string; // ISO 8601
  borrowerName?: string;
  transactionType?: string;
  initialPurchasePrice?: number;
  initialDownPayment?: number;
  initialDtiBand?: string;
  initialIncomeBand?: string;
  sliderType?: 'purchase_price' | 'down_payment';
  previousValue?: number;
  newValue?: number;
  resultingDtiBand?: string;
  resultingIncomeBand?: string;
  resultingEstimatedPayment?: number;
  band?: 'income' | 'dti';
  previousStatus?: string;
  newStatus?: string;
  purchasePriceAtSubmission?: number;
  downPaymentAtSubmission?: number;
  loanAmountAtSubmission?: number;
  ltvAtSubmission?: number;
  estimatedDtiAtSubmission?: number;
  findingType?: 'Approve/Eligible' | 'Refer';
  timeToResultMs?: number;
  letterId?: string;
  mloName?: string;
  mloNmls?: string;
  deliveryMethod?: string;
  lastPanelState?: string;
  dropOffStage?: string;
}

export async function logAffordabilityEvent(event: AffordabilityAuditEvent): Promise<void> {
  // Immutable audit logging for Regulation B / ECOA compliance
  console.log('[AUDIT-AFFORDABILITY]:', JSON.stringify(event, null, 2));
}
