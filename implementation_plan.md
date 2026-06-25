# Implementation Plan: Google Cloud Vertex AI Llama Model Configuration

This plan outlines the changes needed to migrate the Ailana backend voice pipeline and LLM extraction system from Groq to GCP Vertex AI's OpenAI-compatible MAAS Llama endpoint.

## User Review Required

> [!IMPORTANT]
> **Service Account Placement**
> The service account file (`service-account.json`) must be accessible to the running processes. Since `GOOGLE_APPLICATION_CREDENTIALS` is configured as `./service-account.json`, you should place it in:
> 1. The **`backend/`** directory (so the backend agent worker can find it).
> 2. The **root directory** of the project (if the frontend Next.js server ever needs to access Google Cloud services, such as Google Sheets).
> Alternatively, you can change the path in both `.env` and `.env.local` to an absolute path if you'd prefer to keep it in a single location:
> `GOOGLE_APPLICATION_CREDENTIALS=C:/Users/Sherry/Documents/Convergent_AI/backend/service-account.json`

## Open Questions
- None. The configuration is straightforward using Google Application Default Credentials (ADC) and standard Google auth libraries.

## Proposed Changes

### Backend Dependencies

Propose installing `google-auth-library` in `backend` dependencies.
`cd backend && npm install google-auth-library`

---

### Backend Components

#### [NEW] [gcp-auth.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/utils/gcp-auth.ts)
We will introduce a utility module to retrieve fresh GCP OAuth2 access tokens and instantiate custom authenticated `OpenAI` client instances that automatically refresh tokens on each request.
- Create helper function `getGCPAccessToken()`.
- Create helper function `createGCPClient()` returning an `OpenAI` instance with custom `fetch` handler.

#### [MODIFY] [ailana-config.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/config/ailana-config.ts)
Expose the `VERTEX_BASE_URL` and `VERTEX_MODEL` environment variables.
- Add `vertexBaseUrl: process.env.VERTEX_BASE_URL`
- Add `vertexModel: process.env.VERTEX_MODEL`

#### [MODIFY] [llm-extractor.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/context/llm-extractor.ts)
Update extraction calls to use the new GCP OpenAI client and the `vertexModel`.
- Replace `groqClient` with `gcpClient`.
- Update the model name from `'llama-3.3-70b-versatile'` to `ailanaConfig.vertexModel`.

#### [MODIFY] [agent.ts](file:///c:/Users/Sherry/Documents/Convergent_AI/backend/src/agent.ts)
Update the summarizer LLM, VAD voice agent LLM, and text-only reply handler to use the GCP Vertex AI client.
- Update `summarizationLlm` to use GCP OpenAI client option.
- Update `createVadAgent` LLM to use GCP OpenAI client option.
- Update `generateTextOnlyReply` to fetch access token dynamically and POST to `VERTEX_BASE_URL` with `vertexModel`.

---

## Verification Plan

### Automated/Manual Verification
1. Run backend build to ensure TypeScript compiles successfully:
   `cd backend && npm run build`
2. Run backend dev server:
   `cd backend && npm run dev`
3. Test a voice session / text interaction to confirm the avatar responds correctly using the Vertex AI hosted Llama model.








Prompt:

I have deployed a vertex AI hosted model on my own GCP , i am using the llama model , here are google creds that i have already added in the backend and frontend .env and .env.local, here are the creds:

GCP_PROJECT_ID=ailana-488814
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
VERTEX_BASE_URL=https://us-central1-aiplatform.googleapis.com/v1/projects/ailana-488814/locations/us-central1/endpoints/openapi
VERTEX_MODEL=meta/llama-3.3-70b-instruct-maas


Also chat completion URL is : https://us-central1-aiplatform.googleapis.com/v1/projects/ailana-488814/locations/us-central1/endpoints/openapi/chat/completions



Please use these so llama model can work, also i have the service-account.json tell me where to put in the project , also are there any changes required other than env usage and chat completion link?