import { inference, llm } from '@livekit/agents';
// import { OpenAI } from 'openai';
// import { ailanaConfig } from '../config/ailana-config.js';

// ── Cerebras Extractor Client (DISABLED / COMMENTED OUT) ─────────────────
// const fastClient = new OpenAI({
//   apiKey: ailanaConfig.cerebrasExtractorApiKey,
//   baseURL: ailanaConfig.cerebrasBaseUrl,
// });
// const EXTRACTION_MODEL = 'gpt-oss-120b';

// ── LiveKit Inference Extractor LLM ──────────────────────────────────────
const extractorLlm = new inference.LLM({
  model: 'google/gemma-4-31b-it',
});

export interface ExtractionResult {
  value: string | number | null;
  declined?: boolean;
}

export async function extractProfileField(
  userInput: string,
  lastAssistantUtterance: string | null,
  fieldName: string,
  fieldDescription: string,
  expectedType: 'string' | 'number',
  additionalInstructions: string = '',
): Promise<ExtractionResult> {
  const systemPrompt = `You are a precise data extraction agent for a mortgage prequalification assistant.
Your task is to extract the value for the field "${fieldName}" (described as: ${fieldDescription}) from the user's latest input.
We also provide the assistant's last question/utterance to help resolve context or relative references (like "yes, that's correct", "I don't have one", or "ASAP").

Rules:
1. Return a JSON object with two fields:
   - "value": The extracted value matching the expected type (${expectedType}), or null if it cannot be found or extracted.
   - "declined": A boolean indicating if the user explicitly declined, skipped, said they don't know, are not sure, or don't want to answer.
2. For numbers: return only an integer (e.g. 8500, not "8500" or "$8,500"). If the user mentions multiple numbers that need to be summed (especially for monthly debts), calculate the total and return the sum. If the user specifies a range (e.g., "70,000 to 100,000" or "70k - 100k"), calculate the midpoint of the range and return it as the single integer (e.g. 85000).
3. For strings: return a clean string or null.
4. If the user is correcting a previous value, extract the new corrected value.
5. If the value is not present at all in the user's input, set "value" to null and "declined" to false.

${additionalInstructions}

You MUST reply with a JSON object only.`;

  const userPrompt = `Assistant last question: ${lastAssistantUtterance ?? 'None'}
User input: "${userInput}"`;

  let content: string | null = null;

  // [perf] llm-extractor is called from onUserTurn which runs CONCURRENTLY with
  // the main pipeline via Promise.race(). Log thread context explicitly.
  const _perfExtractSingle_start = performance.now();
  console.log(`[perf] llm-extractor extractProfileField("${fieldName}"): START (running concurrent with main LLM if race not yet resolved)`);

  try {
    const _perfCallStart = performance.now();
    const chatCtx = new llm.ChatContext();
    chatCtx.addMessage({ role: 'system', content: systemPrompt });
    chatCtx.addMessage({ role: 'user', content: userPrompt });

    const stream = extractorLlm.chat({ chatCtx });
    const collected = await stream.collect();
    content = collected.text || null;

    const _perfCallMs = (performance.now() - _perfCallStart).toFixed(1);
    console.log(`[perf] llm-extractor extractProfileField("${fieldName}"): LiveKit Inference call took ${_perfCallMs}ms`);
    console.log(`[llm-extractor] Extracted "${fieldName}" raw JSON:`, content);
  } catch (error: any) {
    const statusCode = error?.status ?? error?.statusCode;
    console.error(`[llm-extractor] LiveKit Inference failed for "${fieldName}" (status: ${statusCode}):`, error?.message ?? error);
    // content stays null; caller receives { value: null, declined: false }
  }

  const _perfExtractSingle_ms = (performance.now() - _perfExtractSingle_start).toFixed(1);
  console.log(`[perf] llm-extractor extractProfileField("${fieldName}"): TOTAL ${_perfExtractSingle_ms}ms (content=${content ? 'ok' : 'null'})`);

  if (!content) {
    return { value: null, declined: false };
  }

  // ── JSON Repair & Extraction Fallback ──────────────────────────────────
  try {
    let repaired = content.trimEnd();
    // Strip markdown code fences if returned by model
    repaired = repaired.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    if (!repaired.endsWith('}')) {
      repaired += '\n}';
    }

    let parsed: any;
    try {
      parsed = JSON.parse(repaired);
    } catch (firstErr) {
      console.warn(`[llm-extractor] JSON repair fallback triggered for "${fieldName}". Raw content: "${content}"`);
      const valMatch = content.match(/"value"\s*:\s*("(.*?)"|(\d+)|true|false|null)/is);
      const decMatch = content.match(/"declined"\s*:\s*(true|false)/i);

      if (valMatch || decMatch) {
        let extractedVal: any = null;
        if (valMatch) {
          if (valMatch[2] !== undefined) extractedVal = valMatch[2];
          else if (valMatch[3] !== undefined) extractedVal = Number(valMatch[3]);
          else if (valMatch[1] === 'null') extractedVal = null;
        }
        const extractedDeclined = decMatch?.[1] ? decMatch[1].toLowerCase() === 'true' : false;
        parsed = { value: extractedVal, declined: extractedDeclined };
        console.warn(`[llm-extractor] Regex scraped parsed object for "${fieldName}":`, parsed);
      } else {
        throw firstErr;
      }
    }

    if (parsed === null) {
      return { value: null, declined: false };
    }
    let value = parsed.value;
    const declined = !!parsed.declined;

    if (expectedType === 'number' && value !== null) {
      if (typeof value === 'string') {
        const cleaned = value.replace(/[^\d.]/g, '');
        const parsedNum = parseFloat(cleaned);
        value = isNaN(parsedNum) ? null : Math.round(parsedNum);
      } else if (typeof value === 'number') {
        value = Math.round(value);
      } else {
        value = null;
      }
    }

    return { value, declined };
  } catch (parseError) {
    console.error(`[llm-extractor] Failed to parse content for ${fieldName}:`, parseError);
    return { value: null, declined: false };
  }
}

