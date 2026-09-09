# Phase 21 — Scoring Engine + Score Result Modal

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 20](./20-practice-mode.md) · [Phase 22 →](./22-explainable-feedback-engine.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 20 — Practice Mode](./20-practice-mode.md)

Requires an active Phase 20 practice session and a Phase 19-loadable reference diagram to score against — the quantitative floor the PHASES.md §0.8 mandate's Phases 22-23 build on top of.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 22 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** `scoreAgainstReference()` and the full result UI from `PRD.md` §9.6 exist — the largest inference in the source PRD, so lean on its fully-specified algorithm rather than improvising.

## 3. What to Build

**Files to create:** `src/domain/scoring/index.ts`, `nameMatch.ts`, `dimensions.ts`, `src/components/practice/ScoreResultModal.tsx`, `ScoreDimensionBar.tsx`.

**Step-by-step:**
1. `nameMatch.ts`: `normalise(name)` (lowercase, strip non-alphanumerics, naive singularise) + a Levenshtein-ratio fuzzy matcher with the `>= 0.80` threshold from `PRD.md` §9.6.
2. `dimensions.ts`: implement the five weighted dimensions exactly as specified — Classes identified (30%), Correct kinds (15%), Relationships (30%), Members (15%), Cleanliness (10%, `100 − 10×issueCount` floored at 0). Reuse Phase 13's `lint()` for the cleanliness dimension.
3. `scoreAgainstReference(attempt, reference)`: matches attempt nodes to reference nodes via `nameMatch`, computes each dimension, rounds the weighted total to an integer, and returns matched/missing/extra lists per the `ScoreResult` shape in `PRD.md` §16.2.
4. Wire "Score my solution" click: if the attempt (`My Design`) is empty, **do not** open the modal — show a toast *"Add some classes first, then score your design."* (`PRD.md` §17.4). Otherwise show a brief loading state on the button (spinner, disabled, per the async-operation state machine in `PRD.md` §12.7), then open `ScoreResultModal`.
5. `ScoreResultModal`: big numeric score + grade band (≥90 Excellent / ≥75 Strong / ≥60 Fair / <60 Keep going), 5-row dimension breakdown with bars, then collapsible Matched/Missing/Extra sections — **Extra items must read neutrally**, not as errors (BR66 — check the actual copy you write against this rule).
6. Footer actions: `Reveal reference` (reuses Phase 19/20's flow), `Try again` (closes modal, keeps session), `Close`.
7. Re-scoring is always allowed and always recomputed fresh — no caching (BR67... wait, that's the empty-canvas rule; re-scoring freshness is a separate unlabeled rule from §9.6 — implement it as stated regardless).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.8.

**UI consistency checklist:** modal uses `DESIGN.md` §5.8; dimension bars use `--primary` fill on a `--surface-2` track; grade-band color coding should map loosely to the difficulty-badge palette (green=excellent down through amber to a neutral "keep going") without inventing new hues outside §2.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. With an empty `My Design` in an active practice session, click "Score my solution." **Expected:** no modal opens; a toast tells the user to add classes first.
2. Model 2–3 classes with plausible names for the active problem (e.g. `ParkingSpace` instead of the reference's `ParkingSpot`), click Score. **Expected:** result modal opens with a total score, 5 dimension bars, and `ParkingSpace`/`ParkingSpot` appearing as **matched** (fuzzy name match), not missing.
3. Add an extra class unrelated to the reference. **Expected:** it appears under "Extra," phrased neutrally, and does not tank the Classes-identified score.
4. Click "Try again." **Expected:** modal closes, session persists, canvas unchanged, ready to re-score.
5. Click "Score my solution" again without changing anything. **Expected:** recomputes fresh (not a cached instant value — though at this scale it'll still feel instant).

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Scratch-script: `scoreAgainstReference(identicalDiagram, identicalDiagram)`. **Expected:** `total === 100`.
2. `scoreAgainstReference(emptyDiagram, reference)` — confirm this path is intercepted by the UI's empty-canvas guard rather than silently returning a score of 0 through the engine (per BR67's spirit — refused, not zero).
3. Confirm `normalise('ParkingSpace') vs normalise('ParkingSpot')` clears the 0.80 threshold as claimed.

### Definition of Done (Exit Criteria)

**Definition of Done:** Epic D3 (`PRD.md` §20) passes; the scoring interface is cleanly swappable per §22.2 rule 4's spirit (even though that rule was about codegen, the same "one interface" discipline applies here per §16.2).

### Scope Boundaries — Do NOT

**Do NOT:** silently cache or reuse a previous `ScoreResult` for the *current, still-editable* diagram — every click of "Score my solution" recomputes fresh from the live model, same rule as Issues/Code (§13.2 invariant 5's spirit extended). This is separate from Phase 23, which deliberately archives each *completed submission* as a permanent `Attempt` — recomputing fresh on click and intentionally archiving on submit are not in conflict. Phases 22 and 23 build directly on this phase's `ScoreResult`/diagram output; do not reach ahead into their scope here.

---

## 6. Next Phase

Continue to [Phase 22 — Explainable Feedback Engine (Responsibilities, Abstractions, Relationships, Trade-offs)](./22-explainable-feedback-engine.md).
