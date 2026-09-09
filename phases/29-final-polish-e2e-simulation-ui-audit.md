# Phase 29 — Final Polish + Full E2E Simulation & UI Consistency Audit

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 28](./28-responsive-accessibility-pass.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 28 — Responsive + Accessibility Pass](./28-responsive-accessibility-pass.md)

The release gate — takes every phase from 1 through 28 and runs them together, once, in one unbroken session, plus a final full-app pass of the DESIGN.md §10 consistency checklist.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** nothing — this is the final phase. Its own Definition of Done is the release gate for the whole application.

---

## 2. Overview

**Goal:** the last mile (empty states, toasts, confirm dialogs, performance) plus a **complete, real, simulated run-through of every user flow in `PRD.md` §9**, and a final full-app pass of the `DESIGN.md` §10 consistency checklist. This phase is the release gate — nothing ships until it passes.

## 3. What to Build

**Files to modify:** sweep for any remaining empty/loading/error states not yet covered; `src/components/ui/Toast.tsx`/`ConfirmDialog.tsx` polish; a performance pass per `PRD.md` §22.3 (memoize node components, debounce lint/codegen ~150ms, single-SVG ink rendering if stroke count is high).

**Step-by-step (Polish):**
1. Sweep every flow built in Phases 1–26 for a missing empty/loading/error state and fill it, matching `PRD.md` §17's tables exactly (corrupt storage, quota exceeded, import failures, empty-canvas scoring, reference missing, etc.).
2. Confirm every destructive action (Clear, Import-over-existing, Sample-over-existing, Practice-over-existing, Delete relationship... note Delete class/attribute/method rows are intentionally **not** confirmed per BR31) uses the same `ConfirmDialog` component with consistent copy tone.
3. Confirm every toast (success/error/info) uses the one `Toast` component and the correct auto-dismiss behavior (`DESIGN.md` §5.9: success/info auto-dismiss, error requires manual dismiss).
4. Performance: memoize `ClassNode`/`RelationshipEdge` with `React.memo`; verify lint/codegen recompute is debounced and doesn't run mid-keystroke of unrelated fields; load-test with ~50 nodes/60 edges (script-generate via console if needed) and confirm interaction stays smooth.
5. Respect `prefers-reduced-motion` globally (`DESIGN.md` §7) — verify by toggling the OS/browser setting and confirming transitions collapse.

**Step-by-step (Full E2E Simulation — run every one of these as a real, unbroken session in the actual running app, start to finish, no shortcuts):**

1. **Cold boot** (`PRD.md` §9.0): fresh browser profile / cleared storage → load app → confirm the empty shell + canvas empty-state guidance.
2. **Browse & load a reference** (§9.1–9.2): open library → browse all cards → load Parking Lot's solution → confirm read-only enforcement everywhere → confirm Issues reads 0 on it.
3. **Sample** (§9.3): return to My Design, click Sample, confirm it populates (or confirms-over if non-empty).
4. **Model from scratch** (§9.4, §9.7, §9.8): drag 4–5 classes of varying kinds, edit each fully through the Inspector (name, kind, generics, attributes with all visibility/S/F states, methods with all visibility/S/A states, notes), connect them with at least 4 different relationship types including labels/multiplicities, delete one row and one whole class mid-way through.
5. **Live linting** (§9.9): deliberately create an R1 violation, confirm the exact message and badge behavior, fix it, confirm it clears; trigger at least two other rules from your R2–R14 set.
6. **Codegen** (§9.10): cycle through all 6 languages with all 5 chip combinations on this hand-built diagram; Copy and Download at least once each.
7. **Persistence** (§9.0/§16): reload mid-session; confirm total restoration including tabs, viewport, notes, ink, stickies, codegen prefs.
8. **Annotation** (§9.14–9.15): add 2 sticky notes (different colors, bold/italic text), draw 3 ink strokes (different colors/widths), confirm pan/zoom keeps all layers glued together, confirm ink doesn't block clicks when disarmed.
9. **Export/Import** (§9.12–9.13): export PNG, SVG, and JSON; Clear (confirm sticky survives); Import the JSON back; confirm full restoration.
10. **Practice + Score + Explainable Feedback + History** (§9.5–9.6, §0.8, Phases 20-23): start Practice on a problem with an existing non-empty My Design (confirm the guard fires), model a deliberately-flawed attempt, use Brief, use Reveal reference mid-session and return, Score the attempt — confirm the result shows the 5 quantitative dimensions **and** all 4 explainable-feedback lenses (Responsibilities/Abstractions/Relationships/Trade-offs) with real node-anchored findings and a ranked "Top 3 to improve" list, and confirm the attempt now appears in that problem's history with a score. Fix the flaw the feedback named, submit a second attempt, confirm the trend chart appears and the delta is correctly signed. Reopen the first attempt read-only. Try again, Exit — confirm the diagram survives Exit.
11. **Multi-document** (§9.16): with a reference tab and My Design both open, switch back and forth confirming per-document viewport/notes isolation; close the reference tab.
12. **Undo/redo & shortcuts** (Phase 27): undo back through several of the above steps, redo forward, confirm no corruption.
13. **Responsive** (Phase 28): repeat steps 4, 8, and 10 at tablet and mobile widths, confirming the adapted interaction patterns (two-tap connect, drawer panel, bottom-sheet palette) all still function correctly, not just render.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §10, §5.9, §7. This phase does not add new UI — it audits everything built in Phases 1-28 against every DESIGN.md recipe at once.

