# Phase 9 — Palette Sidebar + Drag-to-Create

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 8](./08-classnode-component.md) · [Phase 10 →](./10-relationship-edges.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 8 — ClassNode Component](./08-classnode-component.md)

Makes Phase 8's ClassNode creatable from the Phase 3 palette, wiring drag-and-drop and the node-naming/seeding rules from Phase 6.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 10 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the palette becomes interactive — arming, drag-and-drop node creation, and click-to-place fallback, per `PRD.md` §9.4 and §10.3.

## 3. What to Build

**Files to modify:** `PaletteSidebar.tsx`, `PaletteRow.tsx` (extract as its own component per `DESIGN.md` §5.3), `uiSlice.ts` (armed tool state), new `src/hooks/useDragToCanvas.ts`.

**Step-by-step:**
1. Wire `armedTool` in `uiSlice`: clicking a kind row sets `armedTool = {type:'kind', kind}`; clicking a relationship row sets `armedTool = {type:'relationship', relType}` (full connect-flow logic is Phase 10 — this phase only needs kind-arming to work end to end). Enforce **mutual exclusion** across both groups (`PRD.md` §12.2 state machine) and disarm on `Escape`.
2. Implement HTML5 drag-and-drop (`draggable` on `PaletteRow`, `onDragStart` sets `dataTransfer`) → `onDrop` on the canvas uses React Flow's `screenToFlowPosition` to compute the drop point, per `PRD.md` §9.4a and the pattern cited in §22.1.
3. On drop: call a new store action `createNode(documentId, kind, position)` that: generates an id, calls `nextNodeName` (Phase 6) for the name, applies the exact kind-specific seeding from `PRD.md` §9.4 ("Kind-specific seeding" table — Class/Abstract get `id:long`+`doWork():void`; Enum gets zero members; Interface gets one public abstract method; Record gets one attribute, no methods), sets `position`, and **selects the new node + switches `rightPanelTab` to `'inspector'`** (Inspector itself is built in Phase 11, but set the state now so it's ready).
4. Implement click-to-place fallback (§9.4b): arm a kind row, then click empty canvas → places at click point, tool stays armed for repeat placement... **wait** — re-check `PRD.md`: kind tools do *not* explicitly say "stays armed" (only relationship tools do, per BR24) — implement click-to-place as arm → one placement → auto-disarm, to match the more conservative reading, unless you observe otherwise.
5. Disable all palette rows (via the shared disabled style) when `documents[activeDocumentId].readOnly === true`.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.3, §5.1.

**UI consistency checklist:** armed row styling exactly matches `DESIGN.md` §5.3 (teal border/text/glow, nothing else ever shows that state); disabled rows at 0.4 opacity per `DESIGN.md` §5.1.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Click "Class." **Expected:** row arms (teal). Click "Abstract." **Expected:** "Class" disarms, "Abstract" arms — mutual exclusion holds.
2. Drag "Class" onto empty canvas. **Expected:** a node named `NewClass0` appears at the drop point, seeded `- id: long` / `+ doWork(): void`, selected, right panel switches to Inspector tab (AC7 in `PRD.md` §21.1).
3. Drag another "Class." **Expected:** named `NewClass1`.
4. Delete `NewClass0` via console (`removeNode`), drag a third "Class." **Expected:** it reclaims `NewClass0` (lowest free N — BR20).
5. Load a reference-style read-only document (simulate via console: `updateDocument(id,{readOnly:true})` then switch active to it). **Expected:** all palette rows appear disabled and dragging does nothing.
6. Press `Escape` while a row is armed. **Expected:** disarms.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.getState().documents.find(d=>d.id==='my-design').nodes` after two drags. **Expected:** array of 2, names `NewClass0`/`NewClass1`, seeded attributes/methods exactly matching BR21's shape (field types, visibility `-`/`+`).

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 3, 4, 7, 39 (partial — read-only palette) from `PRD.md` §21 pass.

### Scope Boundaries — Do NOT

**Do NOT:** implement relationship connect-drag yet (Phase 10) — kind-row arming and node creation only.

---

## 6. Next Phase

Continue to [Phase 10 — Relationship Edges (types, markers, arming, connect flow, labels/multiplicities)](./10-relationship-edges.md).
