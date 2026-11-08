# Section 0: Database Persistence Plan (S0-20)

**Owner:** MuhammadH · **Branch:** `dev` (a feature branch from `dev` is fine) · **Task ID:** S0-20 in [Section0_GenericImplementationPlan.md](Section0_GenericImplementationPlan.md)

## 1. Why this is needed

In Section 0, Ailana remembers everything the borrower says from the very first message: goal, income, debts, credit, savings, location, co-borrower, military status and so on. This memory is called the **Fact Ledger**. Every later stage reads it, so Ailana never asks for something the borrower already told her.

Today the memory survives:
- the whole conversation (it is kept in the backend session);
- a page reload or reconnect (a copy goes to the frontend with every stage update, `statedFacts`, and is restored from there).

It does **not** survive a database resume (the borrower comes back later and the application is loaded with `initializeFromDatabase`). After a resume the stage tables are filled again, but the memory is empty. Ailana would then lose facts that have no stage column (for example "relocating from Atlanta", "pre-approval letter from another lender", or a self-correction history), and could repeat compliance notes she already gave.

**Goal:** save the Section 0 memory in the database on every sync, and load it back on resume.

## 2. What is already done on the agent side (no work needed)

The whole memory is now **one JSON value** with a get/restore pair in `backend/src/context/session-context-manager.ts`:

| Method | What it does |
| :--- | :--- |
| `getSection0Snapshot(): Section0Snapshot \| null` | Returns the memory as plain JSON. Returns `null` when `SECTION_0_ENABLED` is off. |
| `restoreSection0Snapshot(snap: unknown, source?: string): void` | Loads it back. Safe with `null`, malformed JSON and older snapshots. Does nothing when the flag is off. |

Shape of the value (type `Section0Snapshot`, exported from the same file):

```jsonc
{
  "ledger":  { "v": 1, "entries": [ /* one per fact: key, value, raw, status, turn, stage, history */ ] },
  "state":   { "intentAsked": true, "trackSet": true, "holdoutRouted": false, ... },   // routing state
  "session": { "notesShown": ["privacy"], "quickChecksAsked": [], "trackSwitches": 0 } // once-per-session bookkeeping
}
```

Unit test: `backend/src/__tests__/section0-sync.test.ts`, block "S0-20 (DB resume)". It round-trips the value through `JSON.stringify` / `JSON.parse`, exactly as the column will.

**Privacy:** the value never contains an SSN or a street address. The safety net removes them before anything is stored, and the extractor is forbidden to output them. It also holds no race, ethnicity, religion, age or other protected characteristic (ECOA / Reg B). It does hold ordinary application data (income, debts, credit range), so treat it with the same care as the stage tables.

## 3. Your tasks

### Step 1: Add the column (Prisma schema)

File: `prisma/schema.prisma` (repo root), model `Application`, next to `fieldAttempts`:

```prisma
  // Section 0 memory (Fact Ledger + routing state). Null for applications created with SECTION_0_ENABLED off.
  section0State Json? @map("section0_state")
```

- **Nullable, no default.** Existing rows stay valid, and the flag-off build never writes it.
- No index is needed, because we never query inside it.

### Step 2: Migration and client

From the repo root:

```bash
npx prisma migrate dev --name add_section0_state   # creates prisma/migrations/<timestamp>_add_section0_state/
npx prisma generate                                 # regenerates src/generated/prisma
```

- Check the generated SQL. It should be a single `ALTER TABLE "applications" ADD COLUMN "section0_state" JSONB;`. Nothing else should change. If Prisma wants to change other tables, stop: the schema and the database have drifted, so fix that first in a separate commit.
- Shared or staging databases use `npx prisma migrate deploy` (see [DATABASE_TESTING_GUIDE.md](DATABASE_TESTING_GUIDE.md)).

### Step 3: Service methods

File: `backend/src/services/application-service.ts`

```ts
/** Save the Section 0 memory (one JSON value). */
async saveSection0State(applicationId: string, snapshot: unknown): Promise<void | null> {
  if (!prisma) return null;
  await prisma.application.update({ where: { id: applicationId }, data: { section0State: snapshot as any } });
}
```

You don't need a load method. `getApplicationWithStages()` already returns every scalar column of `applications`, so `app.section0State` comes back with it. Please confirm this after `prisma generate`.

### Step 4: Save on every sync

File: `backend/src/context/session-context-manager.ts`, method `syncToDatabase()`, right after `applicationService.syncAllStages(...)`:

```ts
const s0 = this.getSection0Snapshot();          // null with the flag off → nothing written
if (s0) await applicationService.saveSection0State(this.applicationId, s0);
```

This keeps the existing throttle (`syncIntervalMs`) and the existing `try/catch`. A failed save must never stop the conversation (same rule as the stage sync).