**Step-by-step (Final UI Consistency Audit):** walk through **every distinct screen/state produced during the E2E simulation above** — not just static screens, but mid-interaction states (armed palette row, expanded ink toolbar, open modal, populated Inspector, populated Issues, populated Code, drawer panel on tablet, bottom sheet on mobile) — and run the full `DESIGN.md` §10 checklist against each one. Log and fix any drift (a stray hardcoded color, an inconsistent radius, a missing focus ring, teal used somewhere it shouldn't be) before considering the app done.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:** the 13-step simulation above **is** the black-box verification for this phase — every step's "Expected" result must hold in one continuous session.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Cross-check `window.__store.getState()` at the end of the full simulation against everything that happened — every node/edge/sticky/stroke/document/practice-session action taken should be reflected exactly, nothing orphaned, nothing duplicated.
2. Re-run the Phase 13/14/22 scratch-script checks (lint message exactness, Java/Python byte-exact output, feedback-finding correctness) one final time against the final codebase to confirm nothing regressed during Phases 15–28.
3. Confirm zero console errors/warnings occurred at any point in the full 13-step session.

### Definition of Done (Exit Criteria)

**Definition of Done:** all 50 acceptance criteria in `PRD.md` §21 pass; the full `PRD.md` §29 Final Build Checklist is checked off; `DESIGN.md` §10's audit passes on every screen/state; the 13-step E2E simulation completes without a single deviation from its expected results; and — per the §0.8 mandate — Phase 22's four explainable-feedback lenses and Phase 23's attempt history/trend both hold on a real repeated-practice run, not just a single submission.

### Scope Boundaries — Do NOT

**Do NOT:** ship with any item in `PRD.md` §29 (Final Build Checklist) unchecked, and do not add any test files during this phase either — all of the above is manual, in-browser, and leaves no test artifacts in the repository, per §0.2.

---

*End of the original v1 release. Total: 29 phases, each independently verifiable, each traceable to `PRD.md` and `DESIGN.md`. Phases 22-23 additionally satisfy the §0.8 practice-and-explainable-feedback mandate on top of `PRD.md`'s original scoring sketch. No phase introduces a test file. Every phase's white-box verification uses only the browser console and the dev-only `window.__store` exposure established in Phase 5 — plus, where noted, an ephemeral scratch script for pure-function precision checks, always deleted after use. Phases 30 onward (see `PHASES.md` §0.9) are a later, second wave driven by real usage of this release, not by new screenshots — they intentionally supersede some of what shipped here.*

---

## 6. Next Phase

This was the release gate for the v1 scope (Phases 1–29). Continue to [Phase 30 — Remove Import / Export](./30.remove-import-export.md) for the post-launch iteration set described in `PHASES.md` §0.9, or return to the [Index](../PHASES.md).
