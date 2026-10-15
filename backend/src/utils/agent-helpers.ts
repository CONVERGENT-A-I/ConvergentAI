import { applyContactUpdates } from './profile-sync.js';
import type { extractMultipleFields } from '../context/llm-extractor.js';

export function formatPhoneForSpeech(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw || '';
}

export function isQuestionOrCorrection(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();
  if (t.includes('?')) return true;

  // Check if text starts with modal or question words
  if (/^(what|why|how|where|who|which|can|could|would|should|is|does|will|do i)\b/.test(t)) {
    return true;
  }

  // Specific question, explanation, or correction intent phrases
  const keywords = [
    'explain', 'detail', 'meaning', 'difference',
    'change my', 'update my', 'actually my', 'wrong', 'mistake', 'instead',
    'confused', 'don\'t understand', 'not sure', 'unsure', 'tell me about',
    'already told you', 'gave it to you', 'gave you', 'just said', 'just shared',
    'already shared', 'shared that', 'shared it', 'just gave', 'already gave',
    'already told', 'just told', 'already said', 'i shared', 'i gave',
    'worried', 'concerned', 'wondering', 'curious', 'elaborate', 'clarify',
    'clarification', 'more info', 'more information', 'tell me more', 'sounds expensive',
    'sounds high', 'what about', 'how come', 'is that', 'question', 'ask'
  ];
  return keywords.some(k => t.includes(k));
}

export async function applyUIFieldCorrection(
  parsed: { field?: string; value?: any },
  profile: any,
  _extractor?: typeof extractMultipleFields,
): Promise<void> {
  const { field, value } = parsed;
  console.log(`[agent]: contact_ui_field_correction received from UI: field=${field}, value=${value}`);

  if (field === 'fullName' || field === 'name') {
    const rawVal = String(value || '').trim();
    if (!rawVal) return;
    applyContactUpdates(profile, { fullName: rawVal });
  } else if (field === 'firstName') {
    applyContactUpdates(profile, { firstName: String(value || '').trim() });
  } else if (field === 'lastName') {
    applyContactUpdates(profile, { lastName: String(value || '').trim() });
  } else if (field === 'email') {
    applyContactUpdates(profile, { contact_email: String(value || '') });
  } else if (field === 'mobile') {
    applyContactUpdates(profile, { contact_mobile: String(value || '') });
  }
}
