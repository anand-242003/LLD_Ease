# Phase 19 — Load Reference Solution Flow

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 18](./18-problem-library-data-modal.md) · [Phase 20 →](./20-practice-mode.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 18 — Problem Library Data + Modal](./18-problem-library-data-modal.md)

Wires Phase 18's inert 'Load solution' button to Phase 17's multi-document machinery and Phase 6's read-only guard, producing the app's first real reference tab.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 20 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** "Load solution →" produces a real, read-only, correctly-enforced reference tab end to end, per `PRD.md` §9.2/§8.2.

## 3. What to Build

**Files to modify:** `ProblemCard.tsx` (wire the real action), `workspaceSlice.ts` (`loadReferenceDiagram` action).

**Step-by-step:**
1. `loadReferenceDiagram(problemId)`: **idempotency check first** — if a document with `sourceProblemId === problemId` already exists, just `setActiveDocument` to it and close the modal (BR12) — do not create a duplicate.
2. Otherwise: construct a new `Diagram` from `getProblem(problemId).referenceDiagram`, with `id` freshly generated, `title: "<Problem title> — Reference"`, `readOnly: true`, `sourceProblemId: problemId`, `createdAt/updatedAt` now.
3. `addDocument`, `setActiveDocument`, close the modal, and `fitView()` the canvas to the new diagram's full extent (`PRD.md` §9.2 step 3).
4. Confirm every read-only enforcement point from Phase 6 (store guard), Phase 9 (palette disabled), Phase 11/12 (Inspector read-only, no Delete button), Phase 17 (tab shows lock+REF+×, no × on My Design... wait, reference tabs **do** get a ×, only My Design doesn't — re-check `PRD.md` §8.2's table) is actually exercised now with a real reference document, not a simulated one.
5. Ink toolbar (built later in Phase 25) will need to hide on read-only docs — note this dependency now so Phase 25 doesn't forget it.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.4.

**UI consistency checklist:** the loaded reference tab's visual treatment (lock/REF badge/title suffix) matches `DESIGN.md` §5.4's reference-tab recipe exactly.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Open the library, click "Load solution →" on Parking Lot. **Expected:** modal closes, a tab titled "Parking Lot — Reference" appears with a lock icon and `REF` badge, becomes active, canvas shows all 15 nodes fitted to view (AC-M4, matches `PRD.md` S2/S3).
2. Try to drag a palette item. **Expected:** nothing happens, palette appears disabled.
3. Select a node. **Expected:** Inspector shows its data but every field is non-editable and no Delete button appears (AC-W4/AC-I5).
4. Open Issues on this tab. **Expected:** reads "No problems" — **the bundled reference must lint clean** (re-run Phase 13's `lint()` against this real loaded data as a white-box spot-check too).
5. Go back to the library, click "Load solution →" on Parking Lot again. **Expected:** the existing tab is focused, no second "Parking Lot — Reference" tab appears (AC-M4/BR12).
6. Close the reference tab's ×. **Expected:** it closes; if it was active, `My Design` becomes active.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.getState().documents.filter(d=>d.sourceProblemId==='parking-lot').length === 1` even after clicking "Load solution" twice.
2. Confirm the reference document's `readOnly` field is `true` and the store guard (Phase 6) actually rejects a manual `addNode` call against it via console.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC-A2's full story (`PRD.md` §20 Epic A) passes end to end; AC 6, 39 from §21 pass with real data.

### Scope Boundaries — Do NOT

**Do NOT:** allow this flow to touch `My Design` in any way — loading a reference is purely additive.

---

## 6. Next Phase

Continue to [Phase 20 — Practice Mode](./20-practice-mode.md).
