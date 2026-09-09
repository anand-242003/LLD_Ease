# Phase 17 — Document Tabs + Notes Panel

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 16](./16-persistence-layer.md) · [Phase 18 →](./18-problem-library-data-modal.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 16 — Persistence Layer](./16-persistence-layer.md)

Uses Phase 16's persistence to make multiple documents (not just My Design) a real, restorable concept, and gives each its own Notes tab.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 18 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the multi-document tab bar and the per-document Notes scratchpad from `PRD.md` §9.16/§10.5.4/§10.6 are fully wired (still only against `My Design` for now — reference tabs arrive in Phase 19, but the tab bar mechanics must work generically first).

## 3. What to Build

**Files to modify:** `DocumentTabBar.tsx`, `DocumentTab.tsx`, new `src/components/panel/NotesPanel.tsx`.

**Step-by-step:**
1. `DocumentTabBar` renders one `DocumentTab` per `workspace.documents`, driven by real store data now (not hardcoded).
2. `My Design`'s tab renders no close button ever (BR01); any other document renders lock icon (if `readOnly`) + title + `REF` badge (if `readOnly`) + `×`.
3. Clicking a tab: `setActiveDocument(id)`, clears `selection`, restores that document's own persisted `viewport` (Phase 7's viewport-per-document plumbing), keeps `rightPanelTab` as-is (workspace-level UI state, not per-document — BR07).
4. Closing a tab (`×`): `removeDocument(id)`; if it was active, falls back to `my-design` (BR08, already enforced in the store from Phase 6 — this just wires the button to it).
5. `NotesPanel`: header row `SCRATCH NOTES` (label) + `saved automatically` (caption, muted, right-aligned), large mono textarea bound to `documents[activeId].scratchNotes`, live-bound + debounce-persisted (same pattern as Phase 16), exact placeholder copy from `PRD.md` Appendix B (two paragraphs).
6. Switching documents shows **that** document's own scratch notes, not a shared one (BR06).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.4, §5.2.

**UI consistency checklist:** tab active/inactive states exactly per `DESIGN.md` §5.4; notes textarea uses the `DESIGN.md` §5.2 input recipe with `font-mono`.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. With only `My Design` open, confirm no `×` renders on it.
2. Type in Notes, switch away (there's only one doc yet, so simulate a second doc via console-created dummy), switch back. **Expected:** notes content is per-document, not shared.
3. Reload after typing notes. **Expected:** notes persist (AC-N1).
4. (Console-simulate a second, closable document.) Close it while active. **Expected:** falls back to `My Design`.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Confirm `scratchNotes` lives on the `Diagram` object, not in `uiSlice` — a common architectural mistake that would break BR06.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 23, AC-N1–N3 (`PRD.md` §10.5.4/§21) pass.

### Scope Boundaries — Do NOT

**Do NOT:** build the "load reference solution" flow yet — this phase only makes the tab bar mechanics work for documents that already exist in the store, however they got there.

---

## 6. Next Phase

Continue to [Phase 18 — Problem Library Data + Modal](./18-problem-library-data-modal.md).
