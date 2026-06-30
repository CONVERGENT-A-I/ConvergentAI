# Implementation Plan: Latency and Fallback Flaws Fix

This plan details the technical steps to resolve the identified speed stutters, extraction failures, and model response latency bottlenecks in the backend.

---

## 🛠️ Proposed Changes

### 1. Programmatic PowerShell Path Injection (Fixes CPU Stutters)
Add a runtime system path injection helper at backend startup to register the standard PowerShell path on Windows. This eliminates `pidusage` process-spawning crashes (`ENOENT`) that block the Node.js event loop and cause WebRTC audio stutters.

#### [MODIFY] [index.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/index.ts)
*   At the very top of the file, inject:
    ```typescript
    if (process.platform === 'win32') {
      const psPath = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0';
      if (process.env.PATH && !process.env.PATH.includes(psPath)) {
        process.env.PATH = `${psPath};${process.env.PATH}`;
      }
    }
    ```

#### [MODIFY] [agent.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/agent.ts)
*   Inject the same programmatic path registration at the top of the file before any modules are initialized.

---

### 2. Data Extractor Groq Fallback (Fixes Extraction Reliability)
Integrate transparent Groq fallback into the LLM extractor so that any Cerebras rate limits or connection disruptions do not freeze the mortgage form collection states.

#### [MODIFY] [llm-extractor.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/llm-extractor.ts)
*   Import `getDynamicGroqApiKey` from `../config/ailana-config.js`.
*   Initialize `groqClient`:
    ```typescript
    const groqClient = new OpenAI({
      apiKey: getDynamicGroqApiKey() || ailanaConfig.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    ```
*   Update `extractProfileField` catch block:
    *   If Cerebras fails, print a warn log, clone the body, change `model` to `'llama-3.3-70b-versatile'`, strip `reasoning_effort` and `reasoning_format`, set `groqClient` API key dynamically, and execute the fallback request.
*   Update `classifyConfirmation` catch block:
    *   Implement the identical fallback execution path to Groq if the primary Cerebras request fails.

---

### 3. Reasoning Parameters Optimization (Fixes Validation Overhead)
Clean up model parameters passed to standard LLMs to prevent warning response overhead.

#### [MODIFY] [llm-extractor.ts](file:///c:/Users/SOHAIL/Downloads/ConvergentAI/backend/src/context/llm-extractor.ts)
*   Remove the legacy `reasoning_effort` and `reasoning_format` fields from the primary Cerebras payload, as `gpt-oss-120b` does not support reasoning dimensions, reducing parsing overhead.

---

## 📈 Verification Plan

### Automated Verification
*   Build typescript files to confirm compilation:
    `npm run build` in the `backend/` directory.

### Manual Verification
*   Launch the backend server:
    `npm run dev` in `backend/`
*   Verify that the console **no longer prints** the warning:
    `[agent]: Suppressed pidusage powershell spawn crash.`
*   Verify that conversation speech-to-text, data extraction, and replies proceed smoothly without latency stutters.
*   To test extraction fallback: temporarily set `CEREBRAS_API_KEY` to an empty string in `.env`, run the chat, and verify that name, income, and debt extractions still succeed perfectly via Groq!
