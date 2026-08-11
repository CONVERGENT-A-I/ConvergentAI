import { OpenAI } from 'openai';
import { ailanaConfig } from '../config/ailana-config.js';

// ── Extractor client ─────────────────────────────────────────────────
// Uses the cerebrasExtractorApiKey, which reads CEREBRAS_EXTRACTOR_API_KEY
// from the environment (falls back to CEREBRAS_API_KEY if not set).
// Setting a separate API key routes extractor requests through a different
// Cerebras account — completely separate request pool, zero queue contention
// with the main LLM. With a single account key, both share the same pool.
const fastClient = new OpenAI({
  apiKey: ailanaConfig.cerebrasExtractorApiKey,
  baseURL: ailanaConfig.cerebrasBaseUrl,
});

// gpt-oss-120b with reasoning_effort: 'low': extremely fast (~3000 tps) with minimal reasoning overhead.
// Uses cerebrasExtractorApiKey — set CEREBRAS_EXTRACTOR_API_KEY to a second
// Cerebras account key to route extractor requests to a separate request pool,
// eliminating any queue contention with the main LLM.
const EXTRACTION_MODEL = 'gpt-oss-120b';



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
    // Retry once for transient Cerebras errors
    let cerebrasErr: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const _perfCerebrasCallStart = performance.now();
        const response = await fastClient.chat.completions.create({
          model: EXTRACTION_MODEL,
          reasoning_effort: (ailanaConfig.cerebrasReasoningEffort as any) ?? 'low',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.0,
          // Single-field extraction: response is always {"value": "...", "declined": false}
          // 100 tokens covers any field value (incl. long strings like addresses) + JSON overhead.
          max_tokens: 100,
        });
        const _perfCerebrasCallMs = (performance.now() - _perfCerebrasCallStart).toFixed(1);
        console.log(`[perf] llm-extractor extractProfileField("${fieldName}"): Cerebras call (attempt ${attempt + 1}) took ${_perfCerebrasCallMs}ms`);
        content = response.choices[0]?.message?.content || null;
        console.log(`[llm-extractor] Extracted "${fieldName}" raw JSON:`, content);
        cerebrasErr = null;
        break;
      } catch (error: any) {
        cerebrasErr = error;
        const statusCode = error?.status ?? error?.statusCode;
        if (attempt === 0 && (statusCode === 500 || statusCode === 502 || statusCode === 503)) {
          // Brief pause only for transient server errors
          console.log(`[perf] llm-extractor extractProfileField("${fieldName}"): retry backoff 200ms (status=${statusCode})`);
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }
        break;
      }
    }
    if (cerebrasErr) {
      throw cerebrasErr;
    }
  } catch (error: any) {
    const statusCode = error?.status ?? error?.statusCode;
    console.error(`[llm-extractor] Cerebras failed for "${fieldName}" (status: ${statusCode}):`, error?.message ?? error);
    if (statusCode === 400) {
      console.error(`[llm-extractor] HTTP 400 full error response for "${fieldName}":`, JSON.stringify(error?.error ?? error?.body ?? { message: error?.message, code: error?.code, status: statusCode }, null, 2));
    }
    // content stays null; caller receives { value: null, declined: false }
  }

  const _perfExtractSingle_ms = (performance.now() - _perfExtractSingle_start).toFixed(1);
  console.log(`[perf] llm-extractor extractProfileField("${fieldName}"): TOTAL ${_perfExtractSingle_ms}ms (content=${content ? 'ok' : 'null'})`);

  if (!content) {
    return { value: null, declined: false };
  }

  try {
    const parsed = JSON.parse(content);
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
 * 2. Cerebras fallback (~500ms): handles edge cases — questions, indirect phrasing,
 *    or anything the regex doesn't recognize.
 *
 * Returns 'yes', 'no', or 'needs_explanation' (user is asking for more info before deciding).
 */
export async function classifyAuthorization(
  userInput: string,
  lastAssistantUtterance: string | null,
): Promise<'yes' | 'no' | 'needs_explanation'> {
  const lowerText = userInput.toLowerCase().trim();

  // ── Tier 0: Leftover Audio Guard ──────────────────────────────────────────
  // Guard against legacy audio from the OTP modal entry bleeding into this step.
  // Common phrases spoken while typing/entering the code: "done", "submitted", "okay", "entered", "all set", "finished"
  if (/\b(done|entered|submitted|typed|sent|got it|ok(ay)?|all set|finished|completed|that'?s it)\b/i.test(lowerText) && !/\b(yes|authorize|consent|agree|proceed|pull|review|go ahead)\b/i.test(lowerText)) {
    console.log(`[classifyAuthorization] Intercepted likely OTP leftover text ("${userInput}"). Ignoring.`);
    return 'needs_explanation';
  }

  // ── Tier 1: Regex fast-path ─────────────────────────────────────────────────
  const AUTHORIZE_PATTERNS = [
    /\byes\b/, /\bauthorize\b/, /\bconsent\b/, /\bagree\b/, /\bapprove\b/,
    /\bgo ahead\b/, /\bproceed\b/, /\bsure\b/, /\bfine\b/, /\bok(ay)?\b/,
    /\ballow\b/, /\bthat('s| is) fine\b/, /\bi('m| am) ok\b/, /\bdo it\b/,
    /\brun it\b/, /\blet('s| us) go\b/, /\bsounds good\b/, /\bno problem\b/,
  ];
  const DECLINE_PATTERNS = [
    /\bno\b/, /\bdecline\b/, /\brefuse\b/, /\bdon'?t\b/, /\bdo not\b/,
    /\bnot (now|yet|today)\b/, /\bskip\b/, /\bwithout\b/, /\bprefer not\b/,
  ];
  const isAuthorized = AUTHORIZE_PATTERNS.some(p => p.test(lowerText));
  const isDeclined = DECLINE_PATTERNS.some(p => p.test(lowerText));

  // If both match (e.g., "no, that's okay"), prioritize authorization unless
  // "no" appears at the very start (e.g., "no, thank you").
  if (isAuthorized && (!isDeclined || lowerText.search(/\bno\b/) > 5)) {
    console.log(`[classifyAuthorization] Regex fast-path → YES`);
    return 'yes';
  }
  if (isDeclined && !isAuthorized) {
    console.log(`[classifyAuthorization] Regex fast-path → NO`);
    return 'no';
  }

  // ── Tier 2: Cerebras fallback (handles questions, indirect phrasing) ─────────
  console.log(`[classifyAuthorization] Regex inconclusive (auth=${isAuthorized}, dec=${isDeclined}) → falling back to Cerebras`);

  const systemPrompt = `You are analyzing a user's response to a soft credit inquiry authorization request.
The mortgage assistant asked the user to authorize a soft credit inquiry (which does NOT affect credit score).

The user responded. Classify their response into one of three categories:
- "yes": They clearly authorize, consent, agree, or want to proceed.
- "no": They clearly decline, refuse, or don't want to proceed.  
- "needs_explanation": They are asking a question, requesting more information, or are uncertain.

Return a JSON object with a single key:
- "decision": one of "yes", "no", or "needs_explanation"

Examples:
- "yes I authorize" → "yes"
- "go ahead" → "yes"
- "sounds good" → "yes"
- "no thank you" → "no"
- "I'd rather not" → "no"
- "what does this involve?" → "needs_explanation"
- "will this affect my score?" → "needs_explanation"
- "I'm not sure, what does soft pull mean?" → "needs_explanation"

You MUST reply with a JSON object only.`;

  const userPrompt = `Assistant question: ${lastAssistantUtterance ?? 'Do you authorize the soft credit inquiry?'}
User response: "${userInput}"`;

  try {
    const response = await fastClient.chat.completions.create({
      model: EXTRACTION_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
      max_tokens: 30,
    });
    const content = response.choices[0]?.message?.content || null;
    console.log(`[classifyAuthorization] Cerebras fallback raw JSON:`, content);
    if (content) {
      const parsed = JSON.parse(content);
      const d = parsed.decision;
      if (d === 'yes' || d === 'no' || d === 'needs_explanation') {
        return d;
      }
    }
  } catch (err: any) {
    console.error(`[classifyAuthorization] Cerebras fallback failed:`, err?.message ?? err);
  }

  // If Cerebras also fails, default to needs_explanation so the LLM re-asks gracefully
  return 'needs_explanation';
}

export async function classifyConfirmation(
  userInput: string,
  lastAssistantUtterance: string | null,
  fieldName: string,
  pendingValue: string,
): Promise<'yes' | 'no' | 'ambiguous'> {
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
  const hasAffirmation = /\b(yes|yeah|yep|yup|correct|sure|okay|ok|perfect|exactly|spot on|expect|sounds right|sounds good)\b/i.test(cleanInput);
  const hasCorrection = /\b(but|actually|no|incorrect|wrong|change|instead|not)\b/i.test(cleanInput);

  const broadAffirmations = [
    "nothing is out of date",
    "everything is spot on",
    "that also looks correct",
    "that also looks right",
    "that matches",
    "matches what i expect",
    "spot on",
    "everything is correct",
    "matches"
  ];
  const isBroadAffirmation = broadAffirmations.some(a => cleanInput.includes(a));

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
    // Retry once for transient Cerebras errors
    let cerebrasErr: any = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const _perfCerebrasCallStart = performance.now();
        const response = await fastClient.chat.completions.create({
          model: EXTRACTION_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.0,
          // Confirmation: response is only {"decision": "yes|no|ambiguous"}
          // 50 tokens to accommodate any model preamble + the JSON object.
          max_tokens: 50,
        });
        const _perfCerebrasCallMs = (performance.now() - _perfCerebrasCallStart).toFixed(1);
        console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): Cerebras call (attempt ${attempt + 1}) took ${_perfCerebrasCallMs}ms`);
        content = response.choices[0]?.message?.content || null;
        console.log(`[llm-extractor] Classified confirmation for "${fieldName}" raw JSON:`, content);
        cerebrasErr = null;
        break;
      } catch (error: any) {
        cerebrasErr = error;
        const statusCode = error?.status ?? error?.statusCode;
        if (attempt === 0 && (statusCode === 500 || statusCode === 502 || statusCode === 503)) {
          // Brief pause only for transient server errors
          console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): retry backoff 200ms (status=${statusCode})`);
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }
        break;
      }
    }
    if (cerebrasErr) {
      throw cerebrasErr;
    }
  } catch (error: any) {
    const statusCode = error?.status ?? error?.statusCode;
    console.error(`[llm-extractor] Cerebras classify failed for "${fieldName}" (status: ${statusCode}):`, error?.message ?? error);
    if (statusCode === 400) {
      console.error(`[llm-extractor] HTTP 400 full error response for classifyConfirmation "${fieldName}":`, JSON.stringify(error?.error ?? error?.body ?? { message: error?.message, code: error?.code, status: statusCode }, null, 2));
    }
    // content stays null; caller returns 'ambiguous'
  }

  const _perfClassify_ms = (performance.now() - _perfClassify_start).toFixed(1);
  console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): TOTAL ${_perfClassify_ms}ms (content=${content ? 'ok' : 'null'})`);

  if (content) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.decision === 'yes' || parsed.decision === 'no' || parsed.decision === 'ambiguous') {
        return parsed.decision;
      }
    } catch (parseError) {
      console.error('[llm-extractor] Failed to parse confirmation decision:', parseError);
    }
  }
  return 'ambiguous';
}