`syncToDatabase()` runs after each turn from `prepareContext` in `agent.ts` (around line 1677) and is throttled to every 5 seconds. There is **no final sync when the borrower leaves**, so the last turn or two can be lost. Please add one unthrottled final save on session end:
- use the `ctx.room.on(RoomEvent.ParticipantDisconnected, …)` handler around line 2811, or `ctx.addShutdownCallback(...)`;
- it can be a small `flushToDatabase()` that skips the throttle;
- it should cover the stage tables too, not only `section0_state`.

### Step 5: Load on resume

File: same, method `initializeFromDatabase()`, after the stage restores and **before** `this.activeStage = app.currentStage`:

```ts
// Section 0 memory (null for old applications or when the flag was off)
if ((app as any).section0State) this.restoreSection0Snapshot((app as any).section0State, 'database');
```

(After `prisma generate`, the `as any` can go, because the field is typed.)

### Step 6: Stage value on resume (check, then tell us)

With Section 0 on, a new conversation starts in stage `"0"`, but `applications.current_stage` defaults to `"1"`.

- Check that a borrower who disconnects **during Section 0** (before a track is chosen) is resumed in stage `"0"`, not `"1"`.
- **Rule:** if the restored `section0State.state.trackSet` is `false`, the active stage should stay `"0"`.
- If that needs a change in the agent flow logic rather than in the database code, just report it and Sohail will make the change on the agent side.

### Step 7: Things to check while you're in there (report, don't fix unless trivial)

1. **Possible double save of user turns in voice mode.**
   - `agent.ts` `onUserTurnCompleted` saves the user turn (`saveVoiceConversationTurn`).
   - It then runs `triggerBackgroundExtraction`, which calls `onUserTurn` on a **clone**, and that also calls `saveConversationTurn('user', …)`.
   - Please check in the `conversations` table whether a voice turn is stored twice.
2. **Redaction in the transcript table.** The voice path now saves the *redacted* text when the flag is on; this changed in fix cycle 11. Please confirm with a real row: say "my social is 4-1-2 5-5 ..." and check that `conversations` shows `[REDACTED]`, and that no row anywhere holds the digits.

## 4. Rules (from CLAUDE.md, please keep)

- **Flag off = no change.** With `SECTION_0_ENABLED` off, `getSection0Snapshot()` returns `null`, nothing is written, and the column stays null. The demo build must behave exactly as today.
- Never read, print or commit credentials (`.env`, `DATABASE_URL`).
- No real borrower data in tests; use invented people.
- Simulations never touch the real database. Agent simulations run with database writes mocked (`backend/src/section0/sim-mocks.ts`), so this work does not affect them.
- Small commits, one problem per commit, plain-English message. Suggested:
  1. `Section 0 DB: add nullable section0_state column to applications (migration)`
  2. `Section 0 DB: save the Section 0 memory on sync and restore it on resume`

## 5. How to test (localhost, with a real database)

Setup: `DATABASE_URL` set in `backend/.env`, and `SECTION_0_ENABLED=true`.

| # | Do this | Expected |
| :--- | :--- | :--- |
| 1 | `npm test` in `backend/` | 26/26 suites pass (flag-off parity 23/23 included) |
| 2 | Start a text chat. First message: *"I want to buy in Ooltewah, I make 84,000, 1,200 a month in debt, credit 710."* Answer the first name, then close the tab. | `applications.section0_state` holds the ledger with price/income/debt/credit/area; `notesShown` lists any note already given |
| 3 | Reopen the same application (resume path, `initializeFromDatabase`) | Log line `[section0] ♻️ restored Fact Ledger from database (N facts)`. Ailana does **not** ask again for income, debt, credit or area |
| 4 | Disconnect *before* choosing a goal (first message only: *"I have some mortgage questions."*), then resume | Resumes in Section 0 (stage `"0"`), not Stage 1 (see Step 6) |
| 5 | Set `SECTION_0_ENABLED=false` and run a normal conversation | `section0_state` stays **null**; flow identical to today's demo |
| 6 | Old application created before the migration | Loads normally (column null, nothing restored, no error) |
| 7 | Say an SSN or a street address in voice mode | `conversations` and `section0_state` contain no digits or address; Ailana gives the short "I can't take that here" response |

When done, please update:
- the S0-20 row in [Section0_GenericImplementationPlan.md](Section0_GenericImplementationPlan.md) (status → ✅ with the migration name);
- a short note in [Section0TestGuide.md](Section0TestGuide.md) with the test results above.

## 6. Questions

Ask Sohail. Anything that touches how Ailana talks or routes (the agent flow) stays on the agent side; this task is only the column, the migration, saving and loading.
