# Phase 11 — Inspector — Node Form

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 10](./10-relationship-edges.md) · [Phase 12 →](./12-inspector-edge-form-delete-flows.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 10 — Relationship Edges (types, markers, arming, connect flow, labels/multiplicities)](./10-relationship-edges.md)

Gives the Phase 10-connected graph its first editing surface — selecting a Phase 8 node now opens a live-bound form instead of just displaying it.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 12 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the full Inspector node-editing form from `PRD.md` §9.7/§10.5.1/§15.1, with **live, per-keystroke, uncommitted binding** — the single most distinctive interaction rule in the whole app.

## 3. What to Build

**Files to create:** `src/components/panel/Inspector.tsx`, `NodeInspector.tsx`, `MemberRow.tsx`, `VisibilityButton.tsx`, `MiniToggle.tsx`, `AddRowButton.tsx`, `DangerButton.tsx` (all per `DESIGN.md` §5 recipes where applicable).

**Step-by-step:**
1. `Inspector` switches between `NodeInspector` / `EdgeInspector` (Phase 12) / empty-state based on `selection` — wire node `onClick` in `ClassNode` (Phase 8) to set `selection` + `rightPanelTab:'inspector'` (already partly done in Phase 9 for newly-created nodes; extend to selecting *existing* nodes too).
2. Build the exact field order from `PRD.md` §9.7's ASCII form: NAME + KIND (2-col) → TYPE PARAMETERS → ATTRIBUTES (repeating `MemberRow`s + `+ attribute`) → METHODS (repeating + `+ method`) → NOTE/DOC COMMENT → Delete class.
3. **Live binding is mandatory:** every `onChange` on NAME, generics, attribute/method fields calls the store's `updateNode` **immediately**, no blur/Enter/submit gate (BR29, verified in `PRD.md` S10). The canvas `ClassNode` must visibly update on the very next render.
4. `VisibilityButton`: cycles `- → + → # → ~ → -` on click (§27-U7's resolution — implement as a cycle, not a dropdown).
5. `MiniToggle` for `S`/`F` (attributes) and `S`/`A` (methods) — boolean toggles, teal-filled when on.
6. `+ attribute`/`+ method`: append a new row with sane defaults (`visibility:'private', name:'', type:''` / `visibility:'public', name:'', returns:'void'`) and focus the new name input.
7. `×` on a row: immediate removal, no confirmation (cheap/reversible per BR31).
8. `Delete class`: calls `removeNode` (Phase 6's cascade-delete logic already handles orphan edges), clears `selection`, returns Inspector to empty state.
9. When the active document is read-only: every input renders `readOnly`/disabled, and the `Delete class` button is **not rendered at all** (not just disabled) per `PRD.md` §8.2.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5, §5.2.

**UI consistency checklist:** inputs use the `DESIGN.md` §5.2 recipe; `+ attribute`/`+ method` use the dashed `AddRowButton` style; `Delete class` uses the Danger button recipe.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Select a node. **Expected:** Inspector populates every field from the model; empty-state disappears.
2. Type into NAME character by character, watching the canvas node simultaneously. **Expected:** the canvas title updates on every keystroke, no lag, no "commit" moment (AC-I2 / matches `PRD.md` S10 exactly).
3. Change KIND to Abstract. **Expected:** node immediately shows `«abstract»` + italic name.
4. Click `+ attribute`. **Expected:** a new row appears in the form **and** a new line appears in the node's attribute compartment; the new row's name input is focused.
5. Click the visibility cycler four times. **Expected:** cycles `- + # ~` back to `-`.
6. Click `×` on an attribute row. **Expected:** row and canvas line both disappear immediately, no dialog.
7. Click `Delete class`. **Expected:** node and all its edges vanish from canvas; Inspector returns to the empty state.
8. Select a node on a read-only document. **Expected:** all fields are non-editable; no Delete button is rendered.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. After step 2, `window.__store.getState().documents...nodes.find(...).name` after each keystroke via rapid console polling, or simply confirm the final value matches exactly what was typed with no transformation.
2. After step 7, confirm both the node **and** any edges referencing it are gone from the store (re-confirms Phase 6's cascade, now exercised through real UI).

### Definition of Done (Exit Criteria)

**Definition of Done:** AC-I1 through AC-I5 (`PRD.md` §10.5.1) all pass; AC 8 (§21.1) passes.

### Scope Boundaries — Do NOT

**Do NOT:** add a Save button, a blur-to-commit pattern, or any inline field-level red-error validation — `PRD.md` §15.1 is explicit that this form has none of that; all problems surface in Issues (Phase 13).

---

## 6. Next Phase

Continue to [Phase 12 — Inspector — Edge Form + Delete Flows](./12-inspector-edge-form-delete-flows.md).
