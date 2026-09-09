# Phase 6 — Workspace & Document Lifecycle Logic

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 5](./05-zustand-store-scaffolding.md) · [Phase 7 →](./07-react-flow-canvas-foundation.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 5 — Zustand Store Scaffolding](./05-zustand-store-scaffolding.md)

Takes Phase 5's plumbing and enforces the actual invariants from PRD.md §13.2/§14.1 inside it — most importantly the read-only guard every later editing phase depends on.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 7 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the real rules from `PRD.md` §13.2 (invariants) and §14.1 (document/workspace business rules) are enforced *in the store*, not just in components.

**Context:** `PRD.md` §8.2 (permission model — the read-only guard is the most important rule in this phase), §13.2 invariants 1–7, §14.1 BR01–BR12.

## 3. What to Build

**Files to modify:** `documentSlice.ts`, `workspaceSlice.ts`.

**Step-by-step:**
1. On store init, create the permanent `my-design` document (`id: 'my-design'`, `readOnly: false`, empty everything) and set it active — invariant 1.
2. **Read-only guard:** every mutating action in `documentSlice` (`addNode`, `updateNode`, `removeNode`, `addEdge`, `removeEdge`, sticky/ink actions once they exist) must early-return a no-op if `documents[activeDocumentId].readOnly === true`. Write this as a single shared guard helper, not copy-pasted per action — `PRD.md` §22.2 rule 6.
3. **Cascade delete:** `removeNode(nodeId)` must also remove every `Relationship` in that document referencing `nodeId` as source or target, atomically (§13.2 invariant 4, BR30).
4. **Name counter:** implement `nextNodeName(document)` returning `NewClass<N>` for the lowest free `N`, per BR20 — used by Phase 9's node-creation flow, but the pure logic belongs here in the slice/domain boundary.
5. **Active document invariant:** `setActiveDocument` must reject an unknown id (invariant 2); `removeDocument` on the active doc must fall back to `my-design` (BR08).
6. Guard `removeDocument('my-design')` as a no-op — it can never be closed (BR01).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** N/A — still headless.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:** N/A (no UI wired to this yet — verify via console).

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `s = window.__store.getState()`. `s.updateDocument('my-design', {readOnly:true}); s.addNode('my-design', {...})`. **Expected:** the node is **not** added — read-only guard held.
2. Reset readOnly false. Add two nodes, connect them with an edge, then `s.removeNode('my-design', nodeAId)`. **Expected:** the node **and** its edge are both gone; `state.documents.find(d=>d.id==='my-design').edges.length === 0`.
3. `s.nextNodeName(doc)` called three times while manually deleting the middle name between calls. **Expected:** it reuses the freed integer rather than always incrementing (per BR20's "lowest free N" rule).
4. `s.removeDocument('my-design')`. **Expected:** no-op, `my-design` still present.
5. `s.setActiveDocument('does-not-exist')`. **Expected:** no-op, `activeDocumentId` unchanged.

### Definition of Done (Exit Criteria)

**Definition of Done:** all 5 white-box checks pass exactly as described; every mutating action has the read-only guard.

### Scope Boundaries — Do NOT

**Do NOT:** put the read-only guard in components — `PRD.md` §22.2 rule 6 requires it live in the store as the actual guarantee, with UI disabling as a courtesy on top (added in later phases).

---

## 6. Next Phase

Continue to [Phase 7 — React Flow Canvas Foundation](./07-react-flow-canvas-foundation.md).