export interface FieldToExtract {
  name: string;
  description: string;
  expectedType: 'string' | 'number';
  additionalInstructions?: string;
}

export async function extractMultipleFields(
  userInput: string,
  lastAssistantUtterance: string | null,
  fields: FieldToExtract[],
): Promise<Record<string, ExtractionResult>> {
  if (fields.length === 0) {
    return {};
  }

  const _fieldNames = fields.map(f => f.name).join(', ');
  const _perfExtractMulti_start = performance.now();
  console.log(`[perf] llm-extractor extractMultipleFields([${_fieldNames}]): START (Concurrent Promises)`);

  const results: Record<string, ExtractionResult> = {};
  
  // Initialize with fallback nulls just in case a promise fails silently
  for (const f of fields) {
    results[f.name] = { value: null, declined: false };
  }

  try {
    // Map over fields and fire extractProfileField concurrently
    const promises = fields.map(async (f) => {
      try {
        const res = await extractProfileField(
          userInput,
          lastAssistantUtterance,
          f.name,
          f.description,
          f.expectedType,
          f.additionalInstructions
        );
        results[f.name] = res;
      } catch (err) {
        console.error(`[llm-extractor] Concurrent extraction failed for field "${f.name}":`, err);
        // On failure, it retains the initialized null/false value
      }
    });

    await Promise.all(promises);
  } catch (error: any) {
    console.error(`[llm-extractor] Fatal error during concurrent extraction [${_fieldNames}]:`, error);
  }

  const _perfExtractMulti_ms = (performance.now() - _perfExtractMulti_start).toFixed(1);
  console.log(`[perf] llm-extractor extractMultipleFields([${_fieldNames}]): TOTAL ${_perfExtractMulti_ms}ms (Concurrent)`);

  return results;
}

