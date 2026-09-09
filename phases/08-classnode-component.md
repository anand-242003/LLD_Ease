# Phase 8 — ClassNode Component

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 7](./07-react-flow-canvas-foundation.md) · [Phase 9 →](./09-palette-sidebar-drag-to-create.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 7 — React Flow Canvas Foundation](./07-react-flow-canvas-foundation.md)

Replaces React Flow's default node rendering (used provisionally in Phase 7) with the exact custom ClassNode visuals from DESIGN.md §5.10.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 9 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** replace React Flow's default node rendering with the exact custom `ClassNode` from `PRD.md` §11.1 / `DESIGN.md` §5.10, for all five kinds.

## 3. What to Build

**Files to create:** `src/components/canvas/ClassNode.tsx`, register it in `nodeTypes` passed to `<ReactFlow>`.

**Step-by-step:**
1. Build the three-band structure: stereotype line (conditional) → name header → attribute compartment → divider → operation compartment, exactly per `DESIGN.md` §5.10.
2. Stereotype logic: `«abstract»` (amber) for `ABSTRACT`, `«interface»` (light blue) for `INTERFACE`, `«enumeration»` (teal) for `ENUM`; **no** stereotype for `CLASS`/`RECORD`. Name renders italic for `ABSTRACT`/`INTERFACE` only.
3. Attribute line format: `<vis-sign> <name>: <type>`; method line: `<vis-sign> <name>(<params>): <returns>`. Visibility signs: `- + # ~` for `private public protected package`.
4. **Enum special case:** list bare literal names, no visibility sign, no type, no operation compartment at all when methods are empty (`PRD.md` §9.4 kind-specific seeding + §11.1 rendering rule).
5. Empty compartments render italic `no attributes` / `no operations` in `--text-faint` — never collapse the compartment.
6. Render two `<Handle>`s (left/right, `Position.Left/Right`), styled per `DESIGN.md` §5.10 (10px teal circle), visible on hover/selection, and **always visible while a relationship tool is armed** (this last part wires up fully in Phase 10 — for now just support a `handlesProminent` prop).
7. Selected state: 2px teal border + glow ring, driven by React Flow's `selected` node prop.
8. Node width auto-sizes to the longest content line (`min-width: 200px`, grows).

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.10, §10, §2.

**UI consistency checklist:** run `DESIGN.md` §10 against this component specifically — it's the highest-traffic visual in the app. Confirm mono font on all model text; confirm the five kind colors match `DESIGN.md` §2 `--kind-*` tokens exactly.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Via console, create one node of each of the 5 kinds with 1–2 attributes and methods (mirror `PRD.md` Appendix A's `Vehicle`/`VehicleType`/`Car` shapes). **Expected:** visually matches `PRD.md` §11.1's ASCII diagram and the described rendering rules — stereotypes, italics, colors, placeholders all correct per kind.
2. Create a `CLASS` node with zero attributes and zero methods. **Expected:** both compartments show the italic placeholder text, not a collapsed box.
3. Create an `ENUM` with 3 literals and 0 methods. **Expected:** literals render bare (no sign, no type), no operation compartment visible at all.
4. Select a node. **Expected:** 2px teal border + glow appears; deselect (click canvas) removes it.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Confirm the rendered DOM text for an attribute line via `document.querySelector` matches the exact format `- id: long` (not `-id:long` or `- id : long`) — string-level precision matters for visual fidelity to `PRD.md` §4.2 S8/S9 observations.

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 9, 10, 11 from `PRD.md` §21.1 pass exactly.

### Scope Boundaries — Do NOT

**Do NOT:** implement editing here — this phase is render-only; editing comes via the Inspector in Phase 11.

---

## 6. Next Phase

Continue to [Phase 9 — Palette Sidebar + Drag-to-Create](./09-palette-sidebar-drag-to-create.md).
