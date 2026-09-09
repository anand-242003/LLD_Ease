# Phase 5 — Zustand Store Scaffolding

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 4](./04-domain-types-constants.md) · [Phase 6 →](./06-workspace-document-lifecycle-logic.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 4 — Domain Types & Constants](./04-domain-types-constants.md)

Wraps Phase 4's types in a real Zustand store with CRUD actions, but without yet enforcing the business rules (read-only guard, cascade delete) that Phase 6 adds.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 6 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the store shape from `PRD.md` §5.3/§13/§22.2 exists with real slices and typed actions, but with **no business logic yet** — actions exist and mutate state trivially/correctly for basic CRUD, but rules like "read-only guard" or "delete cascades to edges" come in Phase 6.

## 3. What to Build

**Files to create:** `src/store/index.ts`, `documentSlice.ts`, `workspaceSlice.ts`, `uiSlice.ts`, `practiceSlice.ts`, `selectors.ts` (empty stubs for now).

**Step-by-step:**
1. Build the store with `zustand` + `zundo` (temporal/undo middleware wraps the whole store from day one, even though Phase 25 is where you wire it to the UI — cheaper to include now than retrofit).
2. `workspaceSlice`: `documents: Diagram[]`, `activeDocumentId`, actions `addDocument`, `removeDocument`, `setActiveDocument`.
3. `documentSlice`: actions that operate on `documents[activeDocumentId]` — `addNode`, `updateNode`, `removeNode`, `addEdge`, `removeEdge`, `updateDocument` (generic patch). No read-only guard yet (Phase 6).
4. `uiSlice`: `rightPanelTab`, `armedTool`, `inkTool`, `codeLanguage`, `codeOptions` with defaults exactly from `PRD.md` §13 (`constructor: true, gettersSetters: true, toStringM: false, equalsHashCode: false, docComments: true`, `codeLanguage: 'java'`).
5. `practiceSlice`: `practiceSession: null`, actions `startPractice`, `endPractice`.
6. Compose all slices into one store in `index.ts` with the dev-only `window.__store` exposure from §0.4 step 1.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** N/A — no UI wired yet.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:** N/A.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. In console: `window.__store.getState()`. **Expected:** an object with `documents`, `activeDocumentId`, `ui`, `practiceSession` matching the shapes above.
2. `window.__store.getState().addDocument({...minimal diagram...})` then re-read state. **Expected:** the new document appears in `documents`.
3. Confirm zundo is active: `window.__store.temporal.getState()` exists. **Expected:** truthy, has `undo`/`redo` functions (even if not wired to UI yet).

### Definition of Done (Exit Criteria)

**Definition of Done:** every action in this phase is callable from the console and produces the correct state delta; `Workspace` shape matches `PRD.md` §13 exactly.

### Scope Boundaries — Do NOT

**Do NOT:** implement business rules yet (read-only guard, cascade delete, name-counter logic) — that's Phase 6. This phase is plumbing only.

---

## 6. Next Phase

Continue to [Phase 6 — Workspace & Document Lifecycle Logic](./06-workspace-document-lifecycle-logic.md).
