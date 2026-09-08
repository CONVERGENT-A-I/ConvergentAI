import { applicationService } from '../services/application-service.js';

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
  timestamp?: string; // ISO 8601
  applicationId?: string;
  borrowerName?: string;
  transactionType?: string;
  affordabilityMode?: 'stated' | 'verified' | null;
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
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString()
  };
  
  // Console log for debugging
  console.log('[AUDIT-AFFORDABILITY]:', JSON.stringify(eventWithTimestamp, null, 2));

  // Persist to database via application service
  if (!event.applicationId || !event.sessionId) {
    console.warn('[AUDIT-AFFORDABILITY] ⚠️ Missing applicationId or sessionId, skipping database persist');
    return;
  }

  try {
    // Map AffordabilityAuditEvent to applicationService.logAffordabilityAudit parameters
    // Build the audit data object, only including defined values (exactOptionalPropertyTypes compliance)
    const auditData: Parameters<typeof applicationService.logAffordabilityAudit>[0] = {
      applicationId: event.applicationId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      metadata: {
        borrowerName: event.borrowerName,
        findingType: event.findingType,
        timeToResultMs: event.timeToResultMs,
        letterId: event.letterId,
        mloName: event.mloName,
        mloNmls: event.mloNmls,
        deliveryMethod: event.deliveryMethod,
        lastPanelState: event.lastPanelState,
        dropOffStage: event.dropOffStage,
        band: event.band,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
        timestamp: eventWithTimestamp.timestamp,
      }
    };

    // Only add optional numeric/string fields if they have actual values (not undefined)
    if (event.purchasePriceAtSubmission !== undefined) auditData.purchasePrice = event.purchasePriceAtSubmission;
    else if (event.initialPurchasePrice !== undefined) auditData.purchasePrice = event.initialPurchasePrice;
    
    if (event.downPaymentAtSubmission !== undefined) auditData.downPayment = event.downPaymentAtSubmission;
    else if (event.initialDownPayment !== undefined) auditData.downPayment = event.initialDownPayment;
    
    if (event.loanAmountAtSubmission !== undefined) auditData.loanAmount = event.loanAmountAtSubmission;
    if (event.ltvAtSubmission !== undefined) auditData.ltv = event.ltvAtSubmission;
    
    if (event.resultingIncomeBand !== undefined) auditData.incomeBand = event.resultingIncomeBand;
    else if (event.initialIncomeBand !== undefined) auditData.incomeBand = event.initialIncomeBand;
    
    if (event.resultingDtiBand !== undefined) auditData.dtiBand = event.resultingDtiBand;
    else if (event.initialDtiBand !== undefined) auditData.dtiBand = event.initialDtiBand;
    
    if (event.resultingEstimatedPayment !== undefined) auditData.estimatedPayment = event.resultingEstimatedPayment;
    if (event.estimatedDtiAtSubmission !== undefined) auditData.dtiAboveHardCeiling = event.estimatedDtiAtSubmission > 50;
    if (event.sliderType !== undefined) auditData.sliderType = event.sliderType;
    if (event.previousValue !== undefined) auditData.previousValue = event.previousValue;
    if (event.newValue !== undefined) auditData.newValue = event.newValue;
    if (event.affordabilityMode !== undefined && event.affordabilityMode !== null) auditData.affordabilityMode = event.affordabilityMode;
    if (event.transactionType !== undefined) auditData.transactionType = event.transactionType;

    await applicationService.logAffordabilityAudit(auditData);

    console.log('[AUDIT-AFFORDABILITY] ✅ Event persisted to database successfully');
  } catch (error) {
    console.error('[AUDIT-AFFORDABILITY] ❌ Failed to persist to database:', error);
    // Don't throw - audit logging failures should not break the main flow
  }
}
