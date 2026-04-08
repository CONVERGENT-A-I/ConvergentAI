# Backend Tech Stack & Development Plan

Initiating a real-time, interactive AI backend requires low-latency orchestration between your frontend, the video streaming service (LiveKit), and your Avatar generation engine (LemonSlice). Given that you have already started with **Next.js**, building upon it is the most efficient path forward.

## Recommended Tech Stack

### 1. Core Framework (API & Orchestration)
- **Next.js App Router (API Routes):** As requested, we will use your current Next.js repository. Using `src/app/api/...` backend route handlers is highly recommended to share TypeScript interfaces between your frontend and backend seamlessly.

### 2. Real-Time Streaming & Avatars
- **LiveKit Server SDK (`livekit-server-sdk`):** Your Next.js backend acts as the secure gatekeeper. It will generate WebRTC tokens dynamically when a user clicks the "Chat" button, allowing them to connect to your LiveKit room safely.
- **Interactive Avatar Engine (LemonSlice):** LemonSlice will generate the lifelike interactive avatar from a single photo. Your backend will act as the orchestrator to store API keys securely, spin up new avatar sessions on demand via the LemonSlice API, and feed the generated output to LiveKit.
- **LLM Brain (OpenAI / Claude / Custom):** To handle the actual "thinking", intent recognition, and conversational intelligence that generates the script for the LemonSlice avatar.

### 3. Database & Authentication
- **Database:** PostgreSQL (Hosted on Vercel, Supabase, or AWS RDS). 
- **ORM:** Prisma or Drizzle ORM to cleanly manage database schemas for conversation logs, meeting schedules, and user transcripts.
- **Authentication:** Auth.js (NextAuth) or Clerk for securely authenticating the user before granting them a LiveKit token to prevent API abuse.

### 4. Optional Integrations
- **Cal.com / Neeto API:** Since your CTA explicitly includes "Schedule Meeting", connecting this to a seamless API scheduling interface should be abstracted through the backend.

---

## Development Phases

### Phase 1: Core Setup & Security
- Setup PostgreSQL Database & Prisma.
- Implement Authentication to restrict access to the AI Avatar to legitimate users/leads.
- Securely define environment variables for LemonSlice, LiveKit, and the LLM API.

### Phase 2: LiveKit & LemonSlice Orchestration
- **Endpoint:** Create a `POST /api/initialize-avatar` endpoint.
- **Logic:** 
  1. The client requests an avatar session.
  2. Backend requests LemonSlice to spin up an interactive avatar instance.
  3. Backend generates a secure LiveKit connection token (`AccessToken`).
  4. Backend returns the `room_name`, LiveKit Token, and Avatar `session_id` to the front end window.
  
### Phase 3: Frontend Connection
- Update the `FloatingCTA` placeholder so the LiveKit React components (`<LiveKitRoom />`, `<VideoTrack />`) consume the token and render the stream exactly where the static avatar image currently is.

### Phase 4: Meeting Tool & Workflow Integration
- Hook up "Schedule Meeting" to your existing routing integration or backend scheduling service.
- Implement conversational history tracking saving to the PostgreSQL database for insights into what leads are asking the interactive avatars.

---

> [!CAUTION]
> **Latency Warning:** When nesting LemonSlice and LLMs, latency is your biggest obstacle. Ensure your serverless functions or hosting instances are geographically close to your LiveKit servers to prevent high time-to-first-byte (TTFB) delays.

---

# Tasks Checklist

This task list breaks down the implementation plan into actionable steps to build the LemonSlice + LiveKit backend inside your existing Next.js repository.

## Phase 1: Initial Backend Configuration
- [x] Install backend dependencies (`livekit-server-sdk`, `lucide-react`, and any specific LemonSlice SDKs if applicable).
- [x] Create `.env.local` to securely store `LEMONSLICE_API_KEY`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
- [x] Set up Prisma or Drizzle ORM (if setting up PostgreSQL now) to track usage.

## Phase 2: LiveKit & LemonSlice Route Hooks
- [ ] Create a new API route directory `src/app/api/initialize-avatar/route.ts`.
- [ ] Write the logic to make a `POST` request to the LemonSlice API to spin up an avatar instance.
- [ ] Inside the same route, use the `AccessToken` class from `livekit-server-sdk` to generate a secure room token.
- [ ] Return a JSON payload containing the resulting LemonSlice `session_id` and the `livekit_token`.

## Phase 3: Frontend Connection
- [ ] Import `@livekit/components-react` components into your application.
- [ ] Update `FloatingCTA`'s "Live Chat" button to dispatch a `fetch` request to `/api/initialize-avatar`.
- [ ] Show a loading spinner over the placeholder image while waiting for the token.
- [ ] Once the token is returned, conditionally render the `<LiveKitRoom />` component, passing your generated token to establish the stream.

## Phase 4: Expansion & Intelligence 
- [ ] Implement conversational history logging to your Database.
- [ ] Abstract "Voice Call" and "SMS Text" hooks to interact with appropriate APIs (like Twilio).
- [ ] Hook up the "Meeting" button to ping your Cal.com/Neeto scheduling endpoint.
