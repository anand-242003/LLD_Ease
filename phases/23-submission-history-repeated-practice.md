# Phase 23 — Submission History & Repeated Practice

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 22](./22-explainable-feedback-engine.md) · [Phase 24 →](./24-sticky-notes.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 22 — Explainable Feedback Engine (Responsibilities, Abstractions, Relationships, Trade-offs)](./22-explainable-feedback-engine.md)

Archives every Phase 21/22 submission (score + feedback + diagram snapshot) as a permanent record, reusing Phase 19's read-only-tab pattern to let a learner reopen a past attempt.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 24 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** build the "practice repeatedly and understand where your design can improve" half of §0.8 — every submission becomes a permanent, comparable `Attempt`, with a history view showing whether the learner is actually getting better across tries at the same problem.

**Context carried forward:** `PRD.md` §16.2 `ScoreResult` (embedded in each `Attempt`), §9.2/§8.2 (the read-only reference-tab pattern, reused here for reopening a past attempt), §17.1 (storage-safety posture — cap unbounded growth), Phase 21 (`scoreAgainstReference`) and Phase 22 (`buildFeedbackReport`) — both run once per submission and their outputs are what gets archived.

## 3. What to Build

**Files to create:** `src/domain/practice/attempts.ts` (`Attempt` type + pure helpers), modify `practiceSlice.ts` (`recordAttempt`, `listAttempts`), extend `persist.ts` (Phase 16) to include `attempts` in the persisted `Workspace`, `src/components/practice/AttemptHistoryPanel.tsx`, `AttemptTrendChart.tsx`; modify `ScoreResultModal.tsx` (Phase 21/22) and `ProblemCard.tsx` (Phase 18).

**Step-by-step:**
1. `attempts.ts`: `Attempt { id, problemId, submittedAt: ISODate, score: number, dimensions: ScoreResult['dimensions'], feedbackSummary: {concerns:number, suggestions:number, positives:number}, diagramSnapshot: Diagram }`. The snapshot is a **deep copy** of the submitted diagram at the moment of submission — not a live reference to the still-editable `My Design` document.
2. Extend the persisted `Workspace` shape (Phase 16) with `attempts: Attempt[]` — append-only, never mutated after creation, capped at 50 per `problemId` (oldest pruned first) per the storage-safety posture in `PRD.md` §17.1.
3. On every successful "Score my solution" submission (after both Phase 21's `scoreAgainstReference` and Phase 22's `buildFeedbackReport` resolve), call `recordAttempt(...)` to append the new `Attempt` **before** showing the result modal — a submission is recorded even if the learner closes the modal immediately after.
4. `AttemptHistoryPanel`: reachable from the `ProblemCard` (a small line — *"N attempts · best score M"* — plus a "View history" link, rendered **only** when ≥1 attempt exists for that problem; zero visual change on a never-attempted card) and from within an active practice session. Lists attempts newest-first: date, score, a signed delta vs. the previous attempt (colored `--success`/`--danger`), and the concern/suggestion/positive counts from that attempt's `feedbackSummary`. List rows reuse the `IssueRow`/`FindingCard` row grammar (`DESIGN.md` §5), not a new list style.
5. Clicking a past attempt opens its `diagramSnapshot` as a **read-only tab**, titled `"<Problem> — Attempt #N"`, reusing Phase 19's exact reference-tab mechanics (lock icon, no editing, disabled palette) with a differently-labelled badge (e.g. `PAST` instead of `REF`) so it's visually distinguishable from the canonical reference solution.
6. `AttemptTrendChart`: a minimal inline-SVG score-over-attempts line/bar (no charting library — hand-rolled, using `--primary` for the line/bars and `--surface-2` for the grid, brand-neutral). Shown at the top of `AttemptHistoryPanel` only when ≥2 attempts exist; simply absent (not an empty/broken chart) below that.
7. "Try again" in `ScoreResultModal` (Phase 21) implicitly becomes "submit attempt N+1" — no functional change to the button itself, just confirm the attempt count context threads through correctly to the next submission's history entry.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5, §2.

**UI consistency checklist:** the trend chart uses only tokens already defined in `DESIGN.md` §2 — no new colors introduced for charting; history rows visually match Issues/FindingCard rows, not a bespoke table.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Practice a problem, submit once. **Expected:** back in the library, that `ProblemCard` now shows "1 attempt · best score X".
2. Submit a second, better attempt on the same problem. **Expected:** "2 attempts · best score Y" (Y = the max of the two), `AttemptHistoryPanel` shows both with a correctly-signed delta on the second entry, and the trend chart now appears (it didn't after just one attempt).
3. Open the first (older) attempt from history. **Expected:** opens as a read-only `"<Problem> — Attempt #1"` tab — no palette, no editing, structurally identical in behavior to a Phase 19 reference tab.
4. Reload the page. **Expected:** attempt history survives (persisted via the Phase 16 extension).
5. Attempt a problem for the first time. **Expected:** no trend chart, no "N attempts" line on its card beforehand — a clean, uncluttered first-time state.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.getState().attempts.filter(a => a.problemId === 'parking-lot').length` increments by exactly 1 per submission; earlier attempts' `submittedAt`/`score`/`diagramSnapshot` are unchanged after a new one is added (append-only, never mutated).
2. After submitting, mutate `My Design` further, then inspect the just-recorded `Attempt.diagramSnapshot`. **Expected:** unaffected by the later mutation — confirms it's a deep copy, not a live reference.
3. Submit 51 attempts on one problem via console loop. **Expected:** the store caps at 50 for that `problemId`, oldest pruned first.

### Definition of Done (Exit Criteria)

**Definition of Done:** a learner can submit the same problem 3+ times in one session, see the score trend and per-attempt feedback deltas, and reopen any past attempt read-only — this is the direct, working build-out of "practice LLD repeatedly and understand where their design can improve" from §0.8.

### Scope Boundaries — Do NOT

**Do NOT:** let an `Attempt` be edited or deleted by the user (append-only, immutable history — this is what makes "am I actually improving" a trustworthy signal); do NOT let the 50-attempt cap silently corrupt the trend chart's math — pruning removes the *oldest* record and the chart/best-score calculation must recompute from what remains.

---

## 6. Next Phase

Continue to [Phase 24 — Sticky Notes](./24-sticky-notes.md).
