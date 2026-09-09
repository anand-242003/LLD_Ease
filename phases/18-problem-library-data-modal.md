# Phase 18 — Problem Library Data + Modal

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 17](./17-document-tabs-notes-panel.md) · [Phase 19 →](./19-load-reference-solution-flow.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 17 — Document Tabs + Notes Panel](./17-document-tabs-notes-panel.md)

Populates the static problem catalogue and library modal that Phase 19 will wire to real actions — deliberately built and verified with inert buttons first.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 19 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the static bundled problem catalogue and the `ProblemLibraryModal` from `PRD.md` §9.1/§10.7 exist, fully populated and browsable — **not yet wired to Load/Practice actions**, which is Phase 19/20.

## 3. What to Build

**Files to create:** `src/domain/problems/index.ts`, `data/parkingLot.ts` (using `PRD.md` Appendix A's full node/edge table — this is free ground truth, reproduce it exactly), `data/splitwise.ts`, `elevatorSystem.ts`, `vendingMachine.ts`, `libraryManagement.ts`, `ticTacToe.ts` (these four: reproduce every observed field from `PRD.md` §9.1's table; where clipped/unknown, author a plausible small reference diagram consistent with the stated class/relationship counts and patterns — flag with a `// ASM:` comment), `src/components/library/ProblemLibraryModal.tsx`, `ProblemCard.tsx`.

**Step-by-step:**
1. Each problem data file exports a `Problem` object (per `PRD.md` §13's type) with `title`, `difficulty`, `patterns`, `description`, `requirements[4]`, `practicePrompt`, `stats`, and a fully authored `referenceDiagram` (nodes + edges with positions, laid out sensibly — this is hand-authored content, take care).
2. **Parking Lot must reproduce `PRD.md` Appendix A exactly** — all 15 classes, all 13 relationships, matching kinds/members/edge types/labels/multiplicities.
3. `ProblemLibraryModal`: exact title/subtitle copy from `PRD.md` Appendix B, `role="dialog" aria-modal="true"`, focus trap, `Escape`/scrim/× all close it, push-a-history-entry-on-open pattern (`PRD.md` §7.3) so Back also closes it.
4. `ProblemCard`: title, difficulty badge, pattern tags (teal, middle-dot joined), description, 4 requirement bullets, mono stats line, `Practice` (secondary) + `Load solution →` (primary) buttons — buttons are **inert stubs** for this phase (`console.log` or no-op), wired for real in Phase 19/20.
5. "LLD Problems" header button opens the modal.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.8, §5.7.

**UI consistency checklist:** modal per `DESIGN.md` §5.8; card per `DESIGN.md` §5.7; badges per §5.6 (EASY green / MEDIUM amber / HARD red).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Click "LLD Problems." **Expected:** modal opens with the exact title/subtitle, a 2-column scrolling grid of (at least) 6 cards.
2. Confirm each card's copy matches `PRD.md` §9.1's observed table exactly for the four fully-legible problems.
3. Press `Escape`. **Expected:** modal closes, canvas unchanged.
4. Click the browser Back button while the modal is open. **Expected:** modal closes rather than navigating away (AC-M1 partial).
5. Tab through the modal's focusable elements. **Expected:** focus stays trapped inside; closing returns focus to the "LLD Problems" button.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `getProblems().length >= 6`; `getProblem('parking-lot').referenceDiagram.nodes.length === 15` and `.edges.length === 13` (matches the stated stat line — this is a strong internal-consistency check).

### Definition of Done (Exit Criteria)

**Definition of Done:** AC-M1–M3 pass; the modal is fully browsable with correct data.

### Scope Boundaries — Do NOT

**Do NOT:** wire Load/Practice buttons to real actions yet — that's Phase 19 and 20, kept separate so this phase's data-authoring work can be verified in isolation first.

---

## 6. Next Phase

Continue to [Phase 19 — Load Reference Solution Flow](./19-load-reference-solution-flow.md).
