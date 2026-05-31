# ConvergentAI Website — Comprehensive Code Review

> Full audit of the frontend (Next.js), API routes, backend (Express), and configuration files.

---

## 🚨 CRITICAL Issues

### 1. **Private Key Hardcoded in Source Code** — [route.ts](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/api/whitepaper-lead/route.ts#L45-L46)

> [!CAUTION]
> The Google Service Account **private key** is hardcoded as a fallback directly in the source code (line 46). This is a **severe security vulnerability**. If this code is in a public or shared repo, the private key is compromised.

```typescript
// Line 45-46: HARDCODED CREDENTIALS
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || "convergentaiserviceaccount@convergentai-496607.iam.gserviceaccount.com";
const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...";
```

**Fix**: Remove all hardcoded credentials. Only use `process.env`. If the env var is missing, return an error.

---

### 2. **TypeScript Build Errors Suppressed** — [next.config.ts](file:///c:/Users/Sameer/Desktop/ConvergentAI/next.config.ts#L26-L28)

> [!WARNING]
> `ignoreBuildErrors: true` means **all TypeScript errors are silently ignored** during production builds. This hides real type-safety problems and can cause runtime crashes in production.

```typescript
typescript: {
  ignoreBuildErrors: true, // ← Dangerous in production
},
```

**Fix**: Remove this and fix the underlying TS errors instead.

---

### 3. **`console.error` Globally Overridden** — [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx#L47-L61)

> [!WARNING]
> The global `console.error` function is monkey-patched at the module level. This will suppress **all** matching error messages across the **entire application**, not just LiveKit warnings. This makes debugging extremely difficult.

```typescript
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && (args[0].includes("Tried to add a track...") || ...)) {
      return; // Ignore
    }
    originalError.apply(console, args);
  };
}
```