/**
 * Classifies a user response to a legal authorization/consent question.
 *
 * Uses a two-tier approach:
 * 1. Regex fast-path (0ms): catches unambiguous "yes"/"no" phrasing immediately.
 * 2. LiveKit Inference fallback: handles edge cases — questions, indirect phrasing,
 *    or anything the regex doesn't recognize.
 *
 * Returns 'yes', 'no', or 'needs_explanation' (user is asking for more info before deciding).
 */
export async function classifyAuthorization(
  userInput: string,
  lastAssistantUtterance: string | null,
  explanationAttempts: number = 0,
): Promise<'yes' | 'no' | 'needs_explanation'> {
  const lowerText = userInput.toLowerCase().trim();

  // ── Tier 0: Synthetic System Trigger Prompt Guard ─────────────────────────
  // Guard against synthetic system / trigger prompts being classified as user authorization
  if (
    lowerText.includes('the borrower has entered') ||
    lowerText.includes('otp code') ||
    lowerText.includes('modal') ||
    lowerText.includes('system_') ||
    lowerText.includes('please verify it and proceed')
  ) {
    console.log(`[classifyAuthorization] Intercepted synthetic trigger prompt ("${userInput}"). Ignoring.`);
    return 'needs_explanation';
  }

  // ── Tier 1: Regex fast-path ─────────────────────────────────────────────────
  const AUTHORIZE_PATTERNS = [
    /\byes\b/, /\bauthorize\b/, /\bconsent\b/, /\bagree\b/, /\bapprove\b/,
    /\bgo ahead\b/, /\bproceed\b/, /\bsure\b/, /\bfine\b/, /\bok(ay)?\b/,
    /\ballow\b/, /\bthat('s| is) fine\b/, /\bi('m| am) ok\b/, /\bdo it\b/,
    /\brun it\b/, /\blet('s| us) (go|proceed|do it|run it)\b/, /\bsounds good\b/, /\bno problem\b/,
    /\bdone\b/, /\ball set\b/, /\bfinished\b/, /\bcompleted\b/, /\bplease do\b/,
    /\bentered\b/, /\bsubmitted\b/, /\bi did\b/, /\byep\b/, /\byeah\b/, /\bready\b/,
    /\bcertainly\b/, /\babsolutely\b/, /\bdefinitely\b/,
  ];

  if (explanationAttempts >= 1) {
    AUTHORIZE_PATTERNS.push(
      /\blet('s| us)\b/,
      /\bgo\b/,
      /\bdo\b/,
      /\b(already|just) (asked|said|told|answered)\b/,
      /\b(same thing|like i said)\b/,
      /\b(sounds great|sure thing)\b/
    );
  }

  const DECLINE_PATTERNS = [
    /\bno\b/, /\bdecline\b/, /\brefuse\b/, /\bdon'?t\b/, /\bdo not\b/,
    /\bnot (now|yet|today)\b/, /\bskip\b/, /\bwithout\b/, /\bprefer not\b/,
  ];
  const isAuthorized = AUTHORIZE_PATTERNS.some(p => p.test(lowerText));
  const isDeclined = DECLINE_PATTERNS.some(p => p.test(lowerText));

  // If both match (e.g., "no, that's okay"), prioritize authorization unless
  // "no" appears at the very start (e.g., "no, thank you").
  if (isAuthorized && (!isDeclined || lowerText.search(/\bno\b/) > 5)) {
    console.log(`[classifyAuthorization] Regex fast-path → YES (explanationAttempts=${explanationAttempts})`);
    return 'yes';
  }
  if (isDeclined && !isAuthorized) {
    console.log(`[classifyAuthorization] Regex fast-path → NO`);
    return 'no';
  }

  // ── Tier 2: LiveKit Inference fallback (handles questions, indirect phrasing) ─────────
  console.log(`[classifyAuthorization] Regex inconclusive (auth=${isAuthorized}, dec=${isDeclined}, attempts=${explanationAttempts}) → falling back to LiveKit Inference`);

  const explanationGuidance = explanationAttempts >= 1
    ? `\nNOTE: The assistant has already explained the soft credit inquiry. If the user indicates acquiescence, mild agreement, readiness, or frustration that they were asked again, classify as "yes". Only classify as "needs_explanation" if they are asking an explicit new question.`
    : '';

  const systemPrompt = `You are analyzing a user's response to a soft credit inquiry authorization request.
The mortgage assistant asked the user to authorize a soft credit inquiry (which does NOT affect credit score).

The user responded. Classify their response into one of three categories:
- "yes": They clearly authorize, consent, agree, or want to proceed.
- "no": They clearly decline, refuse, or don't want to proceed.  
- "needs_explanation": They are asking a question, requesting more information, or are uncertain.
${explanationGuidance}

Return a JSON object with a single key:
- "decision": one of "yes", "no", or "needs_explanation"

Examples:
- "yes I authorize" → "yes"
- "go ahead" → "yes"
- "sounds good" → "yes"
- "let's proceed" → "yes"
- "no thank you" → "no"
- "I'd rather not" → "no"
- "what does this involve?" → "needs_explanation"
- "will this affect my score?" → "needs_explanation"
- "I'm not sure, what does soft pull mean?" → "needs_explanation"

You MUST reply with a JSON object only.`;

  const userPrompt = `Assistant question: ${lastAssistantUtterance ?? 'Do you authorize the soft credit inquiry?'}
User response: "${userInput}"`;

  try {
    const chatCtx = new llm.ChatContext();
    chatCtx.addMessage({ role: 'system', content: systemPrompt });
    chatCtx.addMessage({ role: 'user', content: userPrompt });

    const stream = extractorLlm.chat({ chatCtx });
    const collected = await stream.collect();
    const content = collected.text || null;

    console.log(`[classifyAuthorization] LiveKit Inference fallback raw JSON:`, content);
    if (content) {
      const cleanJson = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      const d = parsed.decision;
      if (d === 'yes' || d === 'no' || d === 'needs_explanation') {
        return d;
      }
    }
  } catch (err: any) {
    console.error(`[classifyAuthorization] LiveKit Inference fallback failed:`, err?.message ?? err);
  }

  // If fallback also fails, default to needs_explanation so the LLM re-asks gracefully
  return 'needs_explanation';
}

export async function classifyConfirmation(
  userInput: string,
  lastAssistantUtterance: string | null,
  fieldName: string,
  pendingValue: string,
): Promise<'yes' | 'no' | 'ambiguous' | 'no_content'> {
  const _perfClassify_start = performance.now();
  console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): START`);

  // Remove punctuation (commas, periods, exclamation points, question marks) to simplify regex
  const cleanInput = userInput.toLowerCase().trim().replace(/[,.!\?]/g, '');
  
  // ── Tier 0: Leftover Audio Guard ──────────────────────────────────────────
  // Guard against legacy audio from the soft_pull_authorization step bleeding into prefill_name_address.
  if (fieldName === 'prefill_name_address' && /\b(authorize|consent|proceed|run it)\b/i.test(cleanInput)) {
    console.log(`[classifyConfirmation] Leftover authorization audio detected ("${cleanInput}") for ${fieldName} → ignoring (ambiguous)`);
    return 'ambiguous';
  }

  
  // FAST PATH: Inclusion-based affirmation check + correction guard
  // 1. Strip leading conversational speech fillers (uh, um, well, oh, so, etc.)
  const withoutFillers = cleanInput.replace(/^(uh+|um+|well|oh|so|yeah|right|hmm+)\s*,?\s*/i, '').trim();
  // 2. Strip conversational starter "no" if immediately followed by an affirmation phrase
  //    (e.g. "no, it seems right", "no, that's fine", "no, it's correct", "no that is exactly what I want")
  const sanitizedInput = withoutFillers
    .replace(/^no\s+(it|that)('?s|\s+is|\s+seems|\s+looks|\s+sounds)?\s*(right|fine|good|correct|accurate|spot on|matches)\b/i, '$1 $2 $3')
    .replace(/^no\s+that\s+is\s+(exactly|precisely|just)\s+(what|how)\s+i\s*(want|need|expect|said|meant)\b/i, 'that is $1 $2 i $3')
    .replace(/^no\s+that\s+is\s+(correct|accurate|right|fine|good|perfect|great|exactly right)\b/i, 'that is $1');

  const hasAffirmation = /\b(yes|yeah|yep|yup|correct|sure|okay|ok|perfect|exactly|spot on|expect|want|need|sounds right|sounds good|seems right|looks right|looks fine|looks good|seems fine|fine|thats fine|that's fine)\b/i.test(sanitizedInput);
  const hasCorrection = /\b(but|actually|no|incorrect|wrong|change|instead|not)\b/i.test(sanitizedInput);

  const broadAffirmations = [
    "nothing is out of date",
    "everything is spot on",
    "that also looks correct",
    "that also looks right",
    "that also matches",
    "that matches",
    "matches what i expect",
    "spot on",
    "everything is correct",
    "matches",
    "that is exactly what i want",
    "that is exactly what i expect",
    "that is exactly what i need",
    "that is what i want",
    "that is what i expect",
    "exactly what i want",
    "exactly what i expect",
    "exactly right",
    "that is correct",
    "that is right",
    "that is fine",
    "that is perfect",
    "that is great",
  ];
  const isBroadAffirmation = broadAffirmations.some(a => sanitizedInput.includes(a));

  if ((hasAffirmation && !hasCorrection) || isBroadAffirmation) {
    console.log(`[llm-extractor] Fast-path matched 'yes' for confirmation of "${fieldName}" (hasAffirmation=${hasAffirmation}, hasCorrection=${hasCorrection}, isBroad=${isBroadAffirmation})`);
    console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): TOTAL ${(performance.now() - _perfClassify_start).toFixed(1)}ms (content=fast-path)`);
    return 'yes';
  }

  const systemPrompt = `You are analyzing a user response to a confirmation question.
The assistant asked if the value "${pendingValue}" is correct for their "${fieldName}".
Determine if the user confirms this value, rejects/corrects it, or if it is ambiguous.

Return a JSON object with:
- "decision": "yes" (if they confirm, say yes, correct, okay, yep, that's right, etc.), "no" (if they say no, incorrect, or start correcting/providing a different number/info), or "ambiguous" (if they ask a question or say something unrelated).`;

  const userPrompt = `Assistant confirmation question: ${lastAssistantUtterance ?? 'None'}
User response: "${userInput}"`;

  let content: string | null = null;

  try {
    const _perfCallStart = performance.now();
    const chatCtx = new llm.ChatContext();
    chatCtx.addMessage({ role: 'system', content: systemPrompt });
    chatCtx.addMessage({ role: 'user', content: userPrompt });

    const stream = extractorLlm.chat({ chatCtx });
    const collected = await stream.collect();
    content = collected.text || null;

    const _perfCallMs = (performance.now() - _perfCallStart).toFixed(1);
    console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): LiveKit Inference call took ${_perfCallMs}ms`);
    console.log(`[llm-extractor] Classified confirmation for "${fieldName}" raw JSON:`, content);
  } catch (error: any) {
    const statusCode = error?.status ?? error?.statusCode;
    console.error(`[llm-extractor] LiveKit Inference classify failed for "${fieldName}" (status: ${statusCode}):`, error?.message ?? error);
    // content stays null; caller receives 'no_content'
  }

  const _perfClassify_ms = (performance.now() - _perfClassify_start).toFixed(1);
  console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): TOTAL ${_perfClassify_ms}ms (content=${content ? 'ok' : 'null'})`);

  if (!content) {
    console.warn(`[llm-extractor] classifyConfirmation("${fieldName}"): LiveKit Inference returned null content -> 'no_content'`);
    return 'no_content';
  }

  // ── JSON Repair & Extraction Fallback ──────────────────────────────────
  try {
    let repaired = content.trimEnd();
    repaired = repaired.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    if (!repaired.endsWith('}')) {
      repaired += '\n}';
    }

    let parsed: any;
    try {
      parsed = JSON.parse(repaired);
    } catch (firstErr) {
      // Attempt 2: regex scrape decision value directly from raw output
      const match = content.match(/"decision"\s*:\s*"(yes|no|ambiguous)"/i);
      if (match && match[1]) {
        const scraped = match[1].toLowerCase() as 'yes' | 'no' | 'ambiguous';
        console.warn(`[llm-extractor] JSON repair fallback: scraped decision="${scraped}" from malformed content.`);
        return scraped;
      }
      throw firstErr;
    }

    if (parsed.decision === 'yes' || parsed.decision === 'no' || parsed.decision === 'ambiguous') {
      return parsed.decision;
    }
  } catch (parseError) {
    console.error('[llm-extractor] Failed to parse confirmation decision:', parseError);
  }

  return 'no_content';
}

