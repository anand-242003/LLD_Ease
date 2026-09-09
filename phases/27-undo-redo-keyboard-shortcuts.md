# Phase 27 — Undo/Redo + Keyboard Shortcuts

[⟵ Index](../PHASES.md) · [PRD.md](../PRD.md) · [DESIGN.md](../DESIGN.md) · [← Phase 26](./26-export-import-clear.md) · [Phase 28 →](./28-responsive-accessibility-pass.md)

---

## 1. Relationship to Previous Phase

**Depends on:** [Phase 26 — Export / Import / Clear](./26-export-import-clear.md)

Wires real keyboard shortcuts to the zundo history that Phase 5 scaffolded from the start, now that Phases 6-26 have given it enough real mutations worth undoing.

This phase assumes each listed dependency's Definition of Done is fully satisfied before starting here — its files exist, its verification passed, and its resulting state is inspectable via `window.__store`. It does not re-verify that work; it builds on top of it.

**What the next phase assumes:** Phase 28 assumes this phase's Definition of Done (§5) holds — do not start it until every check below passes.

---

## 2. Overview

**Goal:** the zundo temporal store from Phase 5 is wired to real keyboard shortcuts and behaves correctly across every mutation type built so far.

## 3. What to Build

**Files to create:** `src/hooks/useKeyboardShortcuts.ts`, modify `store/index.ts` (temporal config — which slices participate in history).

**Step-by-step:**
1. Configure zundo to track `documents` (nodes/edges/stickies/ink/notes) but **exclude** transient UI state (`selection`, `armedTool`, `rightPanelTab`, viewport) from the undo history — undoing shouldn't fight the user's current tool selection.
2. Wire the full shortcut table from `PRD.md` §10.1: `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo, `Delete`/`Backspace` deletes the current selection (node/edge/sticky), `Escape` disarms/closes/deselects (already partially wired in earlier phases — confirm it's centralized here, not scattered), `Cmd/Ctrl+S` prevented-default → triggers Export→JSON, `Cmd/Ctrl+B`/`+I` inside a focused sticky note (already built in Phase 24 — confirm no conflict), `Cmd/Ctrl+0` fit view, `1`–`5` arm Class/Abstract/Interface/Enum/Record.
3. Ensure Undo correctly restores a `Clear` (nodes/edges/ink back, sticky untouched since it was never removed) — this is the explicit test case `PRD.md` §9.11 calls out.
4. Ensure keyboard shortcuts are suppressed while focus is inside a text input/textarea/contenteditable (so `1`–`5` doesn't hijack someone typing "1" into an attribute's default value, and `Delete` doesn't nuke a node while they're mid-edit in the Inspector).
5. Global shortcut listener attaches once at the `AppShell` level, not per-component.

## 4. UI & Design Requirements

**Relevant DESIGN.md sections for this phase:** §10.

**UI consistency checklist:** N/A — this phase is behavioral, not visual; confirm no new UI regressed against `DESIGN.md` §10 while wiring this in.

## 5. Testing Framework

> No automated test files are added in this phase (or any phase) — see `PHASES.md` §0.2. All verification below is manual: drive the running app for black-box checks, inspect `window.__store` (or an ephemeral, deleted-after-use scratch script per §0.2) for white-box checks.

### Black-Box Testing (User Simulation)

**Verification — Black-box:**
1. Create a node, `Cmd+Z`. **Expected:** node disappears. `Cmd+Shift+Z`. **Expected:** reappears.
2. Build a diagram, Clear (confirm), `Cmd+Z`. **Expected:** nodes/edges/ink restored.
3. Select a node, press `Delete`. **Expected:** node removed (with cascade, per Phase 6).
4. Focus an Inspector text field, type "12345", press `Delete`/`Backspace` to edit the text. **Expected:** normal text editing happens — no node is deleted, no shortcut fires.
5. Press `1` while **not** focused in a text field. **Expected:** "Class" arms in the palette.
6. Press `1` while focused inside a sticky note or Inspector field. **Expected:** literally types "1", does not arm anything.
7. `Cmd+0`. **Expected:** fit view.

### White-Box Testing (Internal State Inspection)

**Verification — White-box:**
1. `window.__store.temporal.getState().pastStates.length` increments on model mutations and does **not** increment on pure UI state changes (selection, armed tool) — confirms the exclusion from step 1 is correctly scoped.

### Definition of Done (Exit Criteria)

**Definition of Done:** undo/redo works correctly across every mutating flow built in Phases 6–24; keyboard shortcuts never fight text input.

### Scope Boundaries — Do NOT

**Do NOT:** put `viewport`, `selection`, or `armedTool` into the undo history — undoing a pan/zoom or a selection change is not a documented or sensible behavior here.

---

## 6. Next Phase

Continue to [Phase 28 — Responsive + Accessibility Pass](./28-responsive-accessibility-pass.md).
