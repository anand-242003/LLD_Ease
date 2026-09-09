# Phase 20 — Practice Mode

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 19](./19-load-reference-solution-flow.md) · [Phase 21 →](./21-scoring-engine-score-result-modal.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 19 — Load Reference Solution Flow](./19-load-reference-solution-flow.md)

Reuses Phase 19's document-loading pattern to build the Practice mode banner and session state that Phase 21's scoring will require to exist.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 21 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the full Practice flow from `PRD.md` §9.5 — banner, header button, clear-with-confirm, Brief/Reveal reference/Exit — works end to end.

## 3. What to Build

**Files to create:** `src/components/canvas/PracticeBanner.tsx`, `src/components/library/BriefDialog.tsx`, modify `AppHeader.tsx` (conditionally render "Score my solution"), `practiceSlice.ts` (real logic), `ProblemCard.tsx` ("Practice" button wired).

**Step-by-step:**
1. `ProblemCard`'s "Practice" button: if `My Design` is non-empty, show a `ConfirmDialog` — *"Start practising <Problem>? Your current design will be cleared."* (per `PRD.md` §9.5 guard, BR31) — Cancel leaves everything untouched; confirming (or if already empty) proceeds.
2. On proceed: `setActiveDocument('my-design')`, clear its `nodes`/`edges` (not stickies/ink/notes — those don't exist to clear yet at this phase's scope, but don't accidentally wipe them either once Phase 22/23 exist), set `practiceSession = {problemId, startedAt: now}`, close the modal.
3. `PracticeBanner` renders (per `DESIGN.md` §5's card conventions + `PRD.md` §10.4.1's exact layout) whenever `practiceSession != null`: `PRACTICE` pill, problem title, truncated subtitle (`PRD.md` §27-U15's recommended completion: *"Model the classes & relationships, then score your design against the reference."*, CSS-truncated with ellipsis), `Brief` / `Reveal reference` / `Exit` buttons.
4. `AppHeader`: "Score my solution" (outlined, trophy icon) renders **only** when `practiceSession != null` — this is a direct conditional render, not a disabled state (BR60).
5. `Brief`: opens `BriefDialog` showing the problem's full description + requirement bullets (same content as the card, un-truncated); dismissing returns to the canvas with the session untouched.
6. `Reveal reference`: calls Phase 19's `loadReferenceDiagram` for the session's `problemId` (opens or focuses it) **without** clearing `practiceSession` — the banner and Score button must remain visible even while looking at the reference tab (BR63). Returning to `My Design` shows the practice attempt intact.
7. `Exit`: sets `practiceSession = null`. **The diagram itself is not cleared** (BR64) — only the mode ends.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5, §10.4.

**UI consistency checklist:** banner matches `DESIGN.md`/`PRD.md` §10.4.1 exactly (teal-bordered card, pill, truncated subtitle, three buttons); "Score my solution" uses the Outline button recipe.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Open library, click "Practice" on an empty `My Design`. **Expected:** modal closes, banner appears, "Score my solution" appears in the header, canvas is empty.
2. Model a couple of classes, then open the library and click "Practice" on a *different* problem. **Expected:** confirm dialog appears; Cancel leaves the current attempt and banner untouched.
3. Confirm the switch. **Expected:** canvas clears, banner now shows the new problem's title.
4. Click "Brief." **Expected:** full requirements shown; dismiss returns to the same session state.
5. Click "Reveal reference." **Expected:** the reference tab opens/focuses; banner and Score button **remain visible**; switch back to `My Design` — attempt is intact.
6. Click "Exit." **Expected:** banner and Score button disappear; the modeled classes are **still on the canvas**.
7. Reload the page mid-session (before Exit). **Expected:** (depends on Phase 16 persisting `practiceSession` — confirm it does) banner reappears after reload.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.getState().practiceSession` reflects `{problemId, startedAt}` correctly through each step above, and is `null` only after Exit.

### Definition of Done (Exit Criteria)

**Definition of Done:** Epic D1/D2/D4 user stories (`PRD.md` §20) pass; AC 2, 35 (§21.1) pass.

### Scope Boundaries — Do NOT

**Do NOT:** implement scoring yet (Phase 21) — "Score my solution" can be present and clickable but its result is built next.

---

## 6. Next Phase

Continue to [Phase 21 — Scoring Engine + Score Result Modal](./21-scoring-engine-score-result-modal.md).