/**
 * Classifies whether the user is requesting an immediate live transfer to a Loan Officer.
 * Uses LLM to handle any phrasing — direct requests, affirmatives after an offer, etc.
 *
 * Returns:
 *   'yes'        — user wants to be transferred now
 *   'no'         — user declined / wants to stay / wants to schedule instead
 *   'uncertain'  — unclear, let the LLM handle it naturally
 */
export async function classifyLoanOfficerTransferIntent(
  userInput: string,
  lastAssistantUtterance: string | null,
): Promise<'yes' | 'no' | 'uncertain'> {
  const systemPrompt = `You are a classification agent for a mortgage AI assistant named Ailana.
Your job is to determine whether the user's latest message is requesting an IMMEDIATE live transfer to a human Loan Officer.

Rules:
- Answer "yes" if the user clearly wants to be connected/transferred to a loan officer right now, or is affirming an offer Ailana just made to connect them to one.
- Answer "no" if the user is declining the transfer, wants to stay with Ailana, wants to schedule a callback for later instead, or is asking an unrelated question.
- Answer "uncertain" if you genuinely cannot tell from the message alone.

Only return a JSON object with a single key "intent" set to "yes", "no", or "uncertain".

Examples:
- "yes please connect me" → "yes"
- "connect me to a loan officer" → "yes"
- "I'd like to speak with someone" → "yes"
- "yes, go ahead" (after Ailana offers the loan officer) → "yes"
- "sure, connect me" → "yes"
- "let's do that" (in response to Ailana's offer) → "yes"
- "no, I'll think about it" → "no"
- "maybe later" → "no"
- "can you schedule a call for tomorrow?" → "no"
- "what is a loan officer?" → "uncertain"

You MUST reply with a JSON object only. Example: {"intent": "yes"}`;

  const userPrompt = `Ailana's last message: ${lastAssistantUtterance ?? '(not available)'}
User's response: "${userInput}"`;

  try {
    const chatCtx = new llm.ChatContext();
    chatCtx.addMessage({ role: 'system', content: systemPrompt });
    chatCtx.addMessage({ role: 'user', content: userPrompt });

    const stream = extractorLlm.chat({ chatCtx });
    const collected = await stream.collect();
    const content = collected.text || null;

    console.log(`[classifyLoanOfficerTransferIntent] LLM raw response:`, content);

    if (content) {
      const cleanJson = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      const intent = parsed.intent;
      if (intent === 'yes' || intent === 'no' || intent === 'uncertain') {
        return intent;
      }
    }
  } catch (err: any) {
    console.error(`[classifyLoanOfficerTransferIntent] LLM call failed:`, err?.message ?? err);
  }

  return 'uncertain';
}
