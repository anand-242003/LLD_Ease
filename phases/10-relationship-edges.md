# Phase 10 — Relationship Edges (types, markers, arming, connect flow, labels/multiplicities)

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 9](./09-palette-sidebar-drag-to-create.md) · [Phase 11 →](./11-inspector-node-form.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 9 — Palette Sidebar + Drag-to-Create](./09-palette-sidebar-drag-to-create.md)

Extends Phase 9's palette-arming pattern to the six relationship types, connecting Phase 8's node handles into real typed edges.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 11 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** all six relationship types from `PRD.md` §9.8/§11.2 can be drawn, render with the correct decoration, and the armed-tool-persists-after-use rule (BR24) holds.

## 3. What to Build

**Files to create:** `src/components/canvas/RelationshipEdge.tsx`, `src/components/canvas/edgeMarkers.tsx` (SVG `<marker>` defs for hollow triangle, filled diamond, hollow diamond, open arrow), register `edgeTypes`.

**Step-by-step:**
1. Define the six `RelationshipType` → `{dashed: boolean, markerStart?, markerEnd?}` mapping exactly per `PRD.md` §9.8's table (Inherit: solid+hollow-triangle-target; Realize: dashed+hollow-triangle-target; Compose: solid+filled-diamond-source; Aggregate: solid+hollow-diamond-source; Associate: solid+open-arrow-target; Depend: dashed+open-arrow-target).
2. Build `RelationshipEdge` using React Flow's `getStraightPath`/`getBezierPath` (per `DESIGN.md` §5.11, straight with slight curve) with the correct `markerEnd`/`markerStart` SVG refs and `strokeDasharray` when dashed.
3. Render the label chip at the midpoint (`EdgeLabelRenderer`) and multiplicity text near each endpoint, using `Relationship.label`/`sourceMultiplicity`/`targetMultiplicity`, styled per `DESIGN.md` §5.11.
4. Wire relationship-row arming (extends Phase 9's `armedTool` union with `{type:'relationship', relType}`).
5. Implement the connect flow: on handle `pointerdown` with a relationship tool armed → React Flow's `onConnectStart`/`onConnect` → on valid target, call store action `createEdge(documentId, sourceId, targetId, relType)`.
6. **Duplicate guard:** `createEdge` checks for an existing edge with the same `type`+`sourceId`+`targetId` and silently no-ops if found (BR22).
7. **Armed-tool persistence:** confirm the relationship tool stays armed after `createEdge` succeeds (BR24) — this should already hold if Phase 9's arming state isn't cleared by `createEdge`, but verify explicitly.
8. Release-on-empty-canvas cancels the connection with no edge created (`onConnectEnd` with no valid target).
9. Handles become visible/prominent on all nodes whenever `armedTool.type === 'relationship'` (finishing the `handlesProminent` prop from Phase 8).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.11.

**UI consistency checklist:** edge stroke/marker colors match `DESIGN.md` §5.11; label chip styling matches (surface-2 bg, border, mono caption font).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Create two nodes. Arm "Realize." Drag from node A's handle to node B. **Expected:** a **dashed** edge with a **hollow triangle** at node B appears (matches `PRD.md` S13).
2. Immediately drag from node A to a third node C without re-clicking "Realize." **Expected:** it works — the tool is still armed (BR24).
3. Try to draw the exact same Realize edge (A→B) again. **Expected:** nothing happens, no duplicate.
4. Start a drag from a handle and release on empty canvas. **Expected:** no edge created, no error.
5. Repeat for all six types. **Expected:** each renders its exact marker/dash combination per the table above.
6. Select an edge. **Expected:** it thickens and turns teal.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.getState().documents.find(d=>d.id==='my-design').edges` after step 2above. **Expected:** 2 edges, both `type:'REALIZE'`, correct `sourceId`/`targetId`.
2. Confirm the duplicate attempt in step 3 did **not** add a third edge — array length unchanged.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 5, 12 from `PRD.md` §21.1 pass; all six relationship renderings visually match `DESIGN.md` §5.11.

### Scope Boundaries — Do NOT

**Do NOT:** implement the Inspector's edge-editing form yet (Phase 12) — this phase only creates and renders edges.

---

## 6. Next Phase

Continue to [Phase 11 — Inspector — Node Form](./11-inspector-node-form.md).
