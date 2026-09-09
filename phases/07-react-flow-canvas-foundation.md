# Phase 7 — React Flow Canvas Foundation

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 6](./06-workspace-document-lifecycle-logic.md) · [Phase 8 →](./08-classnode-component.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 3 — Static App Shell Layout](./03-static-app-shell-layout.md), [Phase 6 — Workspace & Document Lifecycle Logic](./06-workspace-document-lifecycle-logic.md)

Mounts React Flow against Phase 6's now-rule-enforcing store and Phase 3's shell, giving the canvas real pan/zoom/background for the first time.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 8 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** `@xyflow/react` is wired into `CanvasStage`, rendering the (still-empty) active document's nodes/edges from the real store, with background, zoom controls, and pan/zoom working.

**Context:** `PRD.md` §10.4 (CanvasStage spec), §10.4.2 (ZoomControls — note the 4th "lock" button resolved in §27-U8), §22.1 (React Flow feature mapping).

## 3. What to Build

**Files to create/modify:** `CanvasStage.tsx` (replace static version), `src/components/canvas/ZoomControls.tsx`, `src/hooks/useDocumentSync.ts` (bridges store document ↔ React Flow's node/edge state).

**Step-by-step:**
1. Wrap `CanvasStage` in `<ReactFlowProvider>`; render `<ReactFlow nodes={} edges={} onNodesChange={} onEdgesChange={} />` bound to the active document via the store (still using React Flow's default node/edge rendering — custom `ClassNode` comes in Phase 8).
2. Add `<Background variant={BackgroundVariant.Dots} gap={16} color="var(--grid-dot)" />` per `DESIGN.md`/`PRD.md` §10.4.
3. Add `<Controls showZoom showFitView showInteractive />` positioned bottom-left — this is React Flow's stock component and **is** the `+ − ⛶ 🔒` stack from `PRD.md` §10.4.2 (the "lock" toggles `showInteractive`, resolving §27-U8).
4. Node drag (`onNodeDragStop`) writes the new `position` back into the store's `ClassNode.position`.
5. Persist and restore `viewport` per document (`onMoveEnd` → store; restore via `fitView`/`setViewport` on document switch) per `PRD.md` §9.16.
6. Implement the canvas empty state from `PRD.md` §10.4 ("Drag a class from the left to start…") when `nodes.length === 0` and not in practice mode.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §10.4, §5.10, §7.

**UI consistency checklist:** dot grid color/spacing matches `DESIGN.md` §5.10 context; `Controls` styled to match the dark theme via React Flow's CSS variable overrides (map its internal vars to `--surface-2`/`--border`/`--text`, don't leave React Flow's default light theme showing).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Console: `window.__store.getState().addNode('my-design', {...a full ClassNode...})`. **Expected:** a default-rendered node appears on canvas immediately (no page reload needed).
2. Drag the node. **Expected:** it moves; re-run `getState()` and confirm `position` updated in the store.
3. Scroll to zoom, drag to pan. **Expected:** smooth 1:1 tracking, no animation lag (per `DESIGN.md` §7).
4. Click the fit-view control. **Expected:** the node centers with padding.
5. Click the lock control. **Expected:** the node can no longer be dragged; pan/zoom still work per React Flow's `showInteractive` semantics — confirm this matches `PRD.md` §27-U8's resolution.
6. Clear all nodes via console. **Expected:** the canvas empty-state message appears.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Confirm `onMoveEnd` writes `{x,y,zoom}` into `documents[activeId].viewport` — inspect via `window.__store.getState()`.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC-C1 (pan/zoom moves everything together — partial, ink/stickies not yet present) and the empty-state requirement pass.

### Scope Boundaries — Do NOT

**Do NOT:** build the custom `ClassNode` visuals here — this phase is the React Flow plumbing only; default boxes are fine for now.

---

## 6. Next Phase

Continue to [Phase 8 — ClassNode Component](./08-classnode-component.md).
