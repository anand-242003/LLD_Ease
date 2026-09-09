# Phase 12 — Inspector — Edge Form + Delete Flows

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 11](./11-inspector-node-form.md) · [Phase 13 →](./13-lint-engine-issues-panel.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 11 — Inspector — Node Form](./11-inspector-node-form.md)

Completes the Inspector Phase 11 started by adding the edge-selected state implied by its own empty-state copy, for the relationships Phase 10 creates.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 13 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** selecting an edge shows the edge-editing form from `PRD.md` §10.5.1's "Edge-selected state," closing the gap the empty-state copy ("…or arrow to edit it") implies.

## 3. What to Build

**Files to modify:** `Inspector.tsx`, new `EdgeInspector.tsx`.

**Step-by-step:**
1. Wire edge `onClick` (in `RelationshipEdge` from Phase 10) to set `selection = {type:'edge', id}` + `rightPanelTab:'inspector'`.
2. Build the form exactly per `PRD.md` §10.5.1: RELATIONSHIP TYPE (select, one of the 6), LABEL (text), SOURCE MULTIPLICITY (text), TARGET MULTIPLICITY (text), `Delete relationship` (danger button).
3. Live-bind all fields to `updateEdge` in the store (same immediacy rule as Phase 11).
4. Changing RELATIONSHIP TYPE re-renders the edge's dash/marker immediately (reuses Phase 10's mapping).
5. Multiplicity fields accept free text but should softly suggest the common forms (`1`, `0..1`, `1..*`) — no hard validation (`PRD.md` §15.2 — invalid values are accepted, later flagged as info-level by the linter in Phase 13, not blocked here).
6. `Delete relationship`: removes just that edge (no cascade — it's a leaf), clears selection.
7. Read-only documents: fields read-only, delete button not rendered — same rule as Phase 11.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** none beyond the base tokens — this phase is non-visual.

**UI consistency checklist:** identical input/button recipes as Phase 11 — this form should feel like the same system, not a different one.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Select an edge. **Expected:** Inspector shows the edge form, not the node form.
2. Change RELATIONSHIP TYPE from Realize to Inherit. **Expected:** the edge's dashed line becomes solid and the marker updates live.
3. Type a LABEL. **Expected:** the label chip on the canvas edge updates live.
4. Click `Delete relationship`. **Expected:** only that edge disappears; both endpoint nodes remain untouched.
5. Select an edge on a read-only document. **Expected:** read-only fields, no delete button.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. Confirm `updateEdge` mutations hit the correct edge by id, not accidentally all edges of that type.

### Definition of Done (Exit Criteria)

**Definition of Done:** the Inspector empty-state's "or arrow" promise (`PRD.md` §10.5.1) is now fully implemented; node and edge selection are mutually exclusive and both drive the same panel correctly.

### Scope Boundaries — Do NOT

**Do NOT:** allow changing an edge's source/target endpoints from this form — that's not evidenced anywhere and isn't needed; endpoints are fixed once drawn (delete and redraw instead).

---

## 6. Next Phase

Continue to [Phase 13 — Lint Engine + Issues Panel](./13-lint-engine-issues-panel.md).
