# Phase 16 — Persistence Layer

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 15](./15-codegen-remaining-languages-code-panel-ui.md) · [Phase 17 →](./17-document-tabs-notes-panel.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 15 — Codegen Remaining Languages + Code Panel UI](./15-codegen-remaining-languages-code-panel-ui.md)

Everything built in Phases 4-15 only exists in memory until this phase adds the debounced localStorage layer that makes it survive a reload.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 17 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the entire `Workspace` survives a reload with zero explicit save action, per `PRD.md` §5.4/§9.0/§14.1/§17.1.

## 3. What to Build

**Files to create:** `src/store/persist.ts`, wire into `src/store/index.ts` via zustand's `persist` middleware (or a custom debounced subscriber if `persist` middleware doesn't cleanly support the debounce/versioning needs).

**Step-by-step:**
1. Namespace the storage key `classforge.v1` (`PRD.md` §17.5).
2. Debounce writes ~500ms after any state change (BR10) — do not write on every keystroke synchronously; the **in-memory state** updates synchronously (Phase 11's live-binding rule), only the **storage write** is debounced.
3. On boot: attempt to read + `JSON.parse` the stored blob. Success → hydrate the store. Failure (parse error, missing, wrong shape) → discard, boot fresh, show a toast "Couldn't restore your last session — starting fresh." (`PRD.md` §9.0/§17.1).
4. Implement `schemaVersion` (starts at `1`) and a `migrations.ts` stub — older versions get migrated, newer versions refuse to load with a toast (`PRD.md` §17.1's version-too-new case).
5. Handle quota-exceeded on write: catch the `DOMException`, show a toast, keep working in memory, retry on next change (`PRD.md` §17.1).
6. Handle storage unavailable entirely (private mode): catch the access error at boot, run in-memory only, show the persistent subtle banner from `PRD.md` §17.1.
7. Never persist derived data — confirm `Issue[]` and generated code strings are **not** part of the persisted blob (they're recomputed from the model on load) — invariant 5 from `PRD.md` §13.2.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §5.9.

**UI consistency checklist:** the "couldn't restore" toast and the storage-unavailable banner both use `DESIGN.md` §5.9's Toast recipe (error tone, manual dismiss for the persistent banner variant).

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Create a few nodes/edges, wait 1s, reload the page. **Expected:** the diagram is fully restored — nodes, edges, positions, viewport, selection cleared but tab/panel state restored too.
2. Manually corrupt `localStorage.setItem('classforge.v1','not json')` in devtools, reload. **Expected:** app boots fresh with the "starting fresh" toast, no crash, no white screen.
3. Simulate quota exceeded (devtools can throttle storage, or manually trigger `QuotaExceededError` by filling storage) and make an edit. **Expected:** toast appears, app keeps working, no data loss on the next successful write.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `localStorage.getItem('classforge.v1')` after an edit + 600ms wait. **Expected:** valid JSON matching the `Workspace` shape, `schemaVersion:1` present.
2. Confirm the JSON does **not** contain an `issues` or `generatedCode` key anywhere (invariant 5 check).
3. Reload, immediately check `window.__store.getState()` before any user interaction. **Expected:** identical to pre-reload state (deep equal minus any intentionally-transient fields like `selection`, if you chose not to persist that — document the choice either way).

### Definition of Done (Exit Criteria)

**Definition of Done:** AC 37, 43 (`PRD.md` §21.2) pass; corrupt/quota/unavailable cases all degrade gracefully per §17.1's table.

### Scope Boundaries — Do NOT

**Do NOT:** add a visible "Save" button or any save-related UI — the entire point (`PRD.md` §9/§14.1 BR09) is that none exists.

---

## 6. Next Phase

Continue to [Phase 17 — Document Tabs + Notes Panel](./17-document-tabs-notes-panel.md).
