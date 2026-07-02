import { OpenAI } from 'openai';
import { ailanaConfig, getDynamicGroqApiKey } from '../config/ailana-config.js';

const openaiClient = new OpenAI({
  apiKey: ailanaConfig.cerebrasApiKey,
  baseURL: ailanaConfig.cerebrasBaseUrl,
});

const groqClient = new OpenAI({
  apiKey: getDynamicGroqApiKey() || ailanaConfig.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1',
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
2. For numbers: return only an integer (e.g. 8500, not "8500" or "$8,500"). If the user mentions multiple numbers that need to be summed (especially for monthly debts), calculate the total and return the sum.
3. For strings: return a clean string or null.
4. If the user is correcting a previous value, extract the new corrected value.
5. If the value is not present at all in the user's input, set "value" to null and "declined" to false.

${additionalInstructions}

You MUST reply with a JSON object only.`;

  const userPrompt = `Assistant last question: ${lastAssistantUtterance ?? 'None'}
User input: "${userInput}"`;

  let content: string | null = null;

  try {
    openaiClient.apiKey = ailanaConfig.cerebrasApiKey;
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
    });
    content = response.choices[0]?.message?.content || null;
  } catch (error: any) {
    console.warn(`[llm-extractor] Cerebras failed for ${fieldName}, falling back to Groq:`, error?.message ?? error);
    try {
      groqClient.apiKey = getDynamicGroqApiKey() || ailanaConfig.groqApiKey;
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0,
      });
      content = response.choices[0]?.message?.content || null;
    } catch (groqError: any) {
      console.error(`[llm-extractor] Groq fallback failed for ${fieldName}:`, groqError?.message ?? groqError);
    }
  }

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
3. For numbers: return only an integer (e.g. 8500, not "8500" or "$8,500"). If the user mentions multiple numbers that need to be summed (especially for monthly debts), calculate the total and return the sum.
4. For strings: return a clean string or null.
5. If a field's value is not present at all in the user's input, set "value" to null and "declined" to false.

You MUST reply with a JSON object only.`;

  const userPrompt = `Assistant last question: ${lastAssistantUtterance ?? 'None'}
User input: "${userInput}"`;

  let content: string | null = null;

  try {
    openaiClient.apiKey = ailanaConfig.cerebrasApiKey;
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
    });
    content = response.choices[0]?.message?.content || null;
  } catch (error: any) {
    console.warn(`[llm-extractor] Cerebras failed for multiple fields, falling back to Groq:`, error?.message ?? error);
    try {
      groqClient.apiKey = getDynamicGroqApiKey() || ailanaConfig.groqApiKey;
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0,
      });
      content = response.choices[0]?.message?.content || null;
    } catch (groqError: any) {
      console.error(`[llm-extractor] Groq fallback failed for multiple fields:`, groqError?.message ?? groqError);
    }
  }

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

  try {
    openaiClient.apiKey = ailanaConfig.cerebrasApiKey;
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.0,
    });
    content = response.choices[0]?.message?.content || null;
  } catch (error: any) {
    console.warn(`[llm-extractor] Cerebras classify failed for ${fieldName}, falling back to Groq:`, error?.message ?? error);
    try {
      groqClient.apiKey = getDynamicGroqApiKey() || ailanaConfig.groqApiKey;
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0,
      });
      content = response.choices[0]?.message?.content || null;
    } catch (groqError: any) {
      console.error(`[llm-extractor] Groq classify fallback failed for ${fieldName}:`, groqError?.message ?? groqError);
    }
  }

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

