# Phase 25 — Ink Drawing Layer

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 24](./24-sticky-notes.md) · [Phase 26 →](./26-export-import-clear.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 24 — Sticky Notes](./24-sticky-notes.md)

The second annotation layer, sharing Phase 7's viewport transform with Phase 24's sticky notes so all three canvas layers — nodes, ink, stickies — move together.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 26 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the freehand annotation layer from `PRD.md` §9.15/§10.4.3, using `perfect-freehand`, with the exact collapsing-toolbar behavior.

## 3. What to Build

**Files to create:** `src/components/canvas/InkLayer.tsx`, `InkToolbar.tsx`, `src/hooks/useInkDrawing.ts`.

**Step-by-step:**
1. `InkToolbar`: floating pill, bottom-center, collapsed by default (pen + eraser icons only). Clicking pen expands it to reveal 5 color swatches (`--ink-*` tokens) + 3 width dots, per `DESIGN.md` §5's tooltip note — hovering a swatch shows its hex value in a tooltip (e.g. `#f43f5e` for red, matching the exact observed value).
2. `InkLayer`: an SVG (or canvas) overlay sharing the same viewport transform as the node/edge layer (critical — must pan/zoom in lockstep, per AC-C1). **`pointer-events: none` whenever `inkTool === null`** — this is a hard requirement (`PRD.md` §5.2/§9.15's "critical rule") so nodes underneath remain clickable when ink isn't armed.
3. When `inkTool === 'pen'`: pointer drag captures points, fed through `perfect-freehand`'s `getStroke()` to produce a smooth pressure-tapered outline, rendered as an SVG `<path>`, pushed to the store as an `InkStroke` on pointer-up.
4. When `inkTool === 'eraser'`: dragging over a stroke removes that whole stroke (whole-stroke granularity, per `PRD.md`'s inference) — hit-test the pointer path against each stroke's bounding area.
5. Trash icon in the toolbar appears **only once `inkStrokes.length > 0`** for the active document; clicking it clears all ink on that document (confirm first, reusing `ConfirmDialog`).
6. Toolbar and its color/width controls are **hidden entirely** (not just disabled) when the active document is read-only (`PRD.md` §8.2).
7. Clicking the active tool again, or `Escape`, disarms back to the collapsed 2-icon state.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5, §10.4.

**UI consistency checklist:** eraser's active state is red-tinted, visually distinct from the pen's teal active state (`DESIGN.md`/`PRD.md` §10.4.3 — this distinction is explicitly observed and must be preserved, it's one of the few sanctioned non-teal "active" treatments, scoped narrowly to the eraser).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Default state: toolbar shows only pen+eraser icons, no trash. **Expected:** matches.
2. Click pen. **Expected:** toolbar expands to 5 colors + 3 widths; pen icon shows teal active state.
3. Hover a color swatch. **Expected:** hex tooltip appears (confirm red shows `#f43f5e` exactly).
4. Draw a stroke on the canvas. **Expected:** a smooth freehand line appears; trash icon now appears in the toolbar.
5. Disarm the pen (click it again). **Expected:** toolbar collapses; click through where the stroke is drawn — **Expected:** the node/canvas underneath receives the click, not the ink layer (critical pointer-events check).
6. Click eraser, drag across the stroke. **Expected:** stroke is removed; eraser shows the red-tinted active state, distinct from pen's teal.
7. Pan/zoom the canvas with a stroke present. **Expected:** the stroke moves/scales in perfect lockstep with nodes (AC-C1 fully satisfied now that all three layers exist).
8. Switch to a read-only reference tab. **Expected:** ink toolbar is not rendered at all.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Confirm the ink layer's root element has `style.pointerEvents === 'none'` when `inkTool === null`, and `'auto'` (or unset) when a tool is armed — check via devtools computed style, not just visual behavior.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 24–27 (`PRD.md` §21.1) pass; AC-C1 now fully verified across all three canvas layers together.

### Scope Boundaries — Do NOT

**Do NOT:** make ink strokes selectable/editable individual objects with their own Inspector entry — they are draw-only annotations, erased as whole strokes, nothing more.

---

## 6. Next Phase

Continue to [Phase 26 — Export / Import / Clear](./26-export-import-clear.md).