**Fix**: Use a more targeted approach (e.g., LiveKit's built-in log level configuration or scope the suppression inside the component lifecycle only).

---

## ⚠️ Significant Bugs & Issues

### 4. **Navbar "Schedule a Meeting" in Mobile Menu Links to `/` Instead of NeetoCal** — [navbar.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/navbar.tsx#L140-L146)

The mobile menu "Schedule a Meeting" button links to the homepage `/` instead of the NeetoCal scheduling URL.

```tsx
// Mobile menu — links to "/"
<Link href="/" className="...">
  Schedule a Meeting
</Link>

// Desktop version correctly links to NeetoCal
<Link href="https://convergentai.neetocal.com/meeting-with-david-patten" ...>
```

**Fix**: Change `href="/"` to `href="https://convergentai.neetocal.com/meeting-with-david-patten"` and add `target="_blank"`.

---

### 5. **LinkedIn Link Points to Generic `linkedin.com`** — [footer.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/../../src/components/footer.tsx#L68-L69)

```tsx
<Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn" ...>
```

**Fix**: Update to the actual ConvergentAI company LinkedIn profile URL.

---

### 6. **Prisma Schema Has No Models** — [schema.prisma](file:///c:/Users/Sameer/Desktop/ConvergentAI/prisma/schema.prisma)

The schema only defines the generator and datasource but has **zero models**. The `@prisma/client` dependency is installed but not actually used anywhere in the app.

**Fix**: Either add the required models or remove the Prisma dependency to reduce bundle bloat.

---

### 7. **Duplicate Token Generation Logic (Frontend + Backend)** — [get-token/route.ts](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/api/get-token/route.ts) vs [backend/src/index.ts](file:///c:/Users/Sameer/Desktop/ConvergentAI/backend/src/index.ts#L30-L120)

The LiveKit token generation + Keyframe Labs session logic is **duplicated** in both:
- Next.js API route: `src/app/api/get-token/route.ts`
- Express backend: `backend/src/index.ts`

The frontend `floating-cta.tsx` calls the **Express backend** endpoint (via `NEXT_PUBLIC_BACKEND_URL`), making the Next.js API route dead code. But the test route (`/api/test`) is only on the Express backend, while some API routes (chat, whitepaper) are only on Next.js.

**Fix**: Consolidate to a single token-generation endpoint. Remove the unused duplicate.

---

### 8. **Chat API Route is Dead Code** — [chat/route.ts](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/api/chat/route.ts)

This API route uses OpenAI's ChatCompletions API directly, but no component in the codebase calls `/api/chat`. The floating CTA uses LiveKit's DataChannel for all chat communication with the backend agent. This endpoint appears to be orphaned.

---

### 9. **`useSearchParams()` Without Suspense Boundary** — [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx#L1195)

`useSearchParams()` in Next.js 16 requires a `<Suspense>` boundary wrapping the component. While there is a `<Suspense>` in layout.tsx around `<FloatingCTA>`, this is already wrapped. ✅ However, the `useSearchParams` hook is inside the `FloatingCTA` default export at line 1195, which is correctly wrapped. This is fine.

---

### 10. **HTML Entity `&amp;` Rendered as Literal Text** — [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx#L2058)

```tsx
<span className="hidden lg:inline">
  Secure &amp; Private  // ← Shows literal "&amp;" in React JSX
</span>
```

In JSX, `&amp;` renders as the literal text `&amp;`, not `&`. Should be `Secure & Private` or `Secure &amp; Private` only if in raw HTML.

**Fix**: Change to `Secure & Private` (plain `&` in JSX).

---

### 11. **`Script` Component Inside `<head>` Tag** — [layout.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/layout.tsx#L38-L44)

> [!WARNING]
> Next.js `<Script>` components should NOT be placed inside `<head>`. The `next/script` component manages its own insertion point based on the `strategy` prop. Placing it inside `<head>` can cause hydration mismatches and duplicate script injection.

```tsx
<head>
  {/* Termly Cookie Consent */}
  <Script
    src="https://app.termly.io/resource-blocker/..."
    strategy="afterInteractive"
  />
</head>
```

**Fix**: Move the `<Script>` tag outside of `<head>`, directly into the `<body>`.

---

## 🔧 Code Quality Issues

### 12. **`floating-cta.tsx` is 2,693 Lines / 122KB** — [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx)

This is an extremely large single component file. It contains ~15 sub-components and complex state management all in one file. This makes it:
- Very difficult to maintain, debug, and review
- Prone to unnecessary re-renders
- Hard to test in isolation

**Recommendation**: Break it into separate files under a `floating-cta/` directory:
- `FloatingCTA.tsx` (main orchestrator)
- `RoomControls.tsx`
- `InRoomChatPanel.tsx`
- `LoanOfficerQueueUI.tsx` / `LoanOfficerLiveUI.tsx`
- `MediaGuard.tsx`, `ActivityTracker.tsx`, `MloDetector.tsx`, etc.
- `types.ts` (for `FlowPhase`, `PendingMode`)

---

### 13. **Unused Imports in Multiple Components**

- [video-stage.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/video-stage.tsx#L6-L8): `GridLayout` and `VideoTrack` are imported but never used.
- [video-stage.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/video-stage.tsx#L20): `useLkParticipants` alias imported but never used.
- [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx#L17): `Circle` imported from lucide-react but never used.

---

### 14. **Empty `catch` Blocks Throughout** — [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx#L108-L113)

Multiple places with silent `catch (e) {}` that swallow errors completely:

```typescript
try { await lp.setMicrophoneEnabled(false); } catch (e) {}
try { await lp.setCameraEnabled(false); } catch (e) {}
```

**Fix**: At minimum, log a warning so debugging is possible.

---

### 15. **`whitepaper-leads.json` in Project Root** — [whitepaper-leads.json](file:///c:/Users/Sameer/Desktop/ConvergentAI/whitepaper-leads.json)

A file containing lead data (names, emails) appears to be in the project root and could be committed to version control. This is a data privacy concern.

---

### 16. **No Form Validation on Schedule Demo** — [schedule-demo.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/schedule-demo.tsx#L17-L31)

The `handleSubmit` function doesn't validate email format or check for empty required fields. It opens NeetoCal directly with whatever the user typed.

---

### 17. **Compliance Agreement Hardcodes `setPendingMode("video")`** — [floating-cta.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/floating-cta.tsx#L2266)

When the user clicks "Get Started" after agreeing to compliance terms, `pendingMode` is always forced to `"video"` regardless of what mode they originally selected. If a user clicked "voice" or "avatar-chat" first, their choice is overridden.

```tsx
onClick={() => {
  setIsSubmitting(true);
  setPendingMode("video"); // ← Always forces video
  setHasAgreed(true);
  setFlowPhase("live");
}}
```

**Fix**: Don't override `pendingMode` here — just use whatever was already set.

---

### 18. **`Navbar` Rendered After `<main>` on Home Page** — [page.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/page.tsx#L24)

```tsx
<main>
  <Hero />
  ...
</main>
<Navbar />  // ← Rendered AFTER main content
```

While this works because Navbar is `position: absolute`, it's semantically unusual and may cause accessibility issues (screen readers will announce the main content before the navigation). All other pages render `<Navbar />` before `<main>`.

**Fix**: Move `<Navbar />` above `<main>` for consistency with the other pages.

---

## 📐 Architecture & Design Issues

### 19. **No Error Handling for LiveKit Connection Timeouts**

The `fetchToken` function sets a `connectionTimeoutRef` but never actually creates a timeout. The ref is checked and cleared but never armed, so there's no timeout protection for slow/failed connections.

---

### 20. **Two Separate Backend Servers Running**

The project has:
1. Next.js (`npm run dev` on port 3000) — handles pages, some API routes (whitepaper, chat)
2. Express backend (`backend/npm run dev` on port 3001) — handles LiveKit tokens, agent worker

This creates operational complexity. The Next.js API routes already handle token generation (duplicated), and the Express server's sole unique purpose is spawning the agent worker. Consider consolidating.

---

### 21. **`BackendConnectionTest` Component Runs in Production** — [layout.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/app/layout.tsx#L47)

This debug component fires a fetch to the backend on every page load in all environments. It should be gated behind `process.env.NODE_ENV === 'development'`.

---

### 22. **`<img>` Tags Instead of `next/image`** — [live-agent-dashboard.tsx](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/live-agent-dashboard.tsx#L119-L133)

Uses raw `<img>` tags for Unsplash images instead of Next.js `<Image>`, missing out on automatic optimization, lazy loading, and responsive sizing.

---

### 23. **Missing `rel="noopener noreferrer"` on Some External Links**

The footer LinkedIn link at [footer.tsx:70](file:///c:/Users/Sameer/Desktop/ConvergentAI/src/components/footer.tsx#L70) uses `target="_blank"` but only has `rel` implicitly via Next.js `Link`. While Next.js handles this internally, the DSAR link on line 111 uses `rel="noreferrer"` but drops `noopener` — should be `rel="noopener noreferrer"` for consistency and security.

---

### 24. **No Meta Tags on Sub-Pages**

Only the root layout has metadata. The `/about`, `/features`, `/ai`, `/security`, `/privacy`, etc. pages don't export their own `metadata` objects, so they all show the generic "ConvergentAI" title. Each page should have its own unique `<title>` and `<meta description>` for SEO.

---

## ✅ What's Done Well

| Area | Notes |
|------|-------|
| **Design System** | Consistent use of brand colors (Digital Teal, Action Blue), custom scrollbar, fluid typography |
| **Security Page** | Very comprehensive, professional-looking trust/compliance center |
| **Framer Motion Animations** | Smooth, consistent scroll-triggered animations across all sections |
| **Error Boundary** | Proper class-based error boundary wrapping the floating CTA |
| **LiveKit Integration** | Comprehensive multi-mode (video/voice/chat/loan-officer) real-time system |
| **Whitepaper Gate** | Clean lead-capture modal with proper validation and Google Sheets integration |
| **Security Headers** | Good set of security headers in `next.config.ts` |
| **Inactivity Detection** | Well-implemented idle timeout with countdown and reconnection logic |
| **Responsive Design** | Good mobile/tablet breakpoints throughout |

---

## Priority Fix Order

| Priority | Issue | Effort |
|----------|-------|--------|
| 🔴 P0 | Remove hardcoded private key from whitepaper-lead route | 5 min |
| 🔴 P0 | Fix mobile "Schedule a Meeting" linking to `/` | 2 min |
| 🟠 P1 | Move `<Script>` out of `<head>` | 2 min |
| 🟠 P1 | Remove `ignoreBuildErrors: true` and fix TS errors | 30 min+ |
| 🟠 P1 | Fix `&amp;` literal in floating-cta | 1 min |
| 🟠 P1 | Fix compliance "Get Started" overriding user's mode choice | 2 min |
| 🟡 P2 | Add per-page SEO metadata | 15 min |
| 🟡 P2 | Gate `BackendConnectionTest` to dev-only | 2 min |
| 🟡 P2 | Remove `console.error` monkey-patch | 10 min |
| 🟡 P2 | Remove dead code (chat route, duplicate get-token) | 10 min |
| 🟢 P3 | Refactor floating-cta.tsx into smaller files | 2-3 hrs |
| 🟢 P3 | Clean up unused imports | 5 min |
| 🟢 P3 | Fix Navbar order on home page | 2 min |
| 🟢 P3 | Update LinkedIn to actual company URL | 1 min |
