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

  const fieldsDesc = fields.map(f => {
    return `- "${f.name}": (Expected Type: ${f.expectedType}) ${f.description}.${f.additionalInstructions ? ` Instructions: ${f.additionalInstructions}` : ''}`;
  }).join('\n');

  const systemPrompt = `You are a precise data extraction agent for a mortgage prequalification assistant.
Your task is to extract values for multiple fields from the user's latest input.
We also provide the assistant's last question/utterance to help resolve context or relative references.

Here are the fields to extract:
${fieldsDesc}

Rules:
1. Return a JSON object where each key is a field name from the list above.
2. The value for each key must be a JSON object with:
   - "value": The extracted value matching the expected type, or null if it cannot be found or extracted.
   - "declined": A boolean indicating if the user explicitly declined, skipped, said they don't know, are not sure, or don't want to answer this specific field.
3. For numbers: return only an integer (e.g. 8500, not "8500" or "$8,500"). If the user mentions multiple numbers that need to be summed (especially for monthly debts), calculate the total and return the sum. If the user specifies a range, calculate the midpoint of the range and return it as the single integer.
4. For strings: return a clean string or null.
5. If a field's value is not present at all in the user's input, set "value" to null and "declined" to false.

You MUST reply with a JSON object only.`;

  const userPrompt = `Assistant last question: ${lastAssistantUtterance ?? 'None'}
User input: "${userInput}"`;

  let content: string | null = null;

  // [perf] extractMultipleFields runs inside onUserTurn which is raced against
  // a 400ms timeout. Log start so we can confirm it is on a separate async tick.
  const _fieldNames = fields.map(f => f.name).join(', ');
  const _perfExtractMulti_start = performance.now();
  console.log(`[perf] llm-extractor extractMultipleFields([${_fieldNames}]): START`);

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
          // Multi-field extraction: response is {"field1": {"value": ..., "declined": false}, ...}
          // Up to 6 fields × ~35 tokens per field + JSON overhead = 250 tokens.
          max_tokens: 250,
        });
        const _perfCerebrasCallMs = (performance.now() - _perfCerebrasCallStart).toFixed(1);
        console.log(`[perf] llm-extractor extractMultipleFields([${_fieldNames}]): Cerebras call (attempt ${attempt + 1}) took ${_perfCerebrasCallMs}ms`);
        content = response.choices[0]?.message?.content || null;
        console.log(`[llm-extractor] Extracted multi-field raw JSON:`, content);
        cerebrasErr = null;
        break;
      } catch (error: any) {
        cerebrasErr = error;
        const statusCode = error?.status ?? error?.statusCode;
        if (attempt === 0 && (statusCode === 500 || statusCode === 502 || statusCode === 503)) {
          // Brief pause only for transient server errors
          console.log(`[perf] llm-extractor extractMultipleFields([${_fieldNames}]): retry backoff 200ms (status=${statusCode})`);
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
    console.error(`[llm-extractor] Cerebras failed for multi-field extraction [${fields.map(f => f.name).join(', ')}] (status: ${statusCode}):`, error?.message ?? error);
    if (statusCode === 400) {
      console.error(`[llm-extractor] HTTP 400 full error response for multi-field extraction:`, JSON.stringify(error?.error ?? error?.body ?? { message: error?.message, code: error?.code, status: statusCode }, null, 2));
    }
    // content stays null; caller receives empty results
  }

  const _perfExtractMulti_ms = (performance.now() - _perfExtractMulti_start).toFixed(1);
  console.log(`[perf] llm-extractor extractMultipleFields([${_fieldNames}]): TOTAL ${_perfExtractMulti_ms}ms (content=${content ? 'ok' : 'null'})`);

  const results: Record<string, ExtractionResult> = {};
  for (const f of fields) {
    results[f.name] = { value: null, declined: false };
  }

  if (!content) {
    return results;
  }

  try {
    const parsed = JSON.parse(content);
    for (const f of fields) {
      if (parsed[f.name]) {
        let value = parsed[f.name].value;
        const declined = !!parsed[f.name].declined;

        if (f.expectedType === 'number' && value !== null) {
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
        results[f.name] = { value, declined };
      }
    }
  } catch (parseError) {
    console.error(`[llm-extractor] Failed to parse content for multiple fields:`, parseError);
  }

  return results;
}


export async function classifyConfirmation(
  userInput: string,
  lastAssistantUtterance: string | null,
  fieldName: string,
  pendingValue: string,
): Promise<'yes' | 'no' | 'ambiguous'> {
  const systemPrompt = `You are analyzing a user response to a confirmation question.
The assistant asked if the value "${pendingValue}" is correct for their "${fieldName}".
Determine if the user confirms this value, rejects/corrects it, or if it is ambiguous.

Return a JSON object with:
- "decision": "yes" (if they confirm, say yes, correct, okay, yep, that's right, etc.), "no" (if they say no, incorrect, or start correcting/providing a different number/info), or "ambiguous" (if they ask a question or say something unrelated).`;

  const userPrompt = `Assistant confirmation question: ${lastAssistantUtterance ?? 'None'}
User response: "${userInput}"`;

  let content: string | null = null;

  const _perfClassify_start = performance.now();
  console.log(`[perf] llm-extractor classifyConfirmation("${fieldName}"): START`);

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

